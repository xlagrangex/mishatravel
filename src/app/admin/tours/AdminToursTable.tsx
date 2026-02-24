"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Map,
  Eye,
  EyeOff,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import type { TourListItem } from "@/lib/supabase/queries/tours";
import {
  deleteTourAction,
  toggleTourStatus,
  duplicateTourAction,
  bulkSetTourStatus,
  bulkDeleteTours,
} from "@/app/admin/tours/actions";

interface AdminToursTableProps {
  tours: TourListItem[];
}

export default function AdminToursTable({ tours }: AdminToursTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tours;
    const q = searchQuery.toLowerCase();
    return tours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.destination_name ?? "").toLowerCase().includes(q),
    );
  }, [searchQuery, tours]);

  // Clean up selectedIds when filters change (remove IDs no longer visible)
  const filteredIds = useMemo(
    () => new Set(filtered.map((t) => t.id)),
    [filtered],
  );

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
      setSelectedIds(new Set(filtered.map((t) => t.id)));
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
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${title}"? Questa azione non può essere annullata.`,
      )
    )
      return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTourAction(id);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setDeletingId(null);
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    setTogglingId(id);
    startTransition(async () => {
      const result = await toggleTourStatus(id, newStatus);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setTogglingId(null);
    });
  };

  const handleDuplicate = (id: string) => {
    setDuplicatingId(id);
    startTransition(async () => {
      const result = await duplicateTourAction(id);
      if (result.success) {
        toast.success("Tour duplicato con successo");
        router.push(`/admin/tours/${result.id}/modifica`);
      } else {
        toast.error(`Errore: ${result.error}`);
      }
      setDuplicatingId(null);
    });
  };

  const handleBulkDraft = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkSetTourStatus([...visibleSelectedIds], "draft");
      if (result.success) {
        toast.success(
          `${visibleSelectedIds.size} tour messi in bozza`,
        );
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  const handleBulkDelete = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkDeleteTours([...visibleSelectedIds]);
      if (result.success) {
        toast.success(
          `${visibleSelectedIds.size} tour eliminati`,
        );
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  const formatNextDeparture = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Tour
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci i tour disponibili nel catalogo
            {tours.length > 0 && (
              <span className="ml-1">({tours.length} totali)</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/nuovo">
            <Plus className="h-4 w-4" />
            Nuovo Tour
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo o destinazione..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Map className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun tour trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "Crea il tuo primo tour per iniziare."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/tours/nuovo">
                <Plus className="h-4 w-4" />
                Nuovo Tour
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
                    aria-label="Seleziona tutti"
                  />
                </TableHead>
                <TableHead className="w-[96px]">Immagine</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Destinazione</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tour) => (
                <TableRow
                  key={tour.id}
                  className={cn(
                    deletingId === tour.id && "opacity-50",
                    visibleSelectedIds.has(tour.id) && "bg-muted/50",
                  )}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={visibleSelectedIds.has(tour.id)}
                      onCheckedChange={() => toggleSelect(tour.id)}
                      aria-label={`Seleziona ${tour.title}`}
                    />
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell>
                    {tour.cover_image_url ? (
                      <div className="relative h-16 w-20 overflow-hidden rounded-md">
                        <Image
                          src={tour.cover_image_url}
                          alt={tour.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-20 items-center justify-center rounded-md bg-muted">
                        <Map className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title + slug preview */}
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/admin/tours/${tour.id}/modifica`}
                        className="font-medium hover:text-primary hover:underline line-clamp-1"
                      >
                        {tour.title}
                      </Link>
                      <Link
                        href={`/tours/${tour.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                      >
                        /tours/{tour.slug}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TableCell>

                  {/* Destination */}
                  <TableCell className="text-muted-foreground">
                    {tour.destination_name ?? "\u2014"}
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {tour.durata_notti
                      ? `${tour.durata_notti} notti`
                      : "\u2014"}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    {tour.prezzo_su_richiesta ? (
                      <span className="text-muted-foreground">
                        Su richiesta
                      </span>
                    ) : (
                      <span className="text-[#C41E2F]">
                        {displayPrice(tour.a_partire_da)}
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {tour.status === "published" &&
                    tour.next_departure_date === null ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-200 bg-orange-50 text-orange-700"
                      >
                        Scaduto
                      </Badge>
                    ) : tour.status === "published" &&
                      tour.next_departure_date !== null ? (
                      <div className="space-y-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs border-green-200 bg-green-50 text-green-700"
                        >
                          Pubblicato
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          Prossima:{" "}
                          {formatNextDeparture(tour.next_departure_date)}
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
                        title={
                          tour.status === "published"
                            ? "Metti in bozza"
                            : "Pubblica"
                        }
                        disabled={isPending && togglingId === tour.id}
                        onClick={() =>
                          handleToggleStatus(tour.id, tour.status)
                        }
                        className={cn(
                          tour.status === "published"
                            ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            : "text-green-600 hover:bg-green-50 hover:text-green-700",
                        )}
                      >
                        {tour.status === "published" ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">
                          {tour.status === "published"
                            ? "Metti in bozza"
                            : "Pubblica"}
                        </span>
                      </Button>

                      {/* Edit */}
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/tours/${tour.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>

                      {/* Duplicate */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Duplica"
                        disabled={isPending && duplicatingId === tour.id}
                        onClick={() => handleDuplicate(tour.id)}
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
                        disabled={isPending && deletingId === tour.id}
                        onClick={() => handleDelete(tour.id, tour.title)}
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
            {visibleSelectedIds.size} selezionat
            {visibleSelectedIds.size === 1 ? "o" : "i"}
          </span>

          <div className="h-5 w-px bg-border" />

          {/* Bulk set to draft */}
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
                  <strong>{visibleSelectedIds.size}</strong> tour. Questa azione
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
