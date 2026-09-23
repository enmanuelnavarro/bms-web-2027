import type { Metadata } from "next";
import Image from "next/image";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { SITE } from "@/lib/site";

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

const DESCRIPTION =
  "BMS — Basket Manager Sport. Agencia con licencia FIBA desde 2009, con sedes en Miami y República Dominicana. Más de 100 jugadores de baloncesto profesional disponibles para clubes de todo el mundo: scouting, negociación y trámites FIBA de principio a fin.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "BMS · Basket Manager Sport | Ficha Jugadores de Baloncesto Profesional",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE.url,
    siteName: SITE.legalName,
    title: "BMS · Basket Manager Sport | Ficha Jugadores de Baloncesto Profesional",
    description: DESCRIPTION,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* ===== HEADER ===== */}
        <SiteHeader />

        {/* ===== MAIN ===== */}
        <main>{children}</main>

        {/* ===== FOOTER (oscuro editorial) ===== */}
        <footer className="bg-elevated text-body border-t border-hairline">
          {/* Franja superior con gran claim */}
          <div className="container-pro pt-24 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16">
              <h2 className="headline-lg text-gold max-w-3xl">
                El <span className="text-gold-light">jugador</span> que tu club busca,
                lo tenemos nosotros
              </h2>
              <a
                href="/contacto"
                className="link-arrow text-gold-light text-lg whitespace-nowrap border-b-2 border-gold pb-1"
              >
                Solicitar jugadores <span className="arrow">→</span>
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
                    <p className="font-semibold text-gold-light">{SITE.offices.rd.label}</p>
                    <p>{SITE.offices.rd.address}</p>
                    <a href={`tel:${SITE.offices.rd.phoneHref}`} className="hover:text-gold-light transition">{SITE.offices.rd.phone}</a>
                  </li>
                  <li>
                    <p className="font-semibold text-gold-light">{SITE.offices.miami.label}</p>
                    <p>{SITE.offices.miami.address}</p>
                    <a href={`tel:${SITE.offices.miami.phoneHref}`} className="hover:text-gold-light transition">{SITE.offices.miami.phone}</a>
                  </li>
                </ul>
              </div>

              {/* CONTACTO */}
              <div>
                <h4 className="text-gold-dark font-bold text-xs mb-5 uppercase tracking-[0.2em]">Contacto</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href={`mailto:${SITE.email}`} className="text-body/80 hover:text-gold-light transition">{SITE.email}</a></li>
                  <li><a href={`mailto:${SITE.infoEmail}`} className="text-body/80 hover:text-gold-light transition">{SITE.infoEmail}</a></li>
                  <li><a href={`https://wa.me/${SITE.whatsappHref}`} target="_blank" rel="noopener noreferrer" className="text-body/80 hover:text-gold-light transition">WhatsApp · {SITE.whatsapp}</a></li>
                </ul>
                <div className="flex gap-3 mt-5">
                  <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de BMS (@${SITE.instagramHandle})`} className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-sm">IG</a>
                  <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de BMS" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-sm">FB</a>
                  <a href={SITE.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X de BMS" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-sm">X</a>
                  <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube de BMS" className="w-9 h-9 rounded-full border border-hairline text-gold hover:bg-gold hover:text-ink flex items-center justify-center transition text-xs">YT</a>
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
