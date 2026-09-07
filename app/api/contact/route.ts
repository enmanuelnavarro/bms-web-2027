import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, telefono, asunto, mensaje, oficina } = await request.json();

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      );
    }

    // Email para el usuario (confirmación)
    const userEmailResponse = await resend.emails.send({
      from: "BMS Agency <noreply@bmsagency.net>",
      to: email,
      subject: "Confirmación: Tu mensaje fue recibido - BMS",
      html: `
        <h2>¡Gracias por contactarnos!</h2>
        <p>Hola ${nombre},</p>
        <p>Recibimos tu mensaje correctamente. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p><strong>Datos de tu solicitud:</strong></p>
        <ul>
          <li>Asunto: ${asunto}</li>
          <li>Oficina de interés: ${oficina === "rd" ? "República Dominicana" : "Miami, Florida"}</li>
          <li>Teléfono: ${telefono || "No proporcionado"}</li>
        </ul>
        <p>BMS - Basket Manager Sport</p>
      `,
    });

    // Email para BMS (recepción de consulta)
    const bmsEmailResponse = await resend.emails.send({
      from: "BMS Agency <noreply@bmsagency.net>",
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@bmsagency.net",
      cc: process.env.NEXT_PUBLIC_INFO_EMAIL || "info@bmsagency.net",
      subject: `Nueva solicitud de contacto - ${asunto}`,
      html: `
        <h2>Nueva solicitud de contacto recibida</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || "No proporcionado"}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p><strong>Oficina de interés:</strong> ${oficina === "rd" ? "República Dominicana" : "Miami, Florida"}</p>
        <hr/>
        <h3>Mensaje:</h3>
        <p>${mensaje.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Verificar que ambos emails se enviaron
    if (userEmailResponse.error || bmsEmailResponse.error) {
      return NextResponse.json(
        { error: "Error al enviar el email" },
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
  } catch (error) {
    console.error("Error en formulario de contacto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
