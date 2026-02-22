"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import SectionReveal from "./SectionReveal";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";

function formatDate(iso: string): { day: string; month: string; year: string } {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("it-IT", { month: "short" });
  const year = d.getFullYear().toString();
  return { day, month: month.charAt(0).toUpperCase() + month.slice(1), year };
}

export default function DeparturesTimeline({
  departures,
}: {
  departures: UnifiedDeparture[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.65;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const items = departures.filter((d) => d.date >= today).slice(0, 20);

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Prossime partenze
          </h2>
          <div className="section-divider mb-10" />
        </SectionReveal>

        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="size-5 text-[#1B2D4F]" />
          </button>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1"
          >
            {items.map((dep) => {
              const { day, month, year } = formatDate(dep.date);

              return (
                <Link
                  key={dep.id}
                  href={`${dep.basePath}/${dep.slug}`}
                  className="shrink-0 w-[240px] md:w-[260px] group/card"
                >
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 h-full flex flex-col">
                    {/* Date + type row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-[#C41E2F] text-white rounded-lg px-2.5 py-1.5 text-center min-w-[52px] shrink-0">
                        <span className="block text-lg font-bold leading-tight">{day}</span>
                        <span className="block text-[10px] uppercase tracking-wide leading-tight">{month}</span>
                        <span className="block text-[9px] opacity-70">{year}</span>
                      </div>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1 ${
                            dep.type === "tour"
                              ? "bg-[#1B2D4F]/10 text-[#1B2D4F]"
                              : "bg-[#C41E2F]/10 text-[#C41E2F]"
                          }`}
                        >
                          {dep.type === "tour" ? "Tour" : "Crociera"}
                        </span>
                        <h3 className="font-semibold text-[#1B2D4F] text-sm leading-snug line-clamp-2 group-hover/card:text-[#C41E2F] transition-colors">
                          {dep.title}
                        </h3>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-auto">
                      {dep.destination_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {dep.destination_name}
                        </span>
                      )}
                      {dep.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {dep.duration}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {dep.price != null && dep.price > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">a partire da </span>
                        <span className="font-bold text-[#C41E2F]">
                          &euro;{dep.price.toLocaleString("it-IT")}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
