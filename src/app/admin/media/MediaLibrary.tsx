"use client";

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from "react";
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
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Check,
  X,
  Copy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRightIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/supabase/queries/media";
import { buildFolderTree } from "@/lib/supabase/queries/media";
import {
  getMediaItemsAction,
  getMediaFoldersAction,
  getMediaFolderCountsAction,
  deleteMediaAction,
  bulkDeleteMediaAction,
  updateMediaAction,
  moveToFolderAction,
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
  registerMediaAction,
} from "./actions";
import type { MediaItem, MediaFolder, MediaFolderTreeNode } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number | null): string {
  if (!bytes) return "\u2014";
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

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "\u2014";
  }
}

/** Build breadcrumb path from folder tree */
function getBreadcrumbPath(
  folderId: string,
  folders: MediaFolder[]
): MediaFolder[] {
  const path: MediaFolder[] = [];
  let currentId: string | null = folderId;
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  while (currentId) {
    const folder = folderMap.get(currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parent_id;
  }
  return path;
}

/** Flatten tree for "move to" dropdown */
function flattenTree(
  nodes: MediaFolderTreeNode[]
): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  function walk(items: MediaFolderTreeNode[]) {
    for (const node of items) {
      result.push({ id: node.id, name: node.name, depth: node.depth });
      walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

const PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// FolderTreeItem - recursive sidebar component
// ---------------------------------------------------------------------------

interface FolderTreeItemProps {
  node: MediaFolderTreeNode;
  activeFolderId: string | null;
  expandedFolders: Set<string>;
  renamingFolderId: string | null;
  renameValue: string;
  creatingInParentId: string | null;
  newSubfolderName: string;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onStartRename: (id: string, name: string) => void;
  onConfirmRename: (id: string) => void;
  onCancelRename: () => void;
  onRenameValueChange: (value: string) => void;
  onStartCreateSubfolder: (parentId: string) => void;
  onConfirmCreateSubfolder: (parentId: string) => void;
  onCancelCreateSubfolder: () => void;
  onSubfolderNameChange: (value: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
}

function FolderTreeItem({
  node,
  activeFolderId,
  expandedFolders,
  renamingFolderId,
  renameValue,
  creatingInParentId,
  newSubfolderName,
  onSelect,
  onToggleExpand,
  onStartRename,
  onConfirmRename,
  onCancelRename,
  onRenameValueChange,
  onStartCreateSubfolder,
  onConfirmCreateSubfolder,
  onCancelCreateSubfolder,
  onSubfolderNameChange,
  onDeleteFolder,
}: FolderTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedFolders.has(node.id);
  const isActive = activeFolderId === node.id;
  const isRenaming = renamingFolderId === node.id;
  const isCreatingChild = creatingInParentId === node.id;
  const canCreateSubfolder = node.depth < 2; // max 3 levels

  return (
    <div>
      {isRenaming ? (
        <div
          className="flex items-center gap-1 px-2 py-1"
          style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
        >
          <Input
            value={renameValue}
            onChange={(e) => onRenameValueChange(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirmRename(node.id);
              if (e.key === "Escape") onCancelRename();
            }}
          />
          <button
            type="button"
            onClick={() => onConfirmRename(node.id)}
            className="rounded p-1 hover:bg-muted"
          >
            <Check className="size-3.5 text-green-600" />
          </button>
          <button
            type="button"
            onClick={onCancelRename}
            className="rounded p-1 hover:bg-muted"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="group relative">
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
          >
            {/* Expand/collapse chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className={cn(
                "shrink-0 rounded p-0.5 hover:bg-muted-foreground/20",
                !hasChildren && !canCreateSubfolder && "invisible",
              )}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRightIcon className="size-3.5" />
              )}
            </button>

            <FolderOpen className="size-4 shrink-0" />
            <span className="flex-1 text-left truncate">{node.name}</span>
            <span className="text-xs tabular-nums">{node.total_count}</span>

            {/* Folder actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span
                  role="button"
                  onClick={(e) => e.stopPropagation()}
                  className="invisible group-hover:visible rounded p-0.5 hover:bg-muted-foreground/20"
                >
                  <MoreHorizontal className="size-3.5" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canCreateSubfolder && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartCreateSubfolder(node.id);
                    }}
                  >
                    <FolderPlus className="size-4" />
                    Nuova sottocartella
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartRename(node.id, node.name);
                  }}
                >
                  <Pencil className="size-4" />
                  Rinomina
                </DropdownMenuItem>
                {node.name !== "general" && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(node.id, node.name);
                    }}
                  >
                    <Trash2 className="size-4" />
                    Elimina
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </button>
        </div>
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              activeFolderId={activeFolderId}
              expandedFolders={expandedFolders}
              renamingFolderId={renamingFolderId}
              renameValue={renameValue}
              creatingInParentId={creatingInParentId}
              newSubfolderName={newSubfolderName}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onStartRename={onStartRename}
              onConfirmRename={onConfirmRename}
              onCancelRename={onCancelRename}
              onRenameValueChange={onRenameValueChange}
              onStartCreateSubfolder={onStartCreateSubfolder}
              onConfirmCreateSubfolder={onConfirmCreateSubfolder}
              onCancelCreateSubfolder={onCancelCreateSubfolder}
              onSubfolderNameChange={onSubfolderNameChange}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}

      {/* Inline create subfolder input */}
      {isExpanded && isCreatingChild && (
        <div
          className="flex items-center gap-1 py-1"
          style={{ paddingLeft: `${(node.depth + 1) * 16 + 8}px`, paddingRight: 8 }}
        >
          <FolderPlus className="size-3.5 shrink-0 text-muted-foreground" />
          <Input
            value={newSubfolderName}
            onChange={(e) => onSubfolderNameChange(e.target.value)}
            placeholder="Nome sottocartella"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirmCreateSubfolder(node.id);
              if (e.key === "Escape") onCancelCreateSubfolder();
            }}
          />
          <button
            type="button"
            onClick={() => onConfirmCreateSubfolder(node.id)}
            className="rounded p-1 hover:bg-muted"
          >
            <Check className="size-3.5 text-green-600" />
          </button>
          <button
            type="button"
            onClick={onCancelCreateSubfolder}
            className="rounded p-1 hover:bg-muted"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MediaLibraryProps {
  initialItems: MediaItem[];
  initialTotal: number;
  initialFolders: MediaFolder[];
  initialCounts: Record<string, number>;
}

export default function MediaLibrary({
  initialItems,
  initialTotal,
  initialFolders,
  initialCounts,
}: MediaLibraryProps) {
  // Data state
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [folders, setFolders] = useState<MediaFolder[]>(initialFolders);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>(initialCounts);
  const [page, setPage] = useState(1);

  // Filter state
  const [search, setSearch] = useState("");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"created_at" | "filename" | "file_size">("created_at");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingInParentId, setCreatingInParentId] = useState<string | null>(null);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingAltText, setEditingAltText] = useState(false);
  const [altTextValue, setAltTextValue] = useState("");

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Computed: folder tree
  const folderTree = useMemo(
    () => buildFolderTree(folders, folderCounts),
    [folders, folderCounts],
  );

  // Computed: flat list for "move to" dropdowns
  const flatFolders = useMemo(() => flattenTree(folderTree), [folderTree]);

  // Computed: breadcrumb path
  const breadcrumbPath = useMemo(
    () => (activeFolderId ? getBreadcrumbPath(activeFolderId, folders) : []),
    [activeFolderId, folders],
  );

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchMedia = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      try {
        const result = await getMediaItemsAction({
          page: pageNum,
          pageSize: PAGE_SIZE,
          bucket: bucketFilter !== "all" ? bucketFilter : undefined,
          folderId: activeFolderId || undefined,
          search: search || undefined,
          sortBy,
        });
        setItems(result.items);
        setTotal(result.total);
        if (reset) {
          setSelectedIds(new Set());
          setDetailItem(null);
        }
      } catch {
        console.error("Error fetching media");
      } finally {
        setLoading(false);
      }
    },
    [bucketFilter, activeFolderId, search, sortBy],
  );

  const refreshFolders = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([
        getMediaFoldersAction(),
        getMediaFolderCountsAction(),
      ]);
      setFolders(f);
      setFolderCounts(c);
    } catch {
      console.error("Error fetching folders");
    }
  }, []);

  // Reload on filter changes
  useEffect(() => {
    setPage(1);
    fetchMedia(1, true);
  }, [bucketFilter, activeFolderId, search, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  // -----------------------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------------------

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = useCallback(
    (p: number) => {
      setPage(p);
      fetchMedia(p);
    },
    [fetchMedia],
  );

  // -----------------------------------------------------------------------
  // Selection
  // -----------------------------------------------------------------------

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [items, selectedIds.size]);

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Sei sicuro di voler eliminare questo file?")) return;
      startTransition(async () => {
        const result = await deleteMediaAction(id);
        if (!result.success) {
          alert(`Errore: ${result.error}`);
          return;
        }
        setItems((prev) => prev.filter((i) => i.id !== id));
        setTotal((prev) => prev - 1);
        if (detailItem?.id === id) setDetailItem(null);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        refreshFolders();
      });
    },
    [detailItem, refreshFolders],
  );

  const handleBulkDelete = useCallback(async () => {
    const count = selectedIds.size;
    if (!confirm(`Sei sicuro di voler eliminare ${count} file?`)) return;
    startTransition(async () => {
      const result = await bulkDeleteMediaAction(Array.from(selectedIds));
      if (!result.success) {
        alert(`Errore: ${result.error}`);
        return;
      }
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setTotal((prev) => prev - count);
      setSelectedIds(new Set());
      setDetailItem(null);
      refreshFolders();
    });
  }, [selectedIds, refreshFolders]);

  // -----------------------------------------------------------------------
  // Move to folder
  // -----------------------------------------------------------------------

  const handleMoveToFolder = useCallback(
    async (folderId: string) => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      startTransition(async () => {
        const result = await moveToFolderAction(ids, folderId);
        if (!result.success) {
          alert(`Errore: ${result.error}`);
          return;
        }
        fetchMedia(page);
        refreshFolders();
        setSelectedIds(new Set());
      });
    },
    [selectedIds, page, fetchMedia, refreshFolders],
  );

  // -----------------------------------------------------------------------
  // Folder tree interactions
  // -----------------------------------------------------------------------

  const handleToggleExpand = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const handleSelectFolder = useCallback((folderId: string) => {
    setActiveFolderId((prev) => (prev === folderId ? null : folderId));
  }, []);

  // -----------------------------------------------------------------------
  // Folder CRUD
  // -----------------------------------------------------------------------

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    startTransition(async () => {
      const result = await createFolderAction(newFolderName.trim());
      if (!result.success) {
        alert(`Errore: ${result.error}`);
        return;
      }
      setNewFolderName("");
      setCreatingFolder(false);
      refreshFolders();
    });
  }, [newFolderName, refreshFolders]);

  const handleStartCreateSubfolder = useCallback((parentId: string) => {
    setCreatingInParentId(parentId);
    setNewSubfolderName("");
    // Auto-expand the parent
    setExpandedFolders((prev) => new Set(prev).add(parentId));
  }, []);

  const handleConfirmCreateSubfolder = useCallback(
    async (parentId: string) => {
      if (!newSubfolderName.trim()) return;
      startTransition(async () => {
        const result = await createFolderAction(newSubfolderName.trim(), parentId);
        if (!result.success) {
          alert(`Errore: ${result.error}`);
          return;
        }
        setCreatingInParentId(null);
        setNewSubfolderName("");
        refreshFolders();
      });
    },
    [newSubfolderName, refreshFolders],
  );

  const handleCancelCreateSubfolder = useCallback(() => {
    setCreatingInParentId(null);
    setNewSubfolderName("");
  }, []);

  const handleStartRename = useCallback((folderId: string, currentName: string) => {
    setRenamingFolderId(folderId);
    setRenameValue(currentName);
  }, []);

  const handleConfirmRename = useCallback(
    async (folderId: string) => {
      if (!renameValue.trim()) {
        setRenamingFolderId(null);
        return;
      }
      startTransition(async () => {
        const result = await renameFolderAction(folderId, renameValue.trim());
        if (!result.success) {
          alert(`Errore: ${result.error}`);
          return;
        }
        setRenamingFolderId(null);
        refreshFolders();
      });
    },
    [renameValue, refreshFolders],
  );

  const handleCancelRename = useCallback(() => {
    setRenamingFolderId(null);
  }, []);

  const handleDeleteFolder = useCallback(
    async (folderId: string, name: string) => {
      if (!confirm(`Eliminare la cartella "${name}"? I file verranno spostati in "general".`)) return;
      startTransition(async () => {
        const result = await deleteFolderAction(folderId);
        if (!result.success) {
          alert(`Errore: ${result.error}`);
          return;
        }
        if (activeFolderId === folderId) setActiveFolderId(null);
        refreshFolders();
        fetchMedia(1, true);
      });
    },
    [activeFolderId, refreshFolders, fetchMedia],
  );

  // -----------------------------------------------------------------------
  // Detail panel actions
  // -----------------------------------------------------------------------

  const handleUpdateAltText = useCallback(async () => {
    if (!detailItem) return;
    startTransition(async () => {
      await updateMediaAction(detailItem.id, { alt_text: altTextValue });
      setDetailItem((prev) => prev ? { ...prev, alt_text: altTextValue } : null);
      setItems((prev) =>
        prev.map((i) => (i.id === detailItem.id ? { ...i, alt_text: altTextValue } : i)),
      );
      setEditingAltText(false);
    });
  }, [detailItem, altTextValue]);

  const handleMoveItem = useCallback(
    async (folderId: string) => {
      if (!detailItem) return;
      startTransition(async () => {
        await moveToFolderAction([detailItem.id], folderId);
        setDetailItem((prev) => prev ? { ...prev, folder_id: folderId } : null);
        fetchMedia(page);
        refreshFolders();
      });
    },
    [detailItem, page, fetchMedia, refreshFolders],
  );

  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
  }, []);

  // -----------------------------------------------------------------------
  // Upload
  // -----------------------------------------------------------------------

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const targetBucket = bucketFilter !== "all" ? bucketFilter : "general";
      setIsUploading(true);

      try {
        const supabase = createClient();
        for (const file of Array.from(files)) {
          const optimized = await convertToWebP(file);
          const sanitized = optimized.name
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .replace(/_+/g, "_");
          const filePath = `${Date.now()}_${sanitized}`;

          const { error } = await supabase.storage
            .from(targetBucket)
            .upload(filePath, optimized, { cacheControl: "3600", upsert: false });

          if (error) {
            alert(`Errore upload "${file.name}": ${error.message}`);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(filePath);

          await registerMediaAction({
            filename: filePath,
            url: urlData.publicUrl,
            file_size: optimized.size,
            mime_type: optimized.type,
            bucket: targetBucket,
            folder_id: activeFolderId || undefined,
          });
        }
        // Refresh
        fetchMedia(1, true);
        refreshFolders();
      } catch (err) {
        alert(`Errore upload: ${err instanceof Error ? err.message : "Errore sconosciuto"}`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [bucketFilter, activeFolderId, fetchMedia, refreshFolders],
  );

  // -----------------------------------------------------------------------
  // Computed
  // -----------------------------------------------------------------------

  const totalCount = Object.values(folderCounts).reduce((a, b) => a + b, 0);

  // Find active folder name for detail panel display
  const activeFolderName = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find((f) => f.id === activeFolderId)?.name ?? null;
  }, [activeFolderId, folders]);

  // Get folder name by ID for detail panel
  const getFolderName = useCallback(
    (folderId: string | null) => {
      if (!folderId) return "\u2014";
      return folders.find((f) => f.id === folderId)?.name ?? "\u2014";
    },
    [folders],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border bg-white">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleUpload}
      />

      {/* === FOLDER SIDEBAR === */}
      <div className="w-56 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Cartelle
          </h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {/* All files */}
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                activeFolderId === null
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ImageIcon className="size-4 shrink-0" />
              <span className="flex-1 text-left truncate">Tutti i file</span>
              <span className="text-xs tabular-nums">{totalCount}</span>
            </button>

            {/* Folder tree */}
            {folderTree.map((node) => (
              <FolderTreeItem
                key={node.id}
                node={node}
                activeFolderId={activeFolderId}
                expandedFolders={expandedFolders}
                renamingFolderId={renamingFolderId}
                renameValue={renameValue}
                creatingInParentId={creatingInParentId}
                newSubfolderName={newSubfolderName}
                onSelect={handleSelectFolder}
                onToggleExpand={handleToggleExpand}
                onStartRename={handleStartRename}
                onConfirmRename={handleConfirmRename}
                onCancelRename={handleCancelRename}
                onRenameValueChange={setRenameValue}
                onStartCreateSubfolder={handleStartCreateSubfolder}
                onConfirmCreateSubfolder={handleConfirmCreateSubfolder}
                onCancelCreateSubfolder={handleCancelCreateSubfolder}
                onSubfolderNameChange={setNewSubfolderName}
                onDeleteFolder={handleDeleteFolder}
              />
            ))}
          </div>
        </ScrollArea>

        {/* New root folder */}
        <div className="p-2 border-t">
          {creatingFolder ? (
            <div className="flex items-center gap-1">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome cartella"
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
                }}
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                className="rounded p-1 hover:bg-muted"
              >
                <Check className="size-4 text-green-600" />
              </button>
              <button
                type="button"
                onClick={() => { setCreatingFolder(false); setNewFolderName(""); }}
                className="rounded p-1 hover:bg-muted"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setCreatingFolder(true)}
            >
              <FolderPlus className="size-4" />
              Nuova cartella
            </Button>
          )}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 border-b">
          {/* Breadcrumb */}
          {breadcrumbPath.length > 0 && (
            <div className="flex items-center gap-1 text-sm mr-2">
              <button
                type="button"
                onClick={() => setActiveFolderId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tutti i file
              </button>
              {breadcrumbPath.map((folder) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setActiveFolderId(folder.id)}
                    className={cn(
                      "transition-colors",
                      folder.id === activeFolderId
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca file..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Bucket filter */}
          <Select value={bucketFilter} onValueChange={setBucketFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i bucket</SelectItem>
              {STORAGE_BUCKETS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ordina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Piu recenti</SelectItem>
              <SelectItem value="filename">Nome</SelectItem>
              <SelectItem value="file_size">Dimensione</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="size-4" />
                      Sposta ({selectedIds.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {flatFolders.map((f) => (
                      <DropdownMenuItem
                        key={f.id}
                        onClick={() => handleMoveToFolder(f.id)}
                      >
                        <span style={{ paddingLeft: `${f.depth * 12}px` }} className="flex items-center gap-2">
                          <FolderOpen className="size-4 shrink-0" />
                          {f.name}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                  Elimina ({selectedIds.size})
                </Button>
              </>
            )}

            {/* Select all */}
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={selectAll}>
                {selectedIds.size === items.length ? "Deseleziona" : "Seleziona tutti"}
              </Button>
            )}

            {/* Upload */}
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
        </div>

        {/* Content area */}
        <div className="flex flex-1 min-h-0">
          {/* Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                  <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Nessun file trovato
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search || bucketFilter !== "all" || activeFolderId
                      ? "Prova a modificare i filtri di ricerca."
                      : "Clicca \"Carica File\" per iniziare."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {items.map((item) => {
                      const IconComponent = getFileIcon(item.mime_type);
                      const selected = selectedIds.has(item.id);
                      const isDetail = detailItem?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "group relative overflow-hidden rounded-lg border bg-white transition-all cursor-pointer",
                            selected && "ring-2 ring-primary ring-offset-1",
                            isDetail && "ring-2 ring-primary",
                            !selected && !isDetail && "hover:shadow-md",
                          )}
                          onClick={() => setDetailItem(item)}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-square bg-muted">
                            {isImage(item.mime_type) ? (
                              <Image
                                src={item.url}
                                alt={item.alt_text || item.filename}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <IconComponent className="h-12 w-12 text-muted-foreground/40" />
                              </div>
                            )}

                            {/* Checkbox overlay */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(item.id);
                              }}
                              className={cn(
                                "absolute top-2 left-2 flex size-6 items-center justify-center rounded border-2 transition-all",
                                selected
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100",
                              )}
                            >
                              {selected && <Check className="size-3.5" />}
                            </button>
                          </div>

                          {/* File info */}
                          <div className="p-2.5">
                            <p className="truncate text-sm font-medium" title={item.filename}>
                              {item.filename}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                {item.bucket || "\u2014"}
                              </span>
                              <span>{formatBytes(item.file_size)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Pagina {page} di {totalPages} ({total} file)
                      </span>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={page >= totalPages}
                        onClick={() => goToPage(page + 1)}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* === DETAIL PANEL === */}
          {detailItem && (
            <div className="w-72 shrink-0 border-l bg-muted/20 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Preview */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border">
                  {isImage(detailItem.mime_type) ? (
                    <Image
                      src={detailItem.url}
                      alt={detailItem.alt_text || detailItem.filename}
                      fill
                      className="object-contain"
                      sizes="280px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {(() => {
                        const IC = getFileIcon(detailItem.mime_type);
                        return <IC className="h-16 w-16 text-muted-foreground/40" />;
                      })()}
                    </div>
                  )}
                </div>

                {/* Filename */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Nome file</p>
                  <p className="text-sm break-all">{detailItem.filename}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Dimensione</p>
                    <p className="text-sm">{formatBytes(detailItem.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Tipo</p>
                    <p className="text-sm truncate">{detailItem.mime_type || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Bucket</p>
                    <p className="text-sm">{detailItem.bucket || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Cartella</p>
                    <p className="text-sm">{getFolderName(detailItem.folder_id)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-0.5">Creato</p>
                    <p className="text-sm">{formatDate(detailItem.created_at)}</p>
                  </div>
                </div>

                {/* Alt text */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Alt Text</p>
                  {editingAltText ? (
                    <div className="flex gap-1">
                      <Input
                        value={altTextValue}
                        onChange={(e) => setAltTextValue(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateAltText();
                          if (e.key === "Escape") setEditingAltText(false);
                        }}
                      />
                      <button type="button" onClick={handleUpdateAltText} className="rounded p-1 hover:bg-muted">
                        <Check className="size-4 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAltTextValue(detailItem.alt_text || "");
                        setEditingAltText(true);
                      }}
                      className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      {detailItem.alt_text || "Clicca per aggiungere..."}
                    </button>
                  )}
                </div>

                {/* URL copy */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">URL</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => copyUrl(detailItem.url)}
                  >
                    <Copy className="size-3.5" />
                    Copia URL
                  </Button>
                </div>

                {/* Move to folder */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Sposta in</p>
                  <Select
                    value={detailItem.folder_id || ""}
                    onValueChange={handleMoveItem}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flatFolders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          <span style={{ paddingLeft: `${f.depth * 8}px` }}>
                            {f.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delete */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={isPending}
                  onClick={() => handleDelete(detailItem.id)}
                >
                  <Trash2 className="size-4" />
                  Elimina file
                </Button>

                {/* Close detail */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setDetailItem(null)}
                >
                  Chiudi dettagli
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
