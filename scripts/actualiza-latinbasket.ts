#!/usr/bin/env node
//
// Relee la ficha de LatinBasket de cada representado y actualiza sus
// estadísticas en lib/players.json.
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
// Por eso **lo único que se escribe automáticamente es
// `estadisticas_temporada`**, reemplazada entera desde la tabla. Todo lo demás
// que no cuadre se anota en docs/latinbasket-estado.json como diferencia
// pendiente, para que una persona la revise y la aplique desde el Excel.
//
// Nada se borra: si la lectura falla, la ficha se queda como estaba.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchLatinbasketProfile } from "../lib/latinbasket.ts";
import type { LatinbasketProfile, LatinbasketSeason } from "../lib/latinbasket.ts";
import type { Player, StatSeason } from "../lib/types.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const JUGADORES = join(RAIZ, "lib", "players.json");
const ESTADO = join(RAIZ, "docs", "latinbasket-estado.json");

/** Cada cuánto se relee la ficha de un jugador. */
const INTERVALO_H = 48;

/** Pausa entre peticiones. 50 fichas a 1,5 s son 75 s: no es una avalancha. */
const PAUSA_MS = 1500;

/** Una ficha que no responde en 20 s se da por perdida y se sigue. */
const TIMEOUT_MS = 20_000;

/** Reintentos por jugador antes de rendirse. */
const REINTENTOS = 2;

// ---------------------------------------------------------------- utilidades

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * ¿Hablan del mismo equipo? El Excel escribe "Quebradillas" y LatinBasket
 * "Piratas de Quebradillas": el nombre corto es el apodo sin la mascota.
 */
function mismoEquipo(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const na = sinAcentos(a).toLowerCase().trim();
  const nb = sinAcentos(b).toLowerCase().trim();
  return na === nb || na.includes(nb) || nb.includes(na);
}

/** Las mismas claves que ya compone la ficha al leer en vivo. */
function aStatSeason(t: LatinbasketSeason): StatSeason {
  return {
    temporada: t.temporada,
    equipo: t.equipo,
    liga: t.competicion,
    pj: t.pj,
    minutes: t.min,
    pts: t.pts,
    reb: t.reb,
    ast: t.ast,
    rob: t.rob,
    tap: t.tap,
    fg: t.fg2_pct,
    three: t.fg3_pct,
    ft: t.ft_pct,
    totales: t.totales,
  };
}

/** Comparación estructural, para saber si de verdad ha cambiado algo. */
const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** `fetchLatinbasketProfile` no admite señal de cancelación; se envuelve. */
async function conTimeout(url: string): Promise<LatinbasketProfile | null> {
  let temporizador: ReturnType<typeof setTimeout>;
  const limite = new Promise<null>((resolver) => {
    temporizador = setTimeout(() => resolver(null), TIMEOUT_MS);
  });
  try {
    return await Promise.race([fetchLatinbasketProfile(url), limite]);
  } finally {
    clearTimeout(temporizador!);
  }
}

// -------------------------------------------------------------------- estado

type Diferencia = {
  campo: string;
  publicado: string | null;
  fuente: string | null;
};

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

// ------------------------------------------------------------------ revisión

/**
 * Compara la ficha publicada con la leída y devuelve el jugador actualizado.
 * No muta el original: si algo falla a mitad, el JSON no queda a medias.
 */
function revisa(p: Player, perfil: LatinbasketProfile): { jugador: Player; resultado: Resultado } {
  const actualizado: Player = { ...p };
  const diferencias: Diferencia[] = [];
  const cambios: string[] = [];

  // --- Estadísticas: la tabla manda, se reemplaza entera -------------------
  //
  // Reemplazar y no fusionar es deliberado: si la fuente corrige una
  // temporada a la baja, fusionar dejaría el número viejo para siempre.
  const temporadas = perfil.temporadas.map(aStatSeason);
  if (temporadas.length > 0 && !igual(temporadas, p.estadisticas_temporada)) {
    actualizado.estadisticas_temporada = temporadas;
    cambios.push(
      p.estadisticas_temporada.length === 0
        ? `${temporadas.length} temporada(s) nuevas`
        : `estadísticas (${p.estadisticas_temporada.length} → ${temporadas.length} temporadas)`
    );
  }

  // --- Lo que solo se anota ------------------------------------------------
  //
  // Campos que la fuente saca de una frase en prosa y acierta a medias, o que
  // son competencia del Excel de la agencia. Se informan para que una persona
  // decida; el script no los toca.
  const anota = (campo: string, publicado: string | null, fuente: string | null) => {
    if (fuente && publicado !== fuente) diferencias.push({ campo, publicado, fuente });
  };

  if (perfil.equipo_actual && !mismoEquipo(p.equipo_actual, perfil.equipo_actual)) {
    anota("equipo_actual", p.equipo_actual, perfil.equipo_actual);
  }
  if (p.liga_actual !== perfil.liga_actual) {
    anota("liga_actual", p.liga_actual, perfil.liga_actual);
  }
  anota("fecha_nacimiento", p.fecha_nacimiento, perfil.fecha_nacimiento);
  if (!p.seleccion) anota("seleccion", p.seleccion, perfil.seleccion);

  return {
    jugador: actualizado,
    resultado: {
      jugador: p.id,
      estado: cambios.length ? "actualizado" : "sin cambios",
      detalle: cambios.join("; ") || undefined,
      temporadas: temporadas.length,
      diferencias: diferencias.length ? diferencias : undefined,
    },
  };
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
  const faltan = (INTERVALO_H - horas).toFixed(1);
  console.log(
    `Última revisión hace ${horas.toFixed(1)} h. El intervalo son ${INTERVALO_H} h: ` +
      `faltan ${faltan} h. Nada que hacer (--force para forzar).`
  );
  process.exit(0);
}

const jugadores = JSON.parse(readFileSync(JUGADORES, "utf8")) as Player[];
const resultados: Resultado[] = [];
let tocados = 0;

const objetivo = jugadores.filter((p) => !filtro || p.id === filtro);
if (filtro && objetivo.length === 0) {
  console.error(`No hay ningún jugador con id "${filtro}".`);
  process.exit(1);
}

console.log(
  `Revisando ${objetivo.length} ficha(s) en LatinBasket` + (dry ? " (simulación)" : "") + "…\n"
);

for (let i = 0; i < jugadores.length; i++) {
  const p = jugadores[i];
  if (filtro && p.id !== filtro) continue;

  // Solo LatinBasket. Las 3 fichas de Eurobasket se enlazan pero no se leen:
  // no hay parser para ese sitio, y decir que el dato viene de ahí sin haberlo
  // leído sería falso.
  if (!p.source || p.source.name !== "LatinBasket") {
    resultados.push({
      jugador: p.id,
      estado: "omitido",
      detalle: p.source ? `fuente ${p.source.name}, sin parser` : "sin ficha externa",
    });
    continue;
  }

  let perfil: LatinbasketProfile | null = null;
  for (let intento = 1; intento <= REINTENTOS && !perfil; intento++) {
    if (intento > 1) await espera(PAUSA_MS * 2);
    perfil = await conTimeout(p.source.url);
  }

  if (!perfil) {
    // La ficha se queda como estaba. Una fuente caída no debe vaciar datos.
    resultados.push({ jugador: p.id, estado: "sin lectura", detalle: p.source.url });
    console.log(`  ✗ ${p.id} — no se pudo leer`);
    await espera(PAUSA_MS);
    continue;
  }

  const { jugador, resultado } = revisa(p, perfil);
  resultados.push(resultado);

  if (resultado.estado === "actualizado") {
    jugadores[i] = jugador;
    tocados++;
    console.log(`  ✓ ${p.id} — ${resultado.detalle}`);
  } else {
    console.log(`  · ${p.id} — sin cambios`);
  }
  if (resultado.diferencias) {
    for (const d of resultado.diferencias) {
      console.log(`      ⚠ ${d.campo}: web "${d.publicado ?? "—"}" ≠ fuente "${d.fuente}"`);
    }
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

if (tocados > 0) {
  writeFileSync(JUGADORES, `${JSON.stringify(jugadores, null, 2)}\n`, "utf8");
  console.log(`\nEscrito lib/players.json (${tocados} ficha(s)).`);
}

// El estado se guarda siempre, aunque no cambie ningún jugador: es lo que
// marca cuándo toca la próxima revisión.
const nuevoEstado: Estado = {
  ultima_revision: new Date().toISOString(),
  intervalo_horas: INTERVALO_H,
  resumen,
  resultados,
};
writeFileSync(ESTADO, `${JSON.stringify(nuevoEstado, null, 2)}\n`, "utf8");
console.log("Escrito docs/latinbasket-estado.json.");

// Las lecturas fallidas no tumban el trabajo: la fuente se cae a ratos y lo
// que ya está publicado sigue sirviendo. Solo se avisa.
if (resumen.sin_lectura > 0) {
  console.log(`\nAviso: ${resumen.sin_lectura} ficha(s) no se pudieron leer esta vez.`);
}
