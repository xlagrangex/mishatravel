import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mdkftenubglujztifjqs.supabase.co",
      },
      {
        protocol: "https",
        hostname: "mishatravel.com",
      },
    ],
  },

  async redirects() {
    return [
      // =============================================================
      // WordPress → Next.js 301 Redirects (mishatravel.com migration)
      // =============================================================

      // --- STRUCTURAL CHANGES: imbarcazioni → flotta ---
      // Listing page
      {
        source: "/imbarcazioni",
        destination: "/flotta",
        permanent: true,
      },
      {
        source: "/imbarcazioni/",
        destination: "/flotta",
        permanent: true,
      },
      // All imbarcazioni detail pages → flotta (pattern-based, covers all slugs)
      {
        source: "/imbarcazioni/:slug",
        destination: "/flotta/:slug",
        permanent: true,
      },

      // --- STRUCTURAL CHANGES: root blog posts → /blog/ ---
      // In WordPress, blog posts lived at root level (mishatravel.com/slug/).
      // In Next.js, they live under /blog/slug.
      // These are all published WP posts (post_type: "post").
      {
        source: "/uzbekistan-dorato",
        destination: "/blog/uzbekistan-dorato",
        permanent: true,
      },
      {
        source: "/cappadocia-tra-rocce-mozzafiato-e-viaggi-nel-tempo",
        destination: "/blog/cappadocia-tra-rocce-mozzafiato-e-viaggi-nel-tempo",
        permanent: true,
      },
      {
        source: "/petra-una-luce-tra-kanyon-color-rosa",
        destination: "/blog/petra-una-luce-tra-kanyon-color-rosa",
        permanent: true,
      },
      {
        source: "/antica-troia-tra-mito-ed-archeologia",
        destination: "/blog/antica-troia-tra-mito-ed-archeologia",
        permanent: true,
      },
      {
        source: "/in-viaggio-tra-le-polis-dellantica-grecia",
        destination: "/blog/in-viaggio-tra-le-polis-dellantica-grecia",
        permanent: true,
      },

      // --- STRUCTURAL CHANGES: locandine → cataloghi ---
      {
        source: "/locandine",
        destination: "/cataloghi",
        permanent: true,
      },
      {
        source: "/locandine/",
        destination: "/cataloghi",
        permanent: true,
      },

      // --- WORDPRESS CATEGORY PAGES → /blog ---
      // WP categories: top-destinazioni, news-e-aggiornamenti-operativi,
      // opportunita-di-mercato, pacchetti-esclusivi-misha-travel,
      // documenti-e-assicurazioni, viaggi-speciali-e-tematici, uncategorized
      {
        source: "/category/:slug",
        destination: "/blog",
        permanent: true,
      },

      // --- WORDPRESS CUSTOM TAXONOMY: destinazione → /destinazioni ---
      // WP had /destinazione/africa/, /destinazione/europa/, etc.
      {
        source: "/destinazione/:slug",
        destination: "/destinazioni",
        permanent: true,
      },

      // --- PAGE RENAMES AND RESTRUCTURING ---
      // WP agency dashboard pages → Next.js area agenzia
      {
        source: "/pannello-di-controllo",
        destination: "/agenzia/dashboard",
        permanent: true,
      },
      {
        source: "/pannello-di-controllo/",
        destination: "/agenzia/dashboard",
        permanent: true,
      },
      {
        source: "/pannello-di-controllo-misha-travel",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/pannello-di-controllo-misha-travel/",
        destination: "/admin",
        permanent: true,
      },
      // WP /partner/ → Next.js /diventa-partner/
      {
        source: "/partner",
        destination: "/diventa-partner",
        permanent: true,
      },
      {
        source: "/partner/",
        destination: "/diventa-partner",
        permanent: true,
      },
      // WP standalone cruise promo page → crociere listing
      {
        source: "/delizie-di-tutto-il-danubio",
        destination: "/crociere",
        permanent: true,
      },
      {
        source: "/delizie-di-tutto-il-danubio/",
        destination: "/crociere",
        permanent: true,
      },
      // WP thank-you page → homepage
      {
        source: "/grazie-prenotazione",
        destination: "/",
        permanent: true,
      },
      {
        source: "/grazie-prenotazione/",
        destination: "/",
        permanent: true,
      },
      // WP /disclaimer/ → Next.js /termini-condizioni/
      {
        source: "/disclaimer",
        destination: "/termini-condizioni",
        permanent: true,
      },
      {
        source: "/disclaimer/",
        destination: "/termini-condizioni",
        permanent: true,
      },

      // --- TRAILING SLASH NORMALIZATION ---
      // Remove trailing slashes from all major content sections.
      // Next.js by default does NOT use trailing slashes, so
      // old WP links with trailing slashes need to redirect.
      {
        source: "/tours/:slug/",
        destination: "/tours/:slug",
        permanent: true,
      },
      {
        source: "/crociere/:slug/",
        destination: "/crociere/:slug",
        permanent: true,
      },
      {
        source: "/destinazioni/:slug/",
        destination: "/destinazioni/:slug",
        permanent: true,
      },
      {
        source: "/flotta/:slug/",
        destination: "/flotta/:slug",
        permanent: true,
      },
      {
        source: "/blog/:slug/",
        destination: "/blog/:slug",
        permanent: true,
      },
      // Listing pages trailing slash
      {
        source: "/tours/",
        destination: "/tours",
        permanent: true,
      },
      {
        source: "/crociere/",
        destination: "/crociere",
        permanent: true,
      },
      {
        source: "/destinazioni/",
        destination: "/destinazioni",
        permanent: true,
      },
      {
        source: "/flotta/",
        destination: "/flotta",
        permanent: true,
      },
      {
        source: "/blog/",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/cataloghi/",
        destination: "/cataloghi",
        permanent: true,
      },
      {
        source: "/calendario-partenze/",
        destination: "/calendario-partenze",
        permanent: true,
      },
      // Static pages trailing slash
      {
        source: "/contatti/",
        destination: "/contatti",
        permanent: true,
      },
      {
        source: "/diventa-partner/",
        destination: "/diventa-partner",
        permanent: true,
      },
      {
        source: "/trova-agenzia/",
        destination: "/trova-agenzia",
        permanent: true,
      },
      {
        source: "/login/",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/registrazione/",
        destination: "/registrazione",
        permanent: true,
      },
      {
        source: "/reset/",
        destination: "/reset",
        permanent: true,
      },
      {
        source: "/privacy-policy/",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookie-policy/",
        destination: "/cookie-policy",
        permanent: true,
      },
      {
        source: "/termini-condizioni/",
        destination: "/termini-condizioni",
        permanent: true,
      },
      {
        source: "/documenti-di-viaggio/",
        destination: "/documenti-di-viaggio",
        permanent: true,
      },
      {
        source: "/come-prenotare-guida-completa/",
        destination: "/come-prenotare-guida-completa",
        permanent: true,
      },
      {
        source: "/fondo-di-garanzia/",
        destination: "/fondo-di-garanzia",
        permanent: true,
      },
      {
        source: "/coperture-assicurative/",
        destination: "/coperture-assicurative",
        permanent: true,
      },

      // --- WORDPRESS ATTACHMENT/MEDIA SUBPAGES ---
      // WP created sub-URLs under imbarcazioni for image attachments
      // (e.g., /imbarcazioni/ms-river-sapphire-5/river-sapphire_cabin-17/)
      // Redirect these to the corresponding ship page in /flotta/
      {
        source: "/imbarcazioni/:slug/:attachment",
        destination: "/flotta/:slug",
        permanent: true,
      },

      // WP created sub-URLs under crociere for images/attachments
      {
        source: "/crociere/:slug/:attachment",
        destination: "/crociere/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
