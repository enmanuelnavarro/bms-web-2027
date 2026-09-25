import { ExecutiveProfile } from "./types";

// El equipo de BMS — usado en /agencia y en /agencia/<slug>.
//
// Solo se publica lo que la agencia ha dado por bueno. Un perfil sin cifras no
// lleva cifras: la página se salta la sección en vez de rellenarla.
export const executiveProfiles: ExecutiveProfile[] = [
  {
    id: "frank-brito",
    nombre: "Frank Brito",
    cargo: "Gerente General",
    subtitulo: "Agente FIBA Certificado",
    foto: "/equipo/frank-brito.jpg",
    insignia: { titulo: "Agente FIBA", pie: "Certificado" },
    destacado:
      "El éxito de nuestros jugadores es nuestro éxito. Trabajamos no solo para asegurar contratos, sino para garantizar que cada jugador alcance su máximo potencial en una liga que respete su talento.",
    destacado_es_cita: true,
    bio_titulo: "Trayectoria",
    bio: "Con más de 20 años de experiencia en la industria del baloncesto profesional, Frank Brito ha consolidado su posición como uno de los agentes más respetados en América Latina. Como Agente FIBA Certificado, ha representado a más de 150 jugadores en diversos continentes, facilitando transferencias y acuerdos contractuales en las ligas más competitivas del mundo. Su dedicación al crecimiento de sus representados y su profundo conocimiento del mercado internacional del baloncesto han sido fundamentales para el éxito de BMS. Bajo su liderazgo, la agencia ha expandido significativamente su cartera de clientes y sus conexiones en las principales ligas profesionales.",
    logros: [
      { titulo: "Años de Experiencia", valor: "20+", icono: "⏱️" },
      { titulo: "Jugadores Representados", valor: "150+", icono: "🏀" },
    ],
    redes_sociales: {
      linkedin: "https://linkedin.com/in/frankbrito",
      instagram: "https://instagram.com/frankbrito.bms",
      twitter: "https://twitter.com/FrankBritoBMS",
    },
    email_contacto: "fbrito@bmsrd.com",
    telefono_contacto: "+1 (809) 781-5605",
    cta: { texto: "Contactar a BMS", href: "/contacto" },
    slug: "frank-brito",
  },
  {
    id: "enmanuel-navarro",
    nombre: "Enmanuel Navarro",
    cargo: "Director de Marketing",
    subtitulo: "Estrategia de marca y marketing deportivo",
    foto: "/equipo/enmanuel-navarro.jpg",
    destacado:
      "Conectar talento, marcas y oportunidades para impulsar la proyección de BMS y sus jugadores.",
    bio_titulo: "Perfil",
    bio: "Enmanuel Navarro es el director de marketing de BMS. Su labor se centra en fortalecer la identidad de la agencia y desarrollar estrategias de comunicación que acerquen a sus jugadores a marcas, patrocinadores y nuevas audiencias. Desde esta posición, orienta el posicionamiento de marca, la presencia digital y el desarrollo de iniciativas comerciales, con un enfoque en comunicar el valor de cada atleta dentro y fuera de la cancha.",
    etiquetas: {
      titulo: "Áreas de Enfoque",
      items: [
        "Estrategia de marketing",
        "Marca personal de jugadores",
        "Alianzas comerciales",
        "Patrocinios",
        "Comunicación",
        "Presencia digital",
      ],
    },
    email_contacto: "enavarro@bmsrd.com",
    telefono_contacto: "+1 (809) 963-4820",
    cta: { texto: "Contactar a Enmanuel", href: "mailto:enavarro@bmsrd.com" },
    slug: "enmanuel-navarro",
  },
];

export function getExecutive(slug: string): ExecutiveProfile | undefined {
  return executiveProfiles.find((e) => e.slug === slug);
}
