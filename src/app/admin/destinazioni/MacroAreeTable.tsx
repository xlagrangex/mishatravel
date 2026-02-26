"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Globe, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MacroArea } from "@/lib/types";
import { deleteMacroArea, toggleMacroAreaStatus } from "./macro-aree/actions";

interface MacroAreeTableProps {
  macroAreas: MacroArea[];
}

export default function MacroAreeTable({ macroAreas }: MacroAreeTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return macroAreas;
    const q = searchQuery.toLowerCase();
    return macroAreas.filter((a) => a.name.toLowerCase().includes(q));
  }, [searchQuery, macroAreas]);

  const handleToggle = (id: string, current: string) => {
    setTogglingId(id);
    const newStatus = current === "published" ? "draft" : "published";
    startTransition(async () => {
      const result = await toggleMacroAreaStatus(id, newStatus as "published" | "draft");
      if (!result.success) toast.error(result.error);
      else toast.success(newStatus === "published" ? "Pubblicata" : "Messa in bozza");
      setTogglingId(null);
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteMacroArea(id);
      if (!result.success) toast.error(result.error);
      else toast.success("Macro area eliminata");
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cerca macro area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/admin/destinazioni/macro-aree/nuovo">
          <Button size="sm">
            <Plus className="size-4 mr-1.5" />
            Nuova Macro Area
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px]">Img</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center w-[80px]">Ordine</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Globe className="size-8" />
                    <p>Nessuna macro area trovata</p>
                    {!searchQuery && (
                      <Link href="/admin/destinazioni/macro-aree/nuovo">
                        <Button size="sm" variant="outline">Crea la prima macro area</Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>
                    {area.cover_image_url ? (
                      <div className="relative size-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={area.cover_image_url}
                          alt={area.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Globe className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/destinazioni/macro-aree/${area.id}/modifica`}
                      className="font-medium text-foreground hover:text-[#C41E2F] transition-colors"
                    >
                      {area.name}
                    </Link>
                    {area.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {area.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {area.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-mono">{area.sort_order}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={area.status === "published" ? "default" : "secondary"}>
                      {area.status === "published" ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        disabled={isPending && togglingId === area.id}
                        onClick={() => handleToggle(area.id, area.status)}
                        title={area.status === "published" ? "Metti in bozza" : "Pubblica"}
                      >
                        {area.status === "published" ? (
                          <Eye className="size-4 text-green-600" />
                        ) : (
                          <EyeOff className="size-4 text-amber-500" />
                        )}
                      </Button>
                      <Link href={`/admin/destinazioni/macro-aree/${area.id}/modifica`}>
                        <Button size="icon" variant="ghost" className="size-8">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-red-500 hover:text-red-700"
                            disabled={isPending && deletingId === area.id}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminare &ldquo;{area.name}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              La macro area verra eliminata. Le destinazioni collegate perderanno il
                              riferimento a questa area.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(area.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
