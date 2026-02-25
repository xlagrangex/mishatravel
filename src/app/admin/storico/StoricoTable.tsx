"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, History } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityLogEntry } from "@/lib/supabase/queries/activity";

interface StoricoTableProps {
  activity: ActivityLogEntry[];
}

const ENTITY_FILTERS = [
  { label: "Tutti", value: "" },
  { label: "Tour", value: "tour" },
  { label: "Crociere", value: "cruise" },
  { label: "Flotta", value: "ship" },
  { label: "Destinazioni", value: "destination" },
  { label: "Blog", value: "blog" },
] as const;

const ENTITY_TYPE_LABELS: Record<string, string> = {
  tour: "Tour",
  cruise: "Crociera",
  ship: "Nave",
  destination: "Destinazione",
  blog: "Blog",
};

const ENTITY_TYPE_ADMIN_PATH: Record<string, string> = {
  tour: "tours",
  cruise: "crociere",
  ship: "flotta",
  destination: "destinazioni",
  blog: "blog",
};

function getActionBadge(action: string) {
  if (action.endsWith(".create"))
    return { label: "Creato", className: "border-green-200 bg-green-50 text-green-700" };
  if (action.endsWith(".update"))
    return { label: "Modificato", className: "border-blue-200 bg-blue-50 text-blue-700" };
  if (action.endsWith(".delete"))
    return { label: "Eliminato", className: "border-red-200 bg-red-50 text-red-700" };
  if (action.endsWith(".publish"))
    return { label: "Pubblicato", className: "border-green-200 bg-green-50 text-green-700" };
  if (action.endsWith(".unpublish"))
    return { label: "In bozza", className: "border-orange-200 bg-orange-50 text-orange-700" };
  if (action.endsWith(".duplicate"))
    return { label: "Duplicato", className: "border-cyan-200 bg-cyan-50 text-cyan-700" };
  if (action.endsWith(".bulk_draft"))
    return { label: "Bozza (bulk)", className: "border-orange-200 bg-orange-50 text-orange-700" };
  if (action.endsWith(".bulk_delete"))
    return { label: "Eliminati (bulk)", className: "border-red-200 bg-red-50 text-red-700" };
  return { label: action, className: "border-gray-200 bg-gray-50 text-gray-600" };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StoricoTable({ activity }: StoricoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const filtered = useMemo(() => {
    let items = activity;

    if (entityFilter) {
      items = items.filter((a) => a.entity_type === entityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          (a.entity_title ?? "").toLowerCase().includes(q) ||
          (a.user_email ?? "").toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          (a.details ?? "").toLowerCase().includes(q),
      );
    }

    return items;
  }, [activity, searchQuery, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Storico Modifiche
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro delle azioni eseguite nel pannello admin
          {activity.length > 0 && (
            <span className="ml-1">({activity.length} eventi)</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, email, azione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {ENTITY_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={entityFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setEntityFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <History className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun evento trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || entityFilter
              ? "Prova a modificare i filtri."
              : "Le azioni admin verranno registrate qui."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Ora</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Azione</TableHead>
                <TableHead>Elemento</TableHead>
                <TableHead>Dettagli</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const badge = getActionBadge(entry.action);
                const adminPath = entry.entity_type
                  ? ENTITY_TYPE_ADMIN_PATH[entry.entity_type]
                  : null;
                const entityLabel = entry.entity_type
                  ? ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type
                  : null;

                return (
                  <TableRow key={entry.id}>
                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </TableCell>

                    {/* User */}
                    <TableCell className="text-sm">
                      {entry.user_email ?? (
                        <span className="text-muted-foreground">Sconosciuto</span>
                      )}
                    </TableCell>

                    {/* Action Badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", badge.className)}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>

                    {/* Entity */}
                    <TableCell>
                      <div className="space-y-0.5">
                        {entityLabel && (
                          <span className="text-xs text-muted-foreground">
                            {entityLabel}
                          </span>
                        )}
                        {entry.entity_title && adminPath && entry.entity_id && !entry.action.endsWith(".delete") ? (
                          <Link
                            href={`/admin/${adminPath}/${entry.entity_id}/modifica`}
                            className="block text-sm font-medium hover:text-primary hover:underline line-clamp-1"
                          >
                            {entry.entity_title}
                          </Link>
                        ) : (
                          <span className="block text-sm font-medium line-clamp-1">
                            {entry.entity_title ?? "\u2014"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                      {entry.details ? (
                        <span className="line-clamp-2">{entry.details}</span>
                      ) : (
                        <span className="text-muted-foreground/50">&mdash;</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
