"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { subirLaminaAction } from "./acciones";
import { VACIO, type Estado } from "../estado";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Subiendo…" : "Subir lámina"}
    </button>
  );
}

export default function SubirLamina() {
  const [estado, accion] = useActionState<Estado, FormData>(subirLaminaAction, VACIO);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const formulario = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formulario}
      action={async (datos) => {
        await accion(datos);
        // Se limpia para que no se suba dos veces la misma por despiste.
        formulario.current?.reset();
        setVistaPrevia(null);
      }}
      className="rounded-lg border border-hairline bg-elevated p-4 sm:p-6"
    >
      <h2 className="mb-1 font-semibold text-gold">Subir una lámina</h2>
      <p className="mb-4 text-sm text-body/60">
        Se convierte a WebP y se limita a 2400 px en el servidor. Acepta JPG, PNG, WebP y AVIF,
        hasta 12 MB. Apaisada se ve mejor.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="imagen" className="mb-1.5 block text-sm text-body/70">
            Imagen
          </label>
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            onChange={(e) => {
              const f = e.target.files?.[0];
              setVistaPrevia(f ? URL.createObjectURL(f) : null);
            }}
            className="w-full rounded border border-hairline bg-ink px-3 py-2 text-sm text-body/80 file:mr-3 file:rounded file:border-0 file:bg-gold file:px-3 file:py-1.5 file:font-semibold file:text-ink"
          />
        </div>

        {vistaPrevia && (
          // eslint-disable-next-line @next/next/no-img-element -- es un blob: local, next/image no lo sirve
          <img
            src={vistaPrevia}
            alt="Vista previa de la imagen elegida"
            className="max-h-56 w-full rounded border border-hairline object-cover"
          />
        )}

        <div>
          <label htmlFor="alt" className="mb-1.5 block text-sm text-body/70">
            Descripción de la imagen
          </label>
          <input
            id="alt"
            name="alt"
            required
            maxLength={200}
            placeholder="Cuatro jugadores de BMS con la equipación de sus clubes"
            className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
          />
          <p className="mt-1 text-xs text-body/45">
            Es lo que lee quien no puede ver la imagen, y lo que sale si no carga.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="caption" className="mb-1.5 block text-sm text-body/70">
              Rótulo <span className="text-body/40">(opcional)</span>
            </label>
            <input
              id="caption"
              name="caption"
              maxLength={120}
              placeholder="Talento BMS en las mejores ligas del mundo"
              className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="focus" className="mb-1.5 block text-sm text-body/70">
              Punto focal <span className="text-body/40">(opcional)</span>
            </label>
            <input
              id="focus"
              name="focus"
              pattern="\d{1,3}% \d{1,3}%"
              placeholder="50% 50%"
              className="w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold"
            />
            <p className="mt-1 text-xs text-body/45">
              Qué parte no se recorta. Si hay caras arriba, prueba «50% 20%».
            </p>
          </div>
        </div>

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

        <Boton />
      </div>
    </form>
  );
}
