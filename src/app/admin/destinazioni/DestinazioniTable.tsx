"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/types";
import { deleteDestination } from "./actions";

interface DestinazioniTableProps {
  destinations: Destination[];
}

export default function DestinazioniTable({ destinations }: DestinazioniTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return destinations;
    const q = searchQuery.toLowerCase();
    return destinations.filter((d) => d.name.toLowerCase().includes(q));
  }, [searchQuery, destinations]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteDestination(id);
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
            Destinazioni
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci le destinazioni dei tour e delle crociere
            {destinations.length > 0 && (
              <span className="ml-1">({destinations.length} totali)</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/destinazioni/nuovo">
            <Plus className="h-4 w-4" />
            Nuova Destinazione
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
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessuna destinazione trovata
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "Crea la tua prima destinazione per iniziare."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/destinazioni/nuovo">
                <Plus className="h-4 w-4" />
                Nuova Destinazione
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
                <TableHead>Nome</TableHead>
                <TableHead>Anteprima</TableHead>
                <TableHead>Macro Area</TableHead>
                <TableHead>Coordinate</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((destination) => (
                <TableRow key={destination.id} className={cn(deletingId === destination.id && "opacity-50")}>
                  {/* Thumbnail */}
                  <TableCell>
                    {destination.cover_image_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={destination.cover_image_url}
                          alt={destination.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Nome */}
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/destinazioni/${destination.id}/modifica`}
                      className="hover:text-primary hover:underline"
                    >
                      {destination.name}
                    </Link>
                  </TableCell>

                  {/* Anteprima - slug cliccabile */}
                  <TableCell>
                    <Link
                      href={`/destinazioni/${destination.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      /destinazioni/{destination.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>

                  {/* Macro Area */}
                  <TableCell className="text-muted-foreground">
                    {destination.macro_area ?? "—"}
                  </TableCell>

                  {/* Coordinate */}
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {destination.coordinate ?? "—"}
                  </TableCell>

                  {/* Stato */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        destination.status === "published"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {destination.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </TableCell>

                  {/* Azioni */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/destinazioni/${destination.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending && deletingId === destination.id}
                        onClick={() => handleDelete(destination.id, destination.name)}
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
