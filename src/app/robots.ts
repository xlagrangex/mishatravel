import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/agenzia',
          '/agenzia/',
          '/account-in-attesa',
          '/login',
          '/registrazione',
          '/reset',
        ],
      },
    ],
    sitemap: 'https://www.mishatravel.com/sitemap.xml',
  }
}
