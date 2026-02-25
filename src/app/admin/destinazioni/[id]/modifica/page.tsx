import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
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
          {destination.name}
        </h1>
        <Link
          href={`/destinazioni/${destination.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Vedi anteprima
        </Link>
      </div>

      <ActivityLog entityType="destination" entityId={id} />
      <DestinationForm initialData={destination} macroAreas={macroAreas} />
    </div>
  );
}
