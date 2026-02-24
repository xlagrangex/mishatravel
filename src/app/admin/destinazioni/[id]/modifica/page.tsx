import { notFound } from "next/navigation";
import DestinationForm from "@/components/admin/forms/DestinationForm";
import ActivityLog from "@/components/admin/ActivityLog";
import { getDestinationById, getDistinctMacroAreas } from "@/lib/supabase/queries/destinations";

export const dynamic = "force-dynamic";

interface ModificaDestinazionePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaDestinazionePage({
  params,
}: ModificaDestinazionePageProps) {
  const { id } = await params;
  const [destination, macroAreas] = await Promise.all([
    getDestinationById(id),
    getDistinctMacroAreas(),
  ]);

  if (!destination) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Destinazione
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{destination.name}&rdquo;
        </p>
      </div>

      <ActivityLog entityType="destination" entityId={id} />
      <DestinationForm initialData={destination} macroAreas={macroAreas} />
    </div>
  );
}
