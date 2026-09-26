import type { Metadata } from "next";
import Link from "next/link";

import { adminActual } from "@/lib/admin/auth";
import { cerrarSesionAction } from "./acciones";

// Envoltorio del panel. Solo la cáscara: quién puede ver cada página lo decide
// `exigeAdmin()` en la página, no este fichero.

export const metadata: Metadata = {
  title: "Panel · BMS",
  // El panel no se indexa ni se sigue. Tampoco entra en el sitemap.
  robots: { index: false, follow: false, nocache: true },
};

const SECCIONES = [
  { href: "/admin", texto: "Panel" },
  { href: "/admin/banners", texto: "Banners" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Puede ser null en /admin/login, que es la única página sin sesión.
  const admin = await adminActual();

  return (
    <div className="min-h-screen bg-ink text-body">
      {admin && (
        <header className="sticky top-0 z-30 border-b border-hairline bg-ink/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <Link href="/admin" className="font-bold tracking-wide text-gold">
              BMS · Panel
            </Link>

            <nav className="flex gap-4 text-sm">
              {SECCIONES.map((s) => (
                <Link key={s.href} href={s.href} className="hover:text-gold-light">
                  {s.texto}
                </Link>
              ))}
            </nav>

            <div className="ms-auto flex items-center gap-4 text-sm">
              <Link href="/" className="text-body/60 hover:text-gold-light">
                Ver la web
              </Link>
              <span className="hidden text-body/50 sm:inline">{admin.email}</span>
              <form action={cerrarSesionAction}>
                <button
                  type="submit"
                  className="rounded border border-hairline px-3 py-1 hover:border-gold hover:text-gold-light"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
