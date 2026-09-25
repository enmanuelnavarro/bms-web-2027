"use client";

import Image from "next/image";
import Link from "next/link";

import type { ExecutiveProfile } from "@/lib/types";
import CountUp from "@/components/CountUp";

// Ficha de una persona del equipo: /agencia/frank-brito, /agencia/enmanuel-navarro.
//
// Una sola plantilla para todos los perfiles. Cada bloque —el sello de la foto,
// las cifras, las etiquetas, las redes— solo se pinta si la ficha lo trae, así
// que un perfil sin cifras no enseña cuadros vacíos ni obliga a inventarlas.

const FILOSOFIA = [
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
];

export default function PerfilEjecutivo({ perfil }: { perfil: ExecutiveProfile }) {
  const nombrePila = perfil.nombre.split(" ")[0];
  const redes = perfil.redes_sociales ?? {};
  const tieneRedes = Boolean(redes.linkedin || redes.instagram || redes.twitter);

  return (
    <main className="bg-ink text-body">
      {/* CABECERA */}
      <div className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <div className="container-pro relative z-10 py-20 md:py-28">
          <Link href="/agencia" className="link-arrow text-body/70 hover:text-gold mb-10 flex w-fit">
            <span className="rotate-180 arrow">→</span> Volver a la Agencia
          </Link>
          <div className="eyebrow text-gold-dark mb-8 flex w-fit">{perfil.cargo}</div>
          <h1 className="headline-lg text-gold">{perfil.nombre}</h1>
          <p className="text-lg text-gold-light">{perfil.subtitulo}</p>
        </div>
      </div>

      {/* PERFIL */}
      <div className="container mx-auto max-w-7xl px-8 md:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* FOTO Y CONTACTO */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-md mb-8">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-elevated border border-hairline">
                <Image
                  src={perfil.foto}
                  alt={`${perfil.nombre} — ${perfil.cargo} de BMS`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 28rem"
                  className="object-cover object-top"
                />
              </div>
              {perfil.insignia && (
                <div className="absolute -bottom-4 -right-4 z-10 bg-gold text-ink px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <div className="text-sm leading-tight">
                    <div className="font-bold">{perfil.insignia.titulo}</div>
                    <div className="text-xs">{perfil.insignia.pie}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-md card-dark rounded-2xl p-6 mt-8">
              <h2 className="text-lg font-bold mb-4 text-gold">Contacto Directo</h2>

              {perfil.email_contacto && (
                <div className="mb-4">
                  <p className="text-gold-dark text-sm mb-1">Email</p>
                  <a
                    href={`mailto:${perfil.email_contacto}`}
                    className="font-bold text-gold hover:text-gold-light transition break-all"
                  >
                    {perfil.email_contacto}
                  </a>
                </div>
              )}

              {perfil.telefono_contacto && (
                <div className="mb-6">
                  <p className="text-gold-dark text-sm mb-1">Teléfono</p>
                  <a
                    href={`tel:${perfil.telefono_contacto.replace(/[^+\d]/g, "")}`}
                    className="font-bold text-gold hover:text-gold-light transition"
                  >
                    {perfil.telefono_contacto}
                  </a>
                </div>
              )}

              {perfil.cta && (
                <Link
                  href={perfil.cta.href}
                  className="w-full bg-gold text-ink px-4 py-3 rounded-full font-bold hover:bg-gold-light transition block text-center"
                >
                  {perfil.cta.texto}
                </Link>
              )}
            </div>
          </div>

          {/* TEXTO */}
          <div>
            {perfil.destacado && (
              <div className="bg-elevated border-l-4 border-gold p-8 rounded-r-lg mb-8">
                <p className="text-xl italic text-gold-light leading-relaxed">
                  {perfil.destacado_es_cita ? `“${perfil.destacado}”` : perfil.destacado}
                </p>
              </div>
            )}

            <div className="mb-10 space-y-4">
              <h2 className="text-2xl font-bold text-gold">{perfil.bio_titulo}</h2>
              <p className="text-body leading-relaxed text-lg">{perfil.bio}</p>
            </div>

            {perfil.logros && perfil.logros.length > 0 && (
              <div
                className={`grid gap-4 mb-10 ${
                  perfil.logros.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {perfil.logros.map((logro) => (
                  <div
                    key={logro.titulo}
                    className="card-dark rounded-2xl p-6 hover:border-gold transition text-center"
                  >
                    {logro.icono && <p className="text-lg md:text-xl mb-2">{logro.icono}</p>}
                    <CountUp
                      value={String(logro.valor)}
                      className="block text-gold font-black text-lg md:text-xl mb-1"
                    />
                    <p className="text-body/70 text-sm font-medium">{logro.titulo}</p>
                  </div>
                ))}
              </div>
            )}

            {perfil.etiquetas && perfil.etiquetas.items.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-gold mb-4">{perfil.etiquetas.titulo}</h2>
                <div className="flex flex-wrap gap-2">
                  {perfil.etiquetas.items.map((item) => (
                    <span
                      key={item}
                      className="bg-elevated border border-hairline text-gold px-4 py-2 rounded-full font-semibold text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tieneRedes && (
              <div>
                <h2 className="text-lg font-bold text-gold mb-4">Conecta Profesionalmente</h2>
                <div className="flex gap-4">
                  {redes.linkedin && (
                    <a
                      href={redes.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border border-hairline text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-ink transition text-xl font-bold"
                      title="LinkedIn"
                    >
                      in
                    </a>
                  )}
                  {redes.instagram && (
                    <a
                      href={redes.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border border-hairline text-gold rounded-full flex items-center justify-center hover:bg-gold hover:text-ink transition"
                      title="Instagram"
                    >
                      📷
                    </a>
                  )}
                  {redes.twitter && (
                    <a
                      href={redes.twitter}
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
            )}
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
            {FILOSOFIA.map((item) => (
              <div
                key={item.title}
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
          <h2 className="text-2xl md:text-3xl font-black text-ink mb-5">
            ¿Quieres hablar con {nombrePila}?
          </h2>
          <p className="text-ink/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Escríbenos y te ponemos en contacto con la persona adecuada del equipo de BMS.
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
