"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveShipDecksAndCabins } from "@/app/admin/flotta/actions";
import { getShipCabinsAndDecks } from "@/app/admin/crociere/actions";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Ship,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShipCabinDetail, ShipDeck } from "@/lib/types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const deckSchema = z.object({
  nome: z.string().min(1, "Il nome del ponte è obbligatorio"),
});

const cabinSchema = z.object({
  titolo: z.string().min(1, "Il titolo è obbligatorio"),
  immagine_url: z.string().nullable(),
  tipologia: z
    .enum(["Singola", "Doppia", "Tripla", "Quadrupla"])
    .nullable(),
  descrizione: z.string().nullable(),
  deck_index: z.number().int().min(-1),
});

const formSchema = z.object({
  decks: z.array(deckSchema),
  cabin_details: z.array(cabinSchema),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditShipCabinsDialogProps {
  shipId: string;
  shipName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function moveItem(
  fieldArray: { move: (from: number, to: number) => void },
  from: number,
  to: number,
  length: number
) {
  if (to < 0 || to >= length) return;
  fieldArray.move(from, to);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditShipCabinsDialog({
  shipId,
  shipName,
  open,
  onOpenChange,
  onSaved,
}: EditShipCabinsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { decks: [], cabin_details: [] },
  });

  const decksArray = useFieldArray({ control, name: "decks" });
  const cabinDetails = useFieldArray({ control, name: "cabin_details" });
  const watchedDecks = watch("decks");

  // Load data when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getShipCabinsAndDecks(shipId).then(({ cabins, decks }) => {
      const typedDecks = decks as ShipDeck[];
      const typedCabins = cabins as ShipCabinDetail[];

      // Build deck_index map: deck_id → index in sorted decks array
      const deckIndexMap = new Map<string, number>();
      typedDecks.forEach((d, i) => deckIndexMap.set(d.id, i));

      reset({
        decks: typedDecks.map((d) => ({ nome: d.nome })),
        cabin_details: typedCabins.map((c) => ({
          titolo: c.titolo,
          immagine_url: c.immagine_url,
          tipologia: c.tipologia,
          descrizione: c.descrizione,
          deck_index: c.deck_id ? (deckIndexMap.get(c.deck_id) ?? -1) : -1,
        })),
      });
      setLoading(false);
    });
  }, [open, shipId, reset]);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await saveShipDecksAndCabins({
        shipId,
        decks: data.decks,
        cabin_details: data.cabin_details,
      });
      if (result.success) {
        toast.success("Ponti e cabine aggiornati");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="size-5" />
            Modifica Ponti &amp; Cabine di {shipName}
          </DialogTitle>
          <DialogDescription>
            Modifica i ponti e le cabine della nave. Le modifiche verranno salvate direttamente.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Caricamento...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <form id="ship-cabins-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-4">
              {/* --- Ponti Section --- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Ponti della Nave</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => decksArray.append({ nome: "" })}
                  >
                    <Plus className="mr-2 size-4" />
                    Aggiungi Ponte
                  </Button>
                </div>
                <div className="space-y-2">
                  {decksArray.fields.length === 0 && (
                    <p className="py-3 text-center text-sm text-muted-foreground">
                      Nessun ponte definito.
                    </p>
                  )}
                  {decksArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        placeholder="es. Main Deck, Middle Deck"
                        {...register(`decks.${index}.nome`)}
                      />
                      {errors.decks?.[index]?.nome && (
                        <p className="text-xs text-destructive">
                          {errors.decks[index].nome.message}
                        </p>
                      )}
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === 0}
                          onClick={() => moveItem(decksArray, index, index - 1, decksArray.fields.length)}
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === decksArray.fields.length - 1}
                          onClick={() => moveItem(decksArray, index, index + 1, decksArray.fields.length)}
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => decksArray.remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Cabine Section --- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Dettaglio Cabine</h3>
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
                        deck_index: -1,
                      })
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    Aggiungi Cabina
                  </Button>
                </div>
                <div className="space-y-4">
                  {cabinDetails.fields.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nessuna cabina aggiunta.
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
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={index === 0}
                            onClick={() => moveItem(cabinDetails, index, index - 1, cabinDetails.fields.length)}
                          >
                            <ChevronUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={index === cabinDetails.fields.length - 1}
                            onClick={() => moveItem(cabinDetails, index, index + 1, cabinDetails.fields.length)}
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

                      <div className="grid gap-4 sm:grid-cols-3">
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
                            render={({ field: f }) => (
                              <Select
                                value={f.value || ""}
                                onValueChange={(val) =>
                                  f.onChange(val === "" ? null : val)
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

                        {/* Ponte */}
                        <div className="space-y-2">
                          <Label>Ponte</Label>
                          <Controller
                            control={control}
                            name={`cabin_details.${index}.deck_index`}
                            render={({ field: f }) => (
                              <Select
                                value={String(f.value ?? -1)}
                                onValueChange={(val) =>
                                  f.onChange(parseInt(val, 10))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleziona ponte" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-1">Nessun ponte</SelectItem>
                                  {watchedDecks.map((d, di) => (
                                    <SelectItem key={di} value={String(di)}>
                                      {d.nome || `Ponte ${di + 1}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      {/* Immagine */}
                      <div className="mt-4 space-y-2">
                        <Label>Immagine Cabina</Label>
                        <Controller
                          control={control}
                          name={`cabin_details.${index}.immagine_url`}
                          render={({ field: f }) => (
                            <ImageUpload
                              value={f.value ? [f.value] : []}
                              onUpload={(urls) => f.onChange(urls[0] || null)}
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
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            form="ship-cabins-form"
            disabled={isPending || loading}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salva Modifiche
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
