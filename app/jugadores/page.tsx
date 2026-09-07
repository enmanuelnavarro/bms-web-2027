"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import playersData from "@/lib/players.json";
import { STOCK_IMAGES } from "@/lib/images";

export default function PlayersDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");

  // Convertir datos JSON al formato esperado
  const players = playersData.map((p: any) => ({
    id: p.id,
    name: `${p.nombre} ${p.apellido}`,
    position: p.posicion,
    country: p.nacionalidad,
    team: p.equipo_actual,
    league: p.liga_actual,
    status: p.disponibilidad,
    height: p.altura,
    weight: p.peso,
    image: p.foto,
  }));

  // FILTRAR JUGADORES
  const filteredPlayers = useMemo(() => {
    return players.filter((player: any) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition =
        filterPosition === "all" || player.position === filterPosition;
      const matchesCountry =
        filterCountry === "all" || player.country === filterCountry;
      const matchesStatus =
        filterAvailability === "all" || player.status === filterAvailability;

      return (
        matchesSearch && matchesPosition && matchesCountry && matchesStatus
      );
    });
  }, [searchTerm, filterPosition, filterCountry, filterAvailability]);

  const positions = ["all", ...new Set(players.map((p: any) => p.position))];
  const countries = ["all", ...new Set(players.map((p: any) => p.country))];

  const statusStyles: Record<string, string> = {
    disponible: "bg-gold text-ink",
    bajo_contrato: "bg-elevated text-body/80 border border-hairline",
    en_negociacion: "bg-ink text-gold border border-gold",
  };

  const statusLabels: Record<string, string> = {
    disponible: "Disponible",
    bajo_contrato: "Bajo Contrato",
    en_negociacion: "En Negociación",
  };

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HEADER EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <div className="absolute inset-0 z-0">
          <Image src={STOCK_IMAGES.hero.basketball_action_1} alt="" fill priority className="object-cover opacity-20 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/70" />
        </div>
        <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">02</span>
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">02</span> Talento BMS
          </div>
          <h1 className="headline-lg text-gold">Jugadores</h1>
          <p className="text-lg text-body max-w-2xl">
            Explora nuestro roster de {players.length} jugadores representados en ligas de todo el mundo.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="sticky top-20 bg-ink/95 backdrop-blur-sm border-b border-hairline py-6 px-4 z-40">
        <div className="container mx-auto max-w-7xl">
          {/* BÚSQUEDA */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-elevated border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>

          {/* FILTROS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gold-dark mb-2">
                Posición
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {positions.map((pos: string) => (
                  <option key={pos} value={pos} className="bg-elevated">
                    {pos === "all" ? "Todas" : pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gold-dark mb-2">
                País
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {countries.map((country: string) => (
                  <option key={country} value={country} className="bg-elevated">
                    {country === "all" ? "Todos" : country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gold-dark mb-2">
                Disponibilidad
              </label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-elevated border border-hairline rounded-lg text-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="all" className="bg-elevated">
                  Todos
                </option>
                <option value="disponible" className="bg-elevated">
                  Disponible
                </option>
                <option value="bajo_contrato" className="bg-elevated">
                  Bajo Contrato
                </option>
                <option value="en_negociacion" className="bg-elevated">
                  En Negociación
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-body/70">
                {filteredPlayers.length} resultado{filteredPlayers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE JUGADORES */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body/70 text-lg">
                No se encontraron jugadores con esos filtros
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player: any, i: number) => (
                <Link key={player.id} href={`/jugadores/${player.id}`}>
                  <div className="group relative rounded-2xl overflow-hidden card-dark hover:border-gold-dark transition-colors h-full cursor-pointer">
                    <div className="relative w-full h-80 overflow-hidden">
                      <Image
                        src={player.image}
                        alt={player.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"></div>
                      <span aria-hidden="true" className="absolute top-4 left-4 font-display text-2xl text-gold/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                          statusStyles[player.status]
                        }`}
                      >
                        {statusLabels[player.status]}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1.5">
                        {player.position}
                      </p>
                      <h3 className="font-display text-xl text-gold-light mb-1.5 group-hover:text-gold transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-body/80 text-xs">{player.team} · {player.league}</p>
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
