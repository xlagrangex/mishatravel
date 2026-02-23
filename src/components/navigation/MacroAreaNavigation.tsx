"use client";

import Image from "next/image";

interface MacroAreaInfo {
  name: string;
  image: string;
  tourCount: number;
}

interface MacroAreaNavigationProps {
  areas: MacroAreaInfo[];
  selectedArea: string | null;
  onSelect: (area: string) => void;
}

const AREA_IMAGES: Record<string, string> = {
  Europa: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop",
  "Medio Oriente": "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&h=600&fit=crop",
  Asia: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
  "Asia Centrale": "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&h=600&fit=crop",
  Africa: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop",
  "America Latina": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop",
};

export default function MacroAreaNavigation({ areas, selectedArea, onSelect }: MacroAreaNavigationProps) {
  if (areas.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {areas.map((area) => {
        const isSelected = selectedArea === area.name;
        const img = area.image || AREA_IMAGES[area.name] || "";
        return (
          <button
            key={area.name}
            onClick={() => onSelect(isSelected ? "" : area.name)}
            className={`group relative rounded-xl overflow-hidden aspect-[4/3] text-left transition-all duration-300 ${
              isSelected ? "ring-3 ring-[#C41E2F] scale-[1.02]" : "hover:scale-[1.02]"
            }`}
          >
            <Image
              src={img}
              alt={area.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <h3 className="text-white font-bold text-xl font-[family-name:var(--font-poppins)]">
                {area.name}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {area.tourCount} {area.tourCount === 1 ? "tour disponibile" : "tour disponibili"}
              </p>
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
