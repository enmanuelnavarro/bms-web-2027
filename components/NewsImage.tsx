import Image from "next/image";

type NewsImageProps = {
  /** URL de la portada, o null si la noticia todavía no tiene. */
  src: string | null;
  alt: string;
  /**
   * Punto que no se recorta (`object-position`), elegido desde el panel. La
   * misma foto se sirve en tres proporciones muy distintas y centrarla siempre
   * corta cabezas.
   */
  focus?: string;
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
 * falso, y una URL inventada dejaría la tarjeta rota.
 */
export default function NewsImage({
  src,
  alt,
  focus,
  sizes,
  className,
  priority,
}: NewsImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectPosition: focus ?? "50% 50%" }}
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
