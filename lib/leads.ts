import "server-only";

import { db } from "@/lib/db";

// Mensajes del formulario de contacto.
//
// Son datos personales de clubes y de jugadores, así que esto no se lee nunca
// desde el navegador: solo desde el servidor y con sesión de administrador.

export const ETIQUETA_LEADS = "leads";

// Los tipos y el catálogo viven en lib/leads-tipos.ts, sin "server-only", para
// que la bandeja del panel —que es cliente— pueda usarlos sin arrastrar la
// conexión a Postgres al navegador.
export { ESTADOS, ETIQUETA_ESTADO } from "./leads-tipos";
export type { EstadoLead, Lead } from "./leads-tipos";

import type { Lead } from "./leads-tipos";

type Nuevo = {
  nombre: string;
  email: string;
  telefono?: string | null;
  asunto?: string | null;
  mensaje: string;
  oficina?: string | null;
  player_slug?: string | null;
};

/**
 * Guarda el mensaje. Se llama **antes** de mandar ningún correo: si Resend
 * falla, el contacto tiene que quedar registrado igualmente.
 */
export async function guardaLead(datos: Nuevo): Promise<string | null> {
  const [fila] = (await db()`
    insert into leads (nombre, email, telefono, asunto, mensaje, oficina, player_slug)
    values (${datos.nombre}, ${datos.email}, ${datos.telefono ?? null},
            ${datos.asunto ?? null}, ${datos.mensaje}, ${datos.oficina ?? null},
            ${datos.player_slug ?? null})
    returning id
  `) as Array<{ id: string }>;

  return fila?.id ?? null;
}

/** Anota si los correos salieron. No lanza: es información, no el trabajo. */
export async function anotaEnvio(id: string, enviado: boolean, error?: string): Promise<void> {
  try {
    await db()`
      update leads set email_enviado = ${enviado}, email_error = ${error ?? null}
       where id = ${id}
    `;
  } catch (err) {
    console.error("[leads] no se pudo anotar el envío:", err);
  }
}

export async function todosLosLeads(): Promise<Lead[]> {
  const filas = (await db()`
    select id, nombre, email, telefono, asunto, mensaje, oficina, player_slug,
           estado, notas, email_enviado, email_error, creado_en
      from leads
     order by creado_en desc
  `) as Array<Omit<Lead, "creado_en"> & { creado_en: string | Date }>;

  return filas.map((f) => ({
    ...f,
    creado_en: typeof f.creado_en === "string" ? f.creado_en : f.creado_en.toISOString(),
  }));
}

/** Cuántos sin abrir, para el aviso del panel. */
export async function leadsNuevos(): Promise<number> {
  try {
    const [f] = (await db()`select count(*)::int as n from leads where estado = 'nuevo'`) as Array<{
      n: number;
    }>;
    return f?.n ?? 0;
  } catch {
    return 0;
  }
}
