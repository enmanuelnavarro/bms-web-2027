-- Mensajes del formulario de contacto.
--
-- Hasta ahora /api/contact solo mandaba dos correos. Si Resend fallaba, o si
-- el correo se perdía entre otros mil, el contacto desaparecía: no quedaba
-- rastro de que alguien había escrito.
--
-- Ahora el mensaje se guarda AQUÍ PRIMERO y los correos se mandan después. Si
-- falla el envío, el contacto sigue en la bandeja del panel.
--
-- Son datos personales de clubes y jugadores: esta tabla no se lee nunca desde
-- el navegador, solo desde el servidor con sesión de administrador.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),

  nombre   text not null,
  email    text not null,
  telefono text,
  asunto   text,
  mensaje  text not null,
  -- "rd" o "miami": la oficina que eligió en el formulario.
  oficina  text,

  -- Jugador por el que pregunta. Se guarda el slug tal cual llegó aunque no
  -- exista, porque el mensaje se guarda antes de validar nada: perder el dato
  -- sería peor que guardarlo suelto.
  player_slug text,

  estado text not null default 'nuevo'
    check (estado in ('nuevo', 'contactado', 'en_negociacion', 'cerrado', 'descartado')),
  notas  text,

  -- Si los correos salieron o no, para saber si hay que responder a mano.
  email_enviado boolean not null default false,
  email_error   text,

  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid references admins on delete set null
);

create index if not exists leads_bandeja_idx on leads (estado, creado_en desc);
