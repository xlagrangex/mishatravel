'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { OperatorSection, UserRoleType } from '@/lib/types'

type ActionResult = { success: true; id?: string } | { success: false; error: string }

const ALL_SECTIONS: OperatorSection[] = [
  'tours', 'cruises', 'fleet', 'departures', 'destinations',
  'agencies', 'quotes', 'blog', 'catalogs', 'media',
  'users_readonly', 'account_statements',
]

const createUserSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'La password deve avere almeno 8 caratteri'),
  display_name: z.string().min(1, 'Il nome e obbligatorio'),
  role: z.enum(['admin', 'operator'] as const),
  permissions: z.array(z.string()).optional(),
})

/**
 * Create a new admin/operator user.
 */
export async function createAdminUser(
  formData: z.infer<typeof createUserSchema>
): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const supabase = createAdminClient()
  const { email, password, display_name, role, permissions } = parsed.data

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return { success: false, error: 'Questa email e gia registrata.' }
    }
    return { success: false, error: authError.message }
  }

  const userId = authData.user.id

  // 2. Create user_role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

  if (roleError) {
    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, error: `Errore creazione ruolo: ${roleError.message}` }
  }

  // 3. Create operator permissions if role is operator
  if (role === 'operator' && permissions && permissions.length > 0) {
    const validPermissions = permissions.filter(p =>
      ALL_SECTIONS.includes(p as OperatorSection)
    )
    if (validPermissions.length > 0) {
      const permissionRows = validPermissions.map(section => ({
        user_id: userId,
        section,
      }))
      const { error: permError } = await supabase
        .from('operator_permissions')
        .insert(permissionRows)

      if (permError) {
        // Non-fatal: user is created, permissions can be set later
        console.error('Errore creazione permessi:', permError.message)
      }
    }
  }

  revalidatePath('/admin/utenti')
  return { success: true, id: userId }
}

/**
 * Update user role and permissions.
 */
export async function updateUserRole(
  userId: string,
  role: UserRoleType,
  permissions: string[]
): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Update role
  const { error: roleError } = await supabase
    .from('user_roles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (roleError) return { success: false, error: roleError.message }

  // Replace operator permissions
  // First delete all existing
  await supabase
    .from('operator_permissions')
    .delete()
    .eq('user_id', userId)

  // Then insert new ones if operator
  if (role === 'operator' && permissions.length > 0) {
    const validPermissions = permissions.filter(p =>
      ALL_SECTIONS.includes(p as OperatorSection)
    )
    if (validPermissions.length > 0) {
      const { error: permError } = await supabase
        .from('operator_permissions')
        .insert(validPermissions.map(section => ({
          user_id: userId,
          section,
        })))

      if (permError) return { success: false, error: permError.message }
    }
  }

  revalidatePath('/admin/utenti')
  return { success: true }
}

/**
 * Update user display name.
 */
export async function updateUserDisplayName(
  userId: string,
  displayName: string
): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { display_name: displayName },
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/utenti')
  return { success: true }
}

/**
 * Reset user password (generates a new temp password).
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  if (newPassword.length < 8) {
    return { success: false, error: 'La password deve avere almeno 8 caratteri.' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}

/**
 * Deactivate (ban) a user.
 */
export async function deactivateUser(userId: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // ~100 years = effectively permanent
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/utenti')
  return { success: true }
}

/**
 * Reactivate a banned user.
 */
export async function reactivateUser(userId: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/utenti')
  return { success: true }
}

/**
 * Delete a user completely (auth + roles + permissions).
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const supabase = createAdminClient()

  // Delete from user_roles and operator_permissions (cascade should handle it, but be explicit)
  await supabase.from('operator_permissions').delete().eq('user_id', userId)
  await supabase.from('user_roles').delete().eq('user_id', userId)

  // Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/utenti')
  return { success: true }
}
