"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { exigeAdmin, registra } from "@/lib/admin/auth";
import { borraImagen, compruebaFichero, subeImagen, subeOriginal } from "@/lib/admin/imagenes";
import { ETIQUETA_JUGADORES } from "@/lib/jugadores";
import type { Estado } from "../estado";

export type { Estado };

// Escrituras de jugadores y de su álbum.
//
// Todas empiezan con `exigeAdmin()`. Ver la nota de banners sobre por qué
// `{ expire: 0 }` al invalidar.

function refresca() {
  revalidateTag(ETIQUETA_JUGADORES, { expire: 0 });
}

const ficha = z.object({
  nombre: z.string().trim().min(2, "Falta el nombre."),
  apellido: z.string().trim().max(80).optional(),
  bms_code: z.string().trim().max(20).optional(),
  nacionalidad: z.string().trim().max(120).optional(),
  fecha_nacimiento: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "La fecha no tiene buena pinta.")
    .optional(),
  lugar_nacimiento: z.string().trim().max(160).optional(),
  seleccion: z.string().trim().max(160).optional(),
  altura_cm: z.coerce.number().int().min(120).max(260).optional().or(z.literal("").transform(() => undefined)),
  altura_ft: z.string().trim().max(20).optional(),
  peso_kg: z.coerce.number().min(30).max(200).optional().or(z.literal("").transform(() => undefined)),
  peso_lb: z.coerce.number().min(60).max(450).optional().or(z.literal("").transform(() => undefined)),
  posicion: z.string().trim().max(80).optional(),
  posicion_codigo: z.string().trim().max(20).optional(),
  tipo_jugador: z.string().trim().max(60).optional(),
  estado: z.string().trim().max(60).optional(),
  equipo_actual: z.string().trim().max(120).optional(),
  liga_actual: z.string().trim().max(120).optional(),
  pais: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(4000).optional(),
  source_name: z.string().trim().max(60).optional(),
  source_url: z.string().trim().url("El enlace de la ficha externa no es válido.").optional().or(z.literal("").transform(() => undefined)),
  estado_publicacion: z.enum(["borrador", "publicado", "archivado"]),
  destacado: z.boolean(),
});

const vacio = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? undefined : s;
};


// --------------------------------------------------------------------- crear

/** "Ángel Luis Delgado" → "angel-luis-delgado". */
function slugifica(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const alta = z.object({
  nombre: z.string().trim().min(2, "Falta el nombre."),
  apellido: z.string().trim().max(80).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "La dirección solo admite minúsculas, números y guiones.")
    .max(60)
    .optional(),
  bms_code: z.string().trim().max(20).optional(),
});

/**
 * Da de alta un jugador con lo mínimo y manda a su ficha para rellenar el
 * resto. Pedir veinte campos antes de crear nada es la forma más rápida de que
 * nadie dé de alta a nadie.
 *
 * Entra como **borrador**: no se ve en la web hasta que alguien la publique a
 * conciencia. Una ficha a medias delante de un club es peor que ninguna.
 */
export async function crearJugadorAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const leido = alta.safeParse({
    nombre: datos.get("nombre"),
    apellido: vacio(datos.get("apellido")),
    slug: vacio(datos.get("slug")),
    bms_code: vacio(datos.get("bms_code")),
  });

  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };
  }

  const d = leido.data;
  const slug = d.slug || slugifica(`${d.nombre} ${d.apellido ?? ""}`.trim());

  if (!slug) {
    return { error: "No se pudo componer la dirección. Escríbela a mano.", ok: null };
  }

  let id: string;

  try {
    const choca = (await db()`select 1 from players where slug = ${slug} limit 1`) as unknown[];
    if (choca.length) {
      return {
        error: `Ya hay un jugador en /jugadores/${slug}. Cambia la dirección.`,
        ok: null,
      };
    }

    if (d.bms_code) {
      const chocaCodigo = (await db()`
        select 1 from players where bms_code = ${d.bms_code} limit 1
      `) as unknown[];
      if (chocaCodigo.length) {
        return { error: `El código ${d.bms_code} ya está en uso.`, ok: null };
      }
    }

    // Al final del orden, para no recolocar a los que ya están.
    const [{ siguiente }] = (await db()`
      select coalesce(max(orden), -1) + 1 as siguiente from players
    `) as Array<{ siguiente: number }>;

    const [fila] = (await db()`
      insert into players (slug, nombre, apellido, bms_code, estado_publicacion, orden,
                           actualizado_por)
      values (${slug}, ${d.nombre}, ${d.apellido ?? ""}, ${d.bms_code ?? null},
              'borrador', ${siguiente}, ${admin.id})
      returning id
    `) as Array<{ id: string }>;

    id = fila.id;
    await registra(admin, "players", id, "insert", { slug, nombre: d.nombre });
    refresca();
  } catch (err) {
    console.error("[jugadores] fallo al crear:", err);
    return { error: mensajeDe(err), ok: null };
  }

  // Fuera del try: redirect() funciona lanzando.
  redirect(`/admin/jugadores/${id}?nuevo=1`);
}

export async function guardarJugadorAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const id = String(datos.get("id") ?? "");
  if (!id) return { error: "Falta el jugador.", ok: null };

  const leido = ficha.safeParse({
    nombre: datos.get("nombre"),
    apellido: vacio(datos.get("apellido")),
    bms_code: vacio(datos.get("bms_code")),
    nacionalidad: vacio(datos.get("nacionalidad")),
    fecha_nacimiento: String(datos.get("fecha_nacimiento") ?? ""),
    lugar_nacimiento: vacio(datos.get("lugar_nacimiento")),
    seleccion: vacio(datos.get("seleccion")),
    altura_cm: vacio(datos.get("altura_cm")) ?? undefined,
    altura_ft: vacio(datos.get("altura_ft")),
    peso_kg: vacio(datos.get("peso_kg")) ?? undefined,
    peso_lb: vacio(datos.get("peso_lb")) ?? undefined,
    posicion: vacio(datos.get("posicion")),
    posicion_codigo: vacio(datos.get("posicion_codigo")),
    tipo_jugador: vacio(datos.get("tipo_jugador")),
    estado: vacio(datos.get("estado")),
    equipo_actual: vacio(datos.get("equipo_actual")),
    liga_actual: vacio(datos.get("liga_actual")),
    pais: vacio(datos.get("pais")),
    bio: vacio(datos.get("bio")),
    source_name: vacio(datos.get("source_name")),
    source_url: vacio(datos.get("source_url")) ?? "",
    estado_publicacion: datos.get("estado_publicacion"),
    destacado: datos.get("destacado") === "on",
  });

  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Revisa los datos.", ok: null };
  }

  const d = leido.data;

  try {
    await db()`
      update players set
        nombre = ${d.nombre},
        apellido = ${d.apellido ?? ""},
        bms_code = ${d.bms_code ?? null},
        nacionalidad = ${d.nacionalidad ?? null},
        fecha_nacimiento = ${d.fecha_nacimiento || null},
        lugar_nacimiento = ${d.lugar_nacimiento ?? null},
        seleccion = ${d.seleccion ?? null},
        altura_cm = ${d.altura_cm ?? null},
        altura_ft = ${d.altura_ft ?? null},
        peso_kg = ${d.peso_kg ?? null},
        peso_lb = ${d.peso_lb ?? null},
        posicion = ${d.posicion ?? null},
        posicion_codigo = ${d.posicion_codigo ?? null},
        tipo_jugador = ${d.tipo_jugador ?? null},
        estado = ${d.estado ?? null},
        equipo_actual = ${d.equipo_actual ?? null},
        liga_actual = ${d.liga_actual ?? null},
        pais = ${d.pais ?? null},
        bio = ${d.bio ?? null},
        source_name = ${d.source_name ?? null},
        source_url = ${d.source_url ?? null},
        estado_publicacion = ${d.estado_publicacion},
        destacado = ${d.destacado},
        actualizado_en = now(),
        actualizado_por = ${admin.id}
      where id = ${id}
    `;

    await guardaRedes(id, datos);
    await registra(admin, "players", id, "update", { nombre: d.nombre });
    refresca();

    return {
      error: null,
      ok:
        d.estado_publicacion === "publicado"
          ? "Guardado. La ficha está publicada."
          : d.estado_publicacion === "borrador"
            ? "Guardado como borrador: la ficha no se ve en la web."
            : "Guardado y archivado: la ficha sale del listado pero no se borra.",
    };
  } catch (err) {
    console.error("[jugadores] fallo al guardar:", err);
    return { error: mensajeDe(err), ok: null };
  }
}

async function guardaRedes(playerId: string, datos: FormData): Promise<void> {
  for (const red of ["instagram", "twitter", "facebook"]) {
    const url = String(datos.get(`red_${red}`) ?? "").trim();

    if (!url) {
      await db()`delete from player_links where player_id = ${playerId} and tipo = ${red}`;
      continue;
    }

    await db()`
      insert into player_links (player_id, tipo, url) values (${playerId}, ${red}, ${url})
      on conflict (player_id, tipo) do update set url = excluded.url
    `;
  }
}

/** Archivar, nunca borrar: ningún jugador desaparece de la base. */
export async function archivarJugadorAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    update players
       set estado_publicacion = case
             when estado_publicacion = 'archivado' then 'publicado' else 'archivado' end,
           actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id}
     returning estado_publicacion, slug
  `) as Array<{ estado_publicacion: string; slug: string }>;

  if (fila) {
    await registra(admin, "players", id, `publicacion:${fila.estado_publicacion}`, { slug: fila.slug });
  }
  refresca();
}

export async function destacarJugadorAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    update players set destacado = not destacado, actualizado_en = now(), actualizado_por = ${admin.id}
     where id = ${id} returning destacado
  `) as Array<{ destacado: boolean }>;

  await registra(admin, "players", id, fila?.destacado ? "destacar" : "no-destacar");
  refresca();
}

// ------------------------------------------------------------------ álbum

/**
 * Sube una o varias fotos al álbum.
 *
 * Se guardan dos versiones: la optimizada, que es la que se enseña, y el
 * archivo original tal cual, que es lo que un club se descarga para montar su
 * flyer. Enseñar la grande haría la galería lentísima; ofrecer solo la pequeña
 * no serviría para imprimir.
 */
export async function subirFotosAction(_previo: Estado, datos: FormData): Promise<Estado> {
  const admin = await exigeAdmin();

  const playerId = String(datos.get("id") ?? "");
  if (!playerId) return { error: "Falta el jugador.", ok: null };

  const ficheros = datos.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (ficheros.length === 0) return { error: "No has elegido ninguna foto.", ok: null };
  if (ficheros.length > 20) return { error: "Máximo 20 fotos de una vez.", ok: null };

  const tipo = String(datos.get("tipo") ?? "accion");

  const [jugador] = (await db()`
    select slug, nombre, apellido from players where id = ${playerId} limit 1
  `) as Array<{ slug: string; nombre: string; apellido: string }>;
  if (!jugador) return { error: "Ese jugador ya no existe.", ok: null };

  const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`.trim();

  let subidas = 0;
  const problemas: string[] = [];

  for (const fichero of ficheros) {
    const problema = compruebaFichero(fichero);
    if (problema) {
      problemas.push(`${fichero.name}: ${problema}`);
      continue;
    }

    try {
      const web = await subeImagen(fichero, `jugadores/${jugador.slug}`);
      const original = await subeOriginal(fichero, `jugadores/${jugador.slug}`);

      const [{ siguiente }] = (await db()`
        select coalesce(max(orden), -1) + 1 as siguiente
          from player_photos where player_id = ${playerId}
      `) as Array<{ siguiente: number }>;

      await db()`
        insert into player_photos (player_id, url, path, ancho, alto,
                                   url_original, path_original, bytes_original,
                                   alt, tipo, orden, actualizado_por)
        values (${playerId}, ${web.url}, ${web.path}, ${web.ancho}, ${web.alto},
                ${original.url}, ${original.path}, ${original.bytes},
                ${nombreCompleto}, ${tipo === "principal" ? "accion" : tipo},
                ${siguiente}, ${admin.id})
      `;
      subidas++;
    } catch (err) {
      console.error(`[album] fallo con ${fichero.name}:`, err);
      problemas.push(`${fichero.name}: ${mensajeDe(err)}`);
    }
  }

  if (subidas > 0) {
    await registra(admin, "player_photos", playerId, "insert", { cuantas: subidas });
    refresca();
  }

  if (problemas.length && subidas === 0) return { error: problemas.join(" · "), ok: null };
  if (problemas.length) {
    return { error: null, ok: `${subidas} foto(s) subidas. Fallaron: ${problemas.join(" · ")}` };
  }
  return { error: null, ok: `${subidas} foto(s) subidas al álbum.` };
}

export async function borrarFotoAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("foto") ?? "");
  if (!id) return;

  const [fila] = (await db()`
    delete from player_photos where id = ${id} returning path, path_original, player_id
  `) as Array<{ path: string; path_original: string | null; player_id: string }>;

  if (fila) {
    await borraImagen(fila.path);
    if (fila.path_original) await borraImagen(fila.path_original);
    await registra(admin, "player_photos", fila.player_id, "delete");
  }
  refresca();
}

/** Marca cuál es la foto de la ficha. Solo puede haber una. */
export async function fotoPrincipalAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("foto") ?? "");
  const playerId = String(datos.get("id") ?? "");
  if (!id || !playerId) return;

  // Primero se baja la que hubiera: el índice único no admite dos.
  await db()`
    update player_photos set tipo = 'accion'
     where player_id = ${playerId} and tipo = 'principal'
  `;
  await db()`update player_photos set tipo = 'principal' where id = ${id}`;

  await registra(admin, "player_photos", playerId, "principal");
  refresca();
}

export async function editarFotoAction(datos: FormData): Promise<void> {
  const admin = await exigeAdmin();
  const id = String(datos.get("foto") ?? "");
  if (!id) return;

  const alt = String(datos.get("alt") ?? "").trim().slice(0, 200);
  const focus = String(datos.get("focus") ?? "50% 50%").trim();
  const publicada = datos.get("publicada") === "on";

  await db()`
    update player_photos
       set alt = ${alt},
           focus = ${/^\d{1,3}% \d{1,3}%$/.test(focus) ? focus : "50% 50%"},
           publicada = ${publicada},
           actualizado_por = ${admin.id}
     where id = ${id}
  `;

  await registra(admin, "player_photos", id, "update");
  refresca();
}

function mensajeDe(err: unknown): string {
  const texto = err instanceof Error ? err.message : String(err);
  if (/^(No has elegido|El formato|La imagen pesa)/.test(texto)) return texto;
  if (/BLOB_READ_WRITE_TOKEN|No token found/i.test(texto)) {
    return "Falta configurar el almacén de imágenes (BLOB_READ_WRITE_TOKEN).";
  }
  if (/relation .*players.* does not exist/i.test(texto)) {
    return "La base de datos no tiene las tablas de jugadores. Ejecuta las migraciones.";
  }
  if (/duplicate key|unique/i.test(texto)) return "Ya hay otro jugador con ese código BMS.";
  return "No se pudo completar. Revisa el registro del servidor.";
}
