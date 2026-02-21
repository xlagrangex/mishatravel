import DestinationForm from "@/components/admin/forms/DestinationForm";

// TODO: Fetch destination data by ID from Supabase and pass as initialData prop
// For now, render the form with empty data

interface ModificaDestinazionePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaDestinazionePage({
  params,
}: ModificaDestinazionePageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Destinazione
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli della destinazione (ID: {id})
        </p>
      </div>

      {/* TODO: Replace with actual Supabase fetch: const destination = await getDestination(id) */}
      <DestinationForm />
    </div>
  );
}
