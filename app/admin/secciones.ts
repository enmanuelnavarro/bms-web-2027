// Las secciones del panel, en un solo sitio.
//
// El menú lateral y la portada del panel leen de aquí, así que añadir una
// sección nueva es añadir una línea: no hay que tocar la navegación.
//
// `lista: false` la enseña en gris como "en camino". Es a propósito —desde
// dentro se ve qué falta— y se quita al construirla.

export type Seccion = {
  href: string;
  titulo: string;
  texto: string;
  /** Nombre del icono en `Icono`. */
  icono: string;
  lista: boolean;
};

export const SECCIONES: Seccion[] = [
  {
    href: "/admin",
    titulo: "Panel",
    texto: "Resumen de la web.",
    icono: "panel",
    lista: true,
  },
  {
    href: "/admin/banners",
    titulo: "Banners",
    texto: "Las láminas del carrusel de portada.",
    icono: "imagen",
    lista: true,
  },
  {
    href: "/admin/noticias",
    titulo: "Noticias",
    texto: "Crear y publicar noticias.",
    icono: "noticia",
    lista: true,
  },
  {
    href: "/admin/jugadores",
    titulo: "Jugadores",
    texto: "Publicar y editar representados.",
    icono: "jugador",
    lista: true,
  },
  {
    href: "/admin/contactos",
    titulo: "Contactos",
    texto: "Bandeja de mensajes del formulario.",
    icono: "sobre",
    lista: true,
  },
];
