import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_ACCESO, iguales, tokenDeAcceso } from "@/lib/acceso";

// Cierra la web entera mientras está en construcción. Ver lib/acceso.ts.
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
];

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

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
