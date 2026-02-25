'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity, buildChanges, buildCreateChanges, buildDeleteChanges, TOUR_LABELS } from '@/lib/supabase/audit'
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

const tourSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Il titolo e obbligatorio'),
  slug: z.string().min(1, 'Lo slug e obbligatorio'),
  destination_id: z.string().uuid().nullable().default(null),
  a_partire_da: z.string().nullable().default(null),
  prezzo_su_richiesta: z.boolean().default(false),
  numero_persone: z.coerce.number().int().min(1).default(2),
  durata_notti: z.string().nullable().default(null),
  pensione: z.array(z.enum(['no', 'mezza', 'completa'])).default([]),
  tipo_voli: z.string().nullable().default(null),
  note_importanti: z.string().nullable().default(null),
  nota_penali: z.string().nullable().default(null),
  programma_pdf_url: z.string().nullable().default(null),
  meta_title: z.string().nullable().default(null),
  meta_description: z.string().nullable().default(null),
  content: z.string().nullable().default(null),
  cover_image_url: z.string().nullable().default(null),
  price_label_1: z.string().min(1).default('Comfort'),
  price_label_2: z.string().min(1).default('Deluxe'),
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

  hotel_groups: z
    .array(
      z.object({
        localita: z.string(),
        hotels: z.array(
          z.object({
            nome_albergo: z.string(),
            stelle: z.coerce.number().int(),
          })
        ),
      })
    )
    .default([]),

  departures: z
    .array(
      z.object({
        from_city: z.string(),
        data_partenza: z.string(),
        prezzo_3_stelle: z.coerce.number().nullable().default(null),
        prezzo_4_stelle: z.string().nullable().default(null),
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

  gallery_urls: z.array(z.string()).default([]),

  optional_excursions: z
    .array(
      z.object({
        titolo: z.string(),
        descrizione: z.string().nullable().default(null),
        prezzo: z.coerce.number().nullable().default(null),
      })
    )
    .default([]),

  // Locations map: { "localita_name": { lat, lng } }
  locations: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number(),
  })).optional().default({}),
})

type TourFormData = z.infer<typeof tourSchema>

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
 * Deletes all existing rows for the tour, then inserts new ones with sort_order.
 */
async function syncSubTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  tourId: string,
  rows: Record<string, unknown>[]
) {
  // Delete existing rows
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('tour_id', tourId)

  if (deleteError) {
    throw new Error(`Failed to clear ${table}: ${deleteError.message}`)
  }

  // Insert new rows (skip if empty)
  if (rows.length === 0) return

  const rowsWithMeta = rows.map((row, index) => ({
    ...row,
    tour_id: tourId,
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

export async function saveTour(formData: unknown): Promise<ActionResult> {
  // 1. Validate
  const parsed = tourSchema.safeParse(formData)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    return { success: false, error: message }
  }

  const data: TourFormData = parsed.data
  const supabase = createAdminClient()

  // 2. Prepare main tour row
  const tourRow = {
    title: data.title,
    slug: data.slug,
    destination_id: emptyToNull(data.destination_id),
    a_partire_da: emptyToNull(data.a_partire_da),
    prezzo_su_richiesta: data.prezzo_su_richiesta,
    numero_persone: data.numero_persone,
    durata_notti: emptyToNull(data.durata_notti),
    pensione: data.pensione,
    tipo_voli: emptyToNull(data.tipo_voli),
    note_importanti: emptyToNull(data.note_importanti),
    nota_penali: emptyToNull(data.nota_penali),
    programma_pdf_url: emptyToNull(data.programma_pdf_url),
    meta_title: emptyToNull(data.meta_title),
    meta_description: emptyToNull(data.meta_description),
    content: emptyToNull(data.content),
    cover_image_url: emptyToNull(data.cover_image_url),
    price_label_1: data.price_label_1,
    price_label_2: data.price_label_2,
    status: data.status,
  }

  let tourId: string

  // Fetch old record for change tracking (update path)
  let oldTourRecord: Record<string, unknown> | null = null
  if (data.id) {
    const { data: old } = await supabase
      .from('tours')
      .select('title, slug, status, a_partire_da, destination_id, durata_notti, cover_image_url, tipo_voli, prezzo_su_richiesta')
      .eq('id', data.id)
      .single()
    oldTourRecord = old
  }

  try {
    // 3. Upsert main tour row
    if (data.id) {
      // UPDATE
      const { error } = await supabase
        .from('tours')
        .update(tourRow)
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
      tourId = data.id
    } else {
      // INSERT
      const { data: inserted, error } = await supabase
        .from('tours')
        .insert(tourRow)
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
      tourId = inserted.id
    }

    // 4. Sync sub-tables using delete-and-reinsert pattern

    // Itinerary days
    await syncSubTable(
      supabase,
      'tour_itinerary_days',
      tourId,
      data.itinerary_days.map((d) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
      }))
    )

    // Locations (coordinate per localita)
    if (data.locations && Object.keys(data.locations).length > 0) {
      const locationRows: Record<string, unknown>[] = []
      // Derive unique locations from itinerary days, preserving order
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
      await syncSubTable(supabase, 'tour_locations', tourId, locationRows)
    }

    // Hotels - flatten hotel_groups into individual rows
    const flattenedHotels: Record<string, unknown>[] = []
    for (const group of data.hotel_groups) {
      for (const hotel of group.hotels) {
        flattenedHotels.push({
          localita: group.localita,
          nome_albergo: hotel.nome_albergo,
          stelle: hotel.stelle,
        })
      }
    }
    await syncSubTable(supabase, 'tour_hotels', tourId, flattenedHotels)

    // Departures
    await syncSubTable(
      supabase,
      'tour_departures',
      tourId,
      data.departures.map((d) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
        prezzo_3_stelle: d.prezzo_3_stelle,
        prezzo_4_stelle: emptyToNull(d.prezzo_4_stelle),
      }))
    )

    // Supplements
    await syncSubTable(
      supabase,
      'tour_supplements',
      tourId,
      data.supplements.map((s) => ({
        titolo: s.titolo,
        prezzo: emptyToNull(s.prezzo),
      }))
    )

    // Inclusions + Exclusions → merged into tour_inclusions
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
    await syncSubTable(supabase, 'tour_inclusions', tourId, mergedInclusions)

    // Terms
    await syncSubTable(
      supabase,
      'tour_terms',
      tourId,
      data.terms.map((t) => ({ titolo: t.titolo }))
    )

    // Penalties
    await syncSubTable(
      supabase,
      'tour_penalties',
      tourId,
      data.penalties.map((p) => ({ titolo: p.titolo }))
    )

    // Gallery - string[] → rows with image_url
    await syncSubTable(
      supabase,
      'tour_gallery',
      tourId,
      data.gallery_urls.map((url) => ({ image_url: url }))
    )

    // Optional excursions
    await syncSubTable(
      supabase,
      'tour_optional_excursions',
      tourId,
      data.optional_excursions.map((e) => ({
        titolo: e.titolo,
        descrizione: emptyToNull(e.descrizione),
        prezzo: e.prezzo,
      }))
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto'
    return { success: false, error: message }
  }

  // 5. Log activity
  if (data.id && oldTourRecord) {
    const changes = buildChanges(oldTourRecord, tourRow, TOUR_LABELS)
    logActivity({
      action: 'tour.update',
      entityType: 'tour',
      entityId: tourId,
      entityTitle: data.title,
      details: changes.length ? `Modificati ${changes.length} campi` : 'Aggiornato',
      changes,
    }).catch(() => {})
  } else {
    logActivity({
      action: 'tour.create',
      entityType: 'tour',
      entityId: tourId,
      entityTitle: data.title,
      details: 'Tour creato',
      changes: buildCreateChanges(tourRow, TOUR_LABELS),
    }).catch(() => {})
  }

  // 6. Revalidate
  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id: tourId }
}

export async function deleteTourAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Fetch record before delete for logging
  const { data: tourData } = await supabase
    .from('tours')
    .select('title, slug, status, a_partire_da, destination_id, durata_notti, cover_image_url, tipo_voli, prezzo_su_richiesta')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('tours').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  logActivity({
    action: 'tour.delete',
    entityType: 'tour',
    entityId: id,
    entityTitle: tourData?.title ?? 'Tour eliminato',
    changes: tourData ? buildDeleteChanges(tourData, TOUR_LABELS) : undefined,
  }).catch(() => {})

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id }
}

export async function toggleTourStatus(
  id: string,
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { data: tourData } = await supabase.from('tours').select('title').eq('id', id).single()

  const { error } = await supabase
    .from('tours')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  logActivity({
    action: newStatus === 'published' ? 'tour.publish' : 'tour.unpublish',
    entityType: 'tour',
    entityId: id,
    entityTitle: tourData?.title ?? '',
    details: `Da ${newStatus === 'published' ? 'draft' : 'published'} a ${newStatus}`,
    changes: [{ field: 'Stato', from: newStatus === 'published' ? 'draft' : 'published', to: newStatus }],
  }).catch(() => {})

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id }
}

export async function duplicateTourAction(id: string): Promise<ActionResult> {
  const { getTourById } = await import('@/lib/supabase/queries/tours')
  const supabase = createAdminClient()

  // 1. Fetch full tour
  const tour = await getTourById(id)
  if (!tour) return { success: false, error: 'Tour non trovato' }

  // 2. Generate unique slug
  let newSlug = `${tour.slug}-copia`
  const { data: existing } = await supabase
    .from('tours')
    .select('slug')
    .like('slug', `${tour.slug}-copia%`)
  const existingSlugs = new Set((existing ?? []).map((r: any) => r.slug))
  if (existingSlugs.has(newSlug)) {
    let counter = 2
    while (existingSlugs.has(`${tour.slug}-copia-${counter}`)) counter++
    newSlug = `${tour.slug}-copia-${counter}`
  }

  try {
    // 3. Insert new tour as draft
    const { data: inserted, error: insertError } = await supabase
      .from('tours')
      .insert({
        title: `${tour.title} (copia)`,
        slug: newSlug,
        destination_id: tour.destination_id,
        a_partire_da: tour.a_partire_da,
        prezzo_su_richiesta: tour.prezzo_su_richiesta,
        numero_persone: tour.numero_persone,
        durata_notti: tour.durata_notti,
        pensione: tour.pensione,
        tipo_voli: tour.tipo_voli,
        note_importanti: tour.note_importanti,
        nota_penali: tour.nota_penali,
        programma_pdf_url: tour.programma_pdf_url,
        meta_title: null,
        meta_description: null,
        content: tour.content,
        cover_image_url: tour.cover_image_url,
        price_label_1: tour.price_label_1 ?? 'Comfort',
        price_label_2: tour.price_label_2 ?? 'Deluxe',
        status: 'draft',
      })
      .select('id')
      .single()

    if (insertError) return { success: false, error: insertError.message }
    const newId = inserted.id

    // 4. Copy all sub-tables using syncSubTable
    await syncSubTable(supabase, 'tour_itinerary_days', newId,
      (tour.itinerary_days ?? []).map((d: any) => ({
        numero_giorno: d.numero_giorno,
        localita: d.localita,
        descrizione: d.descrizione,
      }))
    )

    await syncSubTable(supabase, 'tour_locations', newId,
      (tour.locations ?? []).map((l: any) => ({
        nome: l.nome,
        coordinate: l.coordinate,
      }))
    )

    await syncSubTable(supabase, 'tour_hotels', newId,
      (tour.hotels ?? []).map((h: any) => ({
        localita: h.localita,
        nome_albergo: h.nome_albergo,
        stelle: h.stelle,
      }))
    )

    await syncSubTable(supabase, 'tour_departures', newId,
      (tour.departures ?? []).map((d: any) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
        prezzo_3_stelle: d.prezzo_3_stelle,
        prezzo_4_stelle: d.prezzo_4_stelle,
      }))
    )

    await syncSubTable(supabase, 'tour_supplements', newId,
      (tour.supplements ?? []).map((s: any) => ({
        titolo: s.titolo,
        prezzo: s.prezzo,
      }))
    )

    await syncSubTable(supabase, 'tour_inclusions', newId,
      (tour.inclusions ?? []).map((i: any) => ({
        titolo: i.titolo,
        is_included: i.is_included,
      }))
    )

    await syncSubTable(supabase, 'tour_terms', newId,
      (tour.terms ?? []).map((t: any) => ({ titolo: t.titolo }))
    )

    await syncSubTable(supabase, 'tour_penalties', newId,
      (tour.penalties ?? []).map((p: any) => ({ titolo: p.titolo }))
    )

    await syncSubTable(supabase, 'tour_gallery', newId,
      (tour.gallery ?? []).map((g: any) => ({ image_url: g.image_url }))
    )

    await syncSubTable(supabase, 'tour_optional_excursions', newId,
      (tour.optional_excursions ?? []).map((e: any) => ({
        titolo: e.titolo,
        descrizione: e.descrizione,
        prezzo: e.prezzo,
      }))
    )

    logActivity({
      action: 'tour.duplicate',
      entityType: 'tour',
      entityId: newId,
      entityTitle: `${tour.title} (copia)`,
      details: `Duplicato da: ${tour.title}`,
    }).catch(() => {})

    revalidatePath('/admin/tours')
    return { success: true, id: newId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore durante la duplicazione'
    return { success: false, error: message }
  }
}

export async function bulkSetTourStatus(
  ids: string[],
  newStatus: 'published' | 'draft'
): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessun tour selezionato' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('tours')
    .update({ status: newStatus })
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: newStatus === 'draft' ? 'tour.bulk_draft' : 'tour.bulk_publish',
    entityType: 'tour',
    entityId: ids[0],
    entityTitle: `${ids.length} tour`,
    details: `${ids.length} tour → ${newStatus}`,
  }).catch(() => {})

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function bulkDeleteTours(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, error: 'Nessun tour selezionato' }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('tours')
    .delete()
    .in('id', ids)

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'tour.bulk_delete',
    entityType: 'tour',
    entityId: ids[0],
    entityTitle: `${ids.length} tour`,
    details: `${ids.length} tour eliminati`,
  }).catch(() => {})

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')
  return { success: true, id: ids[0] }
}

export async function saveTourPriceLabels(
  tourId: string,
  label1: string,
  label2: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!label1.trim() || !label2.trim()) {
    return { success: false, error: 'Le etichette non possono essere vuote' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('tours')
    .update({ price_label_1: label1.trim(), price_label_2: label2.trim() })
    .eq('id', tourId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true }
}

// ---------------------------------------------------------------------------
// Add single departure (quick action from expired dialog)
// ---------------------------------------------------------------------------

export async function addTourDepartureAction(
  tourId: string,
  departure: {
    from_city: string
    data_partenza: string
    prezzo_3_stelle: number | null
    prezzo_4_stelle: string | null
  }
): Promise<ActionResult> {
  const supabase = createAdminClient()

  if (!departure.from_city.trim()) {
    return { success: false, error: 'La città di partenza è obbligatoria' }
  }
  if (!departure.data_partenza) {
    return { success: false, error: 'La data di partenza è obbligatoria' }
  }

  const { data: tour } = await supabase
    .from('tours')
    .select('title')
    .eq('id', tourId)
    .single()

  if (!tour) return { success: false, error: 'Tour non trovato' }

  const { data: existing } = await supabase
    .from('tour_departures')
    .select('sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { error } = await supabase.from('tour_departures').insert({
    tour_id: tourId,
    from_city: departure.from_city.trim(),
    data_partenza: departure.data_partenza,
    prezzo_3_stelle: departure.prezzo_3_stelle,
    prezzo_4_stelle: departure.prezzo_4_stelle,
    sort_order: nextSortOrder,
  })

  if (error) return { success: false, error: error.message }

  logActivity({
    action: 'tour.add_departure',
    entityType: 'tour',
    entityId: tourId,
    entityTitle: tour.title,
    details: `Aggiunta partenza: ${departure.data_partenza} da ${departure.from_city}`,
  }).catch(() => {})

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id: tourId }
}
