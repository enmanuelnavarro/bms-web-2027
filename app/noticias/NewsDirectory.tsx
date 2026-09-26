"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import NewsImage from "@/components/NewsImage";
import { fechaLarga } from "@/lib/news";
import type { Noticia } from "@/lib/noticias";

// Las noticias llegan por props desde la página, que las lee de la base de
// datos. Antes se importaba lib/news.json aquí; ahora este componente solo
// filtra y pinta.
export default function NewsDirectory({ noticias }: { noticias: Noticia[] }) {
  const CATEGORIAS = [...new Set(noticias.map((n) => n.categoria).filter(Boolean))];
  const [categoria, setCategoria] = useState("all");
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return noticias.filter((n) => {
      const coincideCategoria = categoria === "all" || n.categoria === categoria;
      const coincideBusqueda =
        termino === "" ||
        n.titulo.toLowerCase().includes(termino) ||
        n.resumen.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoria, busqueda, noticias]);

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HEADER EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">Actualidad</div>
          <h1 className="headline-lg text-gold">Noticias</h1>
          <p className="text-lg text-body max-w-2xl">
            Últimas novedades de BMS — Basket Manager Sport y nuestros jugadores.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="sticky top-20 bg-ink/95 backdrop-blur-sm border-b border-hairline py-6 px-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="buscar-noticia" className="sr-only">
                Buscar noticias por título o resumen
              </label>
              <input
                id="buscar-noticia"
                type="search"
                placeholder="Buscar noticias..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 bg-elevated border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label htmlFor="categoria-noticia" className="sr-only">
                Filtrar por categoría
              </label>
              <select
                id="categoria-noticia"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 bg-elevated border border-hairline rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="all" className="bg-elevated">
                  Todas las categorías
                </option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat} className="bg-elevated">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* LISTADO */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {filtradas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body/70 text-lg">No se encontraron noticias con esos filtros</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtradas.map((n) => (
                <Link
                  key={n.slug}
                  href={`/noticias/${n.slug}`}
                  className="group block card-dark hover:border-gold transition rounded-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    <div className="relative h-48 md:h-auto md:min-h-[14rem] overflow-hidden bg-ink">
                      <NewsImage
                        src={n.imagen}
                        alt={n.imagen_alt ?? n.titulo}
                        focus={n.imagen_focus}
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="md:col-span-3 p-8 flex flex-col justify-center">
                      <span className="inline-block w-fit px-2.5 py-1 border border-hairline text-gold text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                        {n.categoria}
                      </span>
                      <h2 className="text-2xl font-bold text-gold group-hover:text-gold-light transition mb-4">
                        {n.titulo}
                      </h2>
                      <p className="text-body/80 mb-5">{n.resumen}</p>
                      <div className="flex justify-between items-center gap-4 text-sm text-body/60">
                        <span>{fechaLarga(n.fecha)}</span>
                        <span className="text-gold font-bold group-hover:text-gold-light whitespace-nowrap">
                          Leer más →
                        </span>
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
