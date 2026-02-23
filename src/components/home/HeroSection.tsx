"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState, useEffect, useCallback, useRef } from "react";
import HeroSearchBar from "./HeroSearchBar";
import type { Destination } from "@/lib/types";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";

type Props = {
  destinations: Destination[];
  tours: TourListItem[];
  cruises: CruiseListItem[];
  departures: UnifiedDeparture[];
};

type Slide = { image: string; label: string };

function buildSlides(tours: TourListItem[], cruises: CruiseListItem[]): Slide[] {
  const seen = new Set<string>();
  const all: Slide[] = [];

  // Add up to 3 tours
  for (const t of tours) {
    if (all.length >= 3 || !t.cover_image_url) continue;
    if (seen.has(t.cover_image_url)) continue;
    seen.add(t.cover_image_url);
    all.push({ image: t.cover_image_url, label: t.title });
  }

  // Add up to 2 cruises (with unique images)
  for (const c of cruises) {
    if (all.length >= 5 || !c.cover_image_url) continue;
    if (seen.has(c.cover_image_url)) continue;
    seen.add(c.cover_image_url);
    all.push({ image: c.cover_image_url, label: c.title });
  }

  if (all.length === 0) {
    return [
      { image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80", label: "Scopri il mondo" },
      { image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80", label: "Viaggi indimenticabili" },
    ];
  }
  return all;
}

const INTERVAL = 7500;

export default function HeroSection({ destinations, tours, cruises, departures }: Props) {
  const slides = buildSlides(tours, cruises);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const zoomRefs = useRef<(HTMLDivElement | null)[]>([]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  // Restart Ken Burns zoom on the newly active slide (without remounting)
  useEffect(() => {
    const el = zoomRefs.current[current];
    if (!el) return;
    // Remove class → force reflow → re-add class to restart animation
    el.classList.remove("hero-ken-burns");
    void el.offsetHeight;
    el.classList.add("hero-ken-burns");
  }, [current]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  // Progress bar
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    let raf: number;
    function tick() {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / INTERVAL, 1));
      if (elapsed < INTERVAL) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current]);

  return (
    <section className="relative h-[600px] md:h-[680px] lg:h-[720px] flex items-center justify-center bg-black">
      {/* Slides container with overflow hidden (so Ken Burns doesn't leak) */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-[opacity,filter] duration-[1500ms] ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              filter: i === current ? "blur(0px)" : "blur(18px)",
            }}
          >
            <div
              ref={(el) => { zoomRefs.current[i] = el; }}
              className={i === 0 ? "hero-ken-burns" : ""}
              style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={slide.image}
                alt={slide.label}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 pt-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs md:text-sm uppercase tracking-[0.35em] text-white/80 mb-5 font-medium"
        >
          Tour Operator B2B
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center font-[family-name:var(--font-poppins)] leading-tight max-w-4xl mx-auto mb-3"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          Scopri il mondo con{" "}
          <span className="text-white">Misha Travel</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-white/80 text-center max-w-xl mx-auto mb-10"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          Tour culturali, grandi itinerari e crociere fluviali
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <HeroSearchBar
            destinations={destinations}
            tours={tours}
            cruises={cruises}
            departures={departures}
          />
        </motion.div>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className="relative h-[3px] rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === current ? 48 : 24 }}
              aria-label={`Slide ${i + 1}`}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              {i === current && (
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
