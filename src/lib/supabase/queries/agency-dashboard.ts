import { createClient } from '@/lib/supabase/server'
import type { QuoteRequest, Notification, Agency } from '@/lib/types'

// ---------------------------------------------------------------------------
// Agency Dashboard Query Functions
// Uses server-side Supabase client (respects RLS with the logged-in user session)
// ---------------------------------------------------------------------------

/**
 * Get the agency record for the currently logged-in user.
 */
export async function getAgencyByUserId(userId: string): Promise<Agency | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as Agency
}

/**
 * Count quote requests by status for a given agency.
 * Returns an object with status as key and count as value.
 */
export async function getQuoteRequestCountsByStatus(
  agencyId: string
): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select('status')
    .eq('agency_id', agencyId)

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.status] = (counts[row.status] || 0) + 1
  }
  return counts
}

/**
 * Get recent quote requests for the agency, ordered by newest first.
 * Includes the related tour or cruise title for display.
 */
export async function getRecentQuoteRequests(
  agencyId: string,
  limit = 5
): Promise<(QuoteRequest & { tour_title?: string; cruise_title?: string })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      tours:tour_id ( title ),
      cruises:cruise_id ( title )
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  // Flatten joined fields for easier usage
  return data.map((row) => {
    const tour = row.tours as { title: string } | null
    const cruise = row.cruises as { title: string } | null
    const { tours: _t, cruises: _c, ...rest } = row
    return {
      ...rest,
      tour_title: tour?.title ?? undefined,
      cruise_title: cruise?.title ?? undefined,
    }
  }) as (QuoteRequest & { tour_title?: string; cruise_title?: string })[]
}

/**
 * Get recent unread notifications for the user.
 */
export async function getRecentNotifications(
  userId: string,
  limit = 5
): Promise<Notification[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as Notification[]
}

/**
 * Count unread notifications for the user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error || count === null) return 0
  return count
}
