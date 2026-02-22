"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock, Ship, Map } from "lucide-react";
import { motion } from "motion/react";
import SectionReveal from "./SectionReveal";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";

function formatDate(iso: string): { day: string; monthYear: string } {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate().toString();
  const monthYear = d.toLocaleDateString("it-IT", { month: "short", year: "numeric" });
  return { day, monthYear: monthYear.charAt(0).toUpperCase() + monthYear.slice(1) };
}

export default function DeparturesTimeline({
  departures,
}: {
  departures: UnifiedDeparture[];
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

  // Only future departures, max 20
  const today = new Date().toISOString().slice(0, 10);
  const items = departures.filter((d) => d.date >= today).slice(0, 20);

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Prossime partenze
          </h2>
          <div className="section-divider mb-12" />
        </SectionReveal>

        <div className="relative group">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Scorri a sinistra"
          >
            <ChevronLeft className="size-6 text-[#1B2D4F]" />
          </button>

          {/* Timeline track */}
          <div className="relative">
            {/* Timeline line - desktop only */}
            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 bg-[#C41E2F]/20 -translate-y-1/2 pointer-events-none" />

            {/* Scrollable cards */}
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            >
              {items.map((dep, i) => {
                const { day, monthYear } = formatDate(dep.date);
                const isAbove = i % 2 === 0;

                return (
                  <motion.div
                    key={dep.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="snap-start shrink-0 w-[260px] md:w-[280px]"
                  >
                    {/* Desktop: alternate above/below */}
                    <div className={`md:flex md:flex-col ${isAbove ? "" : "md:pt-8"}`}>
                      {/* Dot on timeline - desktop only */}
                      <div className="hidden md:flex justify-center mb-3">
                        <div className="w-3 h-3 rounded-full bg-[#C41E2F] ring-4 ring-[#C41E2F]/20" />
                      </div>

                      {/* Card */}
                      <Link href={`${dep.basePath}/${dep.slug}`}>
                        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 group/card border border-gray-100">
                          {/* Date badge */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-[#C41E2F] text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
                              <span className="block text-xl font-bold leading-tight">{day}</span>
                              <span className="block text-[10px] uppercase tracking-wide">{monthYear}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                  dep.type === "tour"
                                    ? "bg-[#1B2D4F]/10 text-[#1B2D4F]"
                                    : "bg-[#C41E2F]/10 text-[#C41E2F]"
                                }`}
                              >
                                {dep.type === "tour" ? "Tour" : "Crociera"}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-[#1B2D4F] text-sm mb-2 line-clamp-2 group-hover/card:text-[#C41E2F] transition-colors">
                            {dep.title}
                          </h3>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
                            <span className="flex items-center gap-1">
                              {dep.type === "tour" ? <Map className="size-3" /> : <Ship className="size-3" />}
                              {dep.type === "tour" ? "Tour" : "Crociera"}
                            </span>
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
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
              href="/calendario-partenze"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white font-semibold transition-colors"
            >
              Vedi tutte le partenze
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
