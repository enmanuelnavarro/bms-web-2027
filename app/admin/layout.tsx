import type { Metadata } from "next";

import { adminActual } from "@/lib/admin/auth";
import { cerrarSesionAction } from "./acciones";
import MenuLateral from "./MenuLateral";

// Envoltorio del panel. Solo la cáscara: quién puede ver cada página lo decide
// `exigeAdmin()` en la página, no este fichero.

export const metadata: Metadata = {
  title: "Panel · BMS",
  // El panel no se indexa ni se sigue. Tampoco entra en el sitemap.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await adminActual();

  // /admin/login es la única página sin sesión: va suelta, sin menú.
  if (!admin) {
    return <div className="min-h-screen bg-ink px-4 py-10 text-body">{children}</div>;
  }

  return (
    <MenuLateral email={admin.email} nombre={admin.nombre} salir={cerrarSesionAction}>
      {children}
    </MenuLateral>
  );
}
