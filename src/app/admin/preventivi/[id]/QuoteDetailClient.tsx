'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  Ship,
  Map,
  FileText,
  Clock,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  ThumbsDown,
  CreditCard,
  AlertCircle,
  Package,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { QuoteDetailData } from '@/lib/supabase/queries/admin-quotes'
import {
  updateQuoteStatus,
  createOffer,
  sendPaymentDetails,
  confirmPayment,
  rejectQuote,
} from '../actions'

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; step: number }
> = {
  sent: {
    label: 'Inviato',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: Send,
    step: 1,
  },
  in_review: {
    label: 'In Revisione',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    icon: Eye,
    step: 2,
  },
  offer_sent: {
    label: 'Offerta Inviata',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: FileText,
    step: 3,
  },
  accepted: {
    label: 'Accettato',
    color: 'border-green-200 bg-green-50 text-green-700',
    icon: CheckCircle,
    step: 4,
  },
  declined: {
    label: 'Rifiutato Agenzia',
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: ThumbsDown,
    step: 0,
  },
  payment_sent: {
    label: 'Pagamento Inviato',
    color: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: CreditCard,
    step: 5,
  },
  confirmed: {
    label: 'Confermato',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle,
    step: 6,
  },
  rejected: {
    label: 'Rifiutato',
    color: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
    step: 0,
  },
}

const TIMELINE_STEPS = [
  'sent',
  'in_review',
  'offer_sent',
  'accepted',
  'payment_sent',
  'confirmed',
]

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: 'border-gray-200 bg-gray-50 text-gray-600',
    icon: FileText,
    step: 0,
  }
  const Icon = config.icon
  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs'
      )}
    >
      <Icon className={cn(size === 'lg' ? 'mr-1.5 h-4 w-4' : 'mr-1 h-3 w-3')} />
      {config.label}
    </Badge>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Visual Timeline (workflow steps)
// ---------------------------------------------------------------------------

function WorkflowTimeline({ currentStatus }: { currentStatus: string }) {
  const currentStep = STATUS_CONFIG[currentStatus]?.step ?? 0
  const isFinal = currentStatus === 'rejected' || currentStatus === 'declined'

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {TIMELINE_STEPS.map((stepKey, idx) => {
        const config = STATUS_CONFIG[stepKey]
        const step = config.step
        const isActive = stepKey === currentStatus
        const isCompleted = !isFinal && currentStep > step
        const Icon = config.icon

        return (
          <div key={stepKey} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                isActive
                  ? config.color
                  : isCompleted
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
              )}
            >
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-4 shrink-0',
                  isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
      {isFinal && (
        <>
          <div className="mx-1 h-0.5 w-4 shrink-0 bg-gray-200" />
          <StatusBadge status={currentStatus} />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity Timeline
// ---------------------------------------------------------------------------

function ActivityTimeline({
  entries,
}: {
  entries: QuoteDetailData['timeline']
}) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nessuna attivita registrata.
      </p>
    )
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
      {entries.map((entry, idx) => (
        <div key={entry.id} className="relative flex gap-4 pb-6">
          <div
            className={cn(
              'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
              idx === 0
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 bg-white'
            )}
          >
            <Clock
              className={cn(
                'h-3.5 w-3.5',
                idx === 0 ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{entry.action}</p>
            {entry.details && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.details}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground/70">
              {formatDate(entry.created_at)} &middot;{' '}
              <span className="capitalize">{entry.actor}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create Offer Dialog
// ---------------------------------------------------------------------------

function CreateOfferDialog({
  requestId,
  onSuccess,
}: {
  requestId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    const payload = {
      request_id: requestId,
      total_price: Number(form.get('total_price')),
      conditions: form.get('conditions') as string || null,
      payment_terms: form.get('payment_terms') as string || null,
      offer_expiry: form.get('offer_expiry') as string || null,
      package_details: null,
      send_now: form.get('send_now') === 'on',
    }

    startTransition(async () => {
      const result = await createOffer(payload)
      if (result.success) {
        setOpen(false)
        onSuccess()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4" />
          Crea Offerta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crea Offerta</DialogTitle>
          <DialogDescription>
            Prepara un&apos;offerta per l&apos;agenzia con prezzo, condizioni e
            termini di pagamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="total_price">Prezzo totale (EUR) *</Label>
            <Input
              id="total_price"
              name="total_price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="1500.00"
            />
          </div>

          <div>
            <Label htmlFor="conditions">Condizioni</Label>
            <Textarea
              id="conditions"
              name="conditions"
              rows={3}
              placeholder="Condizioni dell'offerta..."
            />
          </div>

          <div>
            <Label htmlFor="payment_terms">Termini di pagamento</Label>
            <Textarea
              id="payment_terms"
              name="payment_terms"
              rows={2}
              placeholder="Es. 30% acconto, saldo 15 gg prima della partenza"
            />
          </div>

          <div>
            <Label htmlFor="offer_expiry">Scadenza offerta</Label>
            <Input id="offer_expiry" name="offer_expiry" type="date" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send_now"
              name="send_now"
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="send_now" className="text-sm font-normal">
              Invia subito all&apos;agenzia (aggiorna stato a &quot;Offerta
              Inviata&quot;)
            </Label>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salva Offerta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Send Payment Details Dialog
// ---------------------------------------------------------------------------

function SendPaymentDialog({
  requestId,
  offerAmount,
  onSuccess,
}: {
  requestId: string
  offerAmount: number | null
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    const payload = {
      request_id: requestId,
      bank_details: form.get('bank_details') as string,
      amount: Number(form.get('amount')),
      reference: form.get('reference') as string,
    }

    startTransition(async () => {
      const result = await sendPaymentDetails(payload)
      if (result.success) {
        setOpen(false)
        onSuccess()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="h-4 w-4" />
          Invia Estremi Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invia Estremi di Pagamento</DialogTitle>
          <DialogDescription>
            Invia all&apos;agenzia i dati per effettuare il bonifico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bank_details">IBAN / Coordinate bancarie *</Label>
            <Input
              id="bank_details"
              name="bank_details"
              required
              placeholder="IT60 X054 2811 1010 0000 0123 456"
            />
          </div>

          <div>
            <Label htmlFor="amount">Importo (EUR) *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={offerAmount ?? ''}
              placeholder="1500.00"
            />
          </div>

          <div>
            <Label htmlFor="reference">Causale *</Label>
            <Input
              id="reference"
              name="reference"
              required
              placeholder="Es. Acconto prenotazione Tour Russia - Rif. 12345"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Invia Pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Reject Dialog
// ---------------------------------------------------------------------------

function RejectDialog({
  requestId,
  onSuccess,
}: {
  requestId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await rejectQuote({
        request_id: requestId,
        motivation: form.get('motivation') as string,
      })
      if (result.success) {
        setOpen(false)
        onSuccess()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XCircle className="h-4 w-4" />
          Rifiuta Richiesta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rifiuta Richiesta</DialogTitle>
          <DialogDescription>
            Questa azione rifiutera definitivamente la richiesta di preventivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="motivation">Motivazione *</Label>
            <Textarea
              id="motivation"
              name="motivation"
              rows={3}
              required
              placeholder="Motivo del rifiuto..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annulla
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Conferma Rifiuto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Detail Component
// ---------------------------------------------------------------------------

interface QuoteDetailClientProps {
  quote: QuoteDetailData
}

export default function QuoteDetailClient({ quote }: QuoteDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    router.refresh()
  }

  const handleSetInReview = () => {
    startTransition(async () => {
      const result = await updateQuoteStatus({
        request_id: quote.id,
        status: 'in_review',
        details: 'Presa in carico dall\'admin',
      })
      if (result.success) {
        router.refresh()
      } else {
        alert(`Errore: ${result.error}`)
      }
    })
  }

  const handleConfirmPayment = () => {
    if (
      !confirm(
        'Confermi di aver ricevuto il pagamento? La prenotazione verra confermata.'
      )
    )
      return

    startTransition(async () => {
      const result = await confirmPayment(quote.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(`Errore: ${result.error}`)
      }
    })
  }

  const packageName =
    quote.request_type === 'tour'
      ? quote.tour?.title
      : quote.cruise?.title
  const packageSlug =
    quote.request_type === 'tour'
      ? quote.tour?.slug
      : quote.cruise?.slug
  const packageDuration =
    quote.request_type === 'tour'
      ? quote.tour?.durata_notti
      : quote.cruise?.durata_notti

  const latestOffer = quote.offers[0] ?? null
  const latestPayment = quote.payments[0] ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/preventivi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-secondary">
                Preventivo
              </h1>
              <StatusBadge status={quote.status} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">
              ID: {quote.id.slice(0, 8)}... &middot; Creato il{' '}
              {formatDate(quote.created_at)}
            </p>
          </div>
        </div>

        {/* Action buttons based on current status */}
        <div className="flex flex-wrap items-center gap-2">
          {quote.status === 'sent' && (
            <Button onClick={handleSetInReview} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Prendi in Carico
            </Button>
          )}

          {(quote.status === 'sent' || quote.status === 'in_review') && (
            <CreateOfferDialog
              requestId={quote.id}
              onSuccess={handleRefresh}
            />
          )}

          {quote.status === 'accepted' && (
            <SendPaymentDialog
              requestId={quote.id}
              offerAmount={latestOffer?.total_price ?? null}
              onSuccess={handleRefresh}
            />
          )}

          {quote.status === 'payment_sent' && (
            <Button
              onClick={handleConfirmPayment}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Conferma Pagamento
            </Button>
          )}

          {quote.status !== 'confirmed' &&
            quote.status !== 'rejected' &&
            quote.status !== 'declined' && (
              <RejectDialog
                requestId={quote.id}
                onSuccess={handleRefresh}
              />
            )}
        </div>
      </div>

      {/* Workflow Timeline */}
      <Card>
        <CardContent className="p-4">
          <WorkflowTimeline currentStatus={quote.status} />
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Agency + Package */}
        <div className="space-y-6 lg:col-span-2">
          {/* Agency Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                <Building2 className="h-5 w-5" />
                Informazioni Agenzia
              </h2>
              {quote.agency ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow
                    icon={Building2}
                    label="Ragione sociale"
                    value={quote.agency.business_name}
                  />
                  <InfoRow
                    icon={Users}
                    label="Contatto"
                    value={quote.agency.contact_name}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Telefono"
                    value={quote.agency.phone}
                  />
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={quote.agency.email}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Sede"
                    value={
                      quote.agency.city
                        ? `${quote.agency.city}${quote.agency.province ? ` (${quote.agency.province})` : ''}`
                        : null
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Agenzia non trovata.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                <Package className="h-5 w-5" />
                Dettagli Richiesta
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow
                  icon={quote.request_type === 'tour' ? Map : Ship}
                  label="Tipo"
                  value={quote.request_type === 'tour' ? 'Tour' : 'Crociera'}
                />
                <InfoRow
                  icon={FileText}
                  label="Pacchetto"
                  value={
                    packageName ? (
                      packageSlug ? (
                        <Link
                          href={`/${quote.request_type === 'tour' ? 'tours' : 'crociere'}/${packageSlug}`}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          {packageName}
                        </Link>
                      ) : (
                        packageName
                      )
                    ) : (
                      '\u2014'
                    )
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label="Durata"
                  value={packageDuration}
                />
                <InfoRow
                  icon={Users}
                  label="Partecipanti"
                  value={
                    (quote.participants_adults ?? 0) +
                      (quote.participants_children ?? 0) >
                    0
                      ? `${quote.participants_adults ?? 0} adulti${(quote.participants_children ?? 0) > 0 ? `, ${quote.participants_children} bambini` : ''}`
                      : null
                  }
                />
                {quote.request_type === 'cruise' && (
                  <>
                    <InfoRow
                      icon={Ship}
                      label="Tipo cabina"
                      value={quote.cabin_type}
                    />
                    <InfoRow
                      icon={Ship}
                      label="N. cabine"
                      value={
                        quote.num_cabins
                          ? String(quote.num_cabins)
                          : null
                      }
                    />
                  </>
                )}
              </div>

              {/* Extras */}
              {quote.extras.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    Extra richiesti
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {quote.extras.map((extra) => (
                      <Badge key={extra.id} variant="outline">
                        {extra.extra_name}
                        {extra.quantity && extra.quantity > 1
                          ? ` x${extra.quantity}`
                          : ''}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Notes */}
              {quote.notes && (
                <>
                  <Separator className="my-4" />
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    Note dell&apos;agenzia
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Offer section */}
          {quote.offers.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                  <DollarSign className="h-5 w-5" />
                  Offerte
                </h2>
                <div className="space-y-4">
                  {quote.offers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className={cn(
                        'rounded-lg border p-4',
                        idx === 0
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-gray-200'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {idx === 0 && (
                            <Badge className="mb-2 text-xs">
                              Ultima offerta
                            </Badge>
                          )}
                          <p className="text-2xl font-bold">
                            EUR{' '}
                            {offer.total_price?.toLocaleString('it-IT', {
                              minimumFractionDigits: 2,
                            }) ?? '\u2014'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(offer.created_at)}
                        </p>
                      </div>
                      {offer.conditions && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Condizioni
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {offer.conditions}
                          </p>
                        </div>
                      )}
                      {offer.payment_terms && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Termini di pagamento
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {offer.payment_terms}
                          </p>
                        </div>
                      )}
                      {offer.offer_expiry && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Scadenza
                          </p>
                          <p className="text-sm">
                            {formatDateShort(offer.offer_expiry)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment section */}
          {quote.payments.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                  <CreditCard className="h-5 w-5" />
                  Pagamenti
                </h2>
                <div className="space-y-4">
                  {quote.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-lg font-bold">
                          EUR{' '}
                          {payment.amount?.toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                          }) ?? '\u2014'}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            payment.status === 'confirmed'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : payment.status === 'received'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                          )}
                        >
                          {payment.status === 'confirmed'
                            ? 'Confermato'
                            : payment.status === 'received'
                              ? 'Ricevuto'
                              : 'In attesa'}
                        </Badge>
                      </div>
                      {payment.bank_details && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            IBAN
                          </p>
                          <p className="font-mono text-sm">
                            {payment.bank_details}
                          </p>
                        </div>
                      )}
                      {payment.reference && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Causale
                          </p>
                          <p className="text-sm">{payment.reference}</p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Timeline */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                <Clock className="h-5 w-5" />
                Storico Attivita
              </h2>
              <ActivityTimeline entries={quote.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
