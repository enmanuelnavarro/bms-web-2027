"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { NoticiaAdmin } from "@/lib/noticias";
import Editor from "./Editor";
import SelectorDeFoco from "../SelectorDeFoco";
import {
  crearNoticiaAction,
  guardarNoticiaAction,
  eliminarNoticiaAction,
} from "./acciones";
import { VACIO, type Estado } from "../estado";

type JugadorSimple = { id: string; nombre: string };

function Guardar({ nueva }: { nueva: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-gold px-5 py-2.5 font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60"
    >
      {pending ? "Guardando…" : nueva ? "Crear noticia" : "Guardar cambios"}
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

const ENTRADA =
  "w-full rounded border border-hairline bg-ink px-3 py-2 text-body outline-none focus:border-gold";

export default function Formulario({
  noticia,
  jugadores,
  categorias,
  reciencreada,
}: {
  /** Null al crear una nueva. */
  noticia: NoticiaAdmin | null;
  jugadores: JugadorSimple[];
  categorias: string[];
  reciencreada?: boolean;
}) {
  const nueva = noticia === null;
  const [estado, accion] = useActionState<Estado, FormData>(
    nueva ? crearNoticiaAction : guardarNoticiaAction,
    VACIO
  );

  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [foco, setFoco] = useState(noticia?.imagen_focus ?? "50% 50%");
  const [marcados, setMarcados] = useState<string[]>(noticia?.jugadores ?? []);
  const [buscar, setBuscar] = useState("");

  const visibles = buscar.trim()
    ? jugadores.filter((j) => j.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
    : jugadores;

  const alterna = (id: string) =>
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <form action={accion} className="space-y-6">
      {noticia && <input type="hidden" name="id" value={noticia.id} />}
      {marcados.map((id) => (
        <input key={id} type="hidden" name="jugadores" value={id} />
      ))}

      {reciencreada && (
        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          Noticia creada. Sigue editándola aquí abajo.
        </p>
      )}

      {/* ---------------------------------------------------------- titular */}
      <section className="space-y-4 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <Campo etiqueta="Titular">
          <input
            name="titulo"
            defaultValue={noticia?.titulo ?? ""}
            required
            minLength={8}
            maxLength={200}
            className={`${ENTRADA} text-lg`}
            placeholder="Andersson García inicia una nueva etapa en España"
          />
        </Campo>

        <Campo
          etiqueta="Resumen"
          ayuda="La entradilla que sale en el listado y al compartir en redes."
        >
          <textarea
            name="resumen"
            defaultValue={noticia?.resumen ?? ""}
            rows={2}
            maxLength={400}
            className={ENTRADA}
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Fecha" ayuda="La del hecho, no la de hoy.">
            <input
              type="date"
              name="fecha"
              defaultValue={noticia?.fecha ?? new Date().toISOString().slice(0, 10)}
              required
              className={ENTRADA}
            />
          </Campo>

          <Campo etiqueta="Categoría">
            <input
              name="categoria"
              defaultValue={noticia?.categoria ?? ""}
              list="categorias"
              maxLength={60}
              className={ENTRADA}
              placeholder="Jugador"
            />
            <datalist id="categorias">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>

          <Campo etiqueta="Autor">
            <input
              name="autor"
              defaultValue={noticia?.autor ?? "BMS"}
              maxLength={80}
              className={ENTRADA}
            />
          </Campo>
        </div>

        <Campo
          etiqueta="Dirección de la página"
          ayuda={
            nueva
              ? "Se compone sola a partir del titular si lo dejas vacío."
              : "Cambiarla rompe los enlaces que ya se hayan compartido."
          }
        >
          <div className="flex items-center gap-1 text-sm">
            <span className="shrink-0 text-body/45">/noticias/</span>
            <input
              name="slug"
              defaultValue={noticia?.slug ?? ""}
              pattern="[a-z0-9-]*"
              maxLength={80}
              className={ENTRADA}
              placeholder={nueva ? "se-compone-sola" : ""}
            />
          </div>
        </Campo>
      </section>

      {/* ----------------------------------------------------------- cuerpo */}
      <section className="rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <h2 className="mb-3 font-semibold text-gold">La noticia</h2>
        <Editor nombre="contenido" inicial={noticia?.contenido_html ?? ""} />
      </section>

      {/* ---------------------------------------------------------- portada */}
      <section className="space-y-4 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <h2 className="font-semibold text-gold">Portada</h2>

        <Campo
          etiqueta={noticia?.imagen ? "Cambiar la imagen" : "Imagen"}
          ayuda="Se convierte a WebP y se limita a 2400 px. Si no subes ninguna, la ficha se apaña sin ella."
        >
          <input
            type="file"
            name="imagen"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setVistaPrevia(f ? URL.createObjectURL(f) : null);
            }}
            className="w-full rounded border border-hairline bg-ink px-3 py-2 text-sm text-body/80 file:mr-3 file:rounded file:border-0 file:bg-gold file:px-3 file:py-1.5 file:font-semibold file:text-ink"
          />
        </Campo>

        {(vistaPrevia || noticia?.imagen) && (
          <div>
            <p className="mb-1.5 text-sm text-body/70">Encuadre</p>
            <SelectorDeFoco
              nombre="imagen_focus"
              valor={foco}
              onCambio={setFoco}
              src={vistaPrevia ?? noticia?.imagen ?? null}
              alt={noticia?.imagen_alt ?? "Portada de la noticia"}
              recortes={[
                { etiqueta: "Miniatura", ratio: 16 / 9 },
                { etiqueta: "Cabecera", ratio: 21 / 9 },
                { etiqueta: "Portada", ratio: 4 / 3 },
              ]}
            />
          </div>
        )}

        {/* Si no hay imagen todavía, el valor viaja igual para no perderlo. */}
        {!vistaPrevia && !noticia?.imagen && (
          <input type="hidden" name="imagen_focus" value={foco} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Descripción de la imagen">
            <input
              name="imagen_alt"
              defaultValue={noticia?.imagen_alt ?? ""}
              maxLength={200}
              className={ENTRADA}
            />
          </Campo>
          <Campo etiqueta="Crédito" ayuda="De quién es la fotografía.">
            <input
              name="imagen_credito"
              defaultValue={noticia?.credito_imagen ?? ""}
              maxLength={120}
              className={ENTRADA}
              placeholder="Foto: Listín Diario"
            />
          </Campo>
        </div>
      </section>

      {/* ----------------------------------------------------------- fuente */}
      <section className="space-y-4 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <h2 className="font-semibold text-gold">
          Fuente <span className="text-sm font-normal text-body/50">· obligatoria</span>
        </h2>
        <p className="text-sm text-body/55">
          Cada noticia se redacta a partir de un medio verificable, y la ficha enlaza al artículo
          original. Es lo que permite comprobar los datos.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Campo etiqueta="Medio">
            <input
              name="fuente_nombre"
              defaultValue={noticia?.fuente.nombre ?? ""}
              required
              minLength={2}
              className={ENTRADA}
              placeholder="Listín Diario"
            />
          </Campo>
          <Campo etiqueta="Enlace al artículo">
            <input
              type="url"
              name="fuente_url"
              defaultValue={noticia?.fuente.url ?? ""}
              required
              className={ENTRADA}
              placeholder="https://…"
            />
          </Campo>
        </div>
      </section>

      {/* -------------------------------------------------------- jugadores */}
      <section className="rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <h2 className="mb-1 font-semibold text-gold">
          Jugadores de la noticia{" "}
          <span className="text-sm font-normal text-body/50">
            ({marcados.length} marcado{marcados.length === 1 ? "" : "s"})
          </span>
        </h2>
        <p className="mb-3 text-sm text-body/55">
          La noticia sale en la ficha de cada jugador marcado.
        </p>

        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar por nombre…"
          className={`${ENTRADA} mb-3`}
        />

        <div className="max-h-56 overflow-y-auto rounded border border-hairline bg-ink p-2">
          {visibles.length === 0 ? (
            <p className="px-2 py-3 text-sm text-body/45">Ningún jugador con ese nombre.</p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {visibles.map((j) => (
                <li key={j.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-elevated">
                    <input
                      type="checkbox"
                      checked={marcados.includes(j.id)}
                      onChange={() => alterna(j.id)}
                      className="accent-[var(--gold)]"
                    />
                    <span className={marcados.includes(j.id) ? "text-gold-light" : ""}>
                      {j.nombre}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- publicación */}
      <section className="space-y-4 rounded-lg border border-hairline bg-elevated p-4 sm:p-6">
        <h2 className="font-semibold text-gold">Publicación</h2>

        <div className="flex flex-wrap items-center gap-6">
          <Campo etiqueta="Estado">
            <select name="estado" defaultValue={noticia?.estado ?? "borrador"} className={ENTRADA}>
              <option value="borrador">Borrador — no se ve en la web</option>
              <option value="publicado">Publicada — visible para todos</option>
            </select>
          </Campo>

          <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm">
            <input
              type="checkbox"
              name="destacada"
              defaultChecked={noticia?.destacada ?? false}
              className="accent-[var(--gold)]"
            />
            Destacada en la portada
          </label>
        </div>
      </section>

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
        <Guardar nueva={nueva} />

        <Link
          href="/admin/noticias"
          className="rounded border border-hairline px-4 py-2 text-sm hover:border-gold hover:text-gold-light"
        >
          Volver
        </Link>

        {noticia && noticia.estado === "publicado" && (
          <a
            href={`/noticias/${noticia.slug}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-gold hover:text-gold-light"
          >
            Ver en la web ↗
          </a>
        )}

        {noticia && (
          <button
            type="submit"
            formAction={eliminarNoticiaAction}
            formNoValidate
            onClick={(e) => {
              if (!window.confirm(`¿Eliminar "${noticia.titulo}"?\n\nNo se puede deshacer.`)) {
                e.preventDefault();
              }
            }}
            className="ms-auto rounded border border-hairline px-3 py-2 text-sm transition hover:border-red-400 hover:text-red-300"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
