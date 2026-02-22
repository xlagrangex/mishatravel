"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapPickerProps {
  value?: string | null; // "lat, lng" format
  onChange: (coordinates: string) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

// ---------------------------------------------------------------------------
// Dynamic import of inner map (ssr: false to avoid Leaflet SSR issues)
// ---------------------------------------------------------------------------

const DynamicMap = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg border bg-muted/50">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <MapPin className="h-8 w-8" />
        <span className="text-sm">Caricamento mappa...</span>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Default coordinates (Rome, Italy)
// ---------------------------------------------------------------------------

const DEFAULT_LAT = 41.9028;
const DEFAULT_LNG = 12.4964;

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MapPicker({ value, onChange }: MapPickerProps) {
  // Parse initial value
  const parseCoordinates = useCallback(
    (val: string | null | undefined): [number, number] => {
      if (!val) return [DEFAULT_LAT, DEFAULT_LNG];
      const parts = val.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
      return [DEFAULT_LAT, DEFAULT_LNG];
    },
    []
  );

  const [position, setPosition] = useState<[number, number]>(() =>
    parseCoordinates(value)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle position change from map interaction
  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;
      setPosition([roundedLat, roundedLng]);
      onChange(`${roundedLat}, ${roundedLng}`);
    },
    [onChange]
  );

  // Geocoding search via Nominatim
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`,
        {
          headers: {
            "Accept-Language": "it",
          },
        }
      );
      const data: NominatimResult[] = await response.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Select a search result
  const handleSelectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      handlePositionChange(lat, lng);
      setSearchQuery(result.display_name.split(",")[0]);
      setShowResults(false);
      setSearchResults([]);
    },
    [handlePositionChange]
  );

  // Handle Enter key in search input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca localita... (es. Roma, Tokyo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Cerca"
            )}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
            <ul className="max-h-48 overflow-auto py-1">
              {searchResults.map((result, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => handleSelectResult(result)}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2">
                      {result.display_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showResults && !isSearching && searchResults.length === 0 && searchQuery.trim() && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-center text-sm text-muted-foreground shadow-lg">
            Nessun risultato trovato
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[300px] w-full overflow-hidden rounded-lg border">
        <DynamicMap
          position={position}
          onPositionChange={handlePositionChange}
        />
      </div>

      {/* Current Coordinates Display */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        Coordinate: {position[0]}, {position[1]}
        <span className="ml-1 text-muted-foreground/60">
          — Clicca o trascina il marker per aggiornare
        </span>
      </p>
    </div>
  );
}
