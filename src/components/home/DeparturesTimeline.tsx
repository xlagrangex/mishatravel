"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock, CalendarDays } from "lucide-react";
import SectionReveal from "./SectionReveal";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";

function formatDate(iso: string): { day: string; monthShort: string; monthLong: string; year: string } {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const monthShort = d.toLocaleDateString("it-IT", { month: "short" });
  const monthLong = d.toLocaleDateString("it-IT", { month: "long" });
  const year = d.getFullYear().toString();
  return {
    day,
    monthShort: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
    monthLong: monthLong.charAt(0).toUpperCase() + monthLong.slice(1),
    year,
  };
}

type Props = {
  departures: UnifiedDeparture[];
  tours: TourListItem[];
  cruises: CruiseListItem[];
};

export default function DeparturesTimeline({ departures, tours, cruises }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const items = departures.filter((d) => d.date >= today).slice(0, 20);

  if (items.length === 0) return null;

  // Build image lookup maps
  const tourImages = new Map(tours.map((t) => [t.slug, t.cover_image_url]));
  const cruiseImages = new Map(cruises.map((c) => [c.slug, c.cover_image_url]));

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
            Prossime partenze
          </h2>
          <div className="section-divider mb-12" />
        </SectionReveal>

        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="size-5 text-[#1B2D4F]" />
          </button>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-1"
          >
            {items.map((dep) => {
              const { day, monthShort, year } = formatDate(dep.date);
              const coverImage =
                dep.type === "tour"
                  ? tourImages.get(dep.slug) ?? null
                  : cruiseImages.get(dep.slug) ?? null;

              return (
                <Link
                  key={dep.id}
                  href={`${dep.basePath}/${dep.slug}`}
                  className="shrink-0 w-[280px] md:w-[300px] group/card"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Image with date overlay */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={dep.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                          quality={55}
                          sizes="300px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D4F] to-[#0F1A2E]" />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Date badge - top left */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-white rounded-xl px-3 py-2 text-center shadow-md min-w-[56px]">
                          <span className="block text-xl font-bold text-[#1B2D4F] leading-none">{day}</span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#C41E2F] mt-0.5">{monthShort}</span>
                        </div>
                      </div>

                      {/* Type badge - top right */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-sm ${
                            dep.type === "tour"
                              ? "bg-[#1B2D4F]/80 text-white"
                              : "bg-[#C41E2F]/80 text-white"
                          }`}
                        >
                          {dep.type === "tour" ? "Tour" : "Crociera"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-[#1B2D4F] text-[15px] leading-snug line-clamp-2 group-hover/card:text-[#C41E2F] transition-colors mb-3">
                        {dep.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-auto">
                        {dep.destination_name && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-[#C41E2F]" />
                            {dep.destination_name}
                          </span>
                        )}
                        {dep.duration && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-[#C41E2F]" />
                            {dep.duration}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 text-[#C41E2F]" />
                          {year}
                        </span>
                      </div>

                      {/* Price */}
                      {dep.price != null && dep.price > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-baseline gap-1.5">
                          <span className="text-xs text-gray-400">da</span>
                          <span className="font-bold text-[#C41E2F] text-lg leading-none">
                            &euro;{dep.price.toLocaleString("it-IT")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg hover:shadow-xl border border-gray-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scorri a destra"
          >
            <ChevronRight className="size-5 text-[#1B2D4F]" />
          </button>
        </div>

        <SectionReveal delay={0.2}>
          <div className="text-center mt-8">
            <Link
              href="/calendario-partenze"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white font-semibold transition-colors"
            >
              Vedi tutte le partenze
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
