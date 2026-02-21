import { createAdminClient } from '../admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuoteListItem = {
  id: string
  request_type: 'tour' | 'cruise'
  status: string
  participants_adults: number | null
  participants_children: number | null
  cabin_type: string | null
  num_cabins: number | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  agency_business_name: string | null
  agency_email: string | null
  tour_title: string | null
  cruise_title: string | null
}

export type QuoteStats = {
  total: number
  sent: number
  in_review: number
  offer_sent: number
  accepted: number
  declined: number
  payment_sent: number
  confirmed: number
  rejected: number
}

export type QuoteDetailData = {
  id: string
  request_type: 'tour' | 'cruise'
  status: string
  participants_adults: number | null
  participants_children: number | null
  cabin_type: string | null
  num_cabins: number | null
  notes: string | null
  created_at: string
  updated_at: string
  departure_id: string | null
  // Agency
  agency: {
    id: string
    business_name: string
    contact_name: string | null
    phone: string | null
    email: string | null
    city: string | null
    province: string | null
  } | null
  // Tour / Cruise
  tour: {
    id: string
    title: string
    slug: string
    durata_notti: string | null
    cover_image_url: string | null
  } | null
  cruise: {
    id: string
    title: string
    slug: string
    durata_notti: string | null
    cover_image_url: string | null
  } | null
  // Relations
  extras: { id: string; extra_name: string; quantity: number | null }[]
  offers: {
    id: string
    package_details: Record<string, unknown> | null
    total_price: number | null
    conditions: string | null
    payment_terms: string | null
    offer_expiry: string | null
    created_at: string
  }[]
  payments: {
    id: string
    bank_details: string | null
    amount: number | null
    reference: string | null
    status: string
    created_at: string
  }[]
  timeline: {
    id: string
    action: string
    details: string | null
    actor: string
    created_at: string
  }[]
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export interface QuoteFilters {
  status?: string
  request_type?: string
  agency_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

/**
 * Fetch all quote requests with agency and tour/cruise names.
 */
export async function getAllQuotes(
  filters?: QuoteFilters
): Promise<QuoteListItem[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('quote_requests')
    .select(
      `
      id,
      request_type,
      status,
      participants_adults,
      participants_children,
      cabin_type,
      num_cabins,
      notes,
      created_at,
      updated_at,
      agency:agencies(business_name, email),
      tour:tours(title),
      cruise:cruises(title)
    `
    )
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.request_type && filters.request_type !== 'all') {
    query = query.eq('request_type', filters.request_type)
  }
  if (filters?.agency_id) {
    query = query.eq('agency_id', filters.agency_id)
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('created_at', `${filters.date_to}T23:59:59`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch quotes: ${error.message}`)
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    request_type: row.request_type,
    status: row.status,
    participants_adults: row.participants_adults,
    participants_children: row.participants_children,
    cabin_type: row.cabin_type,
    num_cabins: row.num_cabins,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    agency_business_name: row.agency?.business_name ?? null,
    agency_email: row.agency?.email ?? null,
    tour_title: row.tour?.title ?? null,
    cruise_title: row.cruise?.title ?? null,
  }))
}

/**
 * Get aggregated stats by status.
 */
export async function getQuoteStats(): Promise<QuoteStats> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('quote_requests')
    .select('status')

  if (error) {
    throw new Error(`Failed to fetch quote stats: ${error.message}`)
  }

  const rows = data ?? []
  const stats: QuoteStats = {
    total: rows.length,
    sent: 0,
    in_review: 0,
    offer_sent: 0,
    accepted: 0,
    declined: 0,
    payment_sent: 0,
    confirmed: 0,
    rejected: 0,
  }

  for (const row of rows) {
    const s = row.status as keyof Omit<QuoteStats, 'total'>
    if (s in stats) {
      stats[s]++
    }
  }

  return stats
}

/**
 * Get the full detail of a single quote request, with relations.
 */
export async function getQuoteDetail(
  id: string
): Promise<QuoteDetailData | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('quote_requests')
    .select(
      `
      *,
      agency:agencies(id, business_name, contact_name, phone, email, city, province),
      tour:tours(id, title, slug, durata_notti, cover_image_url),
      cruise:cruises(id, title, slug, durata_notti, cover_image_url),
      extras:quote_request_extras(id, extra_name, quantity),
      offers:quote_offers(id, package_details, total_price, conditions, payment_terms, offer_expiry, created_at),
      payments:quote_payments(id, bank_details, amount, reference, status, created_at),
      timeline:quote_timeline(id, action, details, actor, created_at)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch quote detail: ${error.message}`)
  }

  return {
    id: data.id,
    request_type: data.request_type,
    status: data.status,
    participants_adults: data.participants_adults,
    participants_children: data.participants_children,
    cabin_type: data.cabin_type,
    num_cabins: data.num_cabins,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    departure_id: data.departure_id,
    agency: data.agency ?? null,
    tour: data.tour ?? null,
    cruise: data.cruise ?? null,
    extras: data.extras ?? [],
    offers: (data.offers ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    payments: (data.payments ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    timeline: (data.timeline ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }
}

/**
 * Get list of agencies for filter dropdown.
 */
export async function getAgenciesForFilter(): Promise<
  { id: string; business_name: string }[]
> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agencies')
    .select('id, business_name')
    .order('business_name')

  if (error) {
    throw new Error(`Failed to fetch agencies: ${error.message}`)
  }

  return data ?? []
}
