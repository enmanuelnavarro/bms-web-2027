// Sesión del panel: cómo se firma la cookie y cómo se comprueba.
//
// Este fichero lo importa `proxy.ts`, que corre en el runtime Edge, así que
// **solo puede usar Web Crypto** —nada del módulo `crypto` de Node y nada de
// la base de datos—. El hash de contraseñas, que sí necesita Node, vive
// aparte en `lib/admin/password.ts`.
//
// Por qué una sesión propia y no NextAuth: aquí no hay OAuth, ni registro
// público, ni recuperación de contraseña. Son cuatro usuarios creados a mano
// con un script. NextAuth v5 lleva años en beta y traería un montón de
// superficie para resolver un problema que cabe en este fichero.
//
// La cookie **no guarda permisos**. Lleva quién eres y hasta cuándo; el rol y
// si la cuenta sigue activa se leen de la base en cada escritura. Así, desactivar
// a alguien surte efecto de inmediato en vez de esperar a que caduque su cookie.

export const COOKIE_SESION = "bms_admin";

/** Ocho horas: una jornada. Al volver al día siguiente se pide la clave. */
export const DURACION_SESION = 60 * 60 * 8;

export type Sesion = {
  /** Id del administrador en la tabla `admins`. */
  id: string;
  email: string;
  /** Caducidad, en segundos desde epoch. */
  exp: number;
};

function secreto(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    // Falla cerrando. Sin secreto no se firma nada, y sin firma cualquiera se
    // haría pasar por administrador escribiéndose la cookie a mano.
    throw new Error(
      "Falta ADMIN_SESSION_SECRET, o tiene menos de 32 caracteres. " +
        "Genera uno con: openssl rand -base64 48"
    );
  }
  return s;
}

const b64url = {
  codifica(bytes: Uint8Array): string {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  descodifica(s: string): Uint8Array {
    const base = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(base + "=".repeat((4 - (base.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  },
};

async function clave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** `<carga en base64url>.<firma en base64url>`. */
export async function firmaSesion(sesion: Sesion): Promise<string> {
  const carga = b64url.codifica(new TextEncoder().encode(JSON.stringify(sesion)));
  const firma = await crypto.subtle.sign("HMAC", await clave(), new TextEncoder().encode(carga));
  return `${carga}.${b64url.codifica(new Uint8Array(firma))}`;
}

/**
 * Devuelve la sesión si la cookie está bien firmada y no ha caducado; `null`
 * en cualquier otro caso. Nunca lanza: una cookie corrupta es un visitante sin
 * sesión, no un error 500.
 */
export async function leeSesion(cookie: string | undefined): Promise<Sesion | null> {
  if (!cookie) return null;

  const punto = cookie.lastIndexOf(".");
  if (punto <= 0) return null;

  const carga = cookie.slice(0, punto);
  const firma = cookie.slice(punto + 1);

  try {
    // `crypto.subtle.verify` ya compara en tiempo constante.
    const valida = await crypto.subtle.verify(
      "HMAC",
      await clave(),
      b64url.descodifica(firma) as unknown as BufferSource,
      new TextEncoder().encode(carga)
    );
    if (!valida) return null;

    const sesion = JSON.parse(new TextDecoder().decode(b64url.descodifica(carga))) as Sesion;
    if (typeof sesion?.id !== "string" || typeof sesion?.exp !== "number") return null;
    if (sesion.exp * 1000 < Date.now()) return null;

    return sesion;
  } catch {
    return null;
  }
}

export function caducidad(): number {
  return Math.floor(Date.now() / 1000) + DURACION_SESION;
}
