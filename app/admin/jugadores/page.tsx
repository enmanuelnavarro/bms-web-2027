import type { Metadata } from "next";

import { exigeAdmin } from "@/lib/admin/auth";
import { todosLosJugadores, type Jugador } from "@/lib/jugadores";
import { completitud } from "@/lib/completitud";
import { nombreCompleto } from "@/lib/players";
import Link from "next/link";
import Listado from "./Listado";

export const metadata: Metadata = {
  title: "Jugadores · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function JugadoresPage() {
  await exigeAdmin();

  let jugadores: Jugador[] = [];
  let fallo: string | null = null;
  try {
    jugadores = await todosLosJugadores();
  } catch (err) {
    console.error("[jugadores] no se pudo leer la tabla:", err);
    fallo = "No se pudo leer la base de datos. Comprueba DATABASE_URL y las migraciones.";
  }

  const filas = jugadores.map((j) => {
    const c = completitud(j);
    return {
      id: j.uuid!,
      slug: j.id,
      nombre: nombreCompleto(j),
      bms_code: j.bms_code,
      foto: j.foto,
      posicion: j.posicion,
      equipo: j.equipo_actual,
      pais: j.pais,
      estado: j.estado,
      publicacion: j.estado_publicacion,
      destacado: j.destacado,
      completitud: c.porcentaje,
      faltan: c.faltan.slice(0, 3),
      fotos: j.fotos.length,
    };
  });

  const media = filas.length
    ? Math.round(filas.reduce((n, f) => n + f.completitud, 0) / filas.length)
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gold">Jugadores</h1>
          <p className="mt-1 text-body/60">
            {filas.length} representados · fichas completas al {media} % de media
          </p>
        </div>

        <Link
          href="/admin/jugadores/nuevo"
          className="rounded bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-gold-light"
        >
          Nuevo jugador
        </Link>
      </header>

      {fallo ? (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {fallo}
        </p>
      ) : (
        <>
          <p className="rounded border border-hairline bg-elevated px-4 py-3 text-sm text-body/60">
            La barra mide lo que un club mira antes de pedir información: foto, estadísticas,
            posición, altura y equipo pesan más que el resto. Ordena por «menos completas primero»
            para ver dónde falta trabajo.
          </p>
          <Listado jugadores={filas} />
        </>
      )}
    </div>
  );
}
