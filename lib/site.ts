// Información REAL de la agencia — extraída de https://www.bmssportsagency.com
// Fuente única de verdad para datos corporativos.

export const SITE = {
  name: "Basket Manager Sport",
  legalName: "BMS · Basket Manager Sport",
  shortName: "BMS",
  tagline: "A Company You Can Trust",
  domain: "bmsrd.com",
  url: "https://www.bmsrd.com",
  taglineEs: "Una empresa en la que puedes confiar",
  founded: 2009,
  fibaLicense: "2014501744",
  mission:
    "En BMS nos dedicamos a transformar la vida de jugadores y entrenadores de baloncesto, representándolos para conseguir contratos favorables y expandir sus carreras hacia diversos mercados globales.",
  about:
    "Agencia deportiva premier dedicada a la representación, el desarrollo y la gestión de atletas profesionales, con foco principal en el baloncesto. Con licencia FIBA y sede en Miami y República Dominicana, somos una de las agencias deportivas líderes en América Latina.",
  phone: "+1 (809) 781-5605",
  phoneHref: "+18097815605",
  email: "players@bmsrd.com",
  infoEmail: "info@bmsrd.com",
  whatsapp: "+1 (809) 781-5605",
  whatsappHref: "18097815605",
  offices: {
    miami: {
      label: "Miami, Florida",
      address: "55 NE 5th St, Miami, FL 33132, USA",
      phone: "+1 (305) 926-4480",
      phoneHref: "+13059264480",
    },
    rd: {
      label: "República Dominicana",
      address: "La Vega, Rep. Dom.",
      phone: "+1 (809) 781-5605",
      phoneHref: "+18097815605",
    },
  },
  /** Usuario de Instagram sin la arroba — fuente única para enlaces y feed. */
  instagramHandle: "bmsrdagency",
  social: {
    facebook: "https://facebook.com/bmsrdagency",
    twitter: "https://twitter.com/bmsrdagency",
    youtube: "https://youtube.com/@bmsrdagency",
    instagram: "https://instagram.com/bmsrdagency",
  },
} as const;

// Los 6 servicios REALES publicados en el sitio del cliente.
export const SERVICES = [
  {
    icon: "📄",
    title: "Negociación y Procuración de Contratos",
    text: "Negociamos contratos con equipos —salarios, bonos, incentivos y duración— representando al atleta ante ligas y clubes para asegurar una compensación justa y sus protecciones.",
  },
  {
    icon: "🤝",
    title: "Patrocinios y Acuerdos Comerciales",
    text: "Identificamos y aseguramos contratos de patrocinio con marcas, gestionando apariciones en medios y campañas para maximizar el valor de tu marca personal.",
  },
  {
    icon: "📊",
    title: "Planificación Financiera y Patrimonial",
    text: "Asesoría en presupuesto, inversiones, planificación fiscal y estrategias de retiro para navegar una carrera deportiva a menudo corta.",
  },
  {
    icon: "⚖️",
    title: "Asesoría Legal y Cumplimiento",
    text: "Gestión de disputas, derechos de imagen y nombre, cumplimiento de normas de liga, certificaciones y gestión de riesgos.",
  },
  {
    icon: "📣",
    title: "Marketing y Gestión de Marca",
    text: "Construimos tu imagen pública mediante redes sociales, relaciones públicas y medios, apalancando tu popularidad en nuevos proyectos.",
  },
  {
    icon: "📈",
    title: "Desarrollo de Carrera y Reclutamiento",
    text: "Acompañamos la progresión de la carrera —del draft a la agencia libre— con consejo en entrenamiento, psicología deportiva y transición post-carrera.",
  },
] as const;
