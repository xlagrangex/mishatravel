"use client";

import { useState, useCallback, useTransition, useRef, useMemo } from "react";
import {
  Search,
  Trash2,
  Upload,
  FileText,
  Loader2,
  FolderOpen,
  FolderPlus,
  Check,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  getPdfItemsAction,
  getPdfFoldersAction,
  getPdfFolderCountsAction,
  deleteMediaAction,
  bulkDeleteMediaAction,
  moveToFolderAction,
  registerMediaAction,
  createFolderAction,
} from "./actions";
import { formatBytes, formatDate, PAGE_SIZE } from "./media-utils";
import type { MediaItem, MediaFolder } from "@/lib/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PdfLibraryProps {
  initialItems: MediaItem[];
  initialTotal: number;
  initialFolders: MediaFolder[];
  initialCounts: Record<string, number>;
}

export default function PdfLibrary({
  initialItems,
  initialTotal,
  initialFolders,
  initialCounts,
}: PdfLibraryProps) {
  // Data state
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [folders, setFolders] = useState<MediaFolder[]>(initialFolders);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>(initialCounts);

  // UI state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "filename" | "file_size">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New folder
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalPdfCount = useMemo(() => {
    return Object.values(folderCounts).reduce((sum, c) => sum + c, 0);
  }, [folderCounts]);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const refreshItems = useCallback(
    async (opts?: { folder?: string | null; search?: string; pg?: number; sort?: string; order?: string }) => {
      const folderId = opts?.folder !== undefined ? opts.folder : selectedFolderId;
      const result = await getPdfItemsAction({
        folderId: folderId ?? undefined,
        search: opts?.search ?? searchQuery,
        page: opts?.pg ?? page,
        pageSize: PAGE_SIZE,
        sortBy: (opts?.sort as any) ?? sortBy,
        sortOrder: (opts?.order as any) ?? sortOrder,
      });
      setItems(result.items);
      setTotal(result.total);
    },
    [selectedFolderId, searchQuery, page, sortBy, sortOrder],
  );

  const refreshFolders = useCallback(async () => {
    const [f, c] = await Promise.all([getPdfFoldersAction(), getPdfFolderCountsAction()]);
    setFolders(f);
    setFolderCounts(c);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshItems(), refreshFolders()]);
  }, [refreshItems, refreshFolders]);

  // -------------------------------------------------------------------------
  // Folder selection
  // -------------------------------------------------------------------------

  const handleFolderSelect = useCallback(
    (folderId: string | null) => {
      setSelectedFolderId(folderId);
      setPage(1);
      setSelectedIds(new Set());
      setSelectedItem(null);
      startTransition(() => refreshItems({ folder: folderId, pg: 1 }));
    },
    [refreshItems],
  );

  // -------------------------------------------------------------------------
  // Search & sort
  // -------------------------------------------------------------------------

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      setPage(1);
      startTransition(() => refreshItems({ search: q, pg: 1 }));
    },
    [refreshItems],
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      const [field, order] = newSort.split("-");
      setSortBy(field as any);
      setSortOrder(order as any);
      setPage(1);
      startTransition(() => refreshItems({ sort: field, order, pg: 1 }));
    },
    [refreshItems],
  );

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      startTransition(() => refreshItems({ pg: newPage }));
    },
    [refreshItems],
  );

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [selectedIds, items]);

  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setIsUploading(true);
      const supabase = createClient();
      let uploaded = 0;

      for (const file of Array.from(files)) {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} non è un PDF`);
          continue;
        }

        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}_${sanitized}`;
        const bucket = "catalogs";

        const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) {
          toast.error(`Errore upload ${file.name}: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

        await registerMediaAction({
          filename: fileName,
          url: urlData.publicUrl,
          file_size: file.size,
          mime_type: "application/pdf",
          bucket,
          folder_id: selectedFolderId,
        });

        uploaded++;
      }

      if (uploaded > 0) {
        toast.success(`${uploaded} PDF caricati`);
        await refreshAll();
      }
      setIsUploading(false);
    },
    [selectedFolderId, refreshAll],
  );

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteMediaAction(id);
      if (result.success) {
        toast.success("PDF eliminato");
        if (selectedItem?.id === id) setSelectedItem(null);
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
        await refreshAll();
      } else {
        toast.error(result.error);
      }
    },
    [selectedItem, refreshAll],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const result = await bulkDeleteMediaAction(Array.from(selectedIds));
    if (result.success) {
      toast.success(`${selectedIds.size} PDF eliminati`);
      setSelectedIds(new Set());
      setSelectedItem(null);
      await refreshAll();
    } else {
      toast.error(result.error);
    }
  }, [selectedIds, refreshAll]);

  // -------------------------------------------------------------------------
  // Move to folder
  // -------------------------------------------------------------------------

  const handleMove = useCallback(
    async (ids: string[], folderId: string | null) => {
      const result = await moveToFolderAction(ids, folderId);
      if (result.success) {
        toast.success("PDF spostati");
        setSelectedIds(new Set());
        await refreshAll();
      } else {
        toast.error(result.error);
      }
    },
    [refreshAll],
  );

  // -------------------------------------------------------------------------
  // Create folder
  // -------------------------------------------------------------------------

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    const result = await createFolderAction(newFolderName.trim(), null, "pdf");
    if (result.success) {
      toast.success("Cartella creata");
      setNewFolderName("");
      setIsCreatingFolder(false);
      await refreshFolders();
    } else {
      toast.error(result.error);
    }
  }, [newFolderName, refreshFolders]);

  // -------------------------------------------------------------------------
  // Copy URL
  // -------------------------------------------------------------------------

  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success("URL copiato"),
      () => toast.error("Errore copia URL"),
    );
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0 rounded-lg border bg-white overflow-hidden">
      {/* ===== Sidebar ===== */}
      <div className="w-56 shrink-0 border-r flex flex-col">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Cartelle PDF</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {/* All PDFs */}
            <button
              onClick={() => handleFolderSelect(null)}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors text-left",
                selectedFolderId === null
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <FileText className="size-4 shrink-0" />
              <span className="truncate">Tutti i PDF</span>
              <span className="ml-auto text-xs text-gray-400">{totalPdfCount}</span>
            </button>

            {/* Folder list */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderSelect(folder.id)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors text-left",
                  selectedFolderId === folder.id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <FolderOpen className="size-4 shrink-0 text-amber-500" />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {folderCounts[folder.id] || 0}
                </span>
              </button>
            ))}

            {/* New folder button */}
            {isCreatingFolder ? (
              <div className="flex items-center gap-1 px-1 pt-1">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nome cartella"
                  className="h-7 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") { setIsCreatingFolder(false); setNewFolderName(""); }
                  }}
                />
                <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={handleCreateFolder}>
                  <Check className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FolderPlus className="size-4" />
                <span>Nuova cartella</span>
              </button>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Cerca PDF..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Piu recenti</SelectItem>
              <SelectItem value="created_at-asc">Meno recenti</SelectItem>
              <SelectItem value="filename-asc">Nome A-Z</SelectItem>
              <SelectItem value="filename-desc">Nome Z-A</SelectItem>
              <SelectItem value="file_size-desc">Piu grandi</SelectItem>
              <SelectItem value="file_size-asc">Piu piccoli</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                {/* Move bulk */}
                <Select onValueChange={(fid) => handleMove(Array.from(selectedIds), fid)}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <ArrowRight className="size-3.5 mr-1" />
                    Sposta ({selectedIds.size})
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Elimina ({selectedIds.size})
                </Button>
              </>
            )}

            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="size-3.5 mr-1" />
              )}
              Carica PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1">
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          )}
          {!isPending && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="size-12 mb-3" />
              <p className="text-sm">Nessun PDF trovato</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5 mr-1" />
                Carica il primo PDF
              </Button>
            </div>
          )}
          {!isPending && items.length > 0 && (
            <div className="p-3">
              {/* Select all */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="size-3.5 rounded border-gray-300"
                />
                <span className="text-xs text-gray-500">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} di ${total} selezionati`
                    : `${total} PDF`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isActive = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "group relative rounded-lg border bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md",
                        isActive && "ring-2 ring-[#C41E2F]",
                        isSelected && !isActive && "ring-2 ring-blue-500",
                      )}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                          onClick={(e) => e.stopPropagation()}
                          className="size-3.5 rounded border-gray-300"
                        />
                      </div>

                      {/* PDF Icon */}
                      <div className="aspect-[3/4] bg-gray-50 flex flex-col items-center justify-center gap-2 p-4">
                        <FileText className="size-10 text-red-500/60" />
                      </div>

                      {/* Info */}
                      <div className="p-2 border-t">
                        <p className="text-xs font-medium text-gray-700 truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatBytes(item.file_size)} · {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t text-sm">
            <span className="text-xs text-gray-500">
              Pagina {page} di {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Detail Panel ===== */}
      {selectedItem && (
        <div className="w-64 shrink-0 border-l flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Dettagli</h3>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => setSelectedItem(null)}>
              <X className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Preview */}
              <div className="flex items-center justify-center aspect-square bg-gray-50 rounded-lg">
                <FileText className="size-16 text-red-500/60" />
              </div>

              {/* File info */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Nome file</p>
                  <p className="text-sm font-medium text-gray-700 break-all">{selectedItem.filename}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Dimensione</p>
                  <p className="text-sm text-gray-700">{formatBytes(selectedItem.file_size)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Caricato il</p>
                  <p className="text-sm text-gray-700">{formatDate(selectedItem.created_at)}</p>
                </div>
                {selectedItem.bucket && (
                  <div>
                    <p className="text-xs text-gray-400">Bucket</p>
                    <p className="text-sm text-gray-700">{selectedItem.bucket}</p>
                  </div>
                )}
              </div>

              {/* Move to folder */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Cartella</p>
                <Select
                  value={selectedItem.folder_id || "none"}
                  onValueChange={(val) => {
                    const fid = val === "none" ? null : val;
                    handleMove([selectedItem.id], fid);
                    setSelectedItem({ ...selectedItem, folder_id: fid });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Nessuna —</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => copyUrl(selectedItem.url)}
                >
                  <Copy className="size-3.5 mr-1" />
                  Copia URL
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={() => window.open(selectedItem.url, "_blank")}
                >
                  <FileText className="size-3.5 mr-1" />
                  Apri PDF
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full h-8 text-xs"
                  onClick={() => handleDelete(selectedItem.id)}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Elimina
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
