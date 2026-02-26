import { isUmamiConfigured, getStats, getPageviews, getMetrics } from "@/lib/umami/api";
import AnalyticsDashboard from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (!isUmamiConfigured()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
          Analytics
        </h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-amber-800 font-medium mb-2">Umami non configurato</p>
          <p className="text-amber-700 text-sm">
            Configura le variabili d&apos;ambiente <code className="bg-amber-100 px-1 rounded">UMAMI_API_URL</code>,{" "}
            <code className="bg-amber-100 px-1 rounded">UMAMI_API_TOKEN</code> e{" "}
            <code className="bg-amber-100 px-1 rounded">UMAMI_WEBSITE_ID</code> per abilitare la dashboard analytics.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all data in parallel for the default 30d period
  let stats, pageviews, topPages, topReferrers, topCountries, topBrowsers, topDevices, topOS;

  try {
    [stats, pageviews, topPages, topReferrers, topCountries, topBrowsers, topDevices, topOS] =
      await Promise.all([
        getStats("30d"),
        getPageviews("30d", "day"),
        getMetrics("url", "30d", 10),
        getMetrics("referrer", "30d", 10),
        getMetrics("country", "30d", 10),
        getMetrics("browser", "30d", 10),
        getMetrics("device", "30d", 10),
        getMetrics("os", "30d", 10),
      ]);
  } catch (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
          Analytics
        </h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Errore di connessione a Umami</p>
          <p className="text-red-700 text-sm">
            Verifica che l&apos;istanza Umami sia attiva e che le credenziali API siano corrette.
          </p>
          <p className="text-red-600 text-xs mt-2 font-mono">
            {error instanceof Error ? error.message : "Errore sconosciuto"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
        Analytics
      </h1>
      <AnalyticsDashboard
        initialStats={stats}
        initialPageviews={pageviews}
        initialTopPages={topPages}
        initialTopReferrers={topReferrers}
        initialTopCountries={topCountries}
        initialTopBrowsers={topBrowsers}
        initialTopDevices={topDevices}
        initialTopOS={topOS}
      />
    </div>
  );
}
