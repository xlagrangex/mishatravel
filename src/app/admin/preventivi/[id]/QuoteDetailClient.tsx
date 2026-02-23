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
  CheckCircle,
  XCircle,
  ThumbsDown,
  CreditCard,
  AlertCircle,
  Package,
  DollarSign,
  Loader2,
  Upload,
  Download,
  Trash2,
  UserCheck,
  Undo2,
  Bell,
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
import type { QuoteDetailData, BankingPreset } from '@/lib/supabase/queries/admin-quotes'
import {
  createOffer,
  confirmWithContract,
  uploadQuoteDocument,
  deleteQuoteDocument,
  rejectQuote,
  revokeOffer,
  sendReminder,
} from '../actions'

// ---------------------------------------------------------------------------
// Status config — new 4-state workflow
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; step: number }
> = {
  requested: {
    label: 'Richiesto',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: Send,
    step: 1,
  },
  offered: {
    label: 'Offerta Inviata',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: FileText,
    step: 2,
  },
  accepted: {
    label: 'Accettato',
    color: 'border-green-200 bg-green-50 text-green-700',
    icon: CheckCircle,
    step: 3,
  },
  confirmed: {
    label: 'Confermato',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle,
    step: 4,
  },
  declined: {
    label: 'Rifiutato Agenzia',
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: ThumbsDown,
    step: 0,
  },
  rejected: {
    label: 'Rifiutato',
    color: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
    step: 0,
  },
  // Legacy statuses (for old data)
  sent: {
    label: 'Inviato',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: Send,
    step: 1,
  },
  in_review: {
    label: 'In Revisione',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    icon: FileText,
    step: 1,
  },
  offer_sent: {
    label: 'Offerta Inviata',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: FileText,
    step: 2,
  },
  payment_sent: {
    label: 'Pagamento Inviato',
    color: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: CreditCard,
    step: 3,
  },
}

const TIMELINE_STEPS = ['requested', 'offered', 'accepted', 'confirmed']

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

/**
 * Map legacy statuses to the new 4-step workflow for the visual timeline.
 */
function normalizeStatus(status: string): string {
  switch (status) {
    case 'sent':
    case 'in_review':
      return 'requested'
    case 'offer_sent':
      return 'offered'
    case 'payment_sent':
      return 'confirmed'
    default:
      return status
  }
}

// ---------------------------------------------------------------------------
// Visual Timeline (workflow steps)
// ---------------------------------------------------------------------------

function WorkflowTimeline({ currentStatus }: { currentStatus: string }) {
  const normalized = normalizeStatus(currentStatus)
  const currentStep = STATUS_CONFIG[normalized]?.step ?? 0
  const isFinal = currentStatus === 'rejected' || currentStatus === 'declined'

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {TIMELINE_STEPS.map((stepKey, idx) => {
        const config = STATUS_CONFIG[stepKey]
        const step = config.step
        const isActive = stepKey === normalized
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
  previewPricePerPerson,
  previewPriceLabel,
  totalParticipants,
  onSuccess,
}: {
  requestId: string
  previewPricePerPerson?: number | null
  previewPriceLabel?: string | null
  totalParticipants: number
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Default expiry: 7 days from today
  const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Calculate default total: price per person × participants
  const defaultTotal =
    previewPricePerPerson && totalParticipants > 0
      ? previewPricePerPerson * totalParticipants
      : previewPricePerPerson ?? null

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
            Prepara un&apos;offerta per l&apos;agenzia con prezzo e condizioni.
            L&apos;offerta verra inviata immediatamente.
          </DialogDescription>
        </DialogHeader>

        {/* Price reference from agency request */}
        {(previewPricePerPerson || previewPriceLabel) && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Riferimento prezzo dal preventivo</p>
            <div className="flex items-baseline gap-3">
              <span className="text-sm text-blue-900">
                Prezzo a persona: <strong>{previewPriceLabel || `EUR ${Number(previewPricePerPerson).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}</strong>
              </span>
              {totalParticipants > 0 && previewPricePerPerson && (
                <span className="text-sm text-blue-900">
                  &middot; {totalParticipants} pax = <strong>EUR {(previewPricePerPerson * totalParticipants).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="total_price">Prezzo totale *</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                id="total_price"
                name="total_price"
                type="number"
                step="0.01"
                min="0"
                required
                className="pl-7"
                placeholder="1500.00"
                defaultValue={defaultTotal ?? ''}
              />
            </div>
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
            <Input
              id="offer_expiry"
              name="offer_expiry"
              type="date"
              defaultValue={defaultExpiry}
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
              Invia Offerta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Revoke Offer Button
// ---------------------------------------------------------------------------

function RevokeOfferButton({
  requestId,
  onSuccess,
}: {
  requestId: string
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeOffer(requestId)
      if (result.success) {
        setShowConfirm(false)
        onSuccess()
      }
    })
  }

  return (
    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
          <Undo2 className="h-4 w-4" />
          Revoca Offerta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revoca Offerta</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler revocare l&apos;offerta? Lo stato tornera a
            &quot;Richiesto&quot; e potrai creare una nuova offerta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Annulla
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Conferma Revoca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Confirm Contract Dialog (replaces SendPaymentDialog)
// ---------------------------------------------------------------------------

function ConfirmContractDialog({
  requestId,
  offerId,
  bankingPresets,
  onSuccess,
}: {
  requestId: string
  offerId: string
  bankingPresets: BankingPreset[]
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [contractUrl, setContractUrl] = useState<string | null>(null)
  const [contractFileName, setContractFileName] = useState<string | null>(null)

  // Banking fields (controlled for preset auto-fill)
  const [iban, setIban] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [causale, setCausale] = useState('')
  const [banca, setBanca] = useState('')

  const handlePresetSelect = (value: string) => {
    if (!value) return
    const idx = Number(value)
    const preset = bankingPresets[idx]
    if (!preset) return
    setIban(preset.iban)
    setDestinatario(preset.destinatario ?? '')
    setCausale(preset.causale ?? '')
    setBanca(preset.banca ?? '')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload fallito')
      }

      const data = await res.json()
      setContractUrl(data.url)
      setContractFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!contractUrl) {
      setError('Carica il contratto PDF prima di procedere.')
      return
    }

    const form = new FormData(e.currentTarget)
    const notes = (form.get('contract_notes') as string)?.trim() || null

    startTransition(async () => {
      const result = await confirmWithContract({
        request_id: requestId,
        offer_id: offerId,
        contract_file_url: contractUrl,
        iban: iban.trim(),
        destinatario: destinatario.trim() || null,
        causale: causale.trim() || null,
        banca: banca.trim() || null,
        send_email: true,
        notes,
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
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="h-4 w-4" />
          Invia Contratto + Dati Bonifico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>Invia Contratto e Dati Pagamento</DialogTitle>
          <DialogDescription>
            Carica il contratto PDF e inserisci i dati per il bonifico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
          {/* Contract PDF upload */}
          <div className="overflow-hidden">
            <Label>Contratto PDF *</Label>
            {contractFileName ? (
              <div className="mt-1 flex items-center gap-2 rounded-md border bg-green-50 px-3 py-2 text-sm overflow-hidden max-w-full">
                <FileText className="h-4 w-4 text-green-600 shrink-0" />
                <span className="truncate block flex-1" style={{ maxWidth: 'calc(100% - 60px)' }}>{contractFileName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setContractUrl(null)
                    setContractFileName(null)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Caricamento...' : 'Clicca per caricare il PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Preset selector */}
          {bankingPresets.length > 0 && (
            <div>
              <Label htmlFor="preset">Dati preimpostati</Label>
              <select
                id="preset"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                defaultValue=""
                onChange={(e) => handlePresetSelect(e.target.value)}
              >
                <option value="">-- Seleziona dati salvati --</option>
                {bankingPresets.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.iban}{p.destinatario ? ` - ${p.destinatario}` : ''}{p.banca ? ` (${p.banca})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Separator />

          {/* Banking fields */}
          <div>
            <Label htmlFor="iban">IBAN *</Label>
            <Input
              id="iban"
              name="iban"
              required
              placeholder="IT60 X054 2811 1010 0000 0123 456"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="destinatario">Destinatario</Label>
            <Input
              id="destinatario"
              name="destinatario"
              placeholder="MishaTravel S.r.l."
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="banca">Banca</Label>
              <Input
                id="banca"
                name="banca"
                placeholder="Nome banca"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="causale">Causale</Label>
              <Input
                id="causale"
                name="causale"
                placeholder="Causale bonifico"
                value={causale}
                onChange={(e) => setCausale(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contract_notes">Note (facoltative)</Label>
            <Textarea
              id="contract_notes"
              name="contract_notes"
              rows={2}
              placeholder="Note aggiuntive per l'agenzia..."
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
            <Button
              type="submit"
              disabled={isPending || !contractUrl}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Conferma e Invia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Upload Quote Document Dialog
// ---------------------------------------------------------------------------

function UploadDocumentDialog({
  requestId,
  onSuccess,
}: {
  requestId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload fallito')
      const data = await res.json()
      setFileUrl(data.url)
      setFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!fileUrl || !fileName) {
      setError('Seleziona un file.')
      return
    }

    const form = new FormData(e.currentTarget)
    const documentType = (form.get('document_type') as string) || 'altro'

    startTransition(async () => {
      const result = await uploadQuoteDocument({
        request_id: requestId,
        file_url: fileUrl,
        file_name: fileName,
        document_type: documentType,
      })
      if (result.success) {
        setOpen(false)
        setFileUrl(null)
        setFileName(null)
        onSuccess()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4" />
          Carica Documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carica Documento</DialogTitle>
          <DialogDescription>
            Carica un documento (fattura, contratto, altro) per questo
            preventivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>File *</Label>
            {fileName ? (
              <div className="mt-1 flex items-center gap-2 rounded-md border bg-green-50 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="flex-1 truncate">{fileName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileUrl(null)
                    setFileName(null)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Caricamento...' : 'Clicca per caricare'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div>
            <Label htmlFor="document_type">Tipo documento</Label>
            <select
              id="document_type"
              name="document_type"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              defaultValue="altro"
            >
              <option value="fattura">Fattura</option>
              <option value="contratto">Contratto</option>
              <option value="estratto_conto">Estratto Conto</option>
              <option value="altro">Altro</option>
            </select>
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
            <Button type="submit" disabled={isPending || !fileUrl}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Carica
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
// Document Section (sidebar)
// ---------------------------------------------------------------------------

function DocumentSection({
  title,
  type,
  documents,
  onDelete,
  deletingDocId,
}: {
  title: string
  type: string
  documents: QuoteDetailData['documents']
  onDelete: (id: string) => void
  deletingDocId: string | null
}) {
  if (documents.length === 0) return null

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-md border px-2.5 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{doc.file_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDateShort(doc.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onDelete(doc.id)}
                disabled={deletingDocId === doc.id}
              >
                {deletingDocId === doc.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Send Reminder Dialog
// ---------------------------------------------------------------------------

function SendReminderDialog({
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
    const message = (form.get('message') as string)?.trim() || null

    startTransition(async () => {
      const result = await sendReminder({
        request_id: requestId,
        message,
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
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4" />
          Sollecita Agenzia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sollecita Agenzia</DialogTitle>
          <DialogDescription>
            Invia un promemoria all&apos;agenzia per questa richiesta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Messaggio (opzionale)</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Aggiungi un messaggio personalizzato..."
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
              Invia Sollecito
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
  bankingPresets: BankingPreset[]
}

export default function QuoteDetailClient({ quote, bankingPresets }: QuoteDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleDeleteDocument = (docId: string) => {
    if (!confirm('Eliminare questo documento?')) return

    setDeletingDocId(docId)
    startTransition(async () => {
      const result = await deleteQuoteDocument(docId, quote.id)
      setDeletingDocId(null)
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

  // Normalized status for action button logic
  const normalized = normalizeStatus(quote.status)
  const isTerminal = normalized === 'rejected' || normalized === 'declined'

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
          {/* requested/sent/in_review → Create Offer */}
          {(normalized === 'requested') && (
            <CreateOfferDialog
              requestId={quote.id}
              previewPricePerPerson={quote.preview_price}
              previewPriceLabel={quote.preview_price_label}
              totalParticipants={(quote.participants_adults ?? 0) + (quote.participants_children ?? 0)}
              onSuccess={handleRefresh}
            />
          )}

          {/* offered → Revoke Offer */}
          {normalized === 'offered' && (
            <RevokeOfferButton
              requestId={quote.id}
              onSuccess={handleRefresh}
            />
          )}

          {/* accepted → Send Contract + IBAN */}
          {normalized === 'accepted' && latestOffer && (
            <ConfirmContractDialog
              requestId={quote.id}
              offerId={latestOffer.id}
              bankingPresets={bankingPresets}
              onSuccess={handleRefresh}
            />
          )}

          {/* Reminder — available when not terminal */}
          {!isTerminal && (
            <SendReminderDialog
              requestId={quote.id}
              onSuccess={handleRefresh}
            />
          )}

          {/* Reject — available when not terminal and not confirmed */}
          {!isTerminal && normalized !== 'confirmed' && (
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
        {/* Left column: Agency + Package + Offers + Participants + Documents */}
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
                    value={
                      <Link
                        href={`/admin/agenzie/${quote.agency.id}`}
                        className="text-primary hover:underline"
                      >
                        {quote.agency.business_name}
                      </Link>
                    }
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
                {/* Preview price */}
                <InfoRow
                  icon={DollarSign}
                  label="Prezzo visto dall'agenzia"
                  value={
                    quote.preview_price_label
                      ? quote.preview_price_label
                      : quote.preview_price
                        ? `EUR ${Number(quote.preview_price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                        : null
                  }
                />
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
                      {/* Contract + banking details (shown after confirmation) */}
                      {offer.contract_file_url && (
                        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="text-sm font-medium text-emerald-800">
                              Contratto caricato
                            </span>
                            <a
                              href={offer.contract_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-xs text-emerald-600 hover:underline shrink-0"
                            >
                              <Download className="inline h-3 w-3 mr-1" />
                              Scarica
                            </a>
                          </div>
                          <div className="mt-2 space-y-0.5 text-xs text-emerald-700">
                            {offer.iban && (
                              <p>IBAN: <span className="font-mono font-semibold">{offer.iban}</span></p>
                            )}
                            {offer.destinatario && (
                              <p>Destinatario: <span className="font-semibold">{offer.destinatario}</span></p>
                            )}
                            {offer.banca && (
                              <p>Banca: {offer.banca}</p>
                            )}
                            {offer.causale && (
                              <p>Causale: <span className="font-semibold">{offer.causale}</span></p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment section (legacy — kept for old records) */}
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

          {/* Participants section */}
          {quote.participants && quote.participants.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                  <UserCheck className="h-5 w-5" />
                  Partecipanti
                </h2>
                <div className="space-y-3">
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
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {p.full_name}
                            {p.is_child ? (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-amber-200 bg-amber-50 text-amber-700"
                              >
                                bambino{p.age != null ? ` (${p.age} anni)` : ''}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-blue-200 bg-blue-50 text-blue-700"
                              >
                                adulto{p.age != null ? ` (${p.age} anni)` : ''}
                              </Badge>
                            )}
                          </p>
                          {(p.document_type || p.document_number) && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {p.document_type && <span>{p.document_type}</span>}
                              {p.document_type && p.document_number && ' \u2022 '}
                              {p.document_number && (
                                <span className="font-mono">{p.document_number}</span>
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

        </div>

        {/* Right column: Timeline + Documents */}
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

          {/* Documents section — organized by type */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-secondary">
                  <FileText className="h-5 w-5" />
                  Documenti
                </h2>
                <UploadDocumentDialog
                  requestId={quote.id}
                  onSuccess={handleRefresh}
                />
              </div>

              {/* Fatture */}
              <DocumentSection
                title="Fatture"
                type="fattura"
                documents={quote.documents?.filter(d => d.document_type === 'fattura') ?? []}
                onDelete={handleDeleteDocument}
                deletingDocId={deletingDocId}
              />

              {/* Contratti */}
              <DocumentSection
                title="Contratti"
                type="contratto"
                documents={quote.documents?.filter(d => d.document_type === 'contratto') ?? []}
                onDelete={handleDeleteDocument}
                deletingDocId={deletingDocId}
              />

              {/* Estratti conto */}
              <DocumentSection
                title="Estratti Conto"
                type="estratto_conto"
                documents={quote.documents?.filter(d => d.document_type === 'estratto_conto') ?? []}
                onDelete={handleDeleteDocument}
                deletingDocId={deletingDocId}
              />

              {/* Altri documenti */}
              {(() => {
                const others = quote.documents?.filter(
                  d => !['fattura', 'contratto', 'estratto_conto'].includes(d.document_type)
                ) ?? []
                return others.length > 0 ? (
                  <DocumentSection
                    title="Altri"
                    type="altro"
                    documents={others}
                    onDelete={handleDeleteDocument}
                    deletingDocId={deletingDocId}
                  />
                ) : null
              })()}

              {(!quote.documents || quote.documents.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nessun documento caricato.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
