import MacroAreaForm from "@/components/admin/forms/MacroAreaForm";

export const dynamic = "force-dynamic";

export default function NuovaMacroAreaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-poppins)]">
          Nuova Macro Area
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea una nuova area geografica per raggruppare le destinazioni.
        </p>
      </div>
      <MacroAreaForm />
    </div>
  );
}
