import Link from "next/link";
import {
  Plane,
  Ship,
  Anchor,
  MapPin,
  Users,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPendingAgencies, getAgencyStats } from "@/lib/supabase/queries/admin-agencies";
import { getQuoteStats, getAllQuotes } from "@/lib/supabase/queries/admin-quotes";
import { getAllDepartures } from "@/lib/supabase/queries/departures";
import { getPendingDocuments } from "@/lib/supabase/queries/agency-documents";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminStatusAction } from "@/lib/quote-status-config";
import { ActionIndicator } from "@/components/ActionIndicator";
import PendingAgenciesWidget from "./PendingAgenciesWidget";
import PendingDocumentsWidget from "./PendingDocumentsWidget";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Data fetching helpers
// ---------------------------------------------------------------------------

async function getDashboardCounts() {
  const supabase = createAdminClient();

  const [toursRes, cruisesRes, shipsRes, destsRes] = await Promise.all([
    supabase.from("tours").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("cruises").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("ships").select("id", { count: "exact", head: true }),
    supabase.from("destinations").select("id", { count: "exact", head: true }),
  ]);

  return {
    tours: toursRes.count ?? 0,
    cruises: cruisesRes.count ?? 0,
    ships: shipsRes.count ?? 0,
    destinations: destsRes.count ?? 0,
  };
}

function getUpcomingDeparturesCount(
  departures: Awaited<ReturnType<typeof getAllDepartures>>
): number {
  const today = new Date().toISOString().slice(0, 10);
  return departures.filter((d) => d.date >= today).length;
}

// ---------------------------------------------------------------------------
// Status label map (Italian)
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  sent: "Inviato",
  in_review: "In revisione",
  offer_sent: "Offerta inviata",
  accepted: "Accettato",
  declined: "Rifiutato",
  payment_sent: "Pagamento inviato",
  confirmed: "Confermato",
  rejected: "Respinto",
};

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800",
  in_review: "bg-yellow-100 text-yellow-800",
  offer_sent: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  payment_sent: "bg-orange-100 text-orange-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminDashboard() {
  // Fetch all data in parallel
  const [pendingAgencies, pendingDocs, counts, agencyStats, quoteStats, recentQuotes, allDepartures, currentUser] =
    await Promise.all([
      getPendingAgencies().catch(() => [] as Awaited<ReturnType<typeof getPendingAgencies>>),
      getPendingDocuments().catch(() => []),
      getDashboardCounts().catch(() => ({ tours: 0, cruises: 0, ships: 0, destinations: 0 })),
      getAgencyStats().catch(() => ({ total: 0, active: 0, pending: 0, blocked: 0, totalQuotes: 0 })),
      getQuoteStats().catch(() => ({ total: 0, sent: 0, in_review: 0, offer_sent: 0, accepted: 0, declined: 0, payment_sent: 0, confirmed: 0, rejected: 0 }),
      ),
      getAllQuotes().catch(() => []),
      getAllDepartures().catch(() => []),
      getCurrentUser().catch(() => null),
    ]);

  const upcomingCount = getUpcomingDeparturesCount(allDepartures);
  const pendingQuotes = quoteStats.sent + quoteStats.in_review;

  const stats = [
    { label: "Tour Attivi", value: String(counts.tours), icon: Plane, color: "text-blue-600", href: "/admin/tours" },
    { label: "Crociere Attive", value: String(counts.cruises), icon: Ship, color: "text-cyan-600", href: "/admin/crociere" },
    { label: "Navi", value: String(counts.ships), icon: Anchor, color: "text-indigo-600", href: "/admin/flotta" },
    { label: "Destinazioni", value: String(counts.destinations), icon: MapPin, color: "text-green-600", href: "/admin/destinazioni" },
    { label: "Agenzie Registrate", value: String(agencyStats.total), icon: Users, color: "text-purple-600", href: "/admin/agenzie" },
    { label: "Preventivi in Attesa", value: String(pendingQuotes), icon: FileText, color: "text-orange-600", href: "/admin/preventivi" },
    { label: "Partenze Prossime", value: String(upcomingCount), icon: Calendar, color: "text-red-600", href: "/admin/partenze" },
    { label: "Preventivi Confermati", value: String(quoteStats.confirmed), icon: TrendingUp, color: "text-emerald-600", href: "/admin/preventivi" },
  ];

  // Recent quotes: take only first 5
  const latestQuotes = recentQuotes.slice(0, 5);

  // Upcoming departures: filter future, take first 5
  const today = new Date().toISOString().slice(0, 10);
  const upcomingDepartures = allDepartures
    .filter((d) => d.date >= today)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Panoramica generale del sistema MishaTravel
        </p>
      </div>

      {/* Pending Agencies Widget - only shows if count > 0 */}
      {pendingAgencies.length > 0 && (
        <PendingAgenciesWidget agencies={pendingAgencies} />
      )}

      {/* Pending Documents Widget - only shows if count > 0 */}
      {pendingDocs.length > 0 && currentUser && (
        <PendingDocumentsWidget documents={pendingDocs} adminUserId={currentUser.id} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Ultimi Preventivi
            </CardTitle>
            {latestQuotes.length > 0 && (
              <Link
                href="/admin/preventivi"
                className="text-sm text-primary hover:underline"
              >
                Vedi tutti
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {latestQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nessun preventivo ancora.
                </p>
                <p className="text-xs text-muted-foreground">
                  Le richieste delle agenzie appariranno qui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestQuotes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/admin/preventivi/${q.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {q.tour_title || q.cruise_title || "N/D"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.agency_business_name ?? "Agenzia"} &middot;{" "}
                        {new Date(q.created_at).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_COLORS[q.status] ?? ""}`}
                      >
                        {STATUS_LABELS[q.status] ?? q.status}
                      </Badge>
                      <ActionIndicator
                        status={q.status}
                        {...getAdminStatusAction(q.status)}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Departures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Prossime Partenze
            </CardTitle>
            {upcomingDepartures.length > 0 && (
              <Link
                href="/admin/partenze"
                className="text-sm text-primary hover:underline"
              >
                Vedi tutte
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {upcomingDepartures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nessuna partenza programmata.
                </p>
                <p className="text-xs text-muted-foreground">
                  Aggiungi tour e crociere per vedere le partenze.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDepartures.map((dep) => (
                  <Link
                    key={dep.id}
                    href={`${dep.basePath}/${dep.slug}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {dep.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dep.destination_name ?? ""}{" "}
                        {dep.duration ? `\u00B7 ${dep.duration} notti` : ""}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {new Date(dep.date).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          dep.type === "tour"
                            ? "border-blue-200 text-blue-700"
                            : "border-cyan-200 text-cyan-700"
                        }`}
                      >
                        {dep.type === "tour" ? "Tour" : "Crociera"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Stato Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Database</span>
              <Badge variant="outline" className="ml-auto text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Storage</span>
              <Badge variant="outline" className="ml-auto text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Auth</span>
              <Badge variant="outline" className="ml-auto text-xs">Attivo</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${process.env.BREVO_API_KEY ? "bg-green-500" : "bg-yellow-500"}`} />
              <span className="text-sm">Email</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {process.env.BREVO_API_KEY ? "Attivo" : "Non configurato"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
