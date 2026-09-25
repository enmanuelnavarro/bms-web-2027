import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PerfilEjecutivo from "@/components/PerfilEjecutivo";
import { SITE } from "@/lib/site";
import { executiveProfiles, getExecutive } from "@/lib/mockData";

type Params = { params: Promise<{ slug: string }> };

/** Una ruta por persona del equipo: /agencia/frank-brito, /agencia/enmanuel-navarro. */
export function generateStaticParams() {
  return executiveProfiles.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const perfil = getExecutive(slug);

  if (!perfil) {
    return { title: `Perfil no encontrado | ${SITE.shortName}` };
  }

  const title = `${perfil.nombre} — ${perfil.cargo} | ${SITE.shortName} Sports Agency`;
  const description = `${perfil.nombre}, ${perfil.cargo.toLowerCase()} de ${SITE.legalName}. ${perfil.subtitulo}.`;
  const url = `/agencia/${perfil.slug}`;

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
      images: [{ url: perfil.foto, alt: perfil.nombre }],
    },
  };
}

export default async function PerfilPage({ params }: Params) {
  const { slug } = await params;
  const perfil = getExecutive(slug);

  if (!perfil) notFound();

  return <PerfilEjecutivo perfil={perfil} />;
}
