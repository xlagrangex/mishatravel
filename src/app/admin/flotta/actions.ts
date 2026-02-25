'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/supabase/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const shipSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  slug: z.string().min(1, 'Lo slug è obbligatorio'),
  description: z.string().nullable().default(null),
  cover_image_url: z.string().nullable().default(null),
  cabine_disponibili: z.string().nullable().default(null),
  servizi_cabine: z.string().nullable().default(null),
  piani_ponte_url: z.string().nullable().default(null),
  status: z.enum(['draft', 'published']).default('draft'),

  // Sub-table arrays
  suitable_for: z
    .array(z.object({ testo: z.string().min(1, 'Il testo è obbligatorio') }))
    .default([]),

  activities: z
    .array(z.object({ attivita: z.string().min(1, "L'attività è obbligatoria") }))
    .default([]),

  services: z
    .array(z.object({ testo: z.string().min(1, 'Il testo è obbligatorio') }))
    .default([]),

  decks: z
    .array(
      z.object({
        nome: z.string().min(1, 'Il nome del ponte è obbligatorio'),
      })
    )
    .default([]),

  cabin_details: z
    .array(
      z.object({
        titolo: z.string().min(1, 'Il titolo è obbligatorio'),
        immagine_url: z.string().nullable().default(null),
        tipologia: z
          .enum(['Singola', 'Doppia', 'Tripla', 'Quadrupla'])
          .nullable()
          .default(null),
        descrizione: z.string().nullable().default(null),
        deck_index: z.number().int().min(-1).default(-1),
      })
    )
    .default([]),

  gallery: z
    .array(
      z.object({
        image_url: z.string().min(1, "L'URL immagine è obbligatorio"),
        caption: z.string().nullable().default(null),
      })
    )
    .default([]),
})

type ShipFormData = z.infer<typeof shipSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Replace empty strings with null for nullable fields. */
function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value.trim() === '') return null
  return value
}

/**
 * Delete-and-reinsert pattern for sub-table rows.
 * Deletes all existing rows for the ship, then inserts new ones with sort_order.
 */
async function syncSubTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  shipId: string,
  rows: Record<string, unknown>[]
) {
  // Delete existing rows
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('ship_id', shipId)

  if (deleteError) {
    throw new Error(`Failed to clear ${table}: ${deleteError.message}`)
  }

  // Insert new rows (skip if empty)
  if (rows.length === 0) return

  const rowsWithMeta = rows.map((row, index) => ({
    ...row,
    ship_id: shipId,
    sort_order: index,
  }))

  const { error: insertError } = await supabase.from(table).insert(rowsWithMeta)

  if (insertError) {
    throw new Error(`Failed to insert into ${table}: ${insertError.message}`)
  }
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

export async function saveShip(formData: unknown): Promise<ActionResult> {
  // 1. Validate
  const parsed = shipSchema.safeParse(formData)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    return { success: false, error: message }
  }

  const data: ShipFormData = parsed.data
  const supabase = createAdminClient()

  // 2. Prepare main ship row
  const shipRow = {
    name: data.name,
    slug: data.slug,
    description: emptyToNull(data.description),
    cover_image_url: emptyToNull(data.cover_image_url),
    cabine_disponibili: emptyToNull(data.cabine_disponibili),
    servizi_cabine: emptyToNull(data.servizi_cabine),
    piani_ponte_url: emptyToNull(data.piani_ponte_url),
    status: data.status,
  }

  let shipId: string

  try {
    // 3. Upsert main ship row
    if (data.id) {
      // UPDATE
      const { error } = await supabase
        .from('ships')
        .update(shipRow)
        .eq('id', data.id)

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: `Lo slug "${data.slug}" è già in uso. Scegli uno slug diverso.`,
          }
        }
        return { success: false, error: error.message }
      }
      shipId = data.id
    } else {
      // INSERT
      const { data: inserted, error } = await supabase
        .from('ships')
        .insert(shipRow)
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: `Lo slug "${data.slug}" è già in uso. Scegli uno slug diverso.`,
          }
        }
        return { success: false, error: error.message }
      }
      shipId = inserted.id
    }

    // 4. Sync sub-tables using delete-and-reinsert pattern

    // Suitable for
    await syncSubTable(
      supabase,
      'ship_suitable_for',
      shipId,
      data.suitable_for.map((s) => ({ testo: s.testo }))
    )

    // Activities
    await syncSubTable(
      supabase,
      'ship_activities',
      shipId,
      data.activities.map((a) => ({ attivita: a.attivita }))
    )

    // Services
    await syncSubTable(
      supabase,
      'ship_services',
      shipId,
      data.services.map((s) => ({ testo: s.testo }))
    )

    // Decks — sync first to get new IDs for cabin assignment
    await syncSubTable(
      supabase,
      'ship_decks',
      shipId,
      data.decks.map((d) => ({ nome: d.nome }))
    )

    // Fetch the newly-created deck IDs (ordered by sort_order)
    const { data: newDecks } = await supabase
      .from('ship_decks')
      .select('id, sort_order')
      .eq('ship_id', shipId)
      .order('sort_order')

    const deckIdByIndex = new Map<number, string>()
    for (const d of newDecks ?? []) {
      deckIdByIndex.set(d.sort_order, d.id)
    }

    // Cabin details — with deck_id reference
    await syncSubTable(
      supabase,
      'ship_cabin_details',
      shipId,
      data.cabin_details.map((c) => ({
        titolo: c.titolo,
        immagine_url: emptyToNull(c.immagine_url),
        tipologia: c.tipologia,
        descrizione: emptyToNull(c.descrizione),
        deck_id: c.deck_index >= 0 ? (deckIdByIndex.get(c.deck_index) ?? null) : null,
      }))
    )

    // Gallery
    await syncSubTable(
      supabase,
      'ship_gallery',
      shipId,
      data.gallery.map((g) => ({
        image_url: g.image_url,
        caption: emptyToNull(g.caption),
      }))
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    return { success: false, error: message }
  }

  // 5. Log activity
  logActivity({
    action: data.id ? 'ship.update' : 'ship.create',
    entityType: 'ship',
    entityId: shipId,
    entityTitle: data.name,
  }).catch(() => {})

  // 6. Revalidate
  revalidatePath('/admin/flotta')
  revalidatePath('/flotta')
  revalidatePath('/')

  return { success: true, id: shipId }
}

// ---------------------------------------------------------------------------
// Standalone action for decks & cabins (used by inline dialog in CruiseForm)
// ---------------------------------------------------------------------------

const decksAndCabinsSchema = z.object({
  shipId: z.string().uuid(),
  decks: z
    .array(z.object({ nome: z.string().min(1, 'Il nome del ponte è obbligatorio') }))
    .default([]),
  cabin_details: z
    .array(
      z.object({
        titolo: z.string().min(1, 'Il titolo è obbligatorio'),
        immagine_url: z.string().nullable().default(null),
        tipologia: z
          .enum(['Singola', 'Doppia', 'Tripla', 'Quadrupla'])
          .nullable()
          .default(null),
        descrizione: z.string().nullable().default(null),
        deck_index: z.number().int().min(-1).default(-1),
      })
    )
    .default([]),
})

export async function saveShipDecksAndCabins(
  formData: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = decksAndCabinsSchema.safeParse(formData)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    return { success: false, error: message }
  }

  const { shipId, decks, cabin_details } = parsed.data
  const supabase = createAdminClient()

  try {
    // Sync decks first
    await syncSubTable(
      supabase,
      'ship_decks',
      shipId,
      decks.map((d) => ({ nome: d.nome }))
    )

    // Fetch newly-created deck IDs
    const { data: newDecks } = await supabase
      .from('ship_decks')
      .select('id, sort_order')
      .eq('ship_id', shipId)
      .order('sort_order')

    const deckIdByIndex = new Map<number, string>()
    for (const d of newDecks ?? []) {
      deckIdByIndex.set(d.sort_order, d.id)
    }

    // Sync cabin details with deck references
    await syncSubTable(
      supabase,
      'ship_cabin_details',
      shipId,
      cabin_details.map((c) => ({
        titolo: c.titolo,
        immagine_url: emptyToNull(c.immagine_url),
        tipologia: c.tipologia,
        descrizione: emptyToNull(c.descrizione),
        deck_id: c.deck_index >= 0 ? (deckIdByIndex.get(c.deck_index) ?? null) : null,
      }))
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    return { success: false, error: message }
  }

  revalidatePath('/admin/flotta')
  revalidatePath('/admin/crociere')
  revalidatePath('/flotta')
  revalidatePath('/crociere')

  return { success: true }
}

export async function toggleShipStatus(
  id: string,
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: shipData } = await supabase.from('ships').select('name').eq('id', id).single()

  const { error } = await supabase
    .from('ships')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'published' ? 'ship.publish' : 'ship.unpublish',
    entityType: 'ship',
    entityId: id,
    entityTitle: shipData?.name ?? '',
  }).catch(() => {})

  revalidatePath('/admin/flotta')
  revalidatePath('/flotta')
  revalidatePath('/')
  return { success: true, id }
}

export async function bulkSetShipStatus(
  ids: string[],
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna nave selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('ships')
    .update({ status: newStatus })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/flotta')
  revalidatePath('/flotta')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function bulkDeleteShips(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna nave selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('ships')
    .delete()
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/flotta')
  revalidatePath('/flotta')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function deleteShipAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: shipData } = await supabase.from('ships').select('name').eq('id', id).single()

  const { error } = await supabase.from('ships').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  logActivity({
    action: 'ship.delete',
    entityType: 'ship',
    entityId: id,
    entityTitle: shipData?.name ?? 'Nave eliminata',
  }).catch(() => {})

  revalidatePath('/admin/flotta')
  revalidatePath('/flotta')
  revalidatePath('/')

  return { success: true, id }
}
