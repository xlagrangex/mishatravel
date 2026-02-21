import { createAdminClient } from '../admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TourListItem = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  durata_notti: string | null
  a_partire_da: string | null
  status: string
  created_at: string
  destination_name: string | null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Lightweight tour list for admin table view.
 */
export async function getTours(): Promise<TourListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tours')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      status,
      created_at,
      destination:destinations(name)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch tours: ${error.message}`)
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row.cover_image_url,
    durata_notti: row.durata_notti,
    a_partire_da: row.a_partire_da,
    status: row.status,
    created_at: row.created_at,
    destination_name: row.destination?.name ?? null,
  }))
}

/**
 * Full tour with all related sub-tables for editing.
 * Returns `null` when the tour is not found (PGRST116).
 */
export async function getTourById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tours')
    .select(
      `
      *,
      locations:tour_locations(*),
      itinerary_days:tour_itinerary_days(*),
      hotels:tour_hotels(*),
      departures:tour_departures(*),
      supplements:tour_supplements(*),
      inclusions:tour_inclusions(*),
      terms:tour_terms(*),
      penalties:tour_penalties(*),
      gallery:tour_gallery(*),
      optional_excursions:tour_optional_excursions(*),
      destination:destinations(id, name, slug)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = "The result contains 0 rows" → not found
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch tour: ${error.message}`)
  }

  // Sort sub-tables by sort_order client-side for reliability
  const sortBySortOrder = <T extends { sort_order?: number | null }>(
    arr: T[] | null
  ): T[] =>
    (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  return {
    ...data,
    locations: sortBySortOrder(data.locations),
    itinerary_days: sortBySortOrder(data.itinerary_days),
    hotels: sortBySortOrder(data.hotels),
    departures: sortBySortOrder(data.departures),
    supplements: sortBySortOrder(data.supplements),
    inclusions: sortBySortOrder(data.inclusions),
    terms: sortBySortOrder(data.terms),
    penalties: sortBySortOrder(data.penalties),
    gallery: sortBySortOrder(data.gallery),
    optional_excursions: sortBySortOrder(data.optional_excursions),
  }
}

/**
 * Delete a tour by ID.
 * Foreign-key cascades handle all sub-table rows automatically.
 */
export async function deleteTour(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('tours').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete tour: ${error.message}`)
  }
}
