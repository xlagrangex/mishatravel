import { createAdminClient } from '../admin'
import type { CruiseWithRelations } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CruiseListItem = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  durata_notti: string | null
  a_partire_da: string | null
  prezzo_su_richiesta: boolean
  tipo_crociera: string | null
  status: string
  created_at: string
  ship_name: string | null
  destination_name: string | null
  next_departure_date: string | null
  last_departure_date: string | null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Cruise list with ship name and destination name joins.
 */
export async function getCruises(): Promise<CruiseListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship:ships(name),
      destination:destinations(name),
      departures:cruise_departures(data_partenza)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch cruises: ${error.message}`)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (data ?? []).map((row: any) => {
    const allDeps = (row.departures ?? [])
      .sort((a: any, b: any) => b.data_partenza.localeCompare(a.data_partenza))

    const futureDeps = allDeps
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      next_departure_date: futureDeps[0]?.data_partenza ?? null,
      last_departure_date: allDeps[0]?.data_partenza ?? null,
    }
  })
}

/**
 * Published cruises only, for the public site.
 */
export async function getPublishedCruises(): Promise<CruiseListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship:ships(name),
      destination:destinations(name),
      departures:cruise_departures(data_partenza)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch published cruises: ${error.message}`)
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
      last_departure_date: null,
    }))
}

/**
 * Full cruise with all related sub-tables for detail page.
 * Looks up by slug. Returns `null` when the cruise is not found.
 */
export async function getCruiseBySlug(slug: string): Promise<CruiseWithRelations | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      *,
      locations:cruise_locations(*),
      itinerary_days:cruise_itinerary_days(*),
      cabins:cruise_cabins(*),
      departures:cruise_departures(*),
      supplements:cruise_supplements(*),
      inclusions:cruise_inclusions(*),
      terms:cruise_terms(*),
      penalties:cruise_penalties(*),
      gallery:cruise_gallery(*),
      ship:ships(id, name, slug, cover_image_url),
      destination:destinations(id, name, slug)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch cruise: ${error.message}`)
  }

  const sortBySortOrder = <T extends { sort_order?: number | null }>(
    arr: T[] | null
  ): T[] =>
    (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  // Fetch departure prices, ship decks and ship cabins
  const depIds = (data.departures ?? []).map((d: any) => d.id)

  let departure_prices: any[] = []
  if (depIds.length > 0) {
    const { data: prices } = await supabase
      .from('cruise_departure_prices')
      .select('*')
      .in('departure_id', depIds)
    departure_prices = prices ?? []
  }

  let ship_decks: any[] = []
  let ship_cabins: any[] = []
  if (data.ship_id) {
    const [decksRes, cabinsRes] = await Promise.all([
      supabase.from('ship_decks').select('*').eq('ship_id', data.ship_id).order('sort_order'),
      supabase.from('ship_cabin_details').select('*').eq('ship_id', data.ship_id).order('sort_order'),
    ])
    ship_decks = decksRes.data ?? []
    ship_cabins = cabinsRes.data ?? []
  }

  return {
    ...data,
    locations: sortBySortOrder(data.locations),
    itinerary_days: sortBySortOrder(data.itinerary_days),
    cabins: sortBySortOrder(data.cabins),
    departures: sortBySortOrder(data.departures),
    departure_prices: sortBySortOrder(departure_prices),
    supplements: sortBySortOrder(data.supplements),
    inclusions: sortBySortOrder(data.inclusions),
    terms: sortBySortOrder(data.terms),
    penalties: sortBySortOrder(data.penalties),
    gallery: sortBySortOrder(data.gallery),
    ship_decks: sortBySortOrder(ship_decks),
    ship_cabins: sortBySortOrder(ship_cabins),
  } as CruiseWithRelations
}

/**
 * Cruises filtered by destination, for public pages.
 */
export async function getCruisesForDestination(destinationId: string): Promise<CruiseListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship:ships(name),
      destination:destinations(name),
      departures:cruise_departures(data_partenza)
    `
    )
    .eq('destination_id', destinationId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch cruises for destination: ${error.message}`)
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
      last_departure_date: null,
    }))
}

/**
 * Cruises filtered by ship, for ship detail page.
 */
export async function getCruisesForShip(shipId: string): Promise<CruiseListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship:ships(name),
      destination:destinations(name),
      departures:cruise_departures(data_partenza)
    `
    )
    .eq('ship_id', shipId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch cruises for ship: ${error.message}`)
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
      last_departure_date: null,
    }))
}

// ---------------------------------------------------------------------------
// Enriched queries (with departures for filtering)
// ---------------------------------------------------------------------------

export type CruiseListItemEnriched = CruiseListItem & {
  ship_id: string | null
  destination_id: string | null
  destination_macro_area: string | null
  departures: { id: string; data_partenza: string; prezzo_main_deck: number | null; from_city: string | null }[]
}

/**
 * Published cruises with departure data for client-side filtering.
 */
export async function getPublishedCruisesWithDepartures(): Promise<CruiseListItemEnriched[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship_id,
      destination_id,
      ship:ships(name),
      destination:destinations(name, macro_area),
      departures:cruise_departures(id, data_partenza, prezzo_main_deck, from_city)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch enriched cruises: ${error.message}`)
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_id: row.ship_id,
      destination_id: row.destination_id,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      destination_macro_area: row.destination?.macro_area ?? null,
      departures: row.departures ?? [],
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
      last_departure_date: null,
    }))
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

/**
 * Full cruise with all related sub-tables for editing.
 * Returns `null` when the cruise is not found (PGRST116).
 * Unlike getCruiseBySlug, this does NOT filter by status.
 */
export async function getCruiseById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      *,
      locations:cruise_locations(*),
      itinerary_days:cruise_itinerary_days(*),
      cabins:cruise_cabins(*),
      departures:cruise_departures(*),
      supplements:cruise_supplements(*),
      inclusions:cruise_inclusions(*),
      terms:cruise_terms(*),
      penalties:cruise_penalties(*),
      gallery:cruise_gallery(*),
      ship:ships(id, name, slug, cover_image_url),
      destination:destinations(id, name, slug)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = "The result contains 0 rows" -> not found
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch cruise: ${error.message}`)
  }

  // Sort sub-tables by sort_order client-side for reliability
  const sortBySortOrder = <T extends { sort_order?: number | null }>(
    arr: T[] | null
  ): T[] =>
    (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  // Fetch departure prices, ship decks and ship cabins
  const depIds = (data.departures ?? []).map((d: any) => d.id)

  let departure_prices: any[] = []
  if (depIds.length > 0) {
    const { data: prices } = await supabase
      .from('cruise_departure_prices')
      .select('*')
      .in('departure_id', depIds)
    departure_prices = prices ?? []
  }

  let ship_decks: any[] = []
  let ship_cabins: any[] = []
  if (data.ship_id) {
    const [decksRes, cabinsRes] = await Promise.all([
      supabase.from('ship_decks').select('*').eq('ship_id', data.ship_id).order('sort_order'),
      supabase.from('ship_cabin_details').select('*').eq('ship_id', data.ship_id).order('sort_order'),
    ])
    ship_decks = decksRes.data ?? []
    ship_cabins = cabinsRes.data ?? []
  }

  return {
    ...data,
    locations: sortBySortOrder(data.locations),
    itinerary_days: sortBySortOrder(data.itinerary_days),
    cabins: sortBySortOrder(data.cabins),
    departures: sortBySortOrder(data.departures),
    departure_prices: sortBySortOrder(departure_prices),
    supplements: sortBySortOrder(data.supplements),
    inclusions: sortBySortOrder(data.inclusions),
    terms: sortBySortOrder(data.terms),
    penalties: sortBySortOrder(data.penalties),
    gallery: sortBySortOrder(data.gallery),
    ship_decks: sortBySortOrder(ship_decks),
    ship_cabins: sortBySortOrder(ship_cabins),
  }
}

/**
 * Delete a cruise by ID.
 * Foreign-key cascades handle all sub-table rows automatically.
 */
export async function deleteCruise(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('cruises').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete cruise: ${error.message}`)
  }
}

/**
 * Related cruises: other published cruises sharing the same destination,
 * excluding the one identified by the given slug.
 */
export async function getRelatedCruises(
  slug: string,
  limit = 3
): Promise<CruiseListItem[]> {
  const supabase = createAdminClient()

  // First fetch the current cruise to get its destination_id
  const { data: current } = await supabase
    .from('cruises')
    .select('id, destination_id')
    .eq('slug', slug)
    .single()

  if (!current?.destination_id) return []

  const { data, error } = await supabase
    .from('cruises')
    .select(
      `
      id,
      title,
      slug,
      cover_image_url,
      durata_notti,
      a_partire_da,
      prezzo_su_richiesta,
      tipo_crociera,
      status,
      created_at,
      ship:ships(name),
      destination:destinations(name),
      departures:cruise_departures(data_partenza)
    `
    )
    .eq('destination_id', current.destination_id)
    .eq('status', 'published')
    .neq('id', current.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch related cruises: ${error.message}`)
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
      tipo_crociera: row.tipo_crociera,
      status: row.status,
      created_at: row.created_at,
      ship_name: row.ship?.name ?? null,
      destination_name: row.destination?.name ?? null,
      next_departure_date: (row.departures ?? [])
        .filter((d: any) => d.data_partenza >= today)
        .sort((a: any, b: any) => a.data_partenza.localeCompare(b.data_partenza))[0]
        ?.data_partenza ?? null,
      last_departure_date: null,
    }))
}
