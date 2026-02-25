"use client"

import { Cookie } from "lucide-react"
import { useCookieConsent } from "./CookieConsentProvider"

export default function CookieSettingsButton() {
  const { openBanner } = useCookieConsent()

  return (
    <button
      onClick={openBanner}
      className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition-colors duration-300"
    >
      <Cookie className="size-3.5" />
      Gestisci Cookie
    </button>
  )
}
