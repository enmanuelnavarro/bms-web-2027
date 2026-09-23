export interface VideoItem {
  titulo: string;
  /** Identificador de YouTube. Para Vimeo u otra fuente, usa `url`. */
  youtube_id?: string;
  /** URL completa: sirve para Vimeo o cualquier alojamiento externo. */
  url?: string;
  tipo?: "highlights" | "jugadas_destacadas" | "partido" | "entrevista";
}

/**
 * Promedios de una temporada. Las claves coinciden con las que escribe el
 * importador y con las que devuelve /api/players/[id]/stats.
 */
export interface StatSeason {
  temporada: string;
  equipo: string;
  /** Competición, p. ej. "Puerto Rico-BSN". */
  liga: string;
  pj: number;
  minutes: number;
  pts: number;
  reb: number;
  ast: number;
  rob: number;
  tap: number;
  /** Porcentaje de tiros de 2, ya en número (63.3, no "63.3%"). */
  fg: number;
  three: number;
  ft: number;
  /** Acumulados, si la fuente los da. Hacen falta para la media de carrera. */
  totales?: {
    min: number;
    pts: number;
    fg2m: number;
    fg2a: number;
    fg3m: number;
    fg3a: number;
    ftm: number;
    fta: number;
  } | null;
}

export interface TeamHistory {
  temporada: string;
  equipo: string;
  liga: string;
  pais: string;
}

/**
 * Ficha del jugador en una web de referencia (LatinBasket o Eurobasket). Es un
 * enlace de consulta: la web sirve siempre sus propios datos, nunca depende de
 * leer la fuente en cada visita.
 */
export interface PlayerSource {
  name: string;
  url: string;
}

/**
 * Un jugador de la agencia. Lo genera scripts/import-players.mjs desde el
 * Excel de BMS; el acceso va por lib/players.ts, no por el JSON.
 *
 * Todo lo que puede faltar es `null` a propósito: la ficha se adapta y no se
 * rellena con datos inventados.
 */
export interface Player {
  /** Slug, y a la vez la URL: /jugadores/<id>. */
  id: string;
  /** Identificador de la base de la agencia, p. ej. "BMS-002". */
  bms_id: string | null;
  nombre: string;
  apellido: string;
  /** Ruta en /public. Null si aún no hay fotografía propia. */
  foto: string | null;
  nacionalidad: string | null;
  fecha_nacimiento: string | null;
  altura_cm: number | null;
  altura_ft: string | null;
  peso_kg: number | null;
  peso_lb: number | null;
  /** Posición en castellano, p. ej. "Escolta / Alero". */
  posicion: string | null;
  /** Código original del Excel, p. ej. "SG/SF". */
  posicion_codigo: string | null;
  /** "Nacional" o "Importado". */
  tipo_jugador: string | null;
  equipo_actual: string | null;
  liga_actual: string | null;
  pais: string | null;
  /** Estado tal cual lo publica la base: "Activo", "Disponible"… */
  estado: string | null;
  source: PlayerSource | null;
  lugar_nacimiento: string | null;
  seleccion: string | null;
  bio: string | null;
  redes_sociales: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  historial_equipos: TeamHistory[];
  estadisticas_temporada: StatSeason[];
  videos_youtube: VideoItem[];
}

export interface News {
  id: string;
  titulo: string;
  fecha: string;
  categoria: string;
  jugadores_relacionados: string[];
  imagen_portada: string;
  resumen: string;
  contenido: string;
  autor: string;
  slug: string;
}

export interface ExecutiveProfile {
  id: string;
  nombre: string;
  cargo: string;
  certificacion: string;
  foto: string;
  bio: string;
  cita_destacada: string;
  anios_experiencia: number;
  jugadores_gestionados: number;
  paises_experiencia: string[];
  logros: Array<{
    titulo: string;
    valor: string | number;
    icono?: string;
  }>;
  redes_sociales: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  email_contacto?: string;
  telefono_contacto?: string;
  slug: string;
}
