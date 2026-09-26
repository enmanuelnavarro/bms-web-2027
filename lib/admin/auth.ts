import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { COOKIE_SESION, DURACION_SESION, caducidad, firmaSesion, leeSesion } from "./sesion";
import { verificaPassword } from "./password";

// La puerta del panel, del lado del servidor.
//
// Regla que no se salta nadie: **toda escritura llama a `exigeAdmin()`**. El
// proxy filtra la navegación, pero un server action es un endpoint HTTP y se
// puede invocar directamente sin pasar por ninguna página. Confiar solo en el
// proxy es dejar el panel abierto.

export type Admin = {
  id: string;
  email: string;
  nombre: string | null;
  rol: "admin" | "editor";
};

/**
 * El administrador de la petición actual, o `null`. Comprueba la firma de la
 * cookie **y** relee la fila en la base: si la cuenta se desactivó hace un
 * minuto, la sesión deja de valer ya, sin esperar a que caduque.
 */
export async function adminActual(): Promise<Admin | null> {
  const galleta = (await cookies()).get(COOKIE_SESION)?.value;
  const sesion = await leeSesion(galleta);
  if (!sesion) return null;

  const filas = (await db()`
    select id, email, nombre, rol
      from admins
     where id = ${sesion.id} and activo
     limit 1
  `) as Admin[];

  return filas[0] ?? null;
}

/** Igual, pero manda al login si no hay sesión. Para páginas y acciones. */
export async function exigeAdmin(): Promise<Admin> {
  const admin = await adminActual();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Para lo que solo puede tocar un 'admin': gestionar usuarios. */
export async function exigeJefe(): Promise<Admin> {
  const admin = await exigeAdmin();
  if (admin.rol !== "admin") redirect("/admin");
  return admin;
}

type Credenciales = { email: string; clave: string };

/**
 * Comprueba usuario y contraseña y deja la cookie. Devuelve un mensaje de
 * error, o `null` si entró.
 *
 * El mensaje es el mismo para "no existe" y para "clave incorrecta", a
 * propósito: distinguirlos le diría a quien lo intenta qué correos están dados
 * de alta.
 */
export async function iniciaSesion({ email, clave }: Credenciales): Promise<string | null> {
  const normalizado = email.trim().toLowerCase();

  const filas = (await db()`
    select id, email, password_hash, activo
      from admins
     where lower(email) = ${normalizado}
     limit 1
  `) as Array<{ id: string; email: string; password_hash: string; activo: boolean }>;

  const usuario = filas[0];
  const generico = "Correo o contraseña incorrectos.";

  // Se comprueba la contraseña aunque el usuario no exista, contra un hash de
  // mentira, para que ambos casos tarden lo mismo y el tiempo de respuesta no
  // revele qué correos están dados de alta.
  if (!usuario) {
    await verificaPassword(clave, "scrypt$00$00");
    return generico;
  }

  const correcta = await verificaPassword(clave, usuario.password_hash);
  if (!correcta) return generico;
  if (!usuario.activo) return "Esta cuenta está desactivada.";

  await db()`update admins set ultimo_acceso = now() where id = ${usuario.id}`;

  const galleta = await firmaSesion({
    id: usuario.id,
    email: usuario.email,
    exp: caducidad(),
  });

  (await cookies()).set(COOKIE_SESION, galleta, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION,
  });

  return null;
}

export async function cierraSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}

/** Deja constancia de la escritura. Nunca tumba la operación que registra. */
export async function registra(
  admin: Admin,
  tabla: string,
  registro: string,
  accion: string,
  diff?: unknown
): Promise<void> {
  try {
    await db()`
      insert into audit_log (tabla, registro, accion, admin_id, admin_email, diff)
      values (${tabla}, ${registro}, ${accion}, ${admin.id}, ${admin.email},
              ${diff ? JSON.stringify(diff) : null})
    `;
  } catch (err) {
    // Que falle el registro no puede deshacer un guardado que ya ocurrió.
    console.error("[audit_log] no se pudo registrar:", err);
  }
}
