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
  const all = [
    ...tours
      .filter((t) => t.cover_image_url)
      .slice(0, 3)
      .map((t) => ({ image: t.cover_image_url!, label: t.title })),
    ...cruises
      .filter((c) => c.cover_image_url)
      .slice(0, 2)
      .map((c) => ({ image: c.cover_image_url!, label: c.title })),
  ];
  if (all.length === 0) {
    return [
      { image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80", label: "Scopri il mondo" },
      { image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80", label: "Viaggi indimenticabili" },
    ];
  }
  return all;
}

const INTERVAL = 5000;

export default function HeroSection({ destinations, tours, cruises, departures }: Props) {
  const slides = buildSlides(tours, cruises);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  // Key that increments every slide change to restart the CSS zoom animation
  const [zoomKey, setZoomKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
    setZoomKey((k) => k + 1);
    setProgress(0);
  }, [slides.length]);

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
    <section
      ref={containerRef}
      className="relative h-[600px] md:h-[680px] lg:h-[720px] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* All slides stacked — CSS transition for silky crossfade + blur */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-[opacity,filter] duration-[1500ms] ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            filter: i === current ? "blur(0px)" : "blur(18px)",
          }}
        >
          {/* Inner div for Ken Burns zoom — animation restarts via key */}
          <div
            key={i === current ? zoomKey : `idle-${i}`}
            className={i === current ? "hero-ken-burns" : ""}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-[1]" />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 pt-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs md:text-sm uppercase tracking-[0.35em] text-white/80 mb-5 font-medium"
        >
          Tour Operator B2B
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center font-[family-name:var(--font-poppins)] leading-tight max-w-4xl mx-auto mb-3"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          Scopri il mondo con{" "}
          <span className="text-white">Misha Travel</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-base md:text-lg text-white/80 text-center max-w-xl mx-auto mb-10"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          Tour culturali, grandi itinerari e crociere fluviali
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
              onClick={() => { setCurrent(i); setZoomKey((k) => k + 1); setProgress(0); }}
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
