import type { Metadata } from "next";

import { exigeAdmin } from "@/lib/admin/auth";
import { todosLosLeads } from "@/lib/leads";
import type { Lead } from "@/lib/leads-tipos";
import Bandeja from "./Bandeja";

export const metadata: Metadata = {
  title: "Contactos · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContactosPage() {
  await exigeAdmin();

  let leads: Lead[] = [];
  let fallo: string | null = null;
  try {
    leads = await todosLosLeads();
  } catch (err) {
    console.error("[contactos] no se pudo leer la tabla:", err);
    fallo = "No se pudo leer la base de datos. Comprueba DATABASE_URL y las migraciones.";
  }

  const nuevos = leads.filter((l) => l.estado === "nuevo").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-wide text-gold">Contactos</h1>
        <p className="mt-1 text-body/60">
          Todo lo que llega por el formulario de la web. {nuevos > 0
            ? `${nuevos} sin abrir.`
            : "Nada pendiente."}
        </p>
      </header>

      {fallo ? (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {fallo}
        </p>
      ) : (
        <>
          <p className="rounded border border-hairline bg-elevated px-4 py-3 text-sm text-body/60">
            El mensaje se guarda aquí <strong className="text-body/85">antes</strong> de mandar los
            correos, así que un fallo del envío ya no hace desaparecer un contacto. Si ves
            «sin aviso por correo», el mensaje llegó pero el aviso no: respóndelo desde aquí.
          </p>
          <Bandeja leads={leads} />
        </>
      )}
    </div>
  );
}
