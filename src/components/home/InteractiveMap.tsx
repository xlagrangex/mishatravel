"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Waves } from "lucide-react";
import WorldMapSVG from "./WorldMapSVG";
import SectionReveal from "./SectionReveal";
import type { Destination } from "@/lib/types";

export default function InteractiveMap({
  destinations,
}: {
  destinations: Destination[];
}) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // Group destinations by macro_area
  const grouped = useMemo(() => {
    const map: Record<string, Destination[]> = {};
    for (const d of destinations) {
      const area = d.macro_area || "Altro";
      if (!map[area]) map[area] = [];
      map[area].push(d);
    }
    return map;
  }, [destinations]);

  // Destinations in the active/hovered region
  const regionDestinations = activeRegion ? grouped[activeRegion] ?? [] : [];

  // Check if there are river cruises (destinations with macro_area containing "fium" or similar)
  const riverDestinations = destinations.filter(
    (d) => d.macro_area?.toLowerCase().includes("fium") || d.macro_area?.toLowerCase().includes("river")
  );

  function handleRegionClick(region: string) {
    const dests = grouped[region];
    if (dests && dests.length === 1) {
      // Single destination, navigate directly
      window.location.href = `/destinazioni/${dests[0].slug}`;
    } else {
      // Multiple destinations, navigate to destinations list
      window.location.href = `/destinazioni`;
    }
  }

  return (
    <section className="py-20 bg-[#1B2D4F] overflow-hidden relative">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white font-[family-name:var(--font-poppins)] mb-2">
            Esplora il mondo
          </h2>
          <div className="w-[60px] h-[3px] bg-[#C41E2F] mx-auto mb-12" />
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Map */}
          <SectionReveal direction="left" className="lg:col-span-2">
            <WorldMapSVG
              activeRegion={activeRegion}
              onHover={setActiveRegion}
              onClick={handleRegionClick}
            />

            {/* "I nostri fiumi" badge */}
            {riverDestinations.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onMouseEnter={() => setActiveRegion("Fiumi")}
                  onMouseLeave={() => setActiveRegion(null)}
                  onClick={() => (window.location.href = "/crociere")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                    activeRegion === "Fiumi"
                      ? "bg-[#C41E2F]/20 border-[#C41E2F] text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:text-white hover:border-white/40"
                  }`}
                >
                  <Waves className="size-5" />
                  <span className="font-semibold text-sm">I nostri fiumi</span>
                </button>
              </div>
            )}
          </SectionReveal>

          {/* Tooltip / region details */}
          <div className="lg:col-span-1 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeRegion && regionDestinations.length > 0 ? (
                <motion.div
                  key={activeRegion}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
                    {activeRegion}
                  </h3>
                  <div className="space-y-3">
                    {regionDestinations.slice(0, 6).map((dest) => (
                      <Link
                        key={dest.slug}
                        href={`/destinazioni/${dest.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          {dest.cover_image_url ? (
                            <Image
                              src={dest.cover_image_url}
                              alt={dest.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10" />
                          )}
                        </div>
                        <span className="text-white/80 group-hover:text-white transition-colors font-medium text-sm">
                          {dest.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full min-h-[300px]"
                >
                  <p className="text-white/40 text-center text-sm">
                    Passa il mouse su una regione<br />per scoprire le destinazioni
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
