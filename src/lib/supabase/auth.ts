import { createClient } from '@/lib/supabase/server'
import type { UserRoleType, OperatorSection } from '@/lib/types'

/**
 * Get the current authenticated user (server-side).
 * Uses getUser() which validates the JWT with Supabase Auth server.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/**
 * Get user role from user_roles table.
 * Returns null if no role record exists.
 */
export async function getUserRole(userId: string): Promise<UserRoleType | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as UserRoleType
}

/**
 * Get operator permissions (which admin sections they can access).
 * Returns an empty array if no permissions are found.
 */
export async function getUserPermissions(userId: string): Promise<OperatorSection[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('operator_permissions')
    .select('section')
    .eq('user_id', userId)

  if (error || !data) return []
  return data.map(d => d.section as OperatorSection)
}

/**
 * Combined helper that returns the full auth context in one call.
 * Useful for server components and server actions that need user + role + permissions.
 */
export async function getAuthContext() {
  const user = await getCurrentUser()
  if (!user) {
    return { user: null, role: null, permissions: [] as OperatorSection[] }
  }

  const role = await getUserRole(user.id)
  const permissions = role === 'operator'
    ? await getUserPermissions(user.id)
    : [] as OperatorSection[]

  return { user, role, permissions }
}
