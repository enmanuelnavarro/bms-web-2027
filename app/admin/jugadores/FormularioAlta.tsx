"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { crearJugadorAction } from "./acciones";
import { VACIO, type Estado } from "../estado";

const ENTRADA =
  "w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold";

function Crear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Creando…" : "Crear y seguir editando"}
    </button>
  );
}

/** La misma regla que aplica el servidor, para enseñar la dirección en vivo. */
function slugifica(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function FormularioAlta({ siguienteCodigo }: { siguienteCodigo: string }) {
  const [estado, accion] = useActionState<Estado, FormData>(crearJugadorAction, VACIO);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [slug, setSlug] = useState("");

  const automatico = slugifica(`${nombre} ${apellido}`.trim());

  return (
    <form action={accion} className="space-y-5 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
      <p className="text-sm text-body/60">
        Con el nombre basta para darlo de alta. El resto —físico, equipo, biografía, fotos— se
        rellena luego en su ficha, que se abre al crear.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm text-body/70">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            minLength={2}
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ángel Luis"
            className={ENTRADA}
          />
        </div>

        <div>
          <label htmlFor="apellido" className="mb-1.5 block text-sm text-body/70">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Delgado"
            className={ENTRADA}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bms_code" className="mb-1.5 block text-sm text-body/70">
          Código BMS <span className="text-body/40">(opcional)</span>
        </label>
        <input
          id="bms_code"
          name="bms_code"
          defaultValue={siguienteCodigo}
          maxLength={20}
          className={`${ENTRADA} max-w-40`}
        />
        <p className="mt-1 text-xs text-body/45">
          El siguiente libre según la base. Cámbialo si en el Excel lleva otro.
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm text-body/70">
          Dirección de la ficha
        </label>
        <div className="flex items-center gap-1 text-sm">
          <span className="shrink-0 text-body/45">/jugadores/</span>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]*"
            maxLength={60}
            placeholder={automatico || "se-compone-sola"}
            className={ENTRADA}
          />
        </div>
        <p className="mt-1 text-xs text-body/45">
          {slug
            ? `Quedará en /jugadores/${slug}`
            : automatico
              ? `Se compondrá sola: /jugadores/${automatico}`
              : "Se compone sola a partir del nombre si la dejas vacía."}
        </p>
      </div>

      {estado.error && (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {estado.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Crear />
        <Link
          href="/admin/jugadores"
          className="rounded border border-hairline px-4 py-2 text-sm hover:border-gold hover:text-gold-light"
        >
          Cancelar
        </Link>
      </div>

      <p className="text-xs text-body/45">
        Entra como borrador: no se ve en la web hasta que lo publiques. Una ficha a medias delante
        de un club es peor que ninguna.
      </p>
    </form>
  );
}
