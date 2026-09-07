import { NextResponse } from "next/server";

import { fetchLatinbasketProfile, LATINBASKET_REVALIDATE } from "@/lib/latinbasket";
import playersData from "@/lib/players.json";

// Datos en vivo de un jugador, leídos de su ficha en latinbasket.com.
//
//   GET /api/players/jassel-perez/stats
//
// La URL de origen NO se acepta por query string a propósito: sale de
// players.json. Si se aceptara, esto sería un proxy abierto y cualquiera podría
// usar el servidor para pedir URLs arbitrarias.

export const revalidate = LATINBASKET_REVALIDATE;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const player = (playersData as Array<Record<string, unknown>>).find(
    (p) => p.id === id
  );

  if (!player) {
    return NextResponse.json(
      { error: "jugador_no_encontrado", id },
      { status: 404 }
    );
  }

  const url = typeof player.latinbasket_url === "string" ? player.latinbasket_url : null;

  if (!url) {
    return NextResponse.json(
      {
        error: "sin_fuente_configurada",
        id,
        detalle:
          "Este jugador no tiene latinbasket_url en lib/players.json, así que no hay de dónde leer.",
      },
      { status: 404 }
    );
  }

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
    { id, fuente: "latinbasket.com", fuente_url: url, ...perfil },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${LATINBASKET_REVALIDATE}, stale-while-revalidate=86400`,
      },
    }
  );
}
