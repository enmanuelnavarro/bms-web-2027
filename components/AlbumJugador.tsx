"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Foto } from "@/lib/jugadores";

// Álbum público del jugador.
//
// Para lo que existe: que un club interesado se lleve el material y monte su
// flyer sin escribir un correo y esperar dos días. Por eso cada foto se
// descarga a tamaño original, y hay un botón para llevárselas todas.
//
// Lo que se ve en la cuadrícula es la versión ligera; lo que se descarga es el
// archivo tal cual se subió.

const peso = (bytes: number | null) =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : null;

export default function AlbumJugador({
  fotos,
  nombre,
}: {
  fotos: Foto[];
  nombre: string;
}) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [descargando, setDescargando] = useState(false);

  const visibles = fotos.filter((f) => f.publicada);
  const descargables = visibles.filter((f) => f.url_original);

  // Escape cierra el visor, y las flechas pasan de foto.
  useEffect(() => {
    if (abierta === null) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
      if (e.key === "ArrowRight") setAbierta((i) => ((i ?? 0) + 1) % visibles.length);
      if (e.key === "ArrowLeft") setAbierta((i) => ((i ?? 0) - 1 + visibles.length) % visibles.length);
    };

    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierta, visibles.length]);

  if (visibles.length === 0) return null;

  /**
   * Descarga todas, una a una.
   *
   * Sin ZIP a propósito: comprimir exigiría una librería en el navegador y
   * cargar en memoria decenas de megas, o una función en el servidor que las
   * junte. Para ocho o diez fotos, disparar las descargas seguidas hace el
   * mismo trabajo sin nada de eso.
   */
  const descargaTodas = async () => {
    setDescargando(true);
    try {
      for (const [i, f] of descargables.entries()) {
        if (!f.url_original) continue;

        const enlace = document.createElement("a");
        enlace.href = f.url_original;
        enlace.download = `${nombre.replace(/\s+/g, "-").toLowerCase()}-${i + 1}`;
        enlace.rel = "noopener";
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        // Sin pausa, el navegador se come todas menos la primera.
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      setDescargando(false);
    }
  };

  const foto = abierta !== null ? visibles[abierta] : null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
            Material gráfico
          </h2>
          <p className="mt-1 text-sm text-body/60">
            {descargables.length > 0
              ? "Descarga libre para clubes y medios. Archivos a resolución original."
              : "Fotografías de " + nombre + "."}
          </p>
        </div>

        {descargables.length > 1 && (
          <button
            type="button"
            onClick={descargaTodas}
            disabled={descargando}
            className="rounded border border-gold px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-ink disabled:opacity-60"
          >
            {descargando ? "Descargando…" : `Descargar las ${descargables.length}`}
          </button>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibles.map((f, i) => (
          <li key={f.id} className="group relative">
            <button
              type="button"
              onClick={() => setAbierta(i)}
              className="block w-full overflow-hidden rounded border border-hairline transition hover:border-gold"
              aria-label={`Ampliar: ${f.alt || nombre}`}
            >
              <span className="relative block aspect-[4/5]">
                <Image
                  src={f.url}
                  alt={f.alt || nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: f.focus }}
                />
              </span>
            </button>

            {f.url_original && (
              <a
                href={f.url_original}
                download
                className="absolute bottom-2 right-2 rounded bg-ink/85 px-2 py-1 text-xs text-gold opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                Descargar{peso(f.bytes_original) ? ` · ${peso(f.bytes_original)}` : ""}
              </a>
            )}
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------------ visor */}
      {foto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={foto.alt || nombre}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setAbierta(null)}
        >
          <div
            className="relative max-h-full w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={foto.url}
                alt={foto.alt || nombre}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-body/70">
                {foto.alt || nombre}{" "}
                <span className="text-body/40">
                  · {abierta! + 1} de {visibles.length}
                </span>
              </p>

              <div className="flex gap-2">
                {foto.url_original && (
                  <a
                    href={foto.url_original}
                    download
                    className="rounded border border-gold px-3 py-1.5 text-sm text-gold transition hover:bg-gold hover:text-ink"
                  >
                    Descargar original
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setAbierta(null)}
                  className="rounded border border-hairline px-3 py-1.5 text-sm text-body/80 hover:border-gold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
