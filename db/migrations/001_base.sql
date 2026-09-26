-- Cimientos del panel: quién entra y qué se registra.
--
-- Las migraciones se aplican con `node scripts/db-migrate.ts`, en orden de
-- nombre, y cada una se anota en `migraciones` para no repetirla.

create table if not exists migraciones (
  nombre      text primary key,
  aplicada_en timestamptz not null default now()
);

-- Usuarios del panel. No hay registro público: se crean con
-- `node scripts/crear-admin.ts`. La contraseña se guarda como hash scrypt
-- con su sal, nunca en claro.
create table if not exists admins (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  nombre        text,
  password_hash text not null,
  -- 'admin' gestiona usuarios; 'editor' solo contenido.
  rol           text not null default 'editor' check (rol in ('admin', 'editor')),
  activo        boolean not null default true,
  creado_en     timestamptz not null default now(),
  ultimo_acceso timestamptz
);

-- Rastro de cada escritura del panel. `diff` guarda lo que cambió, para poder
-- responder a "esto quién lo tocó" sin adivinar.
create table if not exists audit_log (
  id         bigserial primary key,
  tabla      text not null,
  registro   text not null,
  accion     text not null,
  admin_id   uuid references admins on delete set null,
  admin_email text,
  diff       jsonb,
  creado_en  timestamptz not null default now()
);

create index if not exists audit_log_tabla_idx on audit_log (tabla, creado_en desc);
