"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { Search, History, ChevronDown, ChevronRight } from "lucide-react";
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
  { label: "Preventivi", value: "quote" },
  { label: "Media", value: "media" },
  { label: "Agenzie", value: "agency" },
  { label: "Messaggi", value: "message" },
  { label: "Cataloghi", value: "catalog" },
] as const;

const ENTITY_TYPE_LABELS: Record<string, string> = {
  tour: "Tour",
  cruise: "Crociera",
  ship: "Nave",
  destination: "Destinazione",
  blog: "Blog",
  quote: "Preventivo",
  media: "Media",
  agency: "Agenzia",
  message: "Messaggio",
  catalog: "Catalogo",
};

const ENTITY_TYPE_ADMIN_PATH: Record<string, string> = {
  tour: "tours",
  cruise: "crociere",
  ship: "flotta",
  destination: "destinazioni",
  blog: "blog",
  quote: "preventivi",
  media: "media",
  agency: "agenzie",
  message: "messaggi",
  catalog: "cataloghi",
};

const ACTION_BADGES: Record<string, { label: string; className: string }> = {
  // Quote-specific
  "quote.status_change": { label: "Stato cambiato", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  "quote.offer_created": { label: "Offerta creata", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.payment_sent": { label: "Dati pagamento", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "quote.payment_confirmed": { label: "Pagamento confermato", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.contract_sent": { label: "Contratto inviato", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "quote.booking_confirmed": { label: "Prenotazione", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.document_uploaded": { label: "Doc. caricato", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "quote.document_deleted": { label: "Doc. eliminato", className: "border-red-200 bg-red-50 text-red-700" },
  "quote.rejected": { label: "Rifiutato", className: "border-red-200 bg-red-50 text-red-700" },
  "quote.offer_revoked": { label: "Offerta revocata", className: "border-red-200 bg-red-50 text-red-700" },
  "quote.bulk_status": { label: "Stato (bulk)", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  "quote.bulk_delete": { label: "Eliminati (bulk)", className: "border-red-200 bg-red-50 text-red-700" },
  "quote.reminder_sent": { label: "Sollecito", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  "quote.offer_accepted": { label: "Offerta accettata", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.offer_declined": { label: "Offerta rifiutata", className: "border-red-200 bg-red-50 text-red-700" },
  "quote.contract_signed": { label: "Contratto firmato", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.receipt_uploaded": { label: "Ricevuta caricata", className: "border-blue-200 bg-blue-50 text-blue-700" },
  "quote.payment_confirmed_agency": { label: "Pagamento (agenzia)", className: "border-green-200 bg-green-50 text-green-700" },
  "quote.bulk_archive": { label: "Archiviati (bulk)", className: "border-gray-200 bg-gray-50 text-gray-600" },
  // Media
  "media.upload": { label: "Caricato", className: "border-green-200 bg-green-50 text-green-700" },
  "media.delete": { label: "Eliminato", className: "border-red-200 bg-red-50 text-red-700" },
  "media.bulk_delete": { label: "Eliminati (bulk)", className: "border-red-200 bg-red-50 text-red-700" },
  "media.folder_created": { label: "Cartella creata", className: "border-green-200 bg-green-50 text-green-700" },
  "media.folder_deleted": { label: "Cartella eliminata", className: "border-red-200 bg-red-50 text-red-700" },
  // Messages
  "message.delete": { label: "Eliminato", className: "border-red-200 bg-red-50 text-red-700" },
  // Agencies
  "agency.status_change": { label: "Stato cambiato", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  "agency.approved": { label: "Approvata", className: "border-green-200 bg-green-50 text-green-700" },
  "agency.create": { label: "Creata", className: "border-green-200 bg-green-50 text-green-700" },
  "agency.delete": { label: "Eliminata", className: "border-red-200 bg-red-50 text-red-700" },
  "agency.document_verified": { label: "Doc. verificato", className: "border-green-200 bg-green-50 text-green-700" },
};

function getActionBadge(action: string) {
  if (ACTION_BADGES[action]) return ACTION_BADGES[action];
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
  if (action.endsWith(".bulk_publish"))
    return { label: "Pubblicati (bulk)", className: "border-green-200 bg-green-50 text-green-700" };
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

function getEntityLink(entry: ActivityLogEntry): string | null {
  if (!entry.entity_type || !entry.entity_id) return null;
  if (entry.action.endsWith(".delete") || entry.action.endsWith(".bulk_delete")) return null;
  const adminPath = ENTITY_TYPE_ADMIN_PATH[entry.entity_type];
  if (!adminPath) return null;
  if (entry.entity_type === "quote") return `/admin/${adminPath}/${entry.entity_id}`;
  if (entry.entity_type === "media" || entry.entity_type === "message") return null;
  if (entry.entity_type === "agency") return `/admin/${adminPath}/${entry.entity_id}`;
  return `/admin/${adminPath}/${entry.entity_id}/modifica`;
}

export default function StoricoTable({ activity }: StoricoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <div className="flex flex-wrap gap-1">
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
                <TableHead className="w-8"></TableHead>
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
                const entityLabel = entry.entity_type
                  ? ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type
                  : null;
                const link = getEntityLink(entry);
                const hasChanges = entry.changes && entry.changes.length > 0;
                const isExpanded = expandedRows.has(entry.id);

                return (
                  <Fragment key={entry.id}>
                    <TableRow
                      className={cn(
                        hasChanges && "cursor-pointer hover:bg-muted/50",
                        isExpanded && "bg-muted/30",
                      )}
                      onClick={() => hasChanges && toggleRow(entry.id)}
                    >
                      {/* Expand indicator */}
                      <TableCell className="w-8 px-2">
                        {hasChanges ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : null}
                      </TableCell>

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
                          {entry.entity_title && link ? (
                            <Link
                              href={link}
                              className="block text-sm font-medium hover:text-primary hover:underline line-clamp-1"
                              onClick={(e) => e.stopPropagation()}
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

                    {/* Expanded changes row */}
                    {isExpanded && hasChanges && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={6} className="px-8 py-3">
                          <div className="rounded-md border bg-white">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/30">
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Campo</th>
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Prima</th>
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dopo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.changes!.map((change, i) => (
                                  <tr key={i} className={i < entry.changes!.length - 1 ? "border-b" : ""}>
                                    <td className="px-3 py-1.5 font-medium">{change.field}</td>
                                    <td className="px-3 py-1.5">
                                      {change.from ? (
                                        <span className="text-red-600 line-through">{change.from}</span>
                                      ) : (
                                        <span className="text-muted-foreground/50">&mdash;</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-1.5">
                                      {change.to ? (
                                        <span className="text-green-600">{change.to}</span>
                                      ) : (
                                        <span className="text-muted-foreground/50">&mdash;</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
