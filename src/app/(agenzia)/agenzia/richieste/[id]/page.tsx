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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getQuoteById } from "@/lib/supabase/queries/quotes";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Status badge mapping (same as list page)
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

export default async function RichiestaDetailPage({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/agenzia/richieste">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Torna alle richieste
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Richiesta #{id.slice(0, 8).toUpperCase()}
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
                      {/* Vertical line */}
                      {idx < quote.timeline.length - 1 && (
                        <div className="absolute left-[7px] top-4 h-full w-0.5 bg-border" />
                      )}
                      {/* Dot */}
                      <div
                        className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ${ACTOR_COLORS[entry.actor] ?? "bg-gray-400"}`}
                      />
                      {/* Content */}
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
                            ? "Agenzia"
                            : entry.actor === "admin"
                              ? "Amministratore"
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
