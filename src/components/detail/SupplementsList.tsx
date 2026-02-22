"use client";

import { Plus, Compass } from "lucide-react";

interface Supplement {
  id: string;
  titolo: string;
  prezzo: string | null;
}

interface OptionalExcursion {
  id: string;
  titolo: string;
  descrizione: string | null;
  prezzo: number | null;
}

interface SupplementsListProps {
  supplements: Supplement[];
  optionalExcursions?: OptionalExcursion[];
}

function fmtPrice(price: number | null): string {
  if (!price) return "";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function SupplementsList({ supplements, optionalExcursions }: SupplementsListProps) {
  const hasSupplements = supplements.length > 0;
  const hasExcursions = (optionalExcursions ?? []).length > 0;

  if (!hasSupplements && !hasExcursions) {
    return <p className="text-gray-500">Nessun supplemento disponibile.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Supplements */}
      {hasSupplements && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4 flex items-center gap-2">
            <Plus className="size-5" />
            Supplementi
          </h3>
          <div className="space-y-2">
            {supplements.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{s.titolo}</span>
                {s.prezzo && (
                  <span className="text-sm font-medium text-[#C41E2F] shrink-0 ml-4">
                    {s.prezzo}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Excursions */}
      {hasExcursions && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-4 flex items-center gap-2">
            <Compass className="size-5" />
            Escursioni Opzionali
          </h3>
          <div className="space-y-3">
            {optionalExcursions!.map((exc) => (
              <div
                key={exc.id}
                className="py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{exc.titolo}</span>
                  {exc.prezzo != null && (
                    <span className="text-sm font-medium text-[#C41E2F] shrink-0 ml-4">
                      {fmtPrice(exc.prezzo)}
                    </span>
                  )}
                </div>
                {exc.descrizione && (
                  <p className="text-xs text-gray-500 mt-1">{exc.descrizione}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
