"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { Jugador } from "@/lib/jugadores";
import type { Completitud } from "@/lib/completitud";
import { guardarJugadorAction, archivarJugadorAction, destacarJugadorAction } from "./acciones";
import { VACIO, type Estado } from "../estado";
import Album from "./Album";

const ENTRADA =
  "w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold";

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-body/70">{etiqueta}</label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-body/45">{ayuda}</p>}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
      <h2 className="font-semibold text-gold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Ficha({
  jugador,
  completitud,
  estados,
  tipos,
}: {
  jugador: Jugador;
  completitud: Completitud;
  estados: string[];
  tipos: string[];
}) {
  const [estado, accion] = useActionState<Estado, FormData>(guardarJugadorAction, VACIO);
  const id = jugador.uuid!;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------ completitud */}
      <div className="rounded-lg border border-hairline bg-elevated p-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded bg-ink">
            <div
              className={`h-full ${
                completitud.porcentaje >= 80
                  ? "bg-gold"
                  : completitud.porcentaje >= 50
                    ? "bg-gold-dark"
                    : "bg-red-500/60"
              }`}
              style={{ width: `${completitud.porcentaje}%` }}
            />
          </div>
          <span className="text-sm text-body/60">{completitud.porcentaje} % completa</span>
        </div>

        {completitud.faltan.length > 0 && (
          <p className="text-sm text-body/50">
            Falta: <span className="text-body/70">{completitud.faltan.join(", ")}</span>
          </p>
        )}
      </div>

      <form action={accion} className="space-y-6">
        <input type="hidden" name="id" value={id} />

        <Seccion titulo="Datos básicos">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre">
              <input name="nombre" defaultValue={jugador.nombre} required className={ENTRADA} />
            </Campo>
            <Campo etiqueta="Apellido">
              <input name="apellido" defaultValue={jugador.apellido} className={ENTRADA} />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Código BMS">
              <input name="bms_code" defaultValue={jugador.bms_code ?? ""} className={ENTRADA} />
            </Campo>
            <Campo etiqueta="Nacionalidad">
              <input
                name="nacionalidad"
                defaultValue={jugador.nacionalidad ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Fecha de nacimiento" ayuda="La edad se calcula sola.">
              <input
                type="date"
                name="fecha_nacimiento"
                defaultValue={jugador.fecha_nacimiento ?? ""}
                className={ENTRADA}
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Lugar de nacimiento">
              <input
                name="lugar_nacimiento"
                defaultValue={jugador.lugar_nacimiento ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Selección">
              <input name="seleccion" defaultValue={jugador.seleccion ?? ""} className={ENTRADA} />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Físico y posición">
          <div className="grid gap-4 sm:grid-cols-4">
            <Campo etiqueta="Altura (cm)">
              <input
                type="number"
                name="altura_cm"
                defaultValue={jugador.altura_cm ?? ""}
                min={120}
                max={260}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Altura (pies)">
              <input name="altura_ft" defaultValue={jugador.altura_ft ?? ""} className={ENTRADA} />
            </Campo>
            <Campo etiqueta="Peso (kg)">
              <input
                type="number"
                step="0.1"
                name="peso_kg"
                defaultValue={jugador.peso_kg ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Peso (lb)">
              <input
                type="number"
                step="0.1"
                name="peso_lb"
                defaultValue={jugador.peso_lb ?? ""}
                className={ENTRADA}
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Posición" ayuda="En castellano: Base, Escolta, Alero…">
              <input name="posicion" defaultValue={jugador.posicion ?? ""} className={ENTRADA} />
            </Campo>
            <Campo etiqueta="Código" ayuda="PG, SG/SF, SWINGMAN…">
              <input
                name="posicion_codigo"
                defaultValue={jugador.posicion_codigo ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Tipo de jugador">
              <input
                name="tipo_jugador"
                defaultValue={jugador.tipo_jugador ?? ""}
                list="tipos-jugador"
                className={ENTRADA}
              />
              <datalist id="tipos-jugador">
                {tipos.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Situación deportiva">
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Equipo actual">
              <input
                name="equipo_actual"
                defaultValue={jugador.equipo_actual ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo etiqueta="Liga">
              <input name="liga_actual" defaultValue={jugador.liga_actual ?? ""} className={ENTRADA} />
            </Campo>
            <Campo etiqueta="País">
              <input name="pais" defaultValue={jugador.pais ?? ""} className={ENTRADA} />
            </Campo>
          </div>

          <Campo
            etiqueta="Estado"
            ayuda="Es lo que ve un club en el distintivo de la ficha. Los 53 llegaron con «Activo» porque era el valor que traía el Excel, no un estado que nadie asignara."
          >
            <input
              name="estado"
              defaultValue={jugador.estado ?? ""}
              list="estados-jugador"
              className={ENTRADA}
            />
            <datalist id="estados-jugador">
              {estados.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Campo>
        </Seccion>

        <Seccion titulo="Biografía y enlaces">
          <Campo etiqueta="Biografía">
            <textarea name="bio" defaultValue={jugador.bio ?? ""} rows={5} className={ENTRADA} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Campo etiqueta="Ficha externa" ayuda="LatinBasket o Eurobasket.">
              <input
                name="source_name"
                defaultValue={jugador.source?.name ?? ""}
                className={ENTRADA}
              />
            </Campo>
            <Campo
              etiqueta="Enlace"
              ayuda="De aquí saca las estadísticas el trabajo automático de cada 48 h."
            >
              <input
                type="url"
                name="source_url"
                defaultValue={jugador.source?.url ?? ""}
                className={ENTRADA}
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {(["instagram", "twitter", "facebook"] as const).map((red) => (
              <Campo key={red} etiqueta={red[0].toUpperCase() + red.slice(1)}>
                <input
                  name={`red_${red}`}
                  defaultValue={jugador.redes_sociales?.[red] ?? ""}
                  placeholder="https://…"
                  className={ENTRADA}
                />
              </Campo>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Publicación">
          <div className="flex flex-wrap items-end gap-6">
            <Campo etiqueta="Estado de la ficha">
              <select
                name="estado_publicacion"
                defaultValue={jugador.estado_publicacion}
                className={ENTRADA}
              >
                <option value="publicado">Publicada — visible en la web</option>
                <option value="borrador">Borrador — no se ve</option>
                <option value="archivado">Archivada — fuera del listado</option>
              </select>
            </Campo>

            <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm">
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={jugador.destacado}
                className="accent-[var(--gold)]"
              />
              Destacado en la portada
            </label>
          </div>
          <p className="text-sm text-body/45">
            Archivar no borra nada: la ficha sale del listado pero sus datos, fotos y estadísticas
            se quedan.
          </p>
        </Seccion>

        {estado.error && (
          <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {estado.error}
          </p>
        )}
        {estado.ok && (
          <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
            {estado.ok}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Guardar />
          <Link
            href="/admin/jugadores"
            className="rounded border border-hairline px-4 py-2 text-sm hover:border-gold hover:text-gold-light"
          >
            Volver
          </Link>
          <a
            href={`/jugadores/${jugador.id}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-gold hover:text-gold-light"
          >
            Ver en la web ↗
          </a>
        </div>
      </form>

      {/* Fuera del formulario principal: son acciones sueltas y anidar
          formularios no es válido en HTML. */}
      <div className="flex flex-wrap gap-2">
        <form action={destacarJugadorAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded border border-hairline px-3 py-1.5 text-sm transition hover:border-gold hover:text-gold-light"
          >
            {jugador.destacado ? "Quitar de destacados" : "Destacar en la portada"}
          </button>
        </form>

        <form action={archivarJugadorAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded border border-hairline px-3 py-1.5 text-sm transition hover:border-gold hover:text-gold-light"
          >
            {jugador.estado_publicacion === "archivado" ? "Desarchivar" : "Archivar"}
          </button>
        </form>
      </div>

      <Album playerId={id} slug={jugador.id} fotos={jugador.fotos} />

      {/* Estadísticas y trayectoria: de solo lectura por ahora. Las
          estadísticas las mantiene el trabajo de LatinBasket cada 48 h, y
          dejarlas editar a mano sin resolver quién gana en un conflicto sería
          pedir que se pisen. */}
      <Seccion titulo="Estadísticas y trayectoria">
        <p className="text-sm text-body/55">
          {jugador.estadisticas_temporada.length} temporada
          {jugador.estadisticas_temporada.length === 1 ? "" : "s"} ·{" "}
          {jugador.historial_equipos.length} equipo
          {jugador.historial_equipos.length === 1 ? "" : "s"} en la trayectoria ·{" "}
          {jugador.videos_youtube.length} vídeo{jugador.videos_youtube.length === 1 ? "" : "s"}
        </p>
        <p className="text-sm text-body/45">
          Las estadísticas las actualiza solo el trabajo que lee LatinBasket cada 48 horas, a
          partir del enlace de la ficha externa. Editarlas a mano aquí las pisaría en la siguiente
          pasada, así que de momento son de solo lectura.
        </p>
      </Seccion>
    </div>
  );
}
