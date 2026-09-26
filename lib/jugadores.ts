import "server-only";

import { unstable_cache } from "next/cache";

import { db, hayBaseDeDatos } from "@/lib/db";
import { PLAYERS } from "@/lib/players";
import type { Player, StatSeason, TeamHistory, VideoItem } from "@/lib/types";

// Los jugadores.
//
// Fuente: la tabla `players`. Si no hay base de datos, o está vacía, o la
// consulta falla, se sirve lib/players.json. El roster no puede desaparecer de
// la web porque falte una variable de entorno.
//
// Devuelve el **mismo tipo `Player`** que ya usaban las páginas, más lo que la
// base añade: el álbum de fotos y el estado de publicación. Así lib/players.ts
// sigue valiendo para todo lo derivado —edad, altura, etiqueta de estado— sin
// duplicar esos cálculos aquí.

export const ETIQUETA_JUGADORES = "jugadores";

export type Foto = {
  id: string;
  url: string;
  /** El archivo tal cual se subió, que es lo que un club se descarga. */
  url_original: string | null;
  bytes_original: number | null;
  ancho: number | null;
  alto: number | null;
  alt: string;
  tipo: "principal" | "cuerpo" | "accion" | "equipo";
  focus: string;
  publicada: boolean;
};

export type Jugador = Player & {
  /** Null en los que vienen del JSON. */
  uuid: string | null;
  bms_code: string | null;
  estado_publicacion: "borrador" | "publicado" | "archivado";
  destacado: boolean;
  orden: number;
  /** Álbum. La `principal` también está aquí. */
  fotos: Foto[];
};

type Fila = {
  id: string;
  slug: string;
  bms_id: string | null;
  bms_code: string | null;
  nombre: string;
  apellido: string;
  nacionalidad: string | null;
  fecha_nacimiento: string | Date | null;
  lugar_nacimiento: string | null;
  seleccion: string | null;
  altura_cm: number | null;
  altura_ft: string | null;
  peso_kg: string | number | null;
  peso_lb: string | number | null;
  posicion: string | null;
  posicion_codigo: string | null;
  tipo_jugador: string | null;
  estado: string | null;
  equipo_actual: string | null;
  liga_actual: string | null;
  pais: string | null;
  bio: string | null;
  source_name: string | null;
  source_url: string | null;
  estado_publicacion: "borrador" | "publicado" | "archivado";
  destacado: boolean;
  orden: number;
  fotos: Foto[] | null;
  carrera: TeamHistory[] | null;
  stats: StatSeason[] | null;
  videos: VideoItem[] | null;
  enlaces: Array<{ tipo: string; url: string }> | null;
};

const num = (v: string | number | null): number | null =>
  v === null ? null : typeof v === "number" ? v : Number(v);

const fecha = (v: string | Date | null): string | null =>
  v === null ? null : typeof v === "string" ? v.slice(0, 10) : v.toISOString().slice(0, 10);

function deFila(f: Fila): Jugador {
  const fotos = f.fotos ?? [];
  const principal = fotos.find((x) => x.tipo === "principal") ?? fotos[0];

  // Las redes vuelven al objeto que ya esperaban las páginas.
  const redes: Player["redes_sociales"] = {};
  for (const e of f.enlaces ?? []) {
    if (e.tipo === "instagram" || e.tipo === "twitter" || e.tipo === "facebook") {
      redes[e.tipo] = e.url;
    }
  }

  return {
    id: f.slug,
    uuid: f.id,
    bms_id: f.bms_id,
    bms_code: f.bms_code,
    nombre: f.nombre,
    apellido: f.apellido,
    foto: principal?.url ?? null,
    nacionalidad: f.nacionalidad,
    fecha_nacimiento: fecha(f.fecha_nacimiento),
    altura_cm: f.altura_cm,
    altura_ft: f.altura_ft,
    peso_kg: num(f.peso_kg),
    peso_lb: num(f.peso_lb),
    posicion: f.posicion,
    posicion_codigo: f.posicion_codigo,
    tipo_jugador: f.tipo_jugador,
    equipo_actual: f.equipo_actual,
    liga_actual: f.liga_actual,
    pais: f.pais,
    estado: f.estado,
    source: f.source_name && f.source_url ? { name: f.source_name, url: f.source_url } : null,
    lugar_nacimiento: f.lugar_nacimiento,
    seleccion: f.seleccion,
    bio: f.bio,
    redes_sociales: redes,
    historial_equipos: f.carrera ?? [],
    estadisticas_temporada: f.stats ?? [],
    videos_youtube: f.videos ?? [],
    estado_publicacion: f.estado_publicacion,
    destacado: f.destacado,
    orden: f.orden,
    fotos,
  };
}

/** Los del JSON, para cuando no hay nada en la base. */
function porDefecto(): Jugador[] {
  return PLAYERS.map((p, i) => ({
    ...p,
    uuid: null,
    bms_code: null,
    estado_publicacion: "publicado" as const,
    destacado: false,
    orden: i,
    fotos: p.foto
      ? [
          {
            id: `json-${p.id}`,
            url: p.foto,
            url_original: null,
            bytes_original: null,
            ancho: null,
            alto: null,
            alt: `${p.nombre} ${p.apellido}`.trim(),
            tipo: "principal" as const,
            focus: "50% 50%",
            publicada: true,
          },
        ]
      : [],
  }));
}

/**
 * Las subconsultas van con `array_agg` a jsonb en vez de con cinco consultas
 * por jugador: el roster entero en una ida y vuelta, no en 265.
 */
const SELECT = `
  select p.*,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'id', f.id, 'url', f.url, 'url_original', f.url_original,
        'bytes_original', f.bytes_original, 'ancho', f.ancho, 'alto', f.alto,
        'alt', f.alt, 'tipo', f.tipo, 'focus', f.focus, 'publicada', f.publicada
      ) order by (f.tipo = 'principal') desc, f.orden), '[]'::jsonb)
     from player_photos f where f.player_id = p.id and f.publicada) as fotos,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'temporada', c.temporada, 'equipo', c.equipo, 'liga', c.liga, 'pais', c.pais
      ) order by c.orden), '[]'::jsonb)
     from player_career c where c.player_id = p.id) as carrera,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'temporada', s.temporada, 'equipo', s.equipo, 'liga', s.competicion,
        'pj', s.pj, 'minutes', s.minutos, 'pts', s.pts, 'reb', s.reb, 'ast', s.ast,
        'rob', s.rob, 'tap', s.tap, 'fg', s.fg2_pct, 'three', s.fg3_pct, 'ft', s.ft_pct,
        'totales', s.totales
      ) order by s.orden), '[]'::jsonb)
     from player_stats s where s.player_id = p.id) as stats,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'titulo', v.titulo, 'youtube_id', v.video_id, 'url', v.url, 'tipo', v.tipo
      ) order by v.orden), '[]'::jsonb)
     from player_videos v where v.player_id = p.id) as videos,
    (select coalesce(jsonb_agg(jsonb_build_object('tipo', l.tipo, 'url', l.url) order by l.orden), '[]'::jsonb)
     from player_links l where l.player_id = p.id) as enlaces
  from players p
`;

const leePublicados = unstable_cache(
  async (): Promise<Jugador[] | null> => {
    const filas = (await db().query(
      `${SELECT} where p.estado_publicacion = 'publicado' order by p.orden, p.nombre`
    )) as Fila[];
    return filas.length ? filas.map(deFila) : null;
  },
  ["jugadores-publicados"],
  { tags: [ETIQUETA_JUGADORES] }
);

/** El roster público. Nunca lanza y nunca devuelve una lista vacía. */
export async function jugadoresPublicados(): Promise<Jugador[]> {
  if (!hayBaseDeDatos()) return porDefecto();
  try {
    return (await leePublicados()) ?? porDefecto();
  } catch (err) {
    console.error("[jugadores] no se pudieron leer, se usa lib/players.json:", err);
    return porDefecto();
  }
}

export async function jugadorPorSlug(slug: string): Promise<Jugador | undefined> {
  return (await jugadoresPublicados()).find((j) => j.id === slug);
}

/**
 * Para el escaparate de la portada. Manda lo marcado a mano en el panel; si
 * nadie ha marcado nada, se puntúa como antes: fotografía y estadísticas.
 */
export async function jugadoresDestacados(cuantos = 3): Promise<Jugador[]> {
  const todos = await jugadoresPublicados();
  const marcados = todos.filter((j) => j.destacado);
  if (marcados.length >= cuantos) return marcados.slice(0, cuantos);

  const puntua = (j: Jugador) =>
    (j.foto ? 2 : 0) + (j.estadisticas_temporada.length > 0 ? 1 : 0);

  const resto = todos
    .filter((j) => !j.destacado)
    .sort((a, b) => puntua(b) - puntua(a));

  return [...marcados, ...resto].slice(0, cuantos);
}

/** Valores distintos de un campo, para poblar los desplegables del listado. */
export async function valoresDeJugadores(
  campo: "posicion" | "pais" | "nacionalidad" | "estado"
): Promise<string[]> {
  const set = new Set<string>();
  for (const j of await jugadoresPublicados()) {
    const v = j[campo];
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

// --- Solo para el panel: sin caché, incluye borradores y archivados -------

export async function todosLosJugadores(): Promise<Jugador[]> {
  const filas = (await db().query(`${SELECT} order by p.orden, p.nombre`)) as Fila[];
  return filas.map(deFila);
}

export async function jugadorPorUuid(id: string): Promise<Jugador | null> {
  const filas = (await db().query(`${SELECT} where p.id = $1 limit 1`, [id])) as Fila[];
  return filas[0] ? deFila(filas[0]) : null;
}

/** ¿El roster sigue tirando de lib/players.json? */
export async function usandoElJsonDeJugadores(): Promise<boolean> {
  if (!hayBaseDeDatos()) return true;
  try {
    const filas = (await db()`select 1 from players limit 1`) as unknown[];
    return filas.length === 0;
  } catch {
    return true;
  }
}

/** Los catálogos del panel (estado, tipo de jugador). */
export async function catalogo(tipo: string): Promise<string[]> {
  try {
    const filas = (await db()`
      select valor from catalogos where tipo = ${tipo} and activo order by orden
    `) as Array<{ valor: string }>;
    return filas.map((f) => f.valor);
  } catch {
    return [];
  }
}
