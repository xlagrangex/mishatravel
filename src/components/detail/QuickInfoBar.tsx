"use client";

import { Clock, MapPin, UtensilsCrossed, CalendarDays, Plane } from "lucide-react";

interface QuickInfoBarProps {
  durataNotti: string | null;
  destinationName: string | null;
  pensione: string[];
  prossimaPartenza: string | null;
  tipoVoli: string | null;
}

function formatPensione(pensione: string[]): string | null {
  if (!pensione || pensione.length === 0) return null;
  const labels: Record<string, string> = {
    completa: "Pensione Completa",
    mezza: "Mezza Pensione",
    no: "Senza Pensione",
  };
  return pensione.map((p) => labels[p] || p).join(", ");
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function QuickInfoBar({
  durataNotti,
  destinationName,
  pensione,
  prossimaPartenza,
  tipoVoli,
}: QuickInfoBarProps) {
  const pensioneLabel = formatPensione(pensione);

  const items = [
    durataNotti ? { icon: Clock, label: durataNotti } : null,
    destinationName ? { icon: MapPin, label: destinationName } : null,
    pensioneLabel ? { icon: UtensilsCrossed, label: pensioneLabel } : null,
    prossimaPartenza ? { icon: CalendarDays, label: `Prossima: ${formatDate(prossimaPartenza)}` } : null,
    tipoVoli ? { icon: Plane, label: tipoVoli } : null,
  ].filter(Boolean) as { icon: typeof Clock; label: string }[];

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <item.icon className="size-4 text-[#1B2D4F]" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
