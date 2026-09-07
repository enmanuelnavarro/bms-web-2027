"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

const newsDatabase: Record<string, any> = {
  "victor-liz-lidera-lnb": {
    title: "Víctor Liz Lidera la Anotación en la Temporada de la LNB",
    date: "2026-06-28",
    category: "Jugador",
    image:
      "https://images.unsplash.com/photo-1504611828338-ce988e2c8b1d?w=1200&h=600&fit=crop",
    author: "BMS",
    content: `Víctor Liz continúa demostrando por qué es uno de los referentes del baloncesto dominicano. Con un promedio de 16.8 puntos y 6.4 rebotes por partido, el alero se ha consolidado como una de las máximas figuras ofensivas de la temporada en la Liga Nacional de Baloncesto.

Su capacidad para anotar desde múltiples posiciones y su liderazgo dentro de la cancha lo mantienen como una pieza clave para su equipo. "Víctor es un jugador de una entrega ejemplar. Su rendimiento habla por sí solo", comentó el equipo directivo de BMS.

Con esta temporada destacada, Víctor Liz reafirma su lugar entre los mejores aleros del país y refuerza su proyección hacia oportunidades en ligas internacionales.`,
  },
  "gelvis-solano-disponible": {
    title: "Gelvis Solano Disponible para la Próxima Temporada",
    date: "2026-06-25",
    category: "Agencia",
    image:
      "https://images.unsplash.com/photo-1546519638-68fa109ffbbe?w=1200&h=600&fit=crop",
    author: "BMS",
    content: `Gelvis Solano, base con amplia experiencia en la Liga Nacional de Baloncesto dominicana, se encuentra disponible para la próxima temporada. Con promedios de 14.2 puntos y 5.6 asistencias, su perfil como director de juego lo convierte en una opción atractiva para cualquier equipo.

Varios clubes ya han mostrado interés en incorporar al base a sus filas. Su visión de juego, capacidad de organización y experiencia son cualidades muy valoradas en el mercado actual.

"Gelvis está en un gran momento de su carrera y tiene mucho que aportar. Estamos gestionando las mejores opciones para él", señaló el equipo de BMS.`,
  },
  "andersson-garcia-marineros": {
    title: "Andersson García Brilla con los Marineros de Puerto Plata",
    date: "2026-06-20",
    category: "Jugador",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop",
    author: "BMS",
    content: `Andersson García, alero dominicano de 2.01m graduado de Texas A&M University en 2025, continúa mostrando su versatilidad con los Marineros de Puerto Plata en la Liga Nacional de Baloncesto. Con promedios de 14.6 puntos y 6.1 rebotes, se perfila como una de las piezas jóvenes más interesantes de la liga.

Su capacidad para anotar, rebotear y defender múltiples posiciones lo convierte en un perfil muy valorado de cara a futuras oportunidades internacionales. "Andersson tiene un techo altísimo. Su etapa universitaria en Estados Unidos lo preparó muy bien", señaló la dirección de BMS.

Desde la agencia se evalúan con calma las opciones para dar el siguiente paso en la carrera del jugador, tanto en el mercado local como en ligas del exterior.`,
  },
  "bms-talento-dominicano": {
    title: "BMS Impulsa el Talento Dominicano en el Baloncesto Profesional",
    date: "2026-06-15",
    category: "Agencia",
    image:
      "https://images.unsplash.com/photo-1546519638-68fa109ffbbe?w=1200&h=600&fit=crop",
    author: "BMS",
    content: `Con oficinas en República Dominicana y Miami, BMS continúa fortaleciendo su compromiso con el desarrollo del baloncesto dominicano. La agencia representa a jugadores en la Liga Nacional de Baloncesto, la LNBP y otras competiciones profesionales del continente.

El trabajo de BMS se centra en abrir oportunidades para el talento local, brindando asesoramiento integral en la gestión de carrera, negociación de contratos y proyección internacional de sus representados.

"Nuestro objetivo es que el talento dominicano tenga las mismas oportunidades que cualquier jugador del mundo. El éxito de nuestros representados es nuestro éxito", afirma la dirección de BMS.`,
  },
};

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const news = newsDatabase[slug];

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
          src={news.image}
          alt={news.title}
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
            {news.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gold mb-4 leading-tight">
            {news.title}
          </h1>
          <div className="flex gap-4 text-body/70 text-sm">
            <span>
              {new Date(news.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>Por {news.author}</span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <article className="prose prose-invert max-w-none">
            {news.content.split("\n\n").map((paragraph: string, idx: number) => (
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
