// Fuente única de los jugadores de BMS.
//
// El contenido vive en lib/players.json, que genera scripts/import-players.mjs
// a partir del Excel de la agencia. Ninguna página debe importar ese JSON
// directamente: todo pasa por aquí, para que los datos derivados (edad, altura
// en metros, etiqueta de estado, enlace de contacto) se calculen en un solo
// sitio y no se dupliquen por la web.

import datos from "./players.json";
import type { Player, PlayerSource } from "./types";
import { SITE } from "./site";

/** Ficha sin fotografía propia: se usa el marcador de la casa, no la de otro. */
export const FOTO_PLACEHOLDER = "/players/placeholder-player.svg";

export const PLAYERS: Player[] = (datos as Player[])
  .slice()
  .sort((a, b) =>
    nombreCompleto(a).localeCompare(nombreCompleto(b), "es", { sensitivity: "base" })
  );

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function getPlayerIds(): string[] {
  return PLAYERS.map((p) => p.id);
}

export function nombreCompleto(p: Player): string {
  return [p.nombre, p.apellido].filter(Boolean).join(" ");
}

export function fotoDe(p: Player): string {
  return p.foto || FOTO_PLACEHOLDER;
}

export function tieneFoto(p: Player): boolean {
  return Boolean(p.foto) && p.foto !== FOTO_PLACEHOLDER;
}

/** Edad a día de hoy. Se calcula, no se guarda: guardada caduca cada año. */
export function edad(p: Player): number | null {
  if (!p.fecha_nacimiento) return null;
  const nac = new Date(p.fecha_nacimiento);
  if (Number.isNaN(nac.getTime())) return null;

  const hoy = new Date();
  let años = hoy.getUTCFullYear() - nac.getUTCFullYear();
  const mes = hoy.getUTCMonth() - nac.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nac.getUTCDate())) años--;
  return años >= 0 && años < 120 ? años : null;
}

/** 195 → "1.95 m". Null si no hay dato: la ficha oculta el campo. */
export function alturaTexto(p: Player): string | null {
  return p.altura_cm ? `${(p.altura_cm / 100).toFixed(2)} m` : null;
}

export function pesoTexto(p: Player): string | null {
  return p.peso_kg ? `${p.peso_kg} kg` : null;
}

/** "1.95 m · 83 kg", o solo lo que haya. */
export function medidasTexto(p: Player): string | null {
  const partes = [alturaTexto(p), pesoTexto(p)].filter(Boolean);
  return partes.length ? partes.join(" · ") : null;
}

export function fechaNacimientoTexto(p: Player): string | null {
  if (!p.fecha_nacimiento) return null;
  const d = new Date(p.fecha_nacimiento);
  if (Number.isNaN(d.getTime())) return p.fecha_nacimiento;
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Liga si la hay; si no, el país, que es lo que sí trae la base. */
export function contextoEquipo(p: Player): string | null {
  return p.liga_actual || p.pais || null;
}

// --- Estado -----------------------------------------------------------------

/**
 * Clave estable para el estilo del distintivo. El texto que se muestra es
 * siempre el de la base de datos; esto solo decide el color.
 */
export function estadoKey(p: Player): string {
  const e = (p.estado ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (!e) return "desconocido";
  if (e.includes("disponible")) return "disponible";
  if (e.includes("activo") || e.includes("contrato")) return "activo";
  if (e.includes("negociacion")) return "negociacion";
  return "por_validar";
}

export const ESTADO_ESTILOS: Record<string, string> = {
  disponible: "bg-gold text-ink",
  activo: "bg-ink/60 text-body/85 border border-hairline",
  negociacion: "bg-ink/60 text-gold border border-gold",
  por_validar: "bg-ink/60 text-body/55 border border-hairline",
  desconocido: "bg-ink/60 text-body/55 border border-hairline",
};

/** Texto del distintivo. Sale de la base; si está vacío, no se inventa. */
export function estadoTexto(p: Player): string | null {
  return p.estado || null;
}

// --- Fuente externa ---------------------------------------------------------

export function fuenteDe(p: Player): PlayerSource | null {
  return p.source ?? null;
}

// --- Contacto ---------------------------------------------------------------

/** Formulario de contacto con el jugador ya identificado. */
export function contactoHref(p: Player): string {
  return `/contacto?jugador=${encodeURIComponent(p.id)}`;
}

/** WhatsApp con el mensaje redactado a partir del nombre, sin enlaces a mano. */
export function whatsappHref(p: Player): string {
  const texto = `Hola, quiero solicitar información sobre ${nombreCompleto(p)}.`;
  return `https://wa.me/${SITE.whatsappHref}?text=${encodeURIComponent(texto)}`;
}

// --- Listados y filtros -----------------------------------------------------

/** Valores distintos de un campo, ordenados, para poblar los desplegables. */
export function valoresDe(campo: "posicion" | "pais" | "nacionalidad" | "estado"): string[] {
  const set = new Set<string>();
  for (const p of PLAYERS) {
    const v = p[campo];
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Jugadores para el escaparate de la portada. Se priorizan los que tienen
 * fotografía propia y estadísticas, que son los que lucen en una tarjeta
 * grande; el resto entra solo si hacen falta para completar el número.
 */
export function destacados(cuantos = 3): Player[] {
  const puntua = (p: Player) =>
    (tieneFoto(p) ? 2 : 0) + (p.estadisticas_temporada.length > 0 ? 1 : 0);

  return PLAYERS.slice()
    .sort((a, b) => puntua(b) - puntua(a))
    .slice(0, cuantos);
}

/** "19.6 PTS · 4.9 REB · 4.1 AST" de la temporada más reciente, si la hay. */
export function titularEstadistico(p: Player): string | null {
  const s = p.estadisticas_temporada[0];
  if (!s) return null;
  return `${s.pts.toFixed(1)} PTS · ${s.reb.toFixed(1)} REB · ${s.ast.toFixed(1)} AST`;
}
