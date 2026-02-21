"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, ExternalLink, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TourListItem } from "@/lib/supabase/queries/tours";
import { deleteTourAction } from "@/app/admin/tours/actions";

interface AdminToursTableProps {
  tours: TourListItem[];
}

export default function AdminToursTable({ tours }: AdminToursTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tours;
    const q = searchQuery.toLowerCase();
    return tours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.destination_name ?? "").toLowerCase().includes(q),
    );
  }, [searchQuery, tours]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTourAction(id);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      }
      setDeletingId(null);
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
                <TableHead className="w-[64px]">Immagine</TableHead>
                <TableHead>Titolo</TableHead>
                <TableHead>Anteprima</TableHead>
                <TableHead>Destinazione</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tour) => (
                <TableRow key={tour.id} className={cn(deletingId === tour.id && "opacity-50")}>
                  {/* Thumbnail */}
                  <TableCell>
                    {tour.cover_image_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={tour.cover_image_url}
                          alt={tour.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <Map className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title */}
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/tours/${tour.id}/modifica`}
                      className="hover:text-primary hover:underline"
                    >
                      {tour.title}
                    </Link>
                  </TableCell>

                  {/* Anteprima - slug cliccabile */}
                  <TableCell>
                    <Link
                      href={`/tours/${tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      /tours/{tour.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>

                  {/* Destination */}
                  <TableCell className="text-muted-foreground">
                    {tour.destination_name ?? "\u2014"}
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="text-muted-foreground">
                    {tour.durata_notti ?? "\u2014"}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-sm text-muted-foreground">
                    {tour.a_partire_da ?? "\u2014"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        tour.status === "published"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {tour.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/tours/${tour.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
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
    </div>
  );
}
