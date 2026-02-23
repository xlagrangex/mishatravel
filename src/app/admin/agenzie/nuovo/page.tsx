import AgencyForm from "./AgencyForm";

export const dynamic = "force-dynamic";

export default function NuovaAgenziaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Crea Agenzia
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea una nuova agenzia partner direttamente
        </p>
      </div>
      <AgencyForm />
    </div>
  );
}
