"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export type Slide = {
  src: string;
  /** Vacío si la imagen es puramente decorativa y el texto ya lo cuenta todo. */
  alt: string;
  /** Rótulo corto que se superpone: jugador, jugada o liga. */
  caption?: string;
};

const INTERVAL = 6000;

export default function HeroCarousel({
  slides,
  className = "",
}: {
  slides: Slide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Arranca en true para que el primer render del cliente coincida con el del
  // servidor; el efecto decide después si de verdad hay que animar.
  const [motionOk, setMotionOk] = useState(true);
  const total = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || !motionOk || total < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, motionOk, total]);

  // Swipe en móvil: sin librería, solo el delta horizontal del gesto.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
    touchX.current = null;
  };

  if (total === 0) return null;

  return (
    <div
      className={`hero-carousel ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Jugadores y jugadas de BMS"
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          className="hero-carousel__slide"
          // aria-hidden + inert: los lectores de pantalla y el tabulador solo
          // ven la lámina visible, no las que están detrás con opacity 0.
          aria-hidden={i !== index}
          data-active={i === index}
        >
          <Image
            src={s.src}
            alt={i === index ? s.alt : ""}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority={i === 0}
            className="object-cover"
          />
          <div className="hero-carousel__veil" />
          {s.caption && (
            <p className="hero-carousel__caption">
              <span>{s.caption}</span>
            </p>
          )}
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="hero-carousel__arrow hero-carousel__arrow--prev"
            aria-label="Imagen anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="hero-carousel__arrow hero-carousel__arrow--next"
            aria-label="Imagen siguiente"
          >
            →
          </button>

          <div className="hero-carousel__dots">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir a la imagen ${i + 1} de ${total}`}
                aria-current={i === index}
                className="hero-carousel__dot"
                data-active={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
