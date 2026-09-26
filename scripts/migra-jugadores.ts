#!/usr/bin/env node
//
// Pasa lib/players.json a la base de datos y sube las fotos a Blob.
//
//   node scripts/migra-jugadores.ts --dry     (enseña lo que haría)
//   node scripts/migra-jugadores.ts           (escribe)
//   node scripts/migra-jugadores.ts --sin-fotos   (solo datos, más rápido)
//
// Idempotente: upsert por slug. No pisa lo editado en el panel —si un jugador
// ya está en la base, se deja— salvo que se pase --rehacer.
//
// Reglas, las de siempre: nulo entra como nulo, nada se inventa, nadie se
// borra.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import sharp from "sharp";

import type { Player } from "../lib/types.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  console.error("Falta DATABASE_URL. Cópiala del panel de Vercel a .env.local.");
  process.exit(1);
}

const sql = neon(url);
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const sinFotos = args.includes("--sin-fotos");
const rehacer = args.includes("--rehacer");

/** "1" → "BMS-001". El formato es el de la plantilla del Excel de la agencia. */
function codigoBms(bmsId: string | null): string | null {
  if (!bmsId) return null;
  const n = Number(bmsId);
  return Number.isInteger(n) && n > 0 ? `BMS-${String(n).padStart(3, "0")}` : bmsId;
}

/** Plataforma a partir de la URL o del identificador de YouTube. */
function plataformaDe(v: { youtube_id?: string; url?: string }): {
  plataforma: string;
  url: string;
  video_id: string | null;
} | null {
  if (v.youtube_id) {
    return {
      plataforma: "youtube",
      url: `https://www.youtube.com/watch?v=${v.youtube_id}`,
      video_id: v.youtube_id,
    };
  }
  if (!v.url) return null;

  const u = v.url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return { plataforma: "youtube", url: v.url, video_id: null };
  }
  if (u.includes("vimeo.com")) return { plataforma: "vimeo", url: v.url, video_id: null };
  if (u.includes("hudl.com")) return { plataforma: "hudl", url: v.url, video_id: null };
  return null;
}

/**
 * Sube la foto de /public/players. Dos versiones: la optimizada que se enseña
 * y el original tal cual, que es lo que un club se descarga para su flyer.
 */
async function subeFoto(rutaPublic: string, slug: string) {
  const fichero = join(RAIZ, "public", rutaPublic.replace(/^\//, ""));
  if (!existsSync(fichero)) return null;

  const datos = readFileSync(fichero);
  const meta = await sharp(datos).metadata();

  const optimizada = await sharp(datos)
    .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const web = await put(`jugadores/${slug}/principal.webp`, optimizada.data as unknown as Buffer, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
  });

  const ext = extname(fichero) || ".jpg";
  const original = await put(`jugadores/${slug}/original${ext}`, datos as unknown as Buffer, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: web.url,
    path: web.pathname,
    ancho: optimizada.info.width,
    alto: optimizada.info.height,
    url_original: original.url,
    path_original: original.pathname,
    bytes_original: datos.length,
    ancho_original: meta.width ?? null,
    alto_original: meta.height ?? null,
  };
}

// ---------------------------------------------------------------------------

const jugadores = JSON.parse(
  readFileSync(join(RAIZ, "lib", "players.json"), "utf8")
) as Player[];

const existentes = new Set(
  ((await sql`select slug from players`) as Array<{ slug: string }>).map((f) => f.slug)
);

console.log(
  `${jugadores.length} jugador(es) en el JSON${dry ? " (simulación)" : ""}` +
    `${sinFotos ? ", sin subir fotos" : ""}\n`
);

let creados = 0;
let saltados = 0;
let fotos = 0;
const avisos: string[] = [];

for (const [i, p] of jugadores.entries()) {
  if (existentes.has(p.id) && !rehacer) {
    saltados++;
    continue;
  }

  const resumen =
    `${p.estadisticas_temporada.length} temp.` +
    ` · ${p.historial_equipos.length} equipos` +
    ` · ${p.videos_youtube.length} vídeos` +
    (p.foto ? " · con foto" : "");

  if (dry) {
    console.log(`  + ${p.id.padEnd(26)} ${codigoBms(p.bms_id) ?? "—"}  ${resumen}`);
    creados++;
    continue;
  }

  const [fila] = (await sql`
    insert into players (slug, bms_id, bms_code, nombre, apellido, nacionalidad,
                         fecha_nacimiento, lugar_nacimiento, seleccion,
                         altura_cm, altura_ft, peso_kg, peso_lb,
                         posicion, posicion_codigo, tipo_jugador, estado,
                         equipo_actual, liga_actual, pais, bio,
                         source_name, source_url, estado_publicacion, orden)
    values (${p.id}, ${p.bms_id}, ${codigoBms(p.bms_id)}, ${p.nombre}, ${p.apellido},
            ${p.nacionalidad}, ${p.fecha_nacimiento}, ${p.lugar_nacimiento}, ${p.seleccion},
            ${p.altura_cm}, ${p.altura_ft}, ${p.peso_kg}, ${p.peso_lb},
            ${p.posicion}, ${p.posicion_codigo}, ${p.tipo_jugador}, ${p.estado},
            ${p.equipo_actual}, ${p.liga_actual}, ${p.pais}, ${p.bio},
            ${p.source?.name ?? null}, ${p.source?.url ?? null}, 'publicado', ${i})
    on conflict (slug) do update set
      bms_id = excluded.bms_id, bms_code = excluded.bms_code,
      actualizado_en = now()
    returning id
  `) as Array<{ id: string }>;

  const id = fila.id;

  // Trayectoria
  for (const [n, h] of p.historial_equipos.entries()) {
    await sql`
      insert into player_career (player_id, temporada, equipo, liga, pais, orden)
      values (${id}, ${h.temporada}, ${h.equipo}, ${h.liga}, ${h.pais}, ${n})
    `;
  }

  // Estadísticas
  for (const [n, s] of p.estadisticas_temporada.entries()) {
    await sql`
      insert into player_stats (player_id, temporada, competicion, equipo,
                                pj, minutos, pts, reb, ast, rob, tap,
                                fg2_pct, fg3_pct, ft_pct, totales, origen, orden)
      values (${id}, ${s.temporada}, ${s.liga}, ${s.equipo},
              ${s.pj}, ${s.minutes}, ${s.pts}, ${s.reb}, ${s.ast}, ${s.rob}, ${s.tap},
              ${s.fg}, ${s.three}, ${s.ft},
              ${s.totales ? JSON.stringify(s.totales) : null},
              ${p.source?.name === "LatinBasket" ? "latinbasket" : "manual"}, ${n})
      on conflict do nothing
    `;
  }

  // Vídeos
  for (const [n, v] of p.videos_youtube.entries()) {
    const datos = plataformaDe(v);
    if (!datos) {
      avisos.push(`${p.id}: vídeo "${v.titulo}" sin plataforma reconocible, omitido.`);
      continue;
    }
    await sql`
      insert into player_videos (player_id, url, plataforma, video_id, titulo, tipo, orden)
      values (${id}, ${datos.url}, ${datos.plataforma}, ${datos.video_id}, ${v.titulo}, ${v.tipo ?? null}, ${n})
    `;
  }

  // Redes y ficha externa
  const enlaces: Array<[string, string]> = [];
  for (const [red, valor] of Object.entries(p.redes_sociales ?? {})) {
    // Las cadenas vacías no generan fila: es lo que ya hacía el importador.
    if (valor && valor.trim()) enlaces.push([red, valor.trim()]);
  }
  if (p.source?.url) enlaces.push([p.source.name.toLowerCase(), p.source.url]);

  for (const [n, [tipo, enlace]] of enlaces.entries()) {
    await sql`
      insert into player_links (player_id, tipo, url, orden)
      values (${id}, ${tipo}, ${enlace}, ${n})
      on conflict (player_id, tipo) do nothing
    `;
  }

  // Foto principal
  if (p.foto && !sinFotos) {
    try {
      const subida = await subeFoto(p.foto, p.id);
      if (subida) {
        await sql`
          insert into player_photos (player_id, url, path, ancho, alto,
                                     url_original, path_original, bytes_original,
                                     alt, tipo, orden)
          values (${id}, ${subida.url}, ${subida.path}, ${subida.ancho}, ${subida.alto},
                  ${subida.url_original}, ${subida.path_original}, ${subida.bytes_original},
                  ${`${p.nombre} ${p.apellido}`.trim()}, 'principal', 0)
          on conflict do nothing
        `;
        fotos++;
      } else {
        avisos.push(`${p.id}: la foto ${p.foto} no está en /public.`);
      }
    } catch (err) {
      avisos.push(`${p.id}: no se pudo subir la foto — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`  ✓ ${p.id.padEnd(26)} ${resumen}`);
  creados++;
}

// Catálogos: lo que dice la pestaña VARIABLES del Excel MÁS lo que de verdad
// hay en los datos, para que ningún valor existente quede huérfano.
if (!dry) {
  const catalogos: Array<[string, string, number]> = [
    ["estado", "Disponible", 0],
    ["estado", "Contratado", 1],
    ["estado", "No disponible", 2],
    ["estado", "Activo", 3],
    ["tipo_jugador", "Nacional", 0],
    ["tipo_jugador", "Importado", 1],
    ["tipo_jugador", "Comunitario", 2],
    ["tipo_jugador", "Dominicano en el exterior", 3],
    ["tipo_jugador", "Otro", 4],
    ["tipo_jugador", "Nativo", 5],
    ["tipo_jugador", "Doble nacionalidad", 6],
  ];
  for (const [tipo, valor, orden] of catalogos) {
    await sql`
      insert into catalogos (tipo, valor, etiqueta, orden) values (${tipo}, ${valor}, ${valor}, ${orden})
      on conflict (tipo, valor) do nothing
    `;
  }
}

console.log(
  `\n${dry ? "Se crearían" : "Creados"}: ${creados} · Ya estaban: ${saltados}` +
    (sinFotos || dry ? "" : ` · Fotos subidas: ${fotos}`)
);

if (avisos.length) {
  console.log("\nAvisos:");
  for (const a of avisos) console.log(`  · ${a}`);
}

if (dry) console.log("\nSimulación: no se ha escrito nada.");
