"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Valor a mostrar, admite prefijo/sufijo: "100+", "16.8", "$1.2M" */
  value: string;
  className?: string;
  durationMs?: number;
}

// Divide "100+" -> { prefix: "", num: 100, decimals: 0, suffix: "+" }
function parseValue(value: string) {
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, num: parseFloat(numStr), decimals, suffix };
}

export default function CountUp({ value, className, durationMs = 1400 }: CountUpProps) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);
  const startedRef = useRef(false);

  useEffect(() => {
    // Si no es numérico o el usuario prefiere menos movimiento, mostrar el valor final.
    if (!parsed) {
      setDisplay(value);
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = (parsed.num * eased).toFixed(parsed.decimals);
        setDisplay(`${parsed.prefix}${current}${parsed.suffix}`);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
