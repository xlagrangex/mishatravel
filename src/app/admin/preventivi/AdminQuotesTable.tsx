'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  Send,
  Eye,
  XCircle,
  ThumbsDown,
  Search,
  ArrowUpDown,
  Ship,
  Map,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type {
  QuoteListItem,
  QuoteStats,
} from '@/lib/supabase/queries/admin-quotes'

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  sent: {
    label: 'Inviato',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: Send,
  },
  in_review: {
    label: 'In Revisione',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    icon: Eye,
  },
  offer_sent: {
    label: 'Offerta Inviata',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: FileText,
  },
  accepted: {
    label: 'Accettato',
    color: 'border-green-200 bg-green-50 text-green-700',
    icon: CheckCircle,
  },
  declined: {
    label: 'Rifiutato Agenzia',
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: ThumbsDown,
  },
  payment_sent: {
    label: 'Pagamento Inviato',
    color: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: CreditCard,
  },
  confirmed: {
    label: 'Confermato',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rifiutato',
    color: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
  },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: 'border-gray-200 bg-gray-50 text-gray-600',
    icon: FileText,
  }
  return (
    <Badge variant="outline" className={cn('text-xs', config.color)}>
      {config.label}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------------------

function StatCards({ stats }: { stats: QuoteStats }) {
  const cards = [
    {
      label: 'Totali',
      value: stats.total,
      icon: FileText,
      bg: 'bg-muted text-muted-foreground',
    },
    {
      label: 'In Attesa',
      value: stats.sent + stats.in_review,
      icon: Clock,
      bg: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Offerte Inviate',
      value: stats.offer_sent,
      icon: Send,
      bg: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Accettati',
      value: stats.accepted,
      icon: CheckCircle,
      bg: 'bg-green-100 text-green-700',
    },
    {
      label: 'Pagamento',
      value: stats.payment_sent,
      icon: CreditCard,
      bg: 'bg-cyan-100 text-cyan-700',
    },
    {
      label: 'Confermati',
      value: stats.confirmed,
      icon: CheckCircle,
      bg: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn('rounded-lg p-2', stat.bg)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

type SortKey = 'created_at' | 'status' | 'agency' | 'type'
type SortDir = 'asc' | 'desc'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AdminQuotesTableProps {
  quotes: QuoteListItem[]
  stats: QuoteStats
  agencies: { id: string; business_name: string }[]
}

export default function AdminQuotesTable({
  quotes,
  stats,
  agencies,
}: AdminQuotesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let result = [...quotes]

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          (r.agency_business_name ?? '').toLowerCase().includes(q) ||
          (r.tour_title ?? '').toLowerCase().includes(q) ||
          (r.cruise_title ?? '').toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.request_type === typeFilter)
    }

    // Sorting
    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'created_at':
          return (
            dir *
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime())
          )
        case 'status':
          return dir * a.status.localeCompare(b.status)
        case 'agency':
          return (
            dir *
            (a.agency_business_name ?? '').localeCompare(
              b.agency_business_name ?? ''
            )
          )
        case 'type':
          return dir * a.request_type.localeCompare(b.request_type)
        default:
          return 0
      }
    })

    return result
  }, [quotes, searchQuery, statusFilter, typeFilter, sortKey, sortDir])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const SortButton = ({
    column,
    children,
  }: {
    column: SortKey
    children: React.ReactNode
  }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={() => toggleSort(column)}
    >
      {children}
      <ArrowUpDown
        className={cn(
          'h-3 w-3',
          sortKey === column ? 'text-foreground' : 'text-muted-foreground/50'
        )}
      />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Preventivi
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestione richieste preventivo e workflow di conferma
          {quotes.length > 0 && (
            <span className="ml-1">({quotes.length} totali)</span>
          )}
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards stats={stats} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca agenzia, tour, crociera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="tour">Tour</SelectItem>
            <SelectItem value="cruise">Crociera</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun preventivo trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Prova a modificare i filtri.'
              : 'Le richieste di preventivo dalle agenzie appariranno qui.'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton column="created_at">Data</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="agency">Agenzia</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="type">Tipo</SortButton>
                </TableHead>
                <TableHead>Pacchetto</TableHead>
                <TableHead>Partecipanti</TableHead>
                <TableHead>
                  <SortButton column="status">Stato</SortButton>
                </TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((quote) => (
                <TableRow key={quote.id} className="group">
                  {/* Date */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(quote.created_at)}
                  </TableCell>

                  {/* Agency */}
                  <TableCell className="font-medium">
                    {quote.agency_business_name ?? '\u2014'}
                    {quote.agency_email && (
                      <p className="text-xs text-muted-foreground">
                        {quote.agency_email}
                      </p>
                    )}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        quote.request_type === 'tour'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-sky-200 bg-sky-50 text-sky-700'
                      )}
                    >
                      {quote.request_type === 'tour' ? (
                        <>
                          <Map className="mr-1 h-3 w-3" />
                          Tour
                        </>
                      ) : (
                        <>
                          <Ship className="mr-1 h-3 w-3" />
                          Crociera
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Package */}
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {quote.request_type === 'tour'
                      ? quote.tour_title ?? '\u2014'
                      : quote.cruise_title ?? '\u2014'}
                  </TableCell>

                  {/* Participants */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {(quote.participants_adults ?? 0) +
                      (quote.participants_children ?? 0) >
                    0 ? (
                      <>
                        {quote.participants_adults ?? 0} ad.
                        {(quote.participants_children ?? 0) > 0 &&
                          ` + ${quote.participants_children} bam.`}
                      </>
                    ) : (
                      '\u2014'
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={quote.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="xs" asChild>
                      <Link href={`/admin/preventivi/${quote.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        Dettaglio
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
