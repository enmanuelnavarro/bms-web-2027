"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { Foto } from "@/lib/jugadores";
import {
  subirFotosAction,
  borrarFotoAction,
  fotoPrincipalAction,
  editarFotoAction,
} from "./acciones";
import { VACIO, type Estado } from "../estado";

// Álbum del jugador.
//
// Para lo que pediste: que un club interesado se lleve el material y monte su
// flyer sin escribir un correo y esperar dos días.
//
// De cada foto se guardan dos versiones. La optimizada es la que se ve aquí y
// en la web; el original, sin recomprimir, es el que se descarga. Por eso cada
// tarjeta enseña el peso del original: quien sube sabe qué está ofreciendo.

const TIPOS = [
  { valor: "accion", texto: "En acción" },
  { valor: "cuerpo", texto: "Cuerpo entero" },
  { valor: "equipo", texto: "Con el equipo" },
] as const;

function Subir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Subiendo…" : "Subir al álbum"}
    </button>
  );
}

const peso = (bytes: number | null) =>
  bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : "—";

export default function Album({
  playerId,
  slug,
  fotos,
}: {
  playerId: string;
  slug: string;
  fotos: Foto[];
}) {
  const [estado, accion] = useActionState<Estado, FormData>(subirFotosAction, VACIO);
  const [elegidas, setElegidas] = useState(0);

  const publicadas = fotos.filter((f) => f.publicada).length;

  return (
    <section className="space-y-5 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
      <div>
        <h2 className="font-semibold text-gold">
          Álbum de fotos{" "}
          <span className="text-sm font-normal text-body/50">
            ({fotos.length} · {publicadas} visible{publicadas === 1 ? "" : "s"})
          </span>
        </h2>
        <p className="mt-1 text-sm text-body/55">
          Se publican en la ficha del jugador y cualquier club puede descargarlas a tamaño
          original para hacer sus flyers. Sube el archivo bueno, no una captura de pantalla.
        </p>
      </div>

      {/* ------------------------------------------------------------ subir */}
      <form action={accion} className="space-y-3 rounded border border-hairline/60 bg-ink/40 p-3">
        <input type="hidden" name="id" value={playerId} />

        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <div>
            <label htmlFor={`fotos-${playerId}`} className="mb-1.5 block text-sm text-body/70">
              Fotos <span className="text-body/40">(se pueden elegir varias)</span>
            </label>
            <input
              id={`fotos-${playerId}`}
              name="fotos"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setElegidas(e.target.files?.length ?? 0)}
              className="w-full rounded border border-hairline bg-ink px-3 py-2 text-sm text-body/80 file:mr-3 file:rounded file:border-0 file:bg-gold file:px-3 file:py-1.5 file:font-semibold file:text-ink"
            />
          </div>

          <div>
            <label htmlFor={`tipo-${playerId}`} className="mb-1.5 block text-sm text-body/70">
              Tipo
            </label>
            <select
              id={`tipo-${playerId}`}
              name="tipo"
              className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {elegidas > 0 && (
          <p className="text-sm text-body/55">
            {elegidas} archivo{elegidas === 1 ? "" : "s"} elegido{elegidas === 1 ? "" : "s"}.
            Máximo 20 de una vez, 12 MB cada uno.
          </p>
        )}

        {estado.error && (
          <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {estado.error}
          </p>
        )}
        {estado.ok && (
          <p className="rounded border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            {estado.ok}
          </p>
        )}

        <Subir />
      </form>

      {/* ----------------------------------------------------------- listado */}
      {fotos.length === 0 ? (
        <p className="rounded border border-dashed border-hairline px-4 py-8 text-center text-body/45">
          El álbum está vacío.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {fotos.map((f) => (
            <li
              key={f.id}
              className={`rounded border p-3 ${
                f.publicada ? "border-hairline" : "border-hairline/40 opacity-60"
              }`}
            >
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded border border-hairline bg-ink">
                <Image
                  src={f.url}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 20rem"
                  className="object-cover"
                  style={{ objectPosition: f.focus }}
                />
                {f.tipo === "principal" && (
                  <span className="absolute left-2 top-2 rounded bg-gold px-2 py-0.5 text-xs font-semibold text-ink">
                    De la ficha
                  </span>
                )}
              </div>

              <form action={editarFotoAction} className="space-y-2">
                <input type="hidden" name="foto" value={f.id} />

                <input
                  name="alt"
                  defaultValue={f.alt}
                  maxLength={200}
                  placeholder="Qué se ve en la foto"
                  className="w-full rounded border border-hairline bg-ink px-2.5 py-1.5 text-sm text-body outline-none focus:border-gold"
                />

                <div className="flex items-center gap-2">
                  <input
                    name="focus"
                    defaultValue={f.focus}
                    pattern="\d{1,3}% \d{1,3}%"
                    className="w-28 rounded border border-hairline bg-ink px-2.5 py-1.5 text-sm text-body outline-none focus:border-gold"
                    title="Punto que no se recorta"
                  />
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="publicada"
                      defaultChecked={f.publicada}
                      className="accent-[var(--gold)]"
                    />
                    Visible
                  </label>
                  <button
                    type="submit"
                    className="ms-auto rounded border border-hairline px-2.5 py-1 text-sm transition hover:border-gold hover:text-gold-light"
                  >
                    Guardar
                  </button>
                </div>
              </form>

              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-hairline/50 pt-2 text-xs">
                <span className="text-body/40">
                  {f.ancho && f.alto ? `${f.ancho}×${f.alto}` : "—"} · original {peso(f.bytes_original)}
                </span>

                {f.url_original && (
                  <a
                    href={f.url_original}
                    download
                    className="text-gold hover:text-gold-light"
                  >
                    Descargar
                  </a>
                )}

                {f.tipo !== "principal" && (
                  <form action={fotoPrincipalAction}>
                    <input type="hidden" name="foto" value={f.id} />
                    <input type="hidden" name="id" value={playerId} />
                    <button type="submit" className="text-gold hover:text-gold-light">
                      Usar en la ficha
                    </button>
                  </form>
                )}

                <form
                  action={borrarFotoAction}
                  className="ms-auto"
                  onSubmit={(e) => {
                    if (!window.confirm("¿Eliminar esta foto? No se puede deshacer.")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="foto" value={f.id} />
                  <button type="submit" className="text-body/50 hover:text-red-300">
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {publicadas > 0 && (
        <p className="text-sm text-body/45">
          Los clubes las ven y las descargan en{" "}
          <a
            href={`/jugadores/${slug}`}
            target="_blank"
            rel="noopener"
            className="text-gold hover:text-gold-light"
          >
            /jugadores/{slug}
          </a>
          .
        </p>
      )}
    </section>
  );
}
