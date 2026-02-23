"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Eye, FileText, Search, Archive, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { agencyBulkArchive } from "./actions";
import type { QuoteListItem } from "@/lib/supabase/queries/quotes";

// ---------------------------------------------------------------------------
// Status badge mapping
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  sent: {
    label: "Inviata",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  in_review: {
    label: "In revisione",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  requested: {
    label: "Richiesta inviata",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  offer_sent: {
    label: "Offerta ricevuta",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  offered: {
    label: "Offerta ricevuta",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  accepted: {
    label: "Accettata",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  confirmed: {
    label: "Confermata",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  payment_sent: {
    label: "Pagamento inviato",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  declined: {
    label: "Rifiutata",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  rejected: {
    label: "Respinta",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  archived: {
    label: "Archiviato",
    className: "bg-gray-100 text-gray-500 border-gray-300",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Terminal statuses (can be archived by agency)
// ---------------------------------------------------------------------------

const TERMINAL_STATUSES = ["confirmed", "declined", "rejected"];

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabKey = "all" | "pending" | "offer" | "accepted" | "declined" | "archived";

const TABS: { key: TabKey; label: string; statuses: string[] | null }[] = [
  { key: "all", label: "Tutti", statuses: null },
  {
    key: "pending",
    label: "In attesa",
    statuses: ["sent", "in_review", "requested"],
  },
  {
    key: "offer",
    label: "Offerta ricevuta",
    statuses: ["offer_sent", "offered"],
  },
  {
    key: "accepted",
    label: "Accettati",
    statuses: ["accepted", "confirmed", "payment_sent"],
  },
  {
    key: "declined",
    label: "Rifiutati",
    statuses: ["declined", "rejected"],
  },
  {
    key: "archived",
    label: "Archiviati",
    statuses: ["archived"],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PreventiviList({ quotes }: { quotes: QuoteListItem[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let result = quotes;

    // Tab filter — "all" excludes archived
    if (activeTab === "all") {
      result = result.filter((q) => q.status !== "archived");
    } else {
      const tab = TABS.find((t) => t.key === activeTab);
      if (tab?.statuses) {
        result = result.filter((q) => tab.statuses!.includes(q.status));
      }
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.tour_title ?? "").toLowerCase().includes(q) ||
          (r.cruise_title ?? "").toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [quotes, activeTab, searchQuery]);

  const getCount = (key: TabKey) => {
    if (key === "all") return quotes.filter((q) => q.status !== "archived").length;
    const tab = TABS.find((t) => t.key === key);
    return quotes.filter((q) => tab?.statuses?.includes(q.status)).length;
  };

  // Selection helpers
  const filteredIds = useMemo(() => new Set(filtered.map((q) => q.id)), [filtered]);

  const visibleSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => filteredIds.has(id))),
    [selectedIds, filteredIds]
  );

  const allVisibleSelected =
    filtered.length > 0 && visibleSelectedIds.size === filtered.length;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((q) => q.id)));
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

  // Only allow archiving quotes with terminal statuses
  const canArchiveSelection = useMemo(() => {
    if (visibleSelectedIds.size === 0) return false;
    return [...visibleSelectedIds].every((id) => {
      const q = quotes.find((quote) => quote.id === id);
      return q && TERMINAL_STATUSES.includes(q.status);
    });
  }, [visibleSelectedIds, quotes]);

  const handleBulkArchive = () => {
    if (visibleSelectedIds.size === 0) return;
    startTransition(async () => {
      await agencyBulkArchive([...visibleSelectedIds]);
      clearSelection();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Preventivi ({quotes.filter((q) => q.status !== "archived").length})
        </CardTitle>

        {/* Search bar */}
        <div className="relative max-w-sm pt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 translate-y-[-25%] text-muted-foreground" />
          <Input
            placeholder="Cerca tour, crociera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          {TABS.map((tab) => {
            const count = getCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  clearSelection();
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {activeTab === "all" && !searchQuery
                ? "Non hai ancora inviato richieste di preventivo."
                : "Nessun preventivo in questa categoria."}
            </p>
          </div>
        ) : (
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
                <TableHead>N.</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tour / Crociera</TableHead>
                <TableHead>Partecipanti</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, idx) => (
                <TableRow
                  key={q.id}
                  className={cn(
                    visibleSelectedIds.has(q.id) && "bg-muted/50"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={visibleSelectedIds.has(q.id)}
                      onCheckedChange={() => toggleSelect(q.id)}
                      aria-label={`Seleziona ${q.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {filtered.length - idx}
                  </TableCell>
                  <TableCell>
                    {new Date(q.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {q.request_type === "tour" ? "Tour" : "Crociera"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {q.tour_title ?? q.cruise_title ?? "-"}
                  </TableCell>
                  <TableCell>
                    {q.participants_adults ?? 0} adulti
                    {(q.participants_children ?? 0) > 0 &&
                      `, ${q.participants_children} bambini`}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/agenzia/preventivi/${q.id}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        Dettaglio
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Bulk Actions Toolbar (floating bar) */}
      {visibleSelectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-white px-5 py-3 shadow-lg">
          <span className="text-sm font-medium">
            {visibleSelectedIds.size} selezionat{visibleSelectedIds.size === 1 ? "o" : "i"}
          </span>

          <div className="h-5 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            disabled={isPending || !canArchiveSelection}
            title={
              canArchiveSelection
                ? "Archivia i preventivi selezionati"
                : "Puoi archiviare solo preventivi completati (confermati, rifiutati, respinti)"
            }
          >
            {isPending ? (
              <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="mr-1 h-3.5 w-3.5" />
            )}
            Archivia
          </Button>

          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="mr-1 h-3.5 w-3.5" />
            Deseleziona
          </Button>
        </div>
      )}
    </Card>
  );
}
