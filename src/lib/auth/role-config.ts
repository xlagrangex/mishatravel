import type { OperatorSection, UserRoleType } from '@/lib/types'

/**
 * Maps admin URL path segments to operator permission section names.
 * Used by middleware to check if an operator has access to a specific admin section.
 */
export const SECTION_MAP: Record<string, OperatorSection> = {
  'tours': 'tours',
  'crociere': 'cruises',
  'flotta': 'fleet',
  'partenze': 'departures',
  'destinazioni': 'destinations',
  'agenzie': 'agencies',
  'preventivi': 'quotes',
  'blog': 'blog',
  'cataloghi': 'catalogs',
  'media': 'media',
  'utenti': 'users_readonly',
  'estratti-conto': 'account_statements',
}

/** Roles allowed to access /admin/* routes */
export const ADMIN_ROLES: readonly UserRoleType[] = ['super_admin', 'admin', 'operator'] as const

/** Route prefixes that require authentication */
export const PROTECTED_PREFIXES = ['/admin', '/agenzia'] as const

/** Public routes that should never be protected */
export const PUBLIC_ROUTES = [
  '/login',
  '/registrazione',
  '/reset',
  '/contatti',
  '/diventa-partner',
  '/trova-agenzia',
  '/privacy-policy',
  '/cookie-policy',
  '/termini-condizioni',
  '/gdpr',
  '/reclami',
] as const
