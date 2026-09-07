"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

const newsDatabase = [
  {
    id: 1,
    title: "Víctor Liz Lidera la Anotación en la Temporada de la LNB",
    slug: "victor-liz-lidera-lnb",
    date: "2026-06-28",
    category: "Jugador",
    image:
      "https://images.unsplash.com/photo-1504611828338-ce988e2c8b1d?w=800&h=400&fit=crop",
    excerpt:
      "El alero dominicano se mantiene entre los máximos anotadores con un promedio de 16.8 puntos por partido",
    content:
      "Víctor Liz continúa demostrando por qué es uno de los referentes del baloncesto dominicano. Con un promedio de 16.8 puntos y 6.4 rebotes, el alero se ha consolidado como una pieza clave para su equipo esta temporada...",
  },
  {
    id: 2,
    title: "Gelvis Solano Disponible para la Próxima Temporada",
    slug: "gelvis-solano-disponible",
    date: "2026-06-25",
    category: "Agencia",
    image:
      "https://images.unsplash.com/photo-1546519638-68fa109ffbbe?w=800&h=400&fit=crop",
    excerpt: "El base dominicano queda disponible y varios equipos ya han mostrado interés en su fichaje",
    content:
      "Gelvis Solano, base con amplia experiencia en la LNB dominicana, se encuentra disponible para la próxima temporada. Con promedios de 14.2 puntos y 5.6 asistencias, su llegada representa una oportunidad para cualquier equipo que busque dirección en la cancha...",
  },
  {
    id: 3,
    title: "Andersson García Brilla con los Marineros de Puerto Plata",
    slug: "andersson-garcia-marineros",
    date: "2026-06-20",
    category: "Jugador",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    excerpt: "El alero graduado de Texas A&M se consolida en la LNB dominicana con sólidos promedios",
    content:
      "Andersson García, alero dominicano de 2.01m graduado de Texas A&M University, continúa mostrando su versatilidad con los Marineros de Puerto Plata en la LNB. Con 14.6 puntos y 6.1 rebotes de promedio, el jugador representado por BMS se perfila como una de las piezas jóvenes más interesantes de la liga...",
  },
  {
    id: 4,
    title: "BMS Impulsa el Talento Dominicano en el Baloncesto Profesional",
    slug: "bms-talento-dominicano",
    date: "2026-06-15",
    category: "Agencia",
    image:
      "https://images.unsplash.com/photo-1546519638-68fa109ffbbe?w=800&h=400&fit=crop",
    excerpt: "La agencia consolida su rol como puente entre el talento dominicano y las oportunidades internacionales",
    content:
      "Con oficinas en República Dominicana y Miami, BMS continúa fortaleciendo su compromiso con el desarrollo del baloncesto dominicano. La agencia representa a jugadores en la LNB, la LNBP y otras competiciones profesionales del continente...",
  },
];

export default function NewsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = useMemo(() => {
    return newsDatabase.filter((item) => {
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchTerm]);

  const categories = ["all", ...new Set(newsDatabase.map((n) => n.category))];

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HEADER EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">04</span>
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">04</span> Actualidad
          </div>
          <h1 className="headline-lg text-gold">Noticias</h1>
          <p className="text-lg text-body max-w-2xl">
            Últimas novedades de BMS — Basket Manager Sport y nuestros jugadores.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="sticky top-20 bg-ink/95 backdrop-blur-sm border-b border-hairline py-6 px-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BÚSQUEDA */}
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-elevated border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold"
            />

            {/* CATEGORÍA */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-elevated border border-hairline rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-elevated">
                  {cat === "all" ? "Todas las categorías" : cat}
                </option>
              ))}
            </select>

            {/* RESULTADOS */}
            <div className="text-body/70 flex items-center">
              {filteredNews.length} resultado{filteredNews.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE NOTICIAS */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body/70 text-lg">
                No se encontraron noticias con esos filtros
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNews.map((news) => (
                <Link key={news.id} href={`/noticias/${news.slug}`}>
                  <div className="group card-dark hover:border-gold transition rounded-2xl overflow-hidden cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                      {/* IMAGEN */}
                      <div className="relative h-48 md:h-auto overflow-hidden bg-ink">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>

                      {/* CONTENIDO */}
                      <div className="md:col-span-3 p-8 flex flex-col justify-center">
                        <span className="inline-block w-fit px-3 py-1 bg-gold text-ink font-bold text-xs rounded mb-4">
                          {news.category}
                        </span>
                        <h2 className="text-2xl font-bold text-gold group-hover:text-gold-light transition mb-4">
                          {news.title}
                        </h2>
                        <p className="text-body/80 mb-5">{news.excerpt}</p>
                        <div className="flex justify-between items-center text-sm text-body/60">
                          <span>
                            {new Date(news.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-gold font-bold group-hover:text-gold-light">
                            Leer más →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
