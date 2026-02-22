import CruiseForm from "@/components/admin/forms/CruiseForm";
import { getShipOptions } from "@/lib/supabase/queries/ships";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";
import { getDistinctLocalities } from "@/lib/supabase/queries/localities";

export const dynamic = "force-dynamic";

export default async function NuovaCrocieraPage() {
  const [ships, destinations, localities] = await Promise.all([
    getShipOptions(),
    getDestinationOptions(),
    getDistinctLocalities(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuova Crociera
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea una nuova crociera fluviale
        </p>
      </div>

      <CruiseForm ships={ships} destinations={destinations} localities={localities} />
    </div>
  );
}
