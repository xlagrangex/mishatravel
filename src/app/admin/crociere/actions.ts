'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges, CRUISE_LABELS } from '@/lib/supabase/audit'
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

const cruiseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Il titolo e obbligatorio'),
  slug: z.string().min(1, 'Lo slug e obbligatorio'),
  ship_id: z.string().uuid().nullable().default(null),
  destination_id: z.string().uuid().nullable().default(null),
  tipo_crociera: z.enum(['Crociera di Gruppo', 'Crociera']).nullable().default(null),
  content: z.string().nullable().default(null),
  cover_image_url: z.string().nullable().default(null),
  durata_notti: z.string().nullable().default(null),
  a_partire_da: z.string().nullable().default(null),
  prezzo_su_richiesta: z.boolean().default(false),
  numero_minimo_persone: z.coerce.number().int().nullable().default(null),
  pensione: z.array(z.enum(['no', 'mezza', 'completa'])).default([]),
  tipo_voli: z.string().nullable().default(null),
  note_importanti: z.string().nullable().default(null),
  nota_penali: z.string().nullable().default(null),
  programma_pdf_url: z.string().nullable().default(null),
  meta_title: z.string().nullable().default(null),
  meta_description: z.string().nullable().default(null),
  status: z.enum(['draft', 'published']).default('draft'),

  // Sub-table arrays
  itinerary_days: z
    .array(
      z.object({
        numero_giorno: z.string(),
        localita: z.string(),
        descrizione: z.string(),
      })
    )
    .default([]),

  departures: z
    .array(
      z.object({
        from_city: z.string(),
        data_partenza: z.string(),
        prices: z
          .array(
            z.object({
              cabin_id: z.string(),
              prezzo: z.string().nullable().default(null),
            })
          )
          .default([]),
      })
    )
    .default([]),

  supplements: z
    .array(
      z.object({
        titolo: z.string(),
        prezzo: z.string().nullable().default(null),
      })
    )
    .default([]),

  inclusions: z.array(z.object({ titolo: z.string() })).default([]),
  exclusions: z.array(z.object({ titolo: z.string() })).default([]),

  terms: z.array(z.object({ titolo: z.string() })).default([]),
  penalties: z.array(z.object({ titolo: z.string() })).default([]),

  gallery: z
    .array(
      z.object({
        image_url: z.string(),
        caption: z.string().nullable().default(null),
      })
    )
    .default([]),

  // Locations map: { "localita_name": { lat, lng } }
  locations: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number(),
  })).optional().default({}),
})

type CruiseFormData = z.infer<typeof cruiseSchema>

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
 * Deletes all existing rows for the cruise, then inserts new ones with sort_order.
 */
async function syncSubTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  cruiseId: string,
  rows: Record<string, unknown>[]
) {
  // Delete existing rows
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('cruise_id', cruiseId)

  if (deleteError) {
    throw new Error(`Failed to clear ${table}: ${deleteError.message}`)
  }

  // Insert new rows (skip if empty)
  if (rows.length === 0) return

  const rowsWithMeta = rows.map((row, index) => ({
    ...row,
    cruise_id: cruiseId,
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

export async function saveCruise(formData: unknown): Promise<ActionResult> {
  // 1. Validate
  const parsed = cruiseSchema.safeParse(formData)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    return { success: false, error: message }
  }

  const data: CruiseFormData = parsed.data
  const supabase = createAdminClient()

  // 2. Prepare main cruise row (legacy deck-label columns left untouched in DB)
  const cruiseRow = {
    title: data.title,
    slug: data.slug,
    ship_id: emptyToNull(data.ship_id),
    destination_id: emptyToNull(data.destination_id),
    tipo_crociera: data.tipo_crociera,
    content: emptyToNull(data.content),
    cover_image_url: emptyToNull(data.cover_image_url),
    durata_notti: emptyToNull(data.durata_notti),
    a_partire_da: emptyToNull(data.a_partire_da),
    prezzo_su_richiesta: data.prezzo_su_richiesta,
    numero_minimo_persone: data.numero_minimo_persone,
    pensione: data.pensione,
    tipo_voli: emptyToNull(data.tipo_voli),
    note_importanti: emptyToNull(data.note_importanti),
    nota_penali: emptyToNull(data.nota_penali),
    programma_pdf_url: emptyToNull(data.programma_pdf_url),
    meta_title: emptyToNull(data.meta_title),
    meta_description: emptyToNull(data.meta_description),
    status: data.status,
  }

  let cruiseId: string

  // Fetch old record for change tracking (update path)
  let oldCruiseRecord: Record<string, unknown> | null = null
  if (data.id) {
    const { data: old } = await supabase
      .from('cruises')
      .select('title, slug, status, ship_id, destination_id, cover_image_url')
      .eq('id', data.id)
      .single()
    oldCruiseRecord = old
  }

  try {
    // 3. Upsert main cruise row
    if (data.id) {
      // UPDATE
      const { error } = await supabase
        .from('cruises')
        .update(cruiseRow)
        .eq('id', data.id)

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: `Lo slug "${data.slug}" e gia in uso. Scegli uno slug diverso.`,
          }
        }
        return { success: false, error: error.message }
      }
      cruiseId = data.id
    } else {
      // INSERT
      const { data: inserted, error } = await supabase
        .from('cruises')
        .insert(cruiseRow)
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: `Lo slug "${data.slug}" e gia in uso. Scegli uno slug diverso.`,
          }
        }
        return { success: false, error: error.message }
      }
      cruiseId = inserted.id
    }

    // 4. Sync sub-tables using delete-and-reinsert pattern

    // Itinerary days
    await syncSubTable(
      supabase,
      'cruise_itinerary_days',
      cruiseId,
      data.itinerary_days.map((d) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
      }))
    )

    // Locations (coordinate per localita)
    if (data.locations && Object.keys(data.locations).length > 0) {
      const locationRows: Record<string, unknown>[] = []
      const seen = new Set<string>()
      for (const day of data.itinerary_days) {
        const name = day.localita.trim()
        if (!name || seen.has(name)) continue
        seen.add(name)
        const coords = data.locations[name]
        locationRows.push({
          nome: name,
          coordinate: coords ? `${coords.lat}, ${coords.lng}` : null,
        })
      }
      await syncSubTable(supabase, 'cruise_locations', cruiseId, locationRows)
    }

    // Departures — cascade-deletes old cruise_departure_prices automatically
    await syncSubTable(
      supabase,
      'cruise_departures',
      cruiseId,
      data.departures.map((d) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
      }))
    )

    // Fetch newly-created departure IDs (ordered by sort_order)
    const { data: newDepartures } = await supabase
      .from('cruise_departures')
      .select('id, sort_order')
      .eq('cruise_id', cruiseId)
      .order('sort_order')

    // Insert departure prices per cabin
    const priceRows: Record<string, unknown>[] = []
    for (let i = 0; i < data.departures.length; i++) {
      const depId = (newDepartures ?? []).find((d) => d.sort_order === i)?.id
      if (!depId) continue
      for (let j = 0; j < data.departures[i].prices.length; j++) {
        const p = data.departures[i].prices[j]
        if (!p.cabin_id) continue
        priceRows.push({
          departure_id: depId,
          cabin_id: p.cabin_id,
          prezzo: emptyToNull(p.prezzo),
          sort_order: j,
        })
      }
    }

    if (priceRows.length > 0) {
      const { error: priceInsertError } = await supabase
        .from('cruise_departure_prices')
        .insert(priceRows)

      if (priceInsertError) {
        throw new Error(`Failed to insert departure prices: ${priceInsertError.message}`)
      }
    }

    // Supplements
    await syncSubTable(
      supabase,
      'cruise_supplements',
      cruiseId,
      data.supplements.map((s) => ({
        titolo: s.titolo,
        prezzo: emptyToNull(s.prezzo),
      }))
    )

    // Inclusions + Exclusions -> merged into cruise_inclusions
    const mergedInclusions: Record<string, unknown>[] = [
      ...data.inclusions.map((i) => ({
        titolo: i.titolo,
        is_included: true,
      })),
      ...data.exclusions.map((e) => ({
        titolo: e.titolo,
        is_included: false,
      })),
    ]
    await syncSubTable(supabase, 'cruise_inclusions', cruiseId, mergedInclusions)

    // Terms
    await syncSubTable(
      supabase,
      'cruise_terms',
      cruiseId,
      data.terms.map((t) => ({ titolo: t.titolo }))
    )

    // Penalties
    await syncSubTable(
      supabase,
      'cruise_penalties',
      cruiseId,
      data.penalties.map((p) => ({ titolo: p.titolo }))
    )

    // Gallery
    await syncSubTable(
      supabase,
      'cruise_gallery',
      cruiseId,
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
  if (data.id && oldCruiseRecord) {
    const changes = buildChanges(oldCruiseRecord, cruiseRow, CRUISE_LABELS)
    logActivity({
      action: 'cruise.update',
      entityType: 'cruise',
      entityId: cruiseId,
      entityTitle: data.title,
      details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
      changes,
    }).catch(() => {})
  } else {
    logActivity({
      action: 'cruise.create',
      entityType: 'cruise',
      entityId: cruiseId,
      entityTitle: data.title,
      details: 'Crociera creata',
      changes: buildCreateChanges(cruiseRow, CRUISE_LABELS),
    }).catch(() => {})
  }

  // 6. Revalidate
  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id: cruiseId }
}

export async function deleteCruiseAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: cruiseData } = await supabase
    .from('cruises')
    .select('title, slug, status, ship_id, destination_id, cover_image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('cruises').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  logActivity({
    action: 'cruise.delete',
    entityType: 'cruise',
    entityId: id,
    entityTitle: cruiseData?.title ?? 'Crociera eliminata',
    changes: cruiseData ? buildDeleteChanges(cruiseData, CRUISE_LABELS) : undefined,
  }).catch(() => {})

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id }
}

export async function toggleCruiseStatus(
  id: string,
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: cruiseData } = await supabase.from('cruises').select('title').eq('id', id).single()

  const { error } = await supabase
    .from('cruises')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  logActivity({
    action: newStatus === 'published' ? 'cruise.publish' : 'cruise.unpublish',
    entityType: 'cruise',
    entityId: id,
    entityTitle: cruiseData?.title ?? '',
    details: `Da ${newStatus === 'published' ? 'draft' : 'published'} a ${newStatus}`,
    changes: [{ field: 'Stato', from: newStatus === 'published' ? 'draft' : 'published', to: newStatus }],
  }).catch(() => {})

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id }
}

/**
 * Fetch ship cabins and decks for the cruise form.
 * Called dynamically when the user selects or changes a ship.
 */
export async function getShipCabinsAndDecks(shipId: string) {
  const supabase = createAdminClient()

  const [cabinsResult, decksResult] = await Promise.all([
    supabase
      .from('ship_cabin_details')
      .select('*')
      .eq('ship_id', shipId)
      .order('sort_order'),
    supabase
      .from('ship_decks')
      .select('*')
      .eq('ship_id', shipId)
      .order('sort_order'),
  ])

  return {
    cabins: cabinsResult.data ?? [],
    decks: decksResult.data ?? [],
  }
}

export async function duplicateCruiseAction(id: string): Promise<ActionResult> {
  const { getCruiseById } = await import('@/lib/supabase/queries/cruises')
  const supabase = createAdminClient()

  // 1. Fetch full cruise
  const cruise = await getCruiseById(id)
  if (!cruise) return { success: false, error: 'Crociera non trovata' }

  // 2. Generate unique slug
  let newSlug = `${cruise.slug}-copia`
  const { data: existing } = await supabase
    .from('cruises')
    .select('slug')
    .like('slug', `${cruise.slug}-copia%`)
  const existingSlugs = new Set((existing ?? []).map((r: any) => r.slug))
  if (existingSlugs.has(newSlug)) {
    let counter = 2
    while (existingSlugs.has(`${cruise.slug}-copia-${counter}`)) counter++
    newSlug = `${cruise.slug}-copia-${counter}`
  }

  try {
    // 3. Insert new cruise as draft
    const { data: inserted, error: insertError } = await supabase
      .from('cruises')
      .insert({
        title: `${cruise.title} (copia)`,
        slug: newSlug,
        ship_id: cruise.ship_id,
        destination_id: cruise.destination_id,
        tipo_crociera: cruise.tipo_crociera,
        content: cruise.content,
        cover_image_url: cruise.cover_image_url,
        durata_notti: cruise.durata_notti,
        a_partire_da: cruise.a_partire_da,
        prezzo_su_richiesta: cruise.prezzo_su_richiesta,
        numero_minimo_persone: cruise.numero_minimo_persone,
        pensione: cruise.pensione,
        tipo_voli: cruise.tipo_voli,
        note_importanti: cruise.note_importanti,
        nota_penali: cruise.nota_penali,
        programma_pdf_url: cruise.programma_pdf_url,
        meta_title: null,
        meta_description: null,
        status: 'draft',
      })
      .select('id')
      .single()

    if (insertError) return { success: false, error: insertError.message }
    const newId = inserted.id

    // 4. Copy sub-tables
    await syncSubTable(supabase, 'cruise_itinerary_days', newId,
      (cruise.itinerary_days ?? []).map((d: any) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
      }))
    )

    await syncSubTable(supabase, 'cruise_locations', newId,
      (cruise.locations ?? []).map((l: any) => ({
        nome: l.nome,
        coordinate: l.coordinate,
      }))
    )

    // 5. Departures (without prices first)
    const oldDepartures = cruise.departures ?? []
    await syncSubTable(supabase, 'cruise_departures', newId,
      oldDepartures.map((d: any) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
      }))
    )

    // 6. Fetch new departure IDs
    const { data: newDepartures } = await supabase
      .from('cruise_departures')
      .select('id, sort_order')
      .eq('cruise_id', newId)
      .order('sort_order')

    // 7. Copy departure prices (map old departure sort_order to new departure IDs)
    // The cruise object from getCruiseById has departure_prices as a flat array
    // Each price has departure_id - we need to map from old to new
    if (cruise.departure_prices && cruise.departure_prices.length > 0 && newDepartures) {
      // Build mapping: old departure ID -> sort_order
      const oldDepSortMap = new Map<string, number>()
      for (let i = 0; i < oldDepartures.length; i++) {
        oldDepSortMap.set(oldDepartures[i].id, oldDepartures[i].sort_order ?? i)
      }

      const priceRows: Record<string, unknown>[] = []
      for (const price of cruise.departure_prices) {
        const oldSortOrder = oldDepSortMap.get(price.departure_id)
        if (oldSortOrder === undefined) continue
        const newDep = newDepartures.find((d: any) => d.sort_order === oldSortOrder)
        if (!newDep) continue
        priceRows.push({
          departure_id: newDep.id,
          cabin_id: price.cabin_id,
          prezzo: price.prezzo,
          sort_order: price.sort_order,
        })
      }

      if (priceRows.length > 0) {
        const { error: priceError } = await supabase
          .from('cruise_departure_prices')
          .insert(priceRows)
        if (priceError) throw new Error(`Failed to copy departure prices: ${priceError.message}`)
      }
    }

    // 8. Copy remaining sub-tables
    await syncSubTable(supabase, 'cruise_supplements', newId,
      (cruise.supplements ?? []).map((s: any) => ({
        titolo: s.titolo,
        prezzo: s.prezzo,
      }))
    )

    await syncSubTable(supabase, 'cruise_inclusions', newId,
      (cruise.inclusions ?? []).map((i: any) => ({
        titolo: i.titolo,
        is_included: i.is_included,
      }))
    )

    await syncSubTable(supabase, 'cruise_terms', newId,
      (cruise.terms ?? []).map((t: any) => ({ titolo: t.titolo }))
    )

    await syncSubTable(supabase, 'cruise_penalties', newId,
      (cruise.penalties ?? []).map((p: any) => ({ titolo: p.titolo }))
    )

    await syncSubTable(supabase, 'cruise_gallery', newId,
      (cruise.gallery ?? []).map((g: any) => ({
        image_url: g.image_url,
        caption: g.caption,
      }))
    )

    logActivity({
      action: 'cruise.duplicate',
      entityType: 'cruise',
      entityId: newId,
      entityTitle: `${cruise.title} (copia)`,
      details: `Duplicato da: ${cruise.title}`,
    }).catch(() => {})

    revalidatePath('/admin/crociere')
    return { success: true, id: newId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore durante la duplicazione'
    return { success: false, error: message }
  }
}

export async function bulkSetCruiseStatus(
  ids: string[],
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna crociera selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('cruises')
    .update({ status: newStatus })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'draft' ? 'cruise.bulk_draft' : 'cruise.bulk_publish',
    entityType: 'cruise',
    entityId: ids[0],
    entityTitle: `${ids.length} crociere`,
    details: `${ids.length} crociere → ${newStatus}`,
  }).catch(() => {})

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function bulkDeleteCruises(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessuna crociera selezionata' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('cruises')
    .delete()
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'cruise.bulk_delete',
    entityType: 'cruise',
    entityId: ids[0],
    entityTitle: `${ids.length} crociere`,
    details: `${ids.length} crociere eliminate`,
  }).catch(() => {})

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

// ---------------------------------------------------------------------------
// Add single departure (quick action from expired dialog)
// ---------------------------------------------------------------------------

export async function addCruiseDepartureAction(
  cruiseId: string,
  departure: {
    from_city: string
    data_partenza: string
  }
): Promise<ActionResult> {
  const supabase = createAdminClient()

  if (!departure.from_city.trim()) {
    return { success: false, error: 'La città di partenza è obbligatoria' }
  }
  if (!departure.data_partenza) {
    return { success: false, error: 'La data di partenza è obbligatoria' }
  }

  const { data: cruise } = await supabase
    .from('cruises')
    .select('title')
    .eq('id', cruiseId)
    .single()

  if (!cruise) return { success: false, error: 'Crociera non trovata' }

  const { data: existing } = await supabase
    .from('cruise_departures')
    .select('sort_order')
    .eq('cruise_id', cruiseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { error } = await supabase.from('cruise_departures').insert({
    cruise_id: cruiseId,
    from_city: departure.from_city.trim(),
    data_partenza: departure.data_partenza,
    sort_order: nextSortOrder,
  })

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'cruise.add_departure',
    entityType: 'cruise',
    entityId: cruiseId,
    entityTitle: cruise.title,
    details: `Aggiunta partenza: ${departure.data_partenza} da ${departure.from_city}`,
  }).catch(() => {})

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id: cruiseId }
}
