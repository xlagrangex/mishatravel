import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/brevo'
import { accountExpiredEmail } from '@/lib/email/templates'

/**
 * POST /api/agency/expire
 * Called from the /account-scaduto page to delete an expired agency account.
 * The user must be authenticated (session cookie).
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Get the agency to verify it's actually expired
  const { data: agency } = await admin
    .from('agencies')
    .select('id, user_id, business_name, email, status, created_at')
    .eq('user_id', user.id)
    .single()

  if (!agency) {
    return NextResponse.json({ error: 'No agency found' }, { status: 404 })
  }

  // Only auto-delete pending agencies past the 7-day deadline
  if (agency.status !== 'pending') {
    return NextResponse.json({ error: 'Agency is not pending' }, { status: 400 })
  }

  const createdAt = new Date(agency.created_at)
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  if (Date.now() - createdAt.getTime() <= sevenDaysMs) {
    return NextResponse.json({ error: 'Deadline not yet passed' }, { status: 400 })
  }

  // Check if they uploaded a document
  const { count } = await admin
    .from('agency_documents')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agency.id)
    .eq('document_type', 'visura_camerale')

  if (count && count > 0) {
    return NextResponse.json({ error: 'Document already uploaded' }, { status: 400 })
  }

  // Send expiration email before deletion
  try {
    if (agency.email) {
      await sendTransactionalEmail(
        { email: agency.email, name: agency.business_name },
        'Account MishaTravel eliminato',
        accountExpiredEmail(agency.business_name)
      )
    }
  } catch (e) {
    console.error('Error sending account expired email:', e)
  }

  // Hard-delete auth user so the email can be re-registered
  //   CASCADE deletes agencies + user_roles via FK
  await admin.auth.admin.deleteUser(agency.user_id, false)
  await admin.from('user_roles').delete().eq('user_id', agency.user_id)

  return NextResponse.json({ success: true })
}
