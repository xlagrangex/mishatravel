import DestinationForm from "@/components/admin/forms/DestinationForm";

export default function NuovaDestinazionePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuova Destinazione
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea una nuova destinazione per i tour e le crociere
        </p>
      </div>

      <DestinationForm />
    </div>
  );
}
