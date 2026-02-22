"use client";

import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/types";

function CarouselTrack({ items }: { items: Destination[] }) {
  return (
    <div className="flex shrink-0 animate-marquee">
      {items.map((dest) => (
        <Link
          key={dest.slug}
          href={`/destinazioni/${dest.slug}`}
          className="shrink-0 w-[160px] md:w-[200px] mx-2 group"
        >
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-300">
            {dest.cover_image_url ? (
              <Image
                src={dest.cover_image_url}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="200px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1B2D4F] to-[#C41E2F]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-semibold text-sm font-[family-name:var(--font-poppins)] drop-shadow-md">
                {dest.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DestinationsCarousel({
  destinations,
}: {
  destinations: Destination[];
}) {
  const items = destinations.slice(0, 14);
  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-1">
          Le nostre destinazioni
        </h2>
        <div className="section-divider mb-0" />
      </div>

      {/* Infinite marquee */}
      <div
        className="flex overflow-hidden"
        onMouseEnter={(e) => {
          e.currentTarget.querySelectorAll<HTMLElement>(".animate-marquee")
            .forEach((t) => (t.style.animationPlayState = "paused"));
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelectorAll<HTMLElement>(".animate-marquee")
            .forEach((t) => (t.style.animationPlayState = "running"));
        }}
      >
        <CarouselTrack items={items} />
        <CarouselTrack items={items} />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mt-6">
          <Link
            href="/destinazioni"
            className="text-sm font-semibold text-[#C41E2F] hover:text-[#A31825] transition-colors underline underline-offset-4"
          >
            Vedi tutte le destinazioni
          </Link>
        </div>
      </div>
    </section>
  );
}
