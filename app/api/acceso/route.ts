import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_ACCESO, DURACION_ACCESO, tokenDeAcceso } from "@/lib/acceso";

// Comprueba la clave de la web en obras y, si es correcta, deja la cookie que
// el middleware mira en cada petición. Ver lib/acceso.ts.
//
// Es un POST de formulario normal: así la puerta funciona aunque el navegador
// no ejecute JavaScript.

export async function POST(req: NextRequest) {
  const datos = await req.formData();
  const clave = String(datos.get("clave") ?? "");
  const volver = String(datos.get("volver") ?? "/");

  const esperada = process.env.SITE_PASSWORD;

  if (!esperada || clave !== esperada) {
    const destino = new URL("/en-construccion", req.url);
    destino.searchParams.set("error", "1");
    if (volver && volver !== "/") destino.searchParams.set("volver", volver);
    return NextResponse.redirect(destino, { status: 303 });
  }

  // Solo se admiten rutas internas: con una URL completa esto sería un salto
  // abierto a cualquier dominio.
  const ruta = volver.startsWith("/") && !volver.startsWith("//") ? volver : "/";

  const respuesta = NextResponse.redirect(new URL(ruta, req.url), { status: 303 });
  respuesta.cookies.set(COOKIE_ACCESO, await tokenDeAcceso(esperada), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_ACCESO,
  });
  return respuesta;
}
