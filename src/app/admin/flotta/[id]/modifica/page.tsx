import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import ShipForm from "@/components/admin/forms/ShipForm";
import ActivityLog from "@/components/admin/ActivityLog";
import { getShipById } from "@/lib/supabase/queries/ships";

export const dynamic = "force-dynamic";

interface ModificaNavPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaNavPage({
  params,
}: ModificaNavPageProps) {
  const { id } = await params;
  const ship = await getShipById(id);

  if (!ship) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          {ship.name}
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Vedi anteprima:
          <Link
            href={`/flotta/${ship.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            /flotta/{ship.slug}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </div>

      <ActivityLog entityType="ship" entityId={id} />
      <ShipForm initialData={ship} />
    </div>
  );
}
