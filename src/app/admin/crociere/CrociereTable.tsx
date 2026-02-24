"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, ExternalLink, Ship, Eye, EyeOff, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { displayPrice } from "@/lib/format";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";
import {
  deleteCruiseAction,
  toggleCruiseStatus,
  duplicateCruiseAction,
  bulkSetCruiseStatus,
  bulkDeleteCruises,
} from "@/app/admin/crociere/actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNextDeparture(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CrociereTableProps {
  cruises: CruiseListItem[];
}

export default function CrociereTable({ cruises }: CrociereTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return cruises;
    const q = searchQuery.toLowerCase();
    return cruises.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.ship_name ?? "").toLowerCase().includes(q) ||
        (c.destination_name ?? "").toLowerCase().includes(q),
    );
  }, [searchQuery, cruises]);

  // Clean up selectedIds when filters change (remove IDs no longer visible)
  const filteredIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered]);

  const visibleSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => filteredIds.has(id))),
    [selectedIds, filteredIds],
  );

  const allVisibleSelected =
    filtered.length > 0 && visibleSelectedIds.size === filtered.length;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCruiseAction(id);
      if (!result.success) {
        toast.error(`Errore: ${result.error}`);
      } else {
        toast.success("Crociera eliminata");
      }
      setDeletingId(null);
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    setTogglingId(id);
    startTransition(async () => {
      const result = await toggleCruiseStatus(id, newStatus);
      if (!result.success) {
        toast.error(`Errore: ${result.error}`);
      }
      setTogglingId(null);
    });
  };

  const handleDuplicate = (id: string) => {
    setDuplicatingId(id);
    startTransition(async () => {
      const result = await duplicateCruiseAction(id);
      if (result.success) {
        toast.success("Crociera duplicata");
        router.push(`/admin/crociere/${result.id}/modifica`);
      } else {
        toast.error(`Errore: ${result.error}`);
      }
      setDuplicatingId(null);
    });
  };

  const handleBulkDraft = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkSetCruiseStatus([...visibleSelectedIds], "draft");
      if (result.success) {
        toast.success(`${visibleSelectedIds.size} crocier${visibleSelectedIds.size === 1 ? "a messa" : "e messe"} in bozza`);
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  const handleBulkDelete = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkDeleteCruises([...visibleSelectedIds]);
      if (result.success) {
        toast.success(`${visibleSelectedIds.size} crocier${visibleSelectedIds.size === 1 ? "a eliminata" : "e eliminate"}`);
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Crociere Fluviali
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci le crociere fluviali nel catalogo
            {cruises.length > 0 && (
              <span className="ml-1">({cruises.length} totali)</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/crociere/nuovo">
            <Plus className="h-4 w-4" />
            Nuova Crociera
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo, nave o destinazione..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Ship className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessuna crociera trovata
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "Crea la tua prima crociera per iniziare."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/crociere/nuovo">
                <Plus className="h-4 w-4" />
                Nuova Crociera
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleziona tutte"
                  />
                </TableHead>
                <TableHead className="w-[96px]">Immagine</TableHead>
                <TableHead>Crociera</TableHead>
                <TableHead>Nave</TableHead>
                <TableHead>Destinazione</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cruise) => (
                <TableRow
                  key={cruise.id}
                  className={cn(
                    deletingId === cruise.id && "opacity-50",
                    visibleSelectedIds.has(cruise.id) && "bg-muted/50",
                  )}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={visibleSelectedIds.has(cruise.id)}
                      onCheckedChange={() => toggleSelect(cruise.id)}
                      aria-label={`Seleziona ${cruise.title}`}
                    />
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell>
                    {cruise.cover_image_url ? (
                      <div className="relative h-16 w-20 overflow-hidden rounded-md">
                        <Image
                          src={cruise.cover_image_url}
                          alt={cruise.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-20 items-center justify-center rounded-md bg-muted">
                        <Ship className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title + slug preview */}
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/admin/crociere/${cruise.id}/modifica`}
                        className="font-medium hover:text-primary hover:underline line-clamp-1"
                      >
                        {cruise.title}
                      </Link>
                      <Link
                        href={`/crociere/${cruise.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                      >
                        /crociere/{cruise.slug}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TableCell>

                  {/* Ship */}
                  <TableCell className="text-muted-foreground">
                    {cruise.ship_name ?? "\u2014"}
                  </TableCell>

                  {/* Destination */}
                  <TableCell className="text-muted-foreground">
                    {cruise.destination_name ?? "\u2014"}
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {cruise.durata_notti ? `${cruise.durata_notti} notti` : "\u2014"}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    {cruise.prezzo_su_richiesta
                      ? <span className="text-muted-foreground">Su richiesta</span>
                      : <span className="text-[#C41E2F]">{displayPrice(cruise.a_partire_da)}</span>
                    }
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {cruise.status === "published" && cruise.next_departure_date === null ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-200 bg-orange-50 text-orange-700"
                      >
                        Scaduto
                      </Badge>
                    ) : cruise.status === "published" ? (
                      <div className="space-y-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs border-green-200 bg-green-50 text-green-700"
                        >
                          Pubblicato
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          {formatNextDeparture(cruise.next_departure_date!)}
                        </p>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-200 bg-gray-50 text-gray-600"
                      >
                        Bozza
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle publish/draft */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title={cruise.status === "published" ? "Metti in bozza" : "Pubblica"}
                        disabled={isPending && togglingId === cruise.id}
                        onClick={() => handleToggleStatus(cruise.id, cruise.status)}
                        className={cn(
                          cruise.status === "published"
                            ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            : "text-green-600 hover:bg-green-50 hover:text-green-700"
                        )}
                      >
                        {cruise.status === "published" ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">
                          {cruise.status === "published" ? "Metti in bozza" : "Pubblica"}
                        </span>
                      </Button>

                      {/* Edit */}
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/crociere/${cruise.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>

                      {/* Duplicate */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Duplica"
                        disabled={isPending && duplicatingId === cruise.id}
                        onClick={() => handleDuplicate(cruise.id)}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Duplica</span>
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending && deletingId === cruise.id}
                        onClick={() => handleDelete(cruise.id, cruise.title)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Elimina</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bulk Actions Toolbar (floating bar) */}
      {visibleSelectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-white px-5 py-3 shadow-lg">
          <span className="text-sm font-medium">
            {visibleSelectedIds.size} selezionat{visibleSelectedIds.size === 1 ? "a" : "e"}
          </span>

          <div className="h-5 w-px bg-border" />

          {/* Bulk draft */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDraft}
            disabled={isPending}
          >
            <EyeOff className="mr-1 h-3.5 w-3.5" />
            Metti in bozza
          </Button>

          {/* Bulk delete with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={isPending}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Elimina
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Stai per eliminare definitivamente{" "}
                  <strong>{visibleSelectedIds.size}</strong> crocier
                  {visibleSelectedIds.size === 1 ? "a" : "e"}. Questa azione
                  non puo essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Elimina definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="h-5 w-px bg-border" />

          {/* Deselect */}
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="mr-1 h-3.5 w-3.5" />
            Deseleziona
          </Button>
        </div>
      )}
    </div>
  );
}
