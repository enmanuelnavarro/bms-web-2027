-- Láminas del carrusel de portada.
--
-- Sustituye a BANNER_SLIDES de lib/images.ts. Mientras la tabla esté vacía, la
-- portada sigue usando aquellas: así el sitio nunca se queda sin banner por un
-- despliegue a medias.

create table if not exists home_slides (
  id          uuid primary key default gen_random_uuid(),

  -- URL pública que sirve Vercel Blob, y la ruta interna para poder borrarla.
  image_url   text not null,
  image_path  text not null,

  alt         text not null,
  caption     text,

  -- Punto focal del recorte (`object-position`). El banner cambia mucho de
  -- proporción entre móvil y escritorio; en composiciones con caras hay que
  -- anclar arriba para no cortar cabezas.
  focus       text not null default '50% 50%',

  orden       integer not null default 0,
  activa      boolean not null default true,

  creado_en   timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references admins on delete set null
);

create index if not exists home_slides_visibles_idx on home_slides (activa, orden);
