import type { NextConfig } from "next";

// Hosts desde los que next/image puede optimizar.
//
// Antes esto era `hostname: "**"`, es decir, cualquier host de internet. Con la
// web cerrada daba igual; abierta al público no: el optimizador de imágenes es
// un endpoint que descarga la URL que se le pida y la sirve desde nuestro
// dominio. Con el comodín, cualquiera puede pasarle
// /_next/image?url=https://loquesea y usar nuestro ancho de banda de Vercel —y
// nuestra reputación— para servir imágenes ajenas.
//
// Así que va una lista de lo que de verdad se usa. Si algún día falla una
// imagen con "hostname is not configured", se añade aquí su host.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Almacén de imágenes del panel: banners, portadas de noticias, álbumes.
      // El subdominio es el identificador del store, por eso el comodín.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },

      // Fotos de archivo, mientras queden láminas y cabeceras sin material
      // propio (lib/images.ts).
      { protocol: "https", hostname: "images.unsplash.com" },

      // Miniaturas de los vídeos de la ficha de jugador.
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },

      // Feed de Instagram de la portada. Meta sirve las fotos desde subdominios
      // que cambian (scontent-mad1-1.cdninstagram.com y compañía).
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
};

export default nextConfig;
