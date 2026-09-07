import Image from "next/image";

import { STOCK_IMAGES } from "@/lib/images";
import { getInstagramPosts } from "@/lib/instagram";
import { SITE } from "@/lib/site";

import InstagramGrid from "./InstagramGrid";
import InstagramWidget from "./InstagramWidget";

const PROFILE_URL = SITE.social.instagram;

/**
 * Sección "en directo" de la home. Tres caminos, en orden de preferencia:
 *
 *  1. API oficial de Meta (INSTAGRAM_ACCESS_TOKEN) → rejilla propia, diseño BMS.
 *  2. Widget de terceros (NEXT_PUBLIC_IG_WIDGET_SRC) → plan B sin tocar Meta.
 *  3. Respaldo → invitación a seguir la cuenta.
 *
 * El respaldo NO inventa publicaciones: mostrar posts falsos con fechas y pies
 * de foto ficticios engañaría a quien visita la web. Enseña imágenes de archivo
 * declaradas como tales y manda a la cuenta real.
 */
export default async function InstagramSection() {
  const posts = await getInstagramPosts(8);
  const widgetSrc = process.env.NEXT_PUBLIC_IG_WIDGET_SRC;
  const widgetHtml = process.env.NEXT_PUBLIC_IG_WIDGET_HTML;

  return (
    <section className="section-pad bg-ink">
      <div className="container-pro">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="eyebrow text-gold-dark mb-8">
              <span className="eyebrow-num">08</span> En Directo
            </div>
            <h2 className="headline-lg text-gold mb-0">
              Nuestros jugadores,<br />
              <span className="text-gold-light">día a día</span>
            </h2>
            <p className="text-lg text-body mt-6">
              Partidos, fichajes y entrenamientos según ocurren. Seguimos cada carrera
              en tiempo real desde{" "}
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-light border-b border-gold-dark hover:text-gold transition"
              >
                @{SITE.instagramHandle}
              </a>
              .
            </p>
          </div>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold whitespace-nowrap"
          >
            Seguir en Instagram
          </a>
        </div>

        {posts.length > 0 ? (
          <InstagramGrid posts={posts} />
        ) : widgetSrc ? (
          <InstagramWidget scriptSrc={widgetSrc} widgetHtml={widgetHtml} />
        ) : (
          <InstagramFallback />
        )}
      </div>
    </section>
  );
}

function InstagramFallback() {
  const tiles = [
    STOCK_IMAGES.hero.basketball_action_1,
    STOCK_IMAGES.players.placeholder_2,
    STOCK_IMAGES.hero.basketball_arena,
    STOCK_IMAGES.players.placeholder_1,
  ];

  return (
    <div className="rounded-2xl border border-hairline overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(201,162,39,0.15)]">
        {tiles.map((src, i) => (
          <div key={i} className="relative aspect-square bg-ink">
            <Image
              src={src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover opacity-40 grayscale"
            />
          </div>
        ))}
      </div>

      <div className="bg-elevated p-10 text-center">
        <p className="font-display text-2xl text-gold mb-3">
          El feed se publica aquí en cuanto conectemos la cuenta
        </p>
        <p className="text-body/70 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
          Mientras tanto, toda la actualidad de nuestros jugadores está en Instagram.
          Las imágenes de arriba son de archivo, no publicaciones reales.
        </p>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold link-arrow"
        >
          Ver @{SITE.instagramHandle} <span className="arrow">→</span>
        </a>
      </div>
    </div>
  );
}
