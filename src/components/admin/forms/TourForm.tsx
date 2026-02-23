"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTour } from "@/app/admin/tours/actions";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ArrowLeft,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";
import LocationSearchPopover from "@/components/admin/LocationSearchPopover";
import type { LocationSearchResult } from "@/components/admin/LocationSearchPopover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Autocomplete } from "@/components/ui/autocomplete";
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

import type { PensioneType, TourWithRelations } from "@/lib/types";

// =============================================================================
// Zod Schema
// =============================================================================

const itineraryDaySchema = z.object({
  numero_giorno: z.string().min(1, "Obbligatorio"),
  localita: z.string().min(1, "Obbligatorio"),
  descrizione: z.string(),
});

const hotelSchema = z.object({
  nome_albergo: z.string().min(1, "Obbligatorio"),
  stelle: z.number().min(1).max(5),
});

const hotelGroupSchema = z.object({
  localita: z.string().min(1, "Obbligatorio"),
  hotels: z.array(hotelSchema),
});

const departureSchema = z.object({
  from_city: z.string().min(1, "Obbligatorio"),
  data_partenza: z.string(),
  prezzo_3_stelle: z.number().nullable(),
  prezzo_4_stelle: z.string().nullable(),
});

const supplementSchema = z.object({
  titolo: z.string(),
  prezzo: z.string().nullable(),
});

const excursionSchema = z.object({
  titolo: z.string().min(1, "Obbligatorio"),
  descrizione: z.string().nullable(),
  prezzo: z.number().nullable(),
});

const textItemSchema = z.object({
  titolo: z.string(),
});

const tourFormSchema = z.object({
  // Tab 1: Info Base
  title: z.string().min(1, "Il titolo è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  destination_id: z.string().nullable(),
  a_partire_da: z.string().nullable(),
  prezzo_su_richiesta: z.boolean(),
  numero_persone: z.number().min(1),
  durata_notti: z.string().nullable(),
  pensione: z.array(z.enum(["no", "mezza", "completa"])),
  tipo_voli: z.string().nullable(),
  status: z.enum(["draft", "published"]),

  // Tab 2: Programma
  itinerary_days: z.array(itineraryDaySchema),

  // Tab 3: Alberghi
  hotel_groups: z.array(hotelGroupSchema),

  // Tab 4: Partenze
  departures: z.array(departureSchema),

  // Tab 5: Supplementi & Extra
  supplements: z.array(supplementSchema),
  optional_excursions: z.array(excursionSchema),

  // Tab 6: Incluso / Escluso
  inclusions: z.array(textItemSchema),
  exclusions: z.array(textItemSchema),

  // Tab 7: Termini & Penali
  terms: z.array(textItemSchema),
  penalties: z.array(textItemSchema),
  nota_penali: z.string().nullable(),
  note_importanti: z.string().nullable(),

  // Tab 8: Gallery & PDF (placeholder)
  gallery_urls: z.array(z.string()),
  programma_pdf_url: z.string().nullable(),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

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

interface TourFormProps {
  initialData?: TourWithRelations;
  destinations?: { id: string; name: string; slug: string; coordinate: string | null }[];
  localities?: string[];
}

// =============================================================================
// Component
// =============================================================================

export default function TourForm({ initialData, destinations = [], localities = [] }: TourFormProps) {
  // ---------------------------------------------------------------------------
  // Form setup
  // ---------------------------------------------------------------------------

  const defaultValues: TourFormValues = initialData
    ? {
        title: initialData.title,
        slug: initialData.slug,
        destination_id: initialData.destination_id,
        a_partire_da: initialData.a_partire_da,
        prezzo_su_richiesta: initialData.prezzo_su_richiesta,
        numero_persone: initialData.numero_persone,
        durata_notti: initialData.durata_notti,
        pensione: initialData.pensione,
        tipo_voli: initialData.tipo_voli,
        status: initialData.status,
        itinerary_days: initialData.itinerary_days.map((d) => ({
          numero_giorno: d.numero_giorno,
          localita: d.localita,
          descrizione: d.descrizione,
        })),
        hotel_groups: [], // TODO: Group hotels by localita from initialData
        departures: initialData.departures.map((d) => ({
          from_city: d.from_city,
          data_partenza: d.data_partenza,
          prezzo_3_stelle: d.prezzo_3_stelle,
          prezzo_4_stelle: d.prezzo_4_stelle,
        })),
        supplements: initialData.supplements.map((s) => ({
          titolo: s.titolo,
          prezzo: s.prezzo,
        })),
        optional_excursions: initialData.optional_excursions.map((e) => ({
          titolo: e.titolo,
          descrizione: e.descrizione,
          prezzo: e.prezzo,
        })),
        inclusions: initialData.inclusions
          .filter((i) => i.is_included)
          .map((i) => ({ titolo: i.titolo })),
        exclusions: initialData.inclusions
          .filter((i) => !i.is_included)
          .map((i) => ({ titolo: i.titolo })),
        terms: initialData.terms.map((t) => ({ titolo: t.titolo })),
        penalties: initialData.penalties.map((p) => ({ titolo: p.titolo })),
        nota_penali: initialData.nota_penali,
        note_importanti: initialData.note_importanti,
        gallery_urls: initialData.gallery.map((g) => g.image_url),
        programma_pdf_url: initialData.programma_pdf_url,
      }
    : {
        title: "",
        slug: "",
        destination_id: null,
        a_partire_da: null,
        prezzo_su_richiesta: false,
        numero_persone: 30,
        durata_notti: null,
        pensione: [],
        tipo_voli: null,
        status: "draft",
        itinerary_days: [],
        hotel_groups: [],
        departures: [],
        supplements: [],
        optional_excursions: [],
        inclusions: [],
        exclusions: [],
        terms: [],
        penalties: [],
        nota_penali: null,
        note_importanti: null,
        gallery_urls: [],
        programma_pdf_url: null,
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues,
  });

  // Watch title for auto-slug
  const title = watch("title");
  const status = watch("status");
  const pensione = watch("pensione");

  // ---------------------------------------------------------------------------
  // Field Arrays
  // ---------------------------------------------------------------------------

  const itineraryDays = useFieldArray({ control, name: "itinerary_days" });
  const hotelGroups = useFieldArray({ control, name: "hotel_groups" });
  const departures = useFieldArray({ control, name: "departures" });
  const supplements = useFieldArray({ control, name: "supplements" });
  const excursions = useFieldArray({ control, name: "optional_excursions" });
  const inclusions = useFieldArray({ control, name: "inclusions" });
  const exclusions = useFieldArray({ control, name: "exclusions" });
  const terms = useFieldArray({ control, name: "terms" });
  const penalties = useFieldArray({ control, name: "penalties" });

  // ---------------------------------------------------------------------------
  // Locations map (localita name → coordinates)
  // ---------------------------------------------------------------------------

  const [locationsMap, setLocationsMap] = useState<Record<string, { lat: number; lng: number }>>(() => {
    if (!initialData?.locations) return {};
    const map: Record<string, { lat: number; lng: number }> = {};
    for (const loc of initialData.locations) {
      if (loc.nome && loc.coordinate) {
        const parts = loc.coordinate.split(",").map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          map[loc.nome] = { lat: parts[0], lng: parts[1] };
        }
      }
    }
    return map;
  });

  const handleLocationSearch = (index: number, result: LocationSearchResult) => {
    setValue(`itinerary_days.${index}.localita`, result.name);
    setLocationsMap((prev) => ({
      ...prev,
      [result.name]: { lat: result.lat, lng: result.lng },
    }));
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const [serverError, setServerError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();

  const onSubmit = async (data: TourFormValues) => {
    setServerError(null);
    setValidationError(null);
    try {
      const result = await saveTour({
        ...data,
        inclusions: data.inclusions.filter((i) => i.titolo.trim()),
        exclusions: data.exclusions.filter((i) => i.titolo.trim()),
        terms: data.terms.filter((i) => i.titolo.trim()),
        penalties: data.penalties.filter((i) => i.titolo.trim()),
        supplements: data.supplements.filter((s) => s.titolo.trim()),
        id: initialData?.id,
        locations: locationsMap,
      });
      if (!result.success) {
        setServerError(result.error);
      } else {
        router.push("/admin/tours");
      }
    } catch {
      setServerError("Errore imprevisto durante il salvataggio.");
    }
  };

  const onFormError = (formErrors: Record<string, unknown>) => {
    const fields = Object.keys(formErrors);
    setValidationError(
      `Ci sono errori di validazione nei campi: ${fields.join(", ")}. Controlla e riprova.`
    );
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
    <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
      <Tabs defaultValue="info-base">
        {/* Tabs Navigation */}
        <TabsList className="flex w-full flex-wrap" variant="line">
          <TabsTrigger value="info-base">Info Base</TabsTrigger>
          <TabsTrigger value="programma">Programma</TabsTrigger>
          <TabsTrigger value="alberghi">Alberghi</TabsTrigger>
          <TabsTrigger value="partenze">Partenze</TabsTrigger>
          <TabsTrigger value="supplementi">Supplementi &amp; Extra</TabsTrigger>
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
                  placeholder="es. Tour della Grecia Classica"
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
                  placeholder="tour-grecia-classica"
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
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

              <Separator />

              {/* Prezzo Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="a_partire_da">A Partire Da</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                    <Input
                      id="a_partire_da"
                      type="number"
                      step="any"
                      min="0"
                      className="pl-7"
                      placeholder="1290"
                      {...register("a_partire_da")}
                    />
                  </div>
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

              {/* Numero Persone & Durata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numero_persone">Numero Persone</Label>
                  <Input
                    id="numero_persone"
                    type="number"
                    min={1}
                    {...register("numero_persone", { valueAsNumber: true })}
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
              <CardTitle>Programma del Viaggio</CardTitle>
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
                        placeholder="es. 1° giorno"
                        {...register(
                          `itinerary_days.${index}.numero_giorno`,
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Località</Label>
                      <div className="flex gap-2">
                        <Controller
                          control={control}
                          name={`itinerary_days.${index}.localita`}
                          render={({ field }) => (
                            <Autocomplete
                              value={field.value}
                              onChange={field.onChange}
                              suggestions={localities}
                              placeholder="es. Atene"
                            />
                          )}
                        />
                        <LocationSearchPopover
                          currentLocationName={watch(`itinerary_days.${index}.localita`)}
                          onSelect={(result) => handleLocationSearch(index, result)}
                        />
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Latitudine</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="es. 37.9838"
                            value={locationsMap[watch(`itinerary_days.${index}.localita`)]?.lat ?? ""}
                            onChange={(e) => {
                              const loc = watch(`itinerary_days.${index}.localita`);
                              if (!loc) return;
                              const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              if (val !== undefined && isNaN(val)) return;
                              setLocationsMap((prev) => ({
                                ...prev,
                                [loc]: { lat: val ?? 0, lng: prev[loc]?.lng ?? 0 },
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Longitudine</Label>
                          <Input
                            type="number"
                            step="any"
                            placeholder="es. 23.7275"
                            value={locationsMap[watch(`itinerary_days.${index}.localita`)]?.lng ?? ""}
                            onChange={(e) => {
                              const loc = watch(`itinerary_days.${index}.localita`);
                              if (!loc) return;
                              const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              if (val !== undefined && isNaN(val)) return;
                              setLocationsMap((prev) => ({
                                ...prev,
                                [loc]: { lat: prev[loc]?.lat ?? 0, lng: val ?? 0 },
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TODO: Replace Textarea with RichTextEditor */}
                  <div className="mt-4 space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      rows={4}
                      placeholder="Descrivi le attività del giorno..."
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
        {/* TAB 3: ALBERGHI                                                   */}
        {/* ================================================================= */}
        <TabsContent value="alberghi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alberghi</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  hotelGroups.append({
                    localita: "",
                    hotels: [{ nome_albergo: "", stelle: 3 }],
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Località
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {hotelGroups.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessun albergo aggiunto. Clicca &quot;Aggiungi Località&quot; per iniziare.
                </p>
              )}

              {hotelGroups.fields.map((groupField, groupIndex) => (
                <HotelGroupSection
                  key={groupField.id}
                  groupIndex={groupIndex}
                  register={register}
                  control={control}
                  onRemoveGroup={() => hotelGroups.remove(groupIndex)}
                />
              ))}
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
                    prezzo_3_stelle: null,
                    prezzo_4_stelle: null,
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
                  <div className="hidden gap-4 sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                    <Label className="text-xs text-muted-foreground">Da</Label>
                    <Label className="text-xs text-muted-foreground">
                      Data Partenza
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Prezzo 3 Stelle
                    </Label>
                    <Label className="text-xs text-muted-foreground">
                      Prezzo 4 Stelle
                    </Label>
                    <div className="w-8" />
                  </div>

                  {departures.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-4 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:border-0 sm:p-0"
                    >
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">Da</Label>
                        <Input
                          placeholder="es. Napoli"
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
                          Prezzo 3 Stelle
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            className="pl-7"
                            placeholder="0"
                            {...register(`departures.${index}.prezzo_3_stelle`, {
                              setValueAs: (v) =>
                                v === "" || v === null ? null : Number(v),
                            })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-0">
                        <Label className="text-xs sm:hidden">
                          Prezzo 4 Stelle
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            className="pl-7"
                            placeholder="0"
                            {...register(`departures.${index}.prezzo_4_stelle`)}
                          />
                        </div>
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
        {/* TAB 5: SUPPLEMENTI & EXTRA                                        */}
        {/* ================================================================= */}
        <TabsContent value="supplementi">
          <div className="space-y-6">
            {/* Supplementi */}
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
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          className="pl-7"
                          placeholder="0"
                          {...register(`supplements.${index}.prezzo`)}
                        />
                      </div>
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

            {/* Escursioni Facoltative */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Escursioni Facoltative</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    excursions.append({
                      titolo: "",
                      descrizione: null,
                      prezzo: null,
                    })
                  }
                >
                  <Plus className="mr-2 size-4" />
                  Aggiungi Escursione
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {excursions.fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nessuna escursione facoltativa aggiunta.
                  </p>
                )}

                {excursions.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Escursione {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => excursions.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <Label>Titolo</Label>
                        <Input
                          placeholder="es. Escursione a Delfi"
                          {...register(
                            `optional_excursions.${index}.titolo`,
                          )}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Prezzo</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            className="pl-7"
                            placeholder="0"
                            {...register(
                              `optional_excursions.${index}.prezzo`,
                              {
                                setValueAs: (v) =>
                                  v === "" || v === null ? null : Number(v),
                              },
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label>Descrizione</Label>
                      <Textarea
                        rows={3}
                        placeholder="Descrizione dell'escursione..."
                        {...register(
                          `optional_excursions.${index}.descrizione`,
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
                      placeholder="es. Volo andata e ritorno"
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
                      placeholder="es. Mance e extra personali"
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
                {/* TODO: Replace Textarea with RichTextEditor */}
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
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  control={control}
                  name="gallery_urls"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onUpload={field.onChange}
                      bucket="tours"
                      multiple
                      maxFiles={20}
                    />
                  )}
                />
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
                      bucket="tours"
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

      {(serverError || validationError) && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError || validationError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/tours">
            <ArrowLeft className="mr-2 size-4" />
            Annulla
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Salvataggio..." : initialData ? "Aggiorna Tour" : "Crea Tour"}
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Sub-component: HotelGroupSection
// =============================================================================
// Extracted as a separate component to cleanly manage nested useFieldArray.

interface HotelGroupSectionProps {
  groupIndex: number;
  register: ReturnType<typeof useForm<TourFormValues>>["register"];
  control: ReturnType<typeof useForm<TourFormValues>>["control"];
  onRemoveGroup: () => void;
}

function HotelGroupSection({
  groupIndex,
  register,
  control,
  onRemoveGroup,
}: HotelGroupSectionProps) {
  const hotels = useFieldArray({
    control,
    name: `hotel_groups.${groupIndex}.hotels`,
  });

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Label>Località</Label>
          <Input
            placeholder="es. Atene"
            {...register(`hotel_groups.${groupIndex}.localita`)}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-3 mt-6 size-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemoveGroup}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="ml-4 space-y-3 border-l-2 border-border pl-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Alberghi
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              hotels.append({ nome_albergo: "", stelle: 3 })
            }
          >
            <Plus className="mr-1 size-3" />
            Aggiungi Albergo
          </Button>
        </div>

        {hotels.fields.length === 0 && (
          <p className="py-2 text-xs text-muted-foreground">
            Nessun albergo per questa località.
          </p>
        )}

        {hotels.fields.map((hotelField, hotelIndex) => (
          <div key={hotelField.id} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nome Albergo</Label>
              <Input
                placeholder="es. Hotel Acropolis"
                {...register(
                  `hotel_groups.${groupIndex}.hotels.${hotelIndex}.nome_albergo`,
                )}
              />
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-xs">Stelle</Label>
              <Input
                type="number"
                min={1}
                max={5}
                {...register(
                  `hotel_groups.${groupIndex}.hotels.${hotelIndex}.stelle`,
                  { valueAsNumber: true },
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => hotels.remove(hotelIndex)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
