/**
 * Umami Analytics API wrapper.
 * Server-side only — uses UMAMI_API_URL and UMAMI_API_TOKEN env vars.
 */

const API_URL = process.env.UMAMI_API_URL ?? ""
const API_TOKEN = process.env.UMAMI_API_TOKEN ?? ""
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID ?? ""

// ── Helpers ──────────────────────────────────────────────

async function umamiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}/api${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    next: { revalidate: 300 }, // cache 5 min
  })
  if (!res.ok) {
    throw new Error(`Umami API error ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

function dateRange(period: string): { startAt: string; endAt: string } {
  const now = new Date()
  const endAt = now.getTime().toString()
  let start: Date

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "7d":
      start = new Date(now.getTime() - 7 * 86400000)
      break
    case "30d":
      start = new Date(now.getTime() - 30 * 86400000)
      break
    case "90d":
      start = new Date(now.getTime() - 90 * 86400000)
      break
    default:
      start = new Date(now.getTime() - 30 * 86400000)
  }

  return { startAt: start.getTime().toString(), endAt }
}

// ── Types ────────────────────────────────────────────────

export interface UmamiStats {
  pageviews: { value: number; prev: number }
  visitors: { value: number; prev: number }
  visits: { value: number; prev: number }
  bounces: { value: number; prev: number }
  totaltime: { value: number; prev: number }
}

export interface UmamiPageview {
  x: string // date
  y: number // pageviews
}

export interface UmamiMetric {
  x: string // label (url, referrer, browser, etc.)
  y: number // count
}

export interface UmamiPageviewSeries {
  pageviews: UmamiPageview[]
  sessions: UmamiPageview[]
}

// ── API Functions ────────────────────────────────────────

/** Get summary stats for a period (pageviews, visitors, bounces, avg time) */
export async function getStats(period = "30d"): Promise<UmamiStats> {
  const { startAt, endAt } = dateRange(period)
  return umamiGet<UmamiStats>(`/websites/${WEBSITE_ID}/stats`, { startAt, endAt })
}

/** Get pageview + session series for charting */
export async function getPageviews(period = "30d", unit = "day"): Promise<UmamiPageviewSeries> {
  const { startAt, endAt } = dateRange(period)
  return umamiGet<UmamiPageviewSeries>(`/websites/${WEBSITE_ID}/pageviews`, {
    startAt,
    endAt,
    unit,
  })
}

/** Get metrics by type: url, referrer, browser, os, device, country, event */
export async function getMetrics(
  type: string,
  period = "30d",
  limit = 10
): Promise<UmamiMetric[]> {
  const { startAt, endAt } = dateRange(period)
  return umamiGet<UmamiMetric[]>(`/websites/${WEBSITE_ID}/metrics`, {
    startAt,
    endAt,
    type,
    limit: limit.toString(),
  })
}

/** Check if Umami is configured (env vars present) */
export function isUmamiConfigured(): boolean {
  return Boolean(API_URL && API_TOKEN && WEBSITE_ID)
}
