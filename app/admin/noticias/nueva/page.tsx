import type { Metadata } from "next";
import Link from "next/link";

import { exigeAdmin } from "@/lib/admin/auth";
import Formulario from "../Formulario";
import { jugadoresParaElFormulario, categoriasUsadas } from "../datos";

export const metadata: Metadata = {
  title: "Nueva noticia · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NuevaNoticiaPage() {
  await exigeAdmin();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/noticias" className="text-sm text-body/55 hover:text-gold-light">
          ← Noticias
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-wide text-gold">Nueva noticia</h1>
        <p className="mt-1 text-body/60">
          Se crea como borrador salvo que marques lo contrario. Nadie la ve hasta que la publiques.
        </p>
      </header>

      <Formulario
        noticia={null}
        jugadores={jugadoresParaElFormulario()}
        categorias={await categoriasUsadas()}
      />
    </div>
  );
}
