import TourForm from "@/components/admin/forms/TourForm";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";

export default async function NuovoTourPage() {
  const destinations = await getDestinationOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuovo Tour
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea un nuovo tour
        </p>
      </div>

      <TourForm destinations={destinations} />
    </div>
  );
}
