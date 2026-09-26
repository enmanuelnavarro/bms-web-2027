-- Jugadores, y todo lo que cuelga de ellos.
--
-- Sustituye a lib/players.json. Como con banners y noticias, mientras la tabla
-- esté vacía la web sigue sirviendo el JSON, así que se puede desplegar antes
-- de migrar sin romper nada.
--
-- Cambio de fuente: hasta ahora mandaba el Excel de la agencia y
-- scripts/import-players.mjs volcaba a JSON. A partir de aquí manda esta tabla
-- y el Excel pasa a ser herramienta de importación y exportación. El trabajo
-- de LatinBasket cada 48 h también escribe aquí en vez de en el JSON.

create table if not exists players (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,

  -- Identificador de la agencia. Se guarda el valor original del Excel ("1")
  -- y el código con formato ("BMS-001"), que es como lo escribe su plantilla.
  bms_id   text,
  bms_code text unique,

  nombre   text not null,
  apellido text not null default '',

  nacionalidad     text,
  fecha_nacimiento date,
  lugar_nacimiento text,
  seleccion        text,

  altura_cm integer check (altura_cm is null or altura_cm between 120 and 260),
  altura_ft text,
  peso_kg   numeric(5,2),
  peso_lb   numeric(6,2),

  posicion        text,
  posicion_codigo text,
  -- Sin enum a propósito: su catálogo está en discusión (el Excel dice
  -- "Nativo" y su pestaña VARIABLES dice "Nacional"), y cambiar un enum en
  -- producción es una migración; cambiar una fila de catálogo es un formulario.
  tipo_jugador text,
  -- Estado deportivo. Ojo: los 53 llegaron con "Activo" porque era el valor
  -- constante del Excel, no un estado que nadie asignara. Ver docs/PANEL.md.
  estado       text,

  equipo_actual text,
  liga_actual   text,
  pais          text,

  bio         text,
  source_name text,
  source_url  text,

  -- Separado del estado deportivo: una cosa es si el jugador está libre y otra
  -- si su ficha se enseña en la web.
  estado_publicacion text not null default 'publicado'
    check (estado_publicacion in ('borrador', 'publicado', 'archivado')),
  destacado boolean not null default false,
  orden     integer not null default 0,

  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid references admins on delete set null
);

create index if not exists players_visibles_idx on players (estado_publicacion, orden);

-- Trayectoria.
create table if not exists player_career (
  id        uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  temporada text not null,
  equipo    text not null,
  liga      text,
  pais      text,
  orden     integer not null default 0
);
create index if not exists player_career_idx on player_career (player_id, orden);

-- Estadísticas por temporada.
--
-- Las columnas son las que pinta la ficha MÁS las que sabe leer el parser de
-- LatinBasket, para que el trabajo de las 48 h no tenga que tirar la mitad de
-- lo que lee.
create table if not exists player_stats (
  id        uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,

  temporada   text not null,
  competicion text,
  equipo      text,

  pj         numeric(5,1),
  minutos    numeric(5,1),
  pts        numeric(5,1),
  reb        numeric(5,1),
  reb_of     numeric(5,1),
  reb_def    numeric(5,1),
  ast        numeric(5,1),
  rob        numeric(5,1),
  tap        numeric(5,1),
  perdidas   numeric(5,1),
  faltas     numeric(5,1),
  valoracion numeric(5,1),
  fg2_pct    numeric(4,1),
  fg3_pct    numeric(4,1),
  ft_pct     numeric(4,1),

  -- Acumulados. En jsonb y no en ocho columnas porque solo se usan enteros,
  -- para calcular los porcentajes de carrera ponderados por intentos.
  totales jsonb,

  origen     text not null default 'manual' check (origen in ('manual', 'latinbasket')),
  origen_url text,
  leido_en   timestamptz,
  orden      integer not null default 0,

  unique (player_id, temporada, competicion, equipo)
);

-- Vídeos.
create table if not exists player_videos (
  id        uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  url       text not null,
  plataforma text not null check (plataforma in ('youtube', 'vimeo', 'hudl')),
  video_id  text,
  titulo    text,
  tipo      text,
  orden     integer not null default 0
);
create index if not exists player_videos_idx on player_videos (player_id, orden);

-- Redes sociales y fichas externas.
create table if not exists player_links (
  id        uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  tipo      text not null,
  url       text not null,
  orden     integer not null default 0,
  unique (player_id, tipo)
);

-- Catálogos: los desplegables del panel, equivalentes a la pestaña VARIABLES
-- del Excel. En tabla y no en código para que se corrijan sin desplegar.
create table if not exists catalogos (
  id     uuid primary key default gen_random_uuid(),
  tipo   text not null,
  valor  text not null,
  etiqueta text not null,
  orden  integer not null default 0,
  activo boolean not null default true,
  unique (tipo, valor)
);
