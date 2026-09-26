"use client";

import { useEditor, EditorContent, type Editor as EditorTipTap } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

// Editor visual de la noticia, sobre TipTap.
//
// Produce HTML, que viaja en un campo oculto del formulario. **Lo que salga de
// aquí se sanea en el servidor** antes de guardarlo (lib/admin/html.ts): esto
// es el navegador y no es de fiar, por muy administrador que sea quien escribe.
//
// La barra solo trae lo que hace falta para una nota de prensa. Ni tipografías,
// ni colores, ni tamaños: la noticia tiene que verse como el resto de la web,
// y si se deja elegir, se acaba con seis estilos distintos por página.

type Boton = {
  nombre: string;
  titulo: string;
  activo?: (e: EditorTipTap) => boolean;
  al: (e: EditorTipTap) => void;
};

const BOTONES: Boton[] = [
  {
    nombre: "B",
    titulo: "Negrita",
    activo: (e) => e.isActive("bold"),
    al: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    nombre: "I",
    titulo: "Cursiva",
    activo: (e) => e.isActive("italic"),
    al: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    nombre: "H2",
    titulo: "Subtítulo",
    activo: (e) => e.isActive("heading", { level: 2 }),
    al: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    nombre: "H3",
    titulo: "Subtítulo menor",
    activo: (e) => e.isActive("heading", { level: 3 }),
    al: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    nombre: "•",
    titulo: "Lista",
    activo: (e) => e.isActive("bulletList"),
    al: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    nombre: "1.",
    titulo: "Lista numerada",
    activo: (e) => e.isActive("orderedList"),
    al: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    nombre: "❝",
    titulo: "Cita",
    activo: (e) => e.isActive("blockquote"),
    al: (e) => e.chain().focus().toggleBlockquote().run(),
  },
];

export default function Editor({
  nombre,
  inicial,
}: {
  /** Nombre del campo oculto que se envía con el formulario. */
  nombre: string;
  inicial: string;
}) {
  const [html, setHtml] = useState(inicial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Sin encabezado 1: ese es el título de la noticia, y dos h1 en una
        // página confunden a los buscadores y a los lectores de pantalla.
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
    ],
    content: inicial,
    // Obligatorio con renderizado en servidor: sin esto, el primer pintado del
    // cliente no coincide con el del servidor y React avisa de hidratación.
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[18rem] w-full rounded-b border border-t-0 border-hairline bg-ink px-3 py-3 text-body outline-none focus:border-gold",
      },
    },
  });

  const ponEnlace = () => {
    if (!editor) return;
    const previo = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Dirección del enlace (vacío para quitarlo):", previo ?? "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div>
      {/* El valor real que se envía. El editor es solo la interfaz. */}
      <input type="hidden" name={nombre} value={html} />

      <div className="flex flex-wrap gap-1 rounded-t border border-hairline bg-elevated p-1.5">
        {BOTONES.map((b) => {
          const activo = editor ? (b.activo?.(editor) ?? false) : false;
          return (
            <button
              key={b.nombre}
              type="button"
              title={b.titulo}
              aria-label={b.titulo}
              aria-pressed={activo}
              disabled={!editor}
              onClick={() => editor && b.al(editor)}
              className={`min-w-8 rounded px-2 py-1 text-sm transition disabled:opacity-40 ${
                activo ? "bg-gold text-ink" : "hover:bg-ink hover:text-gold-light"
              }`}
            >
              {b.nombre}
            </button>
          );
        })}

        <button
          type="button"
          title="Enlace"
          aria-label="Enlace"
          aria-pressed={editor?.isActive("link") ?? false}
          disabled={!editor}
          onClick={ponEnlace}
          className={`min-w-8 rounded px-2 py-1 text-sm transition disabled:opacity-40 ${
            editor?.isActive("link") ? "bg-gold text-ink" : "hover:bg-ink hover:text-gold-light"
          }`}
        >
          🔗
        </button>

        <span className="mx-1 w-px self-stretch bg-hairline" aria-hidden />

        <button
          type="button"
          title="Deshacer"
          aria-label="Deshacer"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
          className="min-w-8 rounded px-2 py-1 text-sm transition hover:bg-ink hover:text-gold-light disabled:opacity-40"
        >
          ↶
        </button>
        <button
          type="button"
          title="Rehacer"
          aria-label="Rehacer"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
          className="min-w-8 rounded px-2 py-1 text-sm transition hover:bg-ink hover:text-gold-light disabled:opacity-40"
        >
          ↷
        </button>
      </div>

      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-[18rem] rounded-b border border-t-0 border-hairline bg-ink px-3 py-3 text-body/40">
          Cargando el editor…
        </div>
      )}

      <p className="mt-1 text-xs text-body/45">
        Solo se guardan negrita, cursiva, subtítulos, listas, citas y enlaces. Cualquier otra cosa
        pegada desde Word o una web se limpia al guardar.
      </p>
    </div>
  );
}
