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
  Bed,
  ClipboardList,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type {
  TourDeparture,
  TourSupplement,
} from "@/lib/types";
import {
  createQuoteRequest,
  type TourQuoteInput,
} from "@/app/(agenzia)/agenzia/actions";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TourConfiguratorProps {
  tourId: string;
  tourTitle: string;
  departures: TourDeparture[];
  supplements: TourSupplement[];
  /** Controlled open state */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, this departure is pre-selected */
  preselectedDepartureId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CAMERA_TYPES = ["Singola", "Doppia", "Tripla", "Quadrupla"] as const;

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPrice(price: number | null): string {
  if (!price) return "Su richiesta";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

function parsePriceStr(val: string | null): number | null {
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

type Step = "form" | "summary" | "success";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TourConfigurator({
  tourId,
  tourTitle,
  departures,
  supplements,
  open,
  onOpenChange,
  preselectedDepartureId,
}: TourConfiguratorProps) {
  const [step, setStep] = useState<Step>("form");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [departureId, setDepartureId] = useState(preselectedDepartureId ?? "");
  const [selectedStars, setSelectedStars] = useState("3");
  const [adults, setAdults] = useState(2);
  const [children_, setChildren] = useState(0);
  const [cameraType, setCameraType] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const selectedDeparture = departures.find((d) => d.id === departureId);

  // Sync preselectedDepartureId when dialog opens
  useEffect(() => {
    if (open && preselectedDepartureId) {
      setDepartureId(preselectedDepartureId);
    }
  }, [open, preselectedDepartureId]);

  // Live price preview
  const indicativePrice = useMemo(() => {
    if (!selectedDeparture) return null;
    if (selectedStars === "4") {
      return parsePriceStr(selectedDeparture.prezzo_4_stelle) ?? selectedDeparture.prezzo_3_stelle;
    }
    return selectedDeparture.prezzo_3_stelle;
  }, [selectedDeparture, selectedStars]);

  const estimatedTotal = useMemo(() => {
    if (!indicativePrice) return null;
    return indicativePrice * (adults + children_);
  }, [indicativePrice, adults, children_]);

  // Reset form when dialog closes
  function handleOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setError(null);
        setDepartureId("");
        setSelectedStars("3");
        setAdults(2);
        setChildren(0);
        setCameraType("");
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

    const payload: TourQuoteInput = {
      request_type: "tour",
      tour_id: tourId,
      departure_id: departureId,
      participants_adults: adults,
      participants_children: children_,
      cabin_type: cameraType || null,
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
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
            {step === "success" ? "Richiesta Inviata!" : "Richiedi Preventivo"}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? "La tua richiesta e stata inviata con successo."
              : tourTitle}
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
                  <Select value={departureId} onValueChange={setDepartureId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona data di partenza" />
                    </SelectTrigger>
                    <SelectContent>
                      {departures.map((dep) => (
                        <SelectItem key={dep.id} value={dep.id}>
                          {formatDate(dep.data_partenza)} - da {dep.from_city}{" "}
                          ({formatPrice(dep.prezzo_3_stelle)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hotel Stars */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bed className="size-4 text-[#1B2D4F]" />
                    Categoria Hotel
                  </Label>
                  <Select value={selectedStars} onValueChange={setSelectedStars}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Hotel 3 stelle</SelectItem>
                      <SelectItem value="4">Hotel 4 stelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Participants */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="size-4 text-[#1B2D4F]" />
                    Partecipanti
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

                {/* Camera Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bed className="size-4 text-[#1B2D4F]" />
                    Tipo Camera
                  </Label>
                  <Select value={cameraType} onValueChange={setCameraType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona tipo camera (opzionale)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMERA_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <span className="text-blue-700">Prezzo indicativo a persona:</span>
                      <span className="font-bold text-[#C41E2F]">
                        {formatPrice(indicativePrice)}
                      </span>
                    </div>
                    {estimatedTotal && (
                      <div className="flex justify-between border-t border-blue-200 pt-1">
                        <span className="text-blue-700">
                          Totale stimato ({adults + children_} {adults + children_ === 1 ? "persona" : "persone"}):
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
                    <span className="text-gray-500">Tour</span>
                    <span className="font-medium text-right max-w-[60%]">{tourTitle}</span>
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
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Categoria Hotel</span>
                    <span>{selectedStars === "4" ? "4 stelle" : "3 stelle"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adulti</span>
                    <span>{adults}</span>
                  </div>
                  {children_ > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bambini</span>
                      <span>{children_}</span>
                    </div>
                  )}
                  {cameraType && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tipo Camera</span>
                        <span>{cameraType}</span>
                      </div>
                    </>
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
                  La tua richiesta di preventivo per <strong>{tourTitle}</strong> e stata
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
