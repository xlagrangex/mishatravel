import { notFound } from "next/navigation";
import CruiseForm from "@/components/admin/forms/CruiseForm";
import { getCruiseById } from "@/lib/supabase/queries/cruises";
import { getShipOptions } from "@/lib/supabase/queries/ships";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";

export const dynamic = "force-dynamic";

interface ModificaCrocieraPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaCrocieraPage({ params }: ModificaCrocieraPageProps) {
  const { id } = await params;

  const [cruise, ships, destinations] = await Promise.all([
    getCruiseById(id),
    getShipOptions(),
    getDestinationOptions(),
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

      <CruiseForm initialData={cruise} ships={ships} destinations={destinations} />
    </div>
  );
}
