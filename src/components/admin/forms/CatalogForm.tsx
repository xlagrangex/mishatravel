"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Catalog } from "@/lib/types";
import { saveCatalog } from "@/app/admin/cataloghi/actions";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const catalogSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  year: z.string().optional(),
  sort_order: z.string().optional(),
  cover_image_url: z.string().optional(),
  pdf_url: z.string().optional(),
  is_published: z.boolean(),
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CatalogFormProps {
  initialData?: Catalog;
}

export default function CatalogForm({ initialData }: CatalogFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      year: initialData?.year?.toString() ?? "",
      sort_order: initialData?.sort_order?.toString() ?? "0",
      cover_image_url: initialData?.cover_image_url ?? "",
      pdf_url: initialData?.pdf_url ?? "",
      is_published: initialData?.is_published ?? false,
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: CatalogFormValues) => {
    setServerError(null);
    try {
      const result = await saveCatalog({
        title: data.title,
        year: data.year ? parseInt(data.year, 10) : null,
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) : 0,
        cover_image_url: data.cover_image_url || null,
        pdf_url: data.pdf_url || null,
        is_published: data.is_published,
        id: initialData?.id,
      });
      if (!result.success) {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Catalogo salvato con successo");
        router.push("/admin/cataloghi");
      }
    } catch {
      const msg = "Errore imprevisto durante il salvataggio.";
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Informazioni Catalogo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Titolo */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titolo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder='es. Catalogo Estate 2026'
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Anno */}
              <div className="space-y-2">
                <Label htmlFor="year">Anno</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="es. 2026"
                  {...register("year")}
                />
              </div>

              {/* Ordine */}
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordine</Label>
                <Input
                  id="sort_order"
                  type="number"
                  placeholder="0"
                  {...register("sort_order")}
                />
                <p className="text-xs text-muted-foreground">
                  Ordine di visualizzazione. Valori più bassi vengono mostrati prima.
                </p>
              </div>

              {/* Immagine Copertina */}
              <div className="space-y-2">
                <Label>Immagine Copertina</Label>
                <Controller
                  name="cover_image_url"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onUpload={(urls) => field.onChange(urls[0] || "")}
                      bucket="catalogs"
                    />
                  )}
                />
              </div>

              {/* PDF */}
              <div className="space-y-2">
                <Label>PDF</Label>
                <Controller
                  name="pdf_url"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      value={field.value || null}
                      onUpload={(url) => field.onChange(url || "")}
                      bucket="catalogs"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Pubblicazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published-switch">Stato</Label>
                  <p className="text-xs text-muted-foreground">
                    {watch("is_published")
                      ? "Pubblicato"
                      : "Nascosto"}
                  </p>
                </div>
                <Controller
                  name="is_published"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="published-switch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : initialData ? "Aggiorna" : "Crea Catalogo"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/cataloghi">Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
