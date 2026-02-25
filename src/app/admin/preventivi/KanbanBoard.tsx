'use client'

import Link from 'next/link'
import { Map, Ship } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getAdminStatusAction } from '@/lib/quote-status-config'
import { ActionIndicator } from '@/components/ActionIndicator'
import type { QuoteListItem } from '@/lib/supabase/queries/admin-quotes'

const STATUS_LABEL: Record<string, string> = {
  sent: 'Inviato',
  in_review: 'In Revisione',
  offer_sent: 'Offerta Inviata',
  accepted: 'Accettato',
  contract_sent: 'Contratto Inviato',
  declined: 'Rifiutato Agenzia',
  payment_sent: 'Pagamento Inviato',
  confirmed: 'Confermato',
  rejected: 'Rifiutato',
  archived: 'Archiviato',
}

const KANBAN_COLUMNS = [
  {
    id: 'new',
    label: 'Nuovi',
    statuses: ['sent', 'in_review', 'requested'],
  },
  {
    id: 'offered',
    label: 'Offerta Inviata',
    statuses: ['offer_sent', 'offered'],
  },
  {
    id: 'accepted',
    label: 'Accettati',
    statuses: ['accepted'],
  },
  {
    id: 'contract',
    label: 'Contratto Inviato',
    statuses: ['contract_sent'],
  },
  {
    id: 'confirmed',
    label: 'Confermati',
    statuses: ['confirmed'],
  },
  {
    id: 'closed',
    label: 'Chiusi',
    statuses: ['declined', 'rejected'],
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
        <div key={col.id} className="flex min-w-[280px] flex-1 flex-col">
          {/* Column header */}
          <div className="rounded-t-lg border border-b-0 bg-muted/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {col.label}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {col.items.length}
              </Badge>
            </div>
          </div>
          {/* Cards */}
          <div className="flex flex-1 flex-col gap-2 rounded-b-lg border border-t-0 bg-muted/30 p-2">
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
                  <Card className="cursor-pointer border bg-white transition-shadow hover:shadow-md">
                    <CardContent className="space-y-2 p-3">
                      {/* Agency name + email */}
                      <div>
                        <p className="truncate text-sm font-medium">
                          {quote.agency_business_name ?? 'Senza agenzia'}
                        </p>
                        {quote.agency_email && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {quote.agency_email}
                          </p>
                        )}
                      </div>

                      {/* Type badge + package name */}
                      <div className="flex items-start gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0 text-[10px] px-1.5 py-0',
                            quote.request_type === 'tour'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-sky-200 bg-sky-50 text-sky-700'
                          )}
                        >
                          {quote.request_type === 'tour' ? (
                            <>
                              <Map className="mr-0.5 h-2.5 w-2.5" />
                              Tour
                            </>
                          ) : (
                            <>
                              <Ship className="mr-0.5 h-2.5 w-2.5" />
                              Crociera
                            </>
                          )}
                        </Badge>
                        <span className="truncate text-xs text-muted-foreground">
                          {quote.request_type === 'tour'
                            ? quote.tour_title ?? 'Tour'
                            : quote.cruise_title ?? 'Crociera'}
                        </span>
                      </div>

                      {/* Date + participants */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {new Date(quote.created_at).toLocaleDateString(
                            'it-IT',
                            { day: '2-digit', month: 'short', year: 'numeric' }
                          )}
                        </span>
                        <span>
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
                        </span>
                      </div>

                      {/* Status + next action */}
                      <div className="flex items-center justify-between gap-2 border-t pt-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {STATUS_LABEL[quote.status] ?? quote.status}
                        </Badge>
                        <div className="min-w-0 flex-1 text-right">
                          <ActionIndicator
                            status={quote.status}
                            {...getAdminStatusAction(quote.status)}
                          />
                        </div>
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
