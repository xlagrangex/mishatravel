"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { saveAgencyDocument } from "./actions";
import type { AgencyDocument } from "@/lib/types";

interface DocumentStatusCardProps {
  agencyId: string;
  document: AgencyDocument;
}

export default function DocumentStatusCard({
  agencyId,
  document: doc,
}: DocumentStatusCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type !== "application/pdf") {
      setError("Formato non supportato. Carica un file PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File troppo grande. Massimo 10 MB.");
      return;
    }

    setIsReplacing(true);
    setError(null);

    try {
      const supabase = createClient();
      const sanitized = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const filePath = `${agencyId}/${Date.now()}_${sanitized}`;

      const { error: uploadErr } = await supabase.storage
        .from("agency-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadErr) throw new Error(uploadErr.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("agency-documents").getPublicUrl(filePath);

      const result = await saveAgencyDocument(agencyId, publicUrl, file.name);
      if (!result.success) throw new Error(result.error ?? "Errore nel salvataggio.");

      startTransition(() => router.refresh());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante il caricamento."
      );
    } finally {
      setIsReplacing(false);
    }
  }

  return (
    <div
      className={`rounded-lg border p-5 ${
        doc.verified
          ? "border-green-200 bg-green-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {doc.verified ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Clock className="h-6 w-6 text-yellow-600" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p
              className={`font-semibold ${
                doc.verified ? "text-green-800" : "text-yellow-800"
              }`}
            >
              {doc.verified
                ? "Visura Camerale Verificata"
                : "Visura Camerale - In Attesa di Verifica"}
            </p>
            <p
              className={`text-sm mt-1 ${
                doc.verified ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {doc.verified
                ? "Il tuo documento è stato verificato con successo. Il tuo account è completamente attivo."
                : "Il documento è stato caricato ed è in attesa di verifica da parte del nostro team."}
            </p>
          </div>

          {/* Document info row */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 ${
              doc.verified
                ? "border-green-200 bg-white"
                : "border-yellow-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {doc.file_name ?? "Visura Camerale"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    Caricato il {formatDate(doc.uploaded_at)}
                  </span>
                  {doc.verified ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                      <CheckCircle2 className="size-3" />
                      Verificato
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
                      <Clock className="size-3" />
                      In verifica
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Download */}
              <Button variant="outline" size="sm" asChild>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Scarica
                </a>
              </Button>

              {/* Replace (only if not verified) */}
              {!doc.verified && (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleReplace}
                    disabled={isReplacing || isPending}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={isReplacing || isPending}
                  >
                    {isReplacing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Sostituisci
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
