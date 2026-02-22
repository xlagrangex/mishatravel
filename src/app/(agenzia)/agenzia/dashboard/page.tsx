import { redirect } from "next/navigation";
import {
  FileText,
  Gift,
  CheckCircle,
  Bell,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  getAgencyByUserId,
  getQuoteRequestCountsByStatus,
  getRecentQuoteRequests,
  getRecentNotifications,
} from "@/lib/supabase/queries/agency-dashboard";
import type { QuoteRequestStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Status label & color mapping
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  QuoteRequestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  sent: { label: "Inviata", variant: "secondary" },
  in_review: { label: "In revisione", variant: "outline" },
  offer_sent: { label: "Offerta inviata", variant: "default" },
  accepted: { label: "Accettata", variant: "default" },
  declined: { label: "Rifiutata", variant: "destructive" },
  payment_sent: { label: "Pagamento inviato", variant: "outline" },
  confirmed: { label: "Confermata", variant: "default" },
  rejected: { label: "Respinta", variant: "destructive" },
};

function statusBadge(status: QuoteRequestStatus) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page component (Server Component)
// ---------------------------------------------------------------------------

export default async function AgenziaDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/agenzia/dashboard");

  const agency = await getAgencyByUserId(user.id);
  if (!agency) redirect("/?error=no_agency");

  // Fetch dashboard data in parallel
  const [statusCounts, recentRequests, recentNotifications] = await Promise.all([
    getQuoteRequestCountsByStatus(agency.id),
    getRecentQuoteRequests(agency.id, 5),
    getRecentNotifications(user.id, 5),
  ]);

  // Derive counter values
  const pendingCount = (statusCounts["sent"] ?? 0) + (statusCounts["in_review"] ?? 0);
  const offersToReview = statusCounts["offer_sent"] ?? 0;
  const confirmedCount = statusCounts["confirmed"] ?? 0;

  const stats = [
    {
      label: "Richieste in Attesa",
      value: pendingCount,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Offerte da Valutare",
      value: offersToReview,
      icon: Gift,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Prenotazioni Confermate",
      value: confirmedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Benvenuto, {agency.business_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panoramica della tua area riservata
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column: Recent Requests + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Richieste Recenti
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agenzia/richieste" className="text-sm">
                Vedi tutte
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nessuna richiesta ancora.
                </p>
                <p className="text-xs text-muted-foreground">
                  Le tue richieste di preventivo appariranno qui.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentRequests.map((req) => {
                  const title =
                    req.request_type === "tour"
                      ? req.tour_title ?? "Tour"
                      : req.cruise_title ?? "Crociera";
                  return (
                    <li
                      key={req.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatDate(req.created_at)}
                          {" \u00B7 "}
                          {req.participants_adults ?? 0} adulti
                          {(req.participants_children ?? 0) > 0 &&
                            `, ${req.participants_children} bambini`}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        {statusBadge(req.status)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nessuna notifica.
                </p>
                <p className="text-xs text-muted-foreground">
                  Le notifiche sulle tue richieste appariranno qui.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentNotifications.map((n) => (
                  <li key={n.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          n.is_read ? "bg-gray-300" : "bg-primary"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
