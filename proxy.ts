import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_ACCESO, iguales, tokenDeAcceso } from "@/lib/acceso";
import { COOKIE_SESION, leeSesion } from "@/lib/admin/sesion";

// Dos puertas distintas, por orden:
//
//   1. /admin  → sesión de administrador (lib/admin/sesion.ts).
//   2. resto   → clave del modo obras (lib/acceso.ts).
//
// El panel queda **fuera** del modo obras: tiene su propia autenticación, que
// es más fuerte que una clave compartida, y quien sube contenido desde un
// evento no debería tener que pasar dos cerrojos.
//
// Esto filtra la navegación, nada más. Un server action es un endpoint HTTP y
// se puede llamar sin pasar por ninguna página, así que **toda escritura
// vuelve a comprobar la sesión en el servidor** con `exigeAdmin()`. Ver
// lib/admin/auth.ts.
//
// Va en proxy.ts, no en middleware.ts: Next 16 dejó obsoleto ese nombre.
//
// Falla cerrando: si SITE_PASSWORD no está configurada, no se abre el sitio
// "por si acaso" —se enseña la página de obras sin formulario—. Una variable
// que se olvida de copiar en Vercel no debe dejar la web abierta sin querer.

const LIBRES = [
  "/en-construccion",
  "/api/acceso",
  // El escudo y el icono se usan en la propia página de obras.
  "/logos/",
  "/icon.png",
  "/favicon.ico",
  // Las imágenes de /public tienen que pasar aunque el sitio esté cerrado:
  // el optimizador de Next las pide al propio servidor con una petición
  // interna, sin la cookie de acceso, y si el proxy la redirige a las obras
  // recibe un 307 y responde "The requested resource isn't a valid image".
  // Sin esto no se ve ni una foto, tampoco con la clave puesta. Lo que se
  // cierra son las páginas y los datos; un .png suelto no enseña nada.
  "/players/",
  "/equipo/",
  "/banner/",
];

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // --- Puerta 1: el panel ---------------------------------------------------
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // El login tiene que ser accesible, o no hay forma de entrar nunca.
    if (pathname === "/admin/login") return NextResponse.next();

    const sesion = await leeSesion(req.cookies.get(COOKIE_SESION)?.value);
    if (sesion) return NextResponse.next();

    const login = req.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = pathname === "/admin" ? "" : `?volver=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(login);
  }

  // --- Puerta 2: el modo obras ---------------------------------------------
  if (LIBRES.some((ruta) => pathname === ruta || pathname.startsWith(ruta))) {
    return NextResponse.next();
  }

  const clave = process.env.SITE_PASSWORD;

  // Sin cerrojo configurado, la web está abierta: es el estado normal cuando
  // se lance. El modo obras se activa poniendo SITE_PASSWORD.
  if (!clave) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_ACCESO)?.value;
  if (cookie && iguales(cookie, await tokenDeAcceso(clave))) {
    return NextResponse.next();
  }

  const destino = req.nextUrl.clone();
  destino.pathname = "/en-construccion";
  // Se recuerda a dónde iba para devolverlo ahí tras poner la clave.
  destino.search = pathname === "/" ? "" : `?volver=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(destino);
}

export const config = {
  // Todo menos los recursos que sirve Next: si se filtran aquí, el redirect no
  // se come los chunks de JavaScript ni las imágenes optimizadas.
  matcher: ["/((?!_next/static|_next/image|_next/data).*)"],
};
