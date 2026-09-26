"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { exigeAdmin, registra } from "@/lib/admin/auth";
import { borraImagen, compruebaFichero, subeImagen } from "@/lib/admin/imagenes";
import { ETIQUETA_SLIDES } from "@/lib/slides";

// Escrituras de la sección de banners.
//
// Todas empiezan igual: `exigeAdmin()`. El proxy filtra la navegación, pero
// estas funciones son endpoints HTTP y se pueden llamar directamente.
//
// Y todas terminan igual: `refresca()`, que invalida la etiqueta de caché para
// que la portada enseñe el cambio sin esperar a un despliegue.

export type Estado = { error: string | null; ok: string | null };

export const VACIO: Estado = { error: null, ok: null };

function refresca() {
  // En Next 16 `revalidateTag` pide un segundo argumento, y no es lo que
  // parece: dice **cuánto tiempo se puede seguir sirviendo lo viejo** mientras
  // se recalcula por detrás. El recomendado, "max", son hasta doce meses de
  // contenido rancio, que en una web con poco tráfico significa que guardas un
  // banner, abres la portada y sigues viendo el anterior.
  //
  // `{ expire: 0 }` corta eso: la siguiente petición espera y ve el cambio.
  // Cuesta unos milisegundos en una página que se visita poco y que casi
  // siempre se sirve de caché. Es lo que la documentación recomienda cuando
  // hace falta el dato nuevo ya y no se puede usar `updateTag` —que existe y
  // sería lo ideal, pero está documentado para `fetch` y para "use cache", no
  // para el `unstable_cache` que usa lib/slides.ts.
  revalidateTag(ETIQUETA_SLIDES, { expire: 0 });
}

const textoLamina = z.object({
  alt: z
    .string()
    .trim()
    .min(5, "Describe la imagen en una frase: es lo que lee quien no puede verla.")
    .max(200, "La descripción se está pasando de larga."),
  caption: z.string().trim().max(120, "El rótulo se está pasando de largo.").optional(),
  focus: z
    .string()
    .trim()
    .regex(/^\d{1,3}% \d{1,3}%$/, 'El punto focal se escribe como "50% 20%".')
    .optional(),
});

// --------------------------------------------------------------------- subir

export async function subirLaminaAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const fichero = datos.get("imagen");
  if (!(fichero instanceof File)) return { error: "No llegó ninguna imagen.", ok: null };

  const problema = compruebaFichero(fichero);
  if (problema) return { error: problema, ok: null };

  const leido = textoLamina.safeParse({
    alt: datos.get("alt"),
    caption: datos.get("caption") || undefined,
    focus: datos.get("focus") || undefined,
  });
  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };
  }

  try {
    const imagen = await subeImagen(fichero, "banners");

    // La nueva va al final. Reordenar es otra acción, deliberadamente: subir
    // no debería cambiar de sitio lo que ya estaba.
    const [{ siguiente }] = (await db()`
      select coalesce(max(orden), -1) + 1 as siguiente from home_slides
    `) as Array<{ siguiente: number }>;

    const [fila] = (await db()`
      insert into home_slides (image_url, image_path, alt, caption, focus, orden, actualizado_por)
      values (${imagen.url}, ${imagen.path}, ${leido.data.alt},
              ${leido.data.caption ?? null}, ${leido.data.focus ?? "50% 50%"},
              ${siguiente}, ${admin.id})
      returning id
    `) as Array<{ id: string }>;

    await registra(admin, "home_slides", fila.id, "insert", {
      alt: leido.data.alt,
      ancho: imagen.ancho,
      alto: imagen.alto,
    });
    refresca();

    return { error: null, ok: `Lámina subida (${imagen.ancho}×${imagen.alto} px, WebP).` };
  } catch (err) {
    console.error("[banners] fallo al subir:", err);
    return { error: mensajeDe(err), ok: null };
  }
}

// -------------------------------------------------------------------- editar

export async function guardarLaminaAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const id = String(datos.get("id") ?? "");
  if (!id) return { error: "Falta la lámina.", ok: null };

  const leido = textoLamina.safeParse({
    alt: datos.get("alt"),
    caption: datos.get("caption") || undefined,
    focus: datos.get("focus") || undefined,
  });
  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };
  }

  try {
    await db()`
      update home_slides
         set alt = ${leido.data.alt},
             caption = ${leido.data.caption ?? null},
             focus = ${leido.data.focus ?? "50% 50%"},
             actualizado_en = now(),
             actualizado_por = ${admin.id}
       where id = ${id}
    `;

    await registra(admin, "home_slides", id, "update", leido.data);
    refresca();

    return { error: null, ok: "Guardado." };
  } catch (err) {
    console.error("[banners] fallo al guardar:", err);
    return { error: mensajeDe(err), ok: null };
  }
}

// ------------------------------------------------- activar, mover y eliminar

export async function alternarLaminaAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    update home_slides
       set activa = not activa, actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id}
     returning activa
  `) as Array<{ activa: boolean }>;

  await registra(admin, "home_slides", id, fila?.activa ? "activar" : "desactivar");
  refresca();
}

export async function moverLaminaAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  const direccion = String(datos.get("direccion") ?? "");
  if (!id || (direccion !== "arriba" && direccion !== "abajo")) return;

  const filas = (await db()`
    select id, orden from home_slides order by orden, creado_en
  `) as Array<{ id: string; orden: number }>;

  const i = filas.findIndex((f) => f.id === id);
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= filas.length) return;

  // Se reescribe el orden entero con el índice de la lista, en vez de
  // intercambiar dos valores: si dos láminas acabaron con el mismo `orden`,
  // intercambiarlas no arregla nada y esto sí.
  [filas[i], filas[j]] = [filas[j], filas[i]];
  for (const [n, f] of filas.entries()) {
    await db()`update home_slides set orden = ${n} where id = ${f.id}`;
  }

  await registra(admin, "home_slides", id, `mover:${direccion}`);
  refresca();
}

export async function eliminarLaminaAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    delete from home_slides where id = ${id} returning image_path, alt
  `) as Array<{ image_path: string; alt: string }>;

  if (fila) {
    // Después de borrar la fila, no antes: si falla el borrado del fichero, la
    // base ya está limpia y solo queda una imagen huérfana en el almacén.
    await borraImagen(fila.image_path);
    await registra(admin, "home_slides", id, "delete", { alt: fila.alt });
  }

  refresca();
}

/** Traduce los fallos previsibles; el resto va genérico y al log. */
function mensajeDe(err: unknown): string {
  const texto = err instanceof Error ? err.message : String(err);

  if (/BLOB_READ_WRITE_TOKEN|No token found/i.test(texto)) {
    return "Falta configurar el almacén de imágenes (BLOB_READ_WRITE_TOKEN).";
  }
  if (/relation .*home_slides.* does not exist/i.test(texto)) {
    return "La base de datos no tiene las tablas todavía. Ejecuta las migraciones.";
  }
  if (/DATABASE_URL|POSTGRES_URL/i.test(texto)) {
    return "Falta configurar la base de datos (DATABASE_URL).";
  }
  return "No se pudo completar. Revisa el registro del servidor.";
}
