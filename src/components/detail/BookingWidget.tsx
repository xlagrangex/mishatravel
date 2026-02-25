"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  MapPin,
  Ship,
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

function extractNights(durata: string | null): number | null {
  if (!durata) return null;
  const pure = parseInt(durata.trim(), 10);
  if (!isNaN(pure) && String(pure) === durata.trim()) return pure;
  const match = durata.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

function formatDuration(durata: string | null): string | null {
  if (!durata) return null;
  const nights = extractNights(durata);
  if (nights !== null) {
    return `${nights + 1} giorni / ${nights} notti`;
  }
  return durata;
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
// Info Row
// ---------------------------------------------------------------------------

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Moon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="shrink-0 rounded-lg bg-gray-100 p-2">
        <Icon className="size-4 text-gray-500" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 leading-snug">{value}</p>
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5 space-y-4">
      {/* Title + Badge */}
      <div>
        <Badge className="mb-1.5 bg-[#C41E2F]/10 text-[#C41E2F] hover:bg-[#C41E2F]/20 text-xs">
          {isTour ? "Tour di Gruppo" : "Crociera di Gruppo"}
        </Badge>
        <h2 className="text-base font-bold text-gray-900 font-[family-name:var(--font-poppins)] leading-snug">
          {title}
        </h2>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 -mx-1">
        <p className="text-xs text-gray-500 mb-0.5">a partire da</p>
        <p className="text-2xl font-bold text-[#C41E2F] leading-tight">
          {priceFrom ? formatPrice(priceFrom) : prezzoSuRichiesta ? "Su richiesta" : "N/D"}
        </p>
        <p className="text-xs text-gray-400">per persona</p>
      </div>

      {/* Info grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {duration && (
          <InfoRow icon={Moon} label="Durata" value={duration} />
        )}
        {destinationName && (
          <InfoRow icon={MapPin} label="Destinazione" value={destinationName} />
        )}
        {!isTour && props.shipName && (
          <InfoRow icon={Ship} label="Nave" value={props.shipName} />
        )}
        {pensioneLabel && (
          <InfoRow icon={UtensilsCrossed} label="Trattamento" value={pensioneLabel} />
        )}
        {tipoVoli && (
          <InfoRow icon={Plane} label="Voli" value={tipoVoli} />
        )}
        {numeroPersone && numeroPersone > 1 && (
          <InfoRow icon={Users} label="Gruppo" value={`Min. ${numeroPersone} persone`} />
        )}
      </div>

      {/* Next departure + count */}
      {(prossimaPartenza || (numDepartures && numDepartures > 0)) && (
        <>
          <Separator />
          <div className="space-y-2">
            {prossimaPartenza && (
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 rounded-lg bg-[#C41E2F]/8 p-2">
                  <CalendarDays className="size-4 text-[#C41E2F]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">Prossima partenza</p>
                  <p className="text-sm font-semibold text-[#C41E2F]">
                    {formatDate(prossimaPartenza)}
                  </p>
                </div>
              </div>
            )}
            {numDepartures !== undefined && numDepartures > 0 && (
              <p className="text-xs text-gray-500 pl-11">
                {numDepartures} {numDepartures === 1 ? "partenza disponibile" : "partenze disponibili"}
              </p>
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
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#C41E2F] transition-colors"
        >
          <FileText className="size-4" />
          Scarica programma PDF
        </a>
      )}

      <p className="text-xs text-gray-400 text-center">
        Contattaci per un preventivo personalizzato
      </p>
    </div>
  );
}
