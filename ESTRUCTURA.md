# BMS Sports Agency — estructura del proyecto

> Documento de contexto para una auditoría. Describe **el estado real** del
> proyecto a 24 de septiembre de 2026, no el estado deseado. Las cifras de
> relleno de datos están medidas sobre `lib/players.json`, no estimadas.
>
> **Encargo para quien audite:** decir qué falta para que esto sea una web
> profesional publicable, priorizado por impacto. Incluye lo que no está en
> este documento si lo detectas al mirar el código.

---

## 1. Qué es

Web corporativa de **BMS · Basket Manager Sport**, agencia de representación de
jugadores de baloncesto profesional con licencia FIBA (#2014501744), fundada en
2009, con oficinas en Miami y La Vega (República Dominicana).

El público principal son **clubes que buscan fichar**; el secundario, jugadores
que buscan agencia. Idioma único: castellano.

Dominio de producción: `www.bmsrd.com` (alias de Vercel).
Repositorio: `github.com/enmanuelnavarro/bms-web-2027`.
Proyecto Vercel: `bms-web-2027-2`.

**La web está cerrada al público ahora mismo**, detrás de una contraseña (ver §7).

---

## 2. Stack

| Pieza | Versión / elección |
|---|---|
| Framework | Next.js 16.2 · App Router · Turbopack |
| React | 19.2 |
| Lenguaje | TypeScript 6 (`strict`) |
| Estilos | Tailwind CSS v4 (config en CSS, no en JS) |
| Gráficas | Recharts 3.9 |
| Email | Resend 6.16 |
| Hosting | Vercel (región iad1, Node 24) |

Notas relevantes:

- **Tailwind v4**: el tema vive en `@theme` dentro de `app/globals.css`.
  `tailwind.config.ts` sigue en el repo pero **ya no define colores** — es un
  resto. Todo CSS propio debe ir dentro de `@layer`: una regla sin capa gana a
  las utilidades de Tailwind y rompe el espaciado de toda la web.
- **El middleware se llama `proxy.ts`**, no `middleware.ts` (renombrado en
  Next 16).
- `npm run lint` **está roto**: ejecuta `next lint`, que Next 16 eliminó. Hay un
  `.eslintrc.json` pero ningún script que funcione.

---

## 3. Rutas

71 rutas generadas en build.

| Ruta | Render | Fichero | Notas |
|---|---|---|---|
| `/` | estática | `app/page.tsx` | portada |
| `/jugadores` | estática | `app/jugadores/page.tsx` + `PlayersDirectory.tsx` | filtros en cliente |
| `/jugadores/[id]` | SSG × 53 | `app/jugadores/[id]/` | ficha con pestañas |
| `/agencia` | estática | `app/agencia/page.tsx` | |
| `/agencia/frank-brito` | estática | `app/agencia/frank-brito/page.tsx` | perfil del Gerente General |
| `/noticias` | estática | `app/noticias/page.tsx` + `NewsDirectory.tsx` | filtros en cliente |
| `/noticias/[slug]` | SSG × 6 | `app/noticias/[slug]/page.tsx` | |
| `/contacto` | dinámica | `app/contacto/page.tsx` + `ContactContent.tsx` | formulario |
| `/en-construccion` | dinámica | `app/en-construccion/page.tsx` | puerta de la web cerrada |
| `/api/contact` | POST | Resend → 2 correos (aviso interno + confirmación) |
| `/api/acceso` | POST | valida la contraseña del modo obras |
| `/api/players/[id]/stats` | GET | scraping en vivo de LatinBasket, revalida 6 h |

**No existen** `sitemap.xml`, `robots.txt`, páginas legales, ni `/blog`, ni
versión en inglés.

`/testimonios` **se eliminó** (era contenido inventado). Devuelve 404.

---

## 4. Componentes

```
components/
  SiteHeader.tsx      cliente · cabecera + menú móvil (estado, Escape, scroll lock)
  HeroCarousel.tsx    cliente · carrusel del banner de portada
  ServiceTabs.tsx     cliente · pestañas Clubes / Jugadores
  CountUp.tsx         cliente · cifra animada al entrar en viewport
  PageHero.tsx        servidor · cabecera editorial de páginas internas
  NewsImage.tsx       servidor · imagen de noticia o hueco con la marca
  InstagramSection.tsx  servidor · orquesta el feed (API → widget → respaldo)
  InstagramGrid.tsx   rejilla de posts desde la Graph API
  InstagramWidget.tsx incrusta un widget de terceros como plan B
```

Todas las páginas internas comparten `PageHero`. Las tarjetas de jugador se
repiten en portada y en el directorio **con marcado duplicado**, no extraído a
un componente.

---

## 5. Datos

Todo el contenido vive en ficheros del repo. **No hay base de datos ni CMS.**

### `lib/site.ts`
Fuente única de los datos corporativos: nombre, licencia FIBA, teléfonos,
correos, direcciones de las dos oficinas, redes sociales, misión, y los 6
servicios reales. `yearsOfExperience` se calcula desde `founded` en cada build.

### `lib/players.json` — 53 jugadores
Generado por `scripts/import-players.mjs` desde un Excel de la agencia. Se
accede por `lib/players.ts` (helpers de formato, filtros, destacados).

**Relleno real de los campos — este es el problema principal del proyecto:**

| Campo | Con dato | % |
|---|---|---|
| nacionalidad, estado, source | 53 | 100 % |
| posición | 51 | 96 % |
| altura | 50 | 94 % |
| fecha de nacimiento | 47 | 88 % |
| equipo actual | 33 | 62 % |
| país | 32 | 60 % |
| peso | 30 | 56 % |
| fotografía | 48 | 91 % |
| **biografía** | **6** | **11 %** |
| **estadísticas** | **6** | **11 %** |
| **historial de equipos** | **6** | **11 %** |
| lugar de nacimiento | 2 | 3 % |
| vídeos | 1 | 1 % |
| redes sociales | 1 | 1 % |
| selección | 1 | 1 % |
| **liga actual** | **0** | **0 %** |

Fotografías propias en `/public/players`: **48**, una por jugador, con el
nombre del fichero igual al `id` de la ficha (`luis-feliz.jpg`) — que es como
las busca `scripts/import-players.mjs`, así que una reimportación las conserva.
Siguen sin foto 5: Víctor Liz, Ernesto Hernández, Rich Polanco, Jean Karlo
Iciano y Yuri Covington; su `foto` es `null` y la web pinta el marcador de la
casa.

Las de `/public/players` no son las que mandó la agencia, sino su versión ya
encuadrada: **900x1125 (4:5) todas**, que es lo que hace que la rejilla se vea
pareja. Los originales —recortes de prensa apaisados, capturas de Instagram,
fotos de cancha entera— viven en `assets/fotos-originales/`, fuera de
`/public`, y `scripts/normaliza-fotos.mjs` los convierte: quita las bandas
negras, encuadra a 4:5 buscando la cara y guarda en WebP los recortes con
fondo transparente (29) y en JPEG los que tienen fondo (19). De 19 MB a 5,5.
Cuando llegue una foto nueva: se deja el original ahí con el nombre del `id` y
se relanza el script.

Los 53 tienen `estado: "Activo"` — el filtro de estado del directorio ofrece,
por tanto, una sola opción. 21 no tienen país, así que el filtro de país los
deja fuera.

### `lib/news.json` — 6 noticias
Redacción propia a partir de fuentes verificables. Cada una guarda `fuente`
(medio + URL), que la ficha enlaza al pie. Acceso por `lib/news.ts`.

5 de las 6 **no tienen fotografía**: `imagen: null` hace que se pinte un hueco
con el monograma BMS, deliberadamente, en vez de una foto de archivo de otro
jugador.

### `lib/mockData.ts` — perfil de Frank Brito
**Contiene datos sin verificar** que se publican en `/agencia/frank-brito`:
«más de 20 años de experiencia», «150+ jugadores representados», «12+ jugadores
en NBA», «8 países» y perfiles de LinkedIn/Instagram/Twitter inventados
(`linkedin.com/in/frankbrito`, etc.). La fotografía ya es la suya de verdad
(`/equipo/frank-brito.jpg`). El propio fichero avisa de que el email y el teléfono son placeholders.

> Contraste con la fuente real (Diario Libre, diciembre de 2014): tenía 24 años
> y había empezado a los 17 → hoy serían ~19 años de carrera, no «más de 20».

### `lib/images.ts`
Todas las imágenes decorativas son de **Unsplash**: héroes, fondos de sección,
5 de las 6 láminas del carrusel. Solo `banner/slide-1.jpg` es material propio.

### `lib/latinbasket.ts`
Parser del HTML de latinbasket.com para leer estadísticas en vivo. Frágil por
naturaleza: si el sitio cambia el marcado, deja de funcionar. Solo LatinBasket;
las fichas de Eurobasket se enlazan pero no se leen.

---

## 6. Estilos

`app/globals.css`, 621 líneas, es el único fichero de estilos.

**Tokens** (`@theme`):
`--color-ink #0a0a0a` · `--color-elevated #141414` · `--color-gold #c9a227` ·
`--color-gold-light #e3c567` · `--color-gold-dark #9c7a1e` ·
`--color-body #d9d4c7` · `--color-hairline rgba(201,162,39,.15)`

**Tipografía:** Anton (display, titulares) + Inter (texto), vía `next/font`.

**Utilidades propias:** `.container-pro`, `.section-pad`, `.headline-xl/lg`,
`.eyebrow`, `.btn-gold`, `.btn-outline-gold`, `.card-dark`, `.link-arrow`,
`.ghost-num`, `.marquee`, `.hero-carousel__*`, `.player-tab`, `.stat-table`,
`.ig-card`.

Tema oscuro fijo (`color-scheme: dark`), sin modo claro. Hay foco visible para
teclado. Las animaciones respetan `prefers-reduced-motion` en `CountUp`; **no
está comprobado que el resto lo haga**.

---

## 7. Configuración y entorno

### Modo obras
`proxy.ts` cierra la web entera si existe `SITE_PASSWORD`: todo redirige a
`/en-construccion` salvo que la cookie `bms_acceso` lleve el hash correcto
(SHA-256, comparación en tiempo constante, cookie httpOnly de 30 días).

Quedan fuera del cierre `/logos/`, `/icon.png`, `/favicon.ico`, `/players/`,
`/equipo/` y `/banner/`: el optimizador de imágenes de Next pide esos ficheros
al propio servidor con una petición interna que no lleva la cookie, y si el
proxy la redirigía a las obras no se veía **ninguna** foto, tampoco con la
clave puesta.

**Estado actual: `SITE_PASSWORD` NO está configurada en Vercel**, así que en
producción la web está abierta al público aunque la intención era tenerla
cerrada. En local sí está y sí cierra.

### Variables de entorno
`RESEND_API_KEY` · `INSTAGRAM_ACCESS_TOKEN` · `INSTAGRAM_USER_ID` ·
`NEXT_PUBLIC_IG_WIDGET_SRC` · `NEXT_PUBLIC_IG_WIDGET_HTML` ·
`NEXT_PUBLIC_CONTACT_EMAIL` · `NEXT_PUBLIC_INFO_EMAIL` ·
`NEXT_PUBLIC_OFFICE_*` · `NEXT_PUBLIC_WHATSAPP_NUMBER` ·
`NEXT_PUBLIC_{FACEBOOK,INSTAGRAM,TWITTER,YOUTUBE}` · `SITE_PASSWORD`

El token de Instagram **caduca a los 60 días** y hay que refrescarlo a mano; no
existe ningún proceso que lo haga.

### `next.config.ts`
```ts
images: { remotePatterns: [{ protocol: "https", hostname: "**" }] }
```
Permite optimizar imágenes de **cualquier host de internet**.

---

## 8. Lo que ya sé que falta

Lista de partida, no exhaustiva. Se agradece que la auditoría la amplíe y la
priorice.

### Contenido — el bloque más grande
1. ~~47 de 53 jugadores sin fotografía~~ → resuelto: 48 con foto propia,
   quedan 5 sin ella.
2. **47 sin biografía, sin estadísticas y sin historial.**
3. **Ninguno tiene liga actual**; 21 no tienen ni país.
4. Casi todas las imágenes de la web son de archivo (Unsplash), no de BMS.
5. El perfil de Frank Brito publica cifras sin verificar (§5); la foto ya es
   la suya.
6. 5 de 6 noticias sin fotografía.

### Legal y confianza
7. «Privacidad» y «Términos» en el pie son `href="#"` — enlaces muertos.
8. Sin política de privacidad ni aviso de cookies, con un formulario que recoge
   nombre, email y teléfono (RGPD si hay tráfico europeo, y lo habrá: hay
   jugadores en ligas españolas).
9. Sin página de aviso legal ni identificación fiscal de la empresa.

### SEO y difusión
10. Sin `sitemap.xml` ni `robots.txt`.
11. Sin datos estructurados JSON-LD (`SportsOrganization`, `Person` para cada
    jugador, `NewsArticle` para cada noticia). En este sector es donde más se
    gana.
12. Sin imágenes Open Graph propias: al compartir un enlace no se ve nada.
13. Sin versión en inglés, siendo una agencia que vende a clubes de todo el
    mundo y con sede en Miami.

### Técnico
14. Sin analítica de ningún tipo.
15. Sin tests y sin CI (no hay `.github/`).
16. `npm run lint` no funciona.
17. `next.config.ts` permite imágenes remotas de cualquier dominio.
18. Sin estados de página de Next: no hay `error.tsx`, `global-error.tsx`,
    `app/not-found.tsx` (404 global) ni ningún `loading.tsx`. El único
    `not-found` es el de `/jugadores/[id]`.
19. `/jugadores/[id]` depende de scraping de LatinBasket, que puede romperse en
    cualquier momento sin aviso.
20. Sin control de tamaño de imagen: `jassel-perez.png` y compañía se sirven sin
    un formato moderno garantizado.
21. Marcado de tarjeta de jugador duplicado entre portada y directorio.

### Documentación
22. Hay **8 ficheros `.md` en la raíz** (`DESIGN_AUDIT_FINAL.md`,
    `DARK_MODE_UPGRADE.md`, `MOCK_DATA_REFERENCE.md`, `VERIFICATION.md`,
    `DESIGN_IMPROVEMENTS.md`, `FRAN_BRITO_PROFILE_GUIDE.md`, `DEPLOYMENT.md`,
    `README.md`) de principios de septiembre, **anteriores a los últimos
    cambios**. Describen secciones que ya no existen (testimonios, contadores) y
    contradicen el estado actual. No hay `CLAUDE.md`.

### Operación
23. `SITE_PASSWORD` sin configurar en Vercel: la web está abierta sin querer.
24. El token de Instagram caduca cada 60 días sin proceso de renovación.
25. El correo sale de `noreply@bmsrd.com` — conviene verificar que SPF/DKIM
    estén bien puestos o irá a spam.

---

## 9. Qué NO hay que tocar

- **Los 53 jugadores de `lib/players.json`**: son datos reales de la agencia,
  importados de su Excel. Se pueden completar, nunca borrar ni inventar.
- La identidad visual: paleta oscura + dorado, Anton + Inter, estética
  editorial minimalista.
- Los datos de `lib/site.ts`: están verificados contra el sitio del cliente.
- Nada de inventar estadísticas, equipos, contratos ni logros.
