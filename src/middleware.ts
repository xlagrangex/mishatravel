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
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // -------------------------------------------------------------------------
  // 2. Route protection
  // -------------------------------------------------------------------------
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isAgencyRoute = pathname.startsWith('/agenzia')

  // Only protect /admin and /agenzia routes
  if (!isAdminRoute && !isAgencyRoute) {
    return supabaseResponse
  }

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
  }

  // --- /agenzia/* route checks ---
  if (isAgencyRoute) {
    if (userRole !== 'agency') {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(homeUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
