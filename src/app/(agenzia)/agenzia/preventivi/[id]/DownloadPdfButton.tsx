"use client";

import { useState } from "react";
import { Download, Loader2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadPdfButtonProps {
  quoteId: string;
  variant?: "prominent" | "compact";
}

export default function DownloadPdfButton({
  quoteId,
  variant = "prominent",
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agenzia/preventivo-pdf?id=${quoteId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Errore nella generazione del PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // Open in new tab
      const win = window.open(url, "_blank");
      // If popup blocked, fallback to download
      if (!win) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `preventivo-${quoteId.slice(0, 8)}.pdf`;
        a.click();
      }
      // Cleanup after a delay
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-1 h-4 w-4" />
        )}
        {loading ? "Generando..." : "Scarica PDF"}
      </Button>
    );
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="group w-full rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-4 transition-all hover:border-primary hover:bg-primary/10 disabled:opacity-60"
      >
        <div className="flex items-center justify-center gap-3">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <FileText className="h-5 w-5" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-primary">
              {loading ? "Il PDF si sta generando..." : "Scarica Preventivo PDF"}
            </p>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Attendere qualche secondo, il documento si aprira automaticamente"
                : "Documento completo con itinerario, prezzi e condizioni"}
            </p>
          </div>
          {!loading && (
            <Download className="ml-auto h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
          )}
        </div>
      </button>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
