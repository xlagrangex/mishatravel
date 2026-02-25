"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Users,
  Bed,
  ClipboardList,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Ship,
} from "lucide-react";
import type {
  CruiseDeparture,
  CruiseSupplement,
  ShipCabinDetail,
  ShipDeck,
  CruiseDeparturePrice,
} from "@/lib/types";
import {
  createQuoteRequest,
  type CruiseQuoteInput,
} from "@/app/(agenzia)/agenzia/actions";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CruiseConfiguratorProps {
  cruiseId: string;
  cruiseTitle: string;
  departures: CruiseDeparture[];
  supplements: CruiseSupplement[];
  shipCabins: ShipCabinDetail[];
  shipDecks: ShipDeck[];
  departurePrices: CruiseDeparturePrice[];
  /** Controlled open state */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, this departure is pre-selected */
  preselectedDepartureId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPrice(price: number | string | null): string {
  if (!price && price !== 0) return "Su richiesta";
  const num = typeof price === "string" ? parseFloat(price.replace(",", ".")) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(num);
}

function toNumber(val: number | string | null): number | null {
  if (val === null || val === undefined) return null;
  const n = typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

type Step = "form" | "summary" | "success";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CruiseConfigurator({
  cruiseId,
  cruiseTitle,
  departures,
  supplements,
  shipCabins,
  shipDecks,
  departurePrices,
  open,
  onOpenChange,
  preselectedDepartureId,
}: CruiseConfiguratorProps) {
  const [step, setStep] = useState<Step>("form");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [departureId, setDepartureId] = useState(preselectedDepartureId ?? "");
  const [selectedCabinId, setSelectedCabinId] = useState("");
  const [numCabins, setNumCabins] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children_, setChildren] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const hasCabins = shipCabins.length > 0;

  const selectedDeparture = departures.find((d) => d.id === departureId);
  const selectedCabin = shipCabins.find((c) => c.id === selectedCabinId);

  // Build deck lookup
  const deckMap = useMemo(
    () => new Map(shipDecks.map((d) => [d.id, d])),
    [shipDecks]
  );

  // Build price lookup: departure_id -> cabin_id -> prezzo
  const priceMap = useMemo(() => {
    const m = new Map<string, Map<string, string | null>>();
    for (const dp of departurePrices) {
      if (!m.has(dp.departure_id)) m.set(dp.departure_id, new Map());
      m.get(dp.departure_id)!.set(dp.cabin_id, dp.prezzo);
    }
    return m;
  }, [departurePrices]);

  // Group cabins by deck for the select dropdown
  const cabinsByDeck = useMemo(() => {
    const groups: { deck: ShipDeck | null; cabins: ShipCabinDetail[] }[] = [];
    const deckGroups = new Map<string, ShipCabinDetail[]>();
    const noDeckCabins: ShipCabinDetail[] = [];

    for (const cabin of shipCabins) {
      if (cabin.deck_id) {
        if (!deckGroups.has(cabin.deck_id)) deckGroups.set(cabin.deck_id, []);
        deckGroups.get(cabin.deck_id)!.push(cabin);
      } else {
        noDeckCabins.push(cabin);
      }
    }

    // Add deck groups in deck sort order
    for (const deck of shipDecks) {
      const cabins = deckGroups.get(deck.id);
      if (cabins && cabins.length > 0) {
        groups.push({ deck, cabins });
      }
    }

    // Add cabins without a deck
    if (noDeckCabins.length > 0) {
      groups.push({ deck: null, cabins: noDeckCabins });
    }

    return groups;
  }, [shipCabins, shipDecks]);

  // Sync preselectedDepartureId when dialog opens
  useEffect(() => {
    if (open && preselectedDepartureId) {
      setDepartureId(preselectedDepartureId);
    }
  }, [open, preselectedDepartureId]);

  // Get the price for the selected departure + cabin
  const indicativePrice = useMemo(() => {
    if (!departureId || !selectedCabinId) return null;
    const depPrices = priceMap.get(departureId);
    if (!depPrices) return null;
    return toNumber(depPrices.get(selectedCabinId) ?? null);
  }, [departureId, selectedCabinId, priceMap]);

  // Get the lowest price for a departure (for the departure list dropdown)
  function getLowestPrice(depId: string): string {
    const depPrices = priceMap.get(depId);
    if (!depPrices) return "";
    let min: number | null = null;
    for (const p of depPrices.values()) {
      const n = toNumber(p);
      if (n !== null && (min === null || n < min)) min = n;
    }
    return min !== null ? formatPrice(min) : "";
  }

  // Estimated total: price * (adults + children) * numCabins
  const estimatedTotal = useMemo(() => {
    if (!indicativePrice) return null;
    const cabinCount = hasCabins ? numCabins : 1;
    return indicativePrice * (adults + children_) * cabinCount;
  }, [indicativePrice, adults, children_, numCabins, hasCabins]);

  // Get cabin price for a specific cabin + selected departure (for dropdown display)
  function getCabinPrice(cabinId: string): string {
    if (!departureId) return "";
    const depPrices = priceMap.get(departureId);
    if (!depPrices) return "";
    const p = depPrices.get(cabinId);
    return p ? formatPrice(p) : "";
  }

  // Reset form when dialog closes
  function handleOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setError(null);
        setDepartureId("");
        setSelectedCabinId("");
        setNumCabins(1);
        setAdults(2);
        setChildren(0);
        setSelectedExtras([]);
        setNotes("");
      }, 200);
    }
  }

  function toggleExtra(name: string) {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  }

  function canProceedToSummary(): boolean {
    return !!departureId && adults >= 1;
  }

  function handleSubmit() {
    setError(null);

    const previewPrice = indicativePrice ?? null;
    const previewLabel = previewPrice
      ? `${formatPrice(previewPrice)} p.p.`
      : "Prezzo su richiesta";

    const payload: CruiseQuoteInput = {
      request_type: "cruise",
      cruise_id: cruiseId,
      departure_id: departureId,
      participants_adults: adults,
      participants_children: children_,
      cabin_type: selectedCabin?.titolo || null,
      cabin_id: selectedCabinId || null,
      num_cabins: hasCabins ? numCabins : 1,
      notes: notes || null,
      extras: selectedExtras,
      preview_price: previewPrice,
      preview_price_label: previewLabel,
    };

    startTransition(async () => {
      const result = await createQuoteRequest(payload);
      if (result.success) {
        setStep("success");
      } else {
        setError(result.error ?? "Errore sconosciuto.");
        setStep("form");
      }
    });
  }

  // Cabin label with deck name
  function cabinLabel(cabin: ShipCabinDetail): string {
    const deck = cabin.deck_id ? deckMap.get(cabin.deck_id) : undefined;
    return deck ? `${cabin.titolo} (${deck.nome})` : cabin.titolo;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
            {step === "success" ? "Richiesta Inviata!" : "Richiedi Preventivo Crociera"}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? "La tua richiesta e stata inviata con successo."
              : cruiseTitle}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="px-6 py-4">
            {/* -------- FORM STEP -------- */}
            {step === "form" && (
              <div className="space-y-5">
                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Departure Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-[#1B2D4F]" />
                    Data di Partenza *
                  </Label>
                  <Select value={departureId} onValueChange={setDepartureId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona data di partenza" />
                    </SelectTrigger>
                    <SelectContent>
                      {departures.map((dep) => {
                        const lowestPrice = getLowestPrice(dep.id);
                        return (
                          <SelectItem key={dep.id} value={dep.id}>
                            {formatDate(dep.data_partenza)} - da {dep.from_city}
                            {lowestPrice && ` (da ${lowestPrice})`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cabin Selection - grouped by deck */}
                {hasCabins && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bed className="size-4 text-[#1B2D4F]" />
                      Cabina
                    </Label>
                    <Select value={selectedCabinId} onValueChange={setSelectedCabinId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona cabina (opzionale)" />
                      </SelectTrigger>
                      <SelectContent>
                        {cabinsByDeck.map((group) => (
                          <SelectGroup key={group.deck?.id ?? "no-deck"}>
                            <SelectLabel>
                              {group.deck?.nome ?? "Altre cabine"}
                            </SelectLabel>
                            {group.cabins.map((cabin) => {
                              const price = getCabinPrice(cabin.id);
                              return (
                                <SelectItem key={cabin.id} value={cabin.id}>
                                  {cabin.titolo}
                                  {price && ` - ${price}`}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Number of Cabins */}
                {hasCabins && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Ship className="size-4 text-[#1B2D4F]" />
                      Numero Cabine
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={numCabins}
                      onChange={(e) => setNumCabins(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                )}

                {/* Participants */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="size-4 text-[#1B2D4F]" />
                    {hasCabins ? "Partecipanti per Cabina" : "Partecipanti"}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1">Adulti *</Label>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={adults}
                        onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1">Bambini</Label>
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        value={children_}
                        onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                </div>

                {/* Extras / Supplements */}
                {supplements.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-[#1B2D4F]" />
                      Servizi Extra
                    </Label>
                    <div className="space-y-2 bg-gray-50 rounded-md p-3">
                      {supplements.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded p-1.5 transition-colors"
                        >
                          <Checkbox
                            checked={selectedExtras.includes(s.titolo)}
                            onCheckedChange={() => toggleExtra(s.titolo)}
                          />
                          <span className="text-sm flex-1">{s.titolo}</span>
                          {s.prezzo && (
                            <span className="text-xs text-gray-500">{s.prezzo}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Note aggiuntive</Label>
                  <Textarea
                    placeholder="Eventuali richieste particolari, allergie, preferenze..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Live Price Preview */}
                {indicativePrice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-700">
                        Prezzo indicativo a persona:
                      </span>
                      <span className="font-bold text-[#C41E2F]">
                        {formatPrice(indicativePrice)}
                      </span>
                    </div>
                    {selectedCabin && (
                      <div className="text-blue-600 text-xs">
                        ({cabinLabel(selectedCabin)})
                      </div>
                    )}
                    {estimatedTotal && (
                      <div className="flex justify-between border-t border-blue-200 pt-1">
                        <span className="text-blue-700">
                          Totale stimato
                          {hasCabins && numCabins > 1 ? ` (${numCabins} cabine x ${adults + children_} pers.)` : ` (${adults + children_} ${adults + children_ === 1 ? "persona" : "persone"})`}:
                        </span>
                        <span className="font-bold text-[#C41E2F] text-base">
                          {formatPrice(estimatedTotal)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action */}
                <Button
                  className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
                  size="lg"
                  disabled={!canProceedToSummary()}
                  onClick={() => setStep("summary")}
                >
                  Rivedi Riepilogo
                </Button>
              </div>
            )}

            {/* -------- SUMMARY STEP -------- */}
            {step === "summary" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1B2D4F]">Riepilogo Richiesta</h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crociera</span>
                    <span className="font-medium text-right max-w-[60%]">{cruiseTitle}</span>
                  </div>
                  {selectedDeparture && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Partenza</span>
                        <span>{formatDate(selectedDeparture.data_partenza)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Da</span>
                        <span>{selectedDeparture.from_city}</span>
                      </div>
                    </>
                  )}
                  {selectedCabin && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cabina</span>
                        <span>{cabinLabel(selectedCabin)}</span>
                      </div>
                    </>
                  )}
                  {hasCabins && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Numero Cabine</span>
                      <span>{numCabins}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">{hasCabins ? "Adulti per cabina" : "Adulti"}</span>
                    <span>{adults}</span>
                  </div>
                  {children_ > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{hasCabins ? "Bambini per cabina" : "Bambini"}</span>
                      <span>{children_}</span>
                    </div>
                  )}
                  {selectedExtras.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-gray-500 block mb-2">Servizi Extra</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedExtras.map((e) => (
                            <Badge
                              key={e}
                              variant="secondary"
                              className="text-xs"
                            >
                              {e}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-gray-500 block mb-1">Note</span>
                        <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                      </div>
                    </>
                  )}
                  {indicativePrice && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Prezzo indicativo /persona</span>
                        <span className="font-bold text-[#C41E2F]">
                          {formatPrice(indicativePrice)}
                        </span>
                      </div>
                      {estimatedTotal && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Totale stimato</span>
                          <span className="font-bold text-[#C41E2F]">
                            {formatPrice(estimatedTotal)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setError(null);
                      setStep("form");
                    }}
                    disabled={isPending}
                  >
                    Modifica
                  </Button>
                  <Button
                    className="flex-1 bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    onClick={handleSubmit}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Invio in corso...
                      </>
                    ) : (
                      "Invia Richiesta"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* -------- SUCCESS STEP -------- */}
            {step === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1B2D4F]">
                  Richiesta Inviata con Successo!
                </h3>
                <p className="text-sm text-gray-600">
                  La tua richiesta di preventivo per <strong>{cruiseTitle}</strong> e stata
                  inviata. Riceverai una risposta nella tua area riservata e via email.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenChange(false)}
                >
                  Chiudi
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
