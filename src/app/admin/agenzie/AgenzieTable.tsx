"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Search, Users, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
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
import type { Agency } from "@/lib/types";
import { updateAgencyStatus, deleteAgency } from "./actions";

interface AgenzieTableProps {
  agencies: Agency[];
  stats: {
    total: number;
    active: number;
    pending: number;
    blocked: number;
    totalQuotes: number;
  };
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "In Attesa",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  active: {
    label: "Attiva",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  blocked: {
    label: "Bloccata",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export default function AgenzieTable({ agencies, stats }: AgenzieTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = agencies;

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.business_name.toLowerCase().includes(q) ||
          (a.contact_name ?? "").toLowerCase().includes(q) ||
          (a.city ?? "").toLowerCase().includes(q) ||
          (a.email ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [agencies, searchQuery, statusFilter]);

  const handleStatusChange = (id: string, newStatus: "active" | "blocked") => {
    const action = newStatus === "active" ? "approvare" : "bloccare";
    if (!confirm(`Sei sicuro di voler ${action} questa agenzia?`)) return;
    setActionId(id);
    startTransition(async () => {
      const result = await updateAgencyStatus(id, newStatus);
      if (!result.success) alert(`Errore: ${result.error}`);
      setActionId(null);
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${name}"? Verranno eliminati anche tutti i preventivi associati. Questa azione non puo essere annullata.`
      )
    )
      return;
    setActionId(id);
    startTransition(async () => {
      const result = await deleteAgency(id);
      if (!result.success) alert(`Errore: ${result.error}`);
      setActionId(null);
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Agenzie
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestione agenzie partner. Approvazione, blocco, storico richieste.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Agenzie Totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Agenzie Attive</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">In Attesa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              <p className="text-sm text-muted-foreground">Preventivi Totali</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, contatto, citta, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="pending">In Attesa</SelectItem>
            <SelectItem value="active">Attiva</SelectItem>
            <SelectItem value="blocked">Bloccata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessuna agenzia trovata
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Prova a modificare i filtri."
              : "Non ci sono ancora agenzie registrate."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ragione Sociale</TableHead>
                <TableHead>Contatto</TableHead>
                <TableHead>Citta</TableHead>
                <TableHead>Provincia</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agency) => {
                const sc = statusConfig[agency.status] ?? statusConfig.pending;
                return (
                  <TableRow
                    key={agency.id}
                    className={cn(actionId === agency.id && "opacity-50")}
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/agenzie/${agency.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {agency.business_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agency.contact_name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agency.city ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agency.province ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", sc.className)}
                      >
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(agency.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" asChild>
                          <Link href={`/admin/agenzie/${agency.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">Dettaglio</span>
                          </Link>
                        </Button>
                        {agency.status !== "active" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            disabled={isPending && actionId === agency.id}
                            onClick={() =>
                              handleStatusChange(agency.id, "active")
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Approva</span>
                          </Button>
                        )}
                        {agency.status !== "blocked" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                            disabled={isPending && actionId === agency.id}
                            onClick={() =>
                              handleStatusChange(agency.id, "blocked")
                            }
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Blocca</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isPending && actionId === agency.id}
                          onClick={() =>
                            handleDelete(agency.id, agency.business_name)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Elimina</span>
                        </Button>
                      </div>
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
