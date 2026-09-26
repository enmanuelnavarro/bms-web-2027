import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Hash de contraseñas con scrypt, que viene en el propio Node: no hace falta
// bcrypt ni argon2 como dependencia nativa.
//
// Esto NO puede vivir en lib/admin/sesion.ts: aquel lo importa proxy.ts, que
// corre en Edge, donde no existe node:crypto. Aquí no pasa nada porque solo lo
// usan el login y el script de crear usuarios, ambos en Node.

const scryptAsync = promisify(scrypt) as (
  clave: string,
  sal: Buffer,
  largo: number
) => Promise<Buffer>;

/** Parámetros por defecto de Node: N=16384, r=8, p=1. Suficiente aquí. */
const LARGO = 64;

/** Formato guardado: `scrypt$<sal en hex>$<hash en hex>`. */
export async function hashPassword(clave: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await scryptAsync(clave, sal, LARGO);
  return `scrypt$${sal.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Comprueba la contraseña en tiempo constante. Devuelve `false` ante cualquier
 * formato raro en vez de lanzar: un hash corrupto en la base es un login
 * fallido, no una caída.
 */
export async function verificaPassword(clave: string, guardado: string): Promise<boolean> {
  try {
    const [algoritmo, salHex, hashHex] = guardado.split("$");
    if (algoritmo !== "scrypt" || !salHex || !hashHex) return false;

    const esperado = Buffer.from(hashHex, "hex");
    const calculado = await scryptAsync(clave, Buffer.from(salHex, "hex"), esperado.length);

    // timingSafeEqual exige la misma longitud, o lanza.
    if (calculado.length !== esperado.length) return false;
    return timingSafeEqual(calculado, esperado);
  } catch {
    return false;
  }
}
