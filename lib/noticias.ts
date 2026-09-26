import "server-only";

import { unstable_cache } from "next/cache";

import { db, hayBaseDeDatos } from "@/lib/db";
import { NEWS } from "@/lib/news";
import type { News } from "@/lib/types";

// Las noticias.
//
// Fuente: la tabla `news`. Si todavía no hay base de datos, o la tabla está
// vacía, o la consulta falla, se sirve lib/news.json. El listado de noticias
// no puede quedarse en blanco porque falte una variable de entorno.
//
// Devuelve el **mismo tipo `News`** que ya usaban las páginas, más un par de
// campos nuevos, para que el listado y la ficha cambien lo mínimo.

export const ETIQUETA_NOTICIAS = "noticias";

export type Noticia = News & {
  /** Null en las que vienen del JSON, que no están en la base. */
  id: string | null;
  /** HTML saneado. Las del JSON traen sus párrafos convertidos. */
  contenido_html: string;
  credito_imagen: string | null;
  /** Punto que no se recorta, "50% 20%". Ver app/admin/SelectorDeFoco.tsx. */
  imagen_focus: string;
  jugadores: string[];
  estado: "borrador" | "publicado";
};

export type NoticiaAdmin = Noticia & {
  id: string;
  imagen_path: string | null;
};

type Fila = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string | null;
  contenido: string;
  categoria: string | null;
  autor: string;
  imagen_url: string | null;
  imagen_path: string | null;
  imagen_alt: string | null;
  imagen_credito: string | null;
  imagen_focus: string;
  fuente_nombre: string;
  fuente_url: string;
  estado: "borrador" | "publicado";
  destacada: boolean;
  publicada_en: string | Date;
  jugadores: string[] | null;
};

/** "2026-09-24" en local, sin que el huso mueva la fecha un día. */
const soloFecha = (v: string | Date): string =>
  typeof v === "string" ? v.slice(0, 10) : v.toISOString().slice(0, 10);

function deFila(f: Fila): NoticiaAdmin {
  return {
    id: f.id,
    slug: f.slug,
    titulo: f.titulo,
    fecha: soloFecha(f.publicada_en),
    categoria: f.categoria ?? "",
    imagen: f.imagen_url,
    imagen_alt: f.imagen_alt,
    imagen_path: f.imagen_path,
    credito_imagen: f.imagen_credito,
    imagen_focus: f.imagen_focus ?? "50% 50%",
    resumen: f.resumen ?? "",
    // `contenido` se conserva por compatibilidad con el tipo News; lo que
    // pintan las páginas es `contenido_html`.
    contenido: f.contenido,
    contenido_html: f.contenido,
    autor: f.autor,
    jugador_relacionado: f.jugadores?.[0] ?? null,
    jugadores: f.jugadores ?? [],
    destacada: f.destacada,
    estado: f.estado,
    fuente: { nombre: f.fuente_nombre, url: f.fuente_url },
  };
}

/**
 * Las del JSON, para cuando no hay nada en la base.
 *
 * Sus párrafos se convierten a HTML aquí: el contenido del JSON son bloques
 * separados por línea en blanco, y la ficha pasa a pintar HTML.
 */
function porDefecto(): Noticia[] {
  return NEWS.map((n) => ({
    ...n,
    id: null,
    contenido_html: n.contenido
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapa(p.trim())}</p>`)
      .join(""),
    credito_imagen: null,
    imagen_focus: "50% 50%",
    jugadores: n.jugador_relacionado ? [n.jugador_relacionado] : [],
    estado: "publicado" as const,
  }));
}

/** El JSON es texto plano: si trae un < o un &, hay que escaparlo al meterlo en HTML. */
function escapa(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

const SELECT = `
  select n.id, n.slug, n.titulo, n.resumen, n.contenido, n.categoria, n.autor,
         n.imagen_url, n.imagen_path, n.imagen_alt, n.imagen_credito, n.imagen_focus,
         n.fuente_nombre, n.fuente_url, n.estado, n.destacada, n.publicada_en,
         coalesce(
           (select array_agg(np.player_slug order by np.orden)
              from news_players np where np.news_id = n.id),
           '{}'
         ) as jugadores
    from news n
`;

const leePublicadas = unstable_cache(
  async (): Promise<NoticiaAdmin[] | null> => {
    const filas = (await db().query(
      `${SELECT} where n.estado = 'publicado' and n.publicada_en <= current_date
       order by n.publicada_en desc, n.creado_en desc`
    )) as Fila[];

    return filas.length ? filas.map(deFila) : null;
  },
  ["noticias-publicadas"],
  { tags: [ETIQUETA_NOTICIAS] }
);

/** Lo que ve el público. Nunca lanza y nunca devuelve una lista vacía. */
export async function noticiasPublicadas(): Promise<Noticia[]> {
  if (!hayBaseDeDatos()) return porDefecto();

  try {
    return (await leePublicadas()) ?? porDefecto();
  } catch (err) {
    console.error("[noticias] no se pudieron leer, se usa lib/news.json:", err);
    return porDefecto();
  }
}

export async function noticiaPorSlug(slug: string): Promise<Noticia | undefined> {
  return (await noticiasPublicadas()).find((n) => n.slug === slug);
}

/** Las destacadas para la portada; si nadie marcó ninguna, las más recientes. */
export async function noticiasDestacadas(limite = 3): Promise<Noticia[]> {
  const todas = await noticiasPublicadas();
  const marcadas = todas.filter((n) => n.destacada);
  return (marcadas.length > 0 ? marcadas : todas).slice(0, limite);
}

export async function categoriasDeNoticias(): Promise<string[]> {
  return [...new Set((await noticiasPublicadas()).map((n) => n.categoria).filter(Boolean))];
}

// --- Solo para el panel: sin caché, incluye borradores --------------------

export async function todasLasNoticias(): Promise<NoticiaAdmin[]> {
  const filas = (await db().query(
    `${SELECT} order by n.publicada_en desc, n.creado_en desc`
  )) as Fila[];
  return filas.map(deFila);
}

export async function noticiaPorId(id: string): Promise<NoticiaAdmin | null> {
  const filas = (await db().query(`${SELECT} where n.id = $1 limit 1`, [id])) as Fila[];
  return filas[0] ? deFila(filas[0]) : null;
}

/** ¿El listado sigue tirando de lib/news.json? */
export async function usandoElJson(): Promise<boolean> {
  if (!hayBaseDeDatos()) return true;
  try {
    const filas = (await db()`select 1 from news limit 1`) as unknown[];
    return filas.length === 0;
  } catch {
    return true;
  }
}
