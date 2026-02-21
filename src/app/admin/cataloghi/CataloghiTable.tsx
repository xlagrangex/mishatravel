"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Catalog } from "@/lib/types";
import { deleteCatalog } from "./actions";

interface CataloghiTableProps {
  catalogs: Catalog[];
}

export default function CataloghiTable({ catalogs }: CataloghiTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return catalogs;
    const q = searchQuery.toLowerCase();
    return catalogs.filter((c) => c.title.toLowerCase().includes(q));
  }, [searchQuery, catalogs]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"? Questa azione non può essere annullata.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCatalog(id);
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
            Cataloghi
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci i cataloghi PDF scaricabili
            {catalogs.length > 0 && (
              <span className="ml-1">({catalogs.length} totali)</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cataloghi/nuovo">
            <Plus className="h-4 w-4" />
            Nuovo Catalogo
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun catalogo trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Prova a modificare la ricerca."
              : "Crea il tuo primo catalogo per iniziare."}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/cataloghi/nuovo">
                <Plus className="h-4 w-4" />
                Nuovo Catalogo
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">Copertina</TableHead>
                <TableHead>Titolo</TableHead>
                <TableHead>Anno</TableHead>
                <TableHead>Anteprima</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((catalog) => (
                <TableRow key={catalog.id} className={cn(deletingId === catalog.id && "opacity-50")}>
                  {/* Thumbnail */}
                  <TableCell>
                    {catalog.cover_image_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={catalog.cover_image_url}
                          alt={catalog.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Titolo */}
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/cataloghi/${catalog.id}/modifica`}
                      className="hover:text-primary hover:underline"
                    >
                      {catalog.title}
                    </Link>
                  </TableCell>

                  {/* Anno */}
                  <TableCell className="text-muted-foreground">
                    {catalog.year ?? "—"}
                  </TableCell>

                  {/* Anteprima */}
                  <TableCell>
                    <Link
                      href="/cataloghi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      /cataloghi
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>

                  {/* Stato */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        catalog.is_published
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {catalog.is_published ? "Pubblicato" : "Nascosto"}
                    </Badge>
                  </TableCell>

                  {/* Azioni */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href={`/admin/cataloghi/${catalog.id}/modifica`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending && deletingId === catalog.id}
                        onClick={() => handleDelete(catalog.id, catalog.title)}
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
