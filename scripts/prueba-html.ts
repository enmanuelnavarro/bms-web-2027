#!/usr/bin/env node
//
// Comprueba que el saneador de HTML del editor visual bloquea lo que tiene que
// bloquear y deja pasar lo que produce el editor.
//
//   npm run prueba:html
//
// Hace falta --conditions react-server porque lib/admin/html.ts importa
// "server-only", que fuera de un componente de servidor lanza a propósito.

export {};
const { saneaHtml, aTextoPlano, estaVacio } = await import("../lib/admin/html.ts");

let fallos = 0;
const c = (n: string, ok: boolean) => { console.log(`  ${ok?"✓":"✗"} ${n}`); if(!ok) fallos++; };

c("un <script> se elimina entero",
  !saneaHtml('<p>hola</p><script>alert(1)</script>').includes("alert"));
c("onerror/onclick se eliminan",
  !saneaHtml('<p onclick="robar()">x</p>').includes("onclick"));
c("javascript: en href se quita",
  !saneaHtml('<a href="javascript:alert(1)">x</a>').includes("javascript"));
c("data: en href se quita",
  !saneaHtml('<a href="data:text/html,<script>x</script>">x</a>').includes("data:"));
c("un <iframe> se elimina",
  !saneaHtml('<iframe src="http://malo"></iframe>').includes("iframe"));
c("<img> no se permite (las fotos van por el álbum)",
  !saneaHtml('<img src=x onerror=alert(1)>').includes("<img"));
c("negrita y cursiva sobreviven",
  saneaHtml('<p><strong>a</strong> y <em>b</em></p>') === '<p><strong>a</strong> y <em>b</em></p>');
c("los subtítulos sobreviven", saneaHtml('<h2>Hola</h2>') === '<h2>Hola</h2>');
c("las listas sobreviven", saneaHtml('<ul><li>a</li></ul>') === '<ul><li>a</li></ul>');
const enlace = saneaHtml('<a href="https://ejemplo.com">x</a>');
c("un enlace normal sobrevive", enlace.includes('href="https://ejemplo.com"'));
c("el enlace sale en pestaña nueva y protegido",
  enlace.includes('target="_blank"') && enlace.includes("noopener"));
c("texto plano quita las etiquetas",
  aTextoPlano('<p>Hola <strong>mundo</strong></p>') === "Hola mundo");
c("el editor vacío se detecta", estaVacio("<p></p>"));
c("con texto no está vacío", !estaVacio("<p>algo</p>"));

console.log(fallos===0 ? "\nTodo en verde." : `\n${fallos} fallo(s).`);
process.exit(fallos===0?0:1);
