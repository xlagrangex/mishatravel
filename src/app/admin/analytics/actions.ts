"use server";

import {
  getStats,
  getPageviews,
  getMetrics,
  type UmamiStats,
  type UmamiPageviewSeries,
  type UmamiMetric,
} from "@/lib/umami/api";

export async function refreshAnalytics(
  period: string,
  unit: string
): Promise<{
  stats: UmamiStats;
  pageviews: UmamiPageviewSeries;
  topPages: UmamiMetric[];
  topReferrers: UmamiMetric[];
  topCountries: UmamiMetric[];
  topBrowsers: UmamiMetric[];
  topDevices: UmamiMetric[];
  topOS: UmamiMetric[];
}> {
  const [stats, pageviews, topPages, topReferrers, topCountries, topBrowsers, topDevices, topOS] =
    await Promise.all([
      getStats(period),
      getPageviews(period, unit),
      getMetrics("url", period, 10),
      getMetrics("referrer", period, 10),
      getMetrics("country", period, 10),
      getMetrics("browser", period, 10),
      getMetrics("device", period, 10),
      getMetrics("os", period, 10),
    ]);

  return { stats, pageviews, topPages, topReferrers, topCountries, topBrowsers, topDevices, topOS };
}
