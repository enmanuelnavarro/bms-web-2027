import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import { usandoLasDeSiempre } from "@/lib/slides";
import { PLAYERS } from "@/lib/players";
import { NEWS } from "@/lib/news";

export const dynamic = "force-dynamic";

// Portada del panel. Por ahora solo banners: las demás secciones se añaden
// según se vayan construyendo, y aparecen aquí como "en camino" para que se
// vea desde dentro qué falta.

const SECCIONES = [
  {
    href: "/admin/banners",
    titulo: "Banners",
    texto: "Las láminas del carrusel de portada.",
    lista: true,
  },
  { href: null, titulo: "Noticias", texto: "Crear y publicar noticias.", lista: false },
  { href: null, titulo: "Jugadores", texto: "Publicar y editar representados.", lista: false },
  { href: null, titulo: "Álbumes de fotos", texto: "Imágenes que los clubes descargan.", lista: false },
  { href: null, titulo: "Contactos", texto: "Bandeja de mensajes del formulario.", lista: false },
];

export default async function AdminPage() {
  const admin = await exigeAdmin();
  const sinBanners = await usandoLasDeSiempre();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-gold">
          Hola{admin.nombre ? `, ${admin.nombre}` : ""}
        </h1>
        <p className="mt-1 text-body/60">Desde aquí se gestiona el contenido de la web.</p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-elevated p-4">
          <dt className="text-sm text-body/60">Jugadores</dt>
          <dd className="text-2xl font-bold text-gold">{PLAYERS.length}</dd>
        </div>
        <div className="rounded-lg border border-hairline bg-elevated p-4">
          <dt className="text-sm text-body/60">Noticias</dt>
          <dd className="text-2xl font-bold text-gold">{NEWS.length}</dd>
        </div>
        <div className="rounded-lg border border-hairline bg-elevated p-4">
          <dt className="text-sm text-body/60">Banner</dt>
          <dd className="text-2xl font-bold text-gold">
            {sinBanners ? "Por defecto" : "Personalizado"}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="mb-3 font-semibold text-gold">Secciones</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SECCIONES.map((s) => (
            <li key={s.titulo}>
              {s.lista && s.href ? (
                <Link
                  href={s.href}
                  className="block rounded-lg border border-hairline bg-elevated p-4 transition hover:border-gold"
                >
                  <span className="font-semibold text-gold-light">{s.titulo}</span>
                  <span className="mt-0.5 block text-sm text-body/60">{s.texto}</span>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-hairline/60 p-4 opacity-55">
                  <span className="font-semibold">{s.titulo}</span>
                  <span className="ms-2 rounded bg-ink px-1.5 py-0.5 text-xs text-body/50">
                    en camino
                  </span>
                  <span className="mt-0.5 block text-sm text-body/60">{s.texto}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-body/45">
        Jugadores y noticias siguen saliendo de los ficheros del proyecto. Pasarán a la base de
        datos cuando se construya cada sección.
      </p>
    </div>
  );
}
