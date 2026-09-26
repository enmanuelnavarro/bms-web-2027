-- Álbum de fotos del jugador.
--
-- Para que un club que se interesa por un jugador pueda descargar material sin
-- pedirlo por correo y esperar dos días: se lleva las fotos y hace su flyer.
--
-- Por eso se guardan DOS versiones de cada foto. `url` es la optimizada que se
-- enseña en la web; `url_original` es el archivo tal cual se subió, que es lo
-- que sirve para imprimir o para un montaje. Enseñar la grande en la galería
-- haría la página lentísima, y ofrecer solo la pequeña no serviría de nada.

create table if not exists player_photos (
  id        uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,

  url       text not null,
  path      text not null,
  ancho     integer,
  alto      integer,

  -- El archivo sin recomprimir, para descargar.
  url_original text,
  path_original text,
  bytes_original integer,

  alt  text not null default '',
  tipo text not null default 'accion' check (tipo in ('principal', 'cuerpo', 'accion', 'equipo')),
  -- Punto que no se recorta en las miniaturas.
  focus text not null default '50% 50%',

  orden integer not null default 0,
  -- Una foto puede subirse para uso interno y no publicarse todavía.
  publicada boolean not null default true,

  creado_en       timestamptz not null default now(),
  actualizado_por uuid references admins on delete set null
);

create index if not exists player_photos_idx on player_photos (player_id, orden);

-- Una sola foto principal por jugador: es la que sale en el listado y en la
-- cabecera de la ficha.
create unique index if not exists player_photos_principal_idx
  on player_photos (player_id) where tipo = 'principal';
