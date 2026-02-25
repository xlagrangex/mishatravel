import { getCurrentUser } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Change = { field: string; from?: string; to?: string }

// ---------------------------------------------------------------------------
// logActivity — main audit function
// ---------------------------------------------------------------------------

/**
 * Log an admin/agency activity for audit trail.
 * Non-blocking: errors are silently caught to avoid disrupting the main action.
 */
export async function logActivity(params: {
  action: string
  entityType: string
  entityId: string
  entityTitle: string
  details?: string
  changes?: Change[]
}): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = createAdminClient()

  await supabase.from('user_activity_log').insert({
    user_id: user.id,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_title: params.entityTitle,
    details: params.details ?? null,
    changes: params.changes?.length ? params.changes : null,
  })
}

// ---------------------------------------------------------------------------
// buildChanges — compare old/new records and produce a diff
// ---------------------------------------------------------------------------

/**
 * Compare two records and return an array of changes for the fields listed in fieldLabels.
 *
 * @param oldRecord  The record BEFORE the update (from DB select)
 * @param newRecord  The record AFTER the update (from form data)
 * @param fieldLabels Mapping of DB column → Italian label, e.g. { title: "Titolo" }
 * @returns Array of changes (only fields that actually differ)
 */
export function buildChanges(
  oldRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>,
  fieldLabels: Record<string, string>,
): Change[] {
  const changes: Change[] = []

  for (const [key, label] of Object.entries(fieldLabels)) {
    const oldVal = normalize(oldRecord[key])
    const newVal = normalize(newRecord[key])

    if (oldVal !== newVal) {
      changes.push({
        field: label,
        from: oldVal || undefined,
        to: newVal || undefined,
      })
    }
  }

  return changes
}

/**
 * Build changes for a CREATE operation (only "to" values).
 */
export function buildCreateChanges(
  record: Record<string, unknown>,
  fieldLabels: Record<string, string>,
): Change[] {
  const changes: Change[] = []

  for (const [key, label] of Object.entries(fieldLabels)) {
    const val = normalize(record[key])
    if (val) {
      changes.push({ field: label, to: val })
    }
  }

  return changes
}

/**
 * Build changes for a DELETE operation (only "from" values).
 */
export function buildDeleteChanges(
  record: Record<string, unknown>,
  fieldLabels: Record<string, string>,
): Change[] {
  const changes: Change[] = []

  for (const [key, label] of Object.entries(fieldLabels)) {
    const val = normalize(record[key])
    if (val) {
      changes.push({ field: label, from: val })
    }
  }

  return changes
}

// ---------------------------------------------------------------------------
// Field label mappings per entity type
// ---------------------------------------------------------------------------

export const TOUR_LABELS: Record<string, string> = {
  title: 'Titolo',
  slug: 'Slug',
  status: 'Stato',
  a_partire_da: 'Prezzo base',
  destination_id: 'Destinazione',
  durata_notti: 'Durata notti',
  cover_image_url: 'Immagine copertina',
  tipo_voli: 'Tipo voli',
  prezzo_su_richiesta: 'Prezzo su richiesta',
}

export const CRUISE_LABELS: Record<string, string> = {
  title: 'Titolo',
  slug: 'Slug',
  status: 'Stato',
  ship_id: 'Nave',
  destination_id: 'Destinazione',
  cover_image_url: 'Immagine copertina',
}

export const SHIP_LABELS: Record<string, string> = {
  title: 'Titolo',
  slug: 'Slug',
  status: 'Stato',
  capacity: 'Capacita',
  crew: 'Equipaggio',
  year_built: 'Anno costruzione',
}

export const BLOG_LABELS: Record<string, string> = {
  title: 'Titolo',
  slug: 'Slug',
  status: 'Stato',
  category: 'Categoria',
  cover_image_url: 'Immagine copertina',
}

export const DESTINATION_LABELS: Record<string, string> = {
  name: 'Nome',
  slug: 'Slug',
  status: 'Stato',
  macro_area: 'Macro area',
  cover_image_url: 'Immagine copertina',
}

export const CATALOG_LABELS: Record<string, string> = {
  title: 'Titolo',
  year: 'Anno',
  is_published: 'Pubblicato',
  pdf_url: 'File PDF',
  cover_image_url: 'Immagine copertina',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a value to a comparable string. */
function normalize(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'boolean') return val ? 'Si' : 'No'
  if (typeof val === 'number') return String(val)
  if (Array.isArray(val)) return val.length ? `${val.length} elementi` : ''
  return String(val)
}
