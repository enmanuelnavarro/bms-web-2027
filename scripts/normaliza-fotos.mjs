// Prepara las fotos de los jugadores para la web.
//
//   node scripts/normaliza-fotos.mjs
//
// Lee los originales de assets/fotos-originales (no se publican: quedan fuera
// de /public) y escribe en public/players una versión lista para las tarjetas.
//
// El problema que resuelve: las fotos llegan de mil sitios —recortes de prensa
// apaisados de 350x254, retratos de estudio de 1200x1424, capturas de
// Instagram, fotos de cancha entera— y en una rejilla con todas las cajas
// iguales unas salían enormes y otras diminutas, con bandas negras alrededor.
//
// Tres pasos:
//   1. Se quitan los bordes uniformes (bandas negras o blancas del recorte).
//   2. Se encuadra todo a 4:5 vertical. El recorte automático lo sitúa sharp
//      con su estrategia "attention", que busca el peso visual de la imagen y
//      da prioridad al tono de piel: en un retrato, la cara.
//   3. Se guarda a 900x1125. Con transparencia en WebP —son recortes con el
//      fondo quitado y un JPEG les pondría una caja de color detrás—; el resto
//      en JPEG, que para una foto pesa la mitad que un PNG.
//
// Los originales no se tocan: si un encuadre sale mal se ajusta aquí y se
// vuelve a lanzar.

import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, parse } from "node:path";

const ORIGENES = "assets/fotos-originales";
const DESTINO = "public/players";
const ANCHO = 900;
const ALTO = 1125; // 4:5

/**
 * Encuadres a mano, en fracciones [izquierda, arriba, ancho, alto] de la foto
 * ya recortada de bordes. Solo hacen falta cuando el jugador sale lejos y el
 * encuadre automático, que no sabe distinguir una persona de una canasta,
 * deja la figura pequeña en mitad del pabellón.
 */
const ENCUADRES = {
  "bj-fitzgerald.jpeg": [0.35, 0.07, 0.335, 0.28],
  "daylin-thomas.jpg": [0.45, 0, 0.55, 0.69],
  "luismal-ferreiras.jpg": [0.28, 0.03, 0.44, 0.44],
};

/** Un píxel se considera transparente bastante por debajo de opaco del todo. */
async function tieneTransparencia(ruta) {
  const meta = await sharp(ruta).metadata();
  if (!meta.hasAlpha) return false;
  const { data } = await sharp(ruta).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

/**
 * Recorta los bordes uniformes. Si el recorte se lleva más de la mitad de la
 * imagen es que el umbral ha mordido al jugador: en ese caso se deja igual.
 */
async function sinBordes(ruta) {
  const meta = await sharp(ruta).metadata();
  try {
    const r = await sharp(ruta).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
    if (r.info.width * r.info.height > meta.width * meta.height * 0.4) return r;
  } catch {
    // Imagen de un solo color: trim falla y no hay nada que quitar.
  }
  return { data: await sharp(ruta).toBuffer(), info: { width: meta.width, height: meta.height } };
}

if (!existsSync(ORIGENES)) {
  console.error(`No existe ${ORIGENES}. Ahí van las fotos tal como llegan.`);
  process.exit(1);
}
mkdirSync(DESTINO, { recursive: true });

const fotos = readdirSync(ORIGENES).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const resultado = [];

for (const foto of fotos) {
  const ruta = join(ORIGENES, foto);
  const { name } = parse(foto);
  const alfa = await tieneTransparencia(ruta);
  const { data, info } = await sinBordes(ruta);

  let pipe = sharp(data);
  const manual = ENCUADRES[foto];
  if (manual) {
    const [x, y, w, h] = manual;
    pipe = pipe.extract({
      left: Math.round(info.width * x),
      top: Math.round(info.height * y),
      width: Math.max(1, Math.round(info.width * w)),
      height: Math.max(1, Math.round(info.height * h)),
    });
  }
  pipe = pipe.resize(ANCHO, ALTO, {
    fit: "cover",
    position: manual ? "centre" : sharp.strategy.attention,
  });

  const destino = join(DESTINO, `${name}.${alfa ? "webp" : "jpg"}`);
  // Si la misma foto existía con otra extensión, se va: si no, quedarían dos
  // ficheros para el mismo jugador y el importador cogería el que quisiera.
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const viejo = join(DESTINO, `${name}.${ext}`);
    if (existsSync(viejo) && viejo !== destino) rmSync(viejo);
  }

  await (alfa
    ? pipe.webp({ quality: 90, alphaQuality: 100 })
    : pipe.jpeg({ quality: 88, mozjpeg: true })
  ).toFile(destino);

  resultado.push({ foto, destino, alfa, manual: Boolean(manual) });
}

const conAlfa = resultado.filter((r) => r.alfa).length;
console.log(`${resultado.length} fotos a ${ANCHO}x${ALTO} (4:5)`);
console.log(`  ${conAlfa} recortes con fondo transparente → .webp`);
console.log(`  ${resultado.length - conAlfa} fotos con fondo → .jpg`);
console.log(`  ${resultado.filter((r) => r.manual).length} con encuadre a mano`);
