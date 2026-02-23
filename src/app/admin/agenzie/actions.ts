'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import { agencyApprovedEmail, agencyCreatedByAdminEmail } from '@/lib/email/templates'

type ActionResult = { success: true } | { success: false; error: string }

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

  revalidatePath('/admin/agenzie')
  return { success: true }
}
