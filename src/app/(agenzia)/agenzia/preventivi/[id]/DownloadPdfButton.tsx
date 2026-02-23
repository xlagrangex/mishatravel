"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
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

  const handleDownload = async () => {
    setLoading(true);
    try {
      window.open(`/api/agenzia/preventivo-pdf?id=${quoteId}`, "_blank");
    } finally {
      setTimeout(() => setLoading(false), 3000);
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
        Scarica PDF
      </Button>
    );
  }

  return (
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
            {loading ? "Generazione in corso..." : "Scarica Preventivo PDF"}
          </p>
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Il PDF si aprira in una nuova scheda"
              : "Documento completo con itinerario, prezzi e condizioni"}
          </p>
        </div>
        {!loading && (
          <Download className="ml-auto h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
        )}
      </div>
    </button>
  );
}
