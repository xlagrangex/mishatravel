import { notFound } from "next/navigation";
import TourForm from "@/components/admin/forms/TourForm";
import { getTourById } from "@/lib/supabase/queries/tours";
import { getDestinationOptions } from "@/lib/supabase/queries/destinations";
import { getDistinctLocalities } from "@/lib/supabase/queries/localities";

export const dynamic = "force-dynamic";

interface ModificaTourPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaTourPage({ params }: ModificaTourPageProps) {
  const { id } = await params;

  const [tour, destinations, localities] = await Promise.all([
    getTourById(id),
    getDestinationOptions(),
    getDistinctLocalities(),
  ]);

  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Tour
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{tour.title}&rdquo;
        </p>
      </div>

      <TourForm initialData={tour} destinations={destinations} localities={localities} />
    </div>
  );
}
