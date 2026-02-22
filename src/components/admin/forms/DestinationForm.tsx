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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Destination } from "@/lib/types";
import { saveDestination } from "@/app/admin/destinazioni/actions";
import MapPicker from "@/components/admin/MapPicker";
import ImageUpload from "@/components/admin/ImageUpload";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const destinationSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  macro_area: z.string().optional(),
  description: z.string().optional(),
  coordinate: z.string().optional(),
  cover_image_url: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

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
// Macro area options
// ---------------------------------------------------------------------------

const MACRO_AREAS = [
  "Europa",
  "Asia",
  "America Latina",
  "Africa",
  "Medio Oriente",
  "Oceania",
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DestinationFormProps {
  initialData?: Destination;
}

export default function DestinationForm({ initialData }: DestinationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      macro_area: initialData?.macro_area ?? "",
      description: initialData?.description ?? "",
      coordinate: initialData?.coordinate ?? "",
      cover_image_url: initialData?.cover_image_url ?? "",
      status: initialData?.status ?? "draft",
    },
  });

  // Auto-generate slug from name
  const nameValue = watch("name");
  useEffect(() => {
    // Only auto-generate if no initial data (new destination) or if slug matches what would be generated from original name
    if (!initialData) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, initialData, setValue]);

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: DestinationFormValues) => {
    setServerError(null);
    try {
      const result = await saveDestination({
        ...data,
        id: initialData?.id,
      });
      if (!result.success) {
        setServerError(result.error);
      } else {
        router.push("/admin/destinazioni");
      }
    } catch {
      setServerError("Errore imprevisto durante il salvataggio.");
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
                Informazioni Generali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="es. Roma, Tokyo, Cartagena"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="es. roma"
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                <p className="text-xs text-muted-foreground">
                  Generato automaticamente dal nome. Puoi modificarlo
                  manualmente.
                </p>
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Macro Area */}
              <div className="space-y-2">
                <Label htmlFor="macro_area">Macro Area</Label>
                <Controller
                  name="macro_area"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="macro_area" className="w-full">
                        <SelectValue placeholder="Seleziona macro area" />
                      </SelectTrigger>
                      <SelectContent>
                        {MACRO_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descrizione della destinazione..."
                  rows={4}
                  {...register("description")}
                />
              </div>

              {/* Coordinate (Map Picker) */}
              <div className="space-y-2">
                <Label>Coordinate</Label>
                <MapPicker
                  value={watch("coordinate")}
                  onChange={(coordinates) =>
                    setValue("coordinate", coordinates, {
                      shouldDirty: true,
                    })
                  }
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
                  <Label htmlFor="status-switch">Stato</Label>
                  <p className="text-xs text-muted-foreground">
                    {watch("status") === "published"
                      ? "Pubblicato"
                      : "Bozza"}
                  </p>
                </div>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="status-switch"
                      checked={field.value === "published"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "published" : "draft")
                      }
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Immagine Copertina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="cover_image_url"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onUpload={(urls) => field.onChange(urls[0] || "")}
                    bucket="general"
                  />
                )}
              />
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
          {isSubmitting ? "Salvataggio..." : initialData ? "Aggiorna" : "Crea Destinazione"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/destinazioni">Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
