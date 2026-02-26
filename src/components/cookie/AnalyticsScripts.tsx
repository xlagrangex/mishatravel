"use client"

import Script from "next/script"
import type { CookieConsent } from "@/lib/cookie-consent"

interface AnalyticsScriptsProps {
  consent: CookieConsent | null
}

export default function AnalyticsScripts({ consent }: AnalyticsScriptsProps) {
  if (!consent) return null

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  return (
    <>
      {/* Umami Analytics (cookieless, self-hosted) */}
      {consent.analytics && umamiUrl && umamiWebsiteId && (
        <Script
          src={`${umamiUrl}/script.js`}
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
        />
      )}

      {/* Google Analytics 4 */}
      {consent.analytics && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {consent.marketing && pixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
