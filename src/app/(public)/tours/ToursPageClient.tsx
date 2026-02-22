"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { parsePrice } from "@/lib/utils";
import HeroSearchBar from "@/components/search/HeroSearchBar";
import MacroAreaNavigation from "@/components/navigation/MacroAreaNavigation";
import FilterSidebar, { type FilterGroup } from "@/components/filters/FilterSidebar";
import FilterChips from "@/components/filters/FilterChips";
import SortDropdown from "@/components/filters/SortDropdown";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import TourResultCard from "@/components/cards/TourResultCard";
import DepartureTimeline from "@/components/shared/DepartureTimeline";
import TrustSection from "@/components/shared/TrustSection";
import {
  getSeason,
  parseDurationNights,
  durationInRange,
  getNextDeparture,
  type SortOption,
  type Season,
  SEASON_LABELS,
} from "@/lib/filters";
import type { TourListItemEnriched } from "@/lib/supabase/queries/tours";

const MACRO_AREAS = ["Europa", "America Latina", "Asia/Russia", "Africa"] as const;

interface ToursPageClientProps {
  tours: TourListItemEnriched[];
  destinations: { name: string; slug: string; macroArea: string }[];
}

type FilterState = {
  macroAreas: string[];
  destinations: string[];
  seasons: Season[];
  exactDate: string | null;
  durations: string[];
  priceRange: [number, number];
  availabilityOnly: boolean;
  sortBy: SortOption;
};

export default function ToursPageClient({ tours, destinations }: ToursPageClientProps) {
  const priceBounds = useMemo(() => {
    const prices = tours.map((t) => parsePrice(t.a_partire_da)).filter((p) => p > 0);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 10000) };
  }, [tours]);

  const [filters, setFilters] = useState<FilterState>({
    macroAreas: [],
    destinations: [],
    seasons: [],
    exactDate: null,
    durations: [],
    priceRange: [priceBounds.min, priceBounds.max],
    availabilityOnly: false,
    sortBy: "prezzo-asc",
  });

  // Macro area infos
  const areaInfos = useMemo(() => {
    return MACRO_AREAS.map((area) => ({
      name: area,
      image: "",
      tourCount: tours.filter((t) => t.destination_macro_area === area).length,
    })).filter((a) => a.tourCount > 0 || MACRO_AREAS.includes(a.name as typeof MACRO_AREAS[number]));
  }, [tours]);

  // Location options for hero search (macro areas)
  const locationOptions = useMemo(
    () => MACRO_AREAS.map((a) => ({ value: a, label: a })),
    [],
  );

  // Destination options (filtered by selected macro areas)
  const destOptions = useMemo(() => {
    const filtered = filters.macroAreas.length > 0
      ? destinations.filter((d) => filters.macroAreas.includes(d.macroArea))
      : destinations;
    return filtered
      .filter((d) => d.macroArea !== "Percorsi Fluviali")
      .map((d) => ({
        value: d.name,
        label: d.name,
        count: tours.filter((t) => t.destination_name === d.name).length,
      }))
      .filter((d) => d.count > 0);
  }, [destinations, tours, filters.macroAreas]);

  // Filtered results
  const filteredTours = useMemo(() => {
    let result = [...tours];

    // Macro area filter
    if (filters.macroAreas.length > 0) {
      result = result.filter((t) => filters.macroAreas.includes(t.destination_macro_area ?? ""));
    }

    // Destination filter
    if (filters.destinations.length > 0) {
      result = result.filter((t) => filters.destinations.includes(t.destination_name ?? ""));
    }

    // Season filter
    if (filters.seasons.length > 0) {
      result = result.filter((t) => {
        const seasons = t.departures.map((d) => getSeason(d.data_partenza));
        return filters.seasons.some((s) => seasons.includes(s));
      });
    }

    // Exact date filter (match departures in same month)
    if (filters.exactDate) {
      const targetMonth = filters.exactDate.slice(0, 7); // "YYYY-MM"
      result = result.filter((t) =>
        t.departures.some((d) => d.data_partenza.startsWith(targetMonth))
      );
    }

    // Duration filter
    if (filters.durations.length > 0) {
      result = result.filter((t) => {
        const nights = parseDurationNights(t.durata_notti);
        return filters.durations.some((range) => durationInRange(nights, range));
      });
    }

    // Price filter (always include "prezzo su richiesta" tours)
    result = result.filter((t) => {
      if (t.prezzo_su_richiesta) return true;
      const price = parsePrice(t.a_partire_da);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Availability
    if (filters.availabilityOnly) {
      const now = new Date().toISOString().slice(0, 10);
      result = result.filter((t) => t.departures.some((d) => d.data_partenza >= now));
    }

    // Sort
    result.sort((a, b) => {
      const priceA = parsePrice(a.a_partire_da);
      const priceB = parsePrice(b.a_partire_da);
      switch (filters.sortBy) {
        case "prezzo-asc": return priceA - priceB;
        case "prezzo-desc": return priceB - priceA;
        case "durata": return parseDurationNights(a.durata_notti) - parseDurationNights(b.durata_notti);
        case "prossima-partenza": {
          const dA = getNextDeparture(a.departures)?.data_partenza ?? "9999";
          const dB = getNextDeparture(b.departures)?.data_partenza ?? "9999";
          return dA.localeCompare(dB);
        }
        default: return 0;
      }
    });

    return result;
  }, [tours, filters]);

  // Upcoming departures
  const upcomingDepartures = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return tours
      .flatMap((t) =>
        t.departures
          .filter((d) => d.data_partenza >= now)
          .map((d) => ({
            title: t.title,
            slug: t.slug,
            basePath: "/tours",
            type: "tour" as const,
            date: d.data_partenza,
            destination: t.destination_name ?? "",
            duration: t.durata_notti ?? "",
            price: d.prezzo_3_stelle ?? parsePrice(t.a_partire_da),
          })),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [tours]);

  // Filter groups
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      key: "macroAreas",
      label: "Macro Area",
      type: "checkbox" as const,
      options: MACRO_AREAS.map((a) => ({
        value: a,
        label: a,
        count: tours.filter((t) => t.destination_macro_area === a).length,
      })),
    },
    ...(destOptions.length > 0
      ? [{
          key: "destinations",
          label: "Destinazione",
          type: "checkbox" as const,
          options: destOptions,
        }]
      : []),
    {
      key: "seasons",
      label: "Periodo",
      type: "checkbox" as const,
      options: (["primavera", "estate", "autunno", "inverno"] as Season[]).map((s) => ({
        value: s,
        label: SEASON_LABELS[s],
      })),
    },
    {
      key: "durations",
      label: "Durata",
      type: "checkbox" as const,
      options: [
        { value: "5-7", label: "5-7 giorni" },
        { value: "8-12", label: "8-12 giorni" },
        { value: "13+", label: "13+ giorni" },
      ],
    },
    {
      key: "priceRange",
      label: "Budget",
      type: "range" as const,
      rangeMin: priceBounds.min,
      rangeMax: priceBounds.max,
      rangeStep: 100,
    },
    {
      key: "availabilityOnly",
      label: "Disponibilita",
      type: "toggle" as const,
    },
  ], [tours, destOptions, priceBounds]);

  const sidebarState: Record<string, string[] | [number, number] | boolean> = {
    macroAreas: filters.macroAreas,
    destinations: filters.destinations,
    seasons: filters.seasons,
    durations: filters.durations,
    priceRange: filters.priceRange,
    availabilityOnly: filters.availabilityOnly,
  };

  const handleFilterChange = useCallback((key: string, value: string[] | [number, number] | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      macroAreas: [],
      destinations: [],
      seasons: [],
      exactDate: null,
      durations: [],
      priceRange: [priceBounds.min, priceBounds.max],
      availabilityOnly: false,
      sortBy: "prezzo-asc",
    });
  }, [priceBounds]);

  const handleHeroSearch = useCallback((query: { dove: string; quando: string; durata: string }) => {
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(query.quando);
    setFilters((prev) => ({
      ...prev,
      macroAreas: query.dove ? [query.dove] : [],
      seasons: isDate ? [] : query.quando ? [query.quando as Season] : [],
      exactDate: isDate ? query.quando : null,
      durations: query.durata ? [query.durata] : [],
    }));
    document.getElementById("tour-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleAreaSelect = useCallback((area: string) => {
    setFilters((prev) => ({
      ...prev,
      macroAreas: area ? [area] : [],
      destinations: [], // Reset destinations when area changes
    }));
    document.getElementById("tour-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Chips
  const chips = useMemo(() => {
    const c: { key: string; label: string; value: string }[] = [];
    filters.macroAreas.forEach((a) => c.push({ key: "macroAreas", label: a, value: a }));
    filters.destinations.forEach((d) => c.push({ key: "destinations", label: d, value: d }));
    filters.seasons.forEach((s) => c.push({ key: "seasons", label: SEASON_LABELS[s], value: s }));
    if (filters.exactDate) {
      const d = new Date(filters.exactDate + "T00:00:00");
      const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
      c.push({ key: "exactDate", label: label.charAt(0).toUpperCase() + label.slice(1), value: filters.exactDate });
    }
    filters.durations.forEach((d) => c.push({ key: "durations", label: d + " giorni", value: d }));
    return c;
  }, [filters]);

  const handleChipRemove = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (key === "exactDate") {
        return { ...prev, exactDate: null };
      }
      const arr = prev[key as keyof FilterState];
      if (Array.isArray(arr) && typeof arr[0] === "string") {
        return { ...prev, [key]: (arr as string[]).filter((v) => v !== value) };
      }
      return prev;
    });
  }, []);

  const activeFilterCount = chips.length + (filters.availabilityOnly ? 1 : 0);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[420px] md:min-h-[480px] flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=800&fit=crop"
          alt="Tour culturali"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="relative z-10 w-full pb-8 pt-32">
          <div className="container mx-auto px-4">
            <nav className="mb-4 text-sm text-white/60">
              <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/90">I Nostri Tour</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-poppins)] mb-3">
              Tour culturali nel mondo
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-2xl">
              Grandi itinerari con accompagnatore italiano, hotel selezionati e esperienze autentiche
              in Europa, Asia, America Latina e Africa.
            </p>
            <HeroSearchBar
              variant="tour"
              locationOptions={locationOptions}
              onSearch={handleHeroSearch}
            />
          </div>
        </div>
      </section>

      {/* Macro Area Navigation */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-6">
            Esplora per macro area
          </h2>
          <MacroAreaNavigation
            areas={areaInfos}
            selectedArea={filters.macroAreas.length === 1 ? filters.macroAreas[0] : null}
            onSelect={handleAreaSelect}
          />
        </div>
      </section>

      {/* Filters + Results */}
      <section id="tour-results" className="py-10 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterSidebar
                groups={filterGroups}
                state={sidebarState}
                onChange={handleFilterChange}
                onReset={handleReset}
                className="sticky top-24 bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              />
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <MobileFilterSheet
                    groups={filterGroups}
                    state={sidebarState}
                    onChange={handleFilterChange}
                    onReset={handleReset}
                    activeCount={activeFilterCount}
                  />
                  <p className="text-sm text-gray-500">
                    <strong className="text-gray-900">{filteredTours.length}</strong>{" "}
                    {filteredTours.length === 1 ? "tour trovato" : "tour trovati"}
                  </p>
                </div>
                <SortDropdown value={filters.sortBy} onChange={(v) => setFilters((p) => ({ ...p, sortBy: v }))} />
              </div>

              <div className="mb-4">
                <FilterChips chips={chips} onRemove={handleChipRemove} onClearAll={handleReset} />
              </div>

              {filteredTours.length > 0 ? (
                <div className="space-y-4">
                  {filteredTours.map((tour) => (
                    <TourResultCard
                      key={tour.id}
                      slug={tour.slug}
                      title={tour.title}
                      destination={tour.destination_name ?? ""}
                      duration={tour.durata_notti ?? ""}
                      priceFrom={parsePrice(tour.a_partire_da)}
                      prezzoSuRichiesta={tour.prezzo_su_richiesta}
                      image={tour.cover_image_url || "/images/placeholder.jpg"}
                      departures={tour.departures}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                  <p className="text-gray-500 text-lg">Nessun tour trovato con i filtri selezionati.</p>
                  <button onClick={handleReset} className="text-[#C41E2F] hover:underline mt-2 text-sm">
                    Rimuovi tutti i filtri
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Departure Timeline */}
      <DepartureTimeline departures={upcomingDepartures} title="Prossime partenze tour" />

      {/* Trust Section */}
      <TrustSection />

      {/* Quiz CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <div className="size-12 rounded-full bg-[#C41E2F]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="size-6 text-[#C41E2F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-3">
              Non sai quale tour scegliere?
            </h2>
            <p className="text-gray-500 mb-6">
              Rispondi a 4 domande e ti suggeriremo il viaggio perfetto per te.
            </p>
            <Link
              href="/contatti"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="size-4" />
              Aiutami a scegliere
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
