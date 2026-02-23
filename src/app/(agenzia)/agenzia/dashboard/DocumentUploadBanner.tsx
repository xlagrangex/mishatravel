"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Clock, CheckCircle2, Upload } from "lucide-react";
import FileUpload from "@/components/admin/FileUpload";
import { saveAgencyDocument } from "./actions";

interface DocumentUploadBannerProps {
  agencyId: string;
  daysRemaining: number;
}

export default function DocumentUploadBanner({
  agencyId,
  daysRemaining,
}: DocumentUploadBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUrgent = daysRemaining <= 2;

  function handleUpload(url: string | null) {
    if (!url) return;
    setError(null);
    startTransition(async () => {
      const result = await saveAgencyDocument(agencyId, url, "visura_camerale.pdf");
      if (result.success) {
        setUploaded(true);
      } else {
        setError(result.error ?? "Errore nel salvataggio del documento.");
      }
    });
  }

  if (uploaded) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Documento caricato con successo</p>
            <p className="text-sm text-green-700 mt-1">
              La visura camerale è stata inviata al nostro team per la verifica.
              Riceverai una notifica quando il tuo account sarà approvato.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-5 ${
        isUrgent
          ? "border-red-200 bg-red-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isUrgent ? (
            <AlertTriangle className="h-6 w-6 text-red-600" />
          ) : (
            <Clock className="h-6 w-6 text-yellow-600" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p
              className={`font-semibold ${
                isUrgent ? "text-red-800" : "text-yellow-800"
              }`}
            >
              Carica la Visura Camerale
            </p>
            <p
              className={`text-sm mt-1 ${
                isUrgent ? "text-red-700" : "text-yellow-700"
              }`}
            >
              Per completare la registrazione, devi caricare la visura camerale
              della tua agenzia entro{" "}
              <strong>
                {daysRemaining} {daysRemaining === 1 ? "giorno" : "giorni"}
              </strong>
              . Trascorso il termine, l&apos;account verrà cancellato
              automaticamente.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="max-w-md">
            <FileUpload
              onUpload={handleUpload}
              bucket="agencies"
              accept="application/pdf"
              maxSizeBytes={10 * 1024 * 1024}
              fileTypeLabel="Visura Camerale (PDF)"
            />
          </div>

          {isPending && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Upload className="h-4 w-4 animate-pulse" />
              Salvataggio in corso...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
