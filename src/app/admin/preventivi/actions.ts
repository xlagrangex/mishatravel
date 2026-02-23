'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import {
  newOfferReceivedEmail,
  paymentDetailsSentEmail,
  contractSentEmail,
  quoteRejectedEmail,
  offerRevokedEmail,
  reminderEmail,
  documentUploadedToAgencyEmail,
} from '@/lib/email/templates'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch agency details and product name for a given quote request.
 * Used to populate email templates.
 */
async function getQuoteEmailContext(
  supabase: ReturnType<typeof createAdminClient>,
  requestId: string
): Promise<{
  agencyName: string
  agencyEmail: string | null
  productName: string
} | null> {
  try {
    const { data: request } = await supabase
      .from('quote_requests')
      .select(`
        request_type,
        agency:agencies!agency_id(business_name, email),
        tour:tours!tour_id(title),
        cruise:cruises!cruise_id(title)
      `)
      .eq('id', requestId)
      .single()

    if (!request) return null

    const agency = request.agency as any
    const tour = request.tour as any
    const cruise = request.cruise as any

    return {
      agencyName: agency?.business_name ?? 'Agenzia',
      agencyEmail: agency?.email ?? null,
      productName:
        request.request_type === 'tour'
          ? tour?.title ?? 'Tour'
          : cruise?.title ?? 'Crociera',
    }
  } catch {
    return null
  }
}

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

    // Always send the offer to the agency (email + status update)
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Nuova offerta ricevuta - MishaTravel',
          newOfferReceivedEmail(
            ctx.agencyName,
            ctx.productName,
            total_price,
            offer_expiry
          )
        )
      }
    } catch (emailErr) {
      console.error('Error sending new offer email:', emailErr)
    }

    // Update status to 'offer_sent'
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
      emailSent ? 'Email inviata con successo' : 'Attenzione: invio email fallito'
    )

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

    // --- Email: send payment details to agency (before status update) ---
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Estremi di pagamento - MishaTravel',
          paymentDetailsSentEmail(
            ctx.agencyName,
            ctx.productName,
            bank_details,
            amount,
            reference
          )
        )
      }
    } catch (emailErr) {
      console.error('Error sending payment details email:', emailErr)
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
      `Importo: EUR ${amount.toFixed(2)} - Causale: ${reference}${emailSent ? '' : ' (Attenzione: invio email fallito)'}`
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
// 5. Confirm with Contract (new workflow — replaces sendPaymentDetails)
// ---------------------------------------------------------------------------

const confirmContractSchema = z.object({
  request_id: z.string().uuid(),
  offer_id: z.string().uuid(),
  contract_file_url: z.string().min(1, 'URL contratto obbligatorio'),
  iban: z.string().min(1, 'IBAN obbligatorio'),
  destinatario: z.string().nullable().default(null),
  causale: z.string().nullable().default(null),
  banca: z.string().nullable().default(null),
  send_email: z.boolean().default(true),
  notes: z.string().nullable().default(null),
})

export type ConfirmContractInput = z.infer<typeof confirmContractSchema>

export async function confirmWithContract(
  formData: unknown
): Promise<ActionResult> {
  const parsed = confirmContractSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    }
  }

  const { request_id, offer_id, contract_file_url, iban, destinatario, causale, banca, notes } =
    parsed.data
  const supabase = createAdminClient()

  try {
    // Update the offer with contract file and banking details
    const { error: offerError } = await supabase
      .from('quote_offers')
      .update({
        contract_file_url,
        iban: iban.trim(),
        destinatario: destinatario?.trim() || null,
        causale: causale?.trim() || null,
        banca: banca?.trim() || null,
        notes: notes?.trim() || null,
      })
      .eq('id', offer_id)

    if (offerError) {
      return { success: false, error: offerError.message }
    }

    // Always send email to agency
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Contratto e dati di pagamento - MishaTravel',
          contractSentEmail(ctx.agencyName, ctx.productName, iban.trim(), {
            destinatario: destinatario?.trim() || null,
            causale: causale?.trim() || null,
            banca: banca?.trim() || null,
            notes: notes?.trim() || null,
          })
        )
      }
    } catch (emailErr) {
      console.error('Error sending contract email:', emailErr)
    }

    // Update status to 'confirmed'
    const { error: statusError } = await supabase
      .from('quote_requests')
      .update({ status: 'confirmed' })
      .eq('id', request_id)

    if (statusError) {
      return { success: false, error: statusError.message }
    }

    const detailParts = [`IBAN: ${iban.trim()}`]
    if (destinatario) detailParts.push(`Destinatario: ${destinatario.trim()}`)
    if (causale) detailParts.push(`Causale: ${causale.trim()}`)
    if (notes) detailParts.push(`Note: ${notes.trim()}`)
    detailParts.push(emailSent ? 'Email inviata' : 'Attenzione: invio email fallito')

    await addTimelineEntry(
      supabase,
      request_id,
      'Contratto e dati bancari inviati',
      detailParts.join(' - ')
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

// ---------------------------------------------------------------------------
// 6. Upload / Delete Quote Documents
// ---------------------------------------------------------------------------

const uploadDocSchema = z.object({
  request_id: z.string().uuid(),
  file_url: z.string().min(1, 'URL file obbligatorio'),
  file_name: z.string().min(1, 'Nome file obbligatorio'),
  document_type: z.string().default('altro'),
})

export async function uploadQuoteDocument(
  formData: unknown
): Promise<ActionResult> {
  const parsed = uploadDocSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const { request_id, file_url, file_name, document_type } = parsed.data
  const supabase = createAdminClient()

  try {
    const { data: doc, error } = await supabase
      .from('quote_documents')
      .insert({
        request_id,
        file_url,
        file_name,
        document_type,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await addTimelineEntry(
      supabase,
      request_id,
      'Documento caricato',
      `${file_name} (${document_type})`
    )

    // If it's an estratto conto, also create a record in account_statements
    // so it appears in /admin/estratti-conto and /agenzia/estratto-conto
    if (document_type === 'estratto_conto') {
      try {
        const { data: request } = await supabase
          .from('quote_requests')
          .select('agency_id')
          .eq('id', request_id)
          .single()

        if (request?.agency_id) {
          await supabase.from('account_statements').insert({
            agency_id: request.agency_id,
            title: file_name,
            file_url,
            data: new Date().toISOString().split('T')[0],
            stato: 'Bozza',
          })
          revalidatePath('/admin/estratti-conto')
        }
      } catch (stmtErr) {
        console.error('Error creating account statement:', stmtErr)
      }
    }

    // Send email notification to agency
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Nuovo documento disponibile - MishaTravel',
          documentUploadedToAgencyEmail(ctx.agencyName, ctx.productName, document_type)
        )
      }
    } catch (emailErr) {
      console.error('Error sending document uploaded email:', emailErr)
    }

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${request_id}`)
    return { success: true, id: doc.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function deleteQuoteDocument(
  documentId: string,
  requestId: string
): Promise<ActionResult> {
  if (!documentId) {
    return { success: false, error: 'ID documento mancante' }
  }

  const supabase = createAdminClient()

  try {
    // Fetch the document first to check if it's an estratto_conto
    const { data: docData } = await supabase
      .from('quote_documents')
      .select('file_url, document_type')
      .eq('id', documentId)
      .single()

    const { error } = await supabase
      .from('quote_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Also delete the matching account_statement if it was an estratto_conto
    if (docData?.document_type === 'estratto_conto' && docData.file_url) {
      try {
        await supabase
          .from('account_statements')
          .delete()
          .eq('file_url', docData.file_url)
        revalidatePath('/admin/estratti-conto')
      } catch {
        // Non-blocking: if the account_statement wasn't found, that's ok
      }
    }

    revalidatePath('/admin/preventivi')
    revalidatePath(`/admin/preventivi/${requestId}`)
    return { success: true, id: documentId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Reject Quote
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
    // --- Email: notify agency first, before updating status ---
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Aggiornamento sulla tua richiesta - MishaTravel',
          quoteRejectedEmail(ctx.agencyName, ctx.productName, motivation)
        )
      }
    } catch (emailErr) {
      console.error('Error sending quote rejected email:', emailErr)
    }

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
      `${motivation}${emailSent ? '' : ' (Attenzione: invio email fallito)'}`
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

// ---------------------------------------------------------------------------
// 8. Send Reminder to Agency
// ---------------------------------------------------------------------------

const sendReminderSchema = z.object({
  request_id: z.string().uuid(),
  message: z.string().nullable().default(null),
})

export async function sendReminder(formData: unknown): Promise<ActionResult> {
  const parsed = sendReminderSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const { request_id, message } = parsed.data
  const supabase = createAdminClient()

  try {
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, request_id)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Promemoria - MishaTravel',
          reminderEmail(ctx.agencyName, ctx.productName, message)
        )
      }
    } catch (emailErr) {
      console.error('Error sending reminder email:', emailErr)
    }

    await addTimelineEntry(
      supabase,
      request_id,
      'Sollecito inviato all\'agenzia',
      `${message ? message : 'Sollecito generico'}${emailSent ? '' : ' (Attenzione: invio email fallito)'}`
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

// ---------------------------------------------------------------------------
// 9. Bulk Actions
// ---------------------------------------------------------------------------

const VALID_STATUSES = [
  'sent',
  'in_review',
  'offer_sent',
  'accepted',
  'declined',
  'payment_sent',
  'confirmed',
  'rejected',
  'archived',
]

export async function bulkUpdateStatus(
  requestIds: string[],
  newStatus: string
): Promise<ActionResult> {
  if (!requestIds.length) {
    return { success: false, error: 'Nessun preventivo selezionato' }
  }
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: `Stato non valido: ${newStatus}` }
  }

  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .in('id', requestIds)

    if (error) {
      return { success: false, error: error.message }
    }

    // Add timeline entry for each request (batch insert)
    const timelineRows = requestIds.map((id) => ({
      request_id: id,
      action: `Stato aggiornato in massa a "${newStatus}"`,
      details: `${requestIds.length} preventivi aggiornati`,
      actor: 'admin' as const,
    }))

    await supabase.from('quote_timeline').insert(timelineRows)

    revalidatePath('/admin/preventivi')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function bulkArchive(
  requestIds: string[]
): Promise<ActionResult> {
  return bulkUpdateStatus(requestIds, 'archived')
}

export async function bulkDelete(
  requestIds: string[]
): Promise<ActionResult> {
  if (!requestIds.length) {
    return { success: false, error: 'Nessun preventivo selezionato' }
  }

  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .in('id', requestIds)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/preventivi')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

// ---------------------------------------------------------------------------
// 10. Revoke Offer
// ---------------------------------------------------------------------------

export async function revokeOffer(requestId: string): Promise<ActionResult> {
  if (!requestId) {
    return { success: false, error: 'ID preventivo mancante' }
  }

  const supabase = createAdminClient()

  try {
    // Verify the request is in offer_sent status
    const { data: request } = await supabase
      .from('quote_requests')
      .select('id, status')
      .eq('id', requestId)
      .single()

    if (!request) {
      return { success: false, error: 'Richiesta non trovata' }
    }

    if (request.status !== 'offer_sent') {
      return {
        success: false,
        error: 'Lo stato della richiesta non permette questa azione.',
      }
    }

    // Delete the offer(s) for this request
    const { error: deleteError } = await supabase
      .from('quote_offers')
      .delete()
      .eq('request_id', requestId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Notify agency via email before status update
    let emailSent = false
    try {
      const ctx = await getQuoteEmailContext(supabase, requestId)
      if (ctx?.agencyEmail) {
        emailSent = await sendTransactionalEmail(
          { email: ctx.agencyEmail, name: ctx.agencyName },
          'Offerta revocata - MishaTravel',
          offerRevokedEmail(ctx.agencyName, ctx.productName)
        )
      }
    } catch (emailErr) {
      console.error('Error sending offer revoked email:', emailErr)
    }

    // Revert status to 'sent'
    const { error: statusError } = await supabase
      .from('quote_requests')
      .update({ status: 'sent' })
      .eq('id', requestId)

    if (statusError) {
      return { success: false, error: statusError.message }
    }

    await addTimelineEntry(
      supabase,
      requestId,
      'Offerta revocata',
      `L'offerta e stata revocata dal tour operator.${emailSent ? '' : ' (Attenzione: invio email fallito)'}`
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
