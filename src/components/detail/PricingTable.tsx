"use client";

import { Button } from "@/components/ui/button";
import type { ShipCabinDetail, ShipDeck, CruiseDeparturePrice } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TourDepartureRow {
  id: string;
  from_city: string;
  data_partenza: string;
  prezzo_3_stelle: number | null;
  prezzo_4_stelle: string | null;
}

interface CruiseDepartureRow {
  id: string;
  from_city: string;
  data_partenza: string;
}

interface TourPricingTableProps {
  type: "tour";
  departures: TourDepartureRow[];
  onRequestQuote: (departureId: string) => void;
  cabins?: never;
  shipDecks?: never;
  departurePrices?: never;
}

interface CruisePricingTableProps {
  type: "cruise";
  departures: CruiseDepartureRow[];
  onRequestQuote: (departureId: string) => void;
  cabins: ShipCabinDetail[];
  shipDecks: ShipDeck[];
  departurePrices: CruiseDeparturePrice[];
}

type PricingTableProps = TourPricingTableProps | CruisePricingTableProps;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function fmtPrice(price: number | string | null): string {
  if (!price && price !== 0) return "\u2014";
  const num = typeof price === "string" ? parseFloat(price.replace(",", ".")) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(num);
}

/** Get short cabin label: removes deck name from cabin title if present */
function shortCabinLabel(cabin: ShipCabinDetail, deck: ShipDeck | undefined): string {
  if (!deck) return cabin.titolo;
  // If cabin title contains the deck name, show just the distinctive part
  const deckName = deck.nome.toLowerCase();
  const title = cabin.titolo.toLowerCase();
  if (title.includes(deckName)) {
    const cleaned = cabin.titolo.replace(new RegExp(deck.nome, "i"), "").trim();
    return cleaned || cabin.titolo;
  }
  return cabin.titolo;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PricingTable(props: PricingTableProps) {
  const { type, departures, onRequestQuote } = props;

  if (departures.length === 0) {
    return <p className="text-gray-500">Nessuna partenza programmata al momento.</p>;
  }

  // For cruises, build cabin columns ordered by deck
  const cabinColumns: { cabin: ShipCabinDetail; deck: ShipDeck | undefined }[] = [];
  if (type === "cruise") {
    const { cabins, shipDecks } = props;
    const deckMap = new Map(shipDecks.map((d) => [d.id, d]));
    for (const cabin of cabins) {
      cabinColumns.push({ cabin, deck: cabin.deck_id ? deckMap.get(cabin.deck_id) : undefined });
    }
  }

  // For cruises, build a lookup: departure_id -> cabin_id -> prezzo
  const priceMap = new Map<string, Map<string, string | null>>();
  if (type === "cruise") {
    for (const dp of props.departurePrices) {
      if (!priceMap.has(dp.departure_id)) priceMap.set(dp.departure_id, new Map());
      priceMap.get(dp.departure_id)!.set(dp.cabin_id, dp.prezzo);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Partenza da</th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
            {type === "tour" ? (
              <>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">3 Stelle</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">4 Stelle</th>
              </>
            ) : (
              cabinColumns.map(({ cabin, deck }) => (
                <th key={cabin.id} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div>{shortCabinLabel(cabin, deck)}</div>
                  {deck && (
                    <div className="font-normal text-[10px] text-gray-400 normal-case">{deck.nome}</div>
                  )}
                </th>
              ))
            )}
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {departures.map((dep, i) => (
            <tr key={dep.id || i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <td className="py-3.5 px-4 text-sm text-gray-700">{dep.from_city}</td>
              <td className="py-3.5 px-4 text-sm text-gray-700">{formatDate(dep.data_partenza)}</td>
              {type === "tour" ? (
                <>
                  <td className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                    {fmtPrice((dep as TourDepartureRow).prezzo_3_stelle)}
                  </td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                    {fmtPrice((dep as TourDepartureRow).prezzo_4_stelle)}
                  </td>
                </>
              ) : (
                cabinColumns.map(({ cabin }) => {
                  const depPrices = priceMap.get(dep.id);
                  const prezzo = depPrices?.get(cabin.id) ?? null;
                  return (
                    <td key={cabin.id} className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                      {fmtPrice(prezzo)}
                    </td>
                  );
                })
              )}
              <td className="py-3.5 px-4">
                <Button
                  size="sm"
                  className="bg-[#C41E2F] hover:bg-[#A31825] text-white text-xs"
                  onClick={() => onRequestQuote(dep.id)}
                >
                  Preventivo
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
