"use client";

import { Button } from "@/components/ui/button";

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
  prezzo_main_deck: number | null;
  prezzo_middle_deck: string | null;
  prezzo_superior_deck: string | null;
}

interface DeckConfig {
  label: string;
  value: string;
}

interface TourPricingTableProps {
  type: "tour";
  departures: TourDepartureRow[];
  onRequestQuote: (departureId: string) => void;
  decks?: never;
}

interface CruisePricingTableProps {
  type: "cruise";
  departures: CruiseDepartureRow[];
  onRequestQuote: (departureId: string) => void;
  decks: DeckConfig[];
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
  if (!price) return "—";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(num);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PricingTable(props: PricingTableProps) {
  const { type, departures, onRequestQuote } = props;

  if (departures.length === 0) {
    return <p className="text-gray-500">Nessuna partenza programmata al momento.</p>;
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
              props.decks.map((d) => (
                <th key={d.value} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {d.label}
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
                <>
                  <td className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                    {fmtPrice((dep as CruiseDepartureRow).prezzo_main_deck)}
                  </td>
                  {props.decks.length > 1 && (
                    <td className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                      {fmtPrice((dep as CruiseDepartureRow).prezzo_middle_deck)}
                    </td>
                  )}
                  {props.decks.length > 2 && (
                    <td className="py-3.5 px-4 text-sm font-semibold text-[#C41E2F]">
                      {fmtPrice((dep as CruiseDepartureRow).prezzo_superior_deck)}
                    </td>
                  )}
                </>
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
