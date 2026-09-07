// Feed de Instagram — Instagram Graph API ("Instagram API with Instagram Login").
//
// La API Basic Display quedó descontinuada en diciembre de 2024, así que este
// módulo usa graph.instagram.com, que exige una cuenta Business/Creator y un
// token de larga duración generado en Meta for Developers.
//
// El token es SECRETO: va sin prefijo NEXT_PUBLIC_ y solo se lee en el servidor.
// Si no hay token configurado, `getInstagramPosts()` devuelve una lista vacía en
// vez de reventar, y la sección cae al widget o al bloque de respaldo.

export type InstagramPost = {
  id: string;
  caption: string;
  /** Imagen a pintar: para vídeos y reels es el thumbnail. */
  image: string;
  permalink: string;
  timestamp: string;
  isVideo: boolean;
  isCarousel: boolean;
};

type RawMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

/** Cada cuánto Next revalida el feed en segundo plano (1 hora). */
export const INSTAGRAM_REVALIDATE = 3600;

export function isInstagramApiConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN);
}

/**
 * Trae los últimos posts publicados. Nunca lanza: ante cualquier fallo devuelve
 * [] y deja un aviso en el log del servidor, para que un token caducado degrade
 * la sección en lugar de tumbar la home entera.
 */
export async function getInstagramPosts(limit = 8): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID || "me";
  const url =
    `https://graph.instagram.com/${userId}/media` +
    `?fields=${FIELDS}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, { next: { revalidate: INSTAGRAM_REVALIDATE } });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[instagram] ${res.status} ${res.statusText} — revisa que el token siga vigente. ${detail.slice(0, 300)}`
      );
      return [];
    }

    const json = (await res.json()) as { data?: RawMedia[] };
    const media = json.data ?? [];

    return media
      .map(toPost)
      // Un vídeo sin thumbnail no se puede pintar; lo descartamos antes de llegar al render.
      .filter((p): p is InstagramPost => p !== null)
      .slice(0, limit);
  } catch (err) {
    console.error("[instagram] no se pudo consultar el feed:", err);
    return [];
  }
}

function toPost(m: RawMedia): InstagramPost | null {
  const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
  if (!image) return null;

  return {
    id: m.id,
    caption: (m.caption ?? "").trim(),
    image,
    permalink: m.permalink,
    timestamp: m.timestamp,
    isVideo: m.media_type === "VIDEO",
    isCarousel: m.media_type === "CAROUSEL_ALBUM",
  };
}

/** Recorta el pie de foto sin cortar palabras a la mitad. */
export function truncateCaption(caption: string, max = 120): string {
  const clean = caption.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function formatPostDate(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
