#!/usr/bin/env node
//
// Importa la base de jugadores desde el Excel de BMS a lib/players.json.
//
//   node scripts/import-players.mjs "/ruta/BMS_Base_Datos_Jugadores.xlsx"
//   node scripts/import-players.mjs --dry "/ruta/fichero.xlsx"   (no escribe)
//
// Regla de fusión: el Excel manda en los campos que trae; lo que el Excel no
// tiene (foto, estadísticas, trayectoria, vídeos, biografía, enlace de fuente,
// lugar de nacimiento, selección) se conserva del players.json actual, casando
// por slug. Así se puede reimportar tantas veces como haga falta sin perder el
// trabajo editorial ya hecho.
//
// Nada se inventa: una celda vacía o "N/D" entra como null y la ficha se
// adapta, no se rellena.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { readWorkbook } from "./xlsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, "lib", "players.json");
const DIR_FOTOS = join(RAIZ, "public", "players");

// ---------------------------------------------------------------- utilidades

const VACIO = new Set(["", "n/d", "nd", "n/a", "na", "-", "—", "por validar", "sin datos"]);

const limpio = (v) => {
  const s = String(v ?? "").trim();
  return VACIO.has(s.toLowerCase()) ? null : s;
};

const sinAcentos = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const igualSinAcentos = (a, b) =>
  sinAcentos(a).toLowerCase() === sinAcentos(b).toLowerCase();

const slugify = (s) =>
  sinAcentos(s)
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "RIGOBERTO MENDONZA" → "Rigoberto Mendonza". Respeta lo ya capitalizado. */
const titulo = (s) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((p) =>
      // Partículas que en castellano van en minúscula dentro del nombre.
      ["de", "del", "la", "las", "los", "y"].includes(p)
        ? p
        : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join(" ");

// Jugadores que en el Excel figuran con una grafía distinta a la que ya usa la
// web. Sin este mapa la importación crearía fichas duplicadas con otro slug.
// Clave: slug que saldría del Excel. Valor: slug canónico del sitio.
const ALIAS_SLUG = {
  "rigoberto-mendonza": "rigoberto-mendoza",
  "anderson-garcia": "andersson-garcia",
  "jhonatan-bello": "jonathan-bello",
};

// Valores de plantilla que quedaron en el Excel y no son datos reales.
const PLACEHOLDERS = new Set(["equipo ejemplo", "jugador ejemplo"]);

const NACIONALIDADES = {
  dominicana: "República Dominicana",
  dominicano: "República Dominicana",
  usa: "Estados Unidos",
  "estados unidos": "Estados Unidos",
  espanola: "España",
  española: "España",
  colombiana: "Colombia",
  venezolana: "Venezuela",
};

// Códigos de la hoja LEYENDA del Excel, con su nombre en castellano.
const POSICIONES = {
  PG: "Base",
  SG: "Escolta",
  SF: "Alero",
  PF: "Ala-Pívot",
  C: "Pívot",
  G: "Guardia",
  F: "Ala",
};

// El Excel usa etiquetas de gestión interna; "Link bloqueado" no es un estado
// del jugador, es una nota del proceso de scraping.
const ESTADOS = {
  "link bloqueado": "Por validar",
};

function normalizaNacionalidad(valor) {
  if (!valor) return null;
  return valor
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => NACIONALIDADES[sinAcentos(p).toLowerCase()] ?? p)
    .join(" / ");
}

function normalizaPosicion(codigo) {
  if (!codigo) return { posicion: null, posicion_codigo: null };
  const partes = codigo
    .split("/")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);
  const etiquetas = partes.map((p) => POSICIONES[p] ?? p);
  return {
    posicion: etiquetas.join(" / "),
    posicion_codigo: partes.join("/"),
  };
}

function normalizaEstado(valor) {
  if (!valor) return null;
  return ESTADOS[valor.toLowerCase()] ?? valor;
}

/** El Excel escribe las fechas como MM/DD/AAAA. Devuelve ISO o null. */
function fechaISO(valor) {
  if (!valor) return null;

  const barras = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(valor);
  if (barras) {
    const [, mes, dia, anio] = barras;
    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;

  // Excel también puede guardar la fecha como número de serie (base 1899-12-30).
  if (/^\d+$/.test(valor)) {
    const ms = (Number(valor) - 25569) * 86400000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  return null;
}

const numero = (valor) => {
  if (!valor) return null;
  const n = Number(String(valor).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/**
 * El esquema anterior guardaba las medidas como texto ("1.96m", "90kg"). Se
 * reaprovechan cuando el Excel no trae el dato, para no perder información.
 */
function medidaLegado(texto, factor) {
  if (typeof texto !== "string") return null;
  const n = parseFloat(texto.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * factor) : null;
}

/** "LUIS BRYANT FELIZ" → { nombre: "Luis Bryant", apellido: "Feliz" }. */
function partirNombre(completo) {
  const partes = titulo(completo).split(/\s+/).filter(Boolean);
  if (partes.length === 1) return { nombre: partes[0], apellido: "" };
  return {
    nombre: partes.slice(0, -1).join(" "),
    apellido: partes[partes.length - 1],
  };
}

/** Detecta si la URL es de latinbasket o de eurobasket. */
function fuenteDesdeUrl(url) {
  if (!url) return null;
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("latinbasket")) return { name: "LatinBasket", url };
  if (host.includes("eurobasket")) return { name: "Eurobasket", url };
  // Dominio desconocido: se guarda igual, pero sin afirmar de quién es.
  return { name: "Perfil externo", url };
}

/** Busca /public/players/<slug>.(png|jpg|webp). */
function fotoDe(slug) {
  if (!existsSync(DIR_FOTOS)) return null;
  const encontrada = readdirSync(DIR_FOTOS).find((f) =>
    /^(.+)\.(png|jpe?g|webp|avif)$/i.test(f) && f.replace(/\.[^.]+$/, "") === slug
  );
  return encontrada ? `/players/${encontrada}` : null;
}

// ------------------------------------------------------------ lectura de hoja

/** Empareja las cabeceras del Excel con las claves que usa el importador. */
const COLUMNAS = [
  ["id", /^id$/],
  ["nombre_completo", /nombre/],
  ["fecha_nacimiento", /fecha/],
  ["edad", /edad/],
  ["nacionalidad", /nacionalidad/],
  ["posicion", /posicion(?!.*secundaria)/],
  ["posicion_secundaria", /posicion.*secundaria/],
  ["altura_cm", /altura.*cm/],
  ["altura_ft", /altura.*(ft|pies)/],
  ["peso_kg", /peso.*kg/],
  ["peso_lb", /peso.*(lb|libras)/],
  ["tipo_jugador", /tipo/],
  ["equipo_actual", /equipo/],
  ["pais", /^pais$/],
  ["estado", /estado/],
  ["url", /(url|enlace|link|latinbasket|eurobasket|perfil)/],
];

function mapaColumnas(cabecera) {
  const mapa = {};
  cabecera.forEach((celda, i) => {
    const texto = sinAcentos(String(celda ?? "")).toLowerCase().trim();
    if (!texto) return;
    for (const [clave, patron] of COLUMNAS) {
      if (mapa[clave] === undefined && patron.test(texto)) {
        mapa[clave] = i;
        return;
      }
    }
  });
  return mapa;
}

function hojaJugadores(libro) {
  const nombre =
    Object.keys(libro).find((n) => /jugador|player|roster/i.test(n)) ??
    Object.keys(libro)[0];
  return { nombre, filas: libro[nombre] ?? [] };
}

// -------------------------------------------------------------------- import

function importar(rutaExcel, { dry = false } = {}) {
  const libro = readWorkbook(rutaExcel);
  const { nombre: hoja, filas } = hojaJugadores(libro);
  if (filas.length < 2) throw new Error(`La hoja "${hoja}" no tiene filas de datos.`);

  const col = mapaColumnas(filas[0]);
  if (col.nombre_completo === undefined) {
    throw new Error(
      `No se encontró la columna de nombre en la hoja "${hoja}". Cabeceras: ${filas[0].join(" | ")}`
    );
  }

  const actuales = existsSync(DESTINO)
    ? JSON.parse(readFileSync(DESTINO, "utf8"))
    : [];
  const porSlug = new Map(actuales.map((p) => [p.id, p]));

  const salida = [];
  const vistos = new Map();
  const avisos = [];

  for (let f = 1; f < filas.length; f++) {
    const fila = filas[f];
    const celda = (clave) =>
      col[clave] === undefined ? null : limpio(fila[col[clave]]);

    const nombreCompleto = celda("nombre_completo");
    if (!nombreCompleto) continue;
    if (PLACEHOLDERS.has(nombreCompleto.toLowerCase())) {
      avisos.push(`Fila ${f + 1}: fila de ejemplo de la plantilla, omitida.`);
      continue;
    }

    const slugExcel = slugify(nombreCompleto);
    const slug = ALIAS_SLUG[slugExcel] ?? slugExcel;

    if (vistos.has(slug)) {
      avisos.push(
        `Fila ${f + 1}: "${nombreCompleto}" repite el slug "${slug}" (ya usado en la fila ${vistos.get(slug)}). Omitida.`
      );
      continue;
    }
    vistos.set(slug, f + 1);

    const previo = porSlug.get(slug) ?? {};
    const { nombre, apellido } = partirNombre(nombreCompleto);
    const { posicion, posicion_codigo } = normalizaPosicion(celda("posicion"));

    const equipoBruto = celda("equipo_actual");
    let equipo =
      equipoBruto && PLACEHOLDERS.has(equipoBruto.toLowerCase()) ? null : equipoBruto;
    if (equipoBruto && !equipo) {
      avisos.push(`${nombreCompleto}: el equipo del Excel es un valor de plantilla, se deja vacío.`);
    }

    // El Excel viene sin tildes. Si es el mismo equipo que ya figuraba en la
    // web, se conserva la grafía publicada, que está mejor escrita.
    if (equipo && previo.equipo_actual && igualSinAcentos(equipo, previo.equipo_actual)) {
      equipo = previo.equipo_actual;
    }

    // La liga solo sigue valiendo si el equipo no ha cambiado: mantenerla
    // tras un traspaso deja emparejamientos falsos (equipo nuevo, liga vieja).
    const equipoFinal = equipo ?? previo.equipo_actual ?? null;
    const mismoEquipo =
      Boolean(previo.equipo_actual) && equipoFinal === previo.equipo_actual;
    const liga = mismoEquipo ? (previo.liga_actual ?? null) : null;
    if (previo.liga_actual && !mismoEquipo) {
      avisos.push(
        `${nombreCompleto}: cambia de equipo (${previo.equipo_actual} → ${equipoFinal}); se borra la liga "${previo.liga_actual}", que ya no corresponde.`
      );
    }

    // El esquema anterior guardaba la ficha externa en `latinbasket_url`; se
    // migra a `source` para que Eurobasket quepa en el mismo campo.
    const fuente =
      fuenteDesdeUrl(celda("url")) ??
      previo.source ??
      fuenteDesdeUrl(previo.latinbasket_url) ??
      null;

    salida.push({
      id: slug,
      bms_id: celda("id") ?? previo.bms_id ?? null,

      // El nombre ya publicado manda sobre el del Excel: la web lo tiene con
      // los acentos correctos y el Excel está en mayúsculas sin tildes.
      nombre: previo.nombre ?? nombre,
      apellido: previo.apellido ?? apellido,

      foto: fotoDe(slug) ?? previo.foto ?? null,

      nacionalidad: normalizaNacionalidad(celda("nacionalidad")) ?? previo.nacionalidad ?? null,
      fecha_nacimiento: fechaISO(celda("fecha_nacimiento")) ?? previo.fecha_nacimiento ?? null,

      altura_cm:
        numero(celda("altura_cm")) ?? previo.altura_cm ?? medidaLegado(previo.altura, 100),
      altura_ft: celda("altura_ft") ?? previo.altura_ft ?? null,
      peso_kg: numero(celda("peso_kg")) ?? previo.peso_kg ?? medidaLegado(previo.peso, 1),
      peso_lb: numero(celda("peso_lb")) ?? previo.peso_lb ?? null,

      posicion: posicion ?? previo.posicion ?? null,
      posicion_codigo: posicion_codigo ?? previo.posicion_codigo ?? null,
      tipo_jugador: celda("tipo_jugador") ?? previo.tipo_jugador ?? null,

      equipo_actual: equipoFinal,
      // El Excel no trae liga: solo sobrevive la que ya hubiera si el equipo
      // sigue siendo el mismo.
      liga_actual: liga,
      pais: celda("pais") ?? previo.pais ?? null,
      estado: normalizaEstado(celda("estado")) ?? previo.estado ?? null,

      source: fuente,

      // Contenido editorial: no viene del Excel, se conserva tal cual.
      lugar_nacimiento: previo.lugar_nacimiento ?? null,
      seleccion: previo.seleccion || null,
      bio: previo.bio ?? null,
      redes_sociales: previo.redes_sociales ?? {},
      historial_equipos: previo.historial_equipos ?? [],
      estadisticas_temporada: previo.estadisticas_temporada ?? [],
      videos_youtube: previo.videos_youtube ?? [],
    });
  }

  // Fichas que están en la web pero no en el Excel: se conservan y se avisa,
  // borrarlas en silencio rompería enlaces ya publicados.
  for (const p of actuales) {
    if (!vistos.has(p.id)) {
      avisos.push(`"${p.id}" no aparece en el Excel; se conserva la ficha existente.`);
      salida.push(p);
    }
  }

  salida.sort((a, b) => (a.bms_id ?? "zzz").localeCompare(b.bms_id ?? "zzz"));

  if (!dry) writeFileSync(DESTINO, `${JSON.stringify(salida, null, 2)}\n`, "utf8");

  return { salida, avisos, hoja, columnas: col };
}

// ---------------------------------------------------------------------- CLI

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const ruta = args.find((a) => !a.startsWith("--"));

if (!ruta) {
  console.error("Uso: node scripts/import-players.mjs [--dry] <fichero.xlsx>");
  process.exit(1);
}

const { salida, avisos, hoja, columnas } = importar(ruta, { dry });

console.log(`Hoja leída: ${hoja}`);
console.log(`Columnas reconocidas: ${Object.keys(columnas).join(", ")}`);
console.log(`Jugadores en ${dry ? "la simulación" : DESTINO}: ${salida.length}`);

const sin = (f) => salida.filter(f).map((p) => p.id);
console.log(`Sin fotografía: ${sin((p) => !p.foto || p.foto.includes("placeholder")).length}`);
console.log(`Sin estadísticas: ${sin((p) => p.estadisticas_temporada.length === 0).length}`);
console.log(`Sin enlace de fuente: ${sin((p) => !p.source).length}`);

if (avisos.length) {
  console.log("\nAvisos:");
  for (const a of avisos) console.log(`  · ${a}`);
}
