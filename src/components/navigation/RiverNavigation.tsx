"use client";

import Image from "next/image";

interface RiverInfo {
  name: string;
  image: string;
  cruiseCount: number;
  priceFrom: number | null;
  countries: string;
}

interface RiverNavigationProps {
  rivers: RiverInfo[];
  selectedRiver: string | null;
  onSelect: (river: string) => void;
}

export default function RiverNavigation({ rivers, selectedRiver, onSelect }: RiverNavigationProps) {
  if (rivers.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {rivers.map((river) => {
        const isSelected = selectedRiver === river.name;
        return (
          <button
            key={river.name}
            onClick={() => onSelect(isSelected ? "" : river.name)}
            className={`group relative rounded-xl overflow-hidden aspect-[3/4] text-left transition-all duration-300 ${
              isSelected ? "ring-3 ring-[#C41E2F] scale-[1.02]" : "hover:scale-[1.02]"
            }`}
          >
            <Image
              src={river.image}
              alt={river.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 16vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-white font-bold text-lg font-[family-name:var(--font-poppins)]">
                {river.name}
              </h3>
              <p className="text-white/70 text-xs mt-0.5">{river.countries}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/80 text-xs">
                  {river.cruiseCount} {river.cruiseCount === 1 ? "crociera" : "crociere"}
                </span>
                {river.priceFrom && (
                  <span className="text-white text-xs font-semibold">
                    da {river.priceFrom.toLocaleString("it-IT")}€
                  </span>
                )}
              </div>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 size-6 bg-[#C41E2F] rounded-full flex items-center justify-center z-10">
                <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
