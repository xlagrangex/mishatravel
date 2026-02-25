'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { QuoteListItem } from '@/lib/supabase/queries/admin-quotes'

const KANBAN_COLUMNS = [
  {
    id: 'new',
    label: 'Nuovi',
    statuses: ['sent', 'in_review', 'requested'],
    color: 'border-t-blue-500',
    bg: 'bg-blue-50/50',
  },
  {
    id: 'offered',
    label: 'Offerta Inviata',
    statuses: ['offer_sent', 'offered'],
    color: 'border-t-purple-500',
    bg: 'bg-purple-50/50',
  },
  {
    id: 'accepted',
    label: 'Accettati',
    statuses: ['accepted'],
    color: 'border-t-green-500',
    bg: 'bg-green-50/50',
  },
  {
    id: 'contract',
    label: 'Contratto Inviato',
    statuses: ['contract_sent'],
    color: 'border-t-indigo-500',
    bg: 'bg-indigo-50/50',
  },
  {
    id: 'confirmed',
    label: 'Confermati',
    statuses: ['confirmed'],
    color: 'border-t-emerald-500',
    bg: 'bg-emerald-50/50',
  },
  {
    id: 'closed',
    label: 'Chiusi',
    statuses: ['declined', 'rejected'],
    color: 'border-t-red-500',
    bg: 'bg-red-50/50',
  },
]

interface KanbanBoardProps {
  quotes: QuoteListItem[]
}

export default function KanbanBoard({ quotes }: KanbanBoardProps) {
  const columns = KANBAN_COLUMNS.map((col) => ({
    ...col,
    items: quotes.filter((q) => col.statuses.includes(q.status)),
  }))

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className="flex min-w-[260px] flex-1 flex-col">
          {/* Column header */}
          <div
            className={cn(
              'rounded-t-lg border-t-4 px-3 py-2',
              col.color,
              col.bg
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {col.items.length}
              </Badge>
            </div>
          </div>
          {/* Cards */}
          <div
            className={cn(
              'flex flex-1 flex-col gap-2 rounded-b-lg border border-t-0 p-2',
              col.bg
            )}
          >
            {col.items.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nessun preventivo
              </p>
            ) : (
              col.items.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/admin/preventivi/${quote.id}`}
                >
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="space-y-1.5 p-3">
                      <p className="truncate text-sm font-medium">
                        {quote.agency_business_name ?? 'Senza agenzia'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {quote.request_type === 'tour'
                          ? quote.tour_title ?? 'Tour'
                          : quote.cruise_title ?? 'Crociera'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(quote.created_at).toLocaleDateString(
                            'it-IT',
                            { day: '2-digit', month: 'short' }
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {quote.request_type === 'tour' ? 'Tour' : 'Crociera'}
                        </Badge>
                        <span>
                          {(quote.participants_adults ?? 0) +
                            (quote.participants_children ?? 0)}{' '}
                          pax
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
