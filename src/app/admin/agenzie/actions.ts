'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import { agencyApprovedEmail, agencyCreatedByAdminEmail, agencyDocumentVerifiedEmail } from '@/lib/email/templates'

type ActionResult = { success: true; id?: string } | { success: false; error: string }

export interface CreateAgencyInput {
  business_name: string
  vat_number?: string
  fiscal_code?: string
  license_number?: string
  address?: string
  city?: string
  zip_code?: string
  province?: string
  contact_name?: string
  email: string
  phone?: string
  website?: string
  password: string
  status: 'active' | 'pending'
}

/**
 * Update agency status (approve, block, or reactivate).
 */
export async function updateAgencyStatus(
  agencyId: string,
  status: 'active' | 'pending' | 'blocked'
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('agencies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', agencyId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/agenzie')
  revalidatePath(`/admin/agenzie/${agencyId}`)
  return { success: true }
}

/**
 * Approve an agency from the admin dashboard widget.
 * Updates status to 'active' and notifies the agency user.
 */
export async function approveAgencyFromDashboard(
  agencyId: string
): Promise<ActionResult> {
  const supabase = createAdminClient()

  // First get the agency to find the user_id, business_name and email
  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('user_id, business_name, email')
    .eq('id', agencyId)
    .single()

  if (fetchError || !agency) {
    return { success: false, error: fetchError?.message ?? 'Agenzia non trovata' }
  }

  // Update agency status to active
  const { error } = await supabase
    .from('agencies')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', agencyId)

  if (error) return { success: false, error: error.message }

  // Notify the agency user that their account is approved
  await supabase.from('notifications').insert({
    user_id: agency.user_id,
    title: 'Account approvato',
    message: `La tua agenzia "${agency.business_name}" è stata approvata. Puoi ora accedere all'area riservata.`,
    link: '/agenzia/dashboard',
  })

  // --- Email: notify agency that account is approved ---
  try {
    if (agency.email) {
      await sendTransactionalEmail(
        { email: agency.email, name: agency.business_name },
        'Il tuo account MishaTravel è stato approvato!',
        agencyApprovedEmail(agency.business_name)
      )
    }
  } catch (emailErr) {
    console.error('Error sending agency approved email:', emailErr)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/agenzie')
  revalidatePath(`/admin/agenzie/${agencyId}`)
  return { success: true }
}

/**
 * Delete an agency and its auth user so the email can be re-registered.
 * Deleting the auth user cascades to agencies + user_roles via FK ON DELETE CASCADE.
 */
export async function deleteAgency(agencyId: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  // 1. Fetch user_id before deletion
  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('user_id')
    .eq('id', agencyId)
    .single()

  if (fetchError || !agency) {
    return { success: false, error: fetchError?.message ?? 'Agenzia non trovata' }
  }

  // 2. Delete auth user → CASCADE deletes agencies + user_roles
  const { error: authError } = await supabase.auth.admin.deleteUser(agency.user_id)

  if (authError) {
    return { success: false, error: `Errore eliminazione utente: ${authError.message}` }
  }

  // 3. Safety: explicit cleanup of user_roles if not cascaded
  await supabase.from('user_roles').delete().eq('user_id', agency.user_id)

  revalidatePath('/admin/agenzie')
  return { success: true }
}

/**
 * Admin creates an agency directly (auth user auto-confirmed).
 */
export async function createAgencyFromAdmin(
  input: CreateAgencyInput
): Promise<ActionResult & { agencyId?: string }> {
  const supabase = createAdminClient()

  // 1. Create auth user with auto-confirmed email
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })

  if (authError) {
    return { success: false, error: `Errore creazione utente: ${authError.message}` }
  }

  const userId = authData.user.id

  // 2. Insert agency record
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({
      user_id: userId,
      business_name: input.business_name,
      vat_number: input.vat_number || null,
      fiscal_code: input.fiscal_code || null,
      license_number: input.license_number || null,
      address: input.address || null,
      city: input.city || null,
      zip_code: input.zip_code || null,
      province: input.province || null,
      contact_name: input.contact_name || null,
      email: input.email,
      phone: input.phone || null,
      website: input.website || null,
      status: input.status,
    })
    .select('id')
    .single()

  if (agencyError) {
    // Rollback: delete auth user
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, error: `Errore creazione agenzia: ${agencyError.message}` }
  }

  // 3. Insert user_roles
  await supabase.from('user_roles').insert({ user_id: userId, role: 'agency' })

  // 4. Send welcome email
  try {
    await sendTransactionalEmail(
      { email: input.email, name: input.business_name },
      'Il tuo account MishaTravel è stato creato',
      agencyCreatedByAdminEmail(input.business_name)
    )
  } catch (e) {
    console.error('Error sending agency created email:', e)
  }

  revalidatePath('/admin/agenzie')
  return { success: true, agencyId: agency.id }
}

/**
 * Mark an agency document as verified.
 * Sends notification + email to the agency.
 */
export async function verifyAgencyDocument(
  documentId: string,
  verifiedBy: string
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('agency_documents')
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy,
    })
    .eq('id', documentId)

  if (error) return { success: false, error: error.message }

  // Fetch agency info to send notification + email
  try {
    const { data: doc } = await supabase
      .from('agency_documents')
      .select('agency_id')
      .eq('id', documentId)
      .single()

    if (doc) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('user_id, business_name, email')
        .eq('id', doc.agency_id)
        .single()

      if (agency) {
        // In-app notification
        await supabase.from('notifications').insert({
          user_id: agency.user_id,
          title: 'Visura camerale verificata',
          message: 'La tua visura camerale è stata verificata con successo. Il tuo account è ora completamente attivo.',
          link: '/agenzia/dashboard',
        })

        // Email notification
        if (agency.email) {
          await sendTransactionalEmail(
            { email: agency.email, name: agency.business_name },
            'Visura camerale verificata - MishaTravel',
            agencyDocumentVerifiedEmail(agency.business_name)
          )
        }
      }
    }
  } catch (e) {
    console.error('Error notifying agency about document verification:', e)
  }

  revalidatePath('/admin/agenzie')
  revalidatePath('/admin')
  return { success: true }
}

// ---------------------------------------------------------------------------
// Account Statements (Estratti Conto)
// ---------------------------------------------------------------------------

const createStatementSchema = z.object({
  agency_id: z.string().uuid(),
  title: z.string().min(1, 'Titolo obbligatorio'),
  file_url: z.string().min(1, 'File obbligatorio'),
  data: z.string().min(1, 'Data obbligatoria'),
  stato: z.string().default('Bozza'),
})

export type CreateStatementInput = z.infer<typeof createStatementSchema>

export async function createAccountStatement(
  formData: unknown
): Promise<ActionResult> {
  const parsed = createStatementSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const { agency_id, title, file_url, data, stato } = parsed.data
  const supabase = createAdminClient()

  try {
    const { data: statement, error } = await supabase
      .from('account_statements')
      .insert({
        agency_id,
        title,
        file_url,
        data,
        stato,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/estratti-conto')
    revalidatePath(`/admin/agenzie/${agency_id}`)
    return { success: true, id: statement.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function deleteAccountStatement(
  statementId: string
): Promise<ActionResult> {
  if (!statementId) {
    return { success: false, error: 'ID estratto conto mancante' }
  }

  const supabase = createAdminClient()

  try {
    const { error } = await supabase
      .from('account_statements')
      .delete()
      .eq('id', statementId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/estratti-conto')
    revalidatePath('/admin/agenzie')
    return { success: true, id: statementId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}

export async function sendAccountStatementEmail(
  statementId: string
): Promise<ActionResult> {
  if (!statementId) {
    return { success: false, error: 'ID estratto conto mancante' }
  }

  const supabase = createAdminClient()

  try {
    // Fetch statement + agency data
    const { data: statement, error: fetchError } = await supabase
      .from('account_statements')
      .select('id, title, file_url, agency_id')
      .eq('id', statementId)
      .single()

    if (fetchError || !statement) {
      return { success: false, error: 'Estratto conto non trovato' }
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('business_name, email')
      .eq('id', statement.agency_id)
      .single()

    if (!agency?.email) {
      return { success: false, error: 'Email agenzia non disponibile' }
    }

    // Send email with link to download
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mishatravel.com'
    const emailSent = await sendTransactionalEmail(
      { email: agency.email, name: agency.business_name },
      `Estratto conto: ${statement.title} - MishaTravel`,
      `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px;width:100%;">
<tr><td style="padding:24px 32px;text-align:center;border-bottom:2px solid #C41E2F;">
<img src="${SITE_URL}/images/logo/logo-logo.png" alt="MishaTravel" width="200" style="display:block;margin:0 auto;max-width:200px;height:auto;"/>
</td></tr>
<tr><td style="padding:32px;">
<h2 style="margin:0 0 16px;color:#333;font-size:22px;">Estratto conto disponibile</h2>
<p style="color:#334155;font-size:15px;line-height:1.7;">Gentile <strong>${agency.business_name}</strong>,</p>
<p style="color:#334155;font-size:15px;line-height:1.7;">Il tuo estratto conto <strong>&ldquo;${statement.title}&rdquo;</strong> &egrave; disponibile nella tua area riservata.</p>
<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background:#C41E2F;border-radius:6px;">
<a href="${SITE_URL}/agenzia/estratto-conto" style="display:inline-block;padding:12px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;">Vai all'estratto conto</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;">
<p style="font-size:12px;color:#64748b;"><strong style="color:#C41E2F;">MishaTravel S.r.l.</strong><br/>info@mishatravel.com</p>
</td></tr>
</table></td></tr></table></body></html>`
    )

    if (!emailSent) {
      return { success: false, error: 'Invio email fallito' }
    }

    // Update stato to 'Inviato via Mail'
    await supabase
      .from('account_statements')
      .update({ stato: 'Inviato via Mail' })
      .eq('id', statementId)

    revalidatePath('/admin/estratti-conto')
    revalidatePath(`/admin/agenzie/${statement.agency_id}`)
    return { success: true, id: statementId }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore sconosciuto',
    }
  }
}
