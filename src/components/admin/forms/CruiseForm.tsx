"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { saveCruise } from "@/app/admin/crociere/actions";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ArrowLeft,
  ImagePlus,
  FileUp,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

import type { PensioneType, CruiseWithRelations } from "@/lib/types";

// =============================================================================
// Zod Schema
// =============================================================================

const itineraryDaySchema = z.object({
  numero_giorno: z.string().min(1, "Obbligatorio"),
  localita: z.string().min(1, "Obbligatorio"),
  descrizione: z.string(),
});

const cabinSchema = z.object({
  localita: z.string().min(1, "Obbligatorio"),
  tipologia_camera: z.string().nullable(),
  ponte: z.string().nullable(),
});

const departureSchema = z.object({
  from_city: z.string().min(1, "Obbligatorio"),
  data_partenza: z.string(),
  prezzo_main_deck: z.number().nullable(),
  prezzo_middle_deck: z.string().nullable(),
  prezzo_superior_deck: z.string().nullable(),
});

const supplementSchema = z.object({
  titolo: z.string().min(1, "Obbligatorio"),
  prezzo: z.string().nullable(),
});

const textItemSchema = z.object({
  titolo: z.string().min(1, "Obbligatorio"),
});

const galleryItemSchema = z.object({
  image_url: z.string().min(1, "URL obbligatorio"),
  caption: z.string().nullable(),
});

const cruiseFormSchema = z.object({
  // Tab 1: Info Base
  title: z.string().min(1, "Il titolo \u00E8 obbligatorio"),
  slug: z.string().min(1, "Lo slug \u00E8 obbligatorio"),
  ship_id: z.string().nullable(),
  destination_id: z.string().nullable(),
  tipo_crociera: z.enum(["Crociera di Gruppo", "Crociera"]).nullable(),
  content: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  durata_notti: z.string().nullable(),
  a_partire_da: z.string().nullable(),
  prezzo_su_richiesta: z.boolean(),
  numero_minimo_persone: z.number().nullable(),
  pensione: z.array(z.enum(["no", "mezza", "completa"])),
  tipo_voli: z.string().nullable(),
  etichetta_primo_deck: z.string().nullable(),
  etichetta_secondo_deck: z.string().nullable(),
  etichetta_terzo_deck: z.string().nullable(),
  note_importanti: z.string().nullable(),
  nota_penali: z.string().nullable(),
  programma_pdf_url: z.string().nullable(),
  status: z.enum(["draft", "published"]),

  // Tab 2: Programma
  itinerary_days: z.array(itineraryDaySchema),

  // Tab 3: Cabine
  cabins: z.array(cabinSchema),

  // Tab 4: Partenze
  departures: z.array(departureSchema),

  // Tab 5: Supplementi
  supplements: z.array(supplementSchema),

  // Tab 6: Incluso / Escluso
  inclusions: z.array(textItemSchema),
  exclusions: z.array(textItemSchema),

  // Tab 7: Termini & Penali
  terms: z.array(textItemSchema),
  penalties: z.array(textItemSchema),

  // Tab 8: Gallery & PDF
  gallery: z.array(galleryItemSchema),
});

type CruiseFormValues = z.infer<typeof cruiseFormSchema>;

// =============================================================================
// Helpers
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// =============================================================================
// Props
// =============================================================================

interface CruiseFormProps {
  initialData?: CruiseWithRelations;
  ships?: { id: string; name: string }[];
  destinations?: { id: string; name: string; slug: string; coordinate: string | null }[];
}

// =============================================================================
// Component
// =============================================================================

export default function CruiseForm({ initialData, ships = [], destinations = [] }: CruiseFormProps) {
  // ---------------------------------------------------------------------------
  // Form setup
  // ---------------------------------------------------------------------------

  const defaultValues: CruiseFormValues = initialData
    ? {
        title: initialData.title,
        slug: initialData.slug,
        ship_id: initialData.ship_id,
        destination_id: initialData.destination_id,
        tipo_crociera: initialData.tipo_crociera,
        content: initialData.content,
        cover_image_url: initialData.cover_image_url,
        durata_notti: initialData.durata_notti,
        a_partire_da: initialData.a_partire_da,
        prezzo_su_richiesta: initialData.prezzo_su_richiesta,
        numero_minimo_persone: initialData.numero_minimo_persone,
        pensione: initialData.pensione,
        tipo_voli: initialData.tipo_voli,
        etichetta_primo_deck: initialData.etichetta_primo_deck,
        etichetta_secondo_deck: initialData.etichetta_secondo_deck,
        etichetta_terzo_deck: initialData.etichetta_terzo_deck,
        note_importanti: initialData.note_importanti,
        nota_penali: initialData.nota_penali,
        programma_pdf_url: initialData.programma_pdf_url,
        status: initialData.status,
        itinerary_days: initialData.itinerary_days.map((d) => ({
          numero_giorno: d.numero_giorno,
          localita: d.localita,
          descrizione: d.descrizione,
        })),
        cabins: initialData.cabins.map((c) => ({
          localita: c.localita,
          tipologia_camera: c.tipologia_camera,
          ponte: c.ponte,
        })),
        departures: initialData.departures.map((d) => ({
          from_city: d.from_city,
          data_partenza: d.data_partenza,
          prezzo_main_deck: d.prezzo_main_deck,
          prezzo_middle_deck: d.prezzo_middle_deck,
          prezzo_superior_deck: d.prezzo_superior_deck,
        })),
        supplements: initialData.supplements.map((s) => ({
          titolo: s.titolo,
          prezzo: s.prezzo,
        })),
        inclusions: initialData.inclusions
          .filter((i) => i.is_included)
          .map((i) => ({ titolo: i.titolo })),
        exclusions: initialData.inclusions
          .filter((i) => !i.is_included)
          .map((i) => ({ titolo: i.titolo })),
        terms: initialData.terms.map((t) => ({ titolo: t.titolo })),
        penalties: initialData.penalties.map((p) => ({ titolo: p.titolo })),
        gallery: initialData.gallery.map((g) => ({
          image_url: g.image_url,
          caption: g.caption,
        })),
      }
    : {
        title: "",
        slug: "",
        ship_id: null,
        destination_id: null,
        tipo_crociera: null,
        content: null,
        cover_image_url: null,
        durata_notti: null,
        a_partire_da: null,
        prezzo_su_richiesta: false,
        numero_minimo_persone: null,
        pensione: [],
        tipo_voli: null,
        etichetta_primo_deck: null,
        etichetta_secondo_deck: null,
        etichetta_terzo_deck: null,
        note_importanti: null,
        nota_penali: null,
        programma_pdf_url: null,
        status: "draft",
        itinerary_days: [],
        cabins: [],
        departures: [],
        supplements: [],
        inclusions: [],
        exclusions: [],
        terms: [],
        penalties: [],
        gallery: [],
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CruiseFormValues>({
    resolver: zodResolver(cruiseFormSchema),
    defaultValues,
  });

  // Watch fields
  const title = watch("title");
  const status = watch("status");
  const pensione = watch("pensione");

  // ---------------------------------------------------------------------------
  // Field Arrays
  // ---------------------------------------------------------------------------

  const itineraryDays = useFieldArray({ control, name: "itinerary_days" });
  const cabins = useFieldArray({ control, name: "cabins" });
  const departures = useFieldArray({ control, name: "departures" });
  const supplements = useFieldArray({ control, name: "supplements" });
  const inclusions = useFieldArray({ control, name: "inclusions" });
  const exclusions = useFieldArray({ control, name: "exclusions" });
  const terms = useFieldArray({ control, name: "terms" });
  const penalties = useFieldArray({ control, name: "penalties" });
  const gallery = useFieldArray({ control, name: "gallery" });

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: CruiseFormValues) => {
    setServerError(null);
    const result = await saveCruise({
      ...data,
      id: initialData?.id,
    });
    if (!result.success) {
      setServerError(result.error);
    }
    // On success, the server action redirects to /admin/crociere
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
  // Pensione toggle helper
  // ---------------------------------------------------------------------------

  function togglePensione(type: PensioneType) {
    const current = pensione || [];
    if (current.includes(type)) {
      setValue(
        "pensione",
        current.filter((p) => p !== type),
      );
    } else {
      setValue("pensione", [...current, type]);
    }
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
          <TabsTrigger value="programma">Programma</TabsTrigger>
          <TabsTrigger value="cabine">Cabine</TabsTrigger>
          <TabsTrigger value="partenze">Partenze</TabsTrigger>
          <TabsTrigger value="supplementi">Supplementi</TabsTrigger>
          <TabsTrigger value="incluso-escluso">Incluso / Escluso</TabsTrigger>
          <TabsTrigger value="termini">Termini &amp; Penali</TabsTrigger>
          <TabsTrigger value="gallery">Gallery &amp; PDF</TabsTrigger>
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
              {/* Titolo */}
              <div className="space-y-2">
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  placeholder="es. Crociera sul Danubio"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
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
                    onClick={() => setValue("slug", slugify(title || ""))}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    Genera da titolo
                  </Button>
                </div>
                <Input
                  id="slug"
                  placeholder="crociera-sul-danubio"
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Nave */}
              <div className="space-y-2">
                <Label>Nave</Label>
                <Controller
                  control={control}
                  name="ship_id"
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona nave" />
                      </SelectTrigger>
                      <SelectContent>
                        {ships.map((ship) => (
                          <SelectItem key={ship.id} value={ship.id}>
                            {ship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Destinazione */}
              <div className="space-y-2">
                <Label>Destinazione</Label>
                <Controller
                  control={control}
                  name="destination_id"
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona destinazione" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest.id} value={dest.id}>
                            {dest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Tipo Crociera */}
              <div className="space-y-2">
                <Label>Tipo Crociera</Label>
                <Controller
                  control={control}
                  name="tipo_crociera"
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crociera di Gruppo">
                          Crociera di Gruppo
                        </SelectItem>
                        <SelectItem value="Crociera">Crociera</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Descrizione</Label>
                <Textarea
                  id="content"
                  rows={5}
                  placeholder="Descrizione della crociera..."
                  {...register("content")}
                />
              </div>

              <Separator />

              {/* Prezzo Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="a_partire_da">A Partire Da</Label>
                  <Input
                    id="a_partire_da"
                    placeholder="es. 1.490\u20AC a persona"
                    {...register("a_partire_da")}
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Controller
                    control={control}
                    name="prezzo_su_richiesta"
                    render={({ field }) => (
                      <Switch
                        id="prezzo_su_richiesta"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="prezzo_su_richiesta">
                    Prezzo su Richiesta
                  </Label>
                </div>
              </div>

              {/* Numero Minimo Persone & Durata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero_minimo_persone">Numero Minimo Persone</Label>
                  <Input
                    id="numero_minimo_persone"
                    type="number"
                    min={1}
                    {...register("numero_minimo_persone", {
                      setValueAs: (v) =>
                        v === "" || v === null ? null : Number(v),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durata_notti">Durata Notti</Label>
                  <Input
                    id="durata_notti"
                    placeholder="es. 7 notti"
                    {...register("durata_notti")}
                  />
                </div>
              </div>

              {/* Pensione */}
              <div className="space-y-3">
                <Label>Pensione</Label>
                <div className="flex flex-wrap gap-4">
                  {(
                    [
                      { value: "no", label: "No" },
                      { value: "mezza", label: "Mezza Pensione" },
                      { value: "completa", label: "Pensione Completa" },
                    ] as const
                  ).map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`pensione-${value}`}
                        checked={(pensione || []).includes(value)}
                        onCheckedChange={() => togglePensione(value)}
                      />
                      <Label
                        htmlFor={`pensione-${value}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipo Voli */}
              <div className="space-y-2">
                <Label htmlFor="tipo_voli">Tipo Voli</Label>
                <Input
                  id="tipo_voli"
                  placeholder="es. Voli diretti di linea"
                  {...register("tipo_voli")}
                />
              </div>

              <Separator />

              {/* Etichette Deck */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Etichette Ponti</Label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="etichetta_primo_deck">Primo Ponte</Label>
                    <Input
                      id="etichetta_primo_deck"
                      placeholder="es. Main Deck"
                      {...register("etichetta_primo_deck")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etichetta_secondo_deck">Secondo Ponte</Label>
                    <Input
                      id="etichetta_secondo_deck"
                      placeholder="es. Middle Deck"
                      {...register("etichetta_secondo_deck")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etichetta_terzo_deck">Terzo Ponte</Label>
                    <Input
                      id="etichetta_terzo_deck"
                      placeholder="es. Superior Deck"
                      {...register("etichetta_terzo_deck")}
                    />
                  </div>
                </div>
              </div>

              <Separator />

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
                      bucket="cruises"
                    />
                  )}
                />
              </div>

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
        {/* TAB 2: PROGRAMMA (Itinerario)                                     */}
        {/* ================================================================= */}
        <TabsContent value="programma">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Programma della Crociera</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  itineraryDays.append({
                    numero_giorno: `${itineraryDays.fields.length + 1}`,
                    localita: "",
                    descrizione: "",
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Giorno
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {itineraryDays.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessun giorno nel programma. Clicca &quot;Aggiungi Giorno&quot; per iniziare.
                </p>
              )}

              {itineraryDays.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Giorno {index + 1}
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
                            itineraryDays,
                            index,
                            index - 1,
                            itineraryDays.fields.length,
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
                        disabled={index === itineraryDays.fields.length - 1}
                        onClick={() =>
                          moveItem(
                            itineraryDays,
                            index,
                            index + 1,
                            itineraryDays.fields.length,
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
                        onClick={() => itineraryDays.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Numero Giorno</Label>
                      <Input
                        placeholder="es. 1\u00B0 giorno"
                        {...register(
                          `itinerary_days.${index}.numero_giorno`,
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Localit\u00E0</Label>
                      <Input
                        placeholder="es. Budapest"
                        {...register(
                          `itinerary_days.${index}.localita`,
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      rows={4}
                      placeholder="Descrivi le attivit\u00E0 del giorno..."
                      {...register(
                        `itinerary_days.${index}.descrizione`,
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: CABINE                                                     */}
        {/* ================================================================= */}
        <TabsContent value="cabine">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cabine</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  cabins.append({
                    localita: "",
                    tipologia_camera: null,
                    ponte: null,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Cabina
              </Button>
            </CardHeader>
            <CardContent>
              {cabins.fields.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna cabina aggiunta. Clicca &quot;Aggiungi Cabina&quot; per iniziare.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Column headers (visible on sm+) */}
                  <div className="hidden gap-4 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <Label className="text-xs text-muted-foreground">Localit\u00E0</Label>
                    <Label className="text-xs text-muted-foreground">
                      Tipologia Camera
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Ponte
                    </Label>
                    <div className="w-8" />
                  </div>

                  {cabins.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:border-0 sm:p-0"
                    >
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">Localit\u00E0</Label>
                        <Input
                          placeholder="es. Ponte Principale"
                          {...register(`cabins.${index}.localita`)}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Tipologia Camera
                        </Label>
                        <Input
                          placeholder="es. Doppia"
                          {...register(`cabins.${index}.tipologia_camera`)}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Ponte
                        </Label>
                        <Input
                          placeholder="es. Main Deck"
                          {...register(`cabins.${index}.ponte`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 self-end text-destructive hover:text-destructive sm:self-center"
                        onClick={() => cabins.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 4: PARTENZE                                                   */}
        {/* ================================================================= */}
        <TabsContent value="partenze">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partenze</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  departures.append({
                    from_city: "",
                    data_partenza: "",
                    prezzo_main_deck: null,
                    prezzo_middle_deck: null,
                    prezzo_superior_deck: null,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Partenza
              </Button>
            </CardHeader>
            <CardContent>
              {departures.fields.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna partenza aggiunta.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Column headers (visible on sm+) */}
                  <div className="hidden gap-4 sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
                    <Label className="text-xs text-muted-foreground">Da</Label>
                    <Label className="text-xs text-muted-foreground">
                      Data Partenza
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Main Deck
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Middle Deck
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Superior Deck
                    </Label>
                    <div className="w-8" />
                  </div>

                  {departures.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] sm:border-0 sm:p-0"
                    >
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">Da</Label>
                        <Input
                          placeholder="es. Roma"
                          {...register(`departures.${index}.from_city`)}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Data Partenza
                        </Label>
                        <Input
                          type="date"
                          {...register(`departures.${index}.data_partenza`)}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Main Deck
                        </Label>
                        <Input
                          type="number"
                          placeholder="\u20AC"
                          {...register(`departures.${index}.prezzo_main_deck`, {
                            setValueAs: (v) =>
                              v === "" || v === null ? null : Number(v),
                          })}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Middle Deck
                        </Label>
                        <Input
                          placeholder="\u20AC"
                          {...register(`departures.${index}.prezzo_middle_deck`)}
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Superior Deck
                        </Label>
                        <Input
                          placeholder="\u20AC"
                          {...register(`departures.${index}.prezzo_superior_deck`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 self-end text-destructive hover:text-destructive sm:self-center"
                        onClick={() => departures.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 5: SUPPLEMENTI                                                */}
        {/* ================================================================= */}
        <TabsContent value="supplementi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Supplementi</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  supplements.append({ titolo: "", prezzo: null })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Supplemento
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplements.fields.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nessun supplemento aggiunto.
                </p>
              )}

              {supplements.fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Titolo</Label>
                    <Input
                      placeholder="es. Supplemento singola"
                      {...register(`supplements.${index}.titolo`)}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-xs">Prezzo</Label>
                    <Input
                      placeholder="\u20AC"
                      {...register(`supplements.${index}.prezzo`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => supplements.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 6: INCLUSO / ESCLUSO                                          */}
        {/* ================================================================= */}
        <TabsContent value="incluso-escluso">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* La quota comprende */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  La quota comprende
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inclusions.append({ titolo: "" })}
                >
                  <Plus className="mr-2 size-4" />
                  Aggiungi
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {inclusions.fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nessun elemento aggiunto.
                  </p>
                )}

                {inclusions.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="es. Pensione completa a bordo"
                      {...register(`inclusions.${index}.titolo`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => inclusions.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* La quota non comprende */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  La quota non comprende
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => exclusions.append({ titolo: "" })}
                >
                  <Plus className="mr-2 size-4" />
                  Aggiungi
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {exclusions.fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nessun elemento aggiunto.
                  </p>
                )}

                {exclusions.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="es. Bevande extra"
                      {...register(`exclusions.${index}.titolo`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => exclusions.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 7: TERMINI & PENALI                                           */}
        {/* ================================================================= */}
        <TabsContent value="termini">
          <div className="space-y-6">
            {/* Termini d'impegno */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Termini d&apos;impegno</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => terms.append({ titolo: "" })}
                >
                  <Plus className="mr-2 size-4" />
                  Aggiungi
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {terms.fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nessun termine aggiunto.
                  </p>
                )}

                {terms.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="es. Acconto del 30% alla prenotazione"
                      {...register(`terms.${index}.titolo`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => terms.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Penali di cancellazione */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Penali di cancellazione</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => penalties.append({ titolo: "" })}
                >
                  <Plus className="mr-2 size-4" />
                  Aggiungi
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {penalties.fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nessuna penale aggiunta.
                  </p>
                )}

                {penalties.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="es. Fino a 30gg prima: penale 25%"
                      {...register(`penalties.${index}.titolo`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => penalties.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Note Penali */}
            <Card>
              <CardHeader>
                <CardTitle>Note Penali</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  placeholder="Eventuali note sulle penali di cancellazione..."
                  {...register("nota_penali")}
                />
              </CardContent>
            </Card>

            {/* Note Importanti */}
            <Card>
              <CardHeader>
                <CardTitle>Note Importanti</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={6}
                  placeholder="Note importanti per il viaggiatore..."
                  {...register("note_importanti")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 8: GALLERY & PDF                                              */}
        {/* ================================================================= */}
        <TabsContent value="gallery">
          <div className="space-y-6">
            {/* Gallery */}
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
                        Clicca &quot;Aggiungi Immagine&quot; per aggiungere immagini alla gallery della crociera
                      </p>
                    </div>
                  </div>
                )}

                {gallery.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">URL Immagine</Label>
                      <Input
                        placeholder="https://..."
                        {...register(`gallery.${index}.image_url`)}
                      />
                    </div>
                    <div className="w-48 space-y-2">
                      <Label className="text-xs">Didascalia</Label>
                      <Input
                        placeholder="Descrizione immagine"
                        {...register(`gallery.${index}.caption`)}
                      />
                    </div>
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
                ))}
              </CardContent>
            </Card>

            {/* Programma PDF */}
            <Card>
              <CardHeader>
                <CardTitle>Programma PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  control={control}
                  name="programma_pdf_url"
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onUpload={field.onChange}
                      bucket="cruises"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
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
          <Link href="/admin/crociere">
            <ArrowLeft className="mr-2 size-4" />
            Annulla
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Salvataggio..." : initialData ? "Aggiorna Crociera" : "Crea Crociera"}
        </Button>
      </div>
    </form>
  );
}
