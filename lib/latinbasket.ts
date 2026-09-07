// Lectura automática de fichas de jugador en latinbasket.com.
//
// El robots.txt del sitio permite el rastreo a agentes genéricos (Allow: /) y
// declara Content-Signal "ai-train=no", que no aplica aquí: no entrenamos nada,
// solo leemos la ficha pública de nuestros propios representados.
//
// La página no ofrece API, así que se parsea el HTML. Eso es frágil por
// naturaleza: si cambian la maquetación, el parser deja de encontrar datos. Por
// eso ninguna función lanza excepciones — devuelven null o listas vacías y
// registran el motivo, para que la ficha caiga a los datos locales en vez de
// tumbar la página.

export type LatinbasketSeason = {
  /** Etiqueta tal cual la publica la fuente, p. ej. "2025-2026". */
  temporada: string;
  /** Competición, p. ej. "Spain-Liga Endesa". */
  competicion: string;
  equipo: string;
  pj: number;
  min: number;
  pts: number;
  /** Porcentaje de tiros de 2, ya convertido a número (63.3 en vez de "63.3%"). */
  fg2_pct: number;
  fg3_pct: number;
  ft_pct: number;
  reb_of: number;
  reb_def: number;
  reb: number;
  ast: number;
  faltas: number;
  tap: number;
  rob: number;
  perdidas: number;
  /** Valoración (columna RNK de la fuente). */
  valoracion: number;
};

export type LatinbasketProfile = {
  nombre: string;
  url: string;
  /** Frase de presentación tal cual la publica la fuente. */
  resumen: string;
  nacionalidad: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  /** Altura tal cual la publica la fuente, en pies y pulgadas. */
  altura: string | null;
  /** La misma altura convertida a metros, que es como se muestra en la web. */
  altura_m: string | null;
  posicion: string | null;
  equipo_actual: string | null;
  liga_actual: string | null;
  agencias: string[];
  paises: string[];
  seleccion: string | null;
  temporadas: LatinbasketSeason[];
  /** Momento de la lectura, para poder mostrar "datos a fecha de…". */
  obtenido: string;
};

/** Cada cuánto se revalida la ficha. 6 h: la fuente no cambia más a menudo. */
export const LATINBASKET_REVALIDATE = 21600;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Solo se aceptan fichas del dominio esperado: evita usar esto como proxy. */
export function isValidLatinbasketUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "basketball.latinbasket.com" &&
      u.pathname.startsWith("/player/")
    );
  } catch {
    return false;
  }
}

export async function fetchLatinbasketProfile(
  url: string
): Promise<LatinbasketProfile | null> {
  if (!isValidLatinbasketUrl(url)) {
    console.error(`[latinbasket] URL no admitida: ${url}`);
    return null;
  }

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "es,en;q=0.8" },
      next: { revalidate: LATINBASKET_REVALIDATE },
    });
    if (!res.ok) {
      console.error(`[latinbasket] ${res.status} ${res.statusText} en ${url}`);
      return null;
    }
    html = await res.text();
  } catch (err) {
    console.error("[latinbasket] no se pudo descargar la ficha:", err);
    return null;
  }

  try {
    return parseProfile(html, url);
  } catch (err) {
    console.error("[latinbasket] el parser falló (¿cambió la maquetación?):", err);
    return null;
  }
}

/** Convierte el HTML en una lista de líneas de texto plano, sin etiquetas. */
function toLines(html: string): string[] {
  const sinScripts = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const texto = sinScripts.replace(/<[^>]+>/g, "\n");
  return decodeEntities(texto)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function decodeEntities(s: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  };
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

const MESES: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
};

function parseProfile(html: string, url: string): LatinbasketProfile {
  const lines = toLines(html);

  // El bloque útil arranca en el titular "<NOMBRE> basketball player profile".
  const iTitular = lines.findIndex((l) => /basketball player profile$/i.test(l));
  const nombre =
    iTitular >= 0
      ? lines[iTitular].replace(/\s*basketball player profile$/i, "").trim()
      : "";

  // La presentación viene troceada en varias líneas por los enlaces internos;
  // se recompone uniendo hasta la sección siguiente.
  const resumen = iTitular >= 0 ? joinUntilSection(lines, iTitular + 1) : "";

  const nacionalidad =
    /is ([A-Za-z. ]+?) basketball player/i.exec(resumen)?.[1]?.trim() ?? null;

  const fecha = /born on ([A-Z][a-z]+) (\d{1,2}) (\d{4})/.exec(resumen);
  const fecha_nacimiento = fecha
    ? `${fecha[3]}-${MESES[fecha[1].toLowerCase()] ?? "01"}-${fecha[2].padStart(2, "0")}`
    : null;

  const lugar_nacimiento = /born on [^,]+? in ([^.]+?)\./i.exec(resumen)?.[1]?.trim() ?? null;
  const altura = /He is an? ([\d]+'[\d]+''?)/.exec(resumen)?.[1] ?? null;
  const posicion = /\d'\d+''? ([a-z-]+(?: [a-z]+)?) who/i.exec(resumen)?.[1]?.trim() ?? null;

  const equipoLiga = /most recently played at (.+?) in ([^.]+?)\./i.exec(resumen);
  const equipo_actual = equipoLiga?.[1]?.trim() ?? null;
  const liga_actual = equipoLiga?.[2]?.trim() ?? null;

  const agencias = (/is represented by (.+?)\./i.exec(resumen)?.[1] ?? "")
    .split(/,|\band\b/)
    .map((a) => a.trim())
    .filter(Boolean);

  const paises = (/has played in ([^.]+?)\./i.exec(resumen)?.[1] ?? "")
    .split(/,|\band\b/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Ojo: no vale anclar en "played in" — la frase anterior ("has played in
  // Colombia, …") lo contiene y la captura se comía todo el listado de países.
  // Se ancla en "National Team" y se retrocede sobre el nombre del país.
  const sel = /([A-Z][a-z]+(?:\.|\s[A-Z][a-z]+)*)\s+National Team(?:\s+between\s+([\d]{4}-[\d]{2,4}))?/.exec(
    resumen
  );
  const seleccion = sel
    ? `${sel[1]} National Team${sel[2] ? ` (${sel[2]})` : ""}`
    : null;

  return {
    nombre,
    url,
    resumen,
    nacionalidad,
    fecha_nacimiento,
    lugar_nacimiento,
    altura,
    altura_m: pieARaMetros(altura),
    posicion,
    equipo_actual,
    liga_actual,
    agencias,
    paises,
    seleccion,
    temporadas: parseSeasons(lines),
    obtenido: new Date().toISOString(),
  };
}

/** Une líneas sueltas de la presentación hasta topar con la sección siguiente. */
function joinUntilSection(lines: string[], desde: number): string {
  const corte = ["Other Teammates", "Social Media", "Subscribe", "Statistics"];
  const trozos: string[] = [];
  for (let i = desde; i < Math.min(desde + 40, lines.length); i++) {
    if (corte.includes(lines[i])) break;
    trozos.push(lines[i]);
  }
  // Los enlaces parten frases por la mitad: se recompone y se limpian los
  // espacios sobrantes que quedan antes de comas y puntos.
  return trozos.join(" ").replace(/\s+([,.])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

function parseSeasons(lines: string[]): LatinbasketSeason[] {
  const out: LatinbasketSeason[] = [];
  const vistas = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const cab = /^Season:\s*(.+?)\s*\((.+?)\)$/.exec(lines[i]);
    if (!cab) continue;

    const [, temporada, competicion] = cab;

    // Tras "AVERAGES" van 16 celdas de cabecera (Team, G, MIN, PTS, 2FGP, 3FGP,
    // FT, RO, RD, RT, AS, PF, BS, ST, TO, RNK) y después la fila de datos.
    const iAvg = lines.indexOf("AVERAGES", i);
    if (iAvg < 0 || iAvg > i + 80) continue;

    const fila = lines.slice(iAvg + 17, iAvg + 33);
    if (fila.length < 16) continue;

    const clave = `${temporada}|${competicion}|${fila[0]}`;
    if (vistas.has(clave)) continue;
    vistas.add(clave);

    out.push({
      temporada,
      competicion,
      equipo: fila[0],
      pj: num(fila[1]),
      min: num(fila[2]),
      pts: num(fila[3]),
      fg2_pct: num(fila[4]),
      fg3_pct: num(fila[5]),
      ft_pct: num(fila[6]),
      reb_of: num(fila[7]),
      reb_def: num(fila[8]),
      reb: num(fila[9]),
      ast: num(fila[10]),
      faltas: num(fila[11]),
      tap: num(fila[12]),
      rob: num(fila[13]),
      perdidas: num(fila[14]),
      valoracion: num(fila[15]),
    });
  }

  return out;
}

/** 6'5'' → "1.96m". La fuente solo publica pies y pulgadas. */
function pieARaMetros(altura: string | null): string | null {
  if (!altura) return null;
  const m = /(\d+)'(\d+)/.exec(altura);
  if (!m) return null;
  const metros = (Number(m[1]) * 12 + Number(m[2])) * 0.0254;
  return `${metros.toFixed(2)}m`;
}

function num(s: string | undefined): number {
  const n = parseFloat((s ?? "").replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
