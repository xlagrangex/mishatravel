"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  ImagePlus,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageUploadProps {
  /** Already-uploaded image URLs to display. */
  value?: string[];
  /** Called whenever the list of uploaded image URLs changes. */
  onUpload: (urls: string[]) => void;
  /** Allow selecting multiple files at once. */
  multiple?: boolean;
  /** Maximum number of images (only relevant when `multiple` is true). */
  maxFiles?: number;
  /** Maximum file size in bytes. Defaults to 5 MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types. Defaults to common image types. */
  accept?: string;
  /** Additional wrapper class names. */
  className?: string;
  /** Disable interactions. */
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
  url?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let idCounter = 0;
function uid(): string {
  return `img-upload-${Date.now()}-${++idCounter}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageUpload({
  value = [],
  onUpload,
  multiple = false,
  maxFiles = 20,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Drag-reorder state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploading.forEach((u) => {
        if (u.preview.startsWith("blob:")) URL.revokeObjectURL(u.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Upload logic (mocked)
  // -----------------------------------------------------------------------

  const simulateUpload = useCallback(
    async (file: File): Promise<string> => {
      // TODO: Replace this mock with actual Supabase Storage upload.
      // Example:
      //   const { data, error } = await supabase.storage
      //     .from("images")
      //     .upload(`tours/${Date.now()}_${file.name}`, file);
      //   if (error) throw error;
      //   return supabase.storage.from("images").getPublicUrl(data.path).data.publicUrl;

      return new Promise((resolve) => {
        setTimeout(() => {
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        }, 800 + Math.random() * 1200);
      });
    },
    [],
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);

      // Limit amount
      const remaining = multiple ? maxFiles - value.length : 1;
      const toProcess = fileArr.slice(0, Math.max(0, remaining));

      if (toProcess.length === 0) return;

      // Validate and create upload entries
      const entries: UploadingFile[] = toProcess.map((file) => {
        const entry: UploadingFile = {
          id: uid(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "uploading",
        };

        if (file.size > maxSizeBytes) {
          entry.status = "error";
          entry.error = `File too large (${formatBytes(file.size)}). Max ${formatBytes(maxSizeBytes)}.`;
        }

        if (!accept.split(",").some((t) => file.type.match(t.trim()))) {
          entry.status = "error";
          entry.error = `Invalid file type: ${file.type || "unknown"}`;
        }

        return entry;
      });

      setUploading((prev) => [...prev, ...entries]);

      // Upload valid files
      const newUrls: string[] = [];

      await Promise.all(
        entries.map(async (entry) => {
          if (entry.status === "error") return;

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === entry.id && u.status === "uploading"
                  ? { ...u, progress: Math.min(u.progress + 15, 90) }
                  : u,
              ),
            );
          }, 200);

          try {
            const url = await simulateUpload(entry.file);
            clearInterval(progressInterval);

            setUploading((prev) =>
              prev.map((u) =>
                u.id === entry.id
                  ? { ...u, progress: 100, status: "done", url }
                  : u,
              ),
            );

            newUrls.push(url);
          } catch {
            clearInterval(progressInterval);
            setUploading((prev) =>
              prev.map((u) =>
                u.id === entry.id
                  ? { ...u, status: "error", error: "Upload failed." }
                  : u,
              ),
            );
          }
        }),
      );

      if (newUrls.length > 0) {
        if (multiple) {
          onUpload([...value, ...newUrls]);
        } else {
          onUpload(newUrls.slice(0, 1));
        }

        // Clear completed uploads after a short delay
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.status !== "done"));
        }, 1500);
      }
    },
    [value, onUpload, multiple, maxFiles, maxSizeBytes, accept, simulateUpload],
  );

  // -----------------------------------------------------------------------
  // Drag & drop handlers (file drop zone)
  // -----------------------------------------------------------------------

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input so re-selecting the same file works
      e.target.value = "";
    },
    [processFiles],
  );

  // -----------------------------------------------------------------------
  // Image removal
  // -----------------------------------------------------------------------

  const removeImage = useCallback(
    (url: string) => {
      onUpload(value.filter((v) => v !== url));
    },
    [value, onUpload],
  );

  const removeUploading = useCallback((id: string) => {
    setUploading((prev) => {
      const entry = prev.find((u) => u.id === id);
      if (entry?.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  // -----------------------------------------------------------------------
  // Drag reorder handlers (existing images)
  // -----------------------------------------------------------------------

  const handleReorderDragStart = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.dataTransfer.effectAllowed = "move";
      setDragIdx(idx);
    },
    [],
  );

  const handleReorderDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverIdx(idx);
    },
    [],
  );

  const handleReorderDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === dropIdx) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }

      const reordered = [...value];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(dropIdx, 0, moved);
      onUpload(reordered);

      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, value, onUpload],
  );

  const handleReorderDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const canUploadMore = multiple ? value.length < maxFiles : value.length === 0;
  const activeUploads = uploading.filter((u) => u.status === "uploading");
  const isUploading = activeUploads.length > 0;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Existing images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, idx) => (
            <div
              key={url}
              draggable={multiple && !disabled}
              onDragStart={(e) => handleReorderDragStart(e, idx)}
              onDragOver={(e) => handleReorderDragOver(e, idx)}
              onDrop={(e) => handleReorderDrop(e, idx)}
              onDragEnd={handleReorderDragEnd}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                "transition-all duration-200",
                dragIdx === idx && "opacity-50 scale-95",
                overIdx === idx &&
                  dragIdx !== null &&
                  dragIdx !== idx &&
                  "ring-2 ring-primary ring-offset-2",
              )}
            >
              <img
                src={url}
                alt={`Upload ${idx + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 transition-colors group-hover:bg-black/30">
                {/* Drag handle */}
                {multiple && !disabled && (
                  <button
                    type="button"
                    className="cursor-grab rounded bg-white/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="size-4 text-muted-foreground" />
                  </button>
                )}

                {/* Remove button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className={cn(
                      "rounded-full bg-white/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100",
                      "hover:bg-destructive hover:text-white",
                      !multiple && "ml-auto",
                    )}
                    title="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Index badge */}
              {multiple && (
                <span className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-medium text-white">
                  {idx + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading files progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-2"
            >
              <img
                src={entry.preview}
                alt="Uploading"
                className="size-12 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(entry.file.size)}
                </p>

                {entry.status === "uploading" && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                )}

                {entry.status === "error" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {entry.error}
                  </p>
                )}

                {entry.status === "done" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="size-3" />
                    Uploaded
                  </p>
                )}
              </div>

              {entry.status === "error" && (
                <button
                  type="button"
                  onClick={() => removeUploading(entry.id)}
                  className="shrink-0 rounded-full p-1 hover:bg-muted"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}

              {entry.status === "uploading" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dragOver && "border-primary bg-primary/10",
            disabled && "pointer-events-none opacity-50",
            isUploading && "pointer-events-none opacity-70",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ImagePlus className="size-6 text-primary" />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isUploading
                ? "Uploading..."
                : dragOver
                  ? "Drop images here"
                  : "Drag & drop images here"}
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple
                ? `or click to browse (max ${maxFiles} images, ${formatBytes(maxSizeBytes)} each)`
                : `or click to browse (max ${formatBytes(maxSizeBytes)})`}
            </p>
          </div>

          {!isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Upload className="size-4" />
              Choose {multiple ? "Images" : "Image"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
