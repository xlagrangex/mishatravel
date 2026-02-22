"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, ExternalLink, Ship, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { displayPrice } from "@/lib/format";
import type { CruiseListItem } from "@/lib/supabase/queries/cruises";
import { deleteCruiseAction, toggleCruiseStatus } from "@/app/admin/crociere/actions";

interface CrociereTableProps {
  cruises: CruiseListItem[];
}

export default function CrociereTable({ cruises }: CrociereTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCruiseAction(id);
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
      const result = await toggleCruiseStatus(id, newStatus);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setTogglingId(null);
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
                <TableRow key={cruise.id} className={cn(deletingId === cruise.id && "opacity-50")}>
                  {/* Thumbnail - bigger */}
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

                  {/* Price - formatted */}
                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    {cruise.prezzo_su_richiesta
                      ? <span className="text-muted-foreground">Su richiesta</span>
                      : <span className="text-[#C41E2F]">{displayPrice(cruise.a_partire_da)}</span>
                    }
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        cruise.status === "published"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {cruise.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
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

                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/crociere/${cruise.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
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
    </div>
  );
}
