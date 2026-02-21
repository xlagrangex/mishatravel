"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import { Search, Trash2, Upload, FileIcon, ImageIcon, FileText, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/types";
import { deleteMediaAction } from "./actions";

interface MediaGridProps {
  items: MediaItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string | null): boolean {
  return !!mimeType && mimeType.startsWith("image/");
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.startsWith("video/")) return Film;
  return FileIcon;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MediaGrid({ items }: MediaGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.filename.toLowerCase().includes(q));
  }, [searchQuery, items]);

  const handleDelete = (id: string, filename: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${filename}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteMediaAction(id);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Libreria Media
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci immagini e file caricati
            {items.length > 0 && (
              <span className="ml-1">({items.length} totali)</span>
            )}
          </p>
        </div>
        <Button disabled title="Upload in arrivo">
          <Upload className="h-4 w-4" />
          Carica File
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome file..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun file caricato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "L'upload dei file sarà disponibile con la configurazione di Supabase Storage."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const IconComponent = getFileIcon(item.mime_type);
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md",
                  deletingId === item.id && "opacity-50"
                )}
              >
                {/* Thumbnail / Icon */}
                <div className="relative aspect-square bg-muted">
                  {isImage(item.mime_type) ? (
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <IconComponent className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Delete overlay */}
                  <div className="absolute inset-0 flex items-start justify-end bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      className="h-7 w-7"
                      disabled={isPending && deletingId === item.id}
                      onClick={() => handleDelete(item.id, item.filename)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3">
                  <p className="truncate text-sm font-medium" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(item.file_size)}</span>
                    {item.mime_type && (
                      <>
                        <span className="text-muted-foreground/40">&middot;</span>
                        <span className="truncate">{item.mime_type}</span>
                      </>
                    )}
                  </div>
                  {item.width && item.height && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.width} &times; {item.height}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
