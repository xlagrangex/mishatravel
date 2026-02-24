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
  prezzo_su_richiesta: boolean
  status: string
  created_at: string
  destination_name: string | null
  next_departure_date: string | null
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
      prezzo_su_richiesta,
      status,
      created_at,
      destination:destinations(name),
      departures:tour_departures(data_partenza)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch tours: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? []).map((row: any) => {
    const futureDeps = (row.departures ?? [])
      .filter((d: any) => d.data_partenza >= today)
      .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      durata_notti: row.durata_notti,
      a_partire_da: row.a_partire_da,
      prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
      status: row.status,
      created_at: row.created_at,
      destination_name: row.destination?.name ?? null,
      next_departure_date: futureDeps[0]?.data_partenza ?? null,
    }
  })
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

// ---------------------------------------------------------------------------
// Enriched queries (with departures for filtering)
// ---------------------------------------------------------------------------

export type TourListItemEnriched = TourListItem & {
  destination_id: string | null
  destination_macro_area: string | null
  destination_slug: string | null
  departures: { id: string; data_partenza: string; prezzo_3_stelle: number | null; from_city: string | null }[]
}

/**
 * Published tours with departure data for client-side filtering.
 */
export async function getPublishedToursWithDepartures(): Promise<TourListItemEnriched[]> {
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
      prezzo_su_richiesta,
      status,
      created_at,
      destination_id,
      destination:destinations(name, slug, macro_area),
      departures:tour_departures(id, data_partenza, prezzo_3_stelle, from_city)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch enriched tours: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? [])
    .filter((row: any) => {
      const deps = row.departures ?? []
      if (deps.length === 0) return true
      return deps.some((d: any) => d.data_partenza >= today)
    })
    .map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      durata_notti: row.durata_notti,
      a_partire_da: row.a_partire_da,
      prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
      status: row.status,
      created_at: row.created_at,
      destination_id: row.destination_id,
      destination_name: row.destination?.name ?? null,
      destination_slug: row.destination?.slug ?? null,
      destination_macro_area: row.destination?.macro_area ?? null,
      departures: row.departures ?? [],
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
    }))
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

// ---------------------------------------------------------------------------
// Public site queries
// ---------------------------------------------------------------------------

/**
 * Published tours for the public listing page, with destination name.
 * Excludes tours where all departures are in the past.
 */
export async function getPublishedTours(): Promise<TourListItem[]> {
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
      prezzo_su_richiesta,
      status,
      created_at,
      destination:destinations(name),
      departures:tour_departures(data_partenza)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch published tours: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? [])
    .filter((row: any) => {
      const deps = row.departures ?? []
      if (deps.length === 0) return true
      return deps.some((d: any) => d.data_partenza >= today)
    })
    .map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      durata_notti: row.durata_notti,
      a_partire_da: row.a_partire_da,
      prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
      status: row.status,
      created_at: row.created_at,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
    }))
}

/**
 * Full tour with all relations, looked up by slug.
 * Returns null when the tour is not found or not published.
 */
export async function getTourBySlug(slug: string) {
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
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch tour by slug: ${error.message}`)
  }

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
 * Published tours filtered by destination ID.
 * Excludes tours where all departures are in the past.
 */
export async function getToursForDestination(destinationId: string): Promise<TourListItem[]> {
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
      prezzo_su_richiesta,
      status,
      created_at,
      destination:destinations(name),
      departures:tour_departures(data_partenza)
    `
    )
    .eq('destination_id', destinationId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch tours for destination: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? [])
    .filter((row: any) => {
      const deps = row.departures ?? []
      if (deps.length === 0) return true
      return deps.some((d: any) => d.data_partenza >= today)
    })
    .map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      durata_notti: row.durata_notti,
      a_partire_da: row.a_partire_da,
      prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
      status: row.status,
      created_at: row.created_at,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
    }))
}

/**
 * Related tours: other published tours sharing the same destination,
 * excluding the one identified by the given slug.
 */
export async function getRelatedTours(
  slug: string,
  limit = 3
): Promise<TourListItem[]> {
  const supabase = createAdminClient()

  // First fetch the current tour to get its destination_id
  const { data: current } = await supabase
    .from('tours')
    .select('id, destination_id')
    .eq('slug', slug)
    .single()

  if (!current?.destination_id) return []

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
      prezzo_su_richiesta,
      status,
      created_at,
      destination:destinations(name),
      departures:tour_departures(data_partenza)
    `
    )
    .eq('destination_id', current.destination_id)
    .eq('status', 'published')
    .neq('id', current.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch related tours: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? [])
    .filter((row: any) => {
      const deps = row.departures ?? []
      if (deps.length === 0) return true
      return deps.some((d: any) => d.data_partenza >= today)
    })
    .slice(0, limit)
    .map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      durata_notti: row.durata_notti,
      a_partire_da: row.a_partire_da,
      prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
      status: row.status,
      created_at: row.created_at,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
    }))
}
