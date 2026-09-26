import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { exigeAdmin } from "@/lib/admin/auth";
import { noticiaPorId } from "@/lib/noticias";
import Formulario from "../Formulario";
import { jugadoresParaElFormulario, categoriasUsadas } from "../datos";

export const metadata: Metadata = {
  title: "Editar noticia · Panel BMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditarNoticiaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  await exigeAdmin();

  const { id } = await params;
  const { nueva } = await searchParams;

  const noticia = await noticiaPorId(id);
  if (!noticia) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/noticias" className="text-sm text-body/55 hover:text-gold-light">
          ← Noticias
        </Link>
        <h1 className="mt-1 line-clamp-2 text-2xl font-bold tracking-wide text-gold">
          {noticia.titulo}
        </h1>
        <p className="mt-1 text-sm text-body/55">
          {noticia.estado === "publicado" ? "Publicada" : "Borrador"} · /noticias/{noticia.slug}
        </p>
      </header>

      <Formulario
        noticia={noticia}
        jugadores={jugadoresParaElFormulario()}
        categorias={await categoriasUsadas()}
        reciencreada={nueva === "1"}
      />
    </div>
  );
}
