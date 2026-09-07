import type { Metadata } from "next";
import Image from "next/image";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BMS · Basket Manager Sport | Representación de Baloncesto Profesional",
  description:
    "BMS — Basket Manager Sport. Agencia con licencia FIBA fundada en 2009, con sedes en Miami y República Dominicana. Representación, desarrollo y gestión de jugadores de baloncesto profesional. Una empresa en la que puedes confiar.",
};

const navLinks = [
  { href: "/", label: "Inicio", num: "01" },
  { href: "/jugadores", label: "Jugadores", num: "02" },
  { href: "/agencia", label: "Agencia", num: "03" },
  { href: "/noticias", label: "Noticias", num: "04" },
  { href: "/testimonios", label: "Testimonios", num: "05" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* ===== HEADER ===== */}
        <header className="bg-ink/90 backdrop-blur-md sticky top-0 z-50 border-b border-hairline">
          <nav className="container-pro flex justify-between items-center h-20">
            {/* LOGO */}
            <a href="/" className="flex-shrink-0">
              <Image
                src="/logos/bms-oscuro.png"
                alt="BMS — Basket Manager Sport"
                width={104}
                height={80}
                priority
                className="h-12 w-auto"
              />
            </a>

            {/* NAV DESKTOP */}
            <div className="hidden lg:flex items-center gap-9">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="group flex items-baseline gap-1.5 text-sm font-semibold text-gold hover:text-gold-light transition"
                >
                  <span className="font-display text-[0.7rem] text-gold-dark opacity-90 group-hover:text-gold-light">
                    {l.num}
                  </span>
                  {l.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <a
                href="/contacto"
                className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-ink text-sm font-bold rounded-full transition link-arrow"
              >
                Contacto <span className="arrow">→</span>
              </a>
              <button className="lg:hidden text-gold" aria-label="Menú">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        {/* ===== MAIN ===== */}
        <main>{children}</main>

        {/* ===== FOOTER (oscuro editorial) ===== */}
        <footer className="bg-elevated text-body border-t border-hairline">
          {/* Franja superior con gran claim */}
          <div className="container-pro pt-24 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16">
              <h2 className="headline-lg text-gold max-w-3xl">
                Vive el <span className="text-gold-light">baloncesto</span> con nosotros
              </h2>
              <a
                href="/contacto"
                className="link-arrow text-gold-light text-lg whitespace-nowrap border-b-2 border-gold pb-1"
              >
                Empieza tu carrera <span className="arrow">→</span>
              </a>
            </div>

            <div className="hairline-light mb-16" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* MARCA */}
              <div>
                <Image
                  src="/logos/bms-oscuro.png"
                  alt="BMS"
                  width={96}
                  height={72}
                  className="h-11 w-auto mb-5"
                />
                <p className="text-sm text-body/80 leading-relaxed">
                  Agencia líder en representación de jugadores de baloncesto profesional a nivel mundial.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-ink bg-gold px-3 py-1.5 rounded-full">
                  ✓ Agente FIBA Certificado
                </p>
              </div>

              {/* NAVEGACIÓN */}
              <div>
                <h4 className="text-gold-dark font-bold text-xs mb-5 uppercase tracking-[0.2em]">Navegación</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="/jugadores" className="text-body/80 hover:text-gold-light transition">Jugadores</a></li>
                  <li><a href="/agencia" className="text-body/80 hover:text-gold-light transition">Agencia</a></li>
                  <li><a href="/noticias" className="text-body/80 hover:text-gold-light transition">Noticias</a></li>
                  <li><a href="/testimonios" className="text-body/80 hover:text-gold-light transition">Testimonios</a></li>
                </ul>
              </div>

              {/* OFICINAS */}
              <div>
                <h4 className="text-gold-dark font-bold text-xs mb-5 uppercase tracking-[0.2em]">Oficinas</h4>
                <ul className="space-y-4 text-sm text-body/70">
                  <li>
                    <p className="font-semibold text-gold-light">República Dominicana</p>
                    <p>Oficina principal</p>
                  </li>
                  <li>
                    <p className="font-semibold text-gold-light">Miami, Florida</p>
                    <p>Estados Unidos</p>
                  </li>
                </ul>
              </div>

              {/* CONTACTO */}
              <div>
                <h4 className="text-gold-dark font-bold text-xs mb-5 uppercase tracking-[0.2em]">Contacto</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="mailto:contact@bmsagency.net" className="text-body/80 hover:text-gold-light transition">contact@bmsagency.net</a></li>
                  <li><a href="mailto:info@bmsagency.net" className="text-body/80 hover:text-gold-light transition">info@bmsagency.net</a></li>
                </ul>
                <div className="flex gap-3 mt-5">
                  <a href="https://instagram.com/bmsagency" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-sm">IG</a>
                  <a href="https://twitter.com/bmsagency" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-sm">X</a>
                  <a href="https://youtube.com/@bmsagency" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-xs">YT</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-hairline">
            <div className="container-pro py-6 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-body/65">
                &copy; 2026 BMS · Basket Manager Sport · Licencia FIBA #2014501744. Todos los derechos reservados.
              </p>
              <div className="flex gap-6 text-xs text-body/65">
                <a href="#" className="hover:text-gold transition">Privacidad</a>
                <a href="#" className="hover:text-gold transition">Términos</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
