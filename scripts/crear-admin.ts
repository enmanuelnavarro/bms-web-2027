#!/usr/bin/env node
//
// Da de alta (o actualiza) un usuario del panel.
//
//   node scripts/crear-admin.ts frank@bmsrd.com "Frank Brito" admin
//   node scripts/crear-admin.ts editor@bmsrd.com "Nombre" editor
//   node scripts/crear-admin.ts --listar
//   node scripts/crear-admin.ts --desactivar alguien@bmsrd.com
//
// No hay registro público a propósito: los usuarios se crean desde aquí. La
// contraseña se pide por teclado y no se ve al escribirla; si el correo ya
// existe, se le cambia la contraseña en vez de crear un duplicado.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

import { neon } from "@neondatabase/serverless";

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
const scryptAsync = promisify(scrypt) as (c: string, s: Buffer, l: number) => Promise<Buffer>;

async function hash(clave: string): Promise<string> {
  const sal = randomBytes(16);
  return `scrypt$${sal.toString("hex")}$${(await scryptAsync(clave, sal, 64)).toString("hex")}`;
}

/** Pide la contraseña sin que se vea al teclearla. */
function pideClave(texto: string): Promise<string> {
  return new Promise((resolver) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const salida = process.stdout as NodeJS.WriteStream & { muted?: boolean };

    // @ts-expect-error se sustituye _writeToOutput, que es interno de readline
    rl._writeToOutput = (s: string) => {
      if (!salida.muted) process.stdout.write(s);
      else if (s.includes(texto)) process.stdout.write(texto);
    };

    rl.question(texto, (respuesta) => {
      salida.muted = false;
      process.stdout.write("\n");
      rl.close();
      resolver(respuesta);
    });
    salida.muted = true;
  });
}

const args = process.argv.slice(2);

// --------------------------------------------------------------------- listar

if (args.includes("--listar")) {
  const filas = (await sql`
    select email, nombre, rol, activo, creado_en, ultimo_acceso
      from admins order by creado_en
  `) as Array<{
    email: string;
    nombre: string | null;
    rol: string;
    activo: boolean;
    ultimo_acceso: string | null;
  }>;

  if (filas.length === 0) {
    console.log("No hay ningún usuario. Crea el primero:\n");
    console.log('  node scripts/crear-admin.ts tu@correo.com "Tu Nombre" admin\n');
  } else {
    console.log(`\n${filas.length} usuario(s):\n`);
    for (const f of filas) {
      const ultimo = f.ultimo_acceso
        ? new Date(f.ultimo_acceso).toLocaleString("es-DO")
        : "nunca ha entrado";
      console.log(
        `  ${f.activo ? "●" : "○"} ${f.email}  (${f.rol})  ${f.nombre ?? ""}  · ${ultimo}`
      );
    }
    console.log("");
  }
  process.exit(0);
}

// ---------------------------------------------------------------- desactivar

const iDesactivar = args.indexOf("--desactivar");
if (iDesactivar >= 0) {
  const email = args[iDesactivar + 1];
  if (!email) {
    console.error("Uso: node scripts/crear-admin.ts --desactivar correo@ejemplo.com");
    process.exit(1);
  }
  const filas = (await sql`
    update admins set activo = false where lower(email) = ${email.toLowerCase()} returning email
  `) as Array<{ email: string }>;

  console.log(
    filas.length
      ? `${filas[0].email} desactivado. Su sesión deja de valer de inmediato.`
      : `No hay ningún usuario con el correo ${email}.`
  );
  process.exit(0);
}

// -------------------------------------------------------------------- crear

const [email, nombre, rol = "editor"] = args;

if (!email || !email.includes("@")) {
  console.error(
    'Uso: node scripts/crear-admin.ts <correo> "<nombre>" [admin|editor]\n' +
      "     node scripts/crear-admin.ts --listar\n" +
      "     node scripts/crear-admin.ts --desactivar <correo>"
  );
  process.exit(1);
}

if (rol !== "admin" && rol !== "editor") {
  console.error(`El rol "${rol}" no existe. Son "admin" o "editor".`);
  process.exit(1);
}

const clave = await pideClave(`Contraseña para ${email}: `);
if (clave.length < 10) {
  console.error("Demasiado corta: mínimo 10 caracteres.");
  process.exit(1);
}
const repetida = await pideClave("Repítela: ");
if (clave !== repetida) {
  console.error("No coinciden.");
  process.exit(1);
}

const passwordHash = await hash(clave);

const filas = (await sql`
  insert into admins (email, nombre, password_hash, rol)
  values (${email.toLowerCase()}, ${nombre ?? null}, ${passwordHash}, ${rol})
  on conflict (email) do update
    set password_hash = excluded.password_hash,
        nombre = coalesce(excluded.nombre, admins.nombre),
        rol = excluded.rol,
        activo = true
  returning email, rol, (xmax = 0) as es_nuevo
`) as Array<{ email: string; rol: string; es_nuevo: boolean }>;

const f = filas[0];
console.log(
  f.es_nuevo
    ? `\nCreado: ${f.email} (${f.rol}). Ya puede entrar en /admin/login.\n`
    : `\nActualizado: ${f.email} (${f.rol}). Contraseña cambiada.\n`
);
