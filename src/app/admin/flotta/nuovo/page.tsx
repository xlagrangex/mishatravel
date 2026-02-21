import ShipForm from "@/components/admin/forms/ShipForm";

export default function NuovaNavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuova Nave
        </h1>
        <p className="text-sm text-muted-foreground">
          Aggiungi una nuova nave alla flotta
        </p>
      </div>

      <ShipForm />
    </div>
  );
}
