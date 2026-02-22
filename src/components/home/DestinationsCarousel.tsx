"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/types";

function CarouselTrack({ items }: { items: Destination[] }) {
  return (
    <div className="flex shrink-0">
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

const SPEED = 0.5; // px per frame at 60fps

export default function DestinationsCarousel({
  destinations,
}: {
  destinations: Destination[];
}) {
  const items = destinations.slice(0, 14);
  const trackRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const currentSpeedRef = useRef(SPEED);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // Ease speed towards target
    const target = hoveredRef.current ? 0 : SPEED;
    currentSpeedRef.current += (target - currentSpeedRef.current) * 0.04;

    offsetRef.current += currentSpeedRef.current;

    // Get width of one track copy (half of scrollWidth since we duplicate)
    const halfWidth = track.scrollWidth / 2;
    if (halfWidth > 0 && offsetRef.current >= halfWidth) {
      offsetRef.current -= halfWidth;
    }

    track.style.transform = `translateX(-${offsetRef.current}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-1">
          Le nostre destinazioni
        </h2>
        <div className="section-divider mb-0" />
      </div>

      {/* Infinite scroll — JS-driven for smooth deceleration on hover */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => { hoveredRef.current = true; }}
        onMouseLeave={() => { hoveredRef.current = false; }}
      >
        <div ref={trackRef} className="flex will-change-transform">
          <CarouselTrack items={items} />
          <CarouselTrack items={items} />
        </div>
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
