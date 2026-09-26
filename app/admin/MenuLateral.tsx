"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SECCIONES } from "./secciones";
import Icono from "./Icono";

// Menú lateral, al estilo de un ERP.
//
// En escritorio va fijo a la izquierda. En móvil se esconde y sale como cajón
// desde el lateral, porque el panel se usa desde el teléfono en eventos y una
// columna fija se comería media pantalla.

export default function MenuLateral({
  email,
  nombre,
  salir,
  children,
}: {
  email: string;
  nombre: string | null;
  /** Server action, pasada desde el layout: no hace falta una ruta aparte. */
  salir: () => Promise<void>;
  children: React.ReactNode;
}) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Al navegar se cierra el cajón: si no, tapa la página a la que acabas de ir.
  useEffect(() => setAbierto(false), [ruta]);

  // Escape cierra, como cualquier diálogo.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  /** /admin solo se marca en su propia ruta; el resto, también en sus hijas. */
  const activa = (href: string) =>
    href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);

  return (
    <div className="min-h-screen bg-ink text-body">
      {/* Barra superior, solo en móvil */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el menú"
          aria-expanded={abierto}
          className="rounded border border-hairline p-1.5 hover:border-gold hover:text-gold-light"
        >
          <Icono nombre="menu" />
        </button>
        <span className="font-bold tracking-wide text-gold">BMS · Panel</span>
      </header>

      {/* Velo del cajón */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hairline bg-elevated transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            abierto ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Secciones del panel"
        >
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-4">
            <Image
              src="/logos/bms-blanco.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold tracking-wide text-gold">BMS</span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el menú"
              className="ms-auto rounded p-1 hover:text-gold-light lg:hidden"
            >
              <Icono nombre="cerrar" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {SECCIONES.map((s) => {
                const esta = activa(s.href);

                if (!s.lista) {
                  return (
                    <li key={s.href}>
                      <span
                        className="flex cursor-default items-center gap-3 rounded px-3 py-2 text-sm opacity-40"
                        title="Todavía no está construida"
                      >
                        <Icono nombre={s.icono} />
                        {s.titulo}
                        <span className="ms-auto text-[0.65rem] uppercase tracking-wide">
                          pronto
                        </span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={esta ? "page" : undefined}
                      className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition ${
                        esta
                          ? "bg-gold/15 font-semibold text-gold"
                          : "hover:bg-ink hover:text-gold-light"
                      }`}
                    >
                      <Icono nombre={s.icono} />
                      {s.titulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-hairline p-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-ink hover:text-gold-light"
            >
              <Icono nombre="web" />
              Ver la web
            </Link>

            <div className="mt-2 rounded bg-ink px-3 py-2">
              <p className="truncate text-sm text-body/80">{nombre ?? email}</p>
              {nombre && <p className="truncate text-xs text-body/45">{email}</p>}
            </div>

            <form action={salir} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm hover:bg-ink hover:text-gold-light"
              >
                <Icono nombre="salir" />
                Salir
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
