"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { acceptOfferAction, declineOfferAction } from "./actions";
import type { OfferListItem } from "@/lib/supabase/queries/quotes";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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
  accepted: {
    label: "Accettata",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  declined: {
    label: "Rifiutata",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  payment_sent: {
    label: "Pagamento inviato",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  confirmed: {
    label: "Confermata",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Respinta",
    className: "bg-red-100 text-red-800 border-red-200",
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

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptOfferAction(offer.id, offer.request_id);
      if (!result.success) {
        setError(result.error ?? "Errore imprevisto.");
      } else {
        setAcceptOpen(false);
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

              {/* Accept dialog */}
              <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
                <DialogTrigger asChild>
                  <Button disabled={isPending}>
                    <Check className="mr-1 h-4 w-4" />
                    Accetta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Accetta Offerta</DialogTitle>
                    <DialogDescription>
                      Confermando, accetti l&apos;offerta di{" "}
                      {offer.total_price != null
                        ? new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(offer.total_price)
                        : "importo da definire"}{" "}
                      per &ldquo;{packageName}&rdquo;. L&apos;operatore ti
                      inviera le istruzioni per il pagamento.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAcceptOpen(false)}
                      disabled={isPending}
                    >
                      Annulla
                    </Button>
                    <Button onClick={handleAccept} disabled={isPending}>
                      {isPending ? "Invio..." : "Conferma Accettazione"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
