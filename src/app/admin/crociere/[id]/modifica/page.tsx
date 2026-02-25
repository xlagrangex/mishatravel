import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
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
          {cruise.title}
        </h1>
        <Link
          href={`/crociere/${cruise.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Vedi anteprima
        </Link>
      </div>

      <ActivityLog entityType="cruise" entityId={id} />
      <CruiseForm initialData={cruise} ships={ships} destinations={destinations} localities={localities} />
    </div>
  );
}
