import Link from "next/link";
import Image from "next/image";
import { BANNER_SLIDES, STOCK_IMAGES } from "@/lib/images";
import { SITE } from "@/lib/site";
import CountUp from "@/components/CountUp";
import HeroCarousel from "@/components/HeroCarousel";
import InstagramSection from "@/components/InstagramSection";
import ServiceTabs from "@/components/ServiceTabs";

const featuredPlayers = [
  { id: "gelvis-solano", name: "Gelvis Solano", position: "Base", stat: "14.2 PTS · 5.6 AST", img: STOCK_IMAGES.players.placeholder_1 },
  { id: "victor-liz", name: "Víctor Liz", position: "Alero", stat: "16.8 PTS · 6.4 REB", img: STOCK_IMAGES.players.placeholder_2 },
  { id: "andersson-garcia", name: "Andersson García", position: "Alero", stat: "14.6 PTS · 6.1 REB", img: STOCK_IMAGES.players.placeholder_3 },
];

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

const testimonials = [
  {
    quote: "BMS transformó mi carrera. Su profesionalismo y red de contactos me abrieron puertas que jamás imaginé.",
    name: "Víctor Liz",
    role: "Alero Profesional",
  },
  {
    quote: "El equipo de BMS se preocupa de verdad por el jugador. Me acompañaron en cada paso de mi desarrollo.",
    name: "Gelvis Solano",
    role: "Base Profesional",
  },
];

const news = [
  { slug: "victor-liz-lidera-lnb", tag: "Jugador", date: "28 Jun 2026", title: "Víctor Liz Lidera la Anotación en la LNB" },
  { slug: "gelvis-solano-disponible", tag: "Agencia", date: "25 Jun 2026", title: "Gelvis Solano Disponible para la Próxima Temporada" },
  { slug: "andersson-garcia-marineros", tag: "Jugador", date: "20 Jun 2026", title: "Andersson García Brilla con los Marineros de Puerto Plata" },
];

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
                <span className="eyebrow-num">01</span> Agencia FIBA · Representación de Jugadores
              </div>

              <h1 className="headline-xl text-gold mb-10 animate-fadeUp">
                Tu próximo fichaje<br />
                <span className="text-gold-light">está aquí</span>
              </h1>

              <div className="animate-fadeUp">
                <p className="text-lg md:text-xl text-body leading-relaxed max-w-xl mb-6">
                  Conectamos a clubes de todo el mundo con más de 100 jugadores
                  profesionales de baloncesto. Te presentamos perfiles que encajan con tu
                  sistema, tu presupuesto y tu calendario.
                </p>
                <p className="text-base text-body/70 leading-relaxed max-w-xl mb-10">
                  Agencia con licencia FIBA #{SITE.fibaLicense}, con sedes en Miami y
                  República Dominicana desde {SITE.founded}. Nos ocupamos del scouting, la
                  negociación y los trámites internacionales de principio a fin.
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
          <div className="container-pro grid grid-cols-2 md:grid-cols-4 divide-x divide-[rgba(201,162,39,0.15)]">
            {[
              { number: "100+", label: "Jugadores Representados" },
              { number: "2009", label: "Fundación" },
              { number: "FIBA", label: "Agencia Licenciada" },
              { number: "2", label: "Sedes · Miami / RD" },
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
                <span className="eyebrow-num">02</span> Quiénes Somos
              </div>
              <h2 className="headline-lg text-gold">
                Un socio fiable<br />
                para tu <span className="text-gold-light">plantilla</span>
              </h2>
              <p className="text-lg text-body leading-relaxed max-w-2xl mb-10">
                Llevamos más de 25 años representando jugadores de baloncesto profesional,
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
              <span className="ghost-num">25</span>
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
                <span className="eyebrow-num">03</span> Talento BMS
              </div>
              <h2 className="headline-lg text-gold mb-0">Jugadores destacados</h2>
            </div>
            <Link href="/jugadores" className="link-arrow text-gold-light whitespace-nowrap">
              Ver directorio completo <span className="arrow">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPlayers.map((p, i) => (
              <Link
                key={p.id}
                href={`/jugadores/${p.id}`}
                className="group relative overflow-hidden rounded-2xl card-dark hover:border-gold-dark transition-colors"
              >
                <div className="relative h-96">
                  <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span aria-hidden="true" className="absolute top-4 left-4 font-display text-2xl text-gold/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gold text-ink rounded-full text-xs font-bold">
                    Disponible
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">{p.position}</p>
                  <h3 className="font-display text-2xl text-gold-light mb-1.5 group-hover:text-gold transition-colors">{p.name}</h3>
                  <p className="text-body text-sm font-semibold">{p.stat}</p>
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
              <span className="eyebrow-num">04</span> Qué Hacemos
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
              <span className="eyebrow-num">05</span> Presencia Global
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
                <p className="font-display text-xs text-gold-dark mb-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-black text-gold">{l.name}</h3>
                <p className="text-sm text-body/70">{l.region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 · TESTIMONIOS                                              */}
      {/* ============================================================ */}
      {/* scroll-mt extra: el header sticky (h-20) no debe tapar el título. */}
      <section id="testimonios" className="section-pad scroll-mt-28 bg-ink">
        <div className="container-pro">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">06</span> Testimonios
          </div>
          <h2 className="headline-lg text-gold mb-16 max-w-3xl">Lo que dicen nuestros jugadores</h2>

          <div className="grid md:grid-cols-2 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-elevated p-10">
                <div className="text-gold text-lg mb-6">★★★★★</div>
                <p className="text-xl md:text-2xl font-semibold leading-relaxed text-gold-light mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gold text-ink font-black flex items-center justify-center">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gold">{t.name}</p>
                    <p className="text-sm text-body/70">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/testimonios" className="link-arrow text-gold-light">
              Ver todos los testimonios <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 07 · NOTICIAS                                                 */}
      {/* ============================================================ */}
      <section className="section-pad bg-elevated border-y border-hairline">
        <div className="container-pro">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <div className="eyebrow text-gold-dark mb-8">
                <span className="eyebrow-num">07</span> Actualidad
              </div>
              <h2 className="headline-lg text-gold mb-0">Últimas noticias</h2>
            </div>
            <Link href="/noticias" className="link-arrow text-gold-light whitespace-nowrap">
              Ver todas <span className="arrow">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((n) => (
              <Link key={n.slug} href={`/noticias/${n.slug}`} className="group">
                <div className="relative h-56 rounded-2xl overflow-hidden bg-ink border border-hairline mb-6">
                  <Image src={STOCK_IMAGES.newsDefault} alt={n.title} fill className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 border border-hairline text-gold text-xs font-bold rounded-full uppercase tracking-wider">{n.tag}</span>
                  <span className="text-xs text-body/60">{n.date}</span>
                </div>
                <h3 className="text-lg font-black text-gold-light group-hover:text-gold transition leading-snug">{n.title}</h3>
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
