-- Noticias.
--
-- Sustituye a lib/news.json. Mientras la tabla esté vacía, la web sigue
-- sirviendo el JSON: el paso se hace con scripts/migra-noticias.ts y no se
-- rompe nada si se despliega antes de ejecutarlo.
--
-- El cuerpo se guarda como HTML, que es lo que produce el editor visual. Se
-- sanea SIEMPRE en el servidor antes de escribir aquí (lib/admin/html.ts): lo
-- que llega del navegador no es de fiar aunque venga de un administrador.

create table if not exists news (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,

  titulo       text not null,
  resumen      text,
  -- HTML saneado. Nunca se escribe sin pasar por saneaHtml().
  contenido    text not null default '',
  categoria    text,
  autor        text not null default 'BMS',

  -- Portada: en Blob si se sube desde el panel, o una ruta de /public para las
  -- que ya venían del JSON.
  imagen_url   text,
  imagen_path  text,
  imagen_alt   text,
  imagen_credito text,

  -- La fuente es obligatoria: cada noticia se redacta a partir de un medio
  -- verificable y la ficha enlaza al original. Es la regla editorial de la
  -- casa, así que la impone el esquema y no solo el formulario.
  fuente_nombre text not null,
  fuente_url    text not null,

  estado       text not null default 'borrador' check (estado in ('borrador', 'publicado')),
  destacada    boolean not null default false,
  -- La fecha del hecho, no la de carga.
  publicada_en date not null default current_date,

  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid references admins on delete set null
);

create index if not exists news_publicadas_idx on news (estado, publicada_en desc);

-- Jugadores relacionados. Varios por noticia, a diferencia del JSON, que solo
-- admitía uno.
--
-- `player_slug` es texto y no una clave foránea porque los jugadores siguen
-- viviendo en lib/players.json. Cuando tengan tabla propia, esto pasa a ser
-- una foránea de verdad.
create table if not exists news_players (
  news_id     uuid not null references news on delete cascade,
  player_slug text not null,
  orden       integer not null default 0,
  primary key (news_id, player_slug)
);
