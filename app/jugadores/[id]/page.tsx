"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import playersData from "@/lib/players.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TemporadaVista = {
  temporada: string;
  equipo: string;
  liga: string;
  pj: number;
  minutes: number;
  pts: number;
  reb: number;
  ast: number;
  rob: number;
  tap: number;
  fg: number;
  three: number;
  ft: number;
};

type LiveProfile = {
  fuente: string;
  fuente_url: string;
  obtenido: string;
  equipo_actual: string | null;
  liga_actual: string | null;
  temporadas: Array<{
    temporada: string;
    competicion: string;
    equipo: string;
    pj: number;
    min: number;
    pts: number;
    reb: number;
    ast: number;
    rob: number;
    tap: number;
    fg2_pct: number;
    fg3_pct: number;
    ft_pct: number;
  }>;
};

export default function PlayerProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const player = playersData.find((p: any) => p.id === id);
  const [selectedVideo, setSelectedVideo] = useState(player?.videos_youtube[0]?.youtube_id || null);
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState<LiveProfile | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Datos en vivo desde latinbasket.com, vía /api/players/[id]/stats. Solo se
  // pide si el jugador tiene fuente configurada. Si falla, la ficha se queda
  // con los datos locales: nunca se vacía por un error de la fuente.
  useEffect(() => {
    if (!player?.latinbasket_url) return;
    let cancelado = false;

    fetch(`/api/players/${id}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelado && d?.temporadas?.length) setLive(d);
      })
      .catch(() => {
        /* silencio: los datos locales ya están en pantalla */
      });

    return () => {
      cancelado = true;
    };
  }, [id, player?.latinbasket_url]);

  // Las temporadas en vivo mandan sobre las locales cuando llegan.
  const temporadas: TemporadaVista[] = live
    ? live.temporadas.map((t) => ({
        temporada: t.temporada,
        equipo: t.equipo,
        liga: t.competicion,
        pj: t.pj,
        minutes: t.min,
        pts: t.pts,
        reb: t.reb,
        ast: t.ast,
        rob: t.rob,
        tap: t.tap,
        fg: t.fg2_pct,
        three: t.fg3_pct,
        ft: t.ft_pct,
      }))
    : ((player?.estadisticas_temporada as TemporadaVista[]) ?? []);

  const chartData = temporadas.map((s) => ({
    // Con varias competiciones en la misma temporada, el año solo no distingue.
    temporada: live ? `${s.temporada} · ${s.liga}` : s.temporada,
    PTS: s.pts,
    REB: s.reb,
    AST: s.ast,
  }));

  if (!player) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black text-gold mb-4">Jugador no encontrado</h1>
          <Link href="/jugadores" className="text-gold-light font-bold hover:text-gold">
            ← Volver al directorio
          </Link>
        </div>
      </div>
    );
  }

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
      {/* HEADER EDITORIAL CON FOTO */}
      <section className="relative bg-ink text-body overflow-hidden border-b border-hairline">
        <div className="container-pro relative py-16 md:py-24">
          <Link href="/jugadores" className="link-arrow text-body/70 hover:text-gold mb-10 flex w-fit">
            <span className="rotate-180 arrow">→</span> Volver al roster
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* FOTO */}
            <div className="relative h-96 rounded-2xl overflow-hidden card-dark">
              <Image
                src={player.foto}
                alt={player.nombre}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            </div>

            {/* INFO */}
            <div className="md:col-span-2">
              <p className="text-gold font-bold uppercase tracking-widest text-sm mb-4">{player.posicion}</p>
              <h1 className="headline-lg text-gold">
                {player.nombre} {player.apellido}
              </h1>

              {/* BADGE DE DISPONIBILIDAD */}
              <span
                className={`inline-block px-4 py-2 rounded-full font-bold mb-8 text-sm ${
                  statusStyles[player.disponibilidad]
                }`}
              >
                {statusLabels[player.disponibilidad]}
              </span>

              {/* DATOS CLAVE */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
                {[
                  { l: "Altura", v: player.altura },
                  { l: "Peso", v: player.peso },
                  { l: "País", v: player.nacionalidad },
                  { l: "Equipo", v: player.equipo_actual },
                  { l: "Liga", v: player.liga_actual },
                  { l: "Nacimiento", v: player.fecha_nacimiento },
                ].map((d, i) => (
                  <div key={i} className="bg-elevated p-5">
                    <p className="text-gold-dark text-xs uppercase tracking-wider mb-1.5">{d.l}</p>
                    <p className="text-body font-bold">{d.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIO */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="card-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gold mb-5">Perfil</h2>
            <p className="text-body text-lg leading-relaxed">{player.bio}</p>
          </div>
        </div>
      </section>

      {/* VIDEOS YOUTUBE */}
      {player.videos_youtube && player.videos_youtube.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-lg md:text-xl font-bold text-gold mb-10">Highlights</h2>

            {/* VIDEO PRINCIPAL */}
            {selectedVideo && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo}`}
                    title="Player Highlights"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* MINIATURAS DE VIDEOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {player.videos_youtube.map((video: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVideo(video.youtube_id)}
                  className="group relative overflow-hidden rounded-2xl card-dark hover:border-gold transition cursor-pointer"
                >
                  {/* THUMBNAIL */}
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                    alt={video.titulo}
                    className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                  />

                  {/* PLAY BUTTON OVERLAY */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-ink text-lg">
                      ▶
                    </div>
                  </div>

                  {/* TÍTULO */}
                  <div className="p-4 bg-gradient-to-t from-ink to-transparent absolute bottom-0 left-0 right-0">
                    <p className="text-gold-light font-bold">{video.titulo}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HISTORIAL DE EQUIPOS */}
      {player.historial_equipos && player.historial_equipos.length > 0 && (
        <section className="py-24 px-4 bg-elevated border-y border-hairline">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-lg md:text-xl font-bold text-gold mb-10">Historial de Equipos</h2>
            <div className="space-y-4">
              {player.historial_equipos.map((team: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-ink border border-hairline rounded-2xl p-6 hover:border-gold transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gold mb-1.5">{team.equipo}</h3>
                      <p className="text-body/70">
                        {team.liga} • {team.pais}
                      </p>
                    </div>
                    <span className="text-gold-light font-bold text-lg">{team.temporada}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ESTADÍSTICAS */}
      {temporadas.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <h2 className="text-lg md:text-xl font-bold text-gold">Estadísticas</h2>
              {live && (
                <p className="text-xs text-body/60">
                  Datos actualizados desde{" "}
                  <a
                    href={live.fuente_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-dark hover:text-gold underline"
                  >
                    {live.fuente}
                  </a>{" "}
                  ·{" "}
                  {new Date(live.obtenido).toLocaleString("es-DO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>

            {/* GRÁFICO DE EVOLUCIÓN */}
            {mounted && chartData.length > 0 && (
              <div className="card-dark rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gold mb-6">
                  Promedios por Temporada (PTS · REB · AST)
                </h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.15)" />
                      <XAxis dataKey="temporada" stroke="#9C7A1E" fontSize={12} />
                      <YAxis stroke="#9C7A1E" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "#141414",
                          border: "1px solid rgba(201,162,39,0.3)",
                          borderRadius: 8,
                          color: "#D9D4C7",
                        }}
                        cursor={{ fill: "rgba(201,162,39,0.06)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#D9D4C7" }} />
                      <Bar dataKey="PTS" fill="#C9A227" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="REB" fill="#D9D4C7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="AST" fill="#9C7A1E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="card-dark rounded-2xl overflow-x-auto">
              <table className="w-full text-sm text-body/80">
                <thead className="bg-elevated border-b border-hairline">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gold">Temporada</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">PJ</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">MIN</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">PTS</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">REB</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">AST</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">FG%</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">3P%</th>
                    <th className="px-4 py-3 text-center font-bold text-gold">FT%</th>
                  </tr>
                </thead>
                <tbody>
                  {temporadas.map((stat, idx) => (
                    <tr key={idx} className="border-b border-hairline hover:bg-ink transition">
                      <td className="px-4 py-3 font-bold text-gold-light">{stat.temporada}</td>
                      <td className="px-4 py-3 text-center">{stat.pj}</td>
                      <td className="px-4 py-3 text-center">{stat.minutes}</td>
                      <td className="px-4 py-3 text-center font-bold text-gold">
                        {stat.pts.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">{stat.reb.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">{stat.ast.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">{stat.fg}%</td>
                      <td className="px-4 py-3 text-center">{stat.three}%</td>
                      <td className="px-4 py-3 text-center">{stat.ft}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
