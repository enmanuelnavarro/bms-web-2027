import type { Metadata } from "next";
import Image from "next/image";

import { SITE } from "@/lib/site";

// Página que ve el público mientras la web está en obras, con la puerta de
// acceso para el equipo. Ver lib/acceso.ts.

export const metadata: Metadata = {
  title: `${SITE.shortName} · Sitio en construcción`,
  description: `${SITE.legalName} está renovando su sitio web.`,
  // No interesa que Google indexe la página de obras.
  robots: { index: false, follow: false },
};

export default async function EnConstruccion({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; volver?: string }>;
}) {
  const { error, volver } = await searchParams;
  const hayClave = Boolean(process.env.SITE_PASSWORD);

  return (
    <div className="min-h-screen bg-ink text-body flex items-center justify-center px-6 py-20">
      {/* La cabecera y el pie viven en el layout raíz, que envuelve todas las
          páginas. Leer la ruta desde el layout obligaría a renderizarlo en
          cada petición y las 53 fichas dejarían de generarse estáticamente;
          para una página temporal no compensa. Se ocultan desde aquí. */}
      <style>{`body > header, body > footer { display: none; }`}</style>

      <div className="w-full max-w-md text-center">
        <Image
          src="/logos/bms-oscuro.png"
          alt={SITE.legalName}
          width={104}
          height={80}
          priority
          className="h-16 w-auto mx-auto mb-12"
        />

        <p className="text-gold-dark font-bold uppercase tracking-[0.25em] text-xs mb-5">
          {SITE.shortName} · {SITE.founded}
        </p>

        <h1 className="font-display text-4xl md:text-5xl text-gold leading-[0.95] mb-6">
          Sitio en
          <br />
          construcción
        </h1>

        <p className="text-body/70 leading-relaxed mb-12">
          Estamos preparando la nueva web de {SITE.legalName}. Vuelve pronto.
        </p>

        {hayClave ? (
          <form
            action="/api/acceso"
            method="post"
            className="text-left border-t border-hairline pt-10"
          >
            <label
              htmlFor="clave"
              className="block text-xs font-bold uppercase tracking-widest text-gold-dark mb-3"
            >
              Acceso del equipo
            </label>
            <input
              id="clave"
              name="clave"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="Contraseña"
              aria-describedby={error ? "error-clave" : undefined}
              className="w-full px-4 py-3 bg-elevated border border-hairline rounded-lg text-body placeholder-body/40 focus:outline-none focus:ring-2 focus:ring-gold transition"
            />
            {volver && <input type="hidden" name="volver" value={volver} />}

            {error && (
              <p id="error-clave" role="alert" className="mt-3 text-sm text-red-300">
                Contraseña incorrecta.
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-5 px-6 py-3.5 bg-gold hover:bg-gold-light text-ink font-bold rounded-full transition"
            >
              Entrar
            </button>
          </form>
        ) : (
          <p className="border-t border-hairline pt-10 text-sm text-body/50">
            El acceso del equipo no está configurado en este entorno.
          </p>
        )}

        <div className="mt-12 text-sm text-body/60 space-y-1">
          <p>
            <a href={`mailto:${SITE.infoEmail}`} className="hover:text-gold transition">
              {SITE.infoEmail}
            </a>
          </p>
          <p>
            <a href={`tel:${SITE.phoneHref}`} className="hover:text-gold transition">
              {SITE.phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
