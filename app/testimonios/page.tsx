"use client";

import Link from "next/link";

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Juan García",
      position: "Base",
      team: "San Antonio Spurs",
      country: "Argentina",
      image: "JG",
      quote:
        "BMS ha sido fundamental en mi carrera. Su asesoramiento profesional y conexiones globales me permitieron alcanzar mi sueño de jugar en la NBA.",
    },
    {
      id: 2,
      name: "Carlos Martínez",
      position: "Alero",
      team: "Real Madrid",
      country: "España",
      image: "CM",
      quote:
        "Desde el primer momento, BMS ha estado comprometida con mi desarrollo. Su dedicación y conocimiento del mercado son incomparables.",
    },
    {
      id: 3,
      name: "Mateo López",
      position: "Ala-Pívot",
      team: "Peñarol",
      country: "Uruguay",
      image: "ML",
      quote:
        "BMS no solo me representa, me acompaña en cada paso de mi carrera. Su visión global me ha abierto oportunidades que nunca imaginé.",
    },
    {
      id: 4,
      name: "Federico Silva",
      position: "Pívot",
      team: "Flamengo",
      country: "Brasil",
      image: "FS",
      quote:
        "La profesionalidad y el compromiso de BMS con sus clientes es excepcional. Recomiendo sus servicios sin dudarlo a otros jugadores.",
    },
    {
      id: 5,
      name: "Alejandro Fernández",
      position: "Escolta",
      team: "Fuerza Regia",
      country: "Puerto Rico",
      image: "AF",
      quote:
        "BMS entiende el negocio del baloncesto como pocos. Su asesoramiento me ayudó a tomar decisiones correctas en momentos clave de mi carrera.",
    },
    {
      id: 6,
      name: "Luciano Rodríguez",
      position: "Alero",
      team: "Cali Balonesto",
      country: "Colombia",
      image: "LR",
      quote:
        "El equipo de BMS siempre está disponible cuando los necesito. Su atención personalizada marca la diferencia en esta industria.",
    },
  ];

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HEADER EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">05</span>
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">05</span> Testimonios
          </div>
          <h1 className="headline-lg text-gold">Lo que dicen<br />nuestros jugadores</h1>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="card-dark rounded-2xl p-8 hover:border-gold transition"
              >
                {/* AVATAR */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-ink font-bold text-lg mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gold">
                      {testimonial.name}
                    </h3>
                    <p className="text-gold-light font-semibold text-sm">
                      {testimonial.position}
                    </p>
                    <p className="text-body/60 text-xs">
                      {testimonial.team} • {testimonial.country}
                    </p>
                  </div>
                </div>

                {/* QUOTE */}
                <div className="relative">
                  <div className="text-2xl md:text-3xl text-gold/40 mb-2" aria-hidden="true">
                    &ldquo;
                  </div>
                  <p className="text-body/90 italic leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>

                {/* STARS */}
                <div className="flex gap-1 mt-6 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO TESTIMONIAL SECTION */}
      <section className="py-24 px-4 bg-elevated border-y border-hairline">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-lg md:text-xl font-bold text-gold mb-10 text-center">
            Lo Que Nos Hace Diferentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌍",
                title: "Red Global",
                description:
                  "Conexiones en las mejores ligas del mundo para maximizar oportunidades",
              },
              {
                icon: "📊",
                title: "Análisis Profesional",
                description:
                  "Evaluación profunda del mercado para tomar decisiones estratégicas",
              },
              {
                icon: "🤝",
                title: "Apoyo Integral",
                description:
                  "Asesoramiento completo en carrera, finanzas y desarrollo personal",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-ink border border-hairline rounded-2xl p-6 text-center hover:border-gold transition"
              >
                <div className="text-2xl md:text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gold mb-3">
                  {feature.title}
                </h3>
                <p className="text-body/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-lg md:text-xl font-bold text-gold mb-5">
            ¿Listo para unirte a nuestro equipo de campeones?
          </h2>
          <p className="text-body mb-10">
            Descubre cómo BMS puede potenciar tu carrera en el baloncesto profesional
          </p>
          <Link href="/contacto" className="btn-gold">
            Contactar Ahora
          </Link>
        </div>
      </section>
    </main>
  );
}
