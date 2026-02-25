"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Search,
  ImageIcon,
  FileIcon,
  FileText,
  Film,
  Check,
  Loader2,
  Upload,
  ImagePlus,
  FolderOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { STORAGE_BUCKETS } from "@/lib/supabase/queries/media";
import {
  getMediaItemsAction,
  getMediaFoldersAction,
  registerMediaAction,
} from "@/app/admin/media/actions";
import type { MediaItem, MediaFolder } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  maxSelect?: number;
  defaultBucket?: string;
  acceptMimePrefix?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number | null): string {
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

const WEBP_QUALITY = 0.82;

async function convertToWebP(file: File): Promise<File> {
  const skipTypes = ["image/gif", "image/svg+xml", "image/webp"];
  if (skipTypes.includes(file.type)) return file;
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
        },
        "image/webp",
        WEBP_QUALITY,
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => { resolve(file); };
    img.src = URL.createObjectURL(file);
  });
}

const PAGE_SIZE = 48;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  maxSelect = 20,
  defaultBucket,
  acceptMimePrefix = "image/",
}: MediaPickerProps) {
  // State
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [bucketFilter, setBucketFilter] = useState<string>(defaultBucket ?? "all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("library");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadBucket, setUploadBucket] = useState<string>(defaultBucket ?? "general");

  const [, startTransition] = useTransition();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchMedia = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const result = await getMediaItemsAction({
          page: pageNum,
          pageSize: PAGE_SIZE,
          bucket: bucketFilter !== "all" ? bucketFilter : undefined,
          folder: folderFilter !== "all" ? folderFilter : undefined,
          search: search || undefined,
          mimeTypePrefix: acceptMimePrefix || undefined,
        });
        if (pageNum === 1) {
          setItems(result.items);
        } else {
          setItems((prev) => [...prev, ...result.items]);
        }
        setTotal(result.total);
      } catch {
        console.error("Error fetching media");
      } finally {
        setLoading(false);
      }
    },
    [bucketFilter, folderFilter, search, acceptMimePrefix],
  );

  const fetchFolders = useCallback(async () => {
    try {
      const f = await getMediaFoldersAction();
      setFolders(f);
    } catch {
      console.error("Error fetching folders");
    }
  }, []);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setPage(1);
      setSearch("");
      setBucketFilter(defaultBucket ?? "all");
      setFolderFilter("all");
      setTab("library");
      fetchMedia(1);
      fetchFolders();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when filters change
  useEffect(() => {
    if (open) {
      setPage(1);
      fetchMedia(1);
    }
  }, [bucketFilter, folderFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }, []);

  // -----------------------------------------------------------------------
  // Selection
  // -----------------------------------------------------------------------

  const toggleSelection = useCallback(
    (item: MediaItem) => {
      if (!multiple) {
        // Single select: just set this one
        setSelectedIds(new Set([item.id]));
        return;
      }

      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else if (next.size < maxSelect) {
          next.add(item.id);
        }
        return next;
      });
    },
    [multiple, maxSelect],
  );

  const handleConfirm = useCallback(() => {
    const selectedUrls = items
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.url);
    onSelect(selectedUrls);
    onOpenChange(false);
  }, [items, selectedIds, onSelect, onOpenChange]);

  // -----------------------------------------------------------------------
  // Upload
  // -----------------------------------------------------------------------

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      if (fileArr.length === 0) return;

      setIsUploading(true);
      const supabase = createClient();
      const newItems: MediaItem[] = [];

      for (const file of fileArr) {
        try {
          const optimized = await convertToWebP(file);
          const sanitized = optimized.name
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .replace(/_+/g, "_");
          const filePath = `${Date.now()}_${sanitized}`;

          const { data, error } = await supabase.storage
            .from(uploadBucket)
            .upload(filePath, optimized, { cacheControl: "3600", upsert: false });

          if (error) {
            console.error(`Upload error: ${error.message}`);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from(uploadBucket)
            .getPublicUrl(data.path);

          // Register in media DB
          const result = await registerMediaAction({
            filename: filePath,
            url: urlData.publicUrl,
            file_size: optimized.size,
            mime_type: optimized.type,
            bucket: uploadBucket,
            folder: uploadBucket,
          });

          if (result.success && result.item) {
            newItems.push(result.item);
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      setIsUploading(false);

      if (newItems.length > 0) {
        // Switch to library tab with new items pre-selected
        setItems((prev) => [...newItems, ...prev]);
        setTotal((prev) => prev + newItems.length);
        setSelectedIds(new Set(newItems.map((i) => i.id)));
        setTab("library");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadBucket],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  // -----------------------------------------------------------------------
  // Load More
  // -----------------------------------------------------------------------

  const hasMore = items.length < total;
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    startTransition(() => {
      fetchMedia(nextPage);
    });
  }, [page, fetchMedia]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Libreria Media</DialogTitle>
          <DialogDescription>
            Seleziona {multiple ? "le immagini" : "un'immagine"} dalla libreria o caricane {multiple ? "di nuove" : "una nuova"}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 px-6 pb-0 pt-4">
          <TabsList>
            <TabsTrigger value="library">
              <ImageIcon className="size-4" />
              Libreria
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="size-4" />
              Carica
            </TabsTrigger>
          </TabsList>

          {/* === LIBRARY TAB === */}
          <TabsContent value="library" className="flex flex-col min-h-0 mt-4">
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca file..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={bucketFilter} onValueChange={setBucketFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Bucket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i bucket</SelectItem>
                  {STORAGE_BUCKETS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Cartella" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le cartelle</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      <FolderOpen className="size-3.5 inline mr-1.5" />
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIds.size > 0 && (
                <span className="text-sm text-muted-foreground ml-auto">
                  {selectedIds.size} selezionat{selectedIds.size === 1 ? "o" : "i"}
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ height: "50vh" }}>
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Nessun file trovato.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prova a modificare i filtri o carica nuovi file.
                  </p>
                </div>
              ) : (
                <div className="pr-4">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {items.map((item) => {
                      const selected = selectedIds.has(item.id);
                      const IconComponent = getFileIcon(item.mime_type);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleSelection(item)}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all text-left",
                            selected
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/20",
                          )}
                        >
                          {isImage(item.mime_type) ? (
                            <Image
                              src={item.url}
                              alt={item.alt_text || item.filename}
                              fill
                              className="object-cover"
                              sizes="120px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <IconComponent className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                          )}

                          {/* Selection indicator */}
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow">
                              <Check className="size-3.5" />
                            </div>
                          )}

                          {/* Filename overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-6">
                            <p className="truncate text-[11px] text-white">
                              {item.filename}
                            </p>
                            <p className="text-[10px] text-white/70">
                              {formatBytes(item.file_size)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Carica altri ({items.length} di {total})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* === UPLOAD TAB === */}
          <TabsContent value="upload" className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files);
              }}
            />

            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">
                Carica nel bucket:
              </label>
              <Select value={uploadBucket} onValueChange={setUploadBucket}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORAGE_BUCKETS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
                "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
                dragOver && "border-primary bg-primary/10",
                isUploading && "pointer-events-none opacity-70",
              )}
            >
              {isUploading ? (
                <Loader2 className="size-10 animate-spin text-primary" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <ImagePlus className="size-7 text-primary" />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isUploading
                    ? "Caricamento in corso..."
                    : dragOver
                      ? "Rilascia qui i file"
                      : "Trascina le immagini qui"}
                </p>
                <p className="text-xs text-muted-foreground">
                  oppure clicca per sfogliare. Le immagini vengono convertite automaticamente in WebP.
                </p>
              </div>

              {!isUploading && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="size-4" />
                  Scegli File
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            {selectedIds.size > 0
              ? `Seleziona (${selectedIds.size})`
              : "Seleziona"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
