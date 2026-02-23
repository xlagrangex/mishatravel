"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveAgencyDocument, deleteAgencyDocument } from "./actions";
import type { AgencyDocument } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DocumentsCardProps {
  agencyId: string;
  documents: AgencyDocument[];
}

export function DocumentsCard({ agencyId, documents }: DocumentsCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // -----------------------------------------------------------------------
  // Upload handler
  // -----------------------------------------------------------------------

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    setUploadError(null);

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(
        "Formato non supportato. Carica un file PDF, JPG o PNG."
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setUploadError(
        `File troppo grande (${formatBytes(file.size)}). Massimo ${formatBytes(MAX_SIZE)}.`
      );
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();

      // Sanitize filename
      const sanitized = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const filePath = `${agencyId}/${Date.now()}_${sanitized}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from("agency-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("agency-documents").getPublicUrl(filePath);

      // Save record via server action
      const result = await saveAgencyDocument(agencyId, publicUrl, file.name);

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the page to show the new document
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Errore durante il caricamento. Riprova."
      );
    } finally {
      setIsUploading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Delete handler
  // -----------------------------------------------------------------------

  async function handleDelete(doc: AgencyDocument) {
    if (!confirm(`Eliminare il documento "${doc.file_name}"?`)) return;

    setDeletingId(doc.id);

    try {
      // Delete from storage - extract the path from the URL
      const supabase = createClient();
      const url = new URL(doc.file_url);
      const storagePath = url.pathname.split("/agency-documents/").pop();
      if (storagePath) {
        await supabase.storage
          .from("agency-documents")
          .remove([decodeURIComponent(storagePath)]);
      }

      // Delete record via server action
      const result = await deleteAgencyDocument(doc.id);
      if (result.error) {
        throw new Error(result.error);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Delete error:", err);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Errore durante l'eliminazione. Riprova."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Documenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info text */}
        <p className="text-sm text-muted-foreground">
          Carica la visura camerale della tua agenzia. Hai 15 giorni
          dall&apos;approvazione per completare l&apos;upload.
        </p>

        {/* Document list */}
        {documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {doc.file_name ?? "Visura Camerale"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.uploaded_at)}
                    </span>
                    {doc.verified ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="size-3" />
                        Verificato
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="size-3" />
                        In verifica
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {/* Download */}
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                  >
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Scarica documento"
                    >
                      <Download className="size-4" />
                    </a>
                  </Button>

                  {/* Delete (only if not verified) */}
                  {!doc.verified && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id || isPending}
                      title="Elimina documento"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Upload section */}
        <div className="pt-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || isPending}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento in corso...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carica Visura Camerale
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            PDF, JPG o PNG - Max 10 MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
