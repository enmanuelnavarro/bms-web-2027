import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PlayerProfile from "./PlayerProfile";
import { SITE } from "@/lib/site";
import { nombreCompleto } from "@/lib/players";
import { jugadorPorSlug, jugadoresPublicados } from "@/lib/jugadores";

type Params = { params: Promise<{ id: string }> };

/** Prerenderiza las 35 fichas: son estáticas y así entran mejor en el índice. */
export async function generateStaticParams() {
  return (await jugadoresPublicados()).map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const player = await jugadorPorSlug(id);

  if (!player) {
    return { title: `Jugador no encontrado | ${SITE.shortName}` };
  }

  const nombre = nombreCompleto(player);
  const title = `${nombre} | ${SITE.shortName} Sport Agency`;

  // La descripción solo menciona equipo y posición si constan en la base.
  const detalle = [player.posicion, player.equipo_actual].filter(Boolean).join(", ");
  const description = detalle
    ? `Perfil profesional de ${nombre} (${detalle}), jugador representado por ${SITE.legalName}.`
    : `Perfil profesional de ${nombre}, jugador representado por ${SITE.legalName}.`;

  const url = `/jugadores/${player.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      locale: "es_DO",
      url,
      siteName: SITE.legalName,
      title,
      description,
      images: player.foto ? [{ url: player.foto, alt: nombre }] : undefined,
    },
  };
}

export default async function PlayerPage({ params }: Params) {
  const { id } = await params;
  const player = await jugadorPorSlug(id);

  if (!player) notFound();

  return <PlayerProfile player={player} />;
}
