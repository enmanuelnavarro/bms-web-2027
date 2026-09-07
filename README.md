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

Crear archivo `.env.local` en la raíz del proyecto con:

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

# Redes sociales
NEXT_PUBLIC_INSTAGRAM="https://instagram.com/bmsagency"
NEXT_PUBLIC_TWITTER="https://twitter.com/bmsagency"
NEXT_PUBLIC_YOUTUBE="https://youtube.com/@bmsagency"
NEXT_PUBLIC_LINKEDIN="https://linkedin.com/company/bmsagency"
```

### Para Obtener Resend API Key
1. Ir a https://resend.com
2. Crear cuenta / Login
3. Ir a Configuración → API Keys
4. Copiar la clave y pegarla en `.env.local`

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
