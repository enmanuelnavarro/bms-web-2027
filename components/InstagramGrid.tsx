import Image from "next/image";

import { formatPostDate, truncateCaption, type InstagramPost } from "@/lib/instagram";

/**
 * Rejilla de posts reales traídos de la API. Cada publicación es una tarjeta
 * independiente que abre el post original en Instagram.
 */
export default function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group ig-card"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={post.image}
              alt={post.caption ? truncateCaption(post.caption, 80) : "Publicación de Instagram de BMS"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="ig-card__veil" />

            {(post.isVideo || post.isCarousel) && (
              <span className="ig-card__badge" aria-hidden="true">
                {post.isVideo ? "▶" : "❏"}
              </span>
            )}
          </div>

          <div className="p-5">
            <p className="text-xs text-gold-dark font-semibold uppercase tracking-wider mb-2">
              {formatPostDate(post.timestamp)}
            </p>
            {post.caption ? (
              <p className="text-sm text-body/80 leading-relaxed">
                {truncateCaption(post.caption)}
              </p>
            ) : (
              <p className="text-sm text-body/50 italic">Ver publicación</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
