import type { News } from "./types";

import newsData from "./news.json";

/**
 * Noticias de BMS. Redacción propia a partir de fuentes verificables: cada
 * pieza guarda el medio de origen en `fuente` y la ficha enlaza al artículo
 * original, que es lo que permite comprobar los datos.
 *
 * El acceso va siempre por aquí, no por el JSON: así el orden y el tipado son
 * los mismos en la portada, el listado y la ficha.
 */
export const NEWS: News[] = (newsData as News[])
  .slice()
  .sort((a, b) => b.fecha.localeCompare(a.fecha));

/** Una noticia por su slug. `undefined` si no existe: la ruta hace notFound(). */
export function noticiaPorSlug(slug: string): News | undefined {
  return NEWS.find((n) => n.slug === slug);
}

/**
 * Las destacadas para la portada, de más reciente a más antigua. La portada
 * enseña un puñado y manda al listado completo: no es una página de noticias.
 */
export function destacadas(limite = 3): News[] {
  const marcadas = NEWS.filter((n) => n.destacada);
  // Si nadie ha marcado ninguna, valen las más recientes: la portada nunca
  // debe quedarse con el hueco vacío por un descuido al editar el JSON.
  return (marcadas.length > 0 ? marcadas : NEWS).slice(0, limite);
}

/** Categorías presentes, para el filtro del listado. */
export function categorias(): string[] {
  return [...new Set(NEWS.map((n) => n.categoria))];
}

/** Fecha larga en castellano: "24 de septiembre de 2026". */
export function fechaLarga(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Fecha corta para las tarjetas: "24 sept 2026". */
export function fechaCorta(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
