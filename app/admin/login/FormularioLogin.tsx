"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { entrarAction, type EstadoLogin } from "../acciones";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-gold px-4 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function FormularioLogin({ volver }: { volver: string }) {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(entrarAction, { error: null });

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="volver" value={volver} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-body/70">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="w-full rounded border border-hairline bg-elevated px-3 py-2.5 text-body outline-none focus:border-gold"
        />
      </div>

      <div>
        <label htmlFor="clave" className="mb-1.5 block text-sm text-body/70">
          Contraseña
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded border border-hairline bg-elevated px-3 py-2.5 text-body outline-none focus:border-gold"
        />
      </div>

      {estado.error && (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {estado.error}
        </p>
      )}

      <Boton />
    </form>
  );
}
