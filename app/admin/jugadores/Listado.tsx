"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Fila = {
  id: string;
  slug: string;
  nombre: string;
  bms_code: string | null;
  foto: string | null;
  posicion: string | null;
  equipo: string | null;
  pais: string | null;
  estado: string | null;
  publicacion: "borrador" | "publicado" | "archivado";
  destacado: boolean;
  completitud: number;
  faltan: string[];
  fotos: number;
};

const COLOR_PUBLICACION: Record<Fila["publicacion"], string> = {
  publicado: "bg-gold/20 text-gold-light",
  borrador: "bg-ink text-body/55 border border-hairline",
  archivado: "bg-ink text-body/35 border border-hairline",
};

/** Verde no: en esta paleta el dorado es lo bueno y el rojo lo urgente. */
function colorBarra(pct: number): string {
  if (pct >= 80) return "bg-gold";
  if (pct >= 50) return "bg-gold-dark";
  return "bg-red-500/60";
}

export default function Listado({ jugadores }: { jugadores: Fila[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [publicacion, setPublicacion] = useState<"todos" | Fila["publicacion"]>("todos");
  const [orden, setOrden] = useState<"nombre" | "completitud">("nombre");
  const [soloIncompletas, setSoloIncompletas] = useState(false);

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase();

    const lista = jugadores.filter((j) => {
      if (publicacion !== "todos" && j.publicacion !== publicacion) return false;
      if (soloIncompletas && j.completitud >= 80) return false;
      if (!t) return true;
      return [j.nombre, j.equipo, j.pais, j.posicion, j.bms_code]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t));
    });

    return orden === "completitud"
      ? [...lista].sort((a, b) => a.completitud - b.completitud)
      : lista;
  }, [jugadores, busqueda, publicacion, orden, soloIncompletas]);

  const cuenta = (p: Fila["publicacion"]) => jugadores.filter((j) => j.publicacion === p).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["todos", "publicado", "borrador", "archivado"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPublicacion(p)}
            className={`rounded px-3 py-1.5 text-sm capitalize transition ${
              publicacion === p ? "bg-gold text-ink" : "border border-hairline hover:border-gold"
            }`}
          >
            {p === "todos" ? "Todos" : p === "publicado" ? "Publicados" : p === "borrador" ? "Borradores" : "Archivados"}{" "}
            <span className="opacity-60">
              ({p === "todos" ? jugadores.length : cuenta(p)})
            </span>
          </button>
        ))}

        <label className="ms-auto flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soloIncompletas}
            onChange={(e) => setSoloIncompletas(e.target.checked)}
            className="accent-[var(--gold)]"
          />
          Solo fichas flojas
        </label>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as typeof orden)}
          className="rounded border border-hairline bg-ink px-2 py-1.5 text-sm outline-none focus:border-gold"
        >
          <option value="nombre">Por nombre</option>
          <option value="completitud">Menos completas primero</option>
        </select>
      </div>

      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, equipo, país, posición o código…"
        className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
      />

      <p className="text-sm text-body/50">
        {visibles.length} de {jugadores.length}
      </p>

      <ul className="space-y-2">
        {visibles.map((j) => (
          <li key={j.id}>
            <Link
              href={`/admin/jugadores/${j.id}`}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-elevated p-3 transition hover:border-gold"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-hairline bg-ink">
                {j.foto ? (
                  <Image src={j.foto} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-body/30">
                    sin foto
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-gold-light">{j.nombre}</strong>
                  {j.bms_code && <span className="text-xs text-body/40">{j.bms_code}</span>}
                  <span className={`rounded px-1.5 py-0.5 text-xs ${COLOR_PUBLICACION[j.publicacion]}`}>
                    {j.publicacion}
                  </span>
                  {j.destacado && (
                    <span className="rounded bg-ink px-1.5 py-0.5 text-xs text-gold">destacado</span>
                  )}
                </div>

                <p className="truncate text-sm text-body/55">
                  {[j.posicion, j.equipo, j.pais].filter(Boolean).join(" · ") || "Sin datos"}
                  {j.fotos > 1 && <span className="text-body/40"> · {j.fotos} fotos</span>}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 overflow-hidden rounded bg-ink">
                    <div
                      className={`h-full ${colorBarra(j.completitud)}`}
                      style={{ width: `${j.completitud}%` }}
                    />
                  </div>
                  <span className="text-xs text-body/45">{j.completitud}%</span>
                  {j.faltan.length > 0 && (
                    <span className="truncate text-xs text-body/35">falta {j.faltan.join(", ")}</span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
