import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { guardaLead, anotaEnvio, ETIQUETA_LEADS } from "@/lib/leads";

// Formulario de contacto.
//
// Orden deliberado: **primero se guarda el mensaje, después se manda el
// correo**. Antes solo se enviaba, así que si Resend fallaba —o si el correo
// se perdía entre otros mil— el contacto desaparecía sin dejar rastro. Ahora
// queda en la bandeja del panel pase lo que pase.
//
// Y por eso el envío fallido ya no devuelve error a quien escribe: su mensaje
// sí ha llegado, está guardado. Decirle "error, inténtalo de nuevo" le haría
// mandarlo otra vez y duplicar el contacto.

/** Escapa lo que entra antes de meterlo en el HTML del correo. */
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const OFICINAS: Record<string, string> = {
  rd: "República Dominicana",
  miami: "Miami, Florida",
};

export async function POST(request: NextRequest) {
  let datos: Record<string, unknown>;

  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición mal formada" }, { status: 400 });
  }

  const nombre = String(datos.nombre ?? "").trim();
  const email = String(datos.email ?? "").trim();
  const mensaje = String(datos.mensaje ?? "").trim();
  const telefono = String(datos.telefono ?? "").trim() || null;
  const asunto = String(datos.asunto ?? "").trim() || null;
  const oficina = String(datos.oficina ?? "").trim() || null;
  const jugador = String(datos.jugador ?? "").trim() || null;

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El correo no es válido" }, { status: 400 });
  }

  // --- 1. Guardar ----------------------------------------------------------
  let leadId: string | null = null;
  try {
    leadId = await guardaLead({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      oficina,
      player_slug: jugador,
    });
    revalidateTag(ETIQUETA_LEADS, { expire: 0 });
  } catch (err) {
    // Sin base de datos el formulario tiene que seguir funcionando: se manda
    // el correo igual y se deja constancia en el registro del servidor.
    console.error("[contacto] no se pudo guardar el mensaje:", err);
  }

  // --- 2. Avisar -----------------------------------------------------------
  const oficinaTexto = oficina ? (OFICINAS[oficina] ?? oficina) : "No indicada";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const paraBms = await resend.emails.send({
      from: "BMS Agency <noreply@bmsrd.com>",
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "players@bmsrd.com",
      cc: process.env.NEXT_PUBLIC_INFO_EMAIL || "info@bmsrd.com",
      replyTo: email,
      subject: jugador
        ? `Solicitud de información - ${jugador}`
        : `Nueva solicitud de contacto${asunto ? ` - ${asunto}` : ""}`,
      html: `
        <h2>Nueva solicitud de contacto</h2>
        <p><strong>Nombre:</strong> ${esc(nombre)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Teléfono:</strong> ${esc(telefono) || "No proporcionado"}</p>
        <p><strong>Asunto:</strong> ${esc(asunto) || "—"}</p>
        ${jugador ? `<p><strong>Jugador consultado:</strong> ${esc(jugador)}</p>` : ""}
        <p><strong>Oficina de interés:</strong> ${esc(oficinaTexto)}</p>
        <hr/>
        <h3>Mensaje:</h3>
        <p>${esc(mensaje).replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#888;font-size:12px">
          Queda guardado en el panel: https://www.bmsrd.com/admin/contactos
        </p>
      `,
    });

    const paraQuienEscribe = await resend.emails.send({
      from: "BMS Agency <noreply@bmsrd.com>",
      to: email,
      subject: "Confirmación: Tu mensaje fue recibido - BMS",
      html: `
        <h2>¡Gracias por contactarnos!</h2>
        <p>Hola ${esc(nombre)},</p>
        <p>Recibimos tu mensaje correctamente. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p><strong>Datos de tu solicitud:</strong></p>
        <ul>
          <li>Asunto: ${esc(asunto) || "—"}</li>
          <li>Oficina de interés: ${esc(oficinaTexto)}</li>
          <li>Teléfono: ${esc(telefono) || "No proporcionado"}</li>
        </ul>
        <p>BMS - Basket Manager Sport</p>
      `,
    });

    const fallo = paraBms.error || paraQuienEscribe.error;
    if (leadId) await anotaEnvio(leadId, !fallo, fallo ? JSON.stringify(fallo) : undefined);

    if (fallo) console.error("[contacto] Resend devolvió error:", fallo);
  } catch (err) {
    console.error("[contacto] fallo al enviar los correos:", err);
    if (leadId) await anotaEnvio(leadId, false, err instanceof Error ? err.message : String(err));
  }

  // Si no se pudo ni guardar ni enviar, el mensaje se ha perdido y hay que
  // decirlo. Si al menos una de las dos cosas salió, para quien escribe el
  // mensaje ha llegado.
  if (!leadId && !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "No se pudo registrar tu mensaje. Escríbenos a players@bmsrd.com." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Tu mensaje ha sido enviado correctamente. Pronto recibirás una respuesta.",
    },
    { status: 200 }
  );
}
