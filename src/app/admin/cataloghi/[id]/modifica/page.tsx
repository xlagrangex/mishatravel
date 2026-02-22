import { notFound } from "next/navigation";
import CatalogForm from "@/components/admin/forms/CatalogForm";
import { getCatalogById } from "@/lib/supabase/queries/catalogs";

export const dynamic = "force-dynamic";

interface ModificaCatalogoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaCatalogoPage({
  params,
}: ModificaCatalogoPageProps) {
  const { id } = await params;
  const catalog = await getCatalogById(id);

  if (!catalog) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Catalogo
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{catalog.title}&rdquo;
        </p>
      </div>

      <CatalogForm initialData={catalog} />
    </div>
  );
}
