import { createAdminClient } from '../admin'
import type { Agency, QuoteRequest } from '@/lib/types'

// ---------------------------------------------------------------------------
// Admin Agencies Query Functions
// Uses service_role client to bypass RLS
// ---------------------------------------------------------------------------

export interface AgencyListItem extends Agency {
  quote_count?: number
}

/**
 * Get all agencies with optional status filter.
 */
export async function getAdminAgencies(statusFilter?: string): Promise<AgencyListItem[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) throw new Error(`Errore caricamento agenzie: ${error.message}`)
  return (data ?? []) as AgencyListItem[]
}

/**
 * Get a single agency by ID with full details.
 */
export async function getAgencyById(id: string): Promise<Agency | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Errore caricamento agenzia: ${error.message}`)
  }
  return data as Agency
}

/**
 * Get quote requests for a specific agency.
 */
export async function getAgencyQuoteRequests(
  agencyId: string
): Promise<(QuoteRequest & { tour_title?: string; cruise_title?: string })[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      tours:tour_id ( title ),
      cruises:cruise_id ( title )
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Errore caricamento preventivi agenzia: ${error.message}`)

  return (data ?? []).map((row: any) => {
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
 * Get pending agencies for the admin dashboard approval widget.
 */
export async function getPendingAgencies(): Promise<Agency[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Errore caricamento agenzie in attesa: ${error.message}`)
  return (data ?? []) as Agency[]
}

/**
 * Get agency stats (total, active, pending, quote count).
 */
export async function getAgencyStats(): Promise<{
  total: number
  active: number
  pending: number
  blocked: number
  totalQuotes: number
}> {
  const supabase = createAdminClient()

  const [agenciesResult, quotesResult] = await Promise.all([
    supabase.from('agencies').select('status'),
    supabase.from('quote_requests').select('id', { count: 'exact', head: true }),
  ])

  if (agenciesResult.error) throw new Error(`Errore stats agenzie: ${agenciesResult.error.message}`)

  const agencies = agenciesResult.data ?? []
  const total = agencies.length
  const active = agencies.filter(a => a.status === 'active').length
  const pending = agencies.filter(a => a.status === 'pending').length
  const blocked = agencies.filter(a => a.status === 'blocked').length
  const totalQuotes = quotesResult.count ?? 0

  return { total, active, pending, blocked, totalQuotes }
}
