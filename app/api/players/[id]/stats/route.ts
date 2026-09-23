import { NextResponse } from "next/server";

import { fetchLatinbasketProfile, LATINBASKET_REVALIDATE } from "@/lib/latinbasket";
import { getPlayer } from "@/lib/players";

// Datos en vivo de un jugador, leídos de su ficha en latinbasket.com.
//
//   GET /api/players/jassel-perez/stats
//
// La URL de origen NO se acepta por query string a propósito: sale de la ficha
// del jugador. Si se aceptara, esto sería un proxy abierto y cualquiera podría
// usar el servidor para pedir URLs arbitrarias.
//
// Solo se lee en vivo de LatinBasket. Las fichas de Eurobasket se enlazan pero
// no se raspan: no hay parser para ese sitio y afirmar que el dato viene de
// ahí sin haberlo leído sería falso.

// Next exige un literal aquí: la configuración de segmento se lee en tiempo de
// compilación y con una constante importada el build falla entero. Son las
// mismas 6 h que LATINBASKET_REVALIDATE, que sí se usa en la cabecera de caché.
export const revalidate = 21600;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const player = getPlayer(id);

  if (!player) {
    return NextResponse.json(
      { error: "jugador_no_encontrado", id },
      { status: 404 }
    );
  }

  const fuente = player.source;

  if (!fuente) {
    return NextResponse.json(
      {
        error: "sin_fuente_configurada",
        id,
        detalle:
          "Este jugador no tiene `source` en lib/players.json, así que no hay de dónde leer.",
      },
      { status: 404 }
    );
  }

  if (fuente.name !== "LatinBasket") {
    return NextResponse.json(
      {
        error: "fuente_no_soportada",
        id,
        fuente: fuente.name,
        detalle:
          "Solo se leen en vivo las fichas de LatinBasket. El resto se enlazan, pero sus datos no se importan automáticamente.",
      },
      { status: 404 }
    );
  }

  const url = fuente.url;

  const perfil = await fetchLatinbasketProfile(url);

  if (!perfil) {
    // 502: nosotros estamos bien, quien falla es la fuente. Quien consume esto
    // debe quedarse con los datos locales, no vaciar la ficha.
    return NextResponse.json(
      {
        error: "fuente_no_disponible",
        id,
        fuente: url,
        detalle:
          "No se pudo leer o interpretar la ficha de origen. Revisa el log del servidor.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { id, fuente: fuente.name, fuente_url: url, ...perfil },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${LATINBASKET_REVALIDATE}, stale-while-revalidate=86400`,
      },
    }
  );
}
