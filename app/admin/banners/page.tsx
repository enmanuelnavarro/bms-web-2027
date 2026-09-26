import type { Metadata } from "next";
import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import { todasLasSlides, type SlideAdmin } from "@/lib/slides";
import SubirLamina from "./SubirLamina";
import FichaLamina from "./FichaLamina";

export const metadata: Metadata = {
  title: "Banners · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  await exigeAdmin();

  let slides: SlideAdmin[];
  let fallo: string | null = null;
  try {
    slides = await todasLasSlides();
  } catch (err) {
    console.error("[banners] no se pudo leer la tabla:", err);
    slides = [];
    fallo =
      "No se pudo leer la base de datos. Comprueba DATABASE_URL y que las migraciones estén aplicadas.";
  }

  const activas = slides.filter((s) => s.activa).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-gold">Banners de portada</h1>
        <p className="mt-1 text-body/60">
          Las láminas del carrusel de la página principal. Se pasan solas cada 6 segundos, en el
          orden de esta lista.
        </p>
      </header>

      {fallo && (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {fallo}
        </p>
      )}

      {!fallo && activas === 0 && (
        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          No hay ninguna lámina activa, así que la portada está usando las de siempre, las que
          vienen con el código. En cuanto actives una aquí, la portada pasa a enseñar estas.
        </p>
      )}

      <SubirLamina />

      <section>
        <h2 className="mb-3 font-semibold text-gold">
          Láminas{" "}
          <span className="font-normal text-body/50">
            ({slides.length} · {activas} visible{activas === 1 ? "" : "s"})
          </span>
        </h2>

        {slides.length === 0 ? (
          <p className="rounded-lg border border-dashed border-hairline px-4 py-8 text-center text-body/50">
            Todavía no hay ninguna. Sube la primera con el formulario de arriba.
          </p>
        ) : (
          <ul className="space-y-4">
            {slides.map((s) => (
              <FichaLamina key={s.id} slide={s} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-body/50">
        Al guardar, la portada se actualiza sola.{" "}
        <Link href="/" className="text-gold hover:text-gold-light">
          Verla
        </Link>
        .
      </p>
    </div>
  );
}
