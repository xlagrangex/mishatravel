"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MacroArea } from "@/lib/types";
import { saveMacroArea } from "@/app/admin/destinazioni/macro-aree/actions";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const macroAreaSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  sort_order: z.number().int(),
  status: z.enum(["draft", "published"]),
});

type MacroAreaFormValues = z.infer<typeof macroAreaSchema>;

// ---------------------------------------------------------------------------
// Slug utility
// ---------------------------------------------------------------------------

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MacroAreaFormProps {
  initialData?: MacroArea;
}

export default function MacroAreaForm({ initialData }: MacroAreaFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MacroAreaFormValues>({
    resolver: zodResolver(macroAreaSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      cover_image_url: initialData?.cover_image_url ?? "",
      sort_order: initialData?.sort_order ?? 0,
      status: initialData?.status ?? "draft",
    },
  });

  const router = useRouter();
  const [error, setError] = useState("");
  const name = watch("name");

  // Auto-generate slug from name (only for new records)
  useEffect(() => {
    if (!initialData && name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, initialData, setValue]);

  const onSubmit = async (data: MacroAreaFormValues) => {
    setError("");
    const result = await saveMacroArea({
      ...data,
      id: initialData?.id,
    });
    if (result.success) {
      toast.success(initialData ? "Macro area aggiornata" : "Macro area creata");
      router.push("/admin/destinazioni?tab=macro-aree");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="es. Europa, Asia, America Latina"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register("slug")} />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrizione della macro area"
                  rows={3}
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordine di visualizzazione</Label>
                <Input
                  id="sort_order"
                  type="number"
                  className="max-w-32"
                  {...register("sort_order", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Numeri piu bassi appaiono prima. Usa 99 per mettere in fondo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Immagine di copertina</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="cover_image_url"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onUpload={(urls) => field.onChange(urls[0] ?? "")}
                    bucket="general"
                  />
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Usata nella navigazione per destinazione nella pagina Tour. Puoi anche inserire un URL esterno (es. Unsplash).
              </p>
              <Controller
                name="cover_image_url"
                control={control}
                render={({ field }) => (
                  <Input
                    className="mt-2"
                    placeholder="Oppure incolla un URL immagine..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pubblicazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value === "published"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "published" : "draft")
                      }
                    />
                    <span className="text-sm font-medium">
                      {field.value === "published" ? "Pubblicato" : "Bozza"}
                    </span>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? "Salvataggio..."
                : initialData
                  ? "Aggiorna"
                  : "Crea Macro Area"}
            </Button>
            <Link href="/admin/destinazioni?tab=macro-aree">
              <Button type="button" variant="outline" className="w-full">
                Annulla
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
