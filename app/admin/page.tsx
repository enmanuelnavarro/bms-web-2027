import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import { usandoLasDeSiempre } from "@/lib/slides";
import { PLAYERS } from "@/lib/players";
import { NEWS } from "@/lib/news";
import { SECCIONES } from "./secciones";
import Icono from "./Icono";

export const dynamic = "force-dynamic";

// Portada del panel. Las secciones salen de ./secciones, el mismo sitio del
// que las lee el menú lateral: añadir una es tocar un fichero, no dos.

export default async function AdminPage() {
  const admin = await exigeAdmin();
  const sinBanners = await usandoLasDeSiempre();

  // La propia portada del panel no se lista aquí como sección.
  const secciones = SECCIONES.filter((s) => s.href !== "/admin");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-gold">
          Hola{admin.nombre ? `, ${admin.nombre.split(" ")[0]}` : ""}
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

      {sinBanners && (
        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          La portada está usando las láminas que vienen con el código.{" "}
          <Link href="/admin/banners" className="underline">
            Sube las tuyas
          </Link>{" "}
          y pasará a enseñar esas.
        </p>
      )}

      <section>
        <h2 className="mb-3 font-semibold text-gold">Secciones</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {secciones.map((s) => (
            <li key={s.href}>
              {s.lista ? (
                <Link
                  href={s.href}
                  className="flex gap-3 rounded-lg border border-hairline bg-elevated p-4 transition hover:border-gold"
                >
                  <Icono nombre={s.icono} className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <span>
                    <span className="font-semibold text-gold-light">{s.titulo}</span>
                    <span className="mt-0.5 block text-sm text-body/60">{s.texto}</span>
                  </span>
                </Link>
              ) : (
                <div className="flex gap-3 rounded-lg border border-dashed border-hairline/60 p-4 opacity-55">
                  <Icono nombre={s.icono} className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <span className="font-semibold">{s.titulo}</span>
                    <span className="ms-2 rounded bg-ink px-1.5 py-0.5 text-xs text-body/50">
                      en camino
                    </span>
                    <span className="mt-0.5 block text-sm text-body/60">{s.texto}</span>
                  </span>
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
