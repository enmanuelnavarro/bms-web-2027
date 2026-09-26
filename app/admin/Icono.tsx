// Iconos del panel, en SVG en línea.
//
// Sin librería a propósito: son seis dibujos y añadir una dependencia de
// iconos por esto engordaría el bundle para nada. Todos comparten caja de
// 24×24 y trazo, así que se alinean solos en el menú.

const TRAZOS: Record<string, React.ReactNode> = {
  panel: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  imagen: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 4.5-4.5a2 2 0 0 1 2.8 0L15 16" />
      <path d="m14 14 1.5-1.5a2 2 0 0 1 2.8 0L21 15" />
    </>
  ),
  noticia: (
    <>
      <path d="M4 5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v14H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 8h2a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2" />
      <path d="M7.5 8h6M7.5 11.5h6M7.5 15h3.5" />
    </>
  ),
  jugador: (
    <>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  album: (
    <>
      <rect x="7" y="3" width="14" height="14" rx="2" />
      <path d="M17 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
      <circle cx="12" cy="8" r="1.3" />
      <path d="m8 15 3-3a1.6 1.6 0 0 1 2.3 0L17 16" />
    </>
  ),
  sobre: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  cerrar: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  salir: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </>
  ),
};

export default function Icono({
  nombre,
  className = "h-5 w-5",
}: {
  nombre: string;
  className?: string;
}) {
  const trazo = TRAZOS[nombre];
  if (!trazo) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {trazo}
    </svg>
  );
}
