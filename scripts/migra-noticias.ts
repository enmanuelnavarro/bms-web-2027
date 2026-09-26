#!/usr/bin/env node
//
// Pasa las noticias de lib/news.json a la tabla `news`.
//
//   node scripts/migra-noticias.ts --dry     (enseña lo que haría)
//   node scripts/migra-noticias.ts           (escribe)
//
// Es idempotente: hace upsert por slug, así que se puede repetir. **No pisa lo
// editado en el panel**: si una noticia ya está en la base, se deja como está
// y se avisa. El JSON solo siembra lo que falta.
//
// El contenido del JSON son párrafos de texto plano; aquí se convierten a HTML
// escapando lo que haga falta, porque el panel trabaja con HTML.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

import type { News } from "../lib/types.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

function cargaEntorno(): void {
  const fichero = join(RAIZ, ".env.local");
  if (!existsSync(fichero)) return;
  for (const linea of readFileSync(fichero, "utf8").split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const igual = limpia.indexOf("=");
    if (igual < 0) continue;
    const nombre = limpia.slice(0, igual).trim();
    let valor = limpia.slice(igual + 1).trim();
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
const dry = process.argv.includes("--dry");

const escapa = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

/** Párrafos separados por línea en blanco → <p>…</p>. */
const aHtml = (texto: string) =>
  texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapa(p)}</p>`)
    .join("");

const noticias = JSON.parse(
  readFileSync(join(RAIZ, "lib", "news.json"), "utf8")
) as News[];

const existentes = new Set(
  ((await sql`select slug from news`) as Array<{ slug: string }>).map((f) => f.slug)
);

console.log(`${noticias.length} noticia(s) en el JSON${dry ? " (simulación)" : ""}\n`);

let creadas = 0;
let saltadas = 0;

for (const n of noticias) {
  if (existentes.has(n.slug)) {
    console.log(`  · ${n.slug} — ya está en la base, no se toca`);
    saltadas++;
    continue;
  }

  const html = aHtml(n.contenido);

  if (dry) {
    console.log(
      `  + ${n.slug} — "${n.titulo}" · ${n.fecha} · ${html.length} car. de HTML` +
        (n.jugador_relacionado ? ` · jugador: ${n.jugador_relacionado}` : "")
    );
    creadas++;
    continue;
  }

  const [fila] = (await sql`
    insert into news (slug, titulo, resumen, contenido, categoria, autor,
                      imagen_url, imagen_alt, fuente_nombre, fuente_url,
                      estado, destacada, publicada_en)
    values (${n.slug}, ${n.titulo}, ${n.resumen}, ${html}, ${n.categoria}, ${n.autor},
            ${n.imagen}, ${n.imagen_alt}, ${n.fuente.nombre}, ${n.fuente.url},
            'publicado', ${n.destacada}, ${n.fecha})
    returning id
  `) as Array<{ id: string }>;

  if (n.jugador_relacionado) {
    await sql`
      insert into news_players (news_id, player_slug) values (${fila.id}, ${n.jugador_relacionado})
      on conflict do nothing
    `;
  }

  console.log(`  ✓ ${n.slug}`);
  creadas++;
}

console.log(
  `\n${dry ? "Se crearían" : "Creadas"}: ${creadas} · Ya estaban: ${saltadas}` +
    (dry ? "\n\nSimulación: no se ha escrito nada." : "")
);

// Las imágenes de las noticias migradas siguen apuntando a /public. Es
// correcto: esos ficheros están en el repositorio y se sirven igual. Las que
// se suban desde el panel irán a Blob.
if (!dry && creadas > 0) {
  const conImagen = noticias.filter((n) => n.imagen).length;
  if (conImagen > 0) {
    console.log(
      `\n${conImagen} noticia(s) conservan su imagen de /public. Se siguen viendo;\n` +
        "al cambiarlas desde el panel pasarán al almacén de imágenes."
    );
  }
}
