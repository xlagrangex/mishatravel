import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  Ship,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  Download,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getQuoteById } from "@/lib/supabase/queries/quotes";
import { getAgencyStatusAction } from "@/lib/quote-status-config";
import { ActionIndicator } from "@/components/ActionIndicator";
import QuoteActions from "./QuoteActions";
import ContractSentActions from "./ContractSentActions";
import DownloadPdfButton from "./DownloadPdfButton";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Status badge mapping
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  requested: { label: "Richiesta inviata", className: "bg-blue-100 text-blue-700 border-blue-200" },
  offered: { label: "Offerta ricevuta", className: "bg-purple-100 text-purple-800 border-purple-200" },
  accepted: { label: "Accettata", className: "bg-green-100 text-green-800 border-green-200" },
  contract_sent: { label: "Contratto inviato", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  confirmed: { label: "Confermata", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  declined: { label: "Rifiutata", className: "bg-orange-100 text-orange-800 border-orange-200" },
  rejected: { label: "Respinta", className: "bg-red-100 text-red-800 border-red-200" },
  sent: { label: "Inviata", className: "bg-gray-100 text-gray-700 border-gray-200" },
  in_review: { label: "In revisione", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  offer_sent: { label: "Offerta ricevuta", className: "bg-blue-100 text-blue-800 border-blue-200" },
  payment_sent: { label: "Pagamento inviato", className: "bg-purple-100 text-purple-800 border-purple-200" },
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
// Timeline actor colors
// ---------------------------------------------------------------------------

const ACTOR_COLORS: Record<string, string> = {
  agency: "bg-blue-500",
  admin: "bg-primary",
  system: "bg-gray-400",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PreventivoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    notFound();
  }

  const packageName =
    quote.request_type === "tour"
      ? quote.tour?.title
      : quote.cruise?.title;

  const packageSlug =
    quote.request_type === "tour"
      ? quote.tour?.slug
        ? `/tours/${quote.tour.slug}`
        : null
      : quote.cruise?.slug
        ? `/crociere/${quote.cruise.slug}`
        : null;

  const latestOffer = quote.offers.length > 0 ? quote.offers[0] : null;
  const latestPayment = quote.payments.length > 0 ? quote.payments[0] : null;

  const canAct =
    latestOffer &&
    (quote.status === "offer_sent" || quote.status === "offered");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/agenzia/preventivi">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Torna ai preventivi
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Preventivo #{id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            Inviata il{" "}
            {new Date(quote.created_at).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={quote.status} />
      </div>

      {/* Action Indicator Banner — dynamic for contract_sent */}
      {(() => {
        if (quote.status === "contract_sent") {
          const hasCounter = quote.documents?.some(
            (d) => d.document_type === "contratto_controfirmato"
          );
          const hasReceipt = quote.documents?.some(
            (d) => d.document_type === "ricevuta_pagamento"
          );
          const hasPaymentConfirm = quote.timeline.some(
            (t) =>
              t.actor === "agency" &&
              t.action === "Pagamento confermato dall'agenzia"
          );
          const allDone = hasCounter && hasReceipt && hasPaymentConfirm;

          if (allDone) {
            return (
              <ActionIndicator
                variant="banner"
                status={quote.status}
                message="Tutte le azioni sono state completate. In attesa della conferma da parte del tour operator."
                actionRequired={false}
              />
            );
          }

          const remaining: string[] = [];
          if (!hasCounter) remaining.push("il contratto controfirmato");
          if (!hasReceipt) remaining.push("la ricevuta di pagamento");
          if (!hasPaymentConfirm) remaining.push("conferma il pagamento");

          return (
            <ActionIndicator
              variant="banner"
              status={quote.status}
              message={`Azione richiesta: invia ${remaining.join(", ")}`}
              actionRequired={true}
            />
          );
        }

        return (
          <ActionIndicator
            variant="banner"
            status={quote.status}
            {...getAgencyStatusAction(quote.status)}
          />
        );
      })()}

      {/* Prominent PDF Download */}
      <DownloadPdfButton quoteId={id} />

      {/* Contract Sent Actions (agency must countersign + pay) */}
      {quote.status === "contract_sent" && (() => {
        const counterContract = quote.documents?.find(
          (d) => d.document_type === "contratto_controfirmato"
        ) ?? null;
        const paymentReceipt = quote.documents?.find(
          (d) => d.document_type === "ricevuta_pagamento"
        ) ?? null;
        const paymentConfirmed = quote.timeline.some(
          (t) =>
            t.actor === "agency" &&
            t.action === "Pagamento confermato dall'agenzia"
        );
        const allDone = !!counterContract && !!paymentReceipt && paymentConfirmed;

        // Hide the action cards if all 3 actions are already done
        if (allDone) return null;

        return (
          <ContractSentActions
            requestId={id}
            existingCounterContract={
              counterContract
                ? { file_name: counterContract.file_name, file_url: counterContract.file_url }
                : null
            }
            existingPaymentReceipt={
              paymentReceipt
                ? { file_name: paymentReceipt.file_name, file_url: paymentReceipt.file_url }
                : null
            }
            paymentConfirmed={paymentConfirmed}
          />
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Package details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {quote.request_type === "tour" ? (
                  <MapPin className="h-5 w-5" />
                ) : (
                  <Ship className="h-5 w-5" />
                )}
                Dettagli Pacchetto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipo
                  </p>
                  <p className="font-medium">
                    {quote.request_type === "tour" ? "Tour" : "Crociera"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pacchetto
                  </p>
                  {packageSlug ? (
                    <Link
                      href={packageSlug}
                      className="font-medium text-primary hover:underline"
                    >
                      {packageName}
                    </Link>
                  ) : (
                    <p className="font-medium">{packageName ?? "-"}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Adulti
                  </p>
                  <p className="flex items-center gap-1 font-medium">
                    <Users className="h-4 w-4" />
                    {quote.participants_adults ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bambini
                  </p>
                  <p className="flex items-center gap-1 font-medium">
                    <Users className="h-4 w-4" />
                    {quote.participants_children ?? 0}
                  </p>
                </div>
                {quote.cabin_type && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tipo Cabina
                    </p>
                    <p className="font-medium">{quote.cabin_type}</p>
                  </div>
                )}
                {quote.num_cabins && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      N. Cabine
                    </p>
                    <p className="font-medium">{quote.num_cabins}</p>
                  </div>
                )}
              </div>

              {quote.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Note
                    </p>
                    <p className="mt-1 text-sm">{quote.notes}</p>
                  </div>
                </>
              )}

              {quote.extras.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Extra richiesti
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      {quote.extras.map((e) => (
                        <li key={e.id}>
                          {e.extra_name}
                          {e.quantity && e.quantity > 1
                            ? ` (x${e.quantity})`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Offer (if present) */}
          {latestOffer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Offerta Ricevuta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {latestOffer.total_price != null && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Prezzo Totale
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        }).format(latestOffer.total_price)}
                      </p>
                    </div>
                  )}
                  {latestOffer.offer_expiry && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Scadenza Offerta
                      </p>
                      <p className="flex items-center gap-1 font-medium">
                        <Calendar className="h-4 w-4" />
                        {new Date(latestOffer.offer_expiry).toLocaleDateString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {latestOffer.conditions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Condizioni
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {latestOffer.conditions}
                      </p>
                    </div>
                  </>
                )}
                {latestOffer.payment_terms && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Termini di Pagamento
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm">
                      {latestOffer.payment_terms}
                    </p>
                  </div>
                )}

                {/* Contract + IBAN (shown after confirmation) */}
                {latestOffer.contract_file_url && (
                  <>
                    <Separator />
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800 mb-2">
                        Contratto e Dati di Pagamento
                      </p>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <a
                          href={latestOffer.contract_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-700 hover:underline font-medium"
                        >
                          <Download className="inline h-3 w-3 mr-1" />
                          Scarica Contratto
                        </a>
                      </div>
                      {latestOffer.iban && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">IBAN</p>
                          <p className="font-mono text-sm font-semibold text-emerald-800">
                            {latestOffer.iban}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Accept / Decline actions */}
                {canAct && (
                  <QuoteActions
                    offerId={latestOffer.id}
                    requestId={quote.id}
                    packageName={packageName}
                    totalPrice={latestOffer.total_price}
                    offerExpiry={latestOffer.offer_expiry}
                    adultsCount={quote.participants_adults ?? 1}
                    childrenCount={quote.participants_children ?? 0}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment (if present) */}
          {latestPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Dettagli Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {latestPayment.amount != null && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Importo
                      </p>
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        }).format(latestPayment.amount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stato Pagamento
                    </p>
                    <Badge variant="outline">
                      {latestPayment.status === "pending"
                        ? "In attesa"
                        : latestPayment.status === "received"
                          ? "Ricevuto"
                          : "Confermato"}
                    </Badge>
                  </div>
                </div>
                {latestPayment.bank_details && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Coordinate Bancarie
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {latestPayment.bank_details}
                      </p>
                    </div>
                  </>
                )}
                {latestPayment.reference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Causale
                    </p>
                    <p className="mt-1 text-sm">{latestPayment.reference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participants */}
          {quote.participants && quote.participants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5" />
                  Partecipanti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quote.participants
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {p.full_name}
                            {p.is_child && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-amber-200 bg-amber-50 text-amber-700"
                              >
                                bambino
                              </Badge>
                            )}
                          </p>
                          {(p.document_type || p.document_number) && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {p.document_type && <span>{p.document_type}</span>}
                              {p.document_type && p.document_number && " \u2022 "}
                              {p.document_number && (
                                <span className="font-mono">
                                  {p.document_number}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {quote.documents && quote.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Documenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quote.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} &middot;{" "}
                            {new Date(doc.created_at).toLocaleDateString(
                              "it-IT"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun evento registrato.
                </p>
              ) : (
                <div className="relative space-y-0">
                  {quote.timeline.map((entry, idx) => (
                    <div key={entry.id} className="relative flex gap-3 pb-6">
                      {idx < quote.timeline.length - 1 && (
                        <div className="absolute left-[7px] top-4 h-full w-0.5 bg-border" />
                      )}
                      <div
                        className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ${ACTOR_COLORS[entry.actor] ?? "bg-gray-400"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{entry.action}</p>
                        {entry.details && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {entry.details}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString(
                            "it-IT",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          &middot;{" "}
                          {entry.actor === "agency"
                            ? "Agenzia di Viaggi"
                            : entry.actor === "admin"
                              ? "Tour Operator MishaTravel"
                              : "Sistema"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
