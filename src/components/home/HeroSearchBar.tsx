"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, MapPin, Ship, Calendar } from "lucide-react";
import type { Destination } from "@/lib/types";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";
import SearchResultsDropdown from "./SearchResultsDropdown";

type Props = {
  destinations: Destination[];
  tours: TourListItem[];
  cruises: CruiseListItem[];
  departures: UnifiedDeparture[];
};

function getFutureMonths(count: number): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return months;
}

export default function HeroSearchBar({ destinations, tours, cruises, departures }: Props) {
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<"tutti" | "tour" | "crociera">("tutti");
  const [mese, setMese] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const futureMonths = useMemo(() => getFutureMonths(18), []);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return destinations.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, destinations]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    let filtered = departures.filter((d) => d.date >= today);

    if (tipo === "tour") filtered = filtered.filter((d) => d.type === "tour");
    if (tipo === "crociera") filtered = filtered.filter((d) => d.type === "crociera");
    if (mese) filtered = filtered.filter((d) => d.date.startsWith(mese));
    if (q.length >= 2) {
      filtered = filtered.filter(
        (d) => d.destination_name?.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)
      );
    }

    const seen = new Map<string, UnifiedDeparture>();
    for (const dep of filtered) {
      if (!seen.has(dep.slug)) seen.set(dep.slug, dep);
    }

    return Array.from(seen.values())
      .slice(0, 12)
      .map((dep) => {
        const image =
          dep.type === "tour"
            ? tours.find((t) => t.slug === dep.slug)?.cover_image_url ?? null
            : cruises.find((c) => c.slug === dep.slug)?.cover_image_url ?? null;
        return { ...dep, cover_image_url: image };
      });
  }, [query, tipo, mese, departures, tours, cruises]);

  const handleSearch = useCallback(() => {
    setShowAutocomplete(false);
    setShowResults(true);
  }, []);

  function selectSuggestion(name: string) {
    setQuery(name);
    setShowAutocomplete(false);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-4xl mx-auto px-4" style={{ zIndex: 40 }}>
      {/* Glass bar */}
      <div className="backdrop-blur-md bg-white/15 border border-white/25 rounded-2xl shadow-2xl p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Destination input */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Dove vuoi andare?"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAutocomplete(e.target.value.length >= 2);
                setShowResults(false);
              }}
              onFocus={() => {
                if (query.length >= 2) setShowAutocomplete(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") {
                  setShowAutocomplete(false);
                  setShowResults(false);
                }
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all text-sm md:text-base"
              autoComplete="off"
            />
            {/* Autocomplete dropdown */}
            {showAutocomplete && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 60 }}>
                {suggestions.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      selectSuggestion(dest.name);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-800 text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="size-4 text-[#C41E2F] shrink-0" />
                    {dest.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type select */}
          <div className="relative md:w-44">
            <Ship className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/60 pointer-events-none" />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "tutti" | "tour" | "crociera")}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all appearance-none cursor-pointer text-sm md:text-base [&>option]:text-gray-800 [&>option]:bg-white"
            >
              <option value="tutti">Tutti</option>
              <option value="tour">Tour</option>
              <option value="crociera">Crociera</option>
            </select>
          </div>

          {/* Month select */}
          <div className="relative md:w-52">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/60 pointer-events-none" />
            <select
              value={mese}
              onChange={(e) => setMese(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all appearance-none cursor-pointer text-sm md:text-base [&>option]:text-gray-800 [&>option]:bg-white"
            >
              <option value="">Quando?</option>
              {futureMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold transition-colors shrink-0 cursor-pointer text-sm md:text-base"
          >
            <Search className="size-5" />
            <span>Cerca</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <SearchResultsDropdown results={results} onClose={() => setShowResults(false)} />
      )}
    </div>
  );
}
