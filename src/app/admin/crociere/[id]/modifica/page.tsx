import { notFound } from "next/navigation";
import CruiseForm from "@/components/admin/forms/CruiseForm";
import ActivityLog from "@/components/admin/ActivityLog";
import { getCruiseById } from "@/lib/supabase/queries/cruises";
import { getShipOptions } from "@/lib/supabase/queries/ships";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";
import { getDistinctLocalities } from "@/lib/supabase/queries/localities";

export const dynamic = "force-dynamic";

interface ModificaCrocieraPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaCrocieraPage({ params }: ModificaCrocieraPageProps) {
  const { id } = await params;

  const [cruise, ships, destinations, localities] = await Promise.all([
    getCruiseById(id),
    getShipOptions(),
    getDestinationOptions(),
    getDistinctLocalities(),
  ]);

  if (!cruise) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Crociera
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{cruise.title}&rdquo;
        </p>
      </div>

      <ActivityLog entityType="cruise" entityId={id} />
      <CruiseForm initialData={cruise} ships={ships} destinations={destinations} localities={localities} />
    </div>
  );
}
