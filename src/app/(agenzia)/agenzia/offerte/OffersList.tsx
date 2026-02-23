"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  X,
  FileText,
  AlertTriangle,
  Users,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  acceptOfferWithParticipants,
  declineOfferAction,
  type ParticipantInput,
} from "./actions";
import type { OfferListItem } from "@/lib/supabase/queries/quotes";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  requested: {
    label: "Richiesta inviata",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  offered: {
    label: "Offerta ricevuta",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  accepted: {
    label: "Accettata",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  confirmed: {
    label: "Confermata",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  declined: {
    label: "Rifiutata",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  rejected: {
    label: "Respinta",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  // Legacy
  sent: {
    label: "Inviata",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  in_review: {
    label: "In revisione",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  offer_sent: {
    label: "Offerta ricevuta",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  payment_sent: {
    label: "Pagamento inviato",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OffersList({ offers }: { offers: OfferListItem[] }) {
  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

function OfferCard({ offer }: { offer: OfferListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const packageName =
    offer.request.request_type === "tour"
      ? offer.request.tour?.title
      : offer.request.cruise?.title;

  const canAct = offer.request.status === "offer_sent";

  const isExpired =
    offer.offer_expiry && new Date(offer.offer_expiry) < new Date();

  // Participant form state
  const adultsCount = offer.request.participants_adults ?? 1;
  const childrenCount = offer.request.participants_children ?? 0;

  const buildInitialParticipants = (): ParticipantInput[] => {
    const list: ParticipantInput[] = [];
    for (let i = 0; i < adultsCount; i++) {
      list.push({
        full_name: "",
        document_type: null,
        document_number: null,
        is_child: false,
      });
    }
    for (let i = 0; i < childrenCount; i++) {
      list.push({
        full_name: "",
        document_type: null,
        document_number: null,
        is_child: true,
      });
    }
    return list;
  };

  const [participants, setParticipants] = useState<ParticipantInput[]>(
    buildInitialParticipants
  );
  const [acceptStep, setAcceptStep] = useState<1 | 2>(1);

  const updateParticipant = (
    index: number,
    field: keyof ParticipantInput,
    value: string | boolean
  ) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  function handleAccept() {
    // Validate names
    const missing = participants.findIndex((p) => !p.full_name.trim());
    if (missing >= 0) {
      setError(`Inserisci il nome completo del partecipante ${missing + 1}.`);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await acceptOfferWithParticipants(
        offer.id,
        offer.request_id,
        participants
      );
      if (!result.success) {
        setError(result.error ?? "Errore imprevisto.");
      } else {
        setAcceptOpen(false);
        setAcceptStep(1);
        router.refresh();
      }
    });
  }

  function handleDecline() {
    setError(null);
    startTransition(async () => {
      const result = await declineOfferAction(
        offer.id,
        offer.request_id,
        motivation || undefined
      );
      if (!result.success) {
        setError(result.error ?? "Errore imprevisto.");
      } else {
        setDeclineOpen(false);
        setMotivation("");
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {packageName ?? "Offerta"}
          </CardTitle>
          <StatusBadge status={offer.request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {offer.total_price != null && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Prezzo Totale
              </p>
              <p className="text-xl font-bold text-primary">
                {new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(offer.total_price)}
              </p>
            </div>
          )}
          {offer.offer_expiry && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Scadenza
              </p>
              <p className="flex items-center gap-1 font-medium">
                <Calendar className="h-4 w-4" />
                {new Date(offer.offer_expiry).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                {isExpired && (
                  <Badge
                    variant="destructive"
                    className="ml-2 text-xs"
                  >
                    Scaduta
                  </Badge>
                )}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tipo
            </p>
            <p className="font-medium">
              {offer.request.request_type === "tour" ? "Tour" : "Crociera"}
            </p>
          </div>
        </div>

        {offer.conditions && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Condizioni
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">
                {offer.conditions}
              </p>
            </div>
          </>
        )}

        {offer.payment_terms && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Termini di Pagamento
            </p>
            <p className="mt-1 whitespace-pre-line text-sm">
              {offer.payment_terms}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Action buttons */}
        {canAct && !isExpired && (
          <>
            <Separator />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {/* Decline dialog */}
              <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isPending}>
                    <X className="mr-1 h-4 w-4" />
                    Rifiuta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rifiuta Offerta</DialogTitle>
                    <DialogDescription>
                      Sei sicuro di voler rifiutare questa offerta? Puoi
                      opzionalmente indicare una motivazione.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">
                      Motivazione (opzionale)
                    </Label>
                    <Textarea
                      id="motivation"
                      placeholder="Indica il motivo del rifiuto..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeclineOpen(false)}
                      disabled={isPending}
                    >
                      Annulla
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDecline}
                      disabled={isPending}
                    >
                      {isPending ? "Invio..." : "Conferma Rifiuto"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Accept dialog with participants */}
              <Dialog
                open={acceptOpen}
                onOpenChange={(o) => {
                  setAcceptOpen(o);
                  if (!o) {
                    setAcceptStep(1);
                    setError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button disabled={isPending}>
                    <Check className="mr-1 h-4 w-4" />
                    Accetta Offerta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {acceptStep === 1
                        ? "Accetta Offerta"
                        : "Dati Partecipanti"}
                    </DialogTitle>
                    <DialogDescription>
                      {acceptStep === 1
                        ? `Confermando, accetti l'offerta di ${
                            offer.total_price != null
                              ? new Intl.NumberFormat("it-IT", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(offer.total_price)
                              : "importo da definire"
                          } per "${packageName}".`
                        : "Inserisci i dati dei partecipanti. Il nome completo e obbligatorio, i documenti possono essere aggiunti in seguito."}
                    </DialogDescription>
                  </DialogHeader>

                  {acceptStep === 1 ? (
                    <>
                      {/* Step 1: Recap */}
                      <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Pacchetto
                          </span>
                          <span className="font-medium">{packageName}</span>
                        </div>
                        {offer.total_price != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Prezzo
                            </span>
                            <span className="font-bold text-primary">
                              {new Intl.NumberFormat("it-IT", {
                                style: "currency",
                                currency: "EUR",
                              }).format(offer.total_price)}
                            </span>
                          </div>
                        )}
                        {offer.offer_expiry && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Scadenza offerta
                            </span>
                            <span>
                              {new Date(
                                offer.offer_expiry
                              ).toLocaleDateString("it-IT")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Partecipanti
                          </span>
                          <span>
                            {adultsCount} adulti
                            {childrenCount > 0
                              ? `, ${childrenCount} bambini`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAcceptOpen(false)}
                        >
                          Annulla
                        </Button>
                        <Button onClick={() => setAcceptStep(2)}>
                          <Users className="mr-1 h-4 w-4" />
                          Inserisci Partecipanti
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      {/* Step 2: Participant form */}
                      <div className="space-y-4">
                        {participants.map((p, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border p-3 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">
                                Partecipante {idx + 1}
                                {p.is_child && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs border-amber-200 bg-amber-50 text-amber-700"
                                  >
                                    bambino
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs">
                                Nome e cognome *
                              </Label>
                              <Input
                                placeholder="Es. Mario Rossi"
                                value={p.full_name}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "full_name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">
                                  Tipo documento
                                </Label>
                                <select
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                  value={p.document_type ?? ""}
                                  onChange={(e) =>
                                    updateParticipant(
                                      idx,
                                      "document_type",
                                      e.target.value || null as any
                                    )
                                  }
                                >
                                  <option value="">Seleziona...</option>
                                  <option value="Passaporto">
                                    Passaporto
                                  </option>
                                  <option value="Carta d'identita">
                                    Carta d&apos;identita
                                  </option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">
                                  N. documento
                                </Label>
                                <Input
                                  placeholder="Es. AA1234567"
                                  value={p.document_number ?? ""}
                                  onChange={(e) =>
                                    updateParticipant(
                                      idx,
                                      "document_number",
                                      e.target.value || null as any
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAcceptStep(1)}
                          disabled={isPending}
                        >
                          Indietro
                        </Button>
                        <Button
                          onClick={handleAccept}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Invio...
                            </>
                          ) : (
                            "Conferma Accettazione"
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
