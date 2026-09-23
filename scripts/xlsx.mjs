// Lector mínimo de .xlsx. Un xlsx es un ZIP con XML dentro; con esto se evita
// añadir una dependencia (xlsx/exceljs) que solo haría falta al importar.
//
// Solo lee lo que necesita el importador: valores de celda como texto, hoja a
// hoja. No interpreta formatos, fórmulas ni estilos.

import { execFileSync } from "node:child_process";

const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

/** Extrae un fichero del zip sin descomprimirlo entero. */
function unzip(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function entries(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function decode(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

// Según quién genere el fichero, las etiquetas llevan prefijo de espacio de
// nombres (<x:sheet>) o no (<sheet>). Se acepta cualquiera.
const P = "(?:[A-Za-z0-9]+:)?";
const et = (nombre, flags = "g") =>
  new RegExp(`<${P}${nombre}\\b([^>]*)(?:\\/>|>([\\s\\S]*?)<\\/${P}${nombre}>)`, flags);

/** Todo el texto de los <t> que haya dentro del fragmento. */
function textOf(xml) {
  const out = [];
  for (const m of xml.matchAll(et("t"))) out.push(decode(m[2] ?? ""));
  return out.join("");
}

/** Contenido del primer <v> del fragmento. */
function valueOf(xml) {
  return et("v", "").exec(xml)?.[2] ?? null;
}

/** "BC12" → 54 (índice de columna, base 0). */
function colIndex(ref) {
  const letras = /^([A-Z]+)/.exec(ref)?.[1] ?? "A";
  let n = 0;
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function sharedStrings(zipPath, lista) {
  if (!lista.includes("xl/sharedStrings.xml")) return [];
  const xml = unzip(zipPath, "xl/sharedStrings.xml");
  return [...xml.matchAll(et("si"))].map((m) => textOf(m[2] ?? ""));
}

/**
 * Devuelve { [nombreHoja]: string[][] }. Las celdas vacías salen como "".
 */
export function readWorkbook(zipPath) {
  const lista = entries(zipPath);
  const shared = sharedStrings(zipPath, lista);

  const rels = unzip(zipPath, "xl/_rels/workbook.xml.rels");
  const relMap = new Map();
  for (const m of rels.matchAll(/<Relationship\b[^>]*\/>/g)) {
    const id = /Id="([^"]+)"/.exec(m[0])?.[1];
    const target = /Target="([^"]+)"/.exec(m[0])?.[1];
    if (id && target) relMap.set(id, target);
  }

  const wb = unzip(zipPath, "xl/workbook.xml");
  const hojas = {};

  for (const m of wb.matchAll(et("sheet"))) {
    const nombre = decode(/name="([^"]+)"/.exec(m[0])?.[1] ?? "");
    const rid = new RegExp(`r:id="([^"]+)"`).exec(m[0])?.[1] ?? "";
    let target = (relMap.get(rid) ?? "").replace(/^\//, "");
    if (!lista.includes(target)) target = `xl/${target}`;
    if (!lista.includes(target)) continue;

    hojas[nombre] = parseSheet(unzip(zipPath, target), shared);
  }

  return hojas;
}

function parseSheet(xml, shared) {
  const filas = [];

  for (const fila of xml.matchAll(et("row"))) {
    const celdas = [];
    for (const c of (fila[2] ?? "").matchAll(et("c"))) {
      const attrs = c[1];
      const cuerpo = c[2] ?? "";
      const ref = /r="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const tipo = /t="([^"]+)"/.exec(attrs)?.[1];
      const i = ref ? colIndex(ref) : celdas.length;

      let valor = "";
      if (tipo === "s") {
        valor = shared[Number(valueOf(cuerpo) ?? "-1")] ?? "";
      } else if (tipo === "inlineStr" || tipo === "str") {
        valor = tipo === "str" ? decode(valueOf(cuerpo) ?? "") : textOf(cuerpo);
      } else {
        valor = decode(valueOf(cuerpo) ?? "");
      }

      while (celdas.length < i) celdas.push("");
      celdas[i] = valor.trim();
    }
    filas.push(celdas);
  }

  return filas;
}
