# Panel de administración

El panel vive en `/admin`, dentro de la misma web. Sirve para que la agencia
cambie contenido sin tocar código ni esperar un despliegue.

Estado: **banners hechos**. Noticias, jugadores, álbumes y contactos van
después, uno por uno.

## Puesta en marcha

Tres cosas en el panel de Vercel y dos comandos. Una sola vez.

### 1. Base de datos

Vercel → tu proyecto → **Storage** → *Create Database* → **Neon** (Postgres).

Vercel llamaba a esto «Vercel Postgres»; desde que lo movió al marketplace, la
base es Neon y se gestiona igual. En producción la variable se inyecta sola.
Para trabajar en local, abre la base → pestaña **.env.local** y copia
`DATABASE_URL` al `.env.local` de este proyecto.

### 2. Almacén de imágenes

Vercel → **Storage** → *Create* → **Blob**. Copia `BLOB_READ_WRITE_TOKEN` al
`.env.local` igual que antes.

### 3. Secreto de sesión

```bash
openssl rand -base64 48
```

Va en `ADMIN_SESSION_SECRET`, en `.env.local` y en las variables de entorno del
proyecto en Vercel. Es lo que firma la cookie del panel: **sin él no entra
nadie**, y si se cambia, todas las sesiones abiertas caducan de golpe.

### 4. Crear las tablas

```bash
npm run db:migrate     # aplica lo que falte
npm run db:estado      # solo dice qué hay, sin tocar nada
```

Se puede ejecutar tantas veces como quieras: cada migración se anota y no se
repite.

### 5. Crear el primer usuario

```bash
npm run admin -- tu@bmsrd.com "Tu Nombre" admin
```

Pide la contraseña por teclado, sin que se vea. Mínimo 10 caracteres.

```bash
npm run admin -- otro@bmsrd.com "Otro Nombre" editor   # da de alta a alguien más
npm run admin -- --listar                              # ver quién hay
npm run admin -- --desactivar alguien@bmsrd.com        # cerrarle la puerta
```

No hay registro público y no lo habrá: los usuarios se crean desde aquí.
Volver a ejecutarlo con un correo que ya existe **le cambia la contraseña**, que
es como se recupera una olvidada.

Roles: `admin` podrá gestionar usuarios, `editor` solo contenido. Hoy hacen lo
mismo; la distinción está puesta para cuando haga falta.

## Banners

`/admin/banners`. Son las láminas del carrusel de portada, que se pasan solas
cada 6 segundos en el orden de la lista.

Cada lámina tiene:

- **Imagen.** Se acepta JPG, PNG, WebP y AVIF hasta 12 MB. **El servidor la
  convierte a WebP** y la limita a 2400 px en el lado mayor. Una foto de móvil
  de 4 MB acaba pesando unos 200 KB y en pantalla se ve igual. Convertir en el
  servidor y no en el navegador es a propósito: da igual desde qué aparato se
  suba, que es lo que hace falta para cargar contenido desde un evento.
- **Descripción.** Lo que lee quien no puede ver la imagen y lo que aparece si
  la imagen no carga. Es obligatoria.
- **Rótulo.** El texto que se superpone. Opcional.
- **Punto focal.** Qué parte no se recorta, escrito como `50% 20%`. El banner
  cambia mucho de proporción entre móvil y escritorio; si la composición tiene
  caras arriba, hay que anclarlas o se cortan.

Y tres controles: **ocultar** (se queda guardada pero no sale), **mover** arriba
y abajo, y **eliminar**, que borra también la imagen del almacén.

Al guardar, la portada se actualiza sola. No hace falta redesplegar.

### Mientras no haya ninguna

La portada usa las láminas de `lib/images.ts`, las de siempre. En cuanto actives
una en el panel, pasa a enseñar las tuyas. Si algún día borras todas, vuelve a
las de siempre en vez de quedarse sin banner.

Eso vale también para las averías: si la base de datos no responde, la portada
sigue en pie con las de `lib/images.ts` y el fallo queda en el registro del
servidor. Una base caída no tumba la página principal.

## Cómo está protegido

- **`proxy.ts`** manda al login cualquier `/admin/*` sin sesión. El panel queda
  **fuera** del modo obras: tiene autenticación propia, que es más fuerte que
  una clave compartida.
- **Toda escritura vuelve a comprobar la sesión** con `exigeAdmin()`. El proxy
  filtra la navegación, pero un server action es un endpoint HTTP y se puede
  llamar sin pasar por ninguna página. Fiarse solo del proxy dejaría el panel
  abierto.
- La **cookie no guarda permisos**: lleva quién eres y hasta cuándo. El rol y si
  la cuenta sigue activa se leen de la base en cada petición, así que
  desactivar a alguien surte efecto de inmediato.
- Las contraseñas se guardan con **scrypt** y su sal, nunca en claro. La
  comprobación es en tiempo constante.
- El login responde **lo mismo** ante un correo que no existe y una contraseña
  incorrecta, y tarda lo mismo en ambos casos, para no revelar qué correos
  están dados de alta.
- `/admin` lleva `noindex` y no entra en el sitemap.
- Cada escritura queda anotada en `audit_log` con quién, qué y cuándo.

### Por qué una sesión propia y no NextAuth

Aquí no hay OAuth, ni registro público, ni recuperación de contraseña: son unos
pocos usuarios creados a mano. NextAuth v5 lleva años en beta y traería mucha
superficie para resolver un problema que cabe en dos ficheros. La parte
delicada —firma HMAC y hash scrypt— usa primitivas de la biblioteca estándar y
está cubierta por pruebas:

```bash
npm run prueba:auth
```

Trece comprobaciones, sin base de datos: que una cookie manipulada se rechaza,
que una caducada no vale, que una firmada con otro secreto no entra, que el
hash no contiene la clave y que dos hashes de la misma contraseña salen
distintos.

## Estructura

```
db/migrations/           el esquema, un fichero por cambio
lib/db.ts                conexión a Postgres, perezosa
lib/admin/sesion.ts      firma y lectura de la cookie  (Edge: solo Web Crypto)
lib/admin/password.ts    hash scrypt                   (Node)
lib/admin/auth.ts        exigeAdmin(), login, audit_log
lib/admin/imagenes.ts    subida a Blob, conversión a WebP
lib/slides.ts            lectura de láminas, con caída a lib/images.ts
app/admin/               el panel
scripts/db-migrate.ts    aplica las migraciones
scripts/crear-admin.ts   da de alta usuarios
scripts/prueba-auth.ts   pruebas de la sesión
```

`lib/admin/sesion.ts` y `lib/admin/password.ts` están separados por un motivo
concreto: el primero lo importa `proxy.ts`, que corre en Edge, donde **no existe
`node:crypto`**. Si se juntaran, el proxy dejaría de compilar.

## Si algo va mal

**«No se pudo conectar con la base de datos» al entrar.** Falta `DATABASE_URL`
o no se han aplicado las migraciones. Prueba `npm run db:estado`.

**«Falta configurar el almacén de imágenes».** Falta `BLOB_READ_WRITE_TOKEN`.

**El login no deja entrar y la contraseña es la buena.** Comprueba que
`ADMIN_SESSION_SECRET` está puesto y tiene 32 caracteres o más. Sin él, el panel
falla cerrando.

**Entro y me echa enseguida.** La sesión dura 8 horas. Si te echa antes,
seguramente `ADMIN_SESSION_SECRET` es distinto en local y en Vercel, o cambió.

**Subo una imagen y no aparece en la portada.** Mira que esté activa: las nuevas
entran activas, pero se pueden haber ocultado. Si sigue sin salir, la caché se
invalida al guardar; recarga sin caché.
