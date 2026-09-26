"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { cierraSesion, iniciaSesion } from "@/lib/admin/auth";

// Acciones comunes del panel: entrar y salir.

const credenciales = z.object({
  email: z.string().trim().min(1, "Escribe tu correo.").email("Ese correo no tiene buena pinta."),
  clave: z.string().min(1, "Escribe tu contraseña."),
});

export type EstadoLogin = { error: string | null };

export async function entrarAction(
  _previo: EstadoLogin,
  datos: FormData
): Promise<EstadoLogin> {
  const leido = credenciales.safeParse({
    email: datos.get("email"),
    clave: datos.get("clave"),
  });

  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Revisa los datos." };
  }

  let error: string | null;
  try {
    error = await iniciaSesion(leido.data);
  } catch (err) {
    // Base sin configurar, sin migrar o caída. Se dice lo que pasa en vez de
    // enseñar "correo o contraseña incorrectos", que mandaría a buscar donde
    // no es.
    console.error("[admin] fallo al iniciar sesión:", err);
    return { error: "No se pudo conectar con la base de datos. Avisa a quien lleve la web." };
  }

  if (error) return { error };

  // Fuera del try: redirect() funciona lanzando, y un catch se lo comería.
  const volver = String(datos.get("volver") ?? "");
  redirect(volver.startsWith("/admin") ? volver : "/admin");
}

export async function cerrarSesionAction(): Promise<void> {
  await cierraSesion();
  redirect("/admin/login");
}
