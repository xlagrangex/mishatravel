"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCruise, getShipCabinsAndDecks } from "@/app/admin/crociere/actions";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Ship,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";
import LocationSearchPopover from "@/components/admin/LocationSearchPopover";
import type { LocationSearchResult } from "@/components/admin/LocationSearchPopover";

import { toast } from "sonner";
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
import DestinationSelect from "@/components/admin/DestinationSelect";

import type {
  PensioneType,
  CruiseWithRelations,
  ShipCabinDetail,
  ShipDeck,
} from "@/lib/types";

// =============================================================================
// Zod Schema
// =============================================================================

const itineraryDaySchema = z.object({
  numero_giorno: z.string().min(1, "Obbligatorio"),
  localita: z.string().min(1, "Obbligatorio"),
  descrizione: z.string(),
});

const departurePriceSchema = z.object({
  cabin_id: z.string(),
  prezzo: z.string().nullable(),
});

const departureSchema = z.object({
  from_city: z.string().min(1, "Obbligatorio"),
  data_partenza: z.string(),
  prices: z.array(departurePriceSchema),
});

const supplementSchema = z.object({
  titolo: z.string(),
  prezzo: z.string().nullable(),
});

const textItemSchema = z.object({
  titolo: z.string(),
});

const galleryItemSchema = z.object({
  image_url: z.string().min(1, "URL obbligatorio"),
  caption: z.string().nullable(),
});

const cruiseFormSchema = z.object({
  // Tab 1: Info Base
  title: z.string().min(1, "Il titolo è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
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
  note_importanti: z.string().nullable(),
  nota_penali: z.string().nullable(),
  programma_pdf_url: z.string().nullable(),
  status: z.enum(["draft", "published"]),

  // Tab 2: Programma
  itinerary_days: z.array(itineraryDaySchema),

  // Tab 3: Partenze
  departures: z.array(departureSchema),

  // Tab 4: Supplementi
  supplements: z.array(supplementSchema),

  // Tab 5: Incluso / Escluso
  inclusions: z.array(textItemSchema),
  exclusions: z.array(textItemSchema),

  // Tab 6: Termini & Penali
  terms: z.array(textItemSchema),
  penalties: z.array(textItemSchema),

  // Tab 7: Gallery & PDF
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

/** Group cabins by their deck for display. */
function groupCabinsByDeck(
  cabins: ShipCabinDetail[],
  decks: ShipDeck[]
): { deck: ShipDeck | null; cabins: ShipCabinDetail[] }[] {
  const groups: { deck: ShipDeck | null; cabins: ShipCabinDetail[] }[] = [];
  const grouped = new Map<string | null, ShipCabinDetail[]>();

  for (const cabin of cabins) {
    const key = cabin.deck_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(cabin);
  }

  // Add deck groups in deck sort_order
  for (const deck of decks) {
    const deckCabins = grouped.get(deck.id) || [];
    if (deckCabins.length > 0) {
      groups.push({ deck, cabins: deckCabins });
    }
  }

  // Cabins with no deck
  const noDeckCabins = grouped.get(null) || [];
  if (noDeckCabins.length > 0) {
    groups.push({ deck: null, cabins: noDeckCabins });
  }

  return groups;
}

// =============================================================================
// Props
// =============================================================================

interface CruiseFormProps {
  initialData?: CruiseWithRelations;
  ships?: { id: string; name: string }[];
  destinations?: { id: string; name: string; slug: string; coordinate: string | null; macro_area: string | null }[];
  localities?: string[];
}

// =============================================================================
// Component
// =============================================================================

export default function CruiseForm({ initialData, ships = [], destinations = [], localities = [] }: CruiseFormProps) {
  // ---------------------------------------------------------------------------
  // Ship cabins & decks state
  // ---------------------------------------------------------------------------

  const [shipCabins, setShipCabins] = useState<ShipCabinDetail[]>(
    initialData?.ship_cabins ?? []
  );
  const [shipDecks, setShipDecks] = useState<ShipDeck[]>(
    initialData?.ship_decks ?? []
  );
  const [loadingCabins, setLoadingCabins] = useState(false);

  // ---------------------------------------------------------------------------
  // Form setup
  // ---------------------------------------------------------------------------

  /** Build the prices array for a departure based on ship cabins. */
  function buildPricesForDeparture(
    cabins: ShipCabinDetail[],
    departureId?: string,
    existingPrices?: { departure_id: string; cabin_id: string; prezzo: string | null }[]
  ) {
    return cabins.map((cabin) => {
      const found = existingPrices?.find(
        (p) => p.departure_id === departureId && p.cabin_id === cabin.id
      );
      return {
        cabin_id: cabin.id,
        prezzo: found?.prezzo ?? null,
      };
    });
  }

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
        note_importanti: initialData.note_importanti,
        nota_penali: initialData.nota_penali,
        programma_pdf_url: initialData.programma_pdf_url,
        status: initialData.status,
        itinerary_days: initialData.itinerary_days.map((d) => ({
          numero_giorno: d.numero_giorno,
          localita: d.localita,
          descrizione: d.descrizione,
        })),
        departures: initialData.departures.map((d) => ({
          from_city: d.from_city,
          data_partenza: d.data_partenza,
          prices: buildPricesForDeparture(
            initialData.ship_cabins ?? [],
            d.id,
            initialData.departure_prices ?? []
          ),
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
        note_importanti: null,
        nota_penali: null,
        programma_pdf_url: null,
        status: "draft",
        itinerary_days: [],
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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CruiseFormValues>({
    resolver: zodResolver(cruiseFormSchema),
    defaultValues,
  });

  // Watch fields
  const title = watch("title");
  const status = watch("status");
  const pensione = watch("pensione");
  const watchedShipId = watch("ship_id");

  // ---------------------------------------------------------------------------
  // Fetch ship cabins when ship_id changes
  // ---------------------------------------------------------------------------

  const prevShipIdRef = useRef(watchedShipId);

  useEffect(() => {
    if (watchedShipId === prevShipIdRef.current) return;
    prevShipIdRef.current = watchedShipId;

    if (!watchedShipId) {
      setShipCabins([]);
      setShipDecks([]);
      return;
    }

    setLoadingCabins(true);
    getShipCabinsAndDecks(watchedShipId).then(({ cabins, decks }) => {
      setShipCabins(cabins as ShipCabinDetail[]);
      setShipDecks(decks as ShipDeck[]);
      setLoadingCabins(false);

      // Rebuild prices for all existing departures with new cabin structure
      const currentDeps = getValues("departures");
      for (let i = 0; i < currentDeps.length; i++) {
        setValue(
          `departures.${i}.prices`,
          (cabins as ShipCabinDetail[]).map((c) => ({
            cabin_id: c.id,
            prezzo: null,
          }))
        );
      }
    });
  }, [watchedShipId, getValues, setValue]);

  // ---------------------------------------------------------------------------
  // Field Arrays
  // ---------------------------------------------------------------------------

  const itineraryDays = useFieldArray({ control, name: "itinerary_days" });
  const departures = useFieldArray({ control, name: "departures" });
  const supplements = useFieldArray({ control, name: "supplements" });
  const inclusions = useFieldArray({ control, name: "inclusions" });
  const exclusions = useFieldArray({ control, name: "exclusions" });
  const terms = useFieldArray({ control, name: "terms" });
  const penalties = useFieldArray({ control, name: "penalties" });
  const gallery = useFieldArray({ control, name: "gallery" });

  // ---------------------------------------------------------------------------
  // Locations map (localita name -> coordinates)
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
  const router = useRouter();

  const onSubmit = async (data: CruiseFormValues) => {
    setServerError(null);
    try {
      const result = await saveCruise({
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
        toast.error(result.error);
      } else {
        toast.success("Crociera salvata con successo");
        router.push("/admin/crociere");
      }
    } catch {
      const msg = "Errore imprevisto durante il salvataggio.";
      setServerError(msg);
      toast.error(msg);
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
  // Cabin groups for departure pricing display
  // ---------------------------------------------------------------------------

  const cabinGroups = groupCabinsByDeck(shipCabins, shipDecks);

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
                    <DestinationSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      destinations={destinations}
                    />
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
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                    <Input
                      id="a_partire_da"
                      type="number"
                      step="any"
                      min="0"
                      className="pl-7"
                      placeholder="1490"
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
                              placeholder="es. Budapest"
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
        {/* TAB 3: PARTENZE (con prezzi per cabina)                           */}
        {/* ================================================================= */}
        <TabsContent value="partenze">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partenze &amp; Prezzi per Cabina</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  departures.append({
                    from_city: "",
                    data_partenza: "",
                    prices: shipCabins.map((c) => ({
                      cabin_id: c.id,
                      prezzo: null,
                    })),
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Aggiungi Partenza
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning if no ship selected */}
              {!watchedShipId && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <Ship className="size-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Seleziona una nave nel tab &quot;Info Base&quot; per gestire i prezzi per cabina nelle partenze.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {loadingCabins && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Caricamento cabine della nave...</span>
                </div>
              )}

              {/* No cabins configured */}
              {watchedShipId && !loadingCabins && shipCabins.length === 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <Ship className="size-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">
                    La nave selezionata non ha cabine configurate. Configura le cabine nella sezione Flotta.
                  </p>
                </div>
              )}

              {departures.fields.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nessuna partenza aggiunta.
                </p>
              )}

              {departures.fields.map((field, depIndex) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/30 p-4 space-y-4"
                >
                  {/* Departure header: city, date, actions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Città partenza</Label>
                        <Input
                          placeholder="es. Roma"
                          {...register(`departures.${depIndex}.from_city`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Data Partenza</Label>
                        <Input
                          type="date"
                          {...register(`departures.${depIndex}.data_partenza`)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 pt-5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={depIndex === 0}
                        onClick={() =>
                          moveItem(departures, depIndex, depIndex - 1, departures.fields.length)
                        }
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={depIndex === departures.fields.length - 1}
                        onClick={() =>
                          moveItem(departures, depIndex, depIndex + 1, departures.fields.length)
                        }
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => departures.remove(depIndex)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Per-cabin pricing grid */}
                  {shipCabins.length > 0 && (
                    <div className="space-y-3 rounded-md border bg-background p-3">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Prezzi per Cabina
                      </Label>
                      {cabinGroups.map((group) => (
                        <div key={group.deck?.id ?? "no-deck"} className="space-y-2">
                          <p className="text-xs font-medium text-primary">
                            {group.deck?.nome ?? "Senza ponte"}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {group.cabins.map((cabin) => {
                              // Find the price index for this cabin in the departure
                              const priceIndex = shipCabins.findIndex(
                                (c) => c.id === cabin.id
                              );
                              if (priceIndex < 0) return null;
                              return (
                                <div key={cabin.id} className="flex items-center gap-2">
                                  <input
                                    type="hidden"
                                    {...register(
                                      `departures.${depIndex}.prices.${priceIndex}.cabin_id`
                                    )}
                                  />
                                  <Label className="min-w-0 flex-1 truncate text-xs">
                                    {cabin.titolo}
                                  </Label>
                                  <div className="relative w-28">
                                    <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      className="pl-6"
                                      placeholder="0"
                                      {...register(
                                        `departures.${depIndex}.prices.${priceIndex}.prezzo`
                                      )}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 4: SUPPLEMENTI                                                */}
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
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 5: INCLUSO / ESCLUSO                                          */}
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
        {/* TAB 6: TERMINI & PENALI                                           */}
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
        {/* TAB 7: GALLERY & PDF                                              */}
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
                    className="rounded-lg border bg-muted/30 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
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
                    <div className="space-y-2">
                      <Label className="text-xs">Immagine</Label>
                      <Controller
                        control={control}
                        name={`gallery.${index}.image_url`}
                        render={({ field: imgField }) => (
                          <ImageUpload
                            value={imgField.value ? [imgField.value] : []}
                            onUpload={(urls) => imgField.onChange(urls[0] || "")}
                            bucket="cruises"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Didascalia</Label>
                      <Input
                        placeholder="Descrizione immagine"
                        {...register(`gallery.${index}.caption`)}
                      />
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
