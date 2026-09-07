"use client";

import { useEffect, useRef } from "react";

/**
 * Plan B: incrusta el widget de un proveedor externo (Behold, LightWidget,
 * Elfsight…) cuando no hay token de Meta configurado.
 *
 * Se activa con NEXT_PUBLIC_IG_WIDGET_SRC (el script del proveedor) y, si hace
 * falta, NEXT_PUBLIC_IG_WIDGET_HTML con el div que ese script hidrata.
 */
export default function InstagramWidget({
  scriptSrc,
  widgetHtml,
}: {
  scriptSrc: string;
  widgetHtml?: string;
}) {
  const loaded = useRef(false);

  useEffect(() => {
    // Guard doble: React 18 monta dos veces en desarrollo y algunos proveedores
    // duplican el feed si su script se inyecta dos veces.
    if (loaded.current || document.querySelector(`script[src="${scriptSrc}"]`)) return;
    loaded.current = true;

    const el = document.createElement("script");
    el.src = scriptSrc;
    el.async = true;
    document.body.appendChild(el);
  }, [scriptSrc]);

  return (
    <div
      className="ig-widget"
      // El HTML lo define quien configura la variable de entorno, no un visitante.
      dangerouslySetInnerHTML={{ __html: widgetHtml ?? "" }}
    />
  );
}
