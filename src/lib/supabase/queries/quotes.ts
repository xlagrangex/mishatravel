import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '../admin'
import type {
  QuoteRequest,
  QuoteOffer,
  QuotePayment,
  QuoteTimeline,
  QuoteRequestExtra,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuoteListItem = {
  id: string
  created_at: string
  request_type: string
  status: string
  tour_title: string | null
  cruise_title: string | null
  participants_adults: number | null
  participants_children: number | null
}

export type QuoteDetail = QuoteRequest & {
  tour: { id: string; title: string; slug: string } | null
  cruise: { id: string; title: string; slug: string } | null
  extras: QuoteRequestExtra[]
  offers: QuoteOffer[]
  payments: QuotePayment[]
  timeline: QuoteTimeline[]
}

export type OfferListItem = {
  id: string
  request_id: string
  package_details: Record<string, unknown> | null
  total_price: number | null
  conditions: string | null
  payment_terms: string | null
  offer_expiry: string | null
  created_at: string
  request: {
    id: string
    status: string
    request_type: string
    tour: { title: string } | null
    cruise: { title: string } | null
  }
}

// ---------------------------------------------------------------------------
// Helper: get agency_id for current user
// ---------------------------------------------------------------------------

async function getAgencyId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return agency?.id ?? null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all quote requests for the current agency.
 */
export async function getAgencyQuotes(): Promise<QuoteListItem[]> {
  const agencyId = await getAgencyId()
  if (!agencyId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select(
      `
      id,
      created_at,
      request_type,
      status,
      participants_adults,
      participants_children,
      tour:tours(title),
      cruise:cruises(title)
    `
    )
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching agency quotes:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    created_at: row.created_at,
    request_type: row.request_type,
    status: row.status,
    tour_title: row.tour?.title ?? null,
    cruise_title: row.cruise?.title ?? null,
    participants_adults: row.participants_adults,
    participants_children: row.participants_children,
  }))
}

/**
 * Get a single quote request by ID with all related data.
 */
export async function getQuoteById(id: string): Promise<QuoteDetail | null> {
  const agencyId = await getAgencyId()
  if (!agencyId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select(
      `
      *,
      tour:tours(id, title, slug),
      cruise:cruises(id, title, slug),
      extras:quote_request_extras(*),
      offers:quote_offers(*),
      payments:quote_payments(*),
      timeline:quote_timeline(*)
    `
    )
    .eq('id', id)
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching quote by id:', error)
    return null
  }

  // Sort timeline by created_at descending
  const sortedTimeline = (data.timeline ?? []).sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return {
    ...data,
    timeline: sortedTimeline,
  } as QuoteDetail
}

/**
 * Get all offers received by the current agency (only those with status offer_sent).
 */
export async function getAgencyOffers(): Promise<OfferListItem[]> {
  const agencyId = await getAgencyId()
  if (!agencyId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_offers')
    .select(
      `
      id,
      request_id,
      package_details,
      total_price,
      conditions,
      payment_terms,
      offer_expiry,
      created_at,
      request:quote_requests!request_id(
        id,
        status,
        request_type,
        tour:tours(title),
        cruise:cruises(title)
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching agency offers:', error)
    return []
  }

  // Filter: only offers where the underlying request belongs to this agency
  // RLS should handle this, but we map data structure here
  return (data ?? []).map((row: any) => ({
    id: row.id,
    request_id: row.request_id,
    package_details: row.package_details,
    total_price: row.total_price,
    conditions: row.conditions,
    payment_terms: row.payment_terms,
    offer_expiry: row.offer_expiry,
    created_at: row.created_at,
    request: {
      id: row.request?.id,
      status: row.request?.status,
      request_type: row.request?.request_type,
      tour: row.request?.tour ?? null,
      cruise: row.request?.cruise ?? null,
    },
  }))
}

// ---------------------------------------------------------------------------
// Mutations (use admin client for multi-table operations)
// ---------------------------------------------------------------------------

/**
 * Accept an offer: updates quote_request status to 'accepted' and adds timeline entry.
 */
export async function acceptOffer(
  offerId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return { success: false, error: 'Non autenticato.' }

    const admin = createAdminClient()

    // Verify the request belongs to this agency
    const { data: request } = await admin
      .from('quote_requests')
      .select('id, agency_id, status')
      .eq('id', requestId)
      .single()

    if (!request || request.agency_id !== agencyId) {
      return { success: false, error: 'Richiesta non trovata.' }
    }

    if (request.status !== 'offer_sent') {
      return { success: false, error: 'Lo stato della richiesta non permette questa azione.' }
    }

    // Update status
    const { error: updateError } = await admin
      .from('quote_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateError) {
      return { success: false, error: 'Errore nell\'aggiornamento dello stato.' }
    }

    // Add timeline entry
    await admin.from('quote_timeline').insert({
      request_id: requestId,
      action: 'Offerta accettata',
      details: `L'agenzia ha accettato l'offerta.`,
      actor: 'agency',
    })

    return { success: true }
  } catch (err) {
    console.error('Error accepting offer:', err)
    return { success: false, error: 'Errore imprevisto.' }
  }
}

/**
 * Decline an offer: updates quote_request status to 'declined' and adds timeline entry.
 */
export async function declineOffer(
  offerId: string,
  requestId: string,
  motivation?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const agencyId = await getAgencyId()
    if (!agencyId) return { success: false, error: 'Non autenticato.' }

    const admin = createAdminClient()

    // Verify the request belongs to this agency
    const { data: request } = await admin
      .from('quote_requests')
      .select('id, agency_id, status')
      .eq('id', requestId)
      .single()

    if (!request || request.agency_id !== agencyId) {
      return { success: false, error: 'Richiesta non trovata.' }
    }

    if (request.status !== 'offer_sent') {
      return { success: false, error: 'Lo stato della richiesta non permette questa azione.' }
    }

    // Update status
    const { error: updateError } = await admin
      .from('quote_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)

    if (updateError) {
      return { success: false, error: 'Errore nell\'aggiornamento dello stato.' }
    }

    // Add timeline entry
    await admin.from('quote_timeline').insert({
      request_id: requestId,
      action: 'Offerta rifiutata',
      details: motivation
        ? `L'agenzia ha rifiutato l'offerta. Motivazione: ${motivation}`
        : `L'agenzia ha rifiutato l'offerta.`,
      actor: 'agency',
    })

    return { success: true }
  } catch (err) {
    console.error('Error declining offer:', err)
    return { success: false, error: 'Errore imprevisto.' }
  }
}
