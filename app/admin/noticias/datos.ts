import "server-only";

import { PLAYERS, nombreCompleto } from "@/lib/players";
import { todasLasNoticias } from "@/lib/noticias";

// Lo que necesitan los formularios de noticias, en un sitio: el desplegable de
// jugadores y las categorías que ya se han usado.

export function jugadoresParaElFormulario() {
  return PLAYERS.map((p) => ({ id: p.id, nombre: nombreCompleto(p) })).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );
}

/** Las categorías ya usadas, para sugerirlas en vez de reinventarlas cada vez. */
export async function categoriasUsadas(): Promise<string[]> {
  try {
    const todas = await todasLasNoticias();
    return [...new Set(todas.map((n) => n.categoria).filter(Boolean))].sort();
  } catch {
    return ["Jugador", "Selección", "Agencia"];
  }
}
