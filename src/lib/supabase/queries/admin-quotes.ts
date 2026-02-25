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
  contract_sent: number
  confirmed: number
  rejected: number
  archived: number
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
  preview_price: number | null
  preview_price_label: string | null
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
    a_partire_da: string | null
    prezzo_su_richiesta: boolean
  } | null
  cruise: {
    id: string
    title: string
    slug: string
    durata_notti: string | null
    cover_image_url: string | null
    a_partire_da: string | null
    prezzo_su_richiesta: boolean
  } | null
  // Departure price check
  departure_has_prices: boolean | null
  // Relations
  extras: { id: string; extra_name: string; quantity: number | null }[]
  offers: {
    id: string
    package_details: Record<string, unknown> | null
    total_price: number | null
    conditions: string | null
    payment_terms: string | null
    offer_expiry: string | null
    contract_file_url: string | null
    iban: string | null
    destinatario: string | null
    causale: string | null
    banca: string | null
    notes: string | null
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
  participants: {
    id: string
    full_name: string
    first_name: string | null
    last_name: string | null
    document_type: string | null
    document_number: string | null
    document_expiry: string | null
    is_child: boolean
    age: number | null
    age_category: string | null
    codice_fiscale: string | null
    sort_order: number
    created_at: string
  }[]
  documents: {
    id: string
    file_url: string
    file_name: string
    document_type: string
    uploaded_by: string | null
    created_at: string
  }[]
  timeline: {
    id: string
    action: string
    details: string | null
    actor: string
    user_id: string | null
    actor_name: string | null
    actor_email: string | null
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
  // Note: archived quotes are filtered client-side in AdminQuotesTable
  // because PostgREST returns 400 when using neq/not.eq on the "status" column
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
    total: 0,
    sent: 0,
    in_review: 0,
    offer_sent: 0,
    accepted: 0,
    declined: 0,
    payment_sent: 0,
    contract_sent: 0,
    confirmed: 0,
    rejected: 0,
    archived: 0,
  }

  for (const row of rows) {
    const s = row.status as keyof Omit<QuoteStats, 'total'>
    if (s in stats) {
      stats[s]++
    }
  }

  // total excludes archived
  stats.total = rows.length - stats.archived

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
      tour:tours(id, title, slug, durata_notti, cover_image_url, a_partire_da, prezzo_su_richiesta),
      cruise:cruises(id, title, slug, durata_notti, cover_image_url, a_partire_da, prezzo_su_richiesta),
      extras:quote_request_extras(id, extra_name, quantity),
      offers:quote_offers(*),
      payments:quote_payments(id, bank_details, amount, reference, status, created_at),
      timeline:quote_timeline(id, action, details, actor, user_id, actor_name, actor_email, created_at)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch quote detail: ${error.message}`)
  }

  // Fetch participants and documents separately (tables may not exist yet before migration)
  let participants: any[] = []
  let documents: any[] = []

  try {
    const { data: p } = await supabase
      .from('quote_participants')
      .select('id, full_name, first_name, last_name, document_type, document_number, document_expiry, is_child, age, age_category, codice_fiscale, sort_order, created_at')
      .eq('request_id', id)
    participants = p ?? []
  } catch { /* table may not exist yet */ }

  try {
    const { data: d } = await supabase
      .from('quote_documents')
      .select('id, file_url, file_name, document_type, uploaded_by, created_at')
      .eq('request_id', id)
    documents = d ?? []
  } catch { /* table may not exist yet */ }

  // Check if the selected departure has actual prices configured
  let departureHasPrices: boolean | null = null
  if (data.departure_id) {
    try {
      if (data.request_type === 'tour') {
        const { data: dep } = await supabase
          .from('tour_departures')
          .select('prezzo_3_stelle, prezzo_4_stelle')
          .eq('id', data.departure_id)
          .single()
        if (dep) {
          departureHasPrices =
            dep.prezzo_3_stelle != null || (dep.prezzo_4_stelle != null && dep.prezzo_4_stelle !== '')
        }
      } else {
        const { data: dep } = await supabase
          .from('cruise_departures')
          .select('prezzo_main_deck, prezzo_middle_deck, prezzo_superior_deck')
          .eq('id', data.departure_id)
          .single()
        if (dep) {
          departureHasPrices =
            dep.prezzo_main_deck != null ||
            (dep.prezzo_middle_deck != null && dep.prezzo_middle_deck !== '') ||
            (dep.prezzo_superior_deck != null && dep.prezzo_superior_deck !== '')
        }
        // Also check cruise_departure_prices if main columns are empty
        if (departureHasPrices === false) {
          const { data: cabinPrices } = await supabase
            .from('cruise_departure_prices')
            .select('prezzo')
            .eq('departure_id', data.departure_id)
            .limit(1)
          if (cabinPrices && cabinPrices.length > 0 && cabinPrices[0].prezzo) {
            departureHasPrices = true
          }
        }
      }
    } catch { /* ignore errors */ }
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
    preview_price: data.preview_price ?? null,
    preview_price_label: data.preview_price_label ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    departure_id: data.departure_id,
    agency: data.agency ?? null,
    tour: data.tour ?? null,
    cruise: data.cruise ?? null,
    departure_has_prices: departureHasPrices,
    extras: data.extras ?? [],
    offers: (data.offers ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    payments: (data.payments ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    participants: participants.sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
    documents: documents.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    timeline: (data.timeline ?? []).sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  }
}

// ---------------------------------------------------------------------------
// Banking presets (from previously used offers)
// ---------------------------------------------------------------------------

export type BankingPreset = {
  iban: string
  destinatario: string | null
  causale: string | null
  banca: string | null
}

/**
 * Fetch distinct banking detail combinations previously used in offers.
 */
export async function getBankingPresets(): Promise<BankingPreset[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('quote_offers')
    .select('iban, destinatario, causale, banca')
    .not('iban', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch banking presets:', error.message)
    return []
  }

  // Deduplicate by IBAN
  const seen = new Set<string>()
  const presets: BankingPreset[] = []
  for (const row of data ?? []) {
    if (!row.iban) continue
    const key = row.iban.trim().toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    presets.push({
      iban: row.iban,
      destinatario: row.destinatario ?? null,
      causale: row.causale ?? null,
      banca: row.banca ?? null,
    })
  }
  return presets
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
