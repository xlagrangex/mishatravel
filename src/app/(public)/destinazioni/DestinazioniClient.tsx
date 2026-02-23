"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/types";

// Config map for known macro areas: icon + description.
// Areas not listed here get a fallback icon and no description.
const AREA_CONFIG: Record<string, { icon: string; description: string }> = {
  "Europa": { icon: "\u{1F3DB}", description: "Capitali imperiali, borghi medievali e sapori mediterranei nel cuore del Vecchio Continente." },
  "Medio Oriente": { icon: "\u{1F54C}", description: "Crocevia di civilta millenarie, dalla Turchia alla Giordania." },
  "Asia": { icon: "\u{1F3EF}", description: "Templi millenari, culture millenarie e paesaggi che tolgono il fiato." },
  "Asia Centrale": { icon: "\u{1F3EF}", description: "Dalla Transiberiana alla Via della Seta, un viaggio tra steppe, cupole dorate e culture senza confini." },
  "Africa": { icon: "\u{1F30D}", description: "Safari, deserti e tradizioni ancestrali nel continente piu selvaggio." },
  "America Latina": { icon: "\u{1F30E}", description: "Dalle Ande alla Patagonia, un continente di contrasti e meraviglie naturali." },
  "Percorsi Fluviali": { icon: "\u{1F6A2}", description: "Crociere lungo i grandi fiumi d'Europa tra castelli, vigneti e citta storiche." },
  "Altro": { icon: "\u{2708}\u{FE0F}", description: "Altre destinazioni selezionate per te." },
};
const FALLBACK_ICON = "\u{1F30F}";

function toSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function DestinationMosaicCard({
  dest,
  tourCount,
}: {
  dest: Destination;
  tourCount: number;
}) {
  const imgSrc = dest.cover_image_url || "/images/placeholder.jpg";

  return (
    <Link
      href={`/destinazioni/${dest.slug}`}
      className="group relative block rounded-xl overflow-hidden aspect-[4/3]"
    >
      <Image
        src={imgSrc}
        alt={dest.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,45,79,0.85)] via-[rgba(27,45,79,0.2)] to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
        <h3 className="text-white font-bold text-lg md:text-xl font-[family-name:var(--font-poppins)] drop-shadow-lg">
          {dest.name}
        </h3>
        {tourCount > 0 && (
          <p className="text-white/80 text-sm mt-1">
            {tourCount} {tourCount === 1 ? "viaggio disponibile" : "viaggi disponibili"}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-white text-xs font-medium mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Scopri di pi&ugrave;
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

interface DestinazioniClientProps {
  grouped: Record<string, Destination[]>;
  tourCounts: Record<string, number>;
}

export default function DestinazioniClient({ grouped, tourCounts }: DestinazioniClientProps) {
  // Derive macro areas from the actual data
  const activeMacroAreas = Object.keys(grouped)
    .filter((label) => grouped[label].length > 0)
    .map((label) => ({
      id: toSlug(label),
      label,
      icon: AREA_CONFIG[label]?.icon ?? FALLBACK_ICON,
      description: AREA_CONFIG[label]?.description ?? "",
    }));

  const [activeArea, setActiveArea] = useState(activeMacroAreas[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = useCallback((areaId: string) => {
    const el = sectionRefs.current[areaId];
    if (!el) return;
    const navHeight = navRef.current?.offsetHeight || 0;
    const headerHeight = window.innerWidth >= 1024 ? 80 : 64;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - headerHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveArea(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    for (const area of activeMacroAreas) {
      const el = sectionRefs.current[area.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If no destinations at all, show empty state
  if (activeMacroAreas.length === 0) {
    return (
      <>
        <section className="relative py-20 md:py-28 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=800&fit=crop"
            alt="Destinazioni Misha Travel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B2D4F]/70 via-[#1B2D4F]/50 to-[#1B2D4F]/90" />
          <div className="container mx-auto px-4 relative z-10">
            <nav className="mb-6 text-sm text-white/50">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">Destinazioni</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
              Le Nostre Destinazioni
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl">
              Cinque continenti, infinite emozioni. Scopri i tour culturali e le crociere fluviali Misha Travel.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-lg">
              Le destinazioni saranno presto disponibili. Torna a trovarci!
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero with background image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=800&fit=crop"
          alt="Destinazioni Misha Travel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2D4F]/70 via-[#1B2D4F]/50 to-[#1B2D4F]/90" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-white/50">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Destinazioni</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
            Le Nostre Destinazioni
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl">
            Cinque continenti, infinite emozioni. Scopri i tour culturali e le crociere fluviali Misha Travel.
          </p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Sticky navigation */}
      <div
        ref={navRef}
        className="sticky top-[64px] lg:top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {activeMacroAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleScrollTo(area.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeArea === area.id
                    ? "bg-[#C41E2F] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections per macro area */}
      {activeMacroAreas.map((area, areaIdx) => {
        const dests = grouped[area.label] ?? [];

        return (
          <section
            key={area.id}
            id={area.id}
            ref={(el) => { sectionRefs.current[area.id] = el; }}
            className={`py-14 md:py-20 ${areaIdx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}`}
          >
            <div className="container mx-auto px-4">
              {/* Section header */}
              <div className="flex items-center gap-4 mb-3">
                <div className="w-1 h-10 bg-[#C41E2F] rounded-full" />
                <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                  {area.label}
                </h2>
              </div>
              {area.description && (
                <p className="text-gray-500 mb-8 ml-5 pl-4 border-l-2 border-transparent">
                  {area.description}
                </p>
              )}

              {/* Destination grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {dests.map((dest) => (
                  <DestinationMosaicCard
                    key={dest.slug}
                    dest={dest}
                    tourCount={tourCounts[dest.slug] || 0}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA bottom */}
      <section className="py-16 bg-[#1B2D4F]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-poppins)] mb-4">
            Non trovi la destinazione che cerchi?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Contattaci per un preventivo personalizzato. Il nostro team e a tua disposizione per creare il viaggio perfetto.
          </p>
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C41E2F] text-white font-semibold rounded-full hover:bg-[#A31825] transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Contattaci
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
