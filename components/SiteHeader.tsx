"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/agencia", label: "Agencia" },
  { href: "/noticias", label: "Noticias" },
  { href: "/testimonios", label: "Testimonios" },
];

/**
 * Cabecera del sitio. Es cliente porque el menú de móvil necesita estado: el
 * layout es un Server Component y no puede abrir ni cerrar nada.
 */
export default function SiteHeader() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  /* Al cambiar de página el menú se cierra solo. */
  useEffect(() => setAbierto(false), [pathname]);

  /* Con el menú abierto: Escape lo cierra y el fondo no hace scroll. */
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alPulsar);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  return (
    <header className="bg-ink/90 backdrop-blur-md sticky top-0 z-50 border-b border-hairline">
      <nav className="container-pro flex justify-between items-center h-20">
        {/* LOGO */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logos/bms-oscuro.png"
            alt="BMS — Basket Manager Sport"
            width={104}
            height={80}
            priority
            className="h-12 w-auto"
          />
        </Link>

        {/* NAV DESKTOP */}
        <div className="hidden lg:flex items-center gap-9">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-gold hover:text-gold-light transition"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA + HAMBURGUESA */}
        <div className="flex items-center gap-4">
          <Link
            href="/contacto"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-ink text-sm font-bold rounded-full transition link-arrow"
          >
            Contacto <span className="arrow">→</span>
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="lg:hidden text-gold p-1 -mr-1"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
            aria-controls="menu-movil"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {abierto ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6l12 12M18 6L6 18"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* MENÚ MÓVIL */}
      {abierto && (
        <div
          id="menu-movil"
          className="lg:hidden border-t border-hairline bg-ink/98 backdrop-blur-md"
        >
          <div className="container-pro py-6 flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAbierto(false)}
                className="py-4 border-b border-hairline text-base font-semibold text-gold hover:text-gold-light transition"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setAbierto(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-ink text-sm font-bold rounded-full transition link-arrow"
            >
              Contacto <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
