import DestinationForm from "@/components/admin/forms/DestinationForm";
import { getDistinctMacroAreas } from "@/lib/supabase/queries/destinations";

export const dynamic = "force-dynamic";

export default async function NuovaDestinazionePage() {
  const macroAreas = await getDistinctMacroAreas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuova Destinazione
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea una nuova destinazione per i tour e le crociere
        </p>
      </div>

      <DestinationForm macroAreas={macroAreas} />
    </div>
  );
}
