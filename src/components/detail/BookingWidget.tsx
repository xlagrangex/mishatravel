"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, MapPin, Ship, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TourDepartureInfo {
  id: string;
  from_city: string;
  data_partenza: string;
  prezzo_3_stelle: number | null;
  prezzo_4_stelle: string | null;
}

interface CruiseDepartureInfo {
  id: string;
  from_city: string;
  data_partenza: string;
  prezzo_main_deck: number | null;
  prezzo_middle_deck: string | null;
  prezzo_superior_deck: string | null;
}

interface DeckConfig {
  label: string;
  value: string;
}

interface BookingWidgetBaseProps {
  title: string;
  priceFrom: number | null;
  prezzoSuRichiesta: boolean;
  durataNotti: string | null;
  destinationName: string | null;
  programmaPdfUrl: string | null;
  onRequestQuote: (departureId: string) => void;
}

interface TourBookingWidgetProps extends BookingWidgetBaseProps {
  type: "tour";
  departures: TourDepartureInfo[];
  shipName?: never;
  decks?: never;
}

interface CruiseBookingWidgetProps extends BookingWidgetBaseProps {
  type: "cruise";
  departures: CruiseDepartureInfo[];
  shipName: string | null;
  decks: DeckConfig[];
}

type BookingWidgetProps = TourBookingWidgetProps | CruiseBookingWidgetProps;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPrice(price: number | null): string {
  if (!price) return "Su richiesta";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

function parsePriceStr(val: string | null): number | null {
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
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
    departures,
    type,
    onRequestQuote,
  } = props;

  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [selectedStars, setSelectedStars] = useState("3");
  const [selectedDeck, setSelectedDeck] = useState("main");

  const selectedDeparture = departures.find((d) => d.id === selectedDepartureId);

  const livePrice = useMemo(() => {
    if (!selectedDeparture) return priceFrom;

    if (type === "tour") {
      const dep = selectedDeparture as TourDepartureInfo;
      if (selectedStars === "4") {
        return parsePriceStr(dep.prezzo_4_stelle) ?? dep.prezzo_3_stelle;
      }
      return dep.prezzo_3_stelle;
    } else {
      const dep = selectedDeparture as CruiseDepartureInfo;
      switch (selectedDeck) {
        case "middle": return parsePriceStr(dep.prezzo_middle_deck) ?? dep.prezzo_main_deck;
        case "superior": return parsePriceStr(dep.prezzo_superior_deck) ?? dep.prezzo_main_deck;
        default: return dep.prezzo_main_deck;
      }
    }
  }, [selectedDeparture, selectedStars, selectedDeck, type, priceFrom]);

  const displayPrice = livePrice ?? priceFrom;

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
          {displayPrice ? formatPrice(displayPrice) : (prezzoSuRichiesta ? "Su richiesta" : "N/D")}
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

      {/* Departure select */}
      {departures.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Data di partenza</label>
          <Select value={selectedDepartureId} onValueChange={setSelectedDepartureId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona una data" />
            </SelectTrigger>
            <SelectContent>
              {departures.map((dep) => (
                <SelectItem key={dep.id} value={dep.id}>
                  {formatDate(dep.data_partenza)} - {dep.from_city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stars (tour) or Deck (cruise) */}
      {type === "tour" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Categoria hotel</label>
          <Select value={selectedStars} onValueChange={setSelectedStars}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Hotel 3 stelle</SelectItem>
              <SelectItem value="4">Hotel 4 stelle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "cruise" && props.decks.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Ponte</label>
          <Select value={selectedDeck} onValueChange={setSelectedDeck}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {props.decks.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Live price update */}
      {selectedDeparture && livePrice && (
        <div className="bg-[#C41E2F]/5 border border-[#C41E2F]/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Prezzo selezionato</p>
          <p className="text-2xl font-bold text-[#C41E2F]">{formatPrice(livePrice)}</p>
        </div>
      )}

      {/* CTA */}
      <Button
        className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold"
        size="lg"
        onClick={() => onRequestQuote(selectedDepartureId)}
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
