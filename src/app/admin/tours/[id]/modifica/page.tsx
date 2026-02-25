import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import TourForm from "@/components/admin/forms/TourForm";
import ActivityLog from "@/components/admin/ActivityLog";
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
          {tour.title}
        </h1>
        <Link
          href={`/tours/${tour.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Vedi anteprima
        </Link>
      </div>

      <ActivityLog entityType="tour" entityId={id} />
      <TourForm initialData={tour} destinations={destinations} localities={localities} />
    </div>
  );
}
