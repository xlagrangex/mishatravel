import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = 'https://www.mishatravel.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  // Fetch all published content slugs in parallel
  const [toursRes, cruisesRes, destinationsRes, blogRes, shipsRes] =
    await Promise.all([
      supabase
        .from('tours')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('cruises')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('destinations')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('ships')
        .select('slug, updated_at')
        .eq('status', 'published'),
    ])

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/tours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/crociere`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/flotta`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/destinazioni`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/calendario-partenze`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cataloghi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contatti`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/chi-siamo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/diventa-partner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/trova-agenzia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termini-condizioni`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/condizioni-vendita`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cancellazioni-e-penali`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/coperture-assicurative`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/documenti-di-viaggio`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/fondo-di-garanzia`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/come-prenotare-guida-completa`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/guida-agenzie`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/gdpr`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/reclami`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic tour pages
  const tourPages: MetadataRoute.Sitemap = (toursRes.data ?? []).map(
    (tour) => ({
      url: `${BASE_URL}/tours/${tour.slug}`,
      lastModified: new Date(tour.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  )

  // Dynamic cruise pages
  const cruisePages: MetadataRoute.Sitemap = (cruisesRes.data ?? []).map(
    (cruise) => ({
      url: `${BASE_URL}/crociere/${cruise.slug}`,
      lastModified: new Date(cruise.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  )

  // Dynamic destination pages
  const destinationPages: MetadataRoute.Sitemap = (
    destinationsRes.data ?? []
  ).map((dest) => ({
    url: `${BASE_URL}/destinazioni/${dest.slug}`,
    lastModified: new Date(dest.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = (blogRes.data ?? []).map(
    (post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  )

  // Dynamic ship pages
  const shipPages: MetadataRoute.Sitemap = (shipsRes.data ?? []).map(
    (ship) => ({
      url: `${BASE_URL}/flotta/${ship.slug}`,
      lastModified: new Date(ship.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })
  )

  return [
    ...staticPages,
    ...tourPages,
    ...cruisePages,
    ...destinationPages,
    ...blogPages,
    ...shipPages,
  ]
}
