"use client";

import { useState } from "react";
import Image from "next/image";
import { STOCK_IMAGES } from "@/lib/images";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
    oficina: "rd",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el formulario");
      }

      setSubmitted(true);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
        oficina: "rd",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Error al enviar el formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-body">
      {/* HERO EDITORIAL */}
      <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
        <div className="absolute inset-0 z-0">
          <Image src={STOCK_IMAGES.contact} alt="" fill priority className="object-cover opacity-20 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/70" />
        </div>
        <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">06</span>
        <div className="container-pro relative z-10 py-24 md:py-32">
          <div className="eyebrow text-gold-dark mb-8">
            <span className="eyebrow-num">06</span> Hablemos
          </div>
          <h1 className="headline-lg text-gold">Contacto</h1>
          <p className="text-lg text-body max-w-2xl">
            Ponte en contacto con nuestro equipo en Miami o República Dominicana.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* INFO CONTACTO */}
            <div className="space-y-8">
              {/* OFICINA MIAMI (sede) */}
              <div className="card-dark rounded-2xl p-8 hover:border-gold transition">
                <div className="text-2xl md:text-3xl mb-4">🇺🇸</div>
                <h3 className="font-display text-xl text-gold mb-4">
                  {SITE.offices.miami.label}
                </h3>
                <div className="space-y-4 text-body">
                  <div>
                    <p className="text-sm text-gold-dark">Dirección</p>
                    <p className="font-semibold">{SITE.offices.miami.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gold-dark">Teléfono</p>
                    <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-gold hover:text-gold-light">
                      {SITE.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gold-dark">WhatsApp</p>
                    <a
                      href={`https://wa.me/${SITE.phoneHref.replace("+", "")}`}
                      className="font-semibold text-gold hover:text-gold-light"
                      target="_blank"
                    >
                      Chatear en WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* OFICINA RD */}
              <div className="card-dark rounded-2xl p-8 hover:border-gold transition">
                <div className="text-2xl md:text-3xl mb-4">🇩🇴</div>
                <h3 className="font-display text-xl text-gold mb-4">
                  {SITE.offices.rd.label}
                </h3>
                <div className="space-y-4 text-body">
                  <div>
                    <p className="text-sm text-gold-dark">Ubicación</p>
                    <p className="font-semibold">{SITE.offices.rd.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gold-dark">Teléfono</p>
                    <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-gold hover:text-gold-light">
                      {SITE.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* LICENCIA + EMAIL */}
              <div className="bg-gold text-ink rounded-2xl p-8">
                <div className="text-2xl md:text-3xl mb-4">📧</div>
                <h3 className="font-display text-xl text-ink mb-4">Email & Licencia</h3>
                <div className="space-y-4 text-ink/80">
                  <div>
                    <p className="text-sm text-ink/75">Contacto</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-semibold text-ink hover:underline break-all"
                    >
                      {SITE.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-ink/75">Licencia FIBA</p>
                    <p className="font-semibold text-ink">#{SITE.fibaLicense}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULARIO */}
            <div className="lg:col-span-2">
              <div className="card-dark rounded-2xl p-8">
                <h2 className="text-lg md:text-xl font-black text-gold mb-8">
                  Envíanos un Mensaje
                </h2>

                {submitted && (
                  <div className="mb-8 p-4 bg-gold/15 border border-gold rounded-lg text-gold-light">
                    ✓ Mensaje enviado correctamente. Pronto recibirás una respuesta en tu email.
                  </div>
                )}

                {error && (
                  <div className="mb-8 p-4 bg-red-500/15 border border-red-500/40 rounded-lg text-red-300">
                    ✗ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gold-dark mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gold-dark mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gold-dark mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                        placeholder="+1-XXX-XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gold-dark mb-2">
                        Oficina de Interés *
                      </label>
                      <select
                        name="oficina"
                        value={formData.oficina}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                      >
                        <option value="rd">República Dominicana</option>
                        <option value="miami">Miami, Florida</option>
                        <option value="ambas">Ambas Oficinas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gold-dark mb-2">
                        Asunto *
                      </label>
                      <select
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="representacion">Solicitar representación</option>
                        <option value="consulta">Consulta general</option>
                        <option value="scout">Scouting de talento</option>
                        <option value="asociacion">Posible asociación</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gold-dark mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-ink border border-hairline rounded-lg text-body placeholder-body/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all resize-none"
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gold hover:bg-gold-light text-ink font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {loading ? "Enviando..." : "Enviar Mensaje"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
