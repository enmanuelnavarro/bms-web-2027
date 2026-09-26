import type { Metadata } from "next";

import NewsDirectory from "./NewsDirectory";
import { SITE } from "@/lib/site";
import { noticiasPublicadas } from "@/lib/noticias";

const DESCRIPTION = `Actualidad de ${SITE.legalName} y de los jugadores de baloncesto profesional que representa: fichajes, rendimiento en competición y compromisos con la selección.`;

export const metadata: Metadata = {
  title: `Noticias | ${SITE.shortName} Sport Agency`,
  description: DESCRIPTION,
  alternates: { canonical: "/noticias" },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "/noticias",
    siteName: SITE.legalName,
    title: `Noticias | ${SITE.shortName} Sport Agency`,
    description: DESCRIPTION,
  },
};

export default async function NoticiasPage() {
  return <NewsDirectory noticias={await noticiasPublicadas()} />;
}
