"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
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

export default function HeroSection({ destinations, tours, cruises, departures }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 -top-[10%] -bottom-[10%]" style={{ y: imageY }}>
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
          alt="Scopri il mondo con Misha Travel"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#1B2D4F]/80" />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen pt-32 pb-12">
        {/* Headline */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-base uppercase tracking-[0.3em] text-white/70 mb-4 font-[family-name:var(--font-poppins)]"
          >
            Tour Operator B2B
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white text-center font-[family-name:var(--font-poppins)] leading-tight max-w-4xl mx-auto px-4"
          >
            Scopri il mondo con{" "}
            <span className="text-[#C41E2F]">Misha Travel</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/70 mt-4 text-center max-w-2xl mx-auto px-4"
          >
            Tour culturali, grandi itinerari e crociere fluviali per agenzie di viaggio
          </motion.p>
        </div>

        {/* Search bar - positioned at bottom third */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mb-8"
        >
          <HeroSearchBar
            destinations={destinations}
            tours={tours}
            cruises={cruises}
            departures={departures}
          />
        </motion.div>
      </div>
    </section>
  );
}
