import { createAdminClient } from '../admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UnifiedDeparture = {
  id: string
  type: 'tour' | 'crociera'
  title: string
  slug: string
  destination_name: string | null
  date: string            // ISO date string (YYYY-MM-DD)
  price: number | null
  prezzoSuRichiesta: boolean
  duration: string | null // durata_notti from parent
  basePath: string        // /tours or /crociere
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetches ALL departures from both tour_departures and cruise_departures,
 * joining with the parent tour/cruise to get title, slug, destination, and duration.
 * Only includes departures from published tours/cruises.
 * Returns a unified, date-sorted array.
 */
export async function getAllDepartures(): Promise<UnifiedDeparture[]> {
  const supabase = createAdminClient()

  // Fetch tour departures with parent tour info
  const { data: tourDeps, error: tourError } = await supabase
    .from('tour_departures')
    .select(
      `
      id,
      data_partenza,
      prezzo_3_stelle,
      tour:tours!inner(
        id,
        title,
        slug,
        status,
        durata_notti,
        a_partire_da,
        prezzo_su_richiesta,
        destination:destinations(name)
      )
    `
    )
    .eq('tour.status', 'published')
    .order('data_partenza', { ascending: true })

  if (tourError) {
    throw new Error(`Failed to fetch tour departures: ${tourError.message}`)
  }

  // Fetch cruise departures with parent cruise info
  const { data: cruiseDeps, error: cruiseError } = await supabase
    .from('cruise_departures')
    .select(
      `
      id,
      data_partenza,
      prezzo_main_deck,
      cruise:cruises!inner(
        id,
        title,
        slug,
        status,
        durata_notti,
        a_partire_da,
        prezzo_su_richiesta,
        destination:destinations(name)
      )
    `
    )
    .eq('cruise.status', 'published')
    .order('data_partenza', { ascending: true })

  if (cruiseError) {
    throw new Error(`Failed to fetch cruise departures: ${cruiseError.message}`)
  }

  // Map tour departures to unified shape
  const tourItems: UnifiedDeparture[] = (tourDeps ?? []).map((row: any) => {
    const psr = !!row.tour.prezzo_su_richiesta
    const depPrice = row.prezzo_3_stelle != null ? Number(row.prezzo_3_stelle) : null
    const basePrice = row.tour.a_partire_da != null ? Number(row.tour.a_partire_da) : null
    return {
      id: row.id,
      type: 'tour' as const,
      title: row.tour.title,
      slug: row.tour.slug,
      destination_name: row.tour.destination?.name ?? null,
      date: row.data_partenza ?? '',
      price: psr ? null : (depPrice ?? basePrice),
      prezzoSuRichiesta: psr,
      duration: row.tour.durata_notti ?? null,
      basePath: '/tours',
    }
  })

  // Map cruise departures to unified shape
  const cruiseItems: UnifiedDeparture[] = (cruiseDeps ?? []).map((row: any) => {
    const psr = !!row.cruise.prezzo_su_richiesta
    const depPrice = row.prezzo_main_deck != null ? Number(row.prezzo_main_deck) : null
    const basePrice = row.cruise.a_partire_da != null ? Number(row.cruise.a_partire_da) : null
    return {
      id: row.id,
      type: 'crociera' as const,
      title: row.cruise.title,
      slug: row.cruise.slug,
      destination_name: row.cruise.destination?.name ?? null,
      date: row.data_partenza ?? '',
      price: psr ? null : (depPrice ?? basePrice),
      prezzoSuRichiesta: psr,
      duration: row.cruise.durata_notti ?? null,
      basePath: '/crociere',
    }
  })

  // Merge and sort by date ascending
  const all = [...tourItems, ...cruiseItems]
  all.sort((a, b) => a.date.localeCompare(b.date))

  return all
}

// ---------------------------------------------------------------------------
// Admin Types
// ---------------------------------------------------------------------------

export type AdminDeparture = {
  id: string
  type: 'tour' | 'crociera'
  parent_id: string          // tour.id or cruise.id for edit links
  title: string
  destination_name: string | null
  date: string               // ISO date string (YYYY-MM-DD)
  price: number | null
  duration: string | null
  status: string | null       // parent tour/cruise status
}

// ---------------------------------------------------------------------------
// Admin Queries
// ---------------------------------------------------------------------------

/**
 * Fetches ALL departures for the admin panel, including unpublished.
 * Returns parent_id instead of slug/basePath so admin can link to edit pages.
 * Also fetches the unique destination names for filter dropdowns.
 */
export async function getAdminDepartures(): Promise<{
  departures: AdminDeparture[]
  destinations: string[]
}> {
  const supabase = createAdminClient()

  // Fetch tour departures (no !inner so we include drafts too, but still need parent)
  const { data: tourDeps, error: tourError } = await supabase
    .from('tour_departures')
    .select(
      `
      id,
      data_partenza,
      prezzo_3_stelle,
      tour:tours!inner(
        id,
        title,
        status,
        durata_notti,
        destination:destinations(name)
      )
    `
    )
    .order('data_partenza', { ascending: true })

  if (tourError) {
    throw new Error(`Failed to fetch tour departures: ${tourError.message}`)
  }

  // Fetch cruise departures
  const { data: cruiseDeps, error: cruiseError } = await supabase
    .from('cruise_departures')
    .select(
      `
      id,
      data_partenza,
      prezzo_main_deck,
      cruise:cruises!inner(
        id,
        title,
        status,
        durata_notti,
        destination:destinations(name)
      )
    `
    )
    .order('data_partenza', { ascending: true })

  if (cruiseError) {
    throw new Error(`Failed to fetch cruise departures: ${cruiseError.message}`)
  }

  // Map tour departures
  const tourItems: AdminDeparture[] = (tourDeps ?? []).map((row: any) => ({
    id: row.id,
    type: 'tour' as const,
    parent_id: row.tour.id,
    title: row.tour.title,
    destination_name: row.tour.destination?.name ?? null,
    date: row.data_partenza ?? '',
    price: row.prezzo_3_stelle != null ? Number(row.prezzo_3_stelle) : null,
    duration: row.tour.durata_notti ?? null,
    status: row.tour.status ?? null,
  }))

  // Map cruise departures
  const cruiseItems: AdminDeparture[] = (cruiseDeps ?? []).map((row: any) => ({
    id: row.id,
    type: 'crociera' as const,
    parent_id: row.cruise.id,
    title: row.cruise.title,
    destination_name: row.cruise.destination?.name ?? null,
    date: row.data_partenza ?? '',
    price: row.prezzo_main_deck != null ? Number(row.prezzo_main_deck) : null,
    duration: row.cruise.durata_notti ?? null,
    status: row.cruise.status ?? null,
  }))

  // Merge and sort by date ascending
  const all = [...tourItems, ...cruiseItems]
  all.sort((a, b) => a.date.localeCompare(b.date))

  // Collect unique destination names for filter
  const destSet = new Set<string>()
  all.forEach((d) => {
    if (d.destination_name) destSet.add(d.destination_name)
  })
  const destinations = Array.from(destSet).sort()

  return { departures: all, destinations }
}
