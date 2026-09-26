import type { Metadata } from "next";

import ContactContent, { type JugadorConsultado } from "./ContactContent";
import { SITE } from "@/lib/site";
import { nombreCompleto } from "@/lib/players";
import { jugadorPorSlug } from "@/lib/jugadores";

const DESCRIPTION = `Contacta con ${SITE.legalName}: oficinas en Miami y República Dominicana. Agencia con licencia FIBA para representación de jugadores de baloncesto profesional.`;

export const metadata: Metadata = {
  title: `Contacto | ${SITE.shortName} Sport Agency`,
  description: DESCRIPTION,
  alternates: { canonical: "/contacto" },
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ jugador?: string }>;
}) {
  const { jugador: slug } = await searchParams;

  // El botón "Solicitar información" de cada ficha llega con ?jugador=<slug>.
  // Solo se acepta si el slug existe: así no se puede inyectar un nombre
  // arbitrario en el correo que recibe la agencia.
  const player = slug ? await jugadorPorSlug(slug) : undefined;
  const jugador: JugadorConsultado | null = player
    ? {
        id: player.id,
        nombre: nombreCompleto(player),
        href: `/jugadores/${player.id}`,
      }
    : null;

  return <ContactContent jugador={jugador} />;
}
