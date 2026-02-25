"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Ship, ExternalLink, Eye, EyeOff, X } from "lucide-react";
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
import type { ShipListItem } from "@/lib/supabase/queries/ships";
import {
  deleteShipAction,
  toggleShipStatus,
  bulkSetShipStatus,
  bulkDeleteShips,
} from "./actions";

interface FlottaTableProps {
  ships: ShipListItem[];
}

export default function FlottaTable({ ships }: FlottaTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return ships;
    const q = searchQuery.toLowerCase();
    return ships.filter((s) => s.name.toLowerCase().includes(q));
  }, [searchQuery, ships]);

  const filteredIds = useMemo(
    () => new Set(filtered.map((s) => s.id)),
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
      setSelectedIds(new Set(filtered.map((s) => s.id)));
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

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteShipAction(id);
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
      const result = await toggleShipStatus(id, newStatus);
      if (!result.success) {
        toast.error(`Errore: ${result.error}`);
      }
      setTogglingId(null);
    });
  };

  const handleBulkPublish = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkSetShipStatus([...visibleSelectedIds], "published");
      if (result.success) {
        toast.success(`${visibleSelectedIds.size} nav${visibleSelectedIds.size === 1 ? "e pubblicata" : "i pubblicate"}`);
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  const handleBulkDraft = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkSetShipStatus([...visibleSelectedIds], "draft");
      if (result.success) {
        toast.success(`${visibleSelectedIds.size} nav${visibleSelectedIds.size === 1 ? "e messa" : "i messe"} in bozza`);
        clearSelection();
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  const handleBulkDelete = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkDeleteShips([...visibleSelectedIds]);
      if (result.success) {
        toast.success(`${visibleSelectedIds.size} nav${visibleSelectedIds.size === 1 ? "e eliminata" : "i eliminate"}`);
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
            Flotta
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci le navi della flotta
            {ships.length > 0 && (
              <span className="ml-1">({ships.length} totali)</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/flotta/nuovo">
            <Plus className="h-4 w-4" />
            Nuova Nave
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome..."
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
            Nessuna nave trovata
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "Crea la tua prima nave per iniziare."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/flotta/nuovo">
                <Plus className="h-4 w-4" />
                Nuova Nave
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
                <TableHead className="w-[64px]">Immagine</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Anteprima</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ship) => (
                <TableRow
                  key={ship.id}
                  className={cn(
                    deletingId === ship.id && "opacity-50",
                    visibleSelectedIds.has(ship.id) && "bg-muted/50",
                  )}
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={visibleSelectedIds.has(ship.id)}
                      onCheckedChange={() => toggleSelect(ship.id)}
                      aria-label={`Seleziona ${ship.name}`}
                    />
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell>
                    {ship.cover_image_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={ship.cover_image_url}
                          alt={ship.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <Ship className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Nome */}
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/flotta/${ship.id}/modifica`}
                      className="hover:text-primary hover:underline"
                    >
                      {ship.name}
                    </Link>
                  </TableCell>

                  {/* Anteprima - slug cliccabile */}
                  <TableCell>
                    <Link
                      href={`/flotta/${ship.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      /flotta/{ship.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>

                  {/* Stato */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        ship.status === "published"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {ship.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </TableCell>

                  {/* Azioni */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Toggle publish/draft */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title={ship.status === "published" ? "Metti in bozza" : "Pubblica"}
                        disabled={isPending && togglingId === ship.id}
                        onClick={() => handleToggleStatus(ship.id, ship.status)}
                        className={cn(
                          ship.status === "published"
                            ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            : "text-green-600 hover:bg-green-50 hover:text-green-700"
                        )}
                      >
                        {ship.status === "published" ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">
                          {ship.status === "published" ? "Metti in bozza" : "Pubblica"}
                        </span>
                      </Button>

                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/flotta/${ship.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending && deletingId === ship.id}
                        onClick={() => handleDelete(ship.id, ship.name)}
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

          {/* Bulk publish */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkPublish}
            disabled={isPending}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Pubblica
          </Button>

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
                  <strong>{visibleSelectedIds.size}</strong> nav
                  {visibleSelectedIds.size === 1 ? "e" : "i"}. Questa azione
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
