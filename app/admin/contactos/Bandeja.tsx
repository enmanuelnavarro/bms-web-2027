"use client";

import { useMemo, useState } from "react";

import { ESTADOS, ETIQUETA_ESTADO, type EstadoLead, type Lead } from "@/lib/leads-tipos";
import { cambiarEstadoAction, guardarNotasAction, exportarCsvAction } from "./acciones";

// Bandeja de contactos.
//
// No es un correo: es una lista de trabajo. Lo que importa es saber a quién
// falta contestar, así que los nuevos van arriba y destacados, y desde cada
// uno se abre WhatsApp o el correo ya redactado.

const COLOR: Record<EstadoLead, string> = {
  nuevo: "bg-gold text-ink",
  contactado: "bg-ink text-gold-light border border-gold-dark",
  en_negociacion: "bg-ink text-gold border border-gold",
  cerrado: "bg-ink text-body/55 border border-hairline",
  descartado: "bg-ink text-body/35 border border-hairline",
};

/** Solo dígitos: es lo que quiere wa.me. */
const soloNumeros = (t: string) => t.replace(/\D/g, "");

function cuando(iso: string): string {
  const d = new Date(iso);
  const horas = (Date.now() - d.getTime()) / 3_600_000;

  if (horas < 1) return "hace un momento";
  if (horas < 24) return `hace ${Math.floor(horas)} h`;
  if (horas < 48) return "ayer";
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
}

export default function Bandeja({ leads }: { leads: Lead[] }) {
  const [filtro, setFiltro] = useState<EstadoLead | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtro !== "todos" && l.estado !== filtro) return false;
      if (!t) return true;
      return [l.nombre, l.email, l.telefono, l.asunto, l.mensaje, l.player_slug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t));
    });
  }, [leads, filtro, busqueda]);

  const cuenta = (e: EstadoLead) => leads.filter((l) => l.estado === e).length;

  const descarga = async () => {
    setExportando(true);
    try {
      const csv = await exportarCsvAction();
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      enlace.download = `contactos-bms-${new Date().toISOString().slice(0, 10)}.csv`;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={`rounded px-3 py-1.5 text-sm transition ${
            filtro === "todos" ? "bg-gold text-ink" : "border border-hairline hover:border-gold"
          }`}
        >
          Todos <span className="opacity-60">({leads.length})</span>
        </button>

        {ESTADOS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setFiltro(e)}
            className={`rounded px-3 py-1.5 text-sm transition ${
              filtro === e ? "bg-gold text-ink" : "border border-hairline hover:border-gold"
            }`}
          >
            {ETIQUETA_ESTADO[e]} <span className="opacity-60">({cuenta(e)})</span>
          </button>
        ))}

        <button
          type="button"
          onClick={descarga}
          disabled={exportando || leads.length === 0}
          className="ms-auto rounded border border-hairline px-3 py-1.5 text-sm transition hover:border-gold hover:text-gold-light disabled:opacity-50"
        >
          {exportando ? "Preparando…" : "Descargar CSV"}
        </button>
      </div>

      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, correo, jugador o texto del mensaje…"
        className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
      />

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline px-4 py-10 text-center text-body/50">
          {leads.length === 0
            ? "Todavía no ha escrito nadie. Los mensajes del formulario de contacto aparecerán aquí."
            : "Ningún mensaje con ese filtro."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((l) => {
            const desplegado = abierto === l.id;

            return (
              <li
                key={l.id}
                className={`rounded-lg border bg-elevated p-4 ${
                  l.estado === "nuevo" ? "border-gold/40" : "border-hairline"
                }`}
              >
                <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                  <span className={`rounded px-2 py-0.5 text-xs ${COLOR[l.estado]}`}>
                    {ETIQUETA_ESTADO[l.estado]}
                  </span>
                  <strong className="text-gold-light">{l.nombre}</strong>
                  <span className="text-sm text-body/55">{cuando(l.creado_en)}</span>

                  {!l.email_enviado && (
                    <span
                      className="rounded bg-red-500/15 px-2 py-0.5 text-xs text-red-300"
                      title={l.email_error ?? "No se pudo enviar el aviso por correo"}
                    >
                      sin aviso por correo
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a href={`mailto:${l.email}`} className="text-gold hover:text-gold-light">
                    {l.email}
                  </a>
                  {l.telefono && (
                    <a
                      href={`https://wa.me/${soloNumeros(l.telefono)}?text=${encodeURIComponent(
                        `Hola ${l.nombre.split(" ")[0]}, te escribimos de BMS sobre tu mensaje.`
                      )}`}
                      target="_blank"
                      rel="noopener"
                      className="text-gold hover:text-gold-light"
                    >
                      WhatsApp {l.telefono}
                    </a>
                  )}
                  {l.player_slug && (
                    <span className="text-body/60">
                      Pregunta por <strong className="text-body/80">{l.player_slug}</strong>
                    </span>
                  )}
                  {l.asunto && <span className="text-body/50">{l.asunto}</span>}
                </div>

                <p
                  className={`mt-3 whitespace-pre-wrap text-sm text-body/75 ${
                    desplegado ? "" : "line-clamp-3"
                  }`}
                >
                  {l.mensaje}
                </p>

                {l.mensaje.length > 220 && (
                  <button
                    type="button"
                    onClick={() => setAbierto(desplegado ? null : l.id)}
                    className="mt-1 text-sm text-gold hover:text-gold-light"
                  >
                    {desplegado ? "Ver menos" : "Ver el mensaje entero"}
                  </button>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline/50 pt-3">
                  <span className="text-xs text-body/50">Marcar como:</span>
                  {ESTADOS.filter((e) => e !== l.estado).map((e) => (
                    <form key={e} action={cambiarEstadoAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="estado" value={e} />
                      <button
                        type="submit"
                        className="rounded border border-hairline px-2 py-1 text-xs transition hover:border-gold hover:text-gold-light"
                      >
                        {ETIQUETA_ESTADO[e]}
                      </button>
                    </form>
                  ))}
                </div>

                <form action={guardarNotasAction} className="mt-3">
                  <input type="hidden" name="id" value={l.id} />
                  <label
                    htmlFor={`notas-${l.id}`}
                    className="mb-1 block text-xs text-body/55"
                  >
                    Notas internas
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`notas-${l.id}`}
                      name="notas"
                      defaultValue={l.notas ?? ""}
                      placeholder="Llamado el martes, pide vídeo del jugador…"
                      className="flex-1 rounded border border-hairline bg-ink px-3 py-1.5 text-sm text-body outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      className="rounded border border-hairline px-3 py-1.5 text-sm transition hover:border-gold hover:text-gold-light"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
