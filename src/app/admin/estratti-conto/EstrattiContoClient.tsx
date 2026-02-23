'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileSpreadsheet,
  Upload,
  Send,
  Archive,
  Plus,
  Download,
  Trash2,
  Mail,
  Loader2,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import type {
  StatementListItem,
  StatementStats,
} from '@/lib/supabase/queries/admin-statements'
import {
  createAccountStatement,
  deleteAccountStatement,
  sendAccountStatementEmail,
} from '../agenzie/actions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EstrattiContoClientProps {
  statements: StatementListItem[]
  stats: StatementStats
  agencies: { id: string; business_name: string }[]
}

// ---------------------------------------------------------------------------
// Stats cards
// ---------------------------------------------------------------------------

function StatsCards({ stats }: { stats: StatementStats }) {
  const items = [
    { label: 'Estratti Totali', value: stats.total, icon: FileSpreadsheet },
    { label: 'Bozze', value: stats.bozze, icon: Archive },
    { label: 'Inviati', value: stats.inviati, icon: Send },
    { label: 'Questo Mese', value: stats.thisMonth, icon: Upload },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// New Statement Dialog
// ---------------------------------------------------------------------------

function NewStatementDialog({
  agencies,
  onSuccess,
}: {
  agencies: { id: string; business_name: string }[]
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

    if (!fileUrl) {
      setError('Carica un file prima di procedere.')
      return
    }

    const form = new FormData(e.currentTarget)
    const agencyId = form.get('agency_id') as string
    const title = form.get('title') as string
    const data = form.get('data') as string
    const sendNow = form.get('send_now') === 'on'

    startTransition(async () => {
      const result = await createAccountStatement({
        agency_id: agencyId,
        title,
        file_url: fileUrl,
        data,
        stato: sendNow ? 'Inviato via Mail' : 'Bozza',
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      // If send_now, also send the email
      if (sendNow && result.id) {
        const emailResult = await sendAccountStatementEmail(result.id)
        if (!emailResult.success) {
          // Statement created but email failed — still close and show warning
          console.error('Email failed:', emailResult.error)
        }
      }

      setOpen(false)
      setFileUrl(null)
      setFileName(null)
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuovo Estratto Conto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo Estratto Conto</DialogTitle>
          <DialogDescription>
            Carica un estratto conto e associalo a un&apos;agenzia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="agency_id">Agenzia *</Label>
            <select
              id="agency_id"
              name="agency_id"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Seleziona agenzia...</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.business_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Es. Estratto Conto Gennaio 2026"
            />
          </div>

          <div>
            <Label htmlFor="data">Data documento *</Label>
            <Input id="data" name="data" type="date" required />
          </div>

          <div>
            <Label>File PDF *</Label>
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
                {uploading ? 'Caricamento...' : 'Clicca per caricare il PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send_now"
              name="send_now"
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="send_now" className="text-sm font-normal">
              Invia subito via email all&apos;agenzia
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
            <Button type="submit" disabled={isPending || !fileUrl}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EstrattiContoClient({
  statements,
  stats,
  agencies,
}: EstrattiContoClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const handleRefresh = () => {
    router.refresh()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Eliminare questo estratto conto?')) return

    setActionId(id)
    startTransition(async () => {
      const result = await deleteAccountStatement(id)
      setActionId(null)
      if (result.success) {
        router.refresh()
      } else {
        alert(`Errore: ${result.error}`)
      }
    })
  }

  const handleSendEmail = (id: string) => {
    if (!confirm('Inviare via email all\'agenzia?')) return

    setActionId(id)
    startTransition(async () => {
      const result = await sendAccountStatementEmail(id)
      setActionId(null)
      if (result.success) {
        router.refresh()
      } else {
        alert(`Errore: ${result.error}`)
      }
    })
  }

  const filtered = filter
    ? statements.filter(
        (s) =>
          s.title?.toLowerCase().includes(filter.toLowerCase()) ||
          s.agency?.business_name
            .toLowerCase()
            .includes(filter.toLowerCase())
      )
    : statements

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Estratti Conto
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci e invia estratti conto alle agenzie partner.
          </p>
        </div>
        <NewStatementDialog agencies={agencies} onSuccess={handleRefresh} />
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo o agenzia..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {statements.length === 0
                  ? 'Nessun estratto conto caricato.'
                  : 'Nessun risultato per la ricerca.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Titolo</th>
                    <th className="px-4 py-3 font-medium">Agenzia</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Stato</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">
                            {s.title ?? 'Senza titolo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.agency?.business_name ?? '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.data
                          ? new Date(s.data).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '\u2014'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            s.stato === 'Inviato via Mail'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          )}
                        >
                          {s.stato ?? 'Bozza'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {s.file_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={s.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Scarica"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {s.stato !== 'Inviato via Mail' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendEmail(s.id)}
                              disabled={actionId === s.id && isPending}
                              title="Invia via email"
                            >
                              {actionId === s.id && isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(s.id)}
                            disabled={actionId === s.id && isPending}
                            title="Elimina"
                          >
                            {actionId === s.id && isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
