"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadPdfButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      window.open(`/api/agenzia/preventivo-pdf?id=${quoteId}`, "_blank");
    } finally {
      // Give it a moment so the user sees the spinner
      setTimeout(() => setLoading(false), 2000);
    }
  };

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
