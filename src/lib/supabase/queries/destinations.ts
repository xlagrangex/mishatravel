import { createAdminClient } from '../admin'
import type { Destination } from '@/lib/types'
import type { TourListItem } from './tours'
import type { CruiseListItem } from './cruises'

export async function getDestinations(): Promise<Destination[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento destinazioni: ${error.message}`)
  return data ?? []
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Errore caricamento destinazione: ${error.message}`)
  }
  return data
}

export async function getDestinationOptions(): Promise<{ id: string; name: string; slug: string; coordinate: string | null }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('id, name, slug, coordinate')
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento destinazioni: ${error.message}`)
  return data ?? []
}

// ---------------------------------------------------------------------------
// Public site queries
// ---------------------------------------------------------------------------

/**
 * Published destinations only, sorted by sort_order then name.
 */
export async function getPublishedDestinations(): Promise<Destination[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento destinazioni pubblicate: ${error.message}`)
  return data ?? []
}

/**
 * Find a single destination by slug. Returns null if not found.
 */
export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Errore caricamento destinazione per slug: ${error.message}`)
  }
  return data
}

/**
 * Fetch a destination by slug together with its published tours and cruises.
 * Returns null when the destination is not found.
 */
export async function getDestinationWithTours(
  slug: string
): Promise<{
  destination: Destination
  tours: TourListItem[]
  cruises: CruiseListItem[]
} | null> {
  const supabase = createAdminClient()

  // 1. Get the destination
  const { data: dest, error: destError } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (destError) {
    if (destError.code === 'PGRST116') return null
    throw new Error(`Errore caricamento destinazione: ${destError.message}`)
  }

  // 2. Fetch published tours + cruises for this destination in parallel
  const [toursResult, cruisesResult] = await Promise.all([
    supabase
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
        destination:destinations(name)
      `
      )
      .eq('destination_id', dest.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),

    supabase
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
        destination:destinations(name)
      `
      )
      .eq('destination_id', dest.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
  ])

  if (toursResult.error) {
    throw new Error(`Errore caricamento tour per destinazione: ${toursResult.error.message}`)
  }
  if (cruisesResult.error) {
    throw new Error(`Errore caricamento crociere per destinazione: ${cruisesResult.error.message}`)
  }

  const tours: TourListItem[] = (toursResult.data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row.cover_image_url,
    durata_notti: row.durata_notti,
    a_partire_da: row.a_partire_da,
    status: row.status,
    created_at: row.created_at,
    destination_name: row.destination?.name ?? null,
    prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
  }))

  const cruises: CruiseListItem[] = (cruisesResult.data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row.cover_image_url,
    durata_notti: row.durata_notti,
    a_partire_da: row.a_partire_da,
    tipo_crociera: row.tipo_crociera,
    status: row.status,
    created_at: row.created_at,
    ship_name: row.ship?.name ?? null,
    destination_name: row.destination?.name ?? null,
    prezzo_su_richiesta: row.prezzo_su_richiesta ?? false,
  }))

  return { destination: dest, tours, cruises }
}

/**
 * Get tour + cruise counts per destination (published only).
 * Returns a record keyed by destination slug.
 */
export async function getTourCountsPerDestination(): Promise<Record<string, number>> {
  const supabase = createAdminClient()

  // Fetch published tours and cruises with their destination slug
  const [toursResult, cruisesResult] = await Promise.all([
    supabase
      .from('tours')
      .select('destination:destinations(slug)')
      .eq('status', 'published'),
    supabase
      .from('cruises')
      .select('destination:destinations(slug)')
      .eq('status', 'published'),
  ])

  const counts: Record<string, number> = {}

  for (const row of toursResult.data ?? []) {
    const slug = (row as any).destination?.slug
    if (slug) counts[slug] = (counts[slug] || 0) + 1
  }

  for (const row of cruisesResult.data ?? []) {
    const slug = (row as any).destination?.slug
    if (slug) counts[slug] = (counts[slug] || 0) + 1
  }

  return counts
}
