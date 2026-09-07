"use client";

import Image from "next/image";
import Link from "next/link";
import { executiveProfiles } from "@/lib/mockData";
import CountUp from "@/components/CountUp";

export default function FrankBritoProfile() {
  const executive = executiveProfiles[0];

  if (!executive) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-32 text-center bg-ink text-body min-h-screen">
        <h1 className="text-lg md:text-xl font-bold mb-4">Perfil no encontrado</h1>
        <Link href="/agencia" className="text-gold-light font-bold hover:text-gold">
          Volver a la Agencia
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-ink text-body">
      {/* HERO EDITORIAL */}
      <div className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">03</span>
        <div className="container-pro relative z-10 py-20 md:py-28">
          <Link href="/agencia" className="link-arrow text-body/70 hover:text-gold mb-10 flex w-fit">
            <span className="rotate-180 arrow">→</span> Volver a la Agencia
          </Link>
          <div className="eyebrow text-gold-dark mb-8 flex w-fit">
            <span className="eyebrow-num">03</span> {executive.cargo}
          </div>
          <h1 className="headline-lg text-gold">{executive.nombre}</h1>
          <p className="text-lg text-gold-light">{executive.certificacion}</p>
        </div>
      </div>

      {/* PERFIL PRINCIPAL */}
      <div className="container mx-auto max-w-7xl px-8 md:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* FOTO Y CERTIFICACIÓN */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-md mb-8">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-elevated border border-hairline">
                <Image
                  src={executive.foto}
                  alt={executive.nombre}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Badge FIBA */}
              <div className="absolute -bottom-4 -right-4 z-10 bg-gold text-ink px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2">
                <span className="text-xl">✓</span>
                <div className="text-sm leading-tight">
                  <div className="font-bold">Agente FIBA</div>
                  <div className="text-xs">Certificado</div>
                </div>
              </div>
            </div>

            {/* TARJETA DE CONTACTO */}
            <div className="w-full max-w-md card-dark rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-bold mb-4 text-gold">
                Contacto Directo
              </h3>

              {executive.email_contacto && (
                <div className="mb-4">
                  <p className="text-gold-dark text-sm mb-1">Email</p>
                  <a
                    href={`mailto:${executive.email_contacto}`}
                    className="font-bold text-gold hover:text-gold-light transition break-all"
                  >
                    {executive.email_contacto}
                  </a>
                </div>
              )}

              {executive.telefono_contacto && (
                <div className="mb-6">
                  <p className="text-gold-dark text-sm mb-1">Teléfono</p>
                  <a
                    href={`tel:${executive.telefono_contacto}`}
                    className="font-bold text-gold hover:text-gold-light transition"
                  >
                    {executive.telefono_contacto}
                  </a>
                </div>
              )}

              <Link
                href="/contacto"
                className="w-full bg-gold text-ink px-4 py-3 rounded-full font-bold hover:bg-gold-light transition block text-center"
              >
                Contactar a BMS
              </Link>
            </div>
          </div>

          {/* BIO E INFO */}
          <div>
            {/* CITA DESTACADA */}
            <div className="bg-elevated border-l-4 border-gold p-8 rounded-r-lg mb-8">
              <p className="text-xl italic text-gold-light leading-relaxed">
                &ldquo;{executive.cita_destacada}&rdquo;
              </p>
            </div>

            {/* TRAYECTORIA */}
            <div className="mb-10 space-y-4">
              <h2 className="text-2xl font-bold text-gold">Trayectoria</h2>
              <p className="text-body leading-relaxed text-lg">
                {executive.bio}
              </p>
            </div>

            {/* MÉTRICAS CLAVE */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {executive.logros.map((logro, idx) => (
                <div
                  key={idx}
                  className="card-dark rounded-2xl p-6 hover:border-gold transition text-center"
                >
                  {logro.icono && (
                    <p className="text-lg md:text-xl mb-2">{logro.icono}</p>
                  )}
                  <CountUp
                    value={String(logro.valor)}
                    className="block text-gold font-black text-lg md:text-xl mb-1"
                  />
                  <p className="text-body/70 text-sm font-medium">
                    {logro.titulo}
                  </p>
                </div>
              ))}
            </div>

            {/* PAÍSES DE OPERACIÓN */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gold mb-4">
                Países de Operación
              </h3>
              <div className="flex flex-wrap gap-2">
                {executive.paises_experiencia.map((pais, idx) => (
                  <span
                    key={idx}
                    className="bg-elevated border border-hairline text-gold px-4 py-2 rounded-full font-semibold text-sm"
                  >
                    {pais}
                  </span>
                ))}
              </div>
            </div>

            {/* REDES SOCIALES */}
            <div>
              <h3 className="text-lg font-bold text-gold mb-4">
                Conecta Profesionalmente
              </h3>
              <div className="flex gap-4">
                {executive.redes_sociales.linkedin && (
                  <a
                    href={executive.redes_sociales.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-hairline text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-ink transition text-xl font-bold"
                    title="LinkedIn"
                  >
                    in
                  </a>
                )}
                {executive.redes_sociales.instagram && (
                  <a
                    href={executive.redes_sociales.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-hairline text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-ink transition"
                    title="Instagram"
                  >
                    📷
                  </a>
                )}
                {executive.redes_sociales.twitter && (
                  <a
                    href={executive.redes_sociales.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-hairline text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-ink transition font-bold"
                    title="Twitter/X"
                  >
                    X
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILOSOFÍA */}
      <section className="bg-elevated border-y border-hairline py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-8 md:px-16">
          <h2 className="text-lg md:text-xl font-black text-gold mb-12 text-center">
            Filosofía de BMS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Excelencia",
                text: "Trabajamos con los más altos estándares profesionales para asegurar que cada transacción beneficie a nuestros jugadores.",
              },
              {
                icon: "🤝",
                title: "Confianza",
                text: "La relación con nuestros jugadores se construye sobre la confianza, transparencia y compromiso real con su crecimiento.",
              },
              {
                icon: "🌐",
                title: "Alcance Global",
                text: "Con presencia en múltiples continentes, abrimos oportunidades en las ligas más competitivas del mundo.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-ink border border-hairline p-8 rounded-2xl hover:border-gold transition"
              >
                <p className="text-lg md:text-xl mb-3">{item.icon}</p>
                <h3 className="text-xl font-bold text-gold mb-3">{item.title}</h3>
                <p className="text-body/80 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-24 md:py-32">
        <div className="container mx-auto max-w-4xl px-8 md:px-16 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-ink mb-5">¿Eres jugador de baloncesto?</h2>
          <p className="text-ink/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Si buscas representación profesional de calidad, nos gustaría conocerte.
            Contáctanos hoy para discutir cómo podemos ayudarte a alcanzar tus metas.
          </p>
          <Link
            href="/contacto"
            className="bg-ink text-gold px-8 py-4 rounded-full font-bold hover:bg-elevated transition inline-block"
          >
            Contactar a BMS
          </Link>
        </div>
      </section>
    </main>
  );
}
