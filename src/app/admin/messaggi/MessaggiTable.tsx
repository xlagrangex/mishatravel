"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  MessageSquare,
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Circle,
  AlertTriangle,
  Handshake,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ContactSubmission, ContactFormType } from "@/lib/types";
import { markAsRead, markAsUnread, deleteSubmission } from "./actions";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface MessaggiTableProps {
  submissions: ContactSubmission[];
}

const formTypeConfig: Record<
  ContactFormType,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  contatti: {
    label: "Contatto",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Phone,
  },
  diventa_partner: {
    label: "Partnership",
    badgeClass: "border-green-200 bg-green-50 text-green-700",
    icon: Handshake,
  },
  reclami: {
    label: "Reclamo",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    icon: AlertTriangle,
  },
};

/** Map data JSON keys to human-readable Italian labels */
const dataFieldLabels: Record<string, string> = {
  nome: "Nome",
  cognome: "Cognome",
  email: "Email",
  telefono: "Telefono",
  oggetto: "Oggetto",
  messaggio: "Messaggio",
  nome_cognome: "Nome",
  agenzia: "Agenzia",
  citta: "Citta",
  n_pratica: "N. Pratica",
  destinazione: "Destinazione",
  date_viaggio: "Date Viaggio",
  descrizione: "Descrizione",
  richiesta: "Richiesta/Soluzione",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessaggiTable({ submissions }: MessaggiTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  // ---- Stats ----
  const stats = useMemo(() => {
    const total = submissions.length;
    const unread = submissions.filter((s) => !s.read).length;
    const contatti = submissions.filter((s) => s.form_type === "contatti").length;
    const partner = submissions.filter((s) => s.form_type === "diventa_partner").length;
    const reclami = submissions.filter((s) => s.form_type === "reclami").length;
    return { total, unread, contatti, partner, reclami };
  }, [submissions]);

  // ---- Filtering ----
  const filtered = useMemo(() => {
    let result = submissions;

    if (typeFilter !== "all") {
      result = result.filter((s) => s.form_type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const dataStr = Object.values(s.data).join(" ").toLowerCase();
        return dataStr.includes(q);
      });
    }

    return result;
  }, [submissions, searchQuery, typeFilter]);

  // ---- Actions ----
  const handleToggleRead = (id: string, isRead: boolean) => {
    setActionId(id);
    startTransition(async () => {
      const result = isRead ? await markAsUnread(id) : await markAsRead(id);
      if (result.error) alert(`Errore: ${result.error}`);
      setActionId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo messaggio? Questa azione non puo essere annullata.")) return;
    setActionId(id);
    startTransition(async () => {
      const result = await deleteSubmission(id);
      if (result.error) alert(`Errore: ${result.error}`);
      setActionId(null);
      if (expandedId === id) setExpandedId(null);
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreview = (data: Record<string, string>): string => {
    const msg = data.messaggio ?? data.descrizione ?? data.richiesta ?? "";
    if (msg.length > 80) return msg.slice(0, 80) + "...";
    return msg || "\u2014";
  };

  const getName = (data: Record<string, string>): string => {
    if (data.nome_cognome) return data.nome_cognome;
    const parts = [data.nome, data.cognome].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "\u2014";
  };

  const getEmail = (data: Record<string, string>): string => {
    return data.email ?? "\u2014";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Messaggi
        </h1>
        <p className="text-sm text-muted-foreground">
          Messaggi ricevuti dai form del sito
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Totale</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unread}</p>
              <p className="text-sm text-muted-foreground">Non letti</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contatti}</p>
              <p className="text-sm text-muted-foreground">Contatti</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.partner}</p>
              <p className="text-sm text-muted-foreground">Partnership</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reclami}</p>
              <p className="text-sm text-muted-foreground">Reclami</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per contenuto, nome, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="contatti">Contatti</SelectItem>
            <SelectItem value="diventa_partner">Partnership</SelectItem>
            <SelectItem value="reclami">Reclami</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun messaggio trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || typeFilter !== "all"
              ? "Prova a modificare i filtri."
              : "Non ci sono ancora messaggi ricevuti."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Stato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Anteprima</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((submission) => {
                const config = formTypeConfig[submission.form_type] ?? formTypeConfig.contatti;
                const isExpanded = expandedId === submission.id;

                return (
                  <>
                    <TableRow
                      key={submission.id}
                      className={cn(
                        "cursor-pointer",
                        !submission.read && "bg-blue-50/50",
                        actionId === submission.id && "opacity-50"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : submission.id)
                      }
                    >
                      <TableCell>
                        <Circle
                          className={cn(
                            "h-3 w-3",
                            submission.read
                              ? "fill-gray-300 text-gray-300"
                              : "fill-blue-500 text-blue-500"
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(submission.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", config.badgeClass)}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getName(submission.data)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getEmail(submission.data)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[300px] truncate">
                        {getPreview(submission.data)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title={submission.read ? "Segna come non letto" : "Segna come letto"}
                            disabled={isPending && actionId === submission.id}
                            onClick={() =>
                              handleToggleRead(submission.id, submission.read)
                            }
                          >
                            {submission.read ? (
                              <Mail className="h-3.5 w-3.5" />
                            ) : (
                              <MailOpen className="h-3.5 w-3.5" />
                            )}
                            <span className="sr-only">
                              {submission.read ? "Segna non letto" : "Segna letto"}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isPending && actionId === submission.id}
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Elimina</span>
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <TableRow key={`${submission.id}-detail`} className="hover:bg-transparent">
                        <TableCell colSpan={7} className="p-0">
                          <div className="border-t bg-slate-50/70 px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {Object.entries(submission.data).map(
                                ([key, value]) => {
                                  if (!value) return null;
                                  const label = dataFieldLabels[key] ?? key;
                                  const isLongField = [
                                    "messaggio",
                                    "descrizione",
                                    "richiesta",
                                  ].includes(key);

                                  return (
                                    <div
                                      key={key}
                                      className={cn(
                                        isLongField && "sm:col-span-2 lg:col-span-3"
                                      )}
                                    >
                                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        {label}
                                      </p>
                                      <p
                                        className={cn(
                                          "text-sm text-foreground",
                                          isLongField && "whitespace-pre-wrap"
                                        )}
                                      >
                                        {value}
                                      </p>
                                    </div>
                                  );
                                }
                              )}

                              {/* Newsletter consent */}
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                  Consenso Newsletter
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    submission.newsletter_consent
                                      ? "border-green-200 bg-green-50 text-green-700"
                                      : "border-gray-200 bg-gray-50 text-gray-500"
                                  )}
                                >
                                  {submission.newsletter_consent ? "Si" : "No"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
