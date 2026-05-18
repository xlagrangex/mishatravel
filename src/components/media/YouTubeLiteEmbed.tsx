"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface YouTubeLiteEmbedProps {
  videoId: string;
  title: string;
  startSeconds?: number;
  thumbnailQuality?: "default" | "hqdefault" | "sddefault" | "maxresdefault";
  className?: string;
}

export default function YouTubeLiteEmbed({
  videoId,
  title,
  startSeconds,
  thumbnailQuality = "maxresdefault",
  className = "",
}: YouTubeLiteEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/${thumbnailQuality}.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${
    startSeconds ? `&start=${startSeconds}` : ""
  }`;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ${className}`}
    >
      {loaded ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Riproduci il video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={false}
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C41E2F] shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#A31825] md:h-24 md:w-24">
              <Play className="size-8 fill-white text-white md:size-10" />
            </div>
          </div>
          {/* title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-left md:p-8">
            <span className="block text-xs font-semibold uppercase tracking-widest text-white/80 md:text-sm">
              Storytime · Evoluzione Radio
            </span>
            <span className="mt-1 block font-[family-name:var(--font-poppins)] text-lg font-bold text-white md:text-2xl">
              {title}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
