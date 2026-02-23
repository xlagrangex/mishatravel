"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileUploadProps {
  /** Currently uploaded file URL (single file mode). */
  value?: string | null;
  /** Called when a file is uploaded or removed. Receives the URL or null. */
  onUpload: (url: string | null) => void;
  /** Supabase Storage bucket name. Defaults to 'catalogs'. */
  bucket?: string;
  /** Maximum file size in bytes. Defaults to 10 MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types. Defaults to PDF. */
  accept?: string;
  /** Label shown in the file display after upload (e.g. "PDF document"). */
  fileTypeLabel?: string;
  /** Optional folder prefix prepended to the file path (e.g. an agency ID). */
  pathPrefix?: string;
  /** Additional wrapper class names. */
  className?: string;
  /** Disable interactions. */
  disabled?: boolean;
}

interface UploadState {
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_ACCEPT = "application/pdf";
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FileUpload({
  value = null,
  onUpload,
  bucket = "catalogs",
  maxSizeBytes = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  fileTypeLabel = "PDF",
  pathPrefix,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  // -----------------------------------------------------------------------
  // Upload logic (Supabase Storage)
  // -----------------------------------------------------------------------

  const uploadToStorage = useCallback(async (file: File): Promise<string> => {
    const supabase = createClient();

    // Sanitize filename: remove special chars, keep extension
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");
    const fileName = `${Date.now()}_${sanitized}`;
    const filePath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }, [bucket, pathPrefix]);

  const processFile = useCallback(
    async (file: File) => {
      // Validate size
      if (file.size > maxSizeBytes) {
        setUploadState({
          file,
          progress: 0,
          status: "error",
          error: `File too large (${formatBytes(file.size)}). Max ${formatBytes(maxSizeBytes)}.`,
        });
        return;
      }

      // Validate type
      if (!accept.split(",").some((t) => file.type.match(t.trim()))) {
        setUploadState({
          file,
          progress: 0,
          status: "error",
          error: `Invalid file type: ${file.type || "unknown"}. Expected ${fileTypeLabel}.`,
        });
        return;
      }

      setUploadState({ file, progress: 0, status: "uploading" });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState((prev) =>
          prev && prev.status === "uploading"
            ? { ...prev, progress: Math.min(prev.progress + 15, 90) }
            : prev,
        );
      }, 200);

      try {
        const url = await uploadToStorage(file);
        clearInterval(progressInterval);

        setUploadState({ file, progress: 100, status: "done" });
        setFileName(file.name);
        setFileSize(file.size);
        onUpload(url);

        // Clear upload indicator after a short delay
        setTimeout(() => {
          setUploadState(null);
        }, 1500);
      } catch {
        clearInterval(progressInterval);
        setUploadState({
          file,
          progress: 0,
          status: "error",
          error: "Upload failed. Please try again.",
        });
      }
    },
    [maxSizeBytes, accept, fileTypeLabel, uploadToStorage, onUpload],
  );

  // -----------------------------------------------------------------------
  // Event handlers
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
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    setFileName(null);
    setFileSize(null);
    setUploadState(null);
    onUpload(null);
  }, [onUpload]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------

  const isUploading = uploadState?.status === "uploading";
  const hasFile = !!value;

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
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Existing file display */}
      {hasFile && !uploadState && (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {fileName || `${fileTypeLabel} Document`}
            </p>
            {fileSize !== null && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileSize)}
              </p>
            )}
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              title="Remove file"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {uploadState && (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {uploadState.status === "uploading" ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : uploadState.status === "done" ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <AlertCircle className="size-5 text-destructive" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {uploadState.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(uploadState.file.size)}
            </p>

            {uploadState.status === "uploading" && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            )}

            {uploadState.status === "error" && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3" />
                {uploadState.error}
              </p>
            )}

            {uploadState.status === "done" && (
              <p className="mt-0.5 text-xs text-green-600">Upload complete</p>
            )}
          </div>

          {uploadState.status === "error" && (
            <button
              type="button"
              onClick={() => setUploadState(null)}
              className="shrink-0 rounded-full p-1 hover:bg-muted"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone (show when no file or error) */}
      {(!hasFile || uploadState?.status === "error") && !isUploading && (
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
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="size-6 text-primary" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {dragOver
                ? `Drop your ${fileTypeLabel} here`
                : `Drag & drop your ${fileTypeLabel} here`}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse (max {formatBytes(maxSizeBytes)})
            </p>
          </div>

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
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
}
