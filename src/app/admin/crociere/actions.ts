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
  etichetta_primo_deck: z.string().nullable().default(null),
  etichetta_secondo_deck: z.string().nullable().default(null),
  etichetta_terzo_deck: z.string().nullable().default(null),
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

  cabins: z
    .array(
      z.object({
        localita: z.string(),
        tipologia_camera: z.string().nullable().default(null),
        ponte: z.string().nullable().default(null),
      })
    )
    .default([]),

  departures: z
    .array(
      z.object({
        from_city: z.string(),
        data_partenza: z.string(),
        prezzo_main_deck: z.coerce.number().nullable().default(null),
        prezzo_middle_deck: z.string().nullable().default(null),
        prezzo_superior_deck: z.string().nullable().default(null),
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

  // 2. Prepare main cruise row
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
    etichetta_primo_deck: emptyToNull(data.etichetta_primo_deck),
    etichetta_secondo_deck: emptyToNull(data.etichetta_secondo_deck),
    etichetta_terzo_deck: emptyToNull(data.etichetta_terzo_deck),
    note_importanti: emptyToNull(data.note_importanti),
    nota_penali: emptyToNull(data.nota_penali),
    programma_pdf_url: emptyToNull(data.programma_pdf_url),
    meta_title: emptyToNull(data.meta_title),
    meta_description: emptyToNull(data.meta_description),
    status: data.status,
  }

  let cruiseId: string

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

    // Cabins
    await syncSubTable(
      supabase,
      'cruise_cabins',
      cruiseId,
      data.cabins.map((c) => ({
        localita: c.localita,
        tipologia_camera: emptyToNull(c.tipologia_camera),
        ponte: emptyToNull(c.ponte),
      }))
    )

    // Departures
    await syncSubTable(
      supabase,
      'cruise_departures',
      cruiseId,
      data.departures.map((d) => ({
        from_city: d.from_city,
        data_partenza: d.data_partenza,
        prezzo_main_deck: d.prezzo_main_deck,
        prezzo_middle_deck: emptyToNull(d.prezzo_middle_deck),
        prezzo_superior_deck: emptyToNull(d.prezzo_superior_deck),
      }))
    )

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

  // 5. Revalidate
  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id: cruiseId }
}

export async function deleteCruiseAction(id: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('cruises').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

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

  const { error } = await supabase
    .from('cruises')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/crociere')
  revalidatePath('/crociere')
  revalidatePath('/')

  return { success: true, id }
}
