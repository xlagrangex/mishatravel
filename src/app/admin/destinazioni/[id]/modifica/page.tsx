import { notFound } from "next/navigation";
import DestinationForm from "@/components/admin/forms/DestinationForm";
import { getDestinationById } from "@/lib/supabase/queries/destinations";

interface ModificaDestinazionePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaDestinazionePage({
  params,
}: ModificaDestinazionePageProps) {
  const { id } = await params;
  const destination = await getDestinationById(id);

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

      <DestinationForm initialData={destination} />
    </div>
  );
}
