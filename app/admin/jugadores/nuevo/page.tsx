import type { Metadata } from "next";
import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import FormularioAlta from "../FormularioAlta";

export const metadata: Metadata = {
  title: "Nuevo jugador · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** El siguiente BMS-00N libre, para no tener que mirarlo en el Excel. */
async function siguienteCodigo(): Promise<string> {
  try {
    const filas = (await db()`
      select bms_code from players where bms_code ~ '^BMS-[0-9]+$'
    `) as Array<{ bms_code: string }>;

    const mayor = filas.reduce((n, f) => Math.max(n, Number(f.bms_code.slice(4))), 0);
    return `BMS-${String(mayor + 1).padStart(3, "0")}`;
  } catch {
    return "";
  }
}

export default async function NuevoJugadorPage() {
  await exigeAdmin();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/jugadores" className="text-sm text-body/55 hover:text-gold-light">
          ← Jugadores
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-wide text-gold">Nuevo jugador</h1>
      </header>

      <FormularioAlta siguienteCodigo={await siguienteCodigo()} />
    </div>
  );
}
