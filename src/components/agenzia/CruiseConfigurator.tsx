"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Users,
  Layers,
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
  CruiseCabin,
} from "@/lib/types";
import {
  createQuoteRequest,
  type CruiseQuoteInput,
} from "@/app/(agenzia)/agenzia/actions";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DeckConfig {
  label: string;
  value: string;
}

interface CruiseConfiguratorProps {
  cruiseId: string;
  cruiseTitle: string;
  departures: CruiseDeparture[];
  supplements: CruiseSupplement[];
  cabins: CruiseCabin[];
  /** Deck labels from the cruise record */
  decks: DeckConfig[];
  /** If provided, only this departure is pre-selected and the select is hidden */
  preselectedDepartureId?: string;
  children?: React.ReactNode;
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
  if (!price) return "Su richiesta";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(num);
}

function getDeparturePrice(
  dep: CruiseDeparture,
  deckValue: string
): number | string | null {
  switch (deckValue) {
    case "main":
      return dep.prezzo_main_deck;
    case "middle":
      return dep.prezzo_middle_deck;
    case "superior":
      return dep.prezzo_superior_deck;
    default:
      return dep.prezzo_main_deck;
  }
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
  cabins,
  decks,
  preselectedDepartureId,
  children,
}: CruiseConfiguratorProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [departureId, setDepartureId] = useState(preselectedDepartureId ?? "");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [cabinType, setCabinType] = useState("");
  const [numCabins, setNumCabins] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children_, setChildren] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const selectedDeparture = departures.find((d) => d.id === departureId);
  const selectedDeckConfig = decks.find((d) => d.value === selectedDeck);

  // Filter cabin types by selected deck (ponte field)
  const filteredCabinTypes = useMemo(() => {
    if (!selectedDeck) return cabins;
    const filtered = cabins.filter(
      (c) => c.ponte?.toLowerCase() === selectedDeck.toLowerCase()
    );
    return filtered.length > 0 ? filtered : cabins;
  }, [cabins, selectedDeck]);

  // Get unique cabin type names for the select
  const uniqueCabinTypes = useMemo(() => {
    const names = new Set<string>();
    filteredCabinTypes.forEach((c) => {
      if (c.tipologia_camera) names.add(c.tipologia_camera);
    });
    return Array.from(names);
  }, [filteredCabinTypes]);

  // Indicative price based on selected departure + deck
  const indicativePrice = useMemo(() => {
    if (!selectedDeparture) return null;
    if (selectedDeck) {
      return getDeparturePrice(selectedDeparture, selectedDeck);
    }
    return selectedDeparture.prezzo_main_deck;
  }, [selectedDeparture, selectedDeck]);

  // Reset form when dialog closes
  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setError(null);
        if (!preselectedDepartureId) setDepartureId("");
        setSelectedDeck("");
        setCabinType("");
        setNumCabins(1);
        setAdults(2);
        setChildren(0);
        setSelectedExtras([]);
        setNotes("");
      }, 200);
    }
  }

  // Reset cabin type when deck changes (conditional filtering)
  function handleDeckChange(value: string) {
    setSelectedDeck(value);
    setCabinType("");
  }

  function toggleExtra(name: string) {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  }

  function canProceedToSummary(): boolean {
    return !!departureId && adults >= 1 && !!cabinType && numCabins >= 1;
  }

  function handleSubmit() {
    setError(null);

    const payload: CruiseQuoteInput = {
      request_type: "cruise",
      cruise_id: cruiseId,
      departure_id: departureId,
      participants_adults: adults,
      participants_children: children_,
      cabin_type: cabinType,
      num_cabins: numCabins,
      deck: selectedDeck || null,
      notes: notes || null,
      extras: selectedExtras,
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
            Richiedi Preventivo
          </Button>
        )}
      </DialogTrigger>

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

        <ScrollArea className="max-h-[60vh]">
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
                  {preselectedDepartureId ? (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {selectedDeparture
                        ? `${formatDate(selectedDeparture.data_partenza)} - da ${selectedDeparture.from_city}`
                        : "Partenza selezionata"}
                    </p>
                  ) : (
                    <Select value={departureId} onValueChange={setDepartureId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona data di partenza" />
                      </SelectTrigger>
                      <SelectContent>
                        {departures.map((dep) => (
                          <SelectItem key={dep.id} value={dep.id}>
                            {formatDate(dep.data_partenza)} - da {dep.from_city}{" "}
                            ({formatPrice(dep.prezzo_main_deck)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Deck Selection */}
                {decks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Layers className="size-4 text-[#1B2D4F]" />
                      Ponte
                    </Label>
                    <Select value={selectedDeck} onValueChange={handleDeckChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona ponte" />
                      </SelectTrigger>
                      <SelectContent>
                        {decks.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Cabin Type (filtered by deck) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bed className="size-4 text-[#1B2D4F]" />
                    Tipo Cabina *
                  </Label>
                  {uniqueCabinTypes.length > 0 ? (
                    <Select value={cabinType} onValueChange={setCabinType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona tipo cabina" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCabinTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Tipo cabina desiderato"
                      value={cabinType}
                      onChange={(e) => setCabinType(e.target.value)}
                    />
                  )}
                </div>

                {/* Number of Cabins */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ship className="size-4 text-[#1B2D4F]" />
                    Numero Cabine *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={numCabins}
                    onChange={(e) => setNumCabins(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                {/* Participants */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="size-4 text-[#1B2D4F]" />
                    Partecipanti per Cabina
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

                {/* Indicative Price */}
                {indicativePrice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <span className="text-blue-700">Prezzo indicativo a persona: </span>
                    <span className="font-bold text-[#C41E2F]">
                      {formatPrice(indicativePrice)}
                    </span>
                    {selectedDeckConfig && (
                      <span className="text-blue-600 ml-1">
                        ({selectedDeckConfig.label})
                      </span>
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
                  {selectedDeckConfig && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ponte</span>
                        <span>{selectedDeckConfig.label}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo Cabina</span>
                    <span>{cabinType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Numero Cabine</span>
                    <span>{numCabins}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adulti per cabina</span>
                    <span>{adults}</span>
                  </div>
                  {children_ > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bambini per cabina</span>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
