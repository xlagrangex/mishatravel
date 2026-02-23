"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { MapPin, Phone, Mail, Search, ChevronDown, X, List, Map as MapIcon } from "lucide-react";
import AgencyMap from "@/components/AgencyMap";
import type { AgencyMarker } from "@/components/AgencyMap";
import type { Agency } from "@/lib/types";

// ---------------------------------------------------------------------------
// Italian regions for filter
// ---------------------------------------------------------------------------
const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia",
  "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
];

// Map province codes to regions for grouping
const PROVINCE_TO_REGION: Record<string, string> = {
  AG: "Sicilia", AL: "Piemonte", AN: "Marche", AO: "Valle d'Aosta", AP: "Marche",
  AQ: "Abruzzo", AR: "Toscana", AT: "Piemonte", AV: "Campania", BA: "Puglia",
  BG: "Lombardia", BI: "Piemonte", BL: "Veneto", BN: "Campania", BO: "Emilia-Romagna",
  BR: "Puglia", BS: "Lombardia", BT: "Puglia", BZ: "Trentino-Alto Adige",
  CA: "Sardegna", CB: "Molise", CE: "Campania", CH: "Abruzzo", CL: "Sicilia",
  CN: "Piemonte", CO: "Lombardia", CR: "Lombardia", CS: "Calabria", CT: "Sicilia",
  CZ: "Calabria", EN: "Sicilia", FC: "Emilia-Romagna", FE: "Emilia-Romagna",
  FG: "Puglia", FI: "Toscana", FM: "Marche", FR: "Lazio", GE: "Liguria",
  GO: "Friuli Venezia Giulia", GR: "Toscana", IM: "Liguria", IS: "Molise",
  KR: "Calabria", LC: "Lombardia", LE: "Puglia", LI: "Toscana", LO: "Lombardia",
  LT: "Lazio", LU: "Toscana", MB: "Lombardia", MC: "Marche", ME: "Sicilia",
  MI: "Lombardia", MN: "Lombardia", MO: "Emilia-Romagna", MS: "Toscana",
  MT: "Basilicata", NA: "Campania", NO: "Piemonte", NU: "Sardegna", OR: "Sardegna",
  PA: "Sicilia", PC: "Emilia-Romagna", PD: "Veneto", PE: "Abruzzo", PG: "Umbria",
  PI: "Toscana", PN: "Friuli Venezia Giulia", PO: "Toscana", PR: "Emilia-Romagna",
  PT: "Toscana", PU: "Marche", PV: "Lombardia", PZ: "Basilicata", RA: "Emilia-Romagna",
  RC: "Calabria", RE: "Emilia-Romagna", RG: "Sicilia", RI: "Lazio", RM: "Lazio",
  RN: "Emilia-Romagna", RO: "Veneto", SA: "Campania", SI: "Toscana", SO: "Lombardia",
  SP: "Liguria", SR: "Sicilia", SS: "Sardegna", SU: "Sardegna", SV: "Liguria",
  TA: "Puglia", TE: "Abruzzo", TN: "Trentino-Alto Adige", TO: "Piemonte",
  TP: "Sicilia", TR: "Umbria", TS: "Friuli Venezia Giulia", TV: "Veneto",
  UD: "Friuli Venezia Giulia", VA: "Lombardia", VB: "Piemonte", VC: "Piemonte",
  VE: "Veneto", VI: "Veneto", VR: "Veneto", VT: "Lazio", VV: "Calabria",
};

function getRegionForAgency(agency: Agency): string {
  if (agency.region) return agency.region;
  if (agency.province) {
    const code = agency.province.toUpperCase().trim();
    return PROVINCE_TO_REGION[code] ?? "Altro";
  }
  return "Altro";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TrovaAgenziaClientProps {
  agencies: Agency[];
}

export default function TrovaAgenziaClient({ agencies }: TrovaAgenziaClientProps) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Derive available regions from data
  const availableRegions = useMemo(() => {
    const regionSet = new Set<string>();
    agencies.forEach((a) => {
      const r = getRegionForAgency(a);
      if (r !== "Altro") regionSet.add(r);
    });
    return REGIONS.filter((r) => regionSet.has(r));
  }, [agencies]);

  // Filter
  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      const matchesSearch =
        !search ||
        a.business_name.toLowerCase().includes(search.toLowerCase()) ||
        (a.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.province ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.address ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesRegion = !selectedRegion || getRegionForAgency(a) === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [agencies, search, selectedRegion]);

  // Build markers from filtered agencies with coordinates
  const agencyMarkers: AgencyMarker[] = useMemo(
    () =>
      filtered
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => ({
          id: a.id,
          business_name: a.business_name,
          city: a.city,
          province: a.province,
          phone: a.phone,
          email: a.email,
          address: a.address,
          lat: a.latitude!,
          lng: a.longitude!,
        })),
    [filtered]
  );

  // Count stats
  const totalAgencies = agencies.length;
  const regionsCount = availableRegions.length;

  // Scroll to card when marker is clicked
  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
    const card = cardRefs.current[id];
    if (card && listRef.current) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  // Scroll card into view when selected from map
  useEffect(() => {
    if (selectedId && cardRefs.current[selectedId] && listRef.current) {
      cardRefs.current[selectedId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  return (
    <div className="container mx-auto px-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C41E2F]" />
          <span><strong className="text-[#1B2D4F]">{totalAgencies}</strong> agenzie partner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1B2D4F]" />
          <span><strong className="text-[#1B2D4F]">{regionsCount}</strong> regioni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span><strong className="text-[#1B2D4F]">{agencyMarkers.length}</strong> sulla mappa</span>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per citta, provincia o nome agenzia..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="relative min-w-[200px]">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F] transition-all cursor-pointer"
          >
            <option value="">Tutte le regioni</option>
            {availableRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Active filters */}
      {(search || selectedRegion) && (
        <div className="flex items-center gap-2 mb-4 max-w-3xl mx-auto">
          <span className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "risultato" : "risultati"}
          </span>
          {selectedRegion && (
            <button
              onClick={() => setSelectedRegion("")}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1B2D4F]/10 text-[#1B2D4F] text-xs font-medium hover:bg-[#1B2D4F]/20 transition-colors"
            >
              {selectedRegion}
              <X className="size-3" />
            </button>
          )}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C41E2F]/10 text-[#C41E2F] text-xs font-medium hover:bg-[#C41E2F]/20 transition-colors"
            >
              &ldquo;{search}&rdquo;
              <X className="size-3" />
            </button>
          )}
        </div>
      )}

      {/* Mobile toggle */}
      <div className="flex lg:hidden gap-2 mb-4">
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mobileView === "list"
              ? "bg-[#1B2D4F] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <List className="size-4" />
          Lista ({filtered.length})
        </button>
        <button
          onClick={() => setMobileView("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            mobileView === "map"
              ? "bg-[#1B2D4F] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <MapIcon className="size-4" />
          Mappa ({agencyMarkers.length})
        </button>
      </div>

      {/* Main layout: List + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency List */}
        <div
          ref={listRef}
          className={`space-y-3 lg:max-h-[700px] lg:overflow-y-auto lg:pr-2 custom-scrollbar ${
            mobileView === "map" ? "hidden lg:block" : ""
          }`}
        >
          {filtered.length > 0 ? (
            filtered.map((agency) => (
              <div
                key={agency.id}
                ref={(el) => { cardRefs.current[agency.id] = el; }}
                className={`rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
                  selectedId === agency.id
                    ? "border-[#C41E2F] bg-[#C41E2F]/5 shadow-md ring-1 ring-[#C41E2F]/20"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => {
                  setSelectedId(agency.id);
                  if (window.innerWidth < 1024) setMobileView("map");
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1B2D4F] truncate">
                      {agency.business_name}
                    </h3>
                    <div className="mt-1.5 space-y-1 text-sm text-gray-600">
                      {(agency.address || agency.city) && (
                        <p className="flex items-start gap-2">
                          <MapPin className="size-4 text-[#C41E2F] shrink-0 mt-0.5" />
                          <span>
                            {agency.address && `${agency.address}, `}
                            {agency.zip_code && `${agency.zip_code} `}
                            {agency.city}
                            {agency.province && ` (${agency.province})`}
                          </span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {agency.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="size-3.5 text-gray-400 shrink-0" />
                            <a
                              href={`tel:${agency.phone}`}
                              className="hover:text-[#C41E2F] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {agency.phone}
                            </a>
                          </p>
                        )}
                        {agency.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="size-3.5 text-gray-400 shrink-0" />
                            <a
                              href={`mailto:${agency.email}`}
                              className="hover:text-[#C41E2F] transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {agency.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Region badge */}
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                    {getRegionForAgency(agency)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-gray-50 p-12 text-center">
              <MapPin className="size-12 text-gray-300 mx-auto mb-4" />
              {agencies.length === 0 ? (
                <>
                  <p className="text-gray-500 text-lg font-medium">
                    Nessuna agenzia registrata al momento.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Le agenzie partner appariranno qui non appena saranno attivate.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg font-medium">
                    Nessuna agenzia trovata
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Prova a modificare i filtri di ricerca.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedRegion("");
                    }}
                    className="mt-4 px-4 py-2 text-sm font-medium text-[#C41E2F] border border-[#C41E2F] rounded-full hover:bg-[#C41E2F] hover:text-white transition-colors"
                  >
                    Rimuovi filtri
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div
          className={`h-[400px] lg:h-[700px] rounded-xl overflow-hidden border border-gray-200 lg:sticky lg:top-[140px] ${
            mobileView === "list" ? "hidden lg:block" : ""
          }`}
        >
          <AgencyMap
            agencies={agencyMarkers}
            selectedId={selectedId}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
