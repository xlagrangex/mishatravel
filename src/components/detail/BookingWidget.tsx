"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  Sun,
  MapPin,
  Ship,
  Download,
  UtensilsCrossed,
  Plane,
  CalendarDays,
  Users,
  FileText,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingWidgetBaseProps {
  title: string;
  priceFrom: number | null;
  prezzoSuRichiesta: boolean;
  durataNotti: string | null;
  destinationName: string | null;
  programmaPdfUrl: string | null;
  pensione?: string[];
  tipoVoli?: string | null;
  prossimaPartenza?: string | null;
  numDepartures?: number;
  numeroPersone?: number | null;
  onRequestQuote: () => void;
}

interface TourBookingWidgetProps extends BookingWidgetBaseProps {
  type: "tour";
  shipName?: never;
}

interface CruiseBookingWidgetProps extends BookingWidgetBaseProps {
  type: "cruise";
  shipName: string | null;
}

type BookingWidgetProps = TourBookingWidgetProps | CruiseBookingWidgetProps;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number | null): string {
  if (!price) return "Su richiesta";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

/** Extract the numeric nights from durata_notti (e.g. "7", "Partenze: Sabato - 7" → 7) */
function extractNights(durata: string | null): number | null {
  if (!durata) return null;
  // Try pure number first
  const pure = parseInt(durata.trim(), 10);
  if (!isNaN(pure) && String(pure) === durata.trim()) return pure;
  // Try to find a number at the end after " - "
  const match = durata.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

function formatDuration(durata: string | null): { primary: string; secondary?: string } | null {
  if (!durata) return null;
  const nights = extractNights(durata);
  if (nights !== null) {
    const days = nights + 1;
    return {
      primary: `${days} giorni / ${nights} notti`,
    };
  }
  // Fallback: return as-is if we can't parse
  return { primary: durata };
}

function formatPensione(pensione?: string[]): string | null {
  if (!pensione || pensione.length === 0) return null;
  const labels: Record<string, string> = {
    completa: "Pensione Completa",
    mezza: "Mezza Pensione",
    no: "Solo pernottamento",
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

// ---------------------------------------------------------------------------
// Info Tile
// ---------------------------------------------------------------------------

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Moon;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <div
        className="shrink-0 rounded-lg p-1.5"
        style={{ backgroundColor: accent ? `${accent}12` : "#1B2D4F12" }}
      >
        <Icon className="size-3.5" style={{ color: accent || "#1B2D4F" }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-700 leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookingWidget(props: BookingWidgetProps) {
  const {
    title,
    priceFrom,
    prezzoSuRichiesta,
    durataNotti,
    destinationName,
    programmaPdfUrl,
    pensione,
    tipoVoli,
    prossimaPartenza,
    numDepartures,
    numeroPersone,
    type,
    onRequestQuote,
  } = props;

  const duration = formatDuration(durataNotti);
  const pensioneLabel = formatPensione(pensione);
  const isTour = type === "tour";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5 space-y-3.5">
      {/* Title + Badge */}
      <div>
        <Badge
          className={`mb-1.5 text-[11px] ${
            isTour
              ? "bg-[#C41E2F]/10 text-[#C41E2F] hover:bg-[#C41E2F]/20"
              : "bg-[#1B2D4F]/10 text-[#1B2D4F] hover:bg-[#1B2D4F]/20"
          }`}
        >
          {isTour ? "Tour di Gruppo" : "Crociera di Gruppo"}
        </Badge>
        <h2 className="text-base font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] leading-snug">
          {title}
        </h2>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 -mx-1">
        <p className="text-[11px] text-gray-500 mb-0.5">a partire da</p>
        <p className="text-2xl font-bold text-[#C41E2F] leading-tight">
          {priceFrom ? formatPrice(priceFrom) : prezzoSuRichiesta ? "Su richiesta" : "N/D"}
        </p>
        <p className="text-[11px] text-gray-400">per persona</p>
      </div>

      {/* Info grid - 2 columns */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {duration && (
          <InfoTile
            icon={Moon}
            label="Durata"
            value={duration.primary}
            accent="#6366F1"
          />
        )}
        {destinationName && (
          <InfoTile
            icon={MapPin}
            label="Destinazione"
            value={destinationName}
            accent="#C41E2F"
          />
        )}
        {!isTour && props.shipName && (
          <InfoTile
            icon={Ship}
            label="Nave"
            value={props.shipName}
            accent="#1B2D4F"
          />
        )}
        {pensioneLabel && (
          <InfoTile
            icon={UtensilsCrossed}
            label="Trattamento"
            value={pensioneLabel}
            accent="#F59E0B"
          />
        )}
        {tipoVoli && (
          <InfoTile
            icon={Plane}
            label="Voli"
            value={tipoVoli}
            accent="#0EA5E9"
          />
        )}
        {numeroPersone && numeroPersone > 1 && (
          <InfoTile
            icon={Users}
            label="Gruppo"
            value={`Min. ${numeroPersone} persone`}
            accent="#8B5CF6"
          />
        )}
      </div>

      {/* Next departure + count */}
      {(prossimaPartenza || (numDepartures && numDepartures > 0)) && (
        <>
          <Separator />
          <div className="space-y-1.5">
            {prossimaPartenza && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-green-600 shrink-0" />
                <span className="text-gray-600">
                  Prossima partenza:{" "}
                  <span className="font-semibold text-green-700">
                    {formatDate(prossimaPartenza)}
                  </span>
                </span>
              </div>
            )}
            {numDepartures !== undefined && numDepartures > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Sun className="size-4 text-amber-500 shrink-0" />
                <span className="text-gray-600">
                  {numDepartures} {numDepartures === 1 ? "partenza disponibile" : "partenze disponibili"}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* CTA */}
      <Button
        className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold"
        size="lg"
        onClick={onRequestQuote}
      >
        Richiedi Preventivo
      </Button>

      {/* PDF */}
      {programmaPdfUrl && (
        <a
          href={programmaPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-[#1B2D4F] hover:text-[#C41E2F] transition-colors"
        >
          <FileText className="size-4" />
          Scarica programma PDF
        </a>
      )}

      <p className="text-[11px] text-gray-400 text-center">
        Contattaci per un preventivo personalizzato
      </p>
    </div>
  );
}
