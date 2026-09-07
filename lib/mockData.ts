import { ExecutiveProfile } from "./types";

// Perfil ejecutivo — usado en /agencia/frank-brito
// NOTA: email y teléfono son placeholders pendientes de completar por BMS.
export const executiveProfiles: ExecutiveProfile[] = [
  {
    id: "frank-brito",
    nombre: "Frank Brito",
    cargo: "Gerente General",
    certificacion: "Agente FIBA Certificado",
    foto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
    bio: "Con más de 20 años de experiencia en la industria del baloncesto profesional, Frank Brito ha consolidado su posición como uno de los agentes más respetados en América Latina. Como Agente FIBA Certificado, ha representado a más de 150 jugadores en diversos continentes, facilitando transferencias y acuerdos contractuales en las ligas más competitivas del mundo. Su dedicación al crecimiento de sus representados y su profundo conocimiento del mercado internacional del baloncesto han sido fundamentales para el éxito de BMS. Bajo su liderazgo, la agencia ha expandido significativamente su cartera de clientes y sus conexiones en las principales ligas profesionales.",
    cita_destacada:
      "El éxito de nuestros jugadores es nuestro éxito. Trabajamos no solo para asegurar contratos, sino para garantizar que cada jugador alcance su máximo potencial en una liga que respete su talento.",
    anios_experiencia: 20,
    jugadores_gestionados: 150,
    paises_experiencia: [
      "República Dominicana",
      "Estados Unidos",
      "España",
      "México",
      "Argentina",
      "Brasil",
      "Colombia",
      "Puerto Rico",
    ],
    logros: [
      {
        titulo: "Años de Experiencia",
        valor: "20+",
        icono: "⏱️",
      },
      {
        titulo: "Jugadores Representados",
        valor: "150+",
        icono: "🏀",
      },
      {
        titulo: "Países de Operación",
        valor: "8",
        icono: "🌍",
      },
      {
        titulo: "Jugadores en NBA",
        valor: "12+",
        icono: "🏆",
      },
    ],
    redes_sociales: {
      linkedin: "https://linkedin.com/in/frankbrito",
      instagram: "https://instagram.com/frankbrito.bms",
      twitter: "https://twitter.com/FrankBritoBMS",
    },
    email_contacto: "contact@bmsagency.net",
    telefono_contacto: "+1 (809) 781-5605",
    slug: "frank-brito",
  },
];
