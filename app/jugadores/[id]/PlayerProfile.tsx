"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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

import type { Player, StatSeason } from "@/lib/types";
import {
  ESTADO_ESTILOS,
  alturaTexto,
  contactoHref,
  contextoEquipo,
  edad,
  estadoKey,
  estadoTexto,
  fechaNacimientoTexto,
  fotoDe,
  medidasTexto,
  nombreCompleto,
  pesoTexto,
  whatsappHref,
} from "@/lib/players";

type Totales = NonNullable<StatSeason["totales"]>;

type LiveProfile = {
  fuente: string;
  fuente_url: string;
  obtenido: string;
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
    totales: Totales | null;
  }>;
};

type TabId = "estadisticas" | "trayectoria" | "videos" | "perfil";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "estadisticas", label: "Estadísticas de carrera" },
  { id: "trayectoria", label: "Trayectoria" },
  { id: "videos", label: "Vídeos" },
  { id: "perfil", label: "Perfil" },
];

export default function PlayerProfile({ player }: { player: Player }) {
  const [tab, setTab] = useState<TabId>("estadisticas");
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState<LiveProfile | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    videoSrc(player.videos_youtube?.[0])
  );

  // Recharts mide el contenedor, así que solo se pinta tras montar: en el HTML
  // del servidor no hay ancho y saldría un gráfico de 0 px.
  useEffect(() => setMounted(true), []);

  // Datos en vivo desde la ficha de origen, vía /api/players/[id]/stats. Solo
  // se pide si el jugador tiene fuente. Si falla, se queda lo local: un error
  // de la fuente nunca debe vaciar la ficha.
  const fuenteUrl = player.source?.url;
  useEffect(() => {
    if (!fuenteUrl) return;
    let cancelado = false;

    fetch(`/api/players/${player.id}/stats`)
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
  }, [player.id, fuenteUrl]);

  // Las temporadas en vivo mandan sobre las locales cuando llegan.
  const temporadas: StatSeason[] = useMemo(
    () =>
      live
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
            totales: t.totales,
          }))
        : (player.estadisticas_temporada ?? []),
    [live, player.estadisticas_temporada]
  );

  const carrera = useMemo(() => calcularCarrera(temporadas), [temporadas]);

  const chartData = temporadas.map((s) => ({
    // Con varias competiciones en la misma temporada, el año solo no distingue.
    temporada: live ? `${s.temporada} · ${s.liga}` : s.temporada,
    PTS: s.pts,
    REB: s.reb,
    AST: s.ast,
  }));

  const nombre = nombreCompleto(player);
  const estado = estadoTexto(player);
  const fuente = player.source;
  const videos = player.videos_youtube ?? [];
  const trayectoria = player.historial_equipos ?? [];

  // La franja dorada solo muestra lo que existe: un campo vacío se cae del
  // listado en vez de enseñar un hueco o un dato inventado.
  const datosClave = [
    { l: "Fecha de nacimiento", v: fechaNacimientoTexto(player) },
    { l: "Altura", v: medidasTexto(player) },
    { l: "Equipo actual", v: player.equipo_actual, sub: contextoEquipo(player) },
    { l: "Nacionalidad", v: player.nacionalidad },
  ].filter((d) => d.v);

  return (
    <main className="min-h-screen bg-ink text-body overflow-x-hidden">
      {/* ===== BANDA DE CABECERA ===== */}
      <section className="player-hero relative overflow-hidden">
        <div className="container-pro relative">
          {/* Foto anclada al pie de la banda, recortada por el borde.
              object-contain: nunca deforma ni corta cabeza o brazos. */}
          <div className="absolute right-0 bottom-0 w-36 sm:w-56 md:w-[19rem] lg:w-[23rem] h-full pointer-events-none">
            <Image
              src={fotoDe(player)}
              alt={nombre}
              fill
              priority
              sizes="(max-width: 640px) 9rem, (max-width: 768px) 14rem, (max-width: 1024px) 19rem, 23rem"
              className="object-contain object-bottom"
            />
          </div>

          <div className="relative z-10 py-10 md:py-14 pr-32 sm:pr-52 md:pr-[20rem] lg:pr-[24rem]">
            {/* Miga de pan */}
            <nav aria-label="Miga de pan" className="mb-8 text-xs text-body/55">
              <Link href="/" className="hover:text-gold transition">
                Inicio
              </Link>
              <span className="mx-2">›</span>
              <Link href="/jugadores" className="hover:text-gold transition">
                Jugadores
              </Link>
              <span className="mx-2">›</span>
              <span className="text-body/80">{nombre}</span>
            </nav>

            {player.posicion && (
              <p className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-4">
                {player.posicion}
              </p>
            )}

            {/* Nombre en dos pesos, como en las fichas federativas. */}
            <h1 className="font-display leading-[0.92] mb-7">
              <span className="block text-3xl md:text-5xl text-body/85">{player.nombre}</span>
              {player.apellido && (
                <span className="block text-5xl md:text-7xl text-gold">{player.apellido}</span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {estado && (
                <span
                  className={`inline-block px-4 py-2 rounded-full font-bold text-xs ${
                    ESTADO_ESTILOS[estadoKey(player)]
                  }`}
                >
                  {estado}
                </span>
              )}
              <Link
                href={contactoHref(player)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-ink font-bold text-xs hover:bg-gold-light transition"
              >
                Solicitar información
              </Link>
              <a
                href={whatsappHref(player)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/60 text-gold font-bold text-xs hover:bg-gold hover:text-ink transition"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FRANJA DE DATOS CLAVE ===== */}
      {datosClave.length > 0 && (
        <section className="bg-gold text-ink">
          <div className="container-pro grid grid-cols-2 lg:grid-cols-4 divide-x divide-ink/15">
            {datosClave.map((d) => (
              <div key={d.l} className="py-5 px-5 first:pl-0 lg:first:pl-5">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/60 mb-1.5">
                  {d.l}
                </p>
                <p className="font-bold leading-snug">{d.v}</p>
                {d.sub && <p className="text-xs text-ink/65 mt-0.5">{d.sub}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PESTAÑAS ===== */}
      <div className="border-b border-hairline bg-elevated/40 sticky top-20 z-30 backdrop-blur-sm">
        <div
          className="container-pro flex gap-6 sm:gap-8 overflow-x-auto"
          role="tablist"
          aria-label="Secciones de la ficha"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className="player-tab"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-pro py-14 md:py-20">
        {/* ===== ESTADÍSTICAS ===== */}
        {tab === "estadisticas" && (
          <section id="panel-estadisticas" role="tabpanel">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <h2 className="font-display text-2xl text-gold">Estadísticas de carrera</h2>
              {/* Solo se dice "actualizado desde X" cuando los datos vienen de
                  verdad de ahí en esta carga. */}
              {live && (
                <p className="text-xs text-body/55">
                  Datos actualizados desde{" "}
                  <a
                    href={live.fuente_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-dark hover:text-gold underline"
                  >
                    {fuente?.name ?? live.fuente}
                  </a>{" "}
                  ·{" "}
                  {new Date(live.obtenido).toLocaleString("es-DO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>

            {temporadas.length === 0 ? (
              <EstadoVacio
                titulo="Estadísticas en proceso de actualización"
                texto="Estamos incorporando los registros de temporada de este jugador. La ficha se actualizará en cuanto estén verificados."
              />
            ) : (
              <>
                <div className="rounded-xl border border-hairline overflow-x-auto mb-10">
                  <table className="stat-table">
                    <thead>
                      <tr>
                        <th className="text-left">Temporada</th>
                        <th className="text-left">Competición</th>
                        <th className="text-left">Equipo</th>
                        <th className="text-center">PJ</th>
                        <th className="text-center">MIN</th>
                        <th className="text-center">PTS</th>
                        <th className="text-center">REB</th>
                        <th className="text-center">AST</th>
                        <th className="text-center">ROB</th>
                        <th className="text-center">TAP</th>
                        <th className="text-center">T2%</th>
                        <th className="text-center">T3%</th>
                        <th className="text-center">TL%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {temporadas.map((s, idx) => (
                        <tr key={`${s.temporada}-${s.liga}-${idx}`}>
                          <td className="font-bold text-gold-light">{s.temporada}</td>
                          <td className="text-body/75">{s.liga}</td>
                          <td className="text-body/75">{s.equipo}</td>
                          <td className="text-center">{s.pj}</td>
                          <td className="text-center">{s.minutes.toFixed(1)}</td>
                          <td className="text-center font-bold text-gold">{s.pts.toFixed(1)}</td>
                          <td className="text-center">{s.reb.toFixed(1)}</td>
                          <td className="text-center">{s.ast.toFixed(1)}</td>
                          <td className="text-center">{s.rob.toFixed(1)}</td>
                          <td className="text-center">{s.tap.toFixed(1)}</td>
                          <td className="text-center">{s.fg}%</td>
                          <td className="text-center">{s.three}%</td>
                          <td className="text-center">{s.ft}%</td>
                        </tr>
                      ))}
                    </tbody>
                    {carrera && (
                      <tfoot>
                        <tr>
                          <td colSpan={3}>Media total</td>
                          <td className="text-center">{carrera.pj}</td>
                          <td className="text-center">{carrera.min.toFixed(1)}</td>
                          <td className="text-center">{carrera.pts.toFixed(1)}</td>
                          <td className="text-center">{carrera.reb.toFixed(1)}</td>
                          <td className="text-center">{carrera.ast.toFixed(1)}</td>
                          <td className="text-center">{carrera.rob.toFixed(1)}</td>
                          <td className="text-center">{carrera.tap.toFixed(1)}</td>
                          <td className="text-center">{pct(carrera.fg2m, carrera.fg2a)}</td>
                          <td className="text-center">{pct(carrera.fg3m, carrera.fg3a)}</td>
                          <td className="text-center">{pct(carrera.ftm, carrera.fta)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {mounted && chartData.length > 0 && (
                  <div className="card-dark rounded-xl p-4 sm:p-6">
                    <h3 className="font-bold text-gold mb-6">
                      Promedios por temporada (PTS · REB · AST)
                    </h3>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.15)" />
                          <XAxis dataKey="temporada" stroke="#9C7A1E" fontSize={11} />
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
              </>
            )}

            {fuente && <Referencia fuente={fuente} />}
          </section>
        )}

        {/* ===== TRAYECTORIA ===== */}
        {tab === "trayectoria" && (
          <section id="panel-trayectoria" role="tabpanel">
            <h2 className="font-display text-2xl text-gold mb-8">Trayectoria</h2>
            {trayectoria.length === 0 ? (
              <EstadoVacio
                titulo="Trayectoria en proceso de actualización"
                texto="Estamos verificando el histórico de equipos de este jugador antes de publicarlo."
              />
            ) : (
              <div className="rounded-xl border border-hairline overflow-hidden">
                {trayectoria.map((t, idx) => (
                  <div
                    key={`${t.temporada}-${t.equipo}-${idx}`}
                    className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-hairline last:border-0 hover:bg-elevated/60 transition"
                  >
                    <div>
                      <h3 className="font-bold text-gold-light text-lg mb-1">{t.equipo}</h3>
                      <p className="text-sm text-body/65">
                        {[t.liga, t.pais].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="font-display text-xl text-gold whitespace-nowrap">
                      {t.temporada}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== VÍDEOS ===== */}
        {tab === "videos" && (
          <section id="panel-videos" role="tabpanel">
            <h2 className="font-display text-2xl text-gold mb-8">Vídeos</h2>
            {videos.length === 0 ? (
              <EstadoVacio
                titulo="Vídeos próximamente"
                texto="Aún no hay material de vídeo publicado para este jugador."
              />
            ) : (
              <>
                {selectedVideo && (
                  <div className="mb-8 rounded-xl overflow-hidden border border-hairline">
                    <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={selectedVideo}
                        title={`Vídeo de ${nombre}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {videos.map((v, idx) => {
                    const src = videoSrc(v);
                    const miniatura = v.youtube_id
                      ? `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`
                      : null;
                    return (
                      <button
                        key={`${v.titulo}-${idx}`}
                        onClick={() => src && setSelectedVideo(src)}
                        aria-current={selectedVideo === src}
                        className={`group relative overflow-hidden rounded-xl border text-left transition ${
                          selectedVideo === src
                            ? "border-gold"
                            : "border-hairline hover:border-gold-dark"
                        }`}
                      >
                        {miniatura ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={miniatura}
                            alt=""
                            className="w-full h-44 object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-44 bg-elevated flex items-center justify-center text-gold/40 font-display text-3xl">
                            ▶
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-gold-light font-bold text-sm">{v.titulo}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* ===== PERFIL ===== */}
        {tab === "perfil" && (
          <section id="panel-perfil" role="tabpanel" className="max-w-3xl">
            <h2 className="font-display text-2xl text-gold mb-8">Perfil</h2>

            {player.bio && (
              <p className="text-body text-lg leading-relaxed mb-10">{player.bio}</p>
            )}

            <dl className="grid sm:grid-cols-2 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-xl overflow-hidden">
              {[
                { l: "Nombre completo", v: nombre },
                { l: "Fecha de nacimiento", v: fechaNacimientoTexto(player) },
                { l: "Edad", v: edad(player) !== null ? `${edad(player)} años` : null },
                { l: "Lugar de nacimiento", v: player.lugar_nacimiento },
                { l: "Nacionalidad", v: player.nacionalidad },
                { l: "Posición", v: player.posicion },
                { l: "Altura", v: alturaTexto(player) },
                { l: "Peso", v: pesoTexto(player) },
                { l: "Tipo de jugador", v: player.tipo_jugador },
                { l: "Equipo actual", v: player.equipo_actual },
                { l: "Liga", v: player.liga_actual },
                { l: "País", v: player.pais },
                { l: "Estado", v: player.estado },
                { l: "Selección", v: player.seleccion },
              ]
                .filter((d) => d.v)
                .map((d) => (
                  <div key={d.l} className="bg-elevated p-5">
                    <dt className="text-xs text-gold-dark uppercase tracking-wider mb-1.5">
                      {d.l}
                    </dt>
                    <dd className="font-bold text-body">{d.v}</dd>
                  </div>
                ))}
            </dl>

            {fuente && (
              <div className="mt-10">
                <p className="text-xs text-gold-dark uppercase tracking-wider mb-2">
                  Perfil externo
                </p>
                <a
                  href={fuente.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-gold hover:text-gold-light underline underline-offset-4"
                >
                  Ver perfil en {fuente.name} <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

/** Línea discreta con la ficha de referencia del jugador. */
function Referencia({ fuente }: { fuente: NonNullable<Player["source"]> }) {
  return (
    <p className="mt-8 text-xs text-body/45">
      Datos y referencia:{" "}
      <a
        href={fuente.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold-dark hover:text-gold underline underline-offset-2"
      >
        {fuente.name} <span aria-hidden="true">↗</span>
      </a>
    </p>
  );
}

function EstadoVacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="card-dark rounded-xl p-8 sm:p-12 text-center">
      <p className="font-display text-xl text-gold-light mb-3">{titulo}</p>
      <p className="text-sm text-body/60 max-w-md mx-auto leading-relaxed">{texto}</p>
    </div>
  );
}

/** URL de reproducción incrustada, sea YouTube, Vimeo o un enlace directo. */
function videoSrc(v?: { youtube_id?: string; url?: string }): string | null {
  if (!v) return null;
  if (v.youtube_id) return `https://www.youtube.com/embed/${v.youtube_id}`;
  if (!v.url) return null;

  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(v.url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/.exec(v.url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  return v.url;
}

/**
 * Acumulado de carrera. Los promedios se ponderan por partidos jugados, y los
 * porcentajes se calculan sobre anotados/intentados reales: promediar los
 * porcentajes de cada temporada daría un número falso, porque una temporada de
 * 2 partidos pesaría igual que una de 27.
 *
 * Devuelve null si no hay totales (los jugadores sin fuente en vivo solo tienen
 * promedios locales, y con eso no se puede calcular un porcentaje honesto).
 */
function calcularCarrera(temporadas: StatSeason[]) {
  const conTotales = temporadas.filter((t) => t.totales);
  if (conTotales.length === 0) return null;

  const acc = {
    pj: 0, min: 0, pts: 0, reb: 0, ast: 0, rob: 0, tap: 0,
    fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
  };

  for (const t of conTotales) {
    const tot = t.totales!;
    acc.pj += t.pj;
    acc.min += tot.min;
    acc.pts += tot.pts;
    // Rebotes y asistencias solo están como promedio: se reconstruye el total.
    acc.reb += t.reb * t.pj;
    acc.ast += t.ast * t.pj;
    acc.rob += t.rob * t.pj;
    acc.tap += t.tap * t.pj;
    acc.fg2m += tot.fg2m;
    acc.fg2a += tot.fg2a;
    acc.fg3m += tot.fg3m;
    acc.fg3a += tot.fg3a;
    acc.ftm += tot.ftm;
    acc.fta += tot.fta;
  }

  if (acc.pj === 0) return null;

  return {
    ...acc,
    min: acc.min / acc.pj,
    pts: acc.pts / acc.pj,
    reb: acc.reb / acc.pj,
    ast: acc.ast / acc.pj,
    rob: acc.rob / acc.pj,
    tap: acc.tap / acc.pj,
  };
}

function pct(hechos: number, intentos: number): string {
  return intentos > 0 ? `${((hechos / intentos) * 100).toFixed(1)}%` : "—";
}
