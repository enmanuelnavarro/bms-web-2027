import type { Jugador } from "@/lib/jugadores";

// Cuánto le falta a una ficha para estar presentable ante un club.
//
// No es una nota estética: es la lista de lo que un director deportivo mira
// antes de pedir información. Una ficha sin foto ni estadísticas no se
// consulta, por bueno que sea el jugador.
//
// Los pesos reflejan eso. La foto y las estadísticas valen más que el lugar de
// nacimiento porque son las que deciden si alguien sigue leyendo.

type Campo = {
  clave: string;
  etiqueta: string;
  peso: number;
  lleno: (j: Jugador) => boolean;
};

const CAMPOS: Campo[] = [
  { clave: "foto", etiqueta: "Fotografía", peso: 3, lleno: (j) => Boolean(j.foto) },
  {
    clave: "estadisticas",
    etiqueta: "Estadísticas",
    peso: 3,
    lleno: (j) => j.estadisticas_temporada.length > 0,
  },
  { clave: "posicion", etiqueta: "Posición", peso: 2, lleno: (j) => Boolean(j.posicion) },
  {
    clave: "fecha_nacimiento",
    etiqueta: "Fecha de nacimiento",
    peso: 2,
    lleno: (j) => Boolean(j.fecha_nacimiento),
  },
  { clave: "altura", etiqueta: "Altura", peso: 2, lleno: (j) => Boolean(j.altura_cm) },
  { clave: "equipo", etiqueta: "Equipo actual", peso: 2, lleno: (j) => Boolean(j.equipo_actual) },
  { clave: "bio", etiqueta: "Biografía", peso: 2, lleno: (j) => Boolean(j.bio) },
  {
    clave: "trayectoria",
    etiqueta: "Trayectoria",
    peso: 1,
    lleno: (j) => j.historial_equipos.length > 0,
  },
  { clave: "peso", etiqueta: "Peso", peso: 1, lleno: (j) => Boolean(j.peso_kg) },
  { clave: "liga", etiqueta: "Liga", peso: 1, lleno: (j) => Boolean(j.liga_actual) },
  { clave: "video", etiqueta: "Vídeo", peso: 1, lleno: (j) => j.videos_youtube.length > 0 },
  {
    clave: "album",
    etiqueta: "Álbum de fotos",
    peso: 1,
    lleno: (j) => j.fotos.filter((f) => f.publicada).length > 1,
  },
  {
    clave: "redes",
    etiqueta: "Redes sociales",
    peso: 1,
    lleno: (j) => Object.values(j.redes_sociales ?? {}).some(Boolean),
  },
];

const TOTAL = CAMPOS.reduce((n, c) => n + c.peso, 0);

export type Completitud = {
  /** 0 a 100. */
  porcentaje: number;
  faltan: string[];
};

export function completitud(j: Jugador): Completitud {
  let suma = 0;
  const faltan: string[] = [];

  for (const c of CAMPOS) {
    if (c.lleno(j)) suma += c.peso;
    else faltan.push(c.etiqueta);
  }

  return { porcentaje: Math.round((suma / TOTAL) * 100), faltan };
}
