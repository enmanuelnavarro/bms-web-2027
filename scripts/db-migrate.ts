#!/usr/bin/env node
//
// Aplica las migraciones de db/migrations/ en orden de nombre.
//
//   node scripts/db-migrate.ts            (aplica lo que falte)
//   node scripts/db-migrate.ts --estado   (solo dice qué hay, no toca nada)
//
// Cada fichero se ejecuta una vez y queda anotado en la tabla `migraciones`.
// Volver a lanzarlo no repite nada, así que es seguro ejecutarlo siempre.
//
// La conexión sale de DATABASE_URL (o POSTGRES_URL). En local se pone en
// .env.local; en Vercel la inyecta la integración de la base de datos.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(RAIZ, "db", "migrations");

/** Lee .env.local a mano: este script corre fuera de Next, que es quien lo carga. */
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
    // Lo que ya venga del entorno real manda sobre el fichero.
    process.env[nombre] ??= valor;
  }
}

cargaEntorno();

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error(
    "Falta DATABASE_URL (o POSTGRES_URL).\n\n" +
      "  1. En el panel de Vercel: Storage → tu base de datos → .env.local\n" +
      "  2. Copia la línea en el .env.local de este proyecto\n"
  );
  process.exit(1);
}

const sql = neon(url);
const soloEstado = process.argv.includes("--estado");

// La tabla de control se crea aparte: es la que dice qué se ha aplicado ya, así
// que no puede depender de una migración.
await sql`
  create table if not exists migraciones (
    nombre      text primary key,
    aplicada_en timestamptz not null default now()
  )
`;

const aplicadas = new Set(
  ((await sql`select nombre from migraciones`) as Array<{ nombre: string }>).map((f) => f.nombre)
);

const ficheros = readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (soloEstado) {
  console.log("Migraciones:\n");
  for (const f of ficheros) {
    console.log(`  ${aplicadas.has(f) ? "✓ aplicada" : "· pendiente"}  ${f}`);
  }
  process.exit(0);
}

let hechas = 0;

for (const fichero of ficheros) {
  if (aplicadas.has(fichero)) {
    console.log(`  · ${fichero} (ya estaba)`);
    continue;
  }

  const contenido = readFileSync(join(DIR, fichero), "utf8");

  try {
    // El driver http de Neon no admite varias sentencias en una llamada, así
    // que se parten. Todas las migraciones usan `if not exists`, de modo que
    // una repetición parcial no rompe nada.
    const sentencias = contenido
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s && !/^(--[^\n]*\n?)*$/.test(s));

    for (const sentencia of sentencias) {
      await sql.query(sentencia);
    }

    await sql`insert into migraciones (nombre) values (${fichero})`;
    console.log(`  ✓ ${fichero}`);
    hechas++;
  } catch (err) {
    console.error(`\n  ✗ ${fichero} falló:\n`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

console.log(
  hechas === 0
    ? "\nNada que aplicar: la base ya estaba al día."
    : `\n${hechas} migración(es) aplicada(s).`
);
