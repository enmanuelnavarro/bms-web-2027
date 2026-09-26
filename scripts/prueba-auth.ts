#!/usr/bin/env node
//
// Comprueba la criptografía de la sesión del panel. Sin base de datos: aquí
// solo se mira que la firma y el hash hagan lo que dicen.
//
//   npm run prueba:auth
//
// Hace falta --conditions react-server porque lib/admin/* importa "server-only",
// que fuera de un componente de servidor lanza a propósito.

// Solo hay imports dinámicos —el secreto tiene que estar puesto ANTES de
// cargar los módulos—, así que esto marca el fichero como módulo para TS.
export {};

process.env.ADMIN_SESSION_SECRET = "x".repeat(48);

const { firmaSesion, leeSesion, caducidad } =
  await import("../lib/admin/sesion.ts");
const { hashPassword, verificaPassword } =
  await import("../lib/admin/password.ts");

let fallos = 0;
const comprueba = (nombre: string, ok: boolean) => {
  console.log(`  ${ok ? "✓" : "✗"} ${nombre}`);
  if (!ok) fallos++;
};

console.log("Sesión:");
const buena = await firmaSesion({ id: "abc-123", email: "a@b.com", exp: caducidad() });
comprueba("una cookie bien firmada se acepta", (await leeSesion(buena))?.id === "abc-123");
comprueba("una cookie manipulada se rechaza", (await leeSesion(buena.slice(0, -3) + "aaa")) === null);
comprueba("sin firma se rechaza", (await leeSesion(buena.split(".")[0])) === null);
comprueba("basura se rechaza", (await leeSesion("no-soy-una-cookie")) === null);
comprueba("vacía se rechaza", (await leeSesion(undefined)) === null);

const vencida = await firmaSesion({ id: "x", email: "a@b.com", exp: Math.floor(Date.now()/1000) - 10 });
comprueba("una sesión caducada se rechaza", (await leeSesion(vencida)) === null);

// Una cookie firmada con OTRO secreto no debe colar.
const guardado = process.env.ADMIN_SESSION_SECRET;
process.env.ADMIN_SESSION_SECRET = "y".repeat(48);
comprueba("firmada con otro secreto se rechaza", (await leeSesion(buena)) === null);
process.env.ADMIN_SESSION_SECRET = guardado;

console.log("\nContraseñas:");
const h = await hashPassword("una-clave-larga-123");
comprueba("el hash no contiene la clave en claro", !h.includes("una-clave-larga-123"));
comprueba("dos hashes de la misma clave difieren (sal)", (await hashPassword("una-clave-larga-123")) !== h);
comprueba("la clave correcta verifica", await verificaPassword("una-clave-larga-123", h));
comprueba("una clave incorrecta no verifica", !(await verificaPassword("otra", h)));
comprueba("un hash corrupto no verifica y no lanza", !(await verificaPassword("x", "basura")));
comprueba("el hash de mentira del login no verifica", !(await verificaPassword("x", "scrypt$00$00")));

console.log(fallos === 0 ? "\nTodo en verde." : `\n${fallos} fallo(s).`);
process.exit(fallos === 0 ? 0 : 1);
