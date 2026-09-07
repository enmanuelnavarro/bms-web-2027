import Link from "next/link";
import CountUp from "@/components/CountUp";
import PageHero from "@/components/PageHero";
import { SITE, SERVICES } from "@/lib/site";
import { STOCK_IMAGES } from "@/lib/images";

export const metadata = {
  title: "Agencia — BMS Sports Agency",
  description: SITE.mission,
};

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-ink text-body">
      <PageHero
        num="03"
        eyebrow="Sobre Nosotros"
        title={<>{SITE.legalName}</>}
        subtitle={`${SITE.taglineEs}. Agencia con licencia FIBA #${SITE.fibaLicense}, fundada en ${SITE.founded}.`}
        image={STOCK_IMAGES.aboutAgency}
      />

      {/* MISIÓN */}
      <section className="section-pad">
        <div className="container-pro grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-7">
            <div className="eyebrow text-gold-dark mb-8">
              <span className="eyebrow-num">01</span> Nuestra Misión
            </div>
            <p className="text-2xl md:text-3xl font-semibold leading-relaxed text-gold-light">
              {SITE.mission}
            </p>
            <p className="mt-8 text-lg text-body leading-relaxed max-w-2xl">
              {SITE.about}
            </p>
          </div>
          <div className="hidden lg:flex lg:col-span-5 justify-end pl-8" aria-hidden="true">
            <span className="ghost-num">{String(SITE.founded).slice(2)}</span>
          </div>
        </div>
      </section>

      {/* SERVICIOS REALES */}
      <section className="section-pad bg-elevated border-y border-hairline">
        <div className="container-pro">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">02</span> Qué Hacemos
          </div>
          <h2 className="headline-lg text-gold mb-16 max-w-3xl">Servicios integrales</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
            {SERVICES.map((s, i) => (
              <div key={i} className="group bg-ink p-8 hover:bg-elevated transition-colors">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-3xl">{s.icon}</span>
                  <span
                    aria-hidden="true"
                    className="font-display text-lg text-gold/25 group-hover:text-gold/60 transition-colors"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gold mb-4">{s.title}</h3>
                <p className="text-body/80 leading-relaxed text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS REALES */}
      <section className="section-pad">
        <div className="container-pro">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
            {[
              { number: "2009", label: "Año de Fundación" },
              { number: "FIBA", label: "Agencia Licenciada" },
              { number: "100+", label: "Jugadores Representados" },
              { number: "2", label: "Sedes · Miami / RD" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-elevated p-8 text-center">
                <CountUp value={stat.number} className="block font-display text-4xl text-gold mb-3" />
                <p className="text-body/80 font-semibold text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIDERAZGO */}
      <section className="section-pad bg-elevated border-y border-hairline">
        <div className="container-pro">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">03</span> Liderazgo
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <h2 className="headline-lg text-gold max-w-2xl">El equipo detrás de BMS</h2>
          </div>
          <Link
            href="/agencia/frank-brito"
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-ink border border-hairline rounded-2xl p-8 hover:border-gold transition"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-ink font-display text-3xl flex-shrink-0">
              F
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-black text-gold">Frank Brito</h3>
              <p className="text-gold-light font-bold">Gerente General · Agente FIBA Certificado</p>
              <p className="text-body/80 mt-2">Más de 20 años representando jugadores de baloncesto en América Latina y el mundo.</p>
            </div>
            <span className="link-arrow text-gold-light whitespace-nowrap">
              Ver perfil <span className="arrow">→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gold overflow-hidden isolate">
        <span
          aria-hidden="true"
          className="absolute -top-6 -right-4 md:-top-10 md:-right-6 z-0 font-display text-ink/[0.07] text-[6rem] md:text-[14rem] leading-none select-none pointer-events-none"
        >
          BMS
        </span>
        <div className="container-pro relative z-10 pt-24 pb-28 md:pt-28 md:pb-32">
          <h2 className="headline-lg text-ink max-w-3xl">¿Quieres trabajar con nosotros?</h2>
          <p className="text-ink/80 text-lg max-w-2xl mb-12">
            Si eres jugador, entrenador o club, nos encantaría conocerte y explorar cómo podemos colaborar.
          </p>
          <Link
            href="/contacto"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-ink text-gold font-bold rounded-full hover:bg-elevated transition link-arrow"
          >
            Contáctanos <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
