# 🚀 GUÍA DE DEPLOYMENT — BMS Basket Manager Sport

## PASOS PARA DEPLOY EN VERCEL

### Paso 1: Preparar el Repositorio

```bash
# Si no está en Git, inicializar
cd /Users/Proyecto/Desarrollos/BMS-WEB-2027
git init
git add .
git commit -m "Initial commit: BMS website v1.0.0"

# Crear repositorio en GitHub
# Ir a github.com/new
# Crear repositorio "bms-web" (o el nombre que prefieras)

# Conectar con GitHub
git remote add origin https://github.com/YOUR_USERNAME/bms-web.git
git branch -M main
git push -u origin main
```

### Paso 2: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 3: Configurar Variables de Entorno en Vercel

```bash
# Login en Vercel (abre navegador para autenticación)
vercel login

# Crear nuevo proyecto en Vercel
vercel
# Seguir las instrucciones en pantalla
```

### Paso 4: Agregar Variables de Entorno

En Vercel Dashboard:
1. Ir a Project → Settings → Environment Variables
2. Agregar:

```
NEXT_PUBLIC_RESEND_API_KEY = tu_api_key_aqui
NEXT_PUBLIC_CONTACT_EMAIL = contact@bmsagency.net
NEXT_PUBLIC_INFO_EMAIL = info@bmsagency.net
NEXT_PUBLIC_OFFICE_RD_ADDRESS = [dirección real]
NEXT_PUBLIC_OFFICE_RD_PHONE = [teléfono real]
NEXT_PUBLIC_OFFICE_MIAMI_ADDRESS = [dirección real]
NEXT_PUBLIC_OFFICE_MIAMI_PHONE = [teléfono real]
NEXT_PUBLIC_WHATSAPP_NUMBER = [número real]
NEXT_PUBLIC_INSTAGRAM = https://instagram.com/bmsagency
NEXT_PUBLIC_TWITTER = https://twitter.com/bmsagency
NEXT_PUBLIC_YOUTUBE = https://youtube.com/@bmsagency
NEXT_PUBLIC_LINKEDIN = https://linkedin.com/company/bmsagency
```

### Paso 5: Configurar Dominio

En Vercel Dashboard → Settings → Domains:
1. Agregar dominio: `bmsagency.net`
2. Vercel proporciona CNAME records
3. Ir a tu registrador de dominios
4. Configurar CNAME records según instrucciones de Vercel

### Paso 6: Deploy

```bash
# Deploy a producción
vercel --prod

# O si ya lo configuraste, simplemente
git push origin main
# Vercel deploará automáticamente
```

---

## OBTENER RESEND API KEY

1. Ir a https://resend.com
2. Sign Up o Login
3. Ir a API Keys (en configuración)
4. Crear nueva API Key
5. Copiar la clave
6. Agregar a Vercel como se indicó arriba

---

## INFORMACIÓN A ACTUALIZAR ANTES DE PRODUCCIÓN

Reemplazar estos valores en `.env.local` y Vercel:

```env
# Dirección exacta de oficina RD
NEXT_PUBLIC_OFFICE_RD_ADDRESS = "Tu Calle 123, Santo Domingo, DO"

# Dirección exacta de Miami
NEXT_PUBLIC_OFFICE_MIAMI_ADDRESS = "Tu Calle 456, Miami, FL 33128"

# Teléfonos reales
NEXT_PUBLIC_OFFICE_RD_PHONE = "+1-809-123-4567"
NEXT_PUBLIC_OFFICE_MIAMI_PHONE = "+1-305-987-6543"

# Número de WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER = "+1-809-123-4567"

# Redes sociales reales
NEXT_PUBLIC_INSTAGRAM = "https://instagram.com/bmsagency"
NEXT_PUBLIC_TWITTER = "https://twitter.com/bmsagency"
NEXT_PUBLIC_YOUTUBE = "https://youtube.com/@bmsagency"
NEXT_PUBLIC_LINKEDIN = "https://linkedin.com/company/bmsagency"
```

---

## VERIFICAR DEPLOYMENT

1. Ir a https://bmsagency.net
2. Probar todas las páginas
3. Probar búsqueda y filtros
4. Enviar email de prueba desde contacto
5. Verificar que llega a contact@bmsagency.net

---

## TROUBLESHOOTING

### El sitio no se ve correctamente
- Verificar que todas las variables de entorno están configuradas
- Limpiar caché del navegador (Ctrl+Shift+Del)
- Esperar 1-2 minutos después de deploy

### Email no se envía
- Verificar Resend API Key en Vercel
- Revisar spam/junk
- Chequear logs en Vercel Dashboard

### Imágenes no cargan
- Verificar que tengas conexión a internet
- Unsplash URLs deben estar accesibles
- Verificar CORS en next.config.js

---

## MONITOREO EN PRODUCCIÓN

### Google Analytics (Opcional)
```bash
# Agregar a .env.local
NEXT_PUBLIC_GA_ID = "G-XXXXXXXXXX"
```

### Vercel Analytics
Automático en Vercel dashboard

### Email Monitoring
Revisar que los emails lleguen a contact@bmsagency.net

---

**¡Sitio listo para producción!**
