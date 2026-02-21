"use client"

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserRoleType, OperatorSection } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  role: UserRoleType | null
  permissions: OperatorSection[]
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  permissions: [],
})

interface AuthProviderProps {
  user: User | null
  role: UserRoleType | null
  permissions: OperatorSection[]
  children: ReactNode
}

/**
 * Client-side auth context provider.
 * Receives initial auth data from a server component and makes it available
 * to all client components via the useAuth() hook.
 *
 * Usage in a server layout:
 *   const { user, role, permissions } = await getAuthContext()
 *   return <AuthProvider user={user} role={role} permissions={permissions}>...</AuthProvider>
 *
 * Usage in a client component:
 *   const { user, role, permissions } = useAuth()
 */
export function AuthProvider({ user, role, permissions, children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ user, role, permissions }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access the current auth context from any client component.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  return context
}
