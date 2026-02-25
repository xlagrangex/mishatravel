"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  X,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "../actions";

interface QuoteActionsProps {
  offerId: string;
  requestId: string;
  packageName: string | undefined;
  totalPrice: number | null;
  offerExpiry: string | null;
  adultsCount: number;
  childrenCount: number;
}

export default function QuoteActions({
  offerId,
  requestId,
  packageName,
  totalPrice,
  offerExpiry,
  adultsCount,
  childrenCount,
}: QuoteActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isExpired = offerExpiry && new Date(offerExpiry) < new Date();

  const buildInitialParticipants = (): ParticipantInput[] => {
    const list: ParticipantInput[] = [];
    for (let i = 0; i < adultsCount + childrenCount; i++) {
      list.push({
        first_name: "",
        last_name: "",
        age: null,
        codice_fiscale: null,
        document_type: null,
        document_number: null,
        document_expiry: null,
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
    const missingFirst = participants.findIndex((p) => !p.first_name.trim());
    if (missingFirst >= 0) {
      setError(`Inserisci il nome del partecipante ${missingFirst + 1}.`);
      return;
    }
    const missingLast = participants.findIndex((p) => !p.last_name.trim());
    if (missingLast >= 0) {
      setError(`Inserisci il cognome del partecipante ${missingLast + 1}.`);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await acceptOfferWithParticipants(
        offerId,
        requestId,
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
        offerId,
        requestId,
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

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        L&apos;offerta e scaduta il{" "}
        {new Date(offerExpiry!).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        .
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Azioni</p>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
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
                <Label htmlFor="motivation">Motivazione (opzionale)</Label>
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
                  {acceptStep === 1 ? "Accetta Offerta" : "Dati Partecipanti"}
                </DialogTitle>
                <DialogDescription>
                  {acceptStep === 1
                    ? `Confermando, accetti l'offerta di ${
                        totalPrice != null
                          ? new Intl.NumberFormat("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            }).format(totalPrice)
                          : "importo da definire"
                      } per "${packageName}".`
                    : "Inserisci i dati dei partecipanti. Nome e cognome sono obbligatori, gli altri campi possono essere aggiunti in seguito."}
                </DialogDescription>
              </DialogHeader>

              {acceptStep === 1 ? (
                <>
                  <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pacchetto</span>
                      <span className="font-medium">{packageName}</span>
                    </div>
                    {totalPrice != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prezzo</span>
                        <span className="font-bold text-primary">
                          {new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(totalPrice)}
                        </span>
                      </div>
                    )}
                    {offerExpiry && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Scadenza offerta
                        </span>
                        <span>
                          {new Date(offerExpiry).toLocaleDateString("it-IT")}
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
                  <div className="space-y-4">
                    {participants.map((p, idx) => {
                      const ageNum = p.age != null ? Number(p.age) : null;
                      const ageBadge =
                        ageNum != null && ageNum >= 0
                          ? ageNum < 2
                            ? { label: "Infant", cls: "border-purple-200 bg-purple-50 text-purple-700" }
                            : ageNum < 12
                              ? { label: "Bambino", cls: "border-amber-200 bg-amber-50 text-amber-700" }
                              : ageNum < 18
                                ? { label: "Ragazzo", cls: "border-cyan-200 bg-cyan-50 text-cyan-700" }
                                : { label: "Adulto", cls: "border-green-200 bg-green-50 text-green-700" }
                          : null;
                      return (
                        <div
                          key={idx}
                          className="rounded-lg border p-3 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              Partecipante {idx + 1}
                              {ageBadge && (
                                <Badge
                                  variant="outline"
                                  className={`ml-2 text-xs ${ageBadge.cls}`}
                                >
                                  {ageBadge.label}
                                </Badge>
                              )}
                            </p>
                          </div>
                          {/* Row 1: Nome, Cognome, Eta */}
                          <div className="grid grid-cols-[1fr_1fr_80px] gap-2">
                            <div>
                              <Label className="text-xs">Nome *</Label>
                              <Input
                                placeholder="Es. Mario"
                                value={p.first_name}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "first_name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Cognome *</Label>
                              <Input
                                placeholder="Es. Rossi"
                                value={p.last_name}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "last_name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Eta</Label>
                              <Input
                                type="number"
                                min="0"
                                max="120"
                                placeholder="35"
                                value={p.age ?? ""}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "age",
                                    e.target.value
                                      ? (Number(e.target.value) as any)
                                      : (null as any)
                                  )
                                }
                              />
                            </div>
                          </div>
                          {/* Row 2: Codice Fiscale */}
                          <div>
                            <Label className="text-xs">Codice Fiscale</Label>
                            <Input
                              placeholder="Es. RSSMRA85M01H501Z"
                              value={p.codice_fiscale ?? ""}
                              onChange={(e) =>
                                updateParticipant(
                                  idx,
                                  "codice_fiscale",
                                  e.target.value || (null as any)
                                )
                              }
                            />
                          </div>
                          {/* Row 3: Tipo documento, N. documento, Scadenza */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Tipo documento</Label>
                              <select
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={p.document_type ?? ""}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "document_type",
                                    e.target.value || (null as any)
                                  )
                                }
                              >
                                <option value="">Seleziona...</option>
                                <option value="Passaporto">Passaporto</option>
                                <option value="Carta d'identita">
                                  Carta d&apos;identita
                                </option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">N. documento</Label>
                              <Input
                                placeholder="Es. AA1234567"
                                value={p.document_number ?? ""}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "document_number",
                                    e.target.value || (null as any)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Scadenza</Label>
                              <Input
                                type="date"
                                value={p.document_expiry ?? ""}
                                onChange={(e) =>
                                  updateParticipant(
                                    idx,
                                    "document_expiry",
                                    e.target.value || (null as any)
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                    <Button onClick={handleAccept} disabled={isPending}>
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
      </div>
    </>
  );
}
