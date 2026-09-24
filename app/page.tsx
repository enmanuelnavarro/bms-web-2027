import Link from "next/link";
import Image from "next/image";
import { BANNER_SLIDES, STOCK_IMAGES } from "@/lib/images";
import { SITE } from "@/lib/site";
import {
  ESTADO_ESTILOS,
  destacados,
  estadoKey,
  fotoDe,
  nombreCompleto,
  titularEstadistico,
} from "@/lib/players";
import NewsImage from "@/components/NewsImage";
import { destacadas, fechaCorta } from "@/lib/news";
import CountUp from "@/components/CountUp";
import HeroCarousel from "@/components/HeroCarousel";
import InstagramSection from "@/components/InstagramSection";
import ServiceTabs from "@/components/ServiceTabs";

// Salen de la base de jugadores, no de una lista escrita a mano: así la
// portada no puede quedarse con nombres o cifras que ya no son ciertos.
const featuredPlayers = destacados(3);

const leagues = [
  { name: "NBA", region: "Estados Unidos" },
  { name: "Euroliga", region: "Europa" },
  { name: "Liga ACB", region: "España" },
  { name: "LNBP", region: "México" },
  { name: "LNB", region: "Rep. Dominicana" },
  { name: "BSN", region: "Puerto Rico" },
  { name: "NBB", region: "Brasil" },
  { name: "Liga Sudamericana", region: "Sudamérica" },
];

// La portada enseña solo las destacadas y manda al listado: no es una
// página de noticias.
const news = destacadas(3);

export default function Home() {
  return (
    <main className="bg-ink text-body">
      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="relative bg-ink text-body overflow-hidden">
        {/* Banner dinámico. Dirección de arte doble a propósito: la composición
            es muy apaisada y en un hero vertical de móvil se perderían dos de
            los cuatro jugadores, así que ahí va como banda por encima del
            titular. A partir de lg pasa a fondo a sangre con el texto encima. */}
        {/* El envoltorio acota el fondo a la cabecera: con inset-0 sobre toda la
            sección, los puntos del carrusel caían encima de la barra de stats. */}
        <div className="relative">
          <div className="lg:absolute lg:inset-0 lg:z-0">
            <HeroCarousel
              slides={[...BANNER_SLIDES]}
              variant="hero"
              className="h-[16rem] sm:h-[22rem] lg:h-full lg:rounded-none lg:border-0"
            />
          </div>

          <div className="container-pro relative z-10 pt-16 pb-16 lg:pt-36 lg:pb-28">
            <div className="max-w-3xl">
              <div className="eyebrow text-gold-dark mb-10 animate-fadeUp">
                Agencia FIBA · Representación de Jugadores
              </div>

              <h1 className="headline-xl text-gold mb-10 animate-fadeUp">
                Tu próximo fichaje<br />
                <span className="text-gold-light">está aquí</span>
              </h1>

              <div className="animate-fadeUp">
                <p className="text-lg md:text-xl text-body leading-relaxed max-w-xl mb-6">
                  Conectamos a clubes de todo el mundo con jugadores profesionales
                  de baloncesto. Te presentamos perfiles que encajan con tu
                  sistema, tu presupuesto y tu calendario.
                </p>
                <p className="text-base text-body/70 leading-relaxed max-w-xl mb-10">
                  Agencia con licencia FIBA #{SITE.fibaLicense} y más de{" "}
                  {SITE.yearsOfExperience} años de experiencia. Nos ocupamos del scouting,
                  la negociación y los trámites internacionales de principio a fin.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/jugadores" className="btn-gold link-arrow">
                    Ver jugadores disponibles <span className="arrow">→</span>
                  </Link>
                  <Link href="/contacto" className="btn-outline-gold">
                    Solicitar un perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de stats */}
        <div className="relative z-10 border-t border-hairline bg-elevated/60">
          {/* Dos cifras, centradas: al quitar las otras dos, repartirlas a lo
              ancho del contenedor las dejaba flotando. */}
          <div className="container-pro grid grid-cols-2 max-w-3xl mx-auto divide-x divide-[rgba(201,162,39,0.15)]">
            {[
              { number: `+${SITE.yearsOfExperience}`, label: "Años de Experiencia" },
              { number: "FIBA", label: "Agencia Licenciada" },
            ].map((s, i) => (
              <div key={i} className="py-10 px-4 text-center">
                <CountUp value={s.number} className="block font-display text-4xl md:text-5xl text-gold mb-3" />
                <p className="text-xs text-body/70 font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 · MANIFIESTO                                               */}
      {/* ============================================================ */}
      <section className="section-pad relative overflow-hidden bg-ink">
        <div className="container-pro">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7">
              <div className="eyebrow text-gold-dark mb-10">
                Quiénes Somos
              </div>
              <h2 className="headline-lg text-gold">
                Un socio fiable<br />
                para tu <span className="text-gold-light">plantilla</span>
              </h2>
              <p className="text-lg text-body leading-relaxed max-w-2xl mb-10">
                Llevamos más de {SITE.yearsOfExperience} años representando jugadores de baloncesto
                profesional,
                y ese mismo tiempo trabajando con los clubes que los fichan. Conocemos a
                cada jugador de nuestro roster de primera mano: su nivel real, su carácter
                y qué necesita para rendir en tu equipo.
              </p>
              <Link href="/agencia" className="link-arrow text-gold-light border-b-2 border-gold pb-1">
                Conoce la agencia <span className="arrow">→</span>
              </Link>
            </div>
            {/* Número decorativo: aislado en su propia columna, muy tenue. */}
            <div className="hidden lg:flex lg:col-span-5 justify-end pl-8" aria-hidden="true">
              <span className="ghost-num">{SITE.yearsOfExperience}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 · JUGADORES DESTACADOS                                     */}
      {/* ============================================================ */}
      <section className="section-pad bg-elevated border-y border-hairline">
        <div className="container-pro">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <div className="eyebrow text-gold-dark mb-8">
                Talento BMS
              </div>
              <h2 className="headline-lg text-gold mb-0">Jugadores destacados</h2>
            </div>
            <Link href="/jugadores" className="link-arrow text-gold-light whitespace-nowrap">
              Ver directorio completo <span className="arrow">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPlayers.map((p) => (
              <Link
                key={p.id}
                href={`/jugadores/${p.id}`}
                className="group relative overflow-hidden rounded-2xl card-dark hover:border-gold-dark transition-colors"
              >
                <div className="relative h-96 bg-gradient-to-b from-elevated to-ink">
                  <Image
                    src={fotoDe(p)}
                    alt={nombreCompleto(p)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                  {p.estado && (
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${ESTADO_ESTILOS[estadoKey(p)]}`}>
                      {p.estado}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {p.posicion && (
                    <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">{p.posicion}</p>
                  )}
                  <h3 className="font-display text-2xl text-gold-light mb-1.5 group-hover:text-gold transition-colors">
                    {nombreCompleto(p)}
                  </h3>
                  <p className="text-body text-sm font-semibold">
                    {titularEstadistico(p) ?? [p.equipo_actual, p.pais].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 · SERVICIOS (tabs Jugadores / Clubes)                     */}
      {/* ============================================================ */}
      <section className="section-pad bg-ink">
        <div className="container-pro">
          <div className="max-w-2xl mb-16">
            <div className="eyebrow text-gold-dark mb-8">
              Qué Hacemos
            </div>
            <h2 className="headline-lg text-gold">Servicios profesionales</h2>
            <p className="text-lg text-body">
              Lo que ponemos sobre la mesa cuando un club nos llama — y lo que ofrecemos a
              los jugadores que representamos. Elige tu perfil.
            </p>
          </div>
          <ServiceTabs />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 · PRESENCIA GLOBAL / LIGAS                                 */}
      {/* ============================================================ */}
      <section className="section-pad bg-elevated border-y border-hairline">
        <div className="container-pro">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="eyebrow text-gold-dark mb-8 justify-center">
              Presencia Global
            </div>
            <h2 className="headline-lg text-gold">En las mejores ligas</h2>
            <p className="text-lg text-body">
              Nuestros jugadores compiten —y nuestros clubes fichan— en las competiciones
              profesionales más exigentes del mundo.
            </p>
          </div>
        </div>

        {/* Marquee de ligas — separado del grid para que no se lean encimados */}
        <div className="marquee py-8 border-y border-hairline bg-ink mb-20 md:mb-28">
          <div className="marquee__track">
            {[...leagues, ...leagues].map((l, i) => (
              <span key={i} className="font-display text-3xl md:text-4xl text-gold/25 whitespace-nowrap">
                {l.name}<span className="text-gold/60"> ·</span>
              </span>
            ))}
          </div>
        </div>

        <div className="container-pro">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
            {leagues.map((l, i) => (
              <div key={i} className="bg-ink p-8 text-center hover:bg-elevated transition-colors">
                <h3 className="font-black text-gold">{l.name}</h3>
                <p className="text-sm text-body/70">{l.region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* NOTICIAS                                                      */}
      {/* ============================================================ */}
      {/* border-b: Instagram también va sobre bg-ink y sin la línea las dos
          secciones se leerían como un único bloque. */}
      <section className="section-pad bg-ink border-b border-hairline">
        <div className="container-pro">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <div className="eyebrow text-gold-dark mb-8">
                Actualidad
              </div>
              <h2 className="headline-lg text-gold mb-0">Últimas noticias</h2>
            </div>
            <Link href="/noticias" className="link-arrow text-gold-light whitespace-nowrap">
              Ver todas <span className="arrow">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((n) => (
              <Link key={n.slug} href={`/noticias/${n.slug}`} className="group flex flex-col">
                <div className="relative h-56 rounded-2xl overflow-hidden bg-elevated border border-hairline mb-6">
                  <NewsImage
                    noticia={n}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="w-fit px-2.5 py-1 border border-hairline text-gold text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                  {n.categoria}
                </span>
                <h3 className="text-lg font-black text-gold-light group-hover:text-gold transition leading-snug mb-3">
                  {n.titulo}
                </h3>
                <p className="text-sm text-body/75 leading-relaxed mb-5 line-clamp-3">{n.resumen}</p>
                <div className="mt-auto flex items-center justify-between gap-4 text-xs">
                  <time dateTime={n.fecha} className="text-body/60">
                    {fechaCorta(n.fecha)}
                  </time>
                  <span className="text-gold font-bold group-hover:text-gold-light whitespace-nowrap">
                    Leer más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 08 · INSTAGRAM EN DIRECTO                                     */}
      {/* ============================================================ */}
      <InstagramSection />

      {/* ============================================================ */}
      {/* CTA FINAL                                                     */}
      {/* ============================================================ */}
      {/* z-10 en el contenido y z-0 en el número decorativo: el botón     */}
      {/* nunca queda tapado por el "BMS" de fondo ni por el footer.      */}
      <section className="relative bg-gold overflow-hidden isolate">
        <span
          aria-hidden="true"
          className="absolute -top-6 -right-4 md:-top-10 md:-right-6 z-0 font-display text-ink/[0.07] text-[6rem] md:text-[14rem] leading-none select-none pointer-events-none"
        >
          BMS
        </span>
        <div className="container-pro relative z-10 pt-24 pb-28 md:pt-28 md:pb-32">
          <h2 className="headline-lg text-ink max-w-3xl">
            ¿Necesitas reforzar<br />tu plantilla?
          </h2>
          <p className="text-ink/80 text-lg max-w-2xl mb-12">
            Dinos qué posición buscas, en qué liga compites y con qué presupuesto cuentas.
            Te enviamos una preselección de jugadores con vídeo y estadísticas. Atendemos
            desde República Dominicana y Miami, en español e inglés.
          </p>
          <Link
            href="/contacto"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-ink text-gold font-bold rounded-full hover:bg-elevated transition link-arrow"
          >
            Solicitar jugadores <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
