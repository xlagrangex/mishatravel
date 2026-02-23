"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveShip } from "@/app/admin/flotta/actions";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ArrowLeft,
  ImagePlus,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { ShipWithRelations } from "@/lib/types";

// =============================================================================
// Zod Schema
// =============================================================================

const suitableForSchema = z.object({
  testo: z.string().min(1, "Il testo è obbligatorio"),
});

const activitySchema = z.object({
  attivita: z.string().min(1, "L'attività è obbligatoria"),
});

const serviceSchema = z.object({
  testo: z.string().min(1, "Il testo è obbligatorio"),
});

const cabinDetailSchema = z.object({
  titolo: z.string().min(1, "Il titolo è obbligatorio"),
  immagine_url: z.string().nullable(),
  tipologia: z
    .enum(["Singola", "Doppia", "Tripla", "Quadrupla"])
    .nullable(),
  descrizione: z.string().nullable(),
});

const galleryItemSchema = z.object({
  image_url: z.string().min(1, "L'URL immagine è obbligatorio"),
  caption: z.string().nullable(),
});

const shipFormSchema = z.object({
  // Tab 1: Info Base
  name: z.string().min(1, "Il nome è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  description: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  cabine_disponibili: z.string().nullable(),
  servizi_cabine: z.string().nullable(),
  piani_ponte_url: z.string().nullable(),
  status: z.enum(["draft", "published"]),

  // Tab 2: Adatta per
  suitable_for: z.array(suitableForSchema),

  // Tab 3: Attivita
  activities: z.array(activitySchema),

  // Tab 4: Servizi
  services: z.array(serviceSchema),

  // Tab 5: Cabine
  cabin_details: z.array(cabinDetailSchema),

  // Tab 6: Gallery
  gallery: z.array(galleryItemSchema),
});

type ShipFormValues = z.infer<typeof shipFormSchema>;

// =============================================================================
// Helpers
// =============================================================================

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

// =============================================================================
// Props
// =============================================================================

interface ShipFormProps {
  initialData?: ShipWithRelations;
}

// =============================================================================
// Component
// =============================================================================

export default function ShipForm({ initialData }: ShipFormProps) {
  // ---------------------------------------------------------------------------
  // Form setup
  // ---------------------------------------------------------------------------

  const defaultValues: ShipFormValues = initialData
    ? {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description,
        cover_image_url: initialData.cover_image_url,
        cabine_disponibili: initialData.cabine_disponibili,
        servizi_cabine: initialData.servizi_cabine,
        piani_ponte_url: initialData.piani_ponte_url,
        status: initialData.status,
        suitable_for: initialData.suitable_for.map((s) => ({
          testo: s.testo,
        })),
        activities: initialData.activities.map((a) => ({
          attivita: a.attivita,
        })),
        services: initialData.services.map((s) => ({
          testo: s.testo,
        })),
        cabin_details: initialData.cabin_details.map((c) => ({
          titolo: c.titolo,
          immagine_url: c.immagine_url,
          tipologia: c.tipologia,
          descrizione: c.descrizione,
        })),
        gallery: initialData.gallery.map((g) => ({
          image_url: g.image_url,
          caption: g.caption,
        })),
      }
    : {
        name: "",
        slug: "",
        description: null,
        cover_image_url: null,
        cabine_disponibili: null,
        servizi_cabine: null,
        piani_ponte_url: null,
        status: "draft",
        suitable_for: [],
        activities: [],
        services: [],
        cabin_details: [],
        gallery: [],
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShipFormValues>({
    resolver: zodResolver(shipFormSchema),
    defaultValues,
  });

  // Watch name for auto-slug
  const nameValue = watch("name");
  const status = watch("status");

  // Auto-generate slug from name (only for new ships)
  useEffect(() => {
    if (!initialData) {
      setValue("slug", generateSlug(nameValue || ""));
    }
  }, [nameValue, initialData, setValue]);

  // ---------------------------------------------------------------------------
  // Field Arrays
  // ---------------------------------------------------------------------------

  const suitableFor = useFieldArray({ control, name: "suitable_for" });
  const activities = useFieldArray({ control, name: "activities" });
  const services = useFieldArray({ control, name: "services" });
  const cabinDetails = useFieldArray({ control, name: "cabin_details" });
  const gallery = useFieldArray({ control, name: "gallery" });

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: ShipFormValues) => {
    setServerError(null);
    try {
      const result = await saveShip({
        ...data,
        id: initialData?.id,
      });
      if (!result.success) {
        setServerError(result.error);
      } else {
        router.push("/admin/flotta");
      }
    } catch {
      setServerError("Errore imprevisto durante il salvataggio.");
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers for reordering
  // ---------------------------------------------------------------------------

  function moveItem(
    fieldArray: { move: (from: number, to: number) => void },
    from: number,
    to: number,
    length: number,
  ) {
    if (to < 0 || to >= length) return;
    fieldArray.move(from, to);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="info-base">
        {/* Tabs Navigation */}
        <TabsList className="flex w-full flex-wrap" variant="line">
          <TabsTrigger value="info-base">Info Base</TabsTrigger>
          <TabsTrigger value="adatta-per">Adatta per</TabsTrigger>
          <TabsTrigger value="attivita">Attivit&agrave;</TabsTrigger>
          <TabsTrigger value="servizi">Servizi</TabsTrigger>
          <TabsTrigger value="cabine">Cabine</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB 1: INFO BASE                                                  */}
        {/* ================================================================= */}
        <TabsContent value="info-base">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Generali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="es. MS Amadeus Star"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">Slug *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("slug", generateSlug(nameValue || ""))}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    Genera da nome
                  </Button>
                </div>
                <Input
                  id="slug"
                  placeholder="ms-amadeus-star"
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                <p className="text-xs text-muted-foreground">
                  Generato automaticamente dal nome. Puoi modificarlo
                  manualmente.
                </p>
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Descrizione della nave..."
                  {...register("description")}
                />
              </div>

              <Separator />

              {/* Cabine Disponibili & Servizi Cabine */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cabine_disponibili">Cabine Disponibili</Label>
                  <Textarea
                    id="cabine_disponibili"
                    rows={3}
                    placeholder="es. 70 cabine su 3 ponti..."
                    {...register("cabine_disponibili")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servizi_cabine">Servizi Cabine</Label>
                  <Textarea
                    id="servizi_cabine"
                    rows={3}
                    placeholder="es. Aria condizionata, TV, minibar..."
                    {...register("servizi_cabine")}
                  />
                </div>
              </div>

              {/* Piani Ponte */}
              <div className="space-y-2">
                <Label>Piani Ponte (immagine o PDF)</Label>
                <Controller
                  control={control}
                  name="piani_ponte_url"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onUpload={(urls) => field.onChange(urls[0] || null)}
                      bucket="ships"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Carica l&apos;immagine o PDF con i piani ponte della nave.
                </p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Immagine Copertina</Label>
                <Controller
                  control={control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onUpload={(urls) => field.onChange(urls[0] || null)}
                      bucket="ships"
                    />
                  )}
                />
              </div>

              <Separator />

              {/* Stato */}
              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Switch
                      id="status"
                      checked={field.value === "published"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "published" : "draft")
                      }
                    />
                  )}
                />
                <Label htmlFor="status">
                  {status === "published" ? "Pubblicato" : "Bozza"}
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 2: ADATTA PER                                                 */}
        {/* ================================================================= */}
        <TabsContent value="adatta-per">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Adatta per</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => suitableFor.append({ testo: "" })}
              >
                <Plus className="mr-2 size-4" />
                Aggiungi
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {suitableFor.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessun elemento aggiunto. Clicca &quot;Aggiungi&quot; per iniziare.
                </p>
              )}

              {suitableFor.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="es. Famiglie con bambini"
                      {...register(`suitable_for.${index}.testo`)}
                    />
                    {errors.suitable_for?.[index]?.testo && (
                      <p className="text-xs text-destructive">
                        {errors.suitable_for[index].testo.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(suitableFor, index, index - 1, suitableFor.fields.length)
                      }
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === suitableFor.fields.length - 1}
                      onClick={() =>
                        moveItem(suitableFor, index, index + 1, suitableFor.fields.length)
                      }
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => suitableFor.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: ATTIVITA                                                   */}
        {/* ================================================================= */}
        <TabsContent value="attivita">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attivit&agrave; a Bordo</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => activities.append({ attivita: "" })}
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Attivit&agrave;
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna attivit&agrave; aggiunta. Clicca &quot;Aggiungi Attivit&agrave;&quot; per iniziare.
                </p>
              )}

              {activities.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="es. Piscina panoramica"
                      {...register(`activities.${index}.attivita`)}
                    />
                    {errors.activities?.[index]?.attivita && (
                      <p className="text-xs text-destructive">
                        {errors.activities[index].attivita.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(activities, index, index - 1, activities.fields.length)
                      }
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === activities.fields.length - 1}
                      onClick={() =>
                        moveItem(activities, index, index + 1, activities.fields.length)
                      }
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => activities.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 4: SERVIZI                                                    */}
        {/* ================================================================= */}
        <TabsContent value="servizi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Servizi a Bordo</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => services.append({ testo: "" })}
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Servizio
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessun servizio aggiunto. Clicca &quot;Aggiungi Servizio&quot; per iniziare.
                </p>
              )}

              {services.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="es. Ristorante panoramico"
                      {...register(`services.${index}.testo`)}
                    />
                    {errors.services?.[index]?.testo && (
                      <p className="text-xs text-destructive">
                        {errors.services[index].testo.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(services, index, index - 1, services.fields.length)
                      }
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={index === services.fields.length - 1}
                      onClick={() =>
                        moveItem(services, index, index + 1, services.fields.length)
                      }
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => services.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 5: CABINE                                                     */}
        {/* ================================================================= */}
        <TabsContent value="cabine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dettaglio Cabine</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  cabinDetails.append({
                    titolo: "",
                    immagine_url: null,
                    tipologia: null,
                    descrizione: null,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Cabina
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cabinDetails.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna cabina aggiunta. Clicca &quot;Aggiungi Cabina&quot; per iniziare.
                </p>
              )}

              {cabinDetails.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Cabina {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() =>
                          moveItem(
                            cabinDetails,
                            index,
                            index - 1,
                            cabinDetails.fields.length,
                          )
                        }
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === cabinDetails.fields.length - 1}
                        onClick={() =>
                          moveItem(
                            cabinDetails,
                            index,
                            index + 1,
                            cabinDetails.fields.length,
                          )
                        }
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => cabinDetails.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Titolo */}
                    <div className="space-y-2">
                      <Label>Titolo *</Label>
                      <Input
                        placeholder="es. Cabina Deluxe con Balcone"
                        {...register(`cabin_details.${index}.titolo`)}
                      />
                      {errors.cabin_details?.[index]?.titolo && (
                        <p className="text-xs text-destructive">
                          {errors.cabin_details[index].titolo.message}
                        </p>
                      )}
                    </div>

                    {/* Tipologia */}
                    <div className="space-y-2">
                      <Label>Tipologia</Label>
                      <Controller
                        control={control}
                        name={`cabin_details.${index}.tipologia`}
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={(val) =>
                              field.onChange(val === "" ? null : val)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleziona tipologia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Singola">Singola</SelectItem>
                              <SelectItem value="Doppia">Doppia</SelectItem>
                              <SelectItem value="Tripla">Tripla</SelectItem>
                              <SelectItem value="Quadrupla">Quadrupla</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Immagine cabina */}
                  <div className="mt-4 space-y-2">
                    <Label>Immagine Cabina</Label>
                    <Controller
                      control={control}
                      name={`cabin_details.${index}.immagine_url`}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value ? [field.value] : []}
                          onUpload={(urls) => field.onChange(urls[0] || null)}
                          bucket="ships"
                        />
                      )}
                    />
                  </div>

                  {/* Descrizione */}
                  <div className="mt-4 space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      rows={3}
                      placeholder="Descrizione della cabina..."
                      {...register(`cabin_details.${index}.descrizione`)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 6: GALLERY                                                    */}
        {/* ================================================================= */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gallery</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  gallery.append({ image_url: "", caption: null })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Immagine
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {gallery.fields.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <ImagePlus className="size-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nessuna immagine</p>
                    <p className="text-xs text-muted-foreground">
                      Clicca &quot;Aggiungi Immagine&quot; per aggiungere foto alla gallery
                    </p>
                  </div>
                </div>
              )}

              {gallery.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Immagine {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() =>
                          moveItem(gallery, index, index - 1, gallery.fields.length)
                        }
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === gallery.fields.length - 1}
                        onClick={() =>
                          moveItem(gallery, index, index + 1, gallery.fields.length)
                        }
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => gallery.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Immagine *</Label>
                      <Controller
                        control={control}
                        name={`gallery.${index}.image_url`}
                        render={({ field }) => (
                          <ImageUpload
                            value={field.value ? [field.value] : []}
                            onUpload={(urls) => field.onChange(urls[0] || "")}
                            bucket="ships"
                          />
                        )}
                      />
                      {errors.gallery?.[index]?.image_url && (
                        <p className="text-xs text-destructive">
                          {errors.gallery[index].image_url.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Didascalia</Label>
                      <Input
                        placeholder="es. Vista panoramica della nave"
                        {...register(`gallery.${index}.caption`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================================================================= */}
      {/* ACTION BUTTONS                                                     */}
      {/* ================================================================= */}
      <Separator />

      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/flotta">
            <ArrowLeft className="mr-2 size-4" />
            Annulla
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Salvataggio..." : initialData ? "Aggiorna Nave" : "Crea Nave"}
        </Button>
      </div>
    </form>
  );
}
