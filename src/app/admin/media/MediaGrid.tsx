"use client";

import { useState, useMemo, useTransition, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Trash2,
  Upload,
  FileIcon,
  ImageIcon,
  FileText,
  Film,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StorageFileItem } from "@/lib/supabase/queries/media";
import { deleteMediaAction } from "./actions";

interface MediaGridProps {
  items: StorageFileItem[];
  buckets: string[];
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

export default function MediaGrid({ items, buckets }: MediaGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = items;
    if (selectedBucket !== "all") {
      result = result.filter((item) => item.bucket === selectedBucket);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, selectedBucket, items]);

  const handleDelete = (bucket: string, fileName: string, displayName: string) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${displayName}"? Questa azione non può essere annullata.`
      )
    )
      return;
    const itemId = `${bucket}/${fileName}`;
    setDeletingId(itemId);
    startTransition(async () => {
      const result = await deleteMediaAction(bucket, fileName);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setDeletingId(null);
    });
  };

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const targetBucket =
        selectedBucket !== "all" ? selectedBucket : "general";
      setIsUploading(true);

      try {
        const supabase = createClient();
        for (const file of Array.from(files)) {
          const sanitized = file.name
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .replace(/_+/g, "_");
          const filePath = `${Date.now()}_${sanitized}`;

          const { error } = await supabase.storage
            .from(targetBucket)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            alert(`Errore upload "${file.name}": ${error.message}`);
          }
        }
        // Reload page to show new files
        window.location.reload();
      } catch (err) {
        alert(
          `Errore upload: ${err instanceof Error ? err.message : "Errore sconosciuto"}`
        );
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [selectedBucket]
  );

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleUpload}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Libreria Media
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci immagini e file caricati su Supabase Storage
            {items.length > 0 && (
              <span className="ml-1">({items.length} totali)</span>
            )}
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Caricamento..." : "Carica File"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Bucket filter */}
        <Select value={selectedBucket} onValueChange={setSelectedBucket}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tutti i bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i bucket</SelectItem>
            {buckets.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun file trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || selectedBucket !== "all"
              ? "Prova a modificare i filtri di ricerca."
              : "Clicca \"Carica File\" per iniziare ad aggiungere immagini e documenti."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const IconComponent = getFileIcon(item.mimeType);
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
                  {isImage(item.mimeType) ? (
                    <Image
                      src={item.url}
                      alt={item.name}
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
                      onClick={() =>
                        handleDelete(item.bucket, item.name, item.name)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3">
                  <p
                    className="truncate text-sm font-medium"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
                      {item.bucket}
                    </span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
