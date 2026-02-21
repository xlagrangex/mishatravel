// ============================================================
// Filter & Sort Utilities for Tour/Cruise pages
// ============================================================

export type Season = "primavera" | "estate" | "autunno" | "inverno";

export const SEASON_LABELS: Record<Season, string> = {
  primavera: "Primavera (Mar-Mag)",
  estate: "Estate (Giu-Ago)",
  autunno: "Autunno (Set-Nov)",
  inverno: "Inverno (Dic-Feb)",
};

export function getSeason(dateStr: string): Season {
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return "primavera";
  if (month >= 6 && month <= 8) return "estate";
  if (month >= 9 && month <= 11) return "autunno";
  return "inverno";
}

export function parseDurationNights(durataStr: string | null): number {
  if (!durataStr) return 0;
  const nightMatch = durataStr.match(/(\d+)\s*nott/i);
  if (nightMatch) return parseInt(nightMatch[1]);
  const dayMatch = durataStr.match(/(\d+)\s*giorn/i);
  if (dayMatch) return parseInt(dayMatch[1]) - 1;
  const numMatch = durataStr.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]);
  return 0;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDateIT(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

// Check if a duration (nights) falls within a range string like "4-5" or "10+"
export function durationInRange(nights: number, range: string): boolean {
  if (range.endsWith("+")) {
    return nights >= parseInt(range);
  }
  const [min, max] = range.split("-").map(Number);
  return nights >= min && nights <= max;
}

// Get seasons from an array of departure dates
export function getSeasonsFromDepartures(departures: { data_partenza: string }[]): Season[] {
  const seasons = new Set<Season>();
  for (const d of departures) {
    seasons.add(getSeason(d.data_partenza));
  }
  return Array.from(seasons);
}

// Get the next future departure from an array
export function getNextDeparture<T extends { data_partenza: string }>(departures: T[]): T | null {
  const now = new Date().toISOString().slice(0, 10);
  const future = departures
    .filter((d) => d.data_partenza >= now)
    .sort((a, b) => a.data_partenza.localeCompare(b.data_partenza));
  return future[0] ?? null;
}

// Sort comparators
export type SortOption = "prezzo-asc" | "prezzo-desc" | "durata" | "prossima-partenza";

export const SORT_LABELS: Record<SortOption, string> = {
  "prezzo-asc": "Prezzo crescente",
  "prezzo-desc": "Prezzo decrescente",
  durata: "Durata",
  "prossima-partenza": "Prossima partenza",
};
