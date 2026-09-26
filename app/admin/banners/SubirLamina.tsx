"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { subirLaminaAction } from "./acciones";
import { VACIO, type Estado } from "../estado";
import SelectorDeFoco from "../SelectorDeFoco";
import VistaPrevia from "./VistaPrevia";

// Subida de una lámina, con el constructor al lado: se ve cómo va a quedar
// antes de guardar, no después de recargar la portada.

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

const ENTRADA =
  "w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold";

export default function SubirLamina() {
  const [estado, accion] = useActionState<Estado, FormData>(subirLaminaAction, VACIO);
  const formulario = useRef<HTMLFormElement>(null);

  // Estado local solo para el constructor: lo que se guarda va en el formulario.
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [foco, setFoco] = useState("50% 50%");

  const limpia = () => {
    formulario.current?.reset();
    setVistaPrevia(null);
    setAlt("");
    setCaption("");
    setFoco("50% 50%");
  };

  return (
    <form
      ref={formulario}
      action={async (datos) => {
        await accion(datos);
        // Se limpia para no subir dos veces la misma por despiste.
        limpia();
      }}
      className="rounded-lg border border-hairline bg-elevated p-4 sm:p-6"
    >
      <h2 className="mb-1 font-semibold text-gold">Subir una lámina</h2>
      <p className="mb-4 text-sm text-body/60">
        Se convierte a WebP y se limita a 2400 px en el servidor. Acepta JPG, PNG, WebP y AVIF,
        hasta 12 MB. Apaisada se ve mejor.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------ campos */}
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

          <div>
            <label htmlFor="alt" className="mb-1.5 block text-sm text-body/70">
              Descripción de la imagen
            </label>
            <input
              id="alt"
              name="alt"
              required
              maxLength={200}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Cuatro jugadores de BMS con la equipación de sus clubes"
              className={ENTRADA}
            />
            <p className="mt-1 text-xs text-body/45">
              Es lo que lee quien no puede ver la imagen, y lo que sale si no carga.
            </p>
          </div>

          <div>
            <label htmlFor="caption" className="mb-1.5 block text-sm text-body/70">
              Rótulo <span className="text-body/40">(opcional)</span>
            </label>
            <input
              id="caption"
              name="caption"
              maxLength={120}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Talento BMS en las mejores ligas del mundo"
              className={ENTRADA}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm text-body/70">Encuadre</p>
            <SelectorDeFoco
              nombre="focus"
              valor={foco}
              onCambio={setFoco}
              src={vistaPrevia}
              alt={alt || "Imagen elegida"}
              recortes={[
                { etiqueta: "Escritorio", ratio: 21 / 9 },
                { etiqueta: "Móvil", ratio: 4 / 3 },
              ]}
            />
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

        {/* ------------------------------------------------- constructor */}
        <div>
          <p className="mb-1.5 text-sm text-body/70">Cómo va a quedar</p>
          <VistaPrevia src={vistaPrevia} alt={alt} caption={caption} focus={foco} />
        </div>
      </div>
    </form>
  );
}
