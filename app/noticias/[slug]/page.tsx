import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import NewsImage from "@/components/NewsImage";
import { fechaLarga } from "@/lib/news";
import { noticiaPorSlug, noticiasPublicadas } from "@/lib/noticias";
import { getPlayer, nombreCompleto } from "@/lib/players";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

/** Prerenderiza las fichas: son estáticas y así entran mejor en el índice. */
export async function generateStaticParams() {
  return (await noticiasPublicadas()).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const noticia = await noticiaPorSlug(slug);

  if (!noticia) {
    return { title: `Noticia no encontrada | ${SITE.shortName}` };
  }

  const title = `${noticia.titulo} | ${SITE.shortName} Sport Agency`;
  const url = `/noticias/${noticia.slug}`;

  return {
    title,
    description: noticia.resumen,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "es_DO",
      url,
      siteName: SITE.legalName,
      title,
      description: noticia.resumen,
      publishedTime: noticia.fecha,
      images: noticia.imagen
        ? [{ url: noticia.imagen, alt: noticia.imagen_alt ?? noticia.titulo }]
        : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const noticia = await noticiaPorSlug(slug);

  if (!noticia) notFound();

  // Solo se enlaza al jugador si sigue en el roster: un enlace a una ficha que
  // ya no existe es peor que no tener enlace.
  // La noticia puede llevar varios jugadores; se filtran los que ya no estén
  // en el roster para no dejar un enlace roto.
  const relacionados = noticia.jugadores.map(getPlayer).filter((p) => p !== undefined);

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HERO
          La fotografía se ve, no se insinúa. Antes iba en opacity-60 y
          grayscale, como textura de fondo: con fotos de archivo tenía sentido,
          pero ahora la agencia sube la foto real del protagonista y esconderla
          es tirar el trabajo. Se sirve a todo color y el degradado se concentra
          abajo, que es donde cae el titular y donde hace falta contraste.

          El punto de recorte lo elige quien sube la foto desde el panel, así
          que una cabecera tan apaisada ya no corta cabezas. */}
      <section className="relative h-[22rem] md:h-[30rem] overflow-hidden border-b border-hairline isolate">
        <NewsImage
          src={noticia.imagen}
          alt={noticia.imagen_alt ?? noticia.titulo}
          focus={noticia.imagen_focus}
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/10" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-pro py-8">
            <Link href="/noticias" className="link-arrow text-body/80 hover:text-gold mb-5 flex w-fit">
              <span className="rotate-180 arrow">→</span> Volver a noticias
            </Link>
            <span className="inline-block px-2.5 py-1 border border-hairline bg-ink/60 text-gold text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              {noticia.categoria}
            </span>
            <h1 className="headline-lg text-gold max-w-4xl mb-4">{noticia.titulo}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-body/70 text-sm">
              <time dateTime={noticia.fecha}>{fechaLarga(noticia.fecha)}</time>
              <span>Por {noticia.autor}</span>
              {noticia.credito_imagen && (
                <span className="text-body/50">{noticia.credito_imagen}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CUERPO */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xl text-gold-light font-semibold leading-relaxed mb-10">
            {noticia.resumen}
          </p>

          {/* El cuerpo es HTML del editor visual del panel. Se sanea SIEMPRE al
              guardarlo (lib/admin/html.ts), nunca aquí: lo que hay en la base
              es seguro por construcción y esta página no tiene que acordarse. */}
          <article
            className="prose-noticia text-body text-lg"
            dangerouslySetInnerHTML={{ __html: noticia.contenido_html }}
          />

          {relacionados.length > 0 && (
            <div className="mt-12 pt-8 border-t border-hairline">
              <p className="text-xs font-bold text-gold-dark uppercase tracking-[0.2em] mb-3">
                {relacionados.length === 1 ? "Jugador relacionado" : "Jugadores relacionados"}
              </p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {relacionados.map((j) => (
                  <li key={j.id}>
                    <Link
                      href={`/jugadores/${j.id}`}
                      className="link-arrow text-gold-light text-lg border-b-2 border-gold pb-1"
                    >
                      {nombreCompleto(j)} <span className="arrow">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Crédito de la fuente: discreto, pero siempre comprobable. */}
          <p className="mt-12 text-sm text-body/60">
            Fuente:{" "}
            <a
              href={noticia.fuente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light underline underline-offset-4 transition"
            >
              {noticia.fuente.nombre}
            </a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-elevated border-y border-hairline">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-lg md:text-xl font-bold text-gold mb-5">
            ¿Interesado en nuestros jugadores?
          </h2>
          <p className="text-body mb-10">
            Explora el directorio completo de jugadores representados por BMS.
          </p>
          <Link href="/jugadores" className="btn-gold">
            Ver jugadores
          </Link>
        </div>
      </section>
    </main>
  );
}
