import "server-only";

import { unstable_cache } from "next/cache";

import { db, hayBaseDeDatos } from "@/lib/db";
import { BANNER_SLIDES } from "@/lib/images";
import type { Slide } from "@/components/HeroCarousel";

// Las láminas del carrusel de portada.
//
// Fuente: la tabla `home_slides`. Si todavía no hay base de datos, o la tabla
// está vacía, o la consulta falla, se sirven las de lib/images.ts. La portada
// no puede quedarse sin banner porque falte una variable de entorno.
//
// Caché: etiqueta `slides`, que el panel invalida al guardar. Así el cambio se
// ve enseguida sin volver a desplegar, y entre tanto no se consulta la base en
// cada visita.

export const ETIQUETA_SLIDES = "slides";

export type SlideAdmin = Slide & {
  id: string;
  imagePath: string;
  orden: number;
  activa: boolean;
};

type Fila = {
  id: string;
  image_url: string;
  image_path: string;
  alt: string;
  caption: string | null;
  focus: string;
  orden: number;
  activa: boolean;
};

const deFila = (f: Fila): SlideAdmin => ({
  id: f.id,
  src: f.image_url,
  imagePath: f.image_path,
  alt: f.alt,
  caption: f.caption ?? undefined,
  focus: f.focus,
  orden: f.orden,
  activa: f.activa,
});

/** Las de lib/images.ts, para cuando no hay nada en la base. */
function porDefecto(): Slide[] {
  return BANNER_SLIDES.map((s) => ({
    src: s.src,
    alt: s.alt,
    caption: s.caption,
    focus: "focus" in s ? s.focus : undefined,
  }));
}

const leeActivas = unstable_cache(
  async (): Promise<Slide[] | null> => {
    const filas = (await db()`
      select id, image_url, image_path, alt, caption, focus, orden, activa
        from home_slides
       where activa
       order by orden, creado_en
    `) as Fila[];

    return filas.length ? filas.map(deFila) : null;
  },
  ["home-slides-activas"],
  { tags: [ETIQUETA_SLIDES] }
);

/** Lo que pinta la portada. Nunca lanza y nunca devuelve una lista vacía. */
export async function slidesDePortada(): Promise<Slide[]> {
  if (!hayBaseDeDatos()) return porDefecto();

  try {
    return (await leeActivas()) ?? porDefecto();
  } catch (err) {
    // Base caída o tabla sin migrar: la portada sigue en pie con las de siempre.
    console.error("[slides] no se pudieron leer, se usan las de lib/images.ts:", err);
    return porDefecto();
  }
}

/** Todas, activas o no, en orden. Solo para el panel: sin caché. */
export async function todasLasSlides(): Promise<SlideAdmin[]> {
  const filas = (await db()`
    select id, image_url, image_path, alt, caption, focus, orden, activa
      from home_slides
     order by orden, creado_en
  `) as Fila[];

  return filas.map(deFila);
}

/** ¿La portada está tirando todavía de las láminas de lib/images.ts? */
export async function usandoLasDeSiempre(): Promise<boolean> {
  if (!hayBaseDeDatos()) return true;
  try {
    const filas = (await db()`select 1 from home_slides where activa limit 1`) as unknown[];
    return filas.length === 0;
  } catch {
    return true;
  }
}
