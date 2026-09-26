"use client";

// Cómo va a quedar la lámina en la portada, sin salir del panel.
//
// Reproduce lo que hace la portada de verdad: la misma imagen recortada, el
// mismo velo oscuro, el mismo rótulo abajo y el titular encima en escritorio.
// No es la portada real —eso exigiría montar media página aquí—, pero sí lo
// que de verdad cambia al subir una lámina: qué se recorta y si el texto se
// lee sobre la foto.
//
// Las dos proporciones son las dos que existen: en móvil el banner va como
// banda apaisada sobre el titular, y a partir de lg pasa a fondo a sangre con
// el texto encima.

export default function VistaPrevia({
  src,
  alt,
  caption,
  focus,
}: {
  src: string | null;
  alt: string;
  caption: string;
  focus: string;
}) {
  if (!src) {
    return (
      <div className="flex aspect-[21/9] items-center justify-center rounded border border-dashed border-hairline text-sm text-body/40">
        Elige una imagen y aquí verás cómo queda
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --------------------------------------------------- escritorio */}
      <figure>
        <figcaption className="mb-1.5 text-xs text-body/55">
          Escritorio — el titular va encima de la foto
        </figcaption>
        <div className="relative aspect-[21/9] overflow-hidden rounded border border-hairline bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- puede ser un blob: local */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: focus }}
            draggable={false}
          />

          {/* El velo de la portada: más fuerte por la izquierda, que es donde
              cae el texto, y por abajo. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center p-[4%]">
            <p className="mb-[1.5%] text-[0.45rem] font-bold uppercase tracking-[0.2em] text-gold-dark sm:text-[0.6rem]">
              Agencia FIBA · Representación de Jugadores
            </p>
            <p className="text-[1.1rem] font-black leading-[1.05] text-gold sm:text-[1.8rem] lg:text-[2.4rem]">
              Tu próximo fichaje
              <br />
              <span className="text-gold-light">está aquí</span>
            </p>
          </div>

          {caption && (
            <p className="absolute bottom-[3%] right-[3%] max-w-[45%] rounded bg-ink/75 px-2 py-1 text-right text-[0.55rem] text-body/90 sm:text-xs">
              {caption}
            </p>
          )}
        </div>
      </figure>

      {/* --------------------------------------------------------- móvil */}
      <figure className="max-w-[16rem]">
        <figcaption className="mb-1.5 text-xs text-body/55">
          Móvil — banda sobre el titular
        </figcaption>
        <div className="relative aspect-[4/3] overflow-hidden rounded border border-hairline bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- ídem */}
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: focus }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />

          {caption && (
            <p className="absolute bottom-2 left-2 right-2 rounded bg-ink/75 px-1.5 py-1 text-[0.6rem] text-body/90">
              {caption}
            </p>
          )}
        </div>
      </figure>

      {!alt.trim() && (
        <p className="text-xs text-amber-300/80">
          Falta la descripción de la imagen. Es lo que lee quien no puede verla.
        </p>
      )}
    </div>
  );
}
