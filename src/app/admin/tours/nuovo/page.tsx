import TourForm from "@/components/admin/forms/TourForm";

export default function NuovoTourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuovo Tour
        </h1>
        <p className="text-sm text-muted-foreground">
          Compila i dettagli per creare un nuovo tour
        </p>
      </div>

      <TourForm />
    </div>
  );
}
