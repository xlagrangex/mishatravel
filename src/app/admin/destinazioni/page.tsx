"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/types";

// TODO: Replace with Supabase query
const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Roma",
    slug: "roma",
    description: "La capitale eterna, ricca di storia e cultura millenaria.",
    cover_image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&h=200&fit=crop",
    coordinate: "41.9028, 12.4964",
    macro_area: "Europa",
    sort_order: 1,
    status: "published",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Tokyo",
    slug: "tokyo",
    description: "La metropoli dove tradizione e modernità si incontrano.",
    cover_image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=200&fit=crop",
    coordinate: "35.6762, 139.6503",
    macro_area: "Asia",
    sort_order: 2,
    status: "published",
    created_at: "2025-01-16T10:00:00Z",
    updated_at: "2025-01-16T10:00:00Z",
  },
  {
    id: "3",
    name: "Cartagena",
    slug: "cartagena",
    description: "Perla coloniale della Colombia affacciata sui Caraibi.",
    cover_image_url: null,
    coordinate: "10.3910, -75.5364",
    macro_area: "America Latina",
    sort_order: 3,
    status: "draft",
    created_at: "2025-01-17T10:00:00Z",
    updated_at: "2025-01-17T10:00:00Z",
  },
];

export default function DestinazioniPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return mockDestinations;
    const query = searchQuery.toLowerCase();
    return mockDestinations.filter((d) =>
      d.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleDelete = (id: string, name: string) => {
    // TODO: Replace with Supabase delete + confirmation dialog
    if (confirm(`Sei sicuro di voler eliminare "${name}"?`)) {
      console.log("Delete destination:", id);
      alert("Destinazione eliminata (mock)");
    }
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
      {filteredDestinations.length === 0 ? (
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
                <TableHead>Macro Area</TableHead>
                <TableHead>Coordinate</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDestinations.map((destination) => (
                <TableRow key={destination.id}>
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
                    {destination.name}
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
                      {destination.status === "published"
                        ? "Pubblicato"
                        : "Bozza"}
                    </Badge>
                  </TableCell>

                  {/* Azioni */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link
                          href={`/admin/destinazioni/${destination.id}/modifica`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Modifica</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          handleDelete(destination.id, destination.name)
                        }
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
