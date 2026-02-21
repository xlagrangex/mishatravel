"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  Receipt,
  Mail,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatementListItem } from "@/lib/supabase/queries/account-statements";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StatementsTable({
  statements,
  initialFrom,
  initialTo,
}: {
  statements: StatementListItem[];
  initialFrom?: string;
  initialTo?: string;
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState(initialFrom ?? "");
  const [dateTo, setDateTo] = useState(initialTo ?? "");

  function handleFilter() {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    const qs = params.toString();
    router.push(`/agenzia/estratto-conto${qs ? `?${qs}` : ""}`);
  }

  function handleReset() {
    setDateFrom("");
    setDateTo("");
    router.push("/agenzia/estratto-conto");
  }

  return (
    <div className="space-y-4">
      {/* Date range filter */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="date-from" className="text-sm">
            Da
          </Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="date-to" className="text-sm">
            A
          </Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFilter} size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filtra
          </Button>
          {(dateFrom || dateTo) && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {statements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Nessun documento trovato per il periodo selezionato.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Titolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statements.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.data
                    ? new Date(s.data).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {s.title ?? "Estratto conto"}
                </TableCell>
                <TableCell>
                  {s.stato === "Inviato via Mail" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      <Mail className="mr-1 h-3 w-3" />
                      Inviato
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 border-gray-200"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Bozza
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {s.file_url ? (
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={s.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Scarica PDF
                      </a>
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Non disponibile
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
