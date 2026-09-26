#!/usr/bin/env node
//
// Relee la ficha de LatinBasket de cada representado y actualiza sus
// estadísticas en la base de datos.
//
//   node scripts/actualiza-latinbasket.ts            (respeta el intervalo)
//   node scripts/actualiza-latinbasket.ts --dry      (no escribe nada)
//   node scripts/actualiza-latinbasket.ts --force    (ignora el intervalo)
//   node scripts/actualiza-latinbasket.ts --solo victor-liz
//
// Lo ejecuta .github/workflows/latinbasket.yml una vez al día; el intervalo de
// 48 h lo hace cumplir este script, no el cron, porque "cada 2 días" en cron
// (`*/2`) se descuadra al cambiar de mes.
//
// **Escribe en Postgres, no en lib/players.json.** Antes el JSON era la fuente
// y el trabajo lo commiteaba; desde que existe el panel manda la base, así que
// commitear datos sería pelearse con lo que edite la agencia.
//
// Qué se escribe y qué no
// -----------------------
// El parser lee dos cosas muy distintas de la misma página. La tabla de
// estadísticas es tabular y sale fiable: 50 de 50 fichas, sin un fallo. El
// resto sale de una frase en inglés con expresiones regulares, y se equivoca
// lo bastante como para no publicarlo a ciegas:
//
//   · lugar_nacimiento de Víctor Liz → "Puerto Rican BSN", que es su liga.
//   · liga_actual de 12 jugadores    → "Dominican Rep", que es un país.
//   · equipo_actual de Parham Jr.    → "Nicaraguan National Team. Parham Jr.
//                                       graduated University of Pikeville".
//
// Por eso **lo único que se escribe automáticamente son las estadísticas**.
// Todo lo demás que no cuadre se anota como diferencia pendiente para que una
// persona la revise desde el panel.
//
// Nada se borra: si la lectura falla, la ficha se queda como estaba.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

import { fetchLatinbasketProfile } from "../lib/latinbasket.ts";
import type { LatinbasketProfile } from "../lib/latinbasket.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ESTADO = join(RAIZ, "docs", "latinbasket-estado.json");

/** Cada cuánto se relee la ficha de un jugador. */
const INTERVALO_H = 48;

/** Pausa entre peticiones. 50 fichas a 1,5 s son 75 s: no es una avalancha. */
const PAUSA_MS = 1500;

/** Una ficha que no responde en 20 s se da por perdida y se sigue. */
const TIMEOUT_MS = 20_000;

const REINTENTOS = 2;

function cargaEntorno(): void {
  const fichero = join(RAIZ, ".env.local");
  if (!existsSync(fichero)) return;
  for (const linea of readFileSync(fichero, "utf8").split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const i = limpia.indexOf("=");
    if (i < 0) continue;
    const nombre = limpia.slice(0, i).trim();
    let valor = limpia.slice(i + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    process.env[nombre] ??= valor;
  }
}

cargaEntorno();

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("Falta DATABASE_URL. En local se copia del panel de Vercel a .env.local.");
  process.exit(1);
}

const sql = neon(url);

// ---------------------------------------------------------------- utilidades

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** ¿El mismo equipo? El Excel dice "Quebradillas" y la fuente "Piratas de Quebradillas". */
function mismoEquipo(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const na = sinAcentos(a).toLowerCase().trim();
  const nb = sinAcentos(b).toLowerCase().trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** `fetchLatinbasketProfile` no admite señal de cancelación; se envuelve. */
async function conTimeout(direccion: string): Promise<LatinbasketProfile | null> {
  let temporizador: ReturnType<typeof setTimeout>;
  const limite = new Promise<null>((resolver) => {
    temporizador = setTimeout(() => resolver(null), TIMEOUT_MS);
  });
  try {
    return await Promise.race([fetchLatinbasketProfile(direccion), limite]);
  } finally {
    clearTimeout(temporizador!);
  }
}

// -------------------------------------------------------------------- estado

type Diferencia = { campo: string; publicado: string | null; fuente: string | null };

type Resultado = {
  jugador: string;
  estado: "actualizado" | "sin cambios" | "sin lectura" | "omitido";
  detalle?: string;
  temporadas?: number;
  diferencias?: Diferencia[];
};

type Estado = {
  ultima_revision: string | null;
  intervalo_horas: number;
  resumen: Record<string, number>;
  resultados: Resultado[];
};

function leeEstado(): Estado {
  if (!existsSync(ESTADO)) {
    return { ultima_revision: null, intervalo_horas: INTERVALO_H, resumen: {}, resultados: [] };
  }
  try {
    return JSON.parse(readFileSync(ESTADO, "utf8")) as Estado;
  } catch {
    console.warn("docs/latinbasket-estado.json ilegible; se rehace.");
    return { ultima_revision: null, intervalo_horas: INTERVALO_H, resumen: {}, resultados: [] };
  }
}

function horasDesde(iso: string | null): number {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Infinity : (Date.now() - t) / 3_600_000;
}

// ----------------------------------------------------------------------- CLI

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const force = args.includes("--force");
const solo = args[args.indexOf("--solo") + 1];
const filtro = args.includes("--solo") && solo && !solo.startsWith("--") ? solo : null;

const estado = leeEstado();
const horas = horasDesde(estado.ultima_revision);

if (!force && !filtro && horas < INTERVALO_H) {
  console.log(
    `Última revisión hace ${horas.toFixed(1)} h. El intervalo son ${INTERVALO_H} h: ` +
      `faltan ${(INTERVALO_H - horas).toFixed(1)} h. Nada que hacer (--force para forzar).`
  );
  process.exit(0);
}

type FilaJugador = {
  id: string;
  slug: string;
  equipo_actual: string | null;
  liga_actual: string | null;
  fecha_nacimiento: string | Date | null;
  seleccion: string | null;
  source_name: string | null;
  source_url: string | null;
};

const jugadores = (await sql`
  select id, slug, equipo_actual, liga_actual, fecha_nacimiento, seleccion,
         source_name, source_url
    from players
   where estado_publicacion <> 'archivado'
   order by orden, slug
`) as FilaJugador[];

if (jugadores.length === 0) {
  console.error(
    "No hay jugadores en la base. ¿Se ejecutó scripts/migra-jugadores.ts?"
  );
  process.exit(1);
}

const objetivo = jugadores.filter((j) => !filtro || j.slug === filtro);
if (filtro && objetivo.length === 0) {
  console.error(`No hay ningún jugador con el identificador "${filtro}".`);
  process.exit(1);
}

console.log(
  `Revisando ${objetivo.length} ficha(s) en LatinBasket${dry ? " (simulación)" : ""}…\n`
);

const resultados: Resultado[] = [];
let tocados = 0;

for (const j of objetivo) {
  // Solo LatinBasket. Las fichas de Eurobasket se enlazan pero no se leen: no
  // hay parser para ese sitio, y decir que el dato viene de ahí sin haberlo
  // leído sería falso.
  if (j.source_name !== "LatinBasket" || !j.source_url) {
    resultados.push({
      jugador: j.slug,
      estado: "omitido",
      detalle: j.source_name ? `fuente ${j.source_name}, sin parser` : "sin ficha externa",
    });
    continue;
  }

  let perfil: LatinbasketProfile | null = null;
  for (let intento = 1; intento <= REINTENTOS && !perfil; intento++) {
    if (intento > 1) await espera(PAUSA_MS * 2);
    perfil = await conTimeout(j.source_url);
  }

  if (!perfil) {
    resultados.push({ jugador: j.slug, estado: "sin lectura", detalle: j.source_url });
    console.log(`  ✗ ${j.slug} — no se pudo leer`);
    await espera(PAUSA_MS);
    continue;
  }

  // --- Estadísticas: la tabla manda ---------------------------------------
  //
  // Se reemplazan enteras y no se fusionan: si la fuente corrige una temporada
  // a la baja, fusionar dejaría el número viejo para siempre.
  const anteriores = (await sql`
    select temporada, competicion, equipo, pj, minutos, pts, reb, ast, rob, tap,
           fg2_pct, fg3_pct, ft_pct
      from player_stats where player_id = ${j.id} order by orden
  `) as unknown[];

  const nuevas = perfil.temporadas;
  const cambios: string[] = [];

  const huella = (filas: unknown[]) =>
    JSON.stringify(
      filas.map((f) => {
        const r = f as Record<string, unknown>;
        return [
          r.temporada, r.competicion ?? r.competicion, r.equipo,
          Number(r.pj), Number(r.minutos ?? r.min), Number(r.pts), Number(r.reb),
          Number(r.ast), Number(r.rob), Number(r.tap),
          Number(r.fg2_pct), Number(r.fg3_pct), Number(r.ft_pct),
        ];
      })
    );

  const distintas = huella(anteriores) !== huella(nuevas);

  if (nuevas.length > 0 && distintas) {
    cambios.push(
      anteriores.length === 0
        ? `${nuevas.length} temporada(s) nuevas`
        : `estadísticas (${anteriores.length} → ${nuevas.length} temporadas)`
    );

    if (!dry) {
      // Solo se borran las que vienen de la fuente: si alguien metió una
      // temporada a mano, no se la lleva por delante el scraping.
      await sql`delete from player_stats where player_id = ${j.id} and origen = 'latinbasket'`;

      for (const [n, t] of nuevas.entries()) {
        await sql`
          insert into player_stats (player_id, temporada, competicion, equipo,
                                    pj, minutos, pts, reb, reb_of, reb_def, ast, rob, tap,
                                    perdidas, faltas, valoracion,
                                    fg2_pct, fg3_pct, ft_pct, totales,
                                    origen, origen_url, leido_en, orden)
          values (${j.id}, ${t.temporada}, ${t.competicion}, ${t.equipo},
                  ${t.pj}, ${t.min}, ${t.pts}, ${t.reb}, ${t.reb_of}, ${t.reb_def},
                  ${t.ast}, ${t.rob}, ${t.tap}, ${t.perdidas}, ${t.faltas}, ${t.valoracion},
                  ${t.fg2_pct}, ${t.fg3_pct}, ${t.ft_pct},
                  ${t.totales ? JSON.stringify(t.totales) : null},
                  'latinbasket', ${j.source_url}, now(), ${n})
          on conflict (player_id, temporada, competicion, equipo) do update set
            pj = excluded.pj, minutos = excluded.minutos, pts = excluded.pts,
            reb = excluded.reb, ast = excluded.ast, rob = excluded.rob, tap = excluded.tap,
            fg2_pct = excluded.fg2_pct, fg3_pct = excluded.fg3_pct, ft_pct = excluded.ft_pct,
            totales = excluded.totales, leido_en = now()
        `;
      }
    }
  }

  // --- Lo que solo se anota ------------------------------------------------
  const diferencias: Diferencia[] = [];
  const anota = (campo: string, publicado: string | null, fuente: string | null) => {
    if (fuente && publicado !== fuente) diferencias.push({ campo, publicado, fuente });
  };

  if (perfil.equipo_actual && !mismoEquipo(j.equipo_actual, perfil.equipo_actual)) {
    anota("equipo_actual", j.equipo_actual, perfil.equipo_actual);
  }
  if (j.liga_actual !== perfil.liga_actual) anota("liga_actual", j.liga_actual, perfil.liga_actual);

  const nacimiento =
    j.fecha_nacimiento === null
      ? null
      : typeof j.fecha_nacimiento === "string"
        ? j.fecha_nacimiento.slice(0, 10)
        : j.fecha_nacimiento.toISOString().slice(0, 10);
  anota("fecha_nacimiento", nacimiento, perfil.fecha_nacimiento);

  if (!j.seleccion) anota("seleccion", j.seleccion, perfil.seleccion);

  resultados.push({
    jugador: j.slug,
    estado: cambios.length ? "actualizado" : "sin cambios",
    detalle: cambios.join("; ") || undefined,
    temporadas: nuevas.length,
    diferencias: diferencias.length ? diferencias : undefined,
  });

  if (cambios.length) {
    tocados++;
    console.log(`  ✓ ${j.slug} — ${cambios.join("; ")}`);
  } else {
    console.log(`  · ${j.slug} — sin cambios`);
  }

  for (const d of diferencias) {
    console.log(`      ⚠ ${d.campo}: web "${d.publicado ?? "—"}" ≠ fuente "${d.fuente}"`);
  }

  await espera(PAUSA_MS);
}

// ------------------------------------------------------------------- informe

const cuenta = (e: Resultado["estado"]) => resultados.filter((r) => r.estado === e).length;
const resumen = {
  revisados: resultados.length,
  actualizados: cuenta("actualizado"),
  sin_cambios: cuenta("sin cambios"),
  sin_lectura: cuenta("sin lectura"),
  omitidos: cuenta("omitido"),
  diferencias_pendientes: resultados.filter((r) => r.diferencias).length,
};

console.log("\nResumen:");
for (const [k, v] of Object.entries(resumen)) console.log(`  ${k.replace(/_/g, " ")}: ${v}`);

if (dry) {
  console.log("\nSimulación: no se ha escrito nada.");
  process.exit(0);
}

console.log(
  tocados > 0
    ? `\n${tocados} ficha(s) actualizadas en la base.`
    : "\nNinguna ficha cambió en la base."
);

const nuevoEstado: Estado = {
  ultima_revision: new Date().toISOString(),
  intervalo_horas: INTERVALO_H,
  resumen,
  resultados,
};
writeFileSync(ESTADO, `${JSON.stringify(nuevoEstado, null, 2)}\n`, "utf8");
console.log("Escrito docs/latinbasket-estado.json.");

if (resumen.sin_lectura > 0) {
  console.log(`\nAviso: ${resumen.sin_lectura} ficha(s) no se pudieron leer esta vez.`);
}
