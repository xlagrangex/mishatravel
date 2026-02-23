import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin URL path segments mapped to operator permission sections.
 * Duplicated here because middleware runs on the Edge Runtime and cannot
 * import from files that use Node.js-only APIs or path aliases.
 */
const SECTION_MAP: Record<string, string> = {
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

const ADMIN_ROLES = ['super_admin', 'admin', 'operator']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isAgencyRoute = pathname.startsWith('/agenzia')

  // For non-protected routes, just pass through without Supabase
  if (!isAdminRoute && !isAgencyRoute) {
    return NextResponse.next({ request })
  }

  // Ensure env vars are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: missing Supabase env vars')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // -------------------------------------------------------------------------
  // 1. Refresh session token (existing logic - must run on every request)
  // -------------------------------------------------------------------------
  const { data: { user } } = await supabase.auth.getUser()

  // --- Not authenticated: redirect to login ---
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // --- Fetch user role from user_roles table ---
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // If we cannot determine the role (table missing, no record, RLS blocking, etc.),
  // treat the user as having no role. For protected routes this means redirect.
  // Being permissive: if there is a DB error we log it but still enforce protection.
  if (roleError || !roleData) {
    // No role record -> cannot access protected routes
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    homeUrl.searchParams.set('error', 'no_role')
    return NextResponse.redirect(homeUrl)
  }

  const userRole = roleData.role as string

  // --- /admin/* route checks ---
  if (isAdminRoute) {
    if (!ADMIN_ROLES.includes(userRole)) {
      // Authenticated but not an admin/operator role -> redirect home
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(homeUrl)
    }

    // Operators need per-section permission checks
    if (userRole === 'operator') {
      // Extract the admin section from the URL: /admin/tours/... -> "tours"
      const segments = pathname.split('/').filter(Boolean) // ['admin', 'tours', ...]
      const sectionSlug = segments[1] // first segment after 'admin'

      // If we're on /admin (dashboard) with no section, allow access
      if (sectionSlug && sectionSlug in SECTION_MAP) {
        const requiredSection = SECTION_MAP[sectionSlug]

        const { data: permissions } = await supabase
          .from('operator_permissions')
          .select('section')
          .eq('user_id', user.id)

        const userSections = (permissions ?? []).map(
          (p: { section: string }) => p.section
        )

        if (!userSections.includes(requiredSection)) {
          // Operator doesn't have permission for this section
          const adminUrl = request.nextUrl.clone()
          adminUrl.pathname = '/admin'
          adminUrl.searchParams.set('error', 'no_permission')
          return NextResponse.redirect(adminUrl)
        }
      }
      // If sectionSlug is not in SECTION_MAP (e.g. /admin or /admin/unknown),
      // allow access -- dashboard is available to all admin roles
    }

    // Settings page: super_admin only
    if (userRole !== 'super_admin') {
      const segments = pathname.split('/').filter(Boolean)
      if (segments[1] === 'impostazioni') {
        const adminUrl = request.nextUrl.clone()
        adminUrl.pathname = '/admin'
        adminUrl.searchParams.set('error', 'no_permission')
        return NextResponse.redirect(adminUrl)
      }
    }
  }

  // --- /agenzia/* route checks ---
  if (isAgencyRoute) {
    if (userRole !== 'agency') {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(homeUrl)
    }

    // Check if the agency account is active
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .single()

    if (agencyData && agencyData.status !== 'active') {
      // 7-day document deadline check for pending agencies
      if (agencyData.status === 'pending') {
        const createdAt = new Date(agencyData.created_at)
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
        if (Date.now() - createdAt.getTime() > sevenDaysMs) {
          // Check if visura camerale was uploaded
          const { count } = await supabase
            .from('agency_documents')
            .select('*', { count: 'exact', head: true })
            .eq('agency_id', agencyData.id)
            .eq('document_type', 'visura_camerale')

          if (!count || count === 0) {
            const expiredUrl = request.nextUrl.clone()
            expiredUrl.pathname = '/account-scaduto'
            return NextResponse.redirect(expiredUrl)
          }
        }
      }

      // Agency is pending or blocked - redirect to waiting page
      const waitUrl = request.nextUrl.clone()
      waitUrl.pathname = '/account-in-attesa'
      return NextResponse.redirect(waitUrl)
    }
  }

  return supabaseResponse
  } catch (err) {
    console.error('Middleware error:', err)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
