import Image from "next/image";

import type { News } from "@/lib/types";

type NewsImageProps = {
  noticia: News;
  /** Se pasa a next/image para que no descargue más resolución de la que ocupa. */
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Imagen de una noticia — o, mientras no haya una fotografía correcta del
 * protagonista, un hueco con la marca.
 *
 * El hueco es deliberado: una foto de archivo de otro jugador contaría algo
 * falso, y una URL inventada dejaría la tarjeta rota. Para publicar la
 * fotografía basta con subir el archivo a /public/players y apuntar `imagen`
 * en lib/news.json; no hay que tocar ningún componente.
 */
export default function NewsImage({ noticia, sizes, className, priority }: NewsImageProps) {
  if (noticia.imagen) {
    return (
      <Image
        src={noticia.imagen}
        alt={noticia.imagen_alt ?? noticia.titulo}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-elevated to-ink"
    >
      <span className="font-display text-4xl md:text-5xl text-gold/20 select-none">BMS</span>
    </div>
  );
}
