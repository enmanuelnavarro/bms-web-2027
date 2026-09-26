import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import { todasLasNoticias, type NoticiaAdmin } from "@/lib/noticias";
import { fechaCorta } from "@/lib/news";
import { alternarEstadoAction } from "./acciones";

export const metadata: Metadata = {
  title: "Noticias · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  await exigeAdmin();

  let noticias: NoticiaAdmin[] = [];
  let fallo: string | null = null;
  try {
    noticias = await todasLasNoticias();
  } catch (err) {
    console.error("[noticias] no se pudo leer la tabla:", err);
    fallo =
      "No se pudo leer la base de datos. Comprueba DATABASE_URL y que las migraciones estén aplicadas.";
  }

  const publicadas = noticias.filter((n) => n.estado === "publicado").length;
  const borradores = noticias.length - publicadas;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gold">Noticias</h1>
          <p className="mt-1 text-body/60">
            {noticias.length} en total · {publicadas} publicada{publicadas === 1 ? "" : "s"} ·{" "}
            {borradores} borrador{borradores === 1 ? "" : "es"}
          </p>
        </div>

        <Link
          href="/admin/noticias/nueva"
          className="rounded bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-gold-light"
        >
          Nueva noticia
        </Link>
      </header>

      {fallo && (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {fallo}
        </p>
      )}

      {!fallo && noticias.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline px-4 py-10 text-center text-body/50">
          Todavía no hay ninguna. Crea la primera con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-3">
          {noticias.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border bg-elevated p-3 sm:p-4 ${
                n.estado === "publicado" ? "border-hairline" : "border-hairline/40"
              }`}
            >
              <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded border border-hairline sm:w-40">
                  {n.imagen ? (
                    <Image
                      src={n.imagen}
                      alt={n.imagen_alt ?? ""}
                      fill
                      sizes="10rem"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-body/35">
                      sin portada
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded px-1.5 py-0.5 ${
                        n.estado === "publicado"
                          ? "bg-gold/20 text-gold-light"
                          : "bg-ink text-body/55"
                      }`}
                    >
                      {n.estado === "publicado" ? "Publicada" : "Borrador"}
                    </span>
                    {n.destacada && (
                      <span className="rounded bg-ink px-1.5 py-0.5 text-gold">Destacada</span>
                    )}
                    {n.categoria && <span className="text-body/50">{n.categoria}</span>}
                    <span className="text-body/45">{fechaCorta(n.fecha)}</span>
                  </div>

                  <Link
                    href={`/admin/noticias/${n.id}`}
                    className="block font-semibold text-gold-light hover:underline"
                  >
                    {n.titulo}
                  </Link>

                  {n.resumen && (
                    <p className="mt-1 line-clamp-2 text-sm text-body/60">{n.resumen}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-body/45">
                    <span>{n.fuente.nombre}</span>
                    {n.jugadores.length > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {n.jugadores.length} jugador{n.jugadores.length === 1 ? "" : "es"}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/noticias/${n.id}`}
                      className="rounded border border-hairline px-2.5 py-1 text-sm transition hover:border-gold hover:text-gold-light"
                    >
                      Editar
                    </Link>

                    <form action={alternarEstadoAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="rounded border border-hairline px-2.5 py-1 text-sm transition hover:border-gold hover:text-gold-light"
                      >
                        {n.estado === "publicado" ? "Pasar a borrador" : "Publicar"}
                      </button>
                    </form>

                    {n.estado === "publicado" && (
                      <a
                        href={`/noticias/${n.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="rounded border border-hairline px-2.5 py-1 text-sm transition hover:border-gold hover:text-gold-light"
                      >
                        Ver ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
