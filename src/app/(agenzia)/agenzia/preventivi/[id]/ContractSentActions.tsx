"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  uploadCounterSignedContract,
  uploadPaymentReceipt,
  confirmPaymentAction,
} from "../actions";

interface ContractSentActionsProps {
  requestId: string;
  /** Already-uploaded counter-signed contract (from quote_documents) */
  existingCounterContract: { file_name: string; file_url: string } | null;
  /** Already-uploaded payment receipt (from quote_documents) */
  existingPaymentReceipt: { file_name: string; file_url: string } | null;
  /** Whether payment has already been confirmed (from quote_timeline) */
  paymentConfirmed: boolean;
}

export default function ContractSentActions({
  requestId,
  existingCounterContract,
  existingPaymentReceipt,
  paymentConfirmed,
}: ContractSentActionsProps) {
  const router = useRouter();

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Azioni Richieste
        </CardTitle>
        <p className="text-sm text-amber-700">
          Per completare la prenotazione, effettua le seguenti azioni:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 1. Counter-signed contract upload */}
        <ActionCard
          title="Contratto controfirmato"
          icon={FileText}
          completed={!!existingCounterContract}
          completedLabel={existingCounterContract?.file_name ?? "Caricato"}
          completedUrl={existingCounterContract?.file_url}
        >
          <FileUploadAction
            label="Carica il contratto controfirmato"
            accept=".pdf,.doc,.docx"
            onUpload={async (fileUrl, fileName) => {
              const result = await uploadCounterSignedContract(
                requestId,
                fileUrl,
                fileName
              );
              if (!result.success) throw new Error(result.error);
              router.refresh();
            }}
          />
        </ActionCard>

        {/* 2. Payment receipt upload */}
        <ActionCard
          title="Ricevuta di pagamento"
          icon={CreditCard}
          completed={!!existingPaymentReceipt}
          completedLabel={existingPaymentReceipt?.file_name ?? "Caricata"}
          completedUrl={existingPaymentReceipt?.file_url}
        >
          <FileUploadAction
            label="Carica la ricevuta di pagamento"
            accept=".pdf,.jpg,.png,.doc,.docx"
            onUpload={async (fileUrl, fileName) => {
              const result = await uploadPaymentReceipt(
                requestId,
                fileUrl,
                fileName
              );
              if (!result.success) throw new Error(result.error);
              router.refresh();
            }}
          />
        </ActionCard>

        {/* 3. Payment confirmation */}
        <ActionCard
          title="Conferma pagamento"
          icon={CheckCircle}
          completed={paymentConfirmed}
          completedLabel="Pagamento confermato"
        >
          <PaymentConfirmAction
            requestId={requestId}
            onSuccess={() => router.refresh()}
          />
        </ActionCard>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ActionCard wrapper
// ---------------------------------------------------------------------------

function ActionCard({
  title,
  icon: Icon,
  completed,
  completedLabel,
  completedUrl,
  children,
}: {
  title: string;
  icon: React.ElementType;
  completed: boolean;
  completedLabel: string;
  completedUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {completed && (
          <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
        )}
      </div>
      {completed ? (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="truncate flex-1">{completedLabel}</span>
          {completedUrl && (
            <a
              href={completedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:text-green-900"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileUploadAction
// ---------------------------------------------------------------------------

function FileUploadAction({
  label,
  accept,
  onUpload,
}: {
  label: string;
  accept: string;
  onUpload: (fileUrl: string, fileName: string) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload fallito");
      const data = await res.json();
      setFileUrl(data.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fileUrl || !fileName) return;
    setSubmitting(true);
    setError(null);
    try {
      await onUpload(fileUrl, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore invio");
    } finally {
      setSubmitting(false);
    }
  };

  if (fileUrl && fileName) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-md border bg-blue-50 px-3 py-2 text-sm">
          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="truncate flex-1">{fileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => {
              setFileUrl(null);
              setFileName(null);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Invia
        </Button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Caricamento..." : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PaymentConfirmAction
// ---------------------------------------------------------------------------

function PaymentConfirmAction({
  requestId,
  onSuccess,
}: {
  requestId: string;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmPaymentAction(
        requestId,
        notes.trim() || undefined
      );
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error ?? "Errore imprevisto.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Note (opzionale)</Label>
        <Textarea
          placeholder="Es. bonifico effettuato il..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button size="sm" onClick={handleConfirm} disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Conferma Pagamento
      </Button>
    </div>
  );
}
