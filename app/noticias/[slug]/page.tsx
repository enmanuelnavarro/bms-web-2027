"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import newsData from "@/lib/news.json";

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const news = newsData.find((n) => n.slug === slug);

  if (!news) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black text-gold mb-4">Noticia no encontrada</h1>
          <Link href="/noticias" className="text-gold-light font-bold hover:text-gold">
            ← Volver a noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HERO CON IMAGEN */}
      <section className="relative h-96 overflow-hidden border-b border-hairline">
        <Image
          src={news.imagen}
          alt={news.titulo}
          fill
          className="object-cover opacity-60 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30"></div>

        {/* CONTENIDO HERO */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Link href="/noticias" className="text-body/80 hover:text-gold mb-4 block">
            ← Volver a noticias
          </Link>
          <span className="inline-block px-3 py-1 bg-gold text-ink font-bold text-sm rounded mb-4">
            {news.categoria}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gold mb-4 leading-tight">
            {news.titulo}
          </h1>
          <div className="flex gap-4 text-body/70 text-sm">
            <span>
              {new Date(news.fecha).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>Por {news.autor}</span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <article className="prose prose-invert max-w-none">
            {news.contenido.split("\n\n").map((paragraph: string, idx: number) => (
              <p
                key={idx}
                className="text-body text-lg leading-relaxed mb-7"
              >
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-elevated border-y border-hairline mt-12">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-lg md:text-xl font-bold text-gold mb-5">
            ¿Interesado en nuestros jugadores?
          </h2>
          <p className="text-body mb-10">
            Explora nuestro directorio completo de jugadores representados
          </p>
          <Link href="/jugadores" className="btn-gold">
            Ver Jugadores
          </Link>
        </div>
      </section>
    </main>
  );
}
