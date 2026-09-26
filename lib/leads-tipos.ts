// Tipos y catálogos de los contactos.
//
// Van aquí y no en lib/leads.ts porque la bandeja del panel es un componente
// de cliente: si importara las constantes de aquel módulo, arrastraría
// "server-only" y la conexión a Postgres al navegador, y la build falla.
//
// Aquí no hay nada que ejecutar: solo tipos y etiquetas.

export const ESTADOS = [
  "nuevo",
  "contactado",
  "en_negociacion",
  "cerrado",
  "descartado",
] as const;

export type EstadoLead = (typeof ESTADOS)[number];

export const ETIQUETA_ESTADO: Record<EstadoLead, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  cerrado: "Cerrado",
  descartado: "Descartado",
};

export type Lead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  asunto: string | null;
  mensaje: string;
  oficina: string | null;
  player_slug: string | null;
  estado: EstadoLead;
  notas: string | null;
  email_enviado: boolean;
  email_error: string | null;
  creado_en: string;
};
