'use server'

import { createAdminClient } from '@/lib/supabase/admin'
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
    status: data.status,
  }

  let tourId: string

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

  // 5. Revalidate
  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id: tourId }
}

export async function deleteTourAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('tours').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

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

  const { error } = await supabase
    .from('tours')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/tours')
  revalidatePath('/tours')
  revalidatePath('/')

  return { success: true, id }
}
