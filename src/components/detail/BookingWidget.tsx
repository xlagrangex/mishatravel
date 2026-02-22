"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Ship, Download } from "lucide-react";

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
    type,
    onRequestQuote,
  } = props;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-4">
      {/* Title + Badge */}
      <div>
        <Badge className={`mb-2 ${type === "tour" ? "bg-[#C41E2F]/10 text-[#C41E2F] hover:bg-[#C41E2F]/20" : "bg-[#1B2D4F]/10 text-[#1B2D4F] hover:bg-[#1B2D4F]/20"}`}>
          {type === "tour" ? "Tour di Gruppo" : "Crociera di Gruppo"}
        </Badge>
        <h2 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] leading-tight">
          {title}
        </h2>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs text-gray-500">a partire da</p>
        <p className="text-3xl font-bold text-[#C41E2F]">
          {priceFrom ? formatPrice(priceFrom) : (prezzoSuRichiesta ? "Su richiesta" : "N/D")}
        </p>
        <p className="text-xs text-gray-400">per persona</p>
      </div>

      <Separator />

      {/* Quick info */}
      <div className="space-y-2.5 text-sm text-gray-600">
        {durataNotti && (
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[#1B2D4F]" />
            <span>{durataNotti}</span>
          </div>
        )}
        {destinationName && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-[#1B2D4F]" />
            <span>{destinationName}</span>
          </div>
        )}
        {type === "cruise" && props.shipName && (
          <div className="flex items-center gap-2">
            <Ship className="size-4 text-[#1B2D4F]" />
            <span>{props.shipName}</span>
          </div>
        )}
      </div>

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
          <Download className="size-4" />
          Scarica programma PDF
        </a>
      )}

      <p className="text-xs text-gray-400 text-center">
        Contattaci per un preventivo personalizzato
      </p>
    </div>
  );
}
