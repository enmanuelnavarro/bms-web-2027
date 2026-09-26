import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { exigeAdmin } from "@/lib/admin/auth";
import { jugadorPorUuid, catalogo } from "@/lib/jugadores";
import { completitud } from "@/lib/completitud";
import { nombreCompleto } from "@/lib/players";
import Ficha from "../Ficha";

export const metadata: Metadata = {
  title: "Jugador · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function JugadorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  await exigeAdmin();

  const { id } = await params;
  const { nuevo } = await searchParams;
  const jugador = await jugadorPorUuid(id);
  if (!jugador) notFound();

  const [estados, tipos] = await Promise.all([catalogo("estado"), catalogo("tipo_jugador")]);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/jugadores" className="text-sm text-body/55 hover:text-gold-light">
          ← Jugadores
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-wide text-gold">
          {nombreCompleto(jugador)}
        </h1>
        <p className="mt-1 text-sm text-body/55">
          {jugador.bms_code ? `${jugador.bms_code} · ` : ""}
          /jugadores/{jugador.id}
        </p>
      </header>

      {nuevo === "1" && (
        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          Jugador creado como borrador. Rellena la ficha y, cuando esté lista, cámbiala a
          «Publicada» abajo del todo.
        </p>
      )}

      <Ficha
        jugador={jugador}
        completitud={completitud(jugador)}
        estados={estados}
        tipos={tipos}
      />
    </div>
  );
}
