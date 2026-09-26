import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Conexión a Postgres. La base es Neon, que es lo que hay detrás de "Vercel
// Postgres" desde que Vercel movió su producto al marketplace: se da de alta
// desde el panel de Vercel y la variable se inyecta sola en el despliegue.
//
// `server-only` arriba no es decorativo: si alguien importa este fichero desde
// un componente de cliente, la build falla en vez de mandar la cadena de
// conexión al navegador.
//
// La conexión se abre **al primer uso**, no al importar. Es deliberado: la web
// pública tiene que compilar y servirse aunque todavía no haya base de datos
// —las páginas caen a los JSON de siempre—, y un `throw` en la carga del
// módulo tumbaría la build entera durante el prerenderizado.

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

let cliente: NeonQueryFunction<false, false> | null = null;

/** ¿Hay base de datos configurada? Se pregunta antes de leer, no se asume. */
export function hayBaseDeDatos(): boolean {
  return Boolean(url);
}

/**
 * Cliente SQL. Se usa como plantilla etiquetada y **parametriza siempre** lo
 * interpolado, así que `sql\`… where id = ${id}\`` no es inyectable.
 *
 * Lo que no se puede parametrizar son nombres de tabla o columna: si algún día
 * hace falta, va concatenado a mano y validado contra una lista blanca.
 */
export function db(): NeonQueryFunction<false, false> {
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL (o POSTGRES_URL). Se obtiene en el panel de Vercel, " +
        "en Storage → la base de datos → .env.local, y se copia a .env.local."
    );
  }
  cliente ??= neon(url);
  return cliente;
}
