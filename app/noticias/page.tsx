"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import newsDatabase from "@/lib/news.json";

export default function NewsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = useMemo(() => {
    return newsDatabase.filter((item) => {
      const matchesCategory = filterCategory === "all" || item.categoria === filterCategory;
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resumen.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchTerm]);

  const categories = ["all", ...new Set(newsDatabase.map((n) => n.categoria))];

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
                          src={news.imagen}
                          alt={news.titulo}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>

                      {/* CONTENIDO */}
                      <div className="md:col-span-3 p-8 flex flex-col justify-center">
                        <span className="inline-block w-fit px-3 py-1 bg-gold text-ink font-bold text-xs rounded mb-4">
                          {news.categoria}
                        </span>
                        <h2 className="text-2xl font-bold text-gold group-hover:text-gold-light transition mb-4">
                          {news.titulo}
                        </h2>
                        <p className="text-body/80 mb-5">{news.resumen}</p>
                        <div className="flex justify-between items-center text-sm text-body/60">
                          <span>
                            {new Date(news.fecha).toLocaleDateString("es-ES", {
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
