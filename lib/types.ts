export interface VideoItem {
  titulo: string;
  youtube_id: string;
  tipo: "highlights" | "jugadas_destacadas";
}

export interface StatSeason {
  temporada: string;
  equipo: string;
  liga: string;
  pj: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  rob: number;
  tap: number;
  fg_pct: number;
  three_pct: number;
  ft_pct: number;
}

export interface TeamHistory {
  temporada: string;
  equipo: string;
  liga: string;
  pais: string;
}

export interface Player {
  id: string;
  nombre: string;
  apellido: string;
  foto: string;
  nacionalidad: string;
  fecha_nacimiento: string;
  altura: string;
  peso: string;
  posicion: string;
  equipo_actual: string;
  liga_actual: string;
  disponibilidad: "disponible" | "bajo_contrato" | "en_negociacion";
  historial_equipos: TeamHistory[];
  estadisticas_temporada: StatSeason[];
  videos_youtube: VideoItem[];
  bio: string;
  redes_sociales: {
    instagram?: string;
    twitter?: string;
  };
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
