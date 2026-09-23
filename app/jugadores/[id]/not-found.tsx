import Link from "next/link";

export default function JugadorNoEncontrado() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-black text-gold mb-4">
          Jugador no encontrado
        </h1>
        <Link href="/jugadores" className="text-gold-light font-bold hover:text-gold">
          ← Volver al directorio
        </Link>
      </div>
    </div>
  );
}
