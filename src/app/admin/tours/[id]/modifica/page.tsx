import TourForm from "@/components/admin/forms/TourForm";

// TODO: Fetch tour data from Supabase by ID and pass as `initialData` to TourForm

interface ModificaTourPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaTourPage({ params }: ModificaTourPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Tour
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli del tour (ID: {id})
        </p>
      </div>

      {/* TODO: Pass initialData={tourData} once Supabase is connected */}
      <TourForm />
    </div>
  );
}
