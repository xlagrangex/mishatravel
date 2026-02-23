"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { parsePrice } from "@/lib/utils";
import HeroSearchBar from "@/components/search/HeroSearchBar";
import RiverNavigation from "@/components/navigation/RiverNavigation";
import FilterSidebar, { type FilterGroup } from "@/components/filters/FilterSidebar";
import FilterChips from "@/components/filters/FilterChips";
import SortDropdown from "@/components/filters/SortDropdown";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import CruiseResultCard from "@/components/cards/CruiseResultCard";
import FleetStrip from "@/components/shared/FleetStrip";
import DepartureTimeline from "@/components/shared/DepartureTimeline";
import FAQSection from "@/components/shared/FAQSection";
import {
  getSeason,
  parseDurationNights,
  durationInRange,
  getNextDeparture,
  type SortOption,
  type Season,
  SEASON_LABELS,
} from "@/lib/filters";
import type { CruiseListItemEnriched } from "@/lib/supabase/queries/cruises";

// River → countries mapping
const RIVER_COUNTRIES: Record<string, string> = {
  Danubio: "Austria, Ungheria, Slovacchia, Germania",
  Douro: "Portogallo, Spagna",
  Reno: "Germania, Francia, Paesi Bassi",
  Senna: "Francia",
  Mosella: "Germania, Lussemburgo",
  Schelda: "Belgio, Paesi Bassi",
};

const CRUISE_FAQ = [
  { question: "Cosa e incluso nel prezzo della crociera?", answer: "Il prezzo include la cabina, pensione completa a bordo (colazione, pranzo, cena), escursioni guidate in italiano come da programma, tasse portuali e assicurazione base. I voli e i trasferimenti possono essere inclusi o opzionali a seconda dell'itinerario." },
  { question: "Serve il passaporto per le crociere fluviali?", answer: "Per le crociere in Europa e sufficiente la carta d'identita valida per l'espatrio per i cittadini italiani. Per destinazioni extra-UE verificate i requisiti specifici al momento della prenotazione." },
  { question: "Come funziona l'imbarco?", answer: "L'imbarco avviene nel pomeriggio del primo giorno nel porto di partenza indicato nel programma. Il nostro accompagnatore vi accogliera al punto di ritrovo per guidarvi sulla nave." },
  { question: "Posso scegliere la cabina?", answer: "Si, al momento della prenotazione potete indicare la vostra preferenza. Le cabine sono disponibili su diversi ponti (main deck, middle deck, superior deck) con relative differenze di prezzo e vista." },
  { question: "Qual e la dimensione delle navi?", answer: "Le nostre navi fluviali sono boutique, con un massimo di 80-180 passeggeri. Questo garantisce un'atmosfera intima e un servizio personalizzato, molto diverso dalle grandi navi da crociera oceaniche." },
];

interface CrocierePageClientProps {
  cruises: CruiseListItemEnriched[];
  ships: { slug: string; name: string; image: string }[];
  destinations: { name: string; image: string }[];
}

type FilterState = {
  rivers: string[];
  seasons: Season[];
  exactDate: string | null;
  durations: string[];
  priceRange: [number, number];
  ship: string[];
  availabilityOnly: boolean;
  sortBy: SortOption;
};

export default function CrocierePageClient({ cruises, ships, destinations }: CrocierePageClientProps) {
  // Price bounds
  const priceBounds = useMemo(() => {
    const prices = cruises.map((c) => parsePrice(c.a_partire_da)).filter((p) => p > 0);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 10000) };
  }, [cruises]);

  const [filters, setFilters] = useState<FilterState>({
    rivers: [],
    seasons: [],
    exactDate: null,
    durations: [],
    priceRange: [priceBounds.min, priceBounds.max],
    ship: [],
    availabilityOnly: false,
    sortBy: "prezzo-asc",
  });

  // Build river info from destinations + cruises
  const riverInfos = useMemo(() => {
    return destinations.map((dest) => {
      const riverCruises = cruises.filter((c) => c.destination_name === dest.name);
      const prices = riverCruises.map((c) => parsePrice(c.a_partire_da)).filter((p) => p > 0);
      return {
        name: dest.name,
        image: dest.image,
        cruiseCount: riverCruises.length,
        priceFrom: prices.length > 0 ? Math.min(...prices) : null,
        countries: RIVER_COUNTRIES[dest.name] || "",
      };
    }).filter((r) => r.cruiseCount > 0 || destinations.some((d) => d.name === r.name));
  }, [cruises, destinations]);

  // Location options for hero search
  const locationOptions = useMemo(
    () => destinations.map((d) => ({ value: d.name, label: d.name })),
    [destinations],
  );

  // Ship filter options
  const shipOptions = useMemo(() => {
    const names = new Set(cruises.map((c) => c.ship_name).filter(Boolean));
    return Array.from(names).map((n) => ({ value: n!, label: n!, count: cruises.filter((c) => c.ship_name === n).length }));
  }, [cruises]);

  // Filtered results
  const filteredCruises = useMemo(() => {
    let result = [...cruises];

    // River filter
    if (filters.rivers.length > 0) {
      result = result.filter((c) => filters.rivers.includes(c.destination_name ?? ""));
    }

    // Season filter
    if (filters.seasons.length > 0) {
      result = result.filter((c) => {
        const seasons = c.departures.map((d) => getSeason(d.data_partenza));
        return filters.seasons.some((s) => seasons.includes(s));
      });
    }

    // Exact date filter (match departures in same month)
    if (filters.exactDate) {
      const targetMonth = filters.exactDate.slice(0, 7); // "YYYY-MM"
      result = result.filter((c) =>
        c.departures.some((d) => d.data_partenza.startsWith(targetMonth))
      );
    }

    // Duration filter
    if (filters.durations.length > 0) {
      result = result.filter((c) => {
        const nights = parseDurationNights(c.durata_notti);
        return filters.durations.some((range) => durationInRange(nights, range));
      });
    }

    // Price filter (always include "prezzo su richiesta" cruises)
    result = result.filter((c) => {
      if (c.prezzo_su_richiesta) return true;
      const price = parsePrice(c.a_partire_da);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Ship filter
    if (filters.ship.length > 0) {
      result = result.filter((c) => filters.ship.includes(c.ship_name ?? ""));
    }

    // Availability
    if (filters.availabilityOnly) {
      const now = new Date().toISOString().slice(0, 10);
      result = result.filter((c) => c.departures.some((d) => d.data_partenza >= now));
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
  }, [cruises, filters]);

  // Upcoming departures for timeline
  const upcomingDepartures = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return cruises
      .flatMap((c) =>
        c.departures
          .filter((d) => d.data_partenza >= now)
          .map((d) => ({
            title: c.title,
            slug: c.slug,
            basePath: "/crociere",
            type: "crociera" as const,
            date: d.data_partenza,
            destination: c.destination_name ?? "",
            duration: c.durata_notti ?? "",
            price: d.prezzo_main_deck ?? parsePrice(c.a_partire_da),
          })),
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [cruises]);

  // Filter groups for sidebar
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      key: "rivers",
      label: "Fiume",
      type: "checkbox" as const,
      options: riverInfos.map((r) => ({ value: r.name, label: r.name, count: r.cruiseCount })),
    },
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
        { value: "4-5", label: "4-5 notti" },
        { value: "7-8", label: "7-8 notti" },
        { value: "10+", label: "10+ notti" },
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
    ...(shipOptions.length > 1
      ? [{
          key: "ship",
          label: "Nave",
          type: "checkbox" as const,
          options: shipOptions,
        }]
      : []),
    {
      key: "availabilityOnly",
      label: "Disponibilita",
      type: "toggle" as const,
    },
  ], [riverInfos, priceBounds, shipOptions]);

  // Filter state for sidebar (cast to expected type)
  const sidebarState: Record<string, string[] | [number, number] | boolean> = {
    rivers: filters.rivers,
    seasons: filters.seasons,
    durations: filters.durations,
    priceRange: filters.priceRange,
    ship: filters.ship,
    availabilityOnly: filters.availabilityOnly,
  };

  const handleFilterChange = useCallback((key: string, value: string[] | [number, number] | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      rivers: [],
      seasons: [],
      exactDate: null,
      durations: [],
      priceRange: [priceBounds.min, priceBounds.max],
      ship: [],
      availabilityOnly: false,
      sortBy: "prezzo-asc",
    });
  }, [priceBounds]);

  const handleHeroSearch = useCallback((query: { dove: string; quando: string; durata: string }) => {
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(query.quando);
    setFilters((prev) => ({
      ...prev,
      rivers: query.dove ? [query.dove] : [],
      seasons: isDate ? [] : query.quando ? [query.quando as Season] : [],
      exactDate: isDate ? query.quando : null,
      durations: query.durata ? [query.durata] : [],
    }));
    // Scroll to results
    document.getElementById("cruise-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleRiverSelect = useCallback((river: string) => {
    setFilters((prev) => ({
      ...prev,
      rivers: river ? [river] : [],
    }));
    document.getElementById("cruise-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Active filter chips
  const chips = useMemo(() => {
    const c: { key: string; label: string; value: string }[] = [];
    filters.rivers.forEach((r) => c.push({ key: "rivers", label: r, value: r }));
    filters.seasons.forEach((s) => c.push({ key: "seasons", label: SEASON_LABELS[s], value: s }));
    if (filters.exactDate) {
      const d = new Date(filters.exactDate + "T00:00:00");
      const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
      c.push({ key: "exactDate", label: label.charAt(0).toUpperCase() + label.slice(1), value: filters.exactDate });
    }
    filters.durations.forEach((d) => c.push({ key: "durations", label: d + " notti", value: d }));
    filters.ship.forEach((s) => c.push({ key: "ship", label: s, value: s }));
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
          src="https://images.unsplash.com/photo-1676037073075-914d753b3afb?w=1600&h=800&fit=crop"
          alt="Crociera fluviale"
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
              <span className="text-white/90">Crociere Fluviali</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-poppins)] mb-3">
              Naviga i grandi fiumi d'Europa
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-2xl">
              Crociere da 4 a 11 notti lungo Danubio, Douro, Reno, Senna e altri itinerari esclusivi.
              Navi boutique, pensione completa e accompagnatore italiano.
            </p>
            <HeroSearchBar
              variant="cruise"
              locationOptions={locationOptions}
              onSearch={handleHeroSearch}
            />
          </div>
        </div>
      </section>

      {/* River Navigation */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-6">
            Scegli il tuo fiume
          </h2>
          <RiverNavigation
            rivers={riverInfos}
            selectedRiver={filters.rivers.length === 1 ? filters.rivers[0] : null}
            onSelect={handleRiverSelect}
          />
        </div>
      </section>

      {/* Filters + Results */}
      <section id="cruise-results" className="py-10 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Sidebar - desktop */}
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
              {/* Controls bar */}
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
                    <strong className="text-gray-900">{filteredCruises.length}</strong>{" "}
                    {filteredCruises.length === 1 ? "crociera trovata" : "crociere trovate"}
                  </p>
                </div>
                <SortDropdown value={filters.sortBy} onChange={(v) => setFilters((p) => ({ ...p, sortBy: v }))} />
              </div>

              {/* Active chips */}
              <div className="mb-4">
                <FilterChips chips={chips} onRemove={handleChipRemove} onClearAll={handleReset} />
              </div>

              {/* Results grid */}
              {filteredCruises.length > 0 ? (
                <div className="space-y-4">
                  {filteredCruises.map((cruise) => (
                    <CruiseResultCard
                      key={cruise.id}
                      slug={cruise.slug}
                      title={cruise.title}
                      shipName={cruise.ship_name ?? ""}
                      river={cruise.destination_name ?? ""}
                      duration={cruise.durata_notti ?? ""}
                      priceFrom={parsePrice(cruise.a_partire_da)}
                      prezzoSuRichiesta={cruise.prezzo_su_richiesta}
                      image={cruise.cover_image_url || "/images/placeholder.jpg"}
                      departures={cruise.departures}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                  <p className="text-gray-500 text-lg">Nessuna crociera trovata con i filtri selezionati.</p>
                  <button onClick={handleReset} className="text-[#C41E2F] hover:underline mt-2 text-sm">
                    Rimuovi tutti i filtri
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Strip */}
      <FleetStrip ships={ships} />

      {/* Departure Timeline */}
      <DepartureTimeline departures={upcomingDepartures} title="Prossime partenze crociere" />

      {/* FAQ */}
      <FAQSection items={CRUISE_FAQ} title="Domande frequenti sulle crociere" />

      {/* Quiz CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <div className="size-12 rounded-full bg-[#C41E2F]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="size-6 text-[#C41E2F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-3">
              Non sai quale crociera scegliere?
            </h2>
            <p className="text-gray-500 mb-6">
              Rispondi a 4 domande e ti suggeriremo la crociera perfetta per te.
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
