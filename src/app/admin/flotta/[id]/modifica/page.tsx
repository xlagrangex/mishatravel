import { notFound } from "next/navigation";
import ShipForm from "@/components/admin/forms/ShipForm";
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
          Modifica Nave
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{ship.name}&rdquo;
        </p>
      </div>

      <ShipForm initialData={ship} />
    </div>
  );
}
