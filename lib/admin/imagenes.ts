import "server-only";

import { put, del } from "@vercel/blob";
import sharp from "sharp";

// Subida de imágenes al almacenamiento de Vercel Blob.
//
// Lo que llega del formulario no se guarda tal cual: se convierte a WebP y se
// limita a 2400 px en el lado mayor. Un banner sacado del móvil son 4 MB y
// 4000 px de ancho, y en pantalla se ve exactamente igual pesando 200 KB.
//
// Convertir en el servidor y no en el navegador es a propósito: así da igual
// desde qué aparato se suba —la agencia carga contenido desde eventos, con el
// teléfono— y no hay forma de colar un fichero sin pasar por aquí.

/** Lo que se acepta que entre. Lo que sale siempre es WebP. */
export const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** 12 MB. Las fotos de un móvil moderno no llegan; una captura de pantalla tampoco. */
export const TAMANO_MAXIMO = 12 * 1024 * 1024;

const LADO_MAXIMO = 2400;

export type ImagenSubida = {
  url: string;
  /** Ruta dentro del almacén, que es lo que hace falta para borrarla. */
  path: string;
  ancho: number;
  alto: number;
};

export function compruebaFichero(fichero: File): string | null {
  if (!fichero || fichero.size === 0) return "No has elegido ninguna imagen.";
  if (!TIPOS_ACEPTADOS.includes(fichero.type)) {
    return "El formato no vale. Sube un JPG, un PNG, un WebP o un AVIF.";
  }
  if (fichero.size > TAMANO_MAXIMO) {
    const mb = (fichero.size / 1024 / 1024).toFixed(1);
    return `La imagen pesa ${mb} MB y el máximo son 12 MB.`;
  }
  return null;
}

/**
 * Convierte a WebP, redimensiona si hace falta y sube.
 *
 * `carpeta` agrupa dentro del almacén ("banners", "noticias", "jugadores/<slug>").
 * El nombre lo pone Vercel con un sufijo aleatorio, así que subir dos veces la
 * misma foto no pisa la anterior.
 */
export async function subeImagen(fichero: File, carpeta: string): Promise<ImagenSubida> {
  const entrada = Buffer.from(await fichero.arrayBuffer());

  const procesada = await sharp(entrada)
    // withoutEnlargement: una imagen pequeña se deja como está en vez de
    // estirarla y que se vea peor de lo que entró.
    .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const base = fichero.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]+/g, "-").slice(0, 60);
  const nombre = `${carpeta}/${base || "imagen"}.webp`;

  const blob = await put(nombre, procesada.data as unknown as Buffer, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    path: blob.pathname,
    ancho: procesada.info.width,
    alto: procesada.info.height,
  };
}

/**
 * Sube el archivo **tal cual llegó**, sin recomprimir.
 *
 * Es lo que un club se descarga del álbum para montar un flyer: la versión
 * optimizada de la galería está pensada para cargar rápido en pantalla, y para
 * imprimir o recortar no sirve. Ocupa más, pero es justo el material que la
 * agencia quiere que circule.
 */
export async function subeOriginal(
  fichero: File,
  carpeta: string
): Promise<{ url: string; path: string; bytes: number }> {
  const datos = Buffer.from(await fichero.arrayBuffer());
  const base = fichero.name.replace(/[^a-zA-Z0-9.-]+/g, "-").slice(0, 70);

  const blob = await put(`${carpeta}/originales/${base || "foto"}`, datos as unknown as Buffer, {
    access: "public",
    contentType: fichero.type || "application/octet-stream",
    addRandomSuffix: true,
  });

  return { url: blob.url, path: blob.pathname, bytes: datos.length };
}

/**
 * Borra una imagen del almacén. No lanza: si el fichero ya no está, la fila de
 * la base se tiene que poder borrar igual. Quedarse con una fila apuntando a
 * una imagen que no existe es peor que dejar un fichero huérfano.
 */
export async function borraImagen(path: string): Promise<void> {
  try {
    await del(path);
  } catch (err) {
    console.error(`[blob] no se pudo borrar ${path}:`, err);
  }
}
