"use client";

import Image from "next/image";
import Link from "next/link";
import SectionReveal from "./SectionReveal";
import type { Destination } from "@/lib/types";

function CarouselTrack({ items }: { items: Destination[] }) {
  return (
    <div className="flex gap-4 shrink-0 animate-marquee">
      {items.map((dest) => (
        <Link
          key={dest.slug}
          href={`/destinazioni/${dest.slug}`}
          className="shrink-0 w-[180px] md:w-[220px] group"
        >
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            {dest.cover_image_url ? (
              <Image
                src={dest.cover_image_url}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="220px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1B2D4F] to-[#C41E2F]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-base font-[family-name:var(--font-poppins)] drop-shadow-lg">
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
  const items = destinations.slice(0, 12);

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Scegli la tua destinazione
          </h2>
          <div className="section-divider mb-0" />
        </SectionReveal>
      </div>

      {/* Infinite marquee - two copies side by side for seamless loop */}
      <div
        className="flex overflow-hidden group"
        onMouseEnter={(e) => {
          const tracks = e.currentTarget.querySelectorAll<HTMLElement>(".animate-marquee");
          tracks.forEach((t) => (t.style.animationPlayState = "paused"));
        }}
        onMouseLeave={(e) => {
          const tracks = e.currentTarget.querySelectorAll<HTMLElement>(".animate-marquee");
          tracks.forEach((t) => (t.style.animationPlayState = "running"));
        }}
      >
        <CarouselTrack items={items} />
        <CarouselTrack items={items} />
      </div>

      <div className="container mx-auto px-4">
        <SectionReveal delay={0.2}>
          <div className="text-center mt-10">
            <Link
              href="/destinazioni"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold transition-colors"
            >
              Scopri tutte le destinazioni
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
