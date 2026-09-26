"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { SlideAdmin } from "@/lib/slides";
import {
  alternarLaminaAction,
  eliminarLaminaAction,
  guardarLaminaAction,
  moverLaminaAction,
} from "./acciones";
import { VACIO, type Estado } from "../estado";
import SelectorDeFoco from "../SelectorDeFoco";
import VistaPrevia from "./VistaPrevia";

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-gold px-3 py-1.5 text-sm text-gold transition hover:bg-gold hover:text-ink disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

/** Botón de una acción suelta, con su propio formulario. */
function Accion({
  action,
  children,
  campos,
  confirmar,
  className = "",
}: {
  action: (datos: FormData) => Promise<void>;
  children: React.ReactNode;
  campos: Record<string, string>;
  confirmar?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        className={`rounded border border-hairline px-2.5 py-1.5 text-sm transition hover:border-gold hover:text-gold-light ${className}`}
      >
        {children}
      </button>
    </form>
  );
}

const ENTRADA =
  "w-full rounded border border-hairline bg-ink px-3 py-1.5 text-sm text-body outline-none focus:border-gold";

export default function FichaLamina({ slide }: { slide: SlideAdmin }) {
  const [estado, accion] = useActionState<Estado, FormData>(guardarLaminaAction, VACIO);
  const [abierta, setAbierta] = useState(false);

  // Lo que se está editando, para que el constructor lo refleje en vivo.
  const [alt, setAlt] = useState(slide.alt);
  const [caption, setCaption] = useState(slide.caption ?? "");
  const [foco, setFoco] = useState(slide.focus ?? "50% 50%");

  return (
    <li
      className={`rounded-lg border bg-elevated p-4 ${
        slide.activa ? "border-hairline" : "border-hairline/40 opacity-70"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
        <div className="relative aspect-video overflow-hidden rounded border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element -- el encuadre se
              previsualiza en vivo y next/image no reacciona a objectPosition sin recargar */}
          <img
            src={slide.src}
            alt={alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: foco }}
          />
          {!slide.activa && (
            <span className="absolute left-2 top-2 rounded bg-ink/85 px-2 py-0.5 text-xs text-body/70">
              Oculta
            </span>
          )}
        </div>

        <div className="space-y-3">
          <form action={accion} className="space-y-3">
            <input type="hidden" name="id" value={slide.id} />

            <div>
              <label htmlFor={`alt-${slide.id}`} className="mb-1 block text-xs text-body/60">
                Descripción
              </label>
              <input
                id={`alt-${slide.id}`}
                name="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                required
                maxLength={200}
                className={ENTRADA}
              />
            </div>

            <div>
              <label htmlFor={`caption-${slide.id}`} className="mb-1 block text-xs text-body/60">
                Rótulo
              </label>
              <input
                id={`caption-${slide.id}`}
                name="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
                className={ENTRADA}
              />
            </div>

            {/* El encuadre y el constructor se despliegan: con seis láminas en
                pantalla, tenerlos siempre abiertos convierte la lista en un
                muro imposible de recorrer. */}
            <button
              type="button"
              onClick={() => setAbierta((v) => !v)}
              aria-expanded={abierta}
              className="text-sm text-gold hover:text-gold-light"
            >
              {abierta ? "▾ Ocultar encuadre y vista previa" : "▸ Encuadre y vista previa"}
            </button>

            {abierta && (
              <div className="grid gap-5 rounded border border-hairline/60 bg-ink/40 p-3 lg:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs text-body/60">Encuadre</p>
                  <SelectorDeFoco
                    nombre="focus"
                    valor={foco}
                    onCambio={setFoco}
                    src={slide.src}
                    alt={alt}
                    recortes={[
                      { etiqueta: "Escritorio", ratio: 21 / 9 },
                      { etiqueta: "Móvil", ratio: 4 / 3 },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-body/60">Cómo va a quedar</p>
                  <VistaPrevia src={slide.src} alt={alt} caption={caption} focus={foco} />
                </div>
              </div>
            )}

            {/* Sin desplegar, el valor tiene que viajar igual. */}
            {!abierta && <input type="hidden" name="focus" value={foco} />}

            {estado.error && (
              <p role="alert" className="text-sm text-red-300">
                {estado.error}
              </p>
            )}
            {estado.ok && <p className="text-sm text-gold-light">{estado.ok}</p>}

            <Guardar />
          </form>

          <div className="flex flex-wrap gap-2 border-t border-hairline/50 pt-3">
            <Accion action={moverLaminaAction} campos={{ id: slide.id, direccion: "arriba" }}>
              <span aria-hidden>↑</span> <span className="sr-only">Subir en el orden</span>
            </Accion>
            <Accion action={moverLaminaAction} campos={{ id: slide.id, direccion: "abajo" }}>
              <span aria-hidden>↓</span> <span className="sr-only">Bajar en el orden</span>
            </Accion>
            <Accion action={alternarLaminaAction} campos={{ id: slide.id }}>
              {slide.activa ? "Ocultar" : "Mostrar"}
            </Accion>
            <Accion
              action={eliminarLaminaAction}
              campos={{ id: slide.id }}
              confirmar={`¿Eliminar esta lámina?\n\n"${slide.alt}"\n\nSe borra también la imagen. No se puede deshacer.`}
              className="ms-auto hover:border-red-400 hover:text-red-300"
            >
              Eliminar
            </Accion>
          </div>
        </div>
      </div>
    </li>
  );
}
