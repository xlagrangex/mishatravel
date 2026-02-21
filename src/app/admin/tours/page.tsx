"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Eye, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Mock data - TODO: Replace with Supabase query
// ---------------------------------------------------------------------------

interface TourListItem {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  destination_name: string;
  durata_notti: string;
  a_partire_da: string;
  status: "draft" | "published";
}

const mockTours: TourListItem[] = [
  {
    id: "1",
    title: "Tour della Grecia Classica",
    slug: "tour-grecia-classica",
    cover_image_url: null,
    destination_name: "Grecia",
    durata_notti: "7 notti",
    a_partire_da: "1.290\u20AC a persona",
    status: "published",
  },
  {
    id: "2",
    title: "Marocco Imperiale",
    slug: "marocco-imperiale",
    cover_image_url: null,
    destination_name: "Marocco",
    durata_notti: "9 notti",
    a_partire_da: "1.590\u20AC a persona",
    status: "published",
  },
  {
    id: "3",
    title: "Giordania e Petra",
    slug: "giordania-petra",
    cover_image_url: null,
    destination_name: "Giordania",
    durata_notti: "8 notti",
    a_partire_da: "Prezzo su richiesta",
    status: "draft",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminToursPage() {
  const [search, setSearch] = useState("");

  const filteredTours = useMemo(() => {
    if (!search.trim()) return mockTours;
    const q = search.toLowerCase();
    return mockTours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.destination_name.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Tour
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestisci i tour disponibili nel catalogo
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/nuovo">
            <Plus className="mr-2 size-4" />
            Nuovo Tour
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per titolo o destinazione..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tours Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Immagine</TableHead>
              <TableHead>Titolo</TableHead>
              <TableHead>Destinazione</TableHead>
              <TableHead>Durata</TableHead>
              <TableHead>Prezzo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-[80px] text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTours.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Nessun tour trovato.
                </TableCell>
              </TableRow>
            ) : (
              filteredTours.map((tour) => (
                <TableRow key={tour.id}>
                  {/* Thumbnail */}
                  <TableCell>
                    <div className="size-12 overflow-hidden rounded-md border bg-muted">
                      {tour.cover_image_url ? (
                        <Image
                          src={tour.cover_image_url}
                          alt={tour.title}
                          width={48}
                          height={48}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell className="font-medium">{tour.title}</TableCell>

                  {/* Destination */}
                  <TableCell>{tour.destination_name}</TableCell>

                  {/* Duration */}
                  <TableCell>{tour.durata_notti}</TableCell>

                  {/* Price */}
                  <TableCell className="text-sm">
                    {tour.a_partire_da}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={
                        tour.status === "published" ? "default" : "outline"
                      }
                      className={
                        tour.status === "published"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "text-muted-foreground"
                      }
                    >
                      {tour.status === "published"
                        ? "Pubblicato"
                        : "Bozza"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Azioni</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tours/${tour.id}/modifica`}>
                            <Pencil className="mr-2 size-4" />
                            Modifica
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/tours/${tour.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-2 size-4" />
                            Visualizza
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            // TODO: Implement delete with Supabase
                            console.log("Delete tour:", tour.id);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
