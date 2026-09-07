import Image from "next/image";

type PageHeroProps = {
  num: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  image?: string;
};

/** Cabecera editorial oscura y numerada, compartida por las páginas internas. */
export default function PageHero({ num, eyebrow, title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative bg-ink text-body overflow-hidden isolate border-b border-hairline">
      {image && (
        <div className="absolute inset-0 z-0">
          <Image src={image} alt="" fill priority className="object-cover opacity-20 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/70" />
        </div>
      )}
      <span aria-hidden="true" className="ghost-num absolute -bottom-8 right-4 z-0">
        {num}
      </span>
      <div className="container-pro relative z-10 py-24 md:py-32">
        <div className="eyebrow text-gold-dark mb-8">
          <span className="eyebrow-num">{num}</span> {eyebrow}
        </div>
        <h1 className="headline-lg text-gold max-w-4xl">{title}</h1>
        {subtitle && (
          <p className="text-lg text-body max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
