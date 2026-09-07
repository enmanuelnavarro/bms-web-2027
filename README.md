# BMS — Basket Manager Sport
## Sitio Web de Agencia de Representación de Jugadores de Baloncesto

**Dominio:** bmsrd.com  
**Estado:** 100% Funcional  
**Stack:** Next.js 16 + React + TypeScript + Tailwind CSS v4

---

## 📋 DESCRIPCIÓN DEL PROYECTO

BMS es una agencia de representación de jugadores de baloncesto profesional con presencia global. Este sitio web es una plataforma completa para:

- **Directorio de Jugadores:** Búsqueda y filtrado de 100+ jugadores representados
- **Perfil de Jugadores:** Datos completos, estadísticas, videos, disponibilidad
- **Noticias/Blog:** Feed de noticias sobre jugadores y agencia
- **La Agencia:** Misión, visión, equipo (incluyendo perfil de Fran Brito)
- **Contacto:** Formulario funcional + información de oficinas (RD y Miami)
- **Testimonios:** Reseñas de jugadores representados

---

## 🚀 INSTALACIÓN Y EJECUCIÓN

### Requisitos Previos
- **Node.js** 18+ y **npm** 9+ (instalar desde https://nodejs.org)
- **Git** (para clonar/gestionar el proyecto)

### Pasos de Instalación

```bash
# 1. Navegar a la carpeta del proyecto
cd /Users/Proyecto/Desarrollos/BMS-WEB-2027

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Copiar el archivo .env.local y actualizar con datos reales (opcional para desarrollo)
cp .env.local.example .env.local

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Abrir en el navegador
# Local:   http://localhost:3000
# Network: http://192.168.1.130:3000 (si accedes desde otra máquina)
```

### Comandos Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo (hot reload)
npm run build    # Compilar para producción
npm start        # Ejecutar versión compilada
npm run lint     # Verificar sintaxis y estilos
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
/Users/Proyecto/Desarrollos/BMS-WEB-2027/
├── app/                          # Rutas y páginas (Next.js App Router)
│   ├── page.tsx                  # Home (inicio)
│   ├── layout.tsx                # Layout global + header + footer
│   ├── globals.css               # Estilos globales
│   ├── jugadores/                # Directorio de jugadores
│   │   ├── page.tsx              # Listado con filtros y búsqueda
│   │   └── [id]/page.tsx         # Perfil individual del jugador
│   ├── noticias/                 # Blog de noticias
│   │   ├── page.tsx              # Listado de noticias
│   │   └── [slug]/page.tsx       # Detalle de noticia
│   ├── agencia/                  # Sobre la agencia
│   │   └── page.tsx              # Misión, visión, equipo
│   ├── testimonios/              # Testimonios de jugadores
│   │   └── page.tsx              # Listado de testimonios
│   ├── contacto/                 # Formulario de contacto
│   │   └── page.tsx              # Contacto con formulario funcional
│   └── api/                      # API Routes (backend)
│       └── contact/              # Endpoint para enviar contactos
│           └── route.ts          # Envío de emails con Resend
├── lib/                          # Utilidades y librerías
│   ├── players.json              # Mock data de jugadores
│   └── images.ts                 # URLs de imágenes de Unsplash
├── public/                       # Archivos estáticos
│   ├── logos/                    # Logos de BMS
│   └── stock/                    # Imágenes de stock (reemplazables)
├── .env.local                    # Variables de entorno (no versionar)
├── tailwind.config.ts            # Configuración de Tailwind CSS
├── tsconfig.json                 # Configuración de TypeScript
├── package.json                  # Dependencias y scripts
└── next.config.js                # Configuración de Next.js
```

---

## 🎨 DISEÑO Y REFERENCIAS

### Inspiración
- **FIBA.basketball:** Estructura de dos columnas (contenido + sidebar)
- **Prosports Uruguay:** Organización de agencia de representación
- **NBA.com:** Animaciones y micro-interacciones

### Estética
- **Tema Oscuro:** Fondo `slate-950` / `slate-900`
- **Acentos:** Naranja (`#FF6B35`) y Dorado (`#FFB700`)
- **Tipografía:** Sans-serif profesional con pesos variados
- **Animaciones:** Transiciones suaves, hover effects, scroll animations

### Imágenes
- **Fuente:** Unsplash (fotografía de baloncesto profesional)
- **Ubicación:** URLs directas de Unsplash en `lib/images.ts`
- **Reemplazables:** Fácil de actualizar con imágenes reales de BMS

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

Copiar la plantilla y rellenarla:

```bash
cp .env.example .env.local
```

`.env.local` no se sube a git porque lleva secretos. `.env.example` sí, con los
valores públicos y los secretos en blanco. Contenido:

```env
# Resend API (para envío de emails)
NEXT_PUBLIC_RESEND_API_KEY=tu_api_key_aqui

# Emails de contacto
NEXT_PUBLIC_CONTACT_EMAIL=players@bmsrd.com
NEXT_PUBLIC_INFO_EMAIL=info@bmsrd.com

# Datos de oficinas
NEXT_PUBLIC_OFFICE_RD_ADDRESS="La Vega, Rep. Dom."
NEXT_PUBLIC_OFFICE_RD_PHONE="+1-809-781-5605"
NEXT_PUBLIC_OFFICE_MIAMI_ADDRESS="55 NE 5th St, Miami, FL 33132, USA"
NEXT_PUBLIC_OFFICE_MIAMI_PHONE="+1-305-926-4480"
NEXT_PUBLIC_WHATSAPP_NUMBER="+1-809-781-5605"

# Instagram — feed en directo de la home (ver sección más abajo)
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
NEXT_PUBLIC_IG_WIDGET_SRC=
NEXT_PUBLIC_IG_WIDGET_HTML=

# Redes sociales
NEXT_PUBLIC_FACEBOOK="https://www.facebook.com/BASKETMANAGEMENTSOLUTIONS"
NEXT_PUBLIC_INSTAGRAM="https://www.instagram.com/bmsrdagency"
NEXT_PUBLIC_TWITTER="https://x.com/bmsrdagency"
NEXT_PUBLIC_YOUTUBE="https://www.youtube.com/@bmsagencyrd"
```

### Para Obtener Resend API Key
1. Ir a https://resend.com
2. Crear cuenta / Login
3. Ir a Configuración → API Keys
4. Copiar la clave y pegarla en `.env.local`
5. Verificar el dominio `bmsrd.com` en Resend (registros DNS). Sin eso, el
   remitente `noreply@bmsrd.com` que usa `app/api/contact/route.ts` es rechazado.

---

## 📸 FEED DE INSTAGRAM

La sección **08 · En Directo** de la home muestra las publicaciones de
[@bmsrdagency](https://instagram.com/bmsrdagency), cada post como una tarjeta
independiente que enlaza al original.

El componente elige camino solo, en este orden:

| Orden | Condición | Qué se muestra |
|---|---|---|
| 1 | Hay `INSTAGRAM_ACCESS_TOKEN` | Rejilla propia con los posts reales de la API |
| 2 | Hay `NEXT_PUBLIC_IG_WIDGET_SRC` | Widget del proveedor externo |
| 3 | Ninguna de las dos | Bloque de respaldo que invita a seguir la cuenta |

El respaldo **no inventa publicaciones**: enseña imágenes de archivo declaradas
como tales. Publicar posts falsos con fechas y textos ficticios engañaría a quien
visita la web.

### Camino 1 — API oficial de Meta (recomendado)

Gratis, sin marca de terceros y con el diseño de BMS. La antigua *Basic Display
API* se apagó en diciembre de 2024, así que se usa la **Instagram Graph API**:

1. La cuenta `@bmsrdagency` debe ser **Business** o **Creator**
   (Instagram → Configuración → Tipo de cuenta).
2. Entrar en [developers.facebook.com](https://developers.facebook.com) y crear
   una app del tipo **Business**.
3. Añadir el producto **Instagram** → *API con Instagram Login*.
4. Vincular la cuenta y generar un **token de acceso de larga duración** con el
   permiso `instagram_business_basic`.
5. Pegar el token en `INSTAGRAM_ACCESS_TOKEN` (en local y en Vercel).

⚠️ **El token caduca a los 60 días.** Hay que refrescarlo antes de que expire o
la sección cae al respaldo. Cuando falla, `lib/instagram.ts` deja el motivo en el
log del servidor y la home sigue funcionando con normalidad.

El feed se cachea 1 hora (`INSTAGRAM_REVALIDATE` en `lib/instagram.ts`).

### Camino 2 — Widget de terceros (plan B)

Si el trámite con Meta se atasca, sirve cualquier proveedor
([Behold](https://behold.so), [LightWidget](https://lightwidget.com),
[Elfsight](https://elfsight.com)). Suelen costar entre 5 y 10 USD al mes y el
diseño lo manda el proveedor, no nosotros.

```env
NEXT_PUBLIC_IG_WIDGET_SRC="https://w.behold.so/widget.js"
NEXT_PUBLIC_IG_WIDGET_HTML='<div data-behold-id="TU_ID"></div>'
```

Solo se activa si `INSTAGRAM_ACCESS_TOKEN` está vacío.

---

## 🖼️ BANNER DINÁMICO DEL HERO

`components/HeroCarousel.tsx` rota las láminas definidas en `BANNER_SLIDES`
(`lib/images.ts`): avance automático cada 6 s, flechas, puntos de navegación,
swipe en móvil, pausa al pasar el ratón y respeto por `prefers-reduced-motion`.

**Las imágenes actuales son de archivo (Unsplash) y hay que sustituirlas por
fotos propias de los jugadores.** Para hacerlo: subir los archivos a `/public` y
cambiar `src`, `alt` y `caption` en `BANNER_SLIDES`. Ningún componente referencia
una URL de Unsplash directamente, así que no hay que tocar nada más.

Mientras sean fotos de archivo, los rótulos son genéricos a propósito: no se
nombra a un jugador real sobre una imagen que no es suya.

---

## 📊 PÁGINAS Y FUNCIONALIDADES

### 1. **Home** (`/`)
- ✅ Banner hero con carrusel de imágenes
- ✅ Noticias destacadas (scroll horizontal)
- ✅ Video YouTube embebido
- ✅ Layout dos columnas (contenido + sidebar)
- ✅ Jugador del mes
- ✅ Disponibles ahora
- ✅ Top estadísticas
- ✅ Newsletter signup
- ✅ Stats bar (100+, 25+, 20+, 15+)

### 2. **Directorio de Jugadores** (`/jugadores`)
- ✅ Grid de 10 jugadores (expandible a 100+)
- ✅ Búsqueda en vivo por nombre
- ✅ Filtros: posición, país, disponibilidad
- ✅ Cards con foto, nombre, stats, badge de estado
- ✅ Links funcionales a perfil individual

### 3. **Perfil de Jugador** (`/jugadores/[id]`)
- ✅ Datos personales completos
- ✅ Badge de disponibilidad
- ✅ Equipo actual y liga
- ✅ Historial de equipos
- ✅ Estadísticas por temporada (tabla)
- ✅ Videos YouTube embebidos (galería con play)
- ✅ Bio del jugador

### 4. **Noticias** (`/noticias`)
- ✅ Feed cronológico de noticias
- ✅ Búsqueda por título
- ✅ Filtro por categoría
- ✅ Cards con imagen, categoría, fecha

### 5. **Detalle de Noticia** (`/noticias/[slug]`)
- ✅ Artículo completo
- ✅ Imagen de portada
- ✅ Autor y fecha
- ✅ CTA a directorio de jugadores

### 6. **La Agencia** (`/agencia`)
- ✅ Misión, visión, valores
- ✅ Historia de la empresa
- ✅ Equipo y miembros
- ✅ Estadísticas (100+, 25+, 20+, 15+)
- ✅ Información de ambas oficinas (RD y Miami)

### 7. **Testimonios** (`/testimonios`)
- ✅ 6 testimonios de jugadores
- ✅ Cards con avatar, nombre, posición, equipo
- ✅ Citas destacadas
- ✅ Estrellas de valoración

### 8. **Contacto** (`/contacto`)
- ✅ Formulario funcional con validación
- ✅ Envío real de emails (Resend)
- ✅ Información de ambas oficinas
- ✅ Links funcionales (tel:, mailto:, WhatsApp)
- ✅ Confirmación de envío exitoso

---

## 🎮 FUNCIONALIDADES CLAVE

### Búsqueda y Filtros
- Búsqueda en vivo por nombre de jugador
- Filtros por posición (Base, Escolta, Alero, Ala-Pívot, Pívot)
- Filtros por país
- Filtros por disponibilidad (Disponible, Bajo Contrato, En Negociación)
- Combinación de múltiples filtros

### Videos YouTube
- Embebidos en iframe (reproducción directa)
- Galerías de miniaturas clickeables
- Play button overlay
- Responsive (16:9 aspect ratio)

### Formulario de Contacto
- Validación de campos
- Envío real a players@bmsrd.com
- Confirmación visual al usuario
- Selector de oficina de interés (RD / Miami)
- Manejo de errores

### Imágenes Responsive
- Next.js Image component (optimización automática)
- Lazy loading
- Responsive srcset
- Fallback images

---

## 📱 RESPONSIVE DESIGN

- **Mobile (< 768px):** 1 columna, navegación simplificada
- **Tablet (768px - 1024px):** 2 columnas parciales
- **Desktop (> 1024px):** Layout completo de dos columnas

---

## 🔒 SEGURIDAD

- Variables de entorno para datos sensibles (API keys, emails)
- No versionar `.env.local`
- Validación de formularios en cliente y servidor
- HTTPS recomendado para producción
- CORS configurado para Vercel

---

## 📚 DATOS MOCK

### Jugadores
10 jugadores de baloncesto profesional dominicano con datos completos:
- Nombre, posición, nacionalidad, altura, peso
- Equipo actual, liga
- Disponibilidad (Disponible/Bajo Contrato/En Negociación)
- Estadísticas por temporada
- Videos de YouTube
- Bio

Ubicación: `lib/players.json`

### Noticias
4 noticias iniciales con:
- Título, fecha, categoría
- Imagen
- Resumen y contenido
- Autor

Ubicación: En componentes de página

### Imágenes
URLs de Unsplash de fotografía de baloncesto profesional

Ubicación: `lib/images.ts`

---

## 🚢 DEPLOYMENT A PRODUCCIÓN

### En Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar dominio en Vercel Dashboard
# Agregar CNAME: bmsrd.com → vercel.com
```

### Variables de Entorno en Vercel
1. Ir a Project Settings → Environment Variables
2. Agregar todas las variables de `.env.local`
3. Redeploy el proyecto

---

## ❌ INFORMACIÓN QUE FALTA COMPLETAR

Cuando BMS entregue la información real, actualizar:

- [ ] Direcciones físicas exactas de oficinas (RD y Miami)
- [ ] Teléfonos de contacto oficiales
- [ ] Redes sociales oficiales (Instagram, Twitter, YouTube, LinkedIn)
- [ ] Fotos reales de jugadores (reemplazar placeholders)
- [ ] Estadísticas reales de jugadores
- [ ] Videos de YouTube reales (cambiar IDs de videos)
- [ ] Foto, bio, cita y logros de Fran Brito

---

## 🧪 TESTING

### Pruebas Manuales Completadas
- ✅ Navegación funcional en todas las páginas
- ✅ Búsqueda y filtros en directorio
- ✅ Videos YouTube embebidos reproduciendo
- ✅ Formulario de contacto validando
- ✅ Links funcionales (tel:, mailto:, WhatsApp)
- ✅ Responsive en mobile y desktop
- ✅ Dark mode aplicado en todas las secciones
- ✅ Imágenes cargando desde Unsplash

### Recomendaciones
- Probar con diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Validar en dispositivos reales (mobile, tablet, desktop)
- Verificar velocidad de carga (Google PageSpeed)
- Revisar SEO con herramientas como Lighthouse

---

## 📧 CONTACTO Y SOPORTE

**Email de Contacto:** players@bmsrd.com  
**Email General:** info@bmsrd.com  
**Sitio:** bmsrd.com

---

## 📄 LICENCIA

Propiedad de BMS — Basket Manager Sport

---

## 🎯 SIGUIENTES PASOS

1. **Completar información real** de la empresa (direcciones, teléfonos, redes)
2. **Obtener Resend API Key** para envío real de emails
3. **Reemplazar fotos mock** con fotos reales de jugadores
4. **Agregar más jugadores** (actualmente 10, objetivo 100+)
5. **Configurar dominio bmsrd.com** en Vercel
6. **Deploy a producción** mediante Vercel
7. **Testing final** en ambiente real
8. **Monitoreo** con Google Analytics (opcional)

---

**Última actualización:** 2 de Julio, 2026  
**Versión:** 1.0.0 - Producción lista
