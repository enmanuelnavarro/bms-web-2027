"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { SlideAdmin } from "@/lib/slides";
import {
  alternarLaminaAction,
  eliminarLaminaAction,
  guardarLaminaAction,
  moverLaminaAction,
} from "./acciones";
import { VACIO, type Estado } from "../estado";

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

export default function FichaLamina({
  slide,
  primera,
  ultima,
}: {
  slide: SlideAdmin;
  primera: boolean;
  ultima: boolean;
}) {
  const [estado, accion] = useActionState<Estado, FormData>(guardarLaminaAction, VACIO);

  return (
    <li
      className={`rounded-lg border bg-elevated p-4 ${
        slide.activa ? "border-hairline" : "border-hairline/40 opacity-60"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-[13rem_1fr]">
        <div className="relative aspect-video overflow-hidden rounded border border-hairline">
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="208px"
            className="object-cover"
            style={{ objectPosition: slide.focus ?? "50% 50%" }}
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
                defaultValue={slide.alt}
                required
                maxLength={200}
                className="w-full rounded border border-hairline bg-ink px-3 py-1.5 text-sm text-body outline-none focus:border-gold"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <div>
                <label htmlFor={`caption-${slide.id}`} className="mb-1 block text-xs text-body/60">
                  Rótulo
                </label>
                <input
                  id={`caption-${slide.id}`}
                  name="caption"
                  defaultValue={slide.caption ?? ""}
                  maxLength={120}
                  className="w-full rounded border border-hairline bg-ink px-3 py-1.5 text-sm text-body outline-none focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor={`focus-${slide.id}`} className="mb-1 block text-xs text-body/60">
                  Punto focal
                </label>
                <input
                  id={`focus-${slide.id}`}
                  name="focus"
                  defaultValue={slide.focus ?? "50% 50%"}
                  pattern="\d{1,3}% \d{1,3}%"
                  className="w-full rounded border border-hairline bg-ink px-3 py-1.5 text-sm text-body outline-none focus:border-gold"
                />
              </div>
            </div>

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

          {/* Los extremos no se pueden mover, pero el botón se deja visible
              para que la fila no baile de tamaño entre láminas. */}
          {(primera || ultima) && (
            <p className="sr-only">
              {primera && "Esta lámina ya es la primera. "}
              {ultima && "Esta lámina ya es la última."}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
