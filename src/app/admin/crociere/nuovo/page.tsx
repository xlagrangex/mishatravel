import CruiseForm from "@/components/admin/forms/CruiseForm";
import { getShipOptions } from "@/lib/supabase/queries/ships";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";

export default async function NuovaCrocieraPage() {
  const [ships, destinations] = await Promise.all([
    getShipOptions(),
    getDestinationOptions(),
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

      <CruiseForm ships={ships} destinations={destinations} />
    </div>
  );
}
