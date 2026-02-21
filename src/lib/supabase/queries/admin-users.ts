import { createAdminClient } from '../admin'
import type { UserRoleType, OperatorSection } from '@/lib/types'

// ---------------------------------------------------------------------------
// Admin Users Query Functions
// Uses service_role client to bypass RLS and access auth.users
// ---------------------------------------------------------------------------

export interface AdminUserListItem {
  id: string
  email: string
  display_name: string | null
  role: UserRoleType | null
  permissions: OperatorSection[]
  last_sign_in_at: string | null
  created_at: string
  is_active: boolean
}

/**
 * Get all admin users (super_admin, admin, operator) with their roles and permissions.
 * Does NOT include agency users (they are managed in the agenzie section).
 */
export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const supabase = createAdminClient()

  // Get all user_roles that are admin types
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('role', ['super_admin', 'admin', 'operator'])

  if (rolesError) throw new Error(`Errore caricamento ruoli: ${rolesError.message}`)
  if (!roles || roles.length === 0) return []

  const userIds = roles.map(r => r.user_id)

  // Get permissions for operators
  const { data: permissions, error: permError } = await supabase
    .from('operator_permissions')
    .select('user_id, section')
    .in('user_id', userIds)

  if (permError) throw new Error(`Errore caricamento permessi: ${permError.message}`)

  // Build permissions map
  const permMap = new Map<string, OperatorSection[]>()
  for (const p of permissions ?? []) {
    const existing = permMap.get(p.user_id) ?? []
    existing.push(p.section as OperatorSection)
    permMap.set(p.user_id, existing)
  }

  // Get auth user data via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) throw new Error(`Errore caricamento utenti auth: ${authError.message}`)

  const authUsers = authData?.users ?? []
  const authMap = new Map(authUsers.map(u => [u.id, u]))

  // Build the list
  const result: AdminUserListItem[] = roles.map(role => {
    const authUser = authMap.get(role.user_id)
    return {
      id: role.user_id,
      email: authUser?.email ?? 'email sconosciuta',
      display_name: (authUser?.user_metadata?.display_name as string) ?? (authUser?.user_metadata?.full_name as string) ?? null,
      role: role.role as UserRoleType,
      permissions: permMap.get(role.user_id) ?? [],
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      created_at: authUser?.created_at ?? '',
      is_active: !(authUser?.banned_until),
    }
  })

  return result.sort((a, b) => {
    const roleOrder: Record<string, number> = { super_admin: 0, admin: 1, operator: 2 }
    return (roleOrder[a.role ?? ''] ?? 99) - (roleOrder[b.role ?? ''] ?? 99)
  })
}

/**
 * Get a single admin user by ID.
 */
export async function getAdminUserById(userId: string): Promise<AdminUserListItem | null> {
  const supabase = createAdminClient()

  const [roleResult, permResult, authResult] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    supabase.from('operator_permissions').select('section').eq('user_id', userId),
    supabase.auth.admin.getUserById(userId),
  ])

  if (roleResult.error || !roleResult.data) return null

  const authUser = authResult.data?.user
  return {
    id: userId,
    email: authUser?.email ?? 'email sconosciuta',
    display_name: (authUser?.user_metadata?.display_name as string) ?? (authUser?.user_metadata?.full_name as string) ?? null,
    role: roleResult.data.role as UserRoleType,
    permissions: (permResult.data ?? []).map(p => p.section as OperatorSection),
    last_sign_in_at: authUser?.last_sign_in_at ?? null,
    created_at: authUser?.created_at ?? '',
    is_active: !(authUser?.banned_until),
  }
}

/**
 * Get user stats.
 */
export async function getUserStats(): Promise<{
  total: number
  superAdmins: number
  admins: number
  operators: number
}> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .in('role', ['super_admin', 'admin', 'operator'])

  if (error) throw new Error(`Errore stats utenti: ${error.message}`)

  const roles = data ?? []
  return {
    total: roles.length,
    superAdmins: roles.filter(r => r.role === 'super_admin').length,
    admins: roles.filter(r => r.role === 'admin').length,
    operators: roles.filter(r => r.role === 'operator').length,
  }
}
