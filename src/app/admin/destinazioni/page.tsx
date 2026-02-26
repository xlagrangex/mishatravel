import { Suspense } from "react";
import { getDestinations } from "@/lib/supabase/queries/destinations";
import { getMacroAreas, getMegaMenuMode } from "@/lib/supabase/queries/macro-areas";
import DestinazioniTabs from "./DestinazioniTabs";

export const dynamic = "force-dynamic";

export default async function DestinazioniPage() {
  const [destinations, macroAreas, megaMenuMode] = await Promise.all([
    getDestinations(),
    getMacroAreas(),
    getMegaMenuMode(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)]">
          Destinazioni
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le destinazioni e le macro aree geografiche.
        </p>
      </div>
      <Suspense>
        <DestinazioniTabs
          destinations={destinations}
          macroAreas={macroAreas}
          megaMenuMode={megaMenuMode}
        />
      </Suspense>
    </div>
  );
}
