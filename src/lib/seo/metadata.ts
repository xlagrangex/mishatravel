import type { Metadata } from 'next'

const BASE_URL = 'https://www.mishatravel.com'
const SITE_NAME = 'MishaTravel'
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.jpg`

// ---------------------------------------------------------------------------
// Base / Default metadata
// ---------------------------------------------------------------------------

export function generateBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: 'MishaTravel - Tour Operator | Viaggi Culturali e Crociere Fluviali',
      template: '%s | MishaTravel - Tour Operator',
    },
    description:
      'MishaTravel: tour operator italiano specializzato in viaggi culturali, grandi itinerari e crociere fluviali. Scopri le nostre destinazioni in Europa, Asia, America Latina e Africa.',
    keywords: [
      'tour operator',
      'viaggi culturali',
      'crociere fluviali',
      'MishaTravel',
      'itinerari',
      'viaggi organizzati',
      'tour di gruppo',
      'crociere',
      'viaggi Europa',
      'viaggi Asia',
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: BASE_URL,
      siteName: SITE_NAME,
      title: 'MishaTravel - Tour Operator | Viaggi Culturali e Crociere Fluviali',
      description:
        'Tour operator italiano specializzato in viaggi culturali, grandi itinerari e crociere fluviali.',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'MishaTravel - Tour Operator',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MishaTravel - Tour Operator',
      description:
        'Tour operator italiano specializzato in viaggi culturali, grandi itinerari e crociere fluviali.',
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: BASE_URL,
    },
  }
}

// ---------------------------------------------------------------------------
// Tour metadata
// ---------------------------------------------------------------------------

type TourForMeta = {
  title: string
  slug: string
  content?: string | null
  meta_title?: string | null
  meta_description?: string | null
  cover_image_url?: string | null
  durata_notti?: string | null
  destination?: { name?: string } | null
}

export function generateTourMetadata(tour: TourForMeta): Metadata {
  const title = tour.meta_title || tour.title
  const destinationName = tour.destination?.name ?? ''
  const description =
    tour.meta_description ||
    `Scopri il tour "${tour.title}"${destinationName ? ` in ${destinationName}` : ''}${tour.durata_notti ? ` - ${tour.durata_notti}` : ''}. Prenota con MishaTravel, tour operator specializzato in viaggi culturali.`
  const image = tour.cover_image_url || DEFAULT_OG_IMAGE
  const url = `${BASE_URL}/tours/${tour.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: tour.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// ---------------------------------------------------------------------------
// Cruise metadata
// ---------------------------------------------------------------------------

type CruiseForMeta = {
  title: string
  slug: string
  content?: string | null
  meta_title?: string | null
  meta_description?: string | null
  cover_image_url?: string | null
  durata_notti?: string | null
  ship?: { name?: string } | null
  destination?: { name?: string } | null
}

export function generateCruiseMetadata(cruise: CruiseForMeta): Metadata {
  const title = cruise.meta_title || cruise.title
  const shipName = cruise.ship?.name ?? ''
  const destinationName = cruise.destination?.name ?? ''
  const description =
    cruise.meta_description ||
    `Crociera fluviale "${cruise.title}"${destinationName ? ` in ${destinationName}` : ''}${shipName ? ` a bordo della ${shipName}` : ''}${cruise.durata_notti ? ` - ${cruise.durata_notti}` : ''}. Prenota con MishaTravel.`
  const image = cruise.cover_image_url || DEFAULT_OG_IMAGE
  const url = `${BASE_URL}/crociere/${cruise.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: cruise.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// ---------------------------------------------------------------------------
// Destination metadata
// ---------------------------------------------------------------------------

type DestinationForMeta = {
  name: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
}

export function generateDestinationMetadata(
  destination: DestinationForMeta
): Metadata {
  const title = `Viaggi in ${destination.name}`
  const description =
    destination.description ||
    `Scopri tutti i tour e le crociere fluviali in ${destination.name}. MishaTravel, tour operator specializzato in viaggi culturali e grandi itinerari.`
  const image = destination.cover_image_url || DEFAULT_OG_IMAGE
  const url = `${BASE_URL}/destinazioni/${destination.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Viaggi in ${destination.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// ---------------------------------------------------------------------------
// Blog post metadata
// ---------------------------------------------------------------------------

type BlogPostForMeta = {
  title: string
  slug: string
  excerpt?: string | null
  meta_title?: string | null
  meta_description?: string | null
  cover_image_url?: string | null
  published_at?: string | null
  category?: { name?: string } | null
}

export function generateBlogPostMetadata(post: BlogPostForMeta): Metadata {
  const title = post.meta_title || post.title
  const description =
    post.meta_description ||
    post.excerpt ||
    `Leggi "${post.title}" sul blog di MishaTravel. Consigli di viaggio, guide e ispirazioni per i tuoi prossimi itinerari.`
  const image = post.cover_image_url || DEFAULT_OG_IMAGE
  const url = `${BASE_URL}/blog/${post.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type: 'article',
      ...(post.published_at && {
        publishedTime: post.published_at,
      }),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// ---------------------------------------------------------------------------
// Ship metadata
// ---------------------------------------------------------------------------

type ShipForMeta = {
  name: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
}

export function generateShipMetadata(ship: ShipForMeta): Metadata {
  const title = ship.name
  const descriptionText =
    ship.description?.replace(/<[^>]*>/g, '').slice(0, 160) || ''
  const description =
    descriptionText ||
    `Scopri la nave ${ship.name}. Dettagli su cabine, servizi e crociere disponibili con MishaTravel.`
  const image = ship.cover_image_url || DEFAULT_OG_IMAGE
  const url = `${BASE_URL}/flotta/${ship.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ship.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}
