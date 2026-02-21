const BASE_URL = 'https://www.mishatravel.com'

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MishaTravel',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description:
      'Tour operator italiano specializzato in viaggi culturali, grandi itinerari e crociere fluviali.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IT',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Italian'],
    },
  }
}

// ---------------------------------------------------------------------------
// TouristTrip (for tours)
// ---------------------------------------------------------------------------

type TourForSchema = {
  title: string
  slug: string
  content?: string | null
  cover_image_url?: string | null
  durata_notti?: string | null
  a_partire_da?: string | null
  destination?: { name?: string } | null
  itinerary_days?: { numero_giorno: string; localita: string; descrizione: string }[]
}

export function tourTripSchema(tour: TourForSchema) {
  const description = tour.content
    ? tour.content.replace(/<[^>]*>/g, '').slice(0, 500)
    : `Tour "${tour.title}" con MishaTravel.`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description,
    url: `${BASE_URL}/tours/${tour.slug}`,
    touristType: 'Cultural Tourist',
    provider: {
      '@type': 'Organization',
      name: 'MishaTravel',
      url: BASE_URL,
    },
  }

  if (tour.cover_image_url) {
    schema.image = tour.cover_image_url
  }

  if (tour.destination?.name) {
    schema.itinerary = {
      '@type': 'Place',
      name: tour.destination.name,
    }
  }

  if (tour.a_partire_da) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: tour.a_partire_da,
      availability: 'https://schema.org/InStock',
    }
  }

  return schema
}

// ---------------------------------------------------------------------------
// BoatTrip (for cruises)
// ---------------------------------------------------------------------------

type CruiseForSchema = {
  title: string
  slug: string
  content?: string | null
  cover_image_url?: string | null
  durata_notti?: string | null
  a_partire_da?: string | null
  ship?: { name?: string } | null
  destination?: { name?: string } | null
}

export function boatTripSchema(cruise: CruiseForSchema) {
  const description = cruise.content
    ? cruise.content.replace(/<[^>]*>/g, '').slice(0, 500)
    : `Crociera fluviale "${cruise.title}" con MishaTravel.`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BoatTrip',
    name: cruise.title,
    description,
    url: `${BASE_URL}/crociere/${cruise.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'MishaTravel',
      url: BASE_URL,
    },
  }

  if (cruise.cover_image_url) {
    schema.image = cruise.cover_image_url
  }

  if (cruise.destination?.name) {
    schema.arrivalBoatTerminal = {
      '@type': 'BoatTerminal',
      name: cruise.destination.name,
    }
    schema.departureBoatTerminal = {
      '@type': 'BoatTerminal',
      name: cruise.destination.name,
    }
  }

  if (cruise.a_partire_da) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: cruise.a_partire_da,
      availability: 'https://schema.org/InStock',
    }
  }

  return schema
}

// ---------------------------------------------------------------------------
// Article (for blog posts)
// ---------------------------------------------------------------------------

type BlogPostForSchema = {
  title: string
  slug: string
  content?: string | null
  excerpt?: string | null
  cover_image_url?: string | null
  published_at?: string | null
  created_at: string
  updated_at: string
  category?: { name?: string } | null
}

export function articleSchema(post: BlogPostForSchema) {
  const description = post.excerpt
    || (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 300) : '')
    || `Articolo "${post.title}" dal blog di MishaTravel.`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: 'MishaTravel',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MishaTravel',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  }

  if (post.cover_image_url) {
    schema.image = post.cover_image_url
  }

  if (post.category?.name) {
    schema.articleSection = post.category.name
  }

  return schema
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

type BreadcrumbItem = {
  name: string
  url: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
      })),
    ],
  }
}
