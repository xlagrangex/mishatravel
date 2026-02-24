import { getEntityHistory, type ActivityLogEntry } from '@/lib/supabase/queries/activity'
import { Badge } from '@/components/ui/badge'
import { Clock, History } from 'lucide-react'

// Action labels in Italian
const ACTION_LABELS: Record<string, string> = {
  'tour.create': 'Creato',
  'tour.update': 'Modificato',
  'tour.delete': 'Eliminato',
  'tour.publish': 'Pubblicato',
  'tour.unpublish': 'Bozza',
  'tour.duplicate': 'Duplicato',
  'cruise.create': 'Creato',
  'cruise.update': 'Modificato',
  'cruise.delete': 'Eliminato',
  'cruise.publish': 'Pubblicato',
  'cruise.unpublish': 'Bozza',
  'cruise.duplicate': 'Duplicato',
  'ship.create': 'Creato',
  'ship.update': 'Modificato',
  'ship.delete': 'Eliminato',
  'destination.create': 'Creato',
  'destination.update': 'Modificato',
  'destination.delete': 'Eliminato',
  'blog.create': 'Creato',
  'blog.update': 'Modificato',
  'blog.delete': 'Eliminato',
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Adesso'
  if (diffMin < 60) return `${diffMin} min fa`
  if (diffHours < 24) return `${diffHours} ore fa`
  if (diffDays < 7) return `${diffDays} giorni fa`

  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ActivityLogProps {
  entityType: string
  entityId: string
}

export default async function ActivityLog({ entityType, entityId }: ActivityLogProps) {
  const history = await getEntityHistory(entityType, entityId, 20)

  if (history.length === 0) return null

  const latest = history[0]

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      {/* Latest modification badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>
          Ultima modifica: <strong className="text-foreground">{formatFullDate(latest.created_at)}</strong>
          {latest.user_email && (
            <> da <strong className="text-foreground">{latest.user_email}</strong></>
          )}
          {' '}
          <Badge variant="outline" className="ml-1 text-xs">
            {ACTION_LABELS[latest.action] ?? latest.action}
          </Badge>
        </span>
      </div>

      {/* Full history (collapsible) */}
      {history.length > 1 && (
        <details className="mt-2">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <History className="h-3 w-3" />
            Storico ({history.length} voci)
          </summary>
          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <Badge variant="outline" className="mr-1.5 text-[10px]">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </Badge>
                  {entry.user_email ?? 'Sistema'}
                </span>
                <span className="shrink-0 tabular-nums">{formatRelativeDate(entry.created_at)}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
