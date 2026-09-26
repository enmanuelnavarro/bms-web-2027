import "server-only";

import sanitizeHtml from "sanitize-html";

// Saneado del HTML que produce el editor visual.
//
// Regla, sin excepciones: **lo que llega del navegador se sanea en el servidor
// antes de guardarlo**. Que venga de un administrador autenticado no lo hace
// de fiar: un server action es un endpoint HTTP y se puede llamar con el
// cuerpo que a uno le apetezca. Si no se saneara, cualquiera con una sesión
// —o que se la robe— podría guardar un <script> que se ejecutaría en el
// navegador de todos los visitantes de la noticia.
//
// Se sanea al escribir y no al mostrar, a propósito: lo que hay en la base es
// entonces seguro por construcción, y la página pública no tiene que acordarse
// de nada.

/**
 * Etiquetas permitidas: lo que el editor sabe producir y nada más. Sin
 * `<script>`, `<style>`, `<iframe>`, `<form>` ni `<object>`.
 */
const ETIQUETAS = [
  "p", "br", "strong", "em", "u", "s",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote",
  "a",
  "hr",
  "code", "pre",
];

export function saneaHtml(sucio: string): string {
  return sanitizeHtml(sucio, {
    allowedTags: ETIQUETAS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    // Ni javascript: ni data:, que son las dos formas clásicas de colar código
    // en un href.
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    // Todo enlace sale a una pestaña nueva y sin pasar el referrer ni permitir
    // que la página de destino manipule la nuestra.
    transformTags: {
      a: (nombre, atributos) => ({
        tagName: "a",
        attribs: { ...atributos, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    },
    // Una etiqueta no permitida se tira con su contenido si es de las que solo
    // traen ruido; el resto conserva el texto para no perder lo escrito.
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe"],
  });
}

/**
 * Texto plano del HTML, para el resumen automático y para contar palabras.
 * Quita las etiquetas y deja los espacios en su sitio.
 */
export function aTextoPlano(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** ¿Tiene algo escrito? El editor deja "<p></p>" cuando está vacío. */
export function estaVacio(html: string): boolean {
  return aTextoPlano(html).length === 0;
}
