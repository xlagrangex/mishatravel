export interface CookieConsent {
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: 1
}

const COOKIE_NAME = "mt_cookie_consent"
const MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

export function createConsent(
  analytics: boolean,
  marketing: boolean
): CookieConsent {
  return {
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version: 1,
  }
}

export function readConsentCookie(): CookieConsent | null {
  if (typeof document === "undefined") return null

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))

  if (!match) return null

  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="))
    const parsed = JSON.parse(value)

    if (
      parsed &&
      parsed.necessary === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean" &&
      typeof parsed.timestamp === "string" &&
      parsed.version === 1
    ) {
      return parsed as CookieConsent
    }
  } catch {
    // Invalid cookie — treat as no consent
  }

  return null
}

export function writeConsentCookie(consent: CookieConsent): void {
  if (typeof document === "undefined") return

  const value = encodeURIComponent(JSON.stringify(consent))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${MAX_AGE}; path=/; SameSite=Lax; Secure`
}
