import { notFound } from "next/navigation";
import { getMacroAreaById } from "@/lib/supabase/queries/macro-areas";
import MacroAreaForm from "@/components/admin/forms/MacroAreaForm";
import ActivityLog from "@/components/admin/ActivityLog";

export const dynamic = "force-dynamic";

export default async function ModificaMacroAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const macroArea = await getMacroAreaById(id);
  if (!macroArea) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)]">
          Modifica: {macroArea.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Modifica i dettagli della macro area.
        </p>
      </div>
      <ActivityLog entityType="macro_area" entityId={id} />
      <MacroAreaForm initialData={macroArea} />
    </div>
  );
}
