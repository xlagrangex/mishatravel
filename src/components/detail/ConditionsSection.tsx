"use client";

import { FileText, AlertTriangle, Info, UtensilsCrossed } from "lucide-react";

interface Term {
  id: string;
  titolo: string;
}

interface Penalty {
  id: string;
  titolo: string;
}

interface ConditionsSectionProps {
  terms: Term[];
  penalties: Penalty[];
  noteImportanti: string | null;
  notaPenali: string | null;
  pensione: string[];
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

export default function ConditionsSection({
  terms,
  penalties,
  noteImportanti,
  notaPenali,
  pensione,
}: ConditionsSectionProps) {
  const pensioneLabel = formatPensione(pensione);
  const hasContent = terms.length > 0 || penalties.length > 0 || noteImportanti || notaPenali || pensioneLabel;

  if (!hasContent) {
    return <p className="text-gray-500">Nessuna condizione specificata.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Pensione */}
      {pensioneLabel && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-3 flex items-center gap-2">
            <UtensilsCrossed className="size-5" />
            Pensione Inclusa
          </h3>
          <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            {pensioneLabel}
          </p>
        </div>
      )}

      {/* Terms */}
      {terms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-3 flex items-center gap-2">
            <FileText className="size-5" />
            Termini di Prenotazione
          </h3>
          <ul className="space-y-1.5">
            {terms.map((t) => (
              <li key={t.id} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-1.5 shrink-0 block size-1.5 rounded-full bg-gray-400" />
                {t.titolo}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Penalties */}
      {penalties.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-3 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Penali di Cancellazione
          </h3>
          <ul className="space-y-1.5">
            {penalties.map((p) => (
              <li key={p.id} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="mt-1.5 shrink-0 block size-1.5 rounded-full bg-amber-400" />
                {p.titolo}
              </li>
            ))}
          </ul>
          {notaPenali && (
            <p className="text-xs text-gray-500 mt-3 italic">{notaPenali}</p>
          )}
        </div>
      )}

      {/* Note importanti */}
      {noteImportanti && (
        <div>
          <h3 className="text-lg font-semibold text-[#1B2D4F] mb-3 flex items-center gap-2">
            <Info className="size-5" />
            Note Importanti
          </h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {noteImportanti}
          </p>
        </div>
      )}
    </div>
  );
}
