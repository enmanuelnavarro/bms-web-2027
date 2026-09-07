"use client";

import { useState } from "react";

import { SERVICES } from "@/lib/site";

type Service = { icon: string; title: string; text: string };

const DATA: Record<"jugadores" | "clubes", readonly Service[]> = {
  jugadores: SERVICES,
  clubes: [
    { icon: "🔍", title: "Scouting de Talento", text: "Identificamos y presentamos jugadores que encajan con el perfil y presupuesto de tu club." },
    { icon: "🤝", title: "Intermediación", text: "Gestionamos fichajes, cesiones y renovaciones con transparencia y rapidez." },
    { icon: "📊", title: "Análisis de Datos", text: "Informes estadísticos y de rendimiento para decisiones de fichaje bien fundadas." },
    { icon: "🌍", title: "Alcance Internacional", text: "Acceso a un roster de más de 100 jugadores en más de 20 países." },
    { icon: "📝", title: "Gestión Documental", text: "Tramitación de licencias FIBA, visados y documentación deportiva internacional." },
    { icon: "🎯", title: "Asesoría Estratégica", text: "Acompañamiento en la construcción de plantillas competitivas y sostenibles." },
  ],
};

export default function ServiceTabs() {
  const [tab, setTab] = useState<"jugadores" | "clubes">("jugadores");

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-3 mb-12">
        {(["jugadores", "clubes"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition ${
              tab === key
                ? "bg-gold text-ink"
                : "bg-elevated text-body/70 border border-hairline hover:border-gold-dark hover:text-gold"
            }`}
          >
            {key === "jugadores" ? "Para Jugadores" : "Para Clubes"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(201,162,39,0.15)] border border-hairline rounded-2xl overflow-hidden">
        {DATA[tab].map((s, i) => (
          <div key={i} className="group bg-ink p-8 hover:bg-elevated transition-colors duration-300">
            {/* El número es decorativo: tenue y separado del título. */}
            <div className="flex items-start justify-between mb-8">
              <span className="text-3xl">{s.icon}</span>
              <span
                aria-hidden="true"
                className="font-display text-lg text-gold/25 group-hover:text-gold/60 transition-colors"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-lg font-black text-gold group-hover:text-gold-light transition-colors mb-4">
              {s.title}
            </h3>
            <p className="text-body/80 leading-relaxed text-sm transition-colors">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
