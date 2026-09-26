"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { exigeAdmin, registra } from "@/lib/admin/auth";
import { borraImagen, compruebaFichero, subeImagen } from "@/lib/admin/imagenes";
import { saneaHtml, estaVacio } from "@/lib/admin/html";
import { ETIQUETA_NOTICIAS } from "@/lib/noticias";
import { getPlayer } from "@/lib/players";

// Escrituras de la sección de noticias.
//
// Todas empiezan con `exigeAdmin()` y todas terminan invalidando la caché. Ver
// la nota de app/admin/banners/acciones.ts sobre por qué `{ expire: 0 }`.

import type { Estado } from "../estado";

export type { Estado };

function refresca() {
  revalidateTag(ETIQUETA_NOTICIAS, { expire: 0 });
}

/** "Ángel Luis Delgado firma" → "angel-luis-delgado-firma". */
function slugifica(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const esquema = z.object({
  titulo: z.string().trim().min(8, "El titular es demasiado corto.").max(200, "El titular se pasa de largo."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "La dirección solo admite minúsculas, números y guiones.")
    .max(80)
    .optional(),
  resumen: z.string().trim().max(400, "El resumen se pasa de largo.").optional(),
  categoria: z.string().trim().max(60).optional(),
  autor: z.string().trim().max(80).optional(),
  // La fuente es obligatoria: cada noticia se redacta a partir de un medio
  // verificable y la ficha enlaza al original.
  fuente_nombre: z.string().trim().min(2, "Falta el nombre del medio del que sale la noticia."),
  fuente_url: z.string().trim().url("El enlace a la fuente no es una dirección válida."),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no tiene buena pinta."),
  estado: z.enum(["borrador", "publicado"]),
  destacada: z.boolean(),
  imagen_alt: z.string().trim().max(200).optional(),
  imagen_credito: z.string().trim().max(120).optional(),
});

function lee(datos: FormData) {
  return esquema.safeParse({
    titulo: datos.get("titulo"),
    slug: datos.get("slug") || undefined,
    resumen: datos.get("resumen") || undefined,
    categoria: datos.get("categoria") || undefined,
    autor: datos.get("autor") || undefined,
    fuente_nombre: datos.get("fuente_nombre"),
    fuente_url: datos.get("fuente_url"),
    fecha: datos.get("fecha"),
    estado: datos.get("estado"),
    destacada: datos.get("destacada") === "on",
    imagen_alt: datos.get("imagen_alt") || undefined,
    imagen_credito: datos.get("imagen_credito") || undefined,
  });
}

/** Los jugadores marcados, validados contra el roster: nadie inventa un slug. */
function jugadoresDe(datos: FormData): string[] {
  return datos
    .getAll("jugadores")
    .map(String)
    .filter((slug) => Boolean(getPlayer(slug)));
}

async function guardaJugadores(newsId: string, slugs: string[]): Promise<void> {
  await db()`delete from news_players where news_id = ${newsId}`;
  for (const [i, slug] of slugs.entries()) {
    await db()`
      insert into news_players (news_id, player_slug, orden) values (${newsId}, ${slug}, ${i})
      on conflict do nothing
    `;
  }
}

// --------------------------------------------------------------------- crear

export async function crearNoticiaAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const leido = lee(datos);
  if (!leido.success) return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };

  const contenido = saneaHtml(String(datos.get("contenido") ?? ""));
  if (estaVacio(contenido)) return { error: "La noticia está vacía.", ok: null };

  const slug = leido.data.slug || slugifica(leido.data.titulo);
  if (!slug) return { error: "No se pudo componer la dirección. Escribe una a mano.", ok: null };

  let id: string;

  try {
    const existe = (await db()`select 1 from news where slug = ${slug} limit 1`) as unknown[];
    if (existe.length) {
      return { error: `Ya hay una noticia con la dirección "${slug}". Cámbiala.`, ok: null };
    }

    const portada = await portadaDe(datos, slug);

    const [fila] = (await db()`
      insert into news (slug, titulo, resumen, contenido, categoria, autor,
                        imagen_url, imagen_path, imagen_alt, imagen_credito,
                        fuente_nombre, fuente_url, estado, destacada, publicada_en,
                        actualizado_por)
      values (${slug}, ${leido.data.titulo}, ${leido.data.resumen ?? null}, ${contenido},
              ${leido.data.categoria ?? null}, ${leido.data.autor || "BMS"},
              ${portada?.url ?? null}, ${portada?.path ?? null},
              ${leido.data.imagen_alt ?? null}, ${leido.data.imagen_credito ?? null},
              ${leido.data.fuente_nombre}, ${leido.data.fuente_url},
              ${leido.data.estado}, ${leido.data.destacada}, ${leido.data.fecha},
              ${admin.id})
      returning id
    `) as Array<{ id: string }>;

    id = fila.id;
    await guardaJugadores(id, jugadoresDe(datos));
    await registra(admin, "news", id, "insert", { slug, titulo: leido.data.titulo });
    refresca();
  } catch (err) {
    console.error("[noticias] fallo al crear:", err);
    return { error: mensajeDe(err), ok: null };
  }

  // Fuera del try: redirect() funciona lanzando.
  redirect(`/admin/noticias/${id}?nueva=1`);
}

// -------------------------------------------------------------------- editar

export async function guardarNoticiaAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const id = String(datos.get("id") ?? "");
  if (!id) return { error: "Falta la noticia.", ok: null };

  const leido = lee(datos);
  if (!leido.success) return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };

  const contenido = saneaHtml(String(datos.get("contenido") ?? ""));
  if (estaVacio(contenido)) return { error: "La noticia está vacía.", ok: null };

  try {
    const [actual] = (await db()`
      select slug, imagen_path from news where id = ${id} limit 1
    `) as Array<{ slug: string; imagen_path: string | null }>;
    if (!actual) return { error: "Esa noticia ya no existe.", ok: null };

    const slug = leido.data.slug || actual.slug;
    if (slug !== actual.slug) {
      const choca = (await db()`
        select 1 from news where slug = ${slug} and id <> ${id} limit 1
      `) as unknown[];
      if (choca.length) return { error: `Ya hay otra noticia con la dirección "${slug}".`, ok: null };
    }

    const portada = await portadaDe(datos, slug);

    await db()`
      update news
         set slug = ${slug},
             titulo = ${leido.data.titulo},
             resumen = ${leido.data.resumen ?? null},
             contenido = ${contenido},
             categoria = ${leido.data.categoria ?? null},
             autor = ${leido.data.autor || "BMS"},
             imagen_url = coalesce(${portada?.url ?? null}, imagen_url),
             imagen_path = coalesce(${portada?.path ?? null}, imagen_path),
             imagen_alt = ${leido.data.imagen_alt ?? null},
             imagen_credito = ${leido.data.imagen_credito ?? null},
             fuente_nombre = ${leido.data.fuente_nombre},
             fuente_url = ${leido.data.fuente_url},
             estado = ${leido.data.estado},
             destacada = ${leido.data.destacada},
             publicada_en = ${leido.data.fecha},
             actualizado_en = now(),
             actualizado_por = ${admin.id}
       where id = ${id}
    `;

    // La portada vieja se borra después de que la nueva esté guardada: si algo
    // falla antes, la noticia se queda con la imagen que ya tenía.
    if (portada && actual.imagen_path) await borraImagen(actual.imagen_path);

    await guardaJugadores(id, jugadoresDe(datos));
    await registra(admin, "news", id, "update", { slug, titulo: leido.data.titulo });
    refresca();

    return {
      error: null,
      ok: leido.data.estado === "publicado" ? "Guardada y publicada." : "Guardada como borrador.",
    };
  } catch (err) {
    console.error("[noticias] fallo al guardar:", err);
    return { error: mensajeDe(err), ok: null };
  }
}

// ---------------------------------------------------- publicar y eliminar

export async function alternarEstadoAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    update news
       set estado = case when estado = 'publicado' then 'borrador' else 'publicado' end,
           actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id}
     returning estado
  `) as Array<{ estado: string }>;

  await registra(admin, "news", id, fila?.estado === "publicado" ? "publicar" : "despublicar");
  refresca();
}

export async function eliminarNoticiaAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    delete from news where id = ${id} returning slug, titulo, imagen_path
  `) as Array<{ slug: string; titulo: string; imagen_path: string | null }>;

  if (fila) {
    // Solo si la imagen está en el almacén. Las noticias migradas del JSON
    // apuntan a /public, que es parte del repositorio y no se toca.
    if (fila.imagen_path) await borraImagen(fila.imagen_path);
    await registra(admin, "news", id, "delete", { slug: fila.slug, titulo: fila.titulo });
  }

  refresca();
  redirect("/admin/noticias");
}

// ------------------------------------------------------------------ portada

async function portadaDe(
  datos: FormData,
  slug: string
): Promise<{ url: string; path: string } | null> {
  const fichero = datos.get("imagen");
  if (!(fichero instanceof File) || fichero.size === 0) return null;

  const problema = compruebaFichero(fichero);
  if (problema) throw new Error(problema);

  const subida = await subeImagen(fichero, `noticias/${slug}`);
  return { url: subida.url, path: subida.path };
}

function mensajeDe(err: unknown): string {
  const texto = err instanceof Error ? err.message : String(err);

  // Los mensajes de compruebaFichero se devuelven tal cual: ya están escritos
  // para quien los va a leer.
  if (/^(No has elegido|El formato|La imagen pesa)/.test(texto)) return texto;

  if (/BLOB_READ_WRITE_TOKEN|No token found/i.test(texto)) {
    return "Falta configurar el almacén de imágenes (BLOB_READ_WRITE_TOKEN).";
  }
  if (/relation .*news.* does not exist/i.test(texto)) {
    return "La base de datos no tiene la tabla de noticias. Ejecuta las migraciones.";
  }
  if (/duplicate key|unique/i.test(texto)) {
    return "Ya hay una noticia con esa dirección.";
  }
  return "No se pudo completar. Revisa el registro del servidor.";
}
