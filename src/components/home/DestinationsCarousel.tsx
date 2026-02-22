"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TiltCard from "./TiltCard";
import SectionReveal from "./SectionReveal";
import type { Destination } from "@/lib/types";

export default function DestinationsCarousel({
  destinations,
}: {
  destinations: Destination[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const items = destinations.slice(0, 12);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Le nostre destinazioni
          </h2>
          <div className="section-divider mb-12" />
        </SectionReveal>

        {/* Carousel container */}
        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="size-6 text-[#1B2D4F]" />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          >
            {items.map((dest, i) => (
              <SectionReveal key={dest.slug} delay={i * 0.08} className="snap-start shrink-0">
                <Link href={`/destinazioni/${dest.slug}`}>
                  <TiltCard className="w-[220px] md:w-[260px]">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group/card">
                      {dest.cover_image_url ? (
                        <Image
                          src={dest.cover_image_url}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                          sizes="260px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D4F] to-[#C41E2F]" />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg font-[family-name:var(--font-poppins)] drop-shadow-lg">
                          {dest.name}
                        </h3>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </SectionReveal>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Scorri a destra"
          >
            <ChevronRight className="size-6 text-[#1B2D4F]" />
          </button>
        </div>

        <SectionReveal delay={0.3}>
          <div className="text-center mt-10">
            <Link
              href="/destinazioni"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold transition-colors"
            >
              Scopri tutte le destinazioni
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
