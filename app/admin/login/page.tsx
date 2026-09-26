import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { adminActual } from "@/lib/admin/auth";
import FormularioLogin from "./FormularioLogin";

export const metadata: Metadata = {
  title: "Entrar · Panel BMS",
  robots: { index: false, follow: false },
};

// Sin sesión no se puede prerenderizar: hay que leer la cookie en cada visita.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  // Si ya hay sesión, no se enseña el formulario otra vez.
  if (await adminActual()) redirect("/admin");

  const { volver = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="mb-8 text-center">
        <Image
          src="/logos/bms-blanco.png"
          alt="BMS"
          width={72}
          height={72}
          className="mx-auto mb-4 h-16 w-auto object-contain"
          priority
        />
        <h1 className="text-xl font-bold tracking-wide text-gold">Panel de administración</h1>
        <p className="mt-1 text-sm text-body/60">Solo para el equipo de BMS.</p>
      </div>

      <FormularioLogin volver={volver} />
    </div>
  );
}
