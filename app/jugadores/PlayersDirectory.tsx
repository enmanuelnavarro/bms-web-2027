"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { STOCK_IMAGES } from "@/lib/images";
import {
  ESTADO_ESTILOS,
  contextoEquipo,
  estadoKey,
  fotoDe,
  nombreCompleto,
} from "@/lib/players";
import type { Jugador } from "@/lib/jugadores";

const TODOS = "all";

// Los jugadores llegan por props desde la página, que los lee de la base de
// datos. Este componente solo filtra y pinta.
export default function PlayersDirectory({ jugadores }: { jugadores: Jugador[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [posicion, setPosicion] = useState(TODOS);
  const [pais, setPais] = useState(TODOS);
  const [estado, setEstado] = useState(TODOS);

  // Las opciones salen de la propia base: si mañana entra una posición nueva
  // desde el Excel, aparece en el desplegable sin tocar este fichero.
  const unicos = (campo: "posicion" | "pais" | "estado") =>
    [...new Set(jugadores.map((p) => p[campo]).filter(Boolean) as string[])].sort((a, b) =>
      a.localeCompare(b, "es")
    );
  const posiciones = useMemo(() => unicos("posicion"), [jugadores]);
  const paises = useMemo(() => unicos("pais"), [jugadores]);
  const estados = useMemo(() => unicos("estado"), [jugadores]);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return jugadores.filter((p) => {
      const coincideNombre =
        !termino || nombreCompleto(p).toLowerCase().includes(termino);
      const coincidePosicion = posicion === TODOS || p.posicion === posicion;
      const coincidePais = pais === TODOS || p.pais === pais;
      const coincideEstado = estado === TODOS || p.estado === estado;
      return coincideNombre && coincidePosicion && coincidePais && coincideEstado;
    });
  }, [jugadores, busqueda, posicion, pais, estado]);

  return (
    <main className="min-h-screen bg-ink text-body overflow-x-hidden">
      {/* HEADER EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <div className="absolute inset-0 z-0">
          <Image
            src={STOCK_IMAGES.hero.basketball_action_1}
            alt=""
            fill
            priority
            className="object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/70" />
        </div>
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">
            Talento BMS
          </div>
          <h1 className="headline-lg text-gold">Jugadores</h1>
          <p className="text-lg text-body max-w-2xl">
            Explora nuestro roster de jugadores representados en ligas de todo el
            mundo.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="sticky top-20 bg-ink/95 backdrop-blur-sm border-b border-hairline py-6 px-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <label htmlFor="buscar" className="sr-only">
              Buscar jugador por nombre
            </label>
            <input
              id="buscar"
              type="search"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 bg-elevated border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Selector
              etiqueta="Posición"
              valor={posicion}
              onChange={setPosicion}
              opciones={posiciones}
              textoTodos="Todas"
            />
            <Selector
              etiqueta="País"
              valor={pais}
              onChange={setPais}
              opciones={paises}
              textoTodos="Todos"
            />
            <Selector
              etiqueta="Estado"
              valor={estado}
              onChange={setEstado}
              opciones={estados}
              textoTodos="Todos"
            />
          </div>
        </div>
      </section>

      {/* GRID DE JUGADORES */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {filtrados.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body/70 text-lg">
                No se encontraron jugadores con esos filtros
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtrados.map((p) => {
                const contexto = contextoEquipo(p);
                return (
                  <Link
                    key={p.id}
                    href={`/jugadores/${p.id}`}
                    className="group relative rounded-2xl overflow-hidden card-dark hover:border-gold-dark transition-colors flex flex-col"
                  >
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-b from-elevated to-ink">
                      {/* Las fotos salen ya a 4:5 de scripts/normaliza-fotos.mjs,
                          así que aquí no se recorta nada. object-top por si
                          alguna entra sin pasar por el script: antes de cortar
                          una cabeza, que corte los pies. */}
                      <Image
                        src={fotoDe(p)}
                        alt={nombreCompleto(p)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                      {p.estado && (
                        <span
                          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                            ESTADO_ESTILOS[estadoKey(p)]
                          }`}
                        >
                          {p.estado}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {p.posicion && (
                        <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1.5">
                          {p.posicion}
                        </p>
                      )}
                      <h2 className="font-display text-xl text-gold-light mb-1.5 group-hover:text-gold transition-colors">
                        {nombreCompleto(p)}
                      </h2>
                      <p className="text-body/80 text-xs">
                        {[p.equipo_actual, contexto].filter(Boolean).join(" · ") ||
                          "Equipo por confirmar"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Selector({
  etiqueta,
  valor,
  onChange,
  opciones,
  textoTodos,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: string[];
  textoTodos: string;
}) {
  const id = `filtro-${etiqueta.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-gold-dark mb-2">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <option value={TODOS} className="bg-elevated">
          {textoTodos}
        </option>
        {opciones.map((o) => (
          <option key={o} value={o} className="bg-elevated">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
