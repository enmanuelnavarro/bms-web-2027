import type { Metadata } from "next";

import PlayersDirectory from "./PlayersDirectory";
import { PLAYERS } from "@/lib/players";
import { SITE } from "@/lib/site";

const DESCRIPTION = `Roster de ${PLAYERS.length} jugadores de baloncesto profesional representados por ${SITE.legalName}. Posición, equipo actual, estadísticas y trayectoria de cada jugador.`;

export const metadata: Metadata = {
  title: `Jugadores | ${SITE.shortName} Sport Agency`,
  description: DESCRIPTION,
  alternates: { canonical: "/jugadores" },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "/jugadores",
    siteName: SITE.legalName,
    title: `Jugadores | ${SITE.shortName} Sport Agency`,
    description: DESCRIPTION,
  },
};

export default function JugadoresPage() {
  return <PlayersDirectory />;
}
