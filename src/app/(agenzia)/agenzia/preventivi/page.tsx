import { getAgencyQuotes } from "@/lib/supabase/queries/quotes";
import PreventiviList from "./PreventiviList";

export const dynamic = "force-dynamic";

export default async function PreventiviPage() {
  const quotes = await getAgencyQuotes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          I Miei Preventivi
        </h1>
        <p className="text-sm text-muted-foreground">
          Tutte le richieste di preventivo e le offerte ricevute dalla tua
          agenzia.
        </p>
      </div>

      <PreventiviList quotes={quotes} />
    </div>
  );
}
