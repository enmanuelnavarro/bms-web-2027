// Imágenes de archivo (Unsplash) mientras no haya material fotográfico propio.
//
// TODAS las URLs de este fichero están comprobadas: devuelven 200. Las que había
// antes (photo-1546519638-68fa109ffbbe y compañía) daban 404 y dejaban la web
// llena de imágenes rotas.
//
// Al sustituirlas por fotos propias, sube los archivos a /public y cambia aquí
// las rutas: ningún componente referencia una URL de Unsplash directamente.

const U = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

// Identificadores verificados, con lo que muestra cada uno.
const PHOTOS = {
  /** Jugadores disputando un balón bajo el aro, blanco y negro. */
  action_bw: "1505666287802-931dc83948e9",
  /** Jugador botando a toda velocidad, barrido de movimiento. */
  drive_blur: "1639843091936-bb5fca7b5684",
  /** Equipo sobre la cancha con el público en la grada. */
  team_court: "1519766304817-4f37bda74a26",
  /** Pabellón profesional lleno durante un partido. */
  arena_crowd: "1533923156502-be31530547c4",
  /** Pabellón visto desde la grada alta, partido en juego. */
  arena_stands: "1563506644863-444710df1e03",
  /** Vista cenital de una arena con la iluminación encendida. */
  arena_aerial: "1504450758481-7338eba7524a",
  /** Pabellón en penumbra antes del partido. */
  arena_dark: "1626003573503-2e088d82c647",
  /** Manos sujetando un balón, plano de detalle. */
  ball_hands: "1653015503992-347de54a8125",
} as const;

export const STOCK_IMAGES = {
  hero: {
    basketball_action_1: U(PHOTOS.action_bw, 1920, 800),
    basketball_arena: U(PHOTOS.arena_crowd, 1920, 800),
    basketball_dunk: U(PHOTOS.arena_stands, 1920, 800),
    basketball_court_aerial: U(PHOTOS.arena_aerial, 1920, 800),
  },

  players: {
    placeholder_1: U(PHOTOS.action_bw, 400, 500),
    placeholder_2: U(PHOTOS.team_court, 400, 500),
    placeholder_3: U(PHOTOS.drive_blur, 400, 500),
  },

  aboutAgency: U(PHOTOS.arena_crowd, 1200, 600),
  contact: U(PHOTOS.ball_hands, 1200, 600),
  offices: U(PHOTOS.arena_aerial, 1200, 600),
  newsDefault: U(PHOTOS.arena_stands, 600, 400),
};

/**
 * Láminas del banner dinámico del hero.
 *
 * Los rótulos son genéricos a propósito: sobre una foto de archivo no se nombra
 * a un jugador real. Cuando lleguen las fotos propias, cambia `src` y `caption`.
 */
export const BANNER_SLIDES = [
  {
    src: "/banner/slide-1.jpg",
    alt: "Cuatro jugadores representados por BMS con la equipación de sus clubes",
    caption: "Talento BMS en las mejores ligas del mundo",
    // Composición con cuatro caras en el tercio superior: se ancla arriba para
    // que el recorte apaisado de escritorio no las decapite.
    focus: "50% 12%",
  },
  {
    src: U(PHOTOS.action_bw, 1400, 1000),
    alt: "Jugadores disputando un balón bajo el aro",
    caption: "Talento disponible para la próxima temporada",
  },
  {
    src: U(PHOTOS.drive_blur, 1400, 1000),
    alt: "Jugador botando el balón a toda velocidad",
    caption: "Perfiles contrastados en ligas FIBA",
  },
  {
    src: U(PHOTOS.team_court, 1400, 1000),
    alt: "Equipo de baloncesto sobre la cancha durante un partido",
    caption: "Presencia en más de 20 países",
  },
  {
    src: U(PHOTOS.arena_crowd, 1400, 1000),
    alt: "Pabellón profesional lleno de público",
    caption: "Scouting y vídeo a petición del club",
  },
  {
    src: U(PHOTOS.ball_hands, 1400, 1000),
    alt: "Manos de un jugador sujetando el balón",
    caption: "Trámites FIBA y visados resueltos",
  },
] as const;

// Colores de marca BMS
export const BRAND_COLORS = {
  primary: "#FF6B35", // Naranja vibrante
  accent: "#FFB700", // Dorado
  dark: "#0F1117",
  darkAlt: "#1A1A1A",
  accent2: "#00D9FF", // Cyan
};
