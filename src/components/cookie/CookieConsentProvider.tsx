"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  type CookieConsent,
  createConsent,
  readConsentCookie,
  writeConsentCookie,
} from "@/lib/cookie-consent"
import CookieConsentBanner from "./CookieConsentBanner"
import AnalyticsScripts from "./AnalyticsScripts"

interface CookieConsentContextValue {
  consent: CookieConsent | null
  hasConsented: boolean
  showBanner: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (analytics: boolean, marketing: boolean) => void
  openBanner: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  hasConsented: false,
  showBanner: false,
  acceptAll: () => {},
  rejectNonEssential: () => {},
  savePreferences: () => {},
  openBanner: () => {},
})

export function useCookieConsent() {
  return useContext(CookieConsentContext)
}

export default function CookieConsentProvider({
  children,
}: {
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setMounted(true)
    const existing = readConsentCookie()
    if (existing) {
      setConsent(existing)
    } else {
      setShowBanner(true)
    }
  }, [])

  const save = useCallback((c: CookieConsent) => {
    writeConsentCookie(c)
    setConsent(c)
    setShowBanner(false)
  }, [])

  const acceptAll = useCallback(() => {
    save(createConsent(true, true))
  }, [save])

  const rejectNonEssential = useCallback(() => {
    save(createConsent(false, false))
  }, [save])

  const savePreferences = useCallback(
    (analytics: boolean, marketing: boolean) => {
      save(createConsent(analytics, marketing))
    },
    [save]
  )

  const openBanner = useCallback(() => {
    setShowBanner(true)
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented: consent !== null,
        showBanner,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openBanner,
      }}
    >
      {children}
      {mounted && showBanner && (
        <CookieConsentBanner
          consent={consent}
          onAcceptAll={acceptAll}
          onRejectNonEssential={rejectNonEssential}
          onSavePreferences={savePreferences}
          onClose={() => setShowBanner(false)}
        />
      )}
      {mounted && <AnalyticsScripts consent={consent} />}
    </CookieConsentContext.Provider>
  )
}
