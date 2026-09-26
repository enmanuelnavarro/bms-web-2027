"use client";

import { useRef, useState } from "react";

// Ajustador de encuadre: se pincha sobre la imagen y ahí queda el punto que no
// se recorta nunca (`object-position`).
//
// Existe porque la misma foto se sirve en proporciones muy distintas —una
// cabecera apaisada, una miniatura 16:9, un hero vertical en móvil— y centrar
// siempre corta cabezas. Escribir "50% 20%" a mano funciona, pero nadie sabe
// qué número poner sin verlo; aquí se ve.
//
// Lo usan banners y noticias. El valor viaja en un campo oculto del
// formulario, con el mismo formato que ya guardaba la base.

export type Recorte = {
  etiqueta: string;
  /** Proporción del recorte, ancho/alto. */
  ratio: number;
};

export default function SelectorDeFoco({
  nombre,
  valor,
  onCambio,
  src,
  alt,
  recortes,
}: {
  nombre: string;
  /** Controlado desde el formulario, que es quien lo necesita para la vista previa. */
  valor: string;
  onCambio: (v: string) => void;
  /** Null mientras no haya imagen: entonces no hay nada que encuadrar. */
  src: string | null;
  alt: string;
  /** Las proporciones en las que se va a ver, para enseñar el recorte real. */
  recortes: Recorte[];
}) {
  const foco = normaliza(valor);
  const setFoco = onCambio;
  const [arrastrando, setArrastrando] = useState(false);
  const lienzo = useRef<HTMLDivElement>(null);

  const mueve = (clientX: number, clientY: number) => {
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;

    const x = Math.round(limita(((clientX - caja.left) / caja.width) * 100));
    const y = Math.round(limita(((clientY - caja.top) / caja.height) * 100));
    setFoco(`${x}% ${y}%`);
  };

  /** Flechas del teclado: el ajuste fino no puede depender del ratón. */
  const conTeclado = (e: React.KeyboardEvent) => {
    const [x, y] = numeros(foco);
    const paso = e.shiftKey ? 10 : 2;

    const movimientos: Record<string, [number, number]> = {
      ArrowLeft: [x - paso, y],
      ArrowRight: [x + paso, y],
      ArrowUp: [x, y - paso],
      ArrowDown: [x, y + paso],
    };

    const nuevo = movimientos[e.key];
    if (!nuevo) return;

    e.preventDefault();
    setFoco(`${Math.round(limita(nuevo[0]))}% ${Math.round(limita(nuevo[1]))}%`);
  };

  const [x, y] = numeros(foco);

  if (!src) {
    return (
      <>
        <input type="hidden" name={nombre} value={foco} />
        <p className="rounded border border-dashed border-hairline px-3 py-4 text-sm text-body/45">
          Sube una imagen y aquí podrás elegir qué parte no se recorta.
        </p>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={nombre} value={foco} />

      <div
        ref={lienzo}
        role="slider"
        tabIndex={0}
        aria-label="Punto de la imagen que no se recorta"
        aria-valuetext={`Horizontal ${x} por ciento, vertical ${y} por ciento`}
        aria-valuenow={y}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={conTeclado}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setArrastrando(true);
          mueve(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => arrastrando && mueve(e.clientX, e.clientY)}
        onPointerUp={() => setArrastrando(false)}
        onPointerCancel={() => setArrastrando(false)}
        className="relative w-full cursor-crosshair touch-none overflow-hidden rounded border border-hairline bg-ink outline-none focus-visible:border-gold"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- puede ser un blob: local que next/image no sirve */}
        <img src={src} alt={alt} className="block max-h-72 w-full object-contain" draggable={false} />

        {/* La cruz del punto elegido */}
        <span
          className="pointer-events-none absolute -ml-3 -mt-3 h-6 w-6 rounded-full border-2 border-gold bg-gold/25 shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-hidden
        />
      </div>

      <p className="text-xs text-body/50">
        Pincha o arrastra sobre la foto para marcar lo que nunca se debe recortar —normalmente la
        cara—. Con el recuadro seleccionado, las flechas ajustan; con Mayúsculas, a saltos.{" "}
        <span className="text-body/35">Ahora: {foco}</span>
      </p>

      {recortes.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-body/60">Así se va a recortar:</p>
          <div className="flex flex-wrap gap-3">
            {recortes.map((r) => (
              <figure key={r.etiqueta} className="w-36">
                <div
                  className="overflow-hidden rounded border border-hairline bg-ink"
                  style={{ aspectRatio: String(r.ratio) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- ídem */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: foco }}
                    draggable={false}
                  />
                </div>
                <figcaption className="mt-1 text-center text-xs text-body/45">
                  {r.etiqueta}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const limita = (n: number) => Math.min(100, Math.max(0, n));

function numeros(foco: string): [number, number] {
  const m = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(foco.trim());
  return m ? [limita(Number(m[1])), limita(Number(m[2]))] : [50, 50];
}

function normaliza(foco: string): string {
  const [x, y] = numeros(foco);
  return `${x}% ${y}%`;
}
