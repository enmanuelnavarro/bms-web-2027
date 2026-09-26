-- Punto focal de la portada de la noticia.
--
-- La misma foto se recorta en tres proporciones muy distintas —la miniatura
-- del listado (16:9), la cabecera de la ficha (muy apaisada) y la tarjeta de
-- la portada—, así que centrarla siempre corta cabezas. Esto guarda qué parte
-- no se debe recortar, como ya hacía `focus` en home_slides.
--
-- "50% 50%" es centrado, que es el comportamiento de antes: las noticias que
-- ya existen no cambian de aspecto.

alter table news
  add column if not exists imagen_focus text not null default '50% 50%';
