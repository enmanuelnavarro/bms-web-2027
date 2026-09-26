"use server";

import { revalidateTag } from "next/cache";

import { db } from "@/lib/db";
import { exigeAdmin, registra } from "@/lib/admin/auth";
import { ETIQUETA_LEADS, todosLosLeads } from "@/lib/leads";
import { ESTADOS } from "@/lib/leads-tipos";

// Bandeja de contactos: cambiar estado, anotar y exportar.

export async function cambiarEstadoAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();

  const id = String(datos.get("id") ?? "");
  const estado = String(datos.get("estado") ?? "");
  if (!id || !ESTADOS.includes(estado as (typeof ESTADOS)[number])) return;

  await db()`
    update leads set estado = ${estado}, actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id}
  `;

  await registra(admin, "leads", id, `estado:${estado}`);
  revalidateTag(ETIQUETA_LEADS, { expire: 0 });
}

export async function guardarNotasAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();

  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const notas = String(datos.get("notas") ?? "").trim().slice(0, 4000) || null;

  await db()`
    update leads set notas = ${notas}, actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id}
  `;

  await registra(admin, "leads", id, "notas");
  revalidateTag(ETIQUETA_LEADS, { expire: 0 });
}

/**
 * Exporta la bandeja a CSV. Se devuelve como texto y el navegador lo descarga:
 * no hace falta una ruta aparte solo para esto.
 */
export async function exportarCsvAction(): Promise<string> {
  await exigeAdmin();

  const leads = await todosLosLeads();

  // Una celda que empieza por = + - @ la interpreta Excel como fórmula. Se le
  // antepone una comilla para que entre como texto: es la vía clásica para
  // colar una fórmula en la hoja de otro.
  const celda = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };

  const cabecera = [
    "Fecha", "Nombre", "Email", "Teléfono", "Asunto", "Jugador",
    "Oficina", "Estado", "Notas", "Correo enviado", "Mensaje",
  ];

  const filas = leads.map((l) =>
    [
      new Date(l.creado_en).toLocaleString("es-DO"),
      l.nombre, l.email, l.telefono, l.asunto, l.player_slug,
      l.oficina, l.estado, l.notas, l.email_enviado ? "sí" : "no", l.mensaje,
    ].map(celda).join(",")
  );

  // BOM para que Excel abra bien los acentos.
  return `﻿${[cabecera.map(celda).join(","), ...filas].join("\r\n")}`;
}
