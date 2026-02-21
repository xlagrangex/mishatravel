"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agency } from "@/lib/types";
import { approveAgencyFromDashboard } from "./agenzie/actions";

interface PendingAgenciesWidgetProps {
  agencies: Agency[];
}

export default function PendingAgenciesWidget({
  agencies,
}: PendingAgenciesWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = (agencyId: string, businessName: string) => {
    if (!confirm(`Sei sicuro di voler approvare l'agenzia "${businessName}"?`))
      return;
    setApprovingId(agencyId);
    startTransition(async () => {
      const result = await approveAgencyFromDashboard(agencyId);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setApprovingId(null);
      router.refresh();
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-lg text-yellow-800">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Agenzie in attesa di approvazione ({agencies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-yellow-200 bg-white p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-secondary">
                  {agency.business_name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {agency.contact_name && (
                    <span>{agency.contact_name}</span>
                  )}
                  {agency.email && <span>{agency.email}</span>}
                  <span>Registrata il {formatDate(agency.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={isPending}
                  onClick={() =>
                    handleApprove(agency.id, agency.business_name)
                  }
                >
                  {approvingId === agency.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Approva
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/agenzie/${agency.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Dettaglio
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
