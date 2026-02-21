import CatalogForm from "@/components/admin/forms/CatalogForm";

export default function NuovoCatalogoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuovo Catalogo
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea un nuovo catalogo PDF scaricabile
        </p>
      </div>

      <CatalogForm />
    </div>
  );
}
