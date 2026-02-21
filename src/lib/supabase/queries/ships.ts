import { createAdminClient } from '../admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShipListItem = {
  id: string
  name: string
  slug: string
  cover_image_url: string | null
  status: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Lightweight ship list for admin table view.
 */
export async function getShips(): Promise<ShipListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ships')
    .select('id, name, slug, cover_image_url, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch ships: ${error.message}`)
  }

  return data ?? []
}

/**
 * Full ship with all related sub-tables for editing.
 * Returns `null` when the ship is not found (PGRST116).
 */
export async function getShipById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ships')
    .select(
      `
      *,
      suitable_for:ship_suitable_for(*),
      activities:ship_activities(*),
      services:ship_services(*),
      gallery:ship_gallery(*),
      cabin_details:ship_cabin_details(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    // PGRST116 = "The result contains 0 rows" -> not found
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch ship: ${error.message}`)
  }

  // Sort sub-tables by sort_order client-side for reliability
  const sortBySortOrder = <T extends { sort_order?: number | null }>(
    arr: T[] | null
  ): T[] =>
    (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  return {
    ...data,
    suitable_for: sortBySortOrder(data.suitable_for),
    activities: sortBySortOrder(data.activities),
    services: sortBySortOrder(data.services),
    gallery: sortBySortOrder(data.gallery),
    cabin_details: sortBySortOrder(data.cabin_details),
  }
}

/**
 * Ship options for dropdowns (used by crociere form).
 */
export async function getShipOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ships')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) throw new Error(`Errore caricamento navi: ${error.message}`)
  return data ?? []
}

/**
 * Delete a ship by ID.
 * Foreign-key cascades handle all sub-table rows automatically.
 */
export async function deleteShip(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('ships').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete ship: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// Public site queries
// ---------------------------------------------------------------------------

/**
 * Published ships for the public fleet page.
 */
export async function getPublishedShips(): Promise<ShipListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ships')
    .select('id, name, slug, cover_image_url, status, created_at')
    .eq('status', 'published')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch published ships: ${error.message}`)
  }

  return data ?? []
}

/**
 * Full ship with all relations, looked up by slug.
 * Returns null when the ship is not found or not published.
 */
export async function getShipBySlug(slug: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ships')
    .select(
      `
      *,
      suitable_for:ship_suitable_for(*),
      activities:ship_activities(*),
      services:ship_services(*),
      gallery:ship_gallery(*),
      cabin_details:ship_cabin_details(*)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch ship by slug: ${error.message}`)
  }

  const sortBySortOrder = <T extends { sort_order?: number | null }>(
    arr: T[] | null
  ): T[] =>
    (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  return {
    ...data,
    suitable_for: sortBySortOrder(data.suitable_for),
    activities: sortBySortOrder(data.activities),
    services: sortBySortOrder(data.services),
    gallery: sortBySortOrder(data.gallery),
    cabin_details: sortBySortOrder(data.cabin_details),
  }
}
