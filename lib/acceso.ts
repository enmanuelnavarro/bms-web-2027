// Puerta de acceso mientras la web está en construcción.
//
// La web queda cerrada al público: quien llega ve la página de "en obras" y
// solo entra al sitio completo con la contraseña. No es un sistema de usuarios
// —no hay cuentas ni roles—, es un cerrojo temporal para enseñar el trabajo al
// cliente antes de abrirlo.
//
// Para levantar el cerrojo: quitar SITE_PASSWORD del entorno cuando la web se
// publique de verdad.

export const COOKIE_ACCESO = "bms_acceso";

/** Treinta días: suficiente para no repetir la clave en cada visita. */
export const DURACION_ACCESO = 60 * 60 * 24 * 30;

/**
 * Valor que se guarda en la cookie: un hash de la contraseña, no la
 * contraseña. Así no viaja en claro y no se puede falsificar sin conocerla.
 *
 * Usa Web Crypto porque el middleware corre en el runtime Edge, donde no
 * existe el módulo `crypto` de Node.
 */
export async function tokenDeAcceso(clave: string): Promise<string> {
  const datos = new TextEncoder().encode(`bms-en-construccion:${clave}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante, para no filtrar el token por el reloj. */
export function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
