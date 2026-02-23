"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingDocument } from "@/lib/supabase/queries/agency-documents";
import { verifyAgencyDocument } from "./agenzie/actions";

interface PendingDocumentsWidgetProps {
  documents: PendingDocument[];
  adminUserId: string;
}

export default function PendingDocumentsWidget({
  documents,
  adminUserId,
}: PendingDocumentsWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = (docId: string, businessName: string) => {
    if (
      !confirm(
        `Confermi la verifica della visura camerale di "${businessName}"?`
      )
    )
      return;
    setVerifyingId(docId);
    startTransition(async () => {
      const result = await verifyAgencyDocument(docId, adminUserId);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setVerifyingId(null);
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
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-lg text-blue-800">
          <FileText className="h-5 w-5 text-blue-600" />
          Documenti in attesa di verifica ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-blue-200 bg-white p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-secondary">
                  {doc.business_name}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{doc.file_name ?? "Visura Camerale"}</span>
                  <span>Caricato il {formatDate(doc.uploaded_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={isPending}
                  onClick={() => handleVerify(doc.id, doc.business_name)}
                >
                  {verifyingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Verifica
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Scarica
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/agenzie/${doc.agency_id}`}>
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
