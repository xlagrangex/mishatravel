"use client";

import { useCallback, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationSearchResult {
  name: string;
  lat: number;
  lng: number;
}

interface LocationSearchPopoverProps {
  onSelect: (result: LocationSearchResult) => void;
  currentLocationName?: string;
}

export default function LocationSearchPopover({
  onSelect,
  currentLocationName,
}: LocationSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(currentLocationName ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearched(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`,
        { headers: { "Accept-Language": "it" } }
      );
      const data: NominatimResult[] = await response.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleSelectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const name = result.display_name.split(",")[0].trim();
      onSelect({ name, lat, lng });
      setOpen(false);
      setResults([]);
      setSearched(false);
    },
    [onSelect]
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setQuery(currentLocationName ?? "");
      setResults([]);
      setSearched(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Cerca coordinate"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cerca coordinate</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="es. Roma, Tokyo, Tbilisi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cerca"
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <ul className="max-h-60 overflow-auto border rounded-md divide-y">
              {results.map((result, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => handleSelectResult(result)}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <span className="line-clamp-2">{result.display_name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searched && !isSearching && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun risultato trovato per &quot;{query}&quot;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
