'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function addTimelineEntry(
  supabase: ReturnType<typeof createAdminClient>,
  requestId: string,
  action: string,
  details: string | null,
  actor: 'admin' | 'agency' | 'system' = 'admin'
) {
  const { error } = await supabase.from('quote_timeline').insert({
    request_id: requestId,
    action,
    details,
    actor,
  })
  if (error) {
    throw new Error(`Failed to create timeline entry: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// 1. Update Quote Status (generic)
// ---------------------------------------------------------------------------

const updateStatusSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum([
    'sent',
    'in_review',
    'offer_sent',
    'accepted',
    'declined',
    'payment_sent',
    'confirmed',
    'rejected',
  ]),
  details: z.string().nullable().optional(),
})

export async function updateQuoteStatus(
  formData: unknown
): Promise<ActionResult> {
  const parsed = updateStatusSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const { request_id, status, details } = parsed.data
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', request_id)

    if (error) {
      return { success: false, error: error.message }
    }

    await addTimelineEntry(
      supabase,
      request_id,
      `Stato aggiornato a "${status}"`,
      details ?? null
    )
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }

  revalidatePath('/admin/preventivi')
  revalidatePath(`/admin/preventivi/${request_id}`)
  return { success: true, id: request_id }
}

// ---------------------------------------------------------------------------
// 2. Create Offer
// ---------------------------------------------------------------------------

const createOfferSchema = z.object({
  request_id: z.string().uuid(),
  total_price: z.coerce.number().min(0, 'Il prezzo deve essere positivo'),
  conditions: z.string().nullable().default(null),
  payment_terms: z.string().nullable().default(null),
  offer_expiry: z.string().nullable().default(null),
  package_details: z.record(z.string(), z.unknown()).nullable().default(null),
  send_now: z.boolean().default(false),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>

export async function createOffer(formData: unknown): Promise<ActionResult> {
  const parsed = createOfferSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    }
  }

  const {
    request_id,
    total_price,
    conditions,
    payment_terms,
    offer_expiry,
    package_details,
    send_now,
  } = parsed.data
  const supabase = createAdminClient()

  try {
    // Insert the offer
    const { data: offer, error: offerError } = await supabase
      .from('quote_offers')
      .insert({
        request_id,
        total_price,
        conditions: conditions?.trim() || null,
        payment_terms: payment_terms?.trim() || null,
        offer_expiry: offer_expiry || null,
        package_details,
      })
      .select('id')
      .single()

    if (offerError) {
      return { success: false, error: offerError.message }
    }

    // Timeline entry for offer creation
    await addTimelineEntry(
      supabase,
      request_id,
      'Offerta creata',
      `Prezzo totale: EUR ${total_price.toFixed(2)}${offer_expiry ? ` - Scadenza: ${offer_expiry}` : ''}`
    )

    // If send_now, update status to 'offer_sent'
    if (send_now) {
      const { error: statusError } = await supabase
        .from('quote_requests')
        .update({ status: 'offer_sent' })
        .eq('id', request_id)

      if (statusError) {
        return { success: false, error: statusError.message }
      }

      await addTimelineEntry(
        supabase,
        request_id,
        'Offerta inviata all\'agenzia',
        null
      )
    }

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${request_id}`)
    return { success: true, id: offer.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Send Payment Details
// ---------------------------------------------------------------------------

const sendPaymentSchema = z.object({
  request_id: z.string().uuid(),
  bank_details: z.string().min(1, 'IBAN obbligatorio'),
  amount: z.coerce.number().min(0.01, 'Importo obbligatorio'),
  reference: z.string().min(1, 'Causale obbligatoria'),
})

export type SendPaymentInput = z.infer<typeof sendPaymentSchema>

export async function sendPaymentDetails(
  formData: unknown
): Promise<ActionResult> {
  const parsed = sendPaymentSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    }
  }

  const { request_id, bank_details, amount, reference } = parsed.data
  const supabase = createAdminClient()

  try {
    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('quote_payments')
      .insert({
        request_id,
        bank_details: bank_details.trim(),
        amount,
        reference: reference.trim(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (paymentError) {
      return { success: false, error: paymentError.message }
    }

    // Update status to 'payment_sent'
    const { error: statusError } = await supabase
      .from('quote_requests')
      .update({ status: 'payment_sent' })
      .eq('id', request_id)

    if (statusError) {
      return { success: false, error: statusError.message }
    }

    await addTimelineEntry(
      supabase,
      request_id,
      'Estremi di pagamento inviati',
      `Importo: EUR ${amount.toFixed(2)} - Causale: ${reference}`
    )

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${request_id}`)
    return { success: true, id: payment.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Confirm Payment Received
// ---------------------------------------------------------------------------

export async function confirmPayment(requestId: string): Promise<ActionResult> {
  if (!requestId) {
    return { success: false, error: 'ID preventivo mancante' }
  }

  const supabase = createAdminClient()

  try {
    // Update quote status to confirmed
    const { error: statusError } = await supabase
      .from('quote_requests')
      .update({ status: 'confirmed' })
      .eq('id', requestId)

    if (statusError) {
      return { success: false, error: statusError.message }
    }

    // Update payment record status to confirmed
    const { error: paymentError } = await supabase
      .from('quote_payments')
      .update({ status: 'confirmed' })
      .eq('request_id', requestId)
      .eq('status', 'pending')

    if (paymentError) {
      return { success: false, error: paymentError.message }
    }

    await addTimelineEntry(
      supabase,
      requestId,
      'Pagamento confermato',
      'Prenotazione confermata'
    )

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${requestId}`)
    return { success: true, id: requestId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Reject Quote
// ---------------------------------------------------------------------------

const rejectQuoteSchema = z.object({
  request_id: z.string().uuid(),
  motivation: z.string().min(1, 'La motivazione e obbligatoria'),
})

export async function rejectQuote(formData: unknown): Promise<ActionResult> {
  const parsed = rejectQuoteSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const { request_id, motivation } = parsed.data
  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: 'rejected' })
      .eq('id', request_id)

    if (error) {
      return { success: false, error: error.message }
    }

    await addTimelineEntry(
      supabase,
      request_id,
      'Richiesta rifiutata',
      motivation
    )

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${request_id}`)
    return { success: true, id: request_id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
