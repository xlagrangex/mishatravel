"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Agency, AgencyDocument, QuoteRequest } from "@/lib/types";
import type { StatementListItem } from "@/lib/supabase/queries/admin-statements";
import {
  updateAgencyStatus,
  deleteAgency,
  verifyAgencyDocument,
  createAccountStatement,
  deleteAccountStatement,
  sendAccountStatementEmail,
} from "../actions";

interface AgencyDetailProps {
  agency: Agency;
  quoteRequests: (QuoteRequest & {
    tour_title?: string;
    cruise_title?: string;
  })[];
  documents?: AgencyDocument[];
  statements?: StatementListItem[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
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

const quoteStatusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: "Richiesto", className: "border-blue-200 bg-blue-50 text-blue-700" },
  offered: { label: "Offerta Inviata", className: "border-purple-200 bg-purple-50 text-purple-700" },
  accepted: { label: "Accettato", className: "border-green-200 bg-green-50 text-green-700" },
  contract_sent: { label: "Contratto Inviato", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  confirmed: { label: "Confermato", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  declined: { label: "Rifiutato", className: "border-orange-200 bg-orange-50 text-orange-700" },
  rejected: { label: "Respinto", className: "border-red-200 bg-red-50 text-red-700" },
  // Legacy
  sent: { label: "Inviato", className: "border-blue-200 bg-blue-50 text-blue-700" },
  in_review: { label: "In Revisione", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  offer_sent: { label: "Offerta Inviata", className: "border-purple-200 bg-purple-50 text-purple-700" },
  payment_sent: { label: "Pagamento Inviato", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
};

export default function AgencyDetail({
  agency,
  quoteRequests,
  documents = [],
  statements = [],
}: AgencyDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [stmtActionId, setStmtActionId] = useState<string | null>(null);

  const sc = statusConfig[agency.status] ?? statusConfig.pending;

  const handleStatusChange = (newStatus: "active" | "blocked") => {
    const action = newStatus === "active" ? "approvare" : "bloccare";
    if (!confirm(`Sei sicuro di voler ${action} questa agenzia?`)) return;
    setCurrentAction(newStatus);
    startTransition(async () => {
      const result = await updateAgencyStatus(agency.id, newStatus);
      if (!result.success) alert(`Errore: ${result.error}`);
      setCurrentAction(null);
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${agency.business_name}"? Verranno eliminati anche tutti i preventivi associati. Questa azione non puo essere annullata.`
      )
    )
      return;
    setCurrentAction("delete");
    startTransition(async () => {
      const result = await deleteAgency(agency.id);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
        setCurrentAction(null);
      } else {
        router.push("/admin/agenzie");
      }
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
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/agenzie">
              <ArrowLeft className="h-4 w-4" />
              Torna alle Agenzie
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-secondary">
              {agency.business_name}
            </h1>
            <Badge variant="outline" className={cn("text-xs mt-1", sc.className)}>
              {sc.label}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {agency.status !== "active" && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              disabled={isPending}
              onClick={() => handleStatusChange("active")}
            >
              <CheckCircle className="h-4 w-4" />
              Approva
            </Button>
          )}
          {agency.status !== "blocked" && (
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              disabled={isPending}
              onClick={() => handleStatusChange("blocked")}
            >
              <XCircle className="h-4 w-4" />
              Blocca
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Elimina
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dati Aziendali */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dati Aziendali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={Building2}
              label="Ragione Sociale"
              value={agency.business_name}
            />
            <InfoRow label="Partita IVA" value={agency.vat_number} />
            <InfoRow label="Codice Fiscale" value={agency.fiscal_code} />
            <InfoRow label="Licenza" value={agency.license_number} />
            <Separator />
            <InfoRow
              icon={Calendar}
              label="Data Registrazione"
              value={formatDate(agency.created_at)}
            />
          </CardContent>
        </Card>

        {/* Contatti */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contatti e Indirizzo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Referente" value={agency.contact_name} />
            <InfoRow icon={Mail} label="Email" value={agency.email} />
            <InfoRow icon={Phone} label="Telefono" value={agency.phone} />
            <InfoRow icon={Globe} label="Sito Web" value={agency.website} />
            <Separator />
            <InfoRow icon={MapPin} label="Indirizzo" value={agency.address} />
            <InfoRow
              label="Citta"
              value={
                [agency.city, agency.province, agency.zip_code]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Quote Requests History */}
      <Card>
        {/* Documents Section */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Documenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Nessun documento caricato.</p>
              {agency.status === "pending" && (
                <p className="text-xs text-yellow-600 mt-2">
                  Scadenza upload: {new Date(new Date(agency.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("it-IT")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{doc.file_name ?? "Visura Camerale"}</p>
                    <p className="text-xs text-muted-foreground">
                      Caricato il {new Date(doc.uploaded_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.verified ? "default" : "outline"}>
                      {doc.verified ? "Verificato" : "Da verificare"}
                    </Badge>
                    {!doc.verified && (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await verifyAgencyDocument(doc.id, agency.user_id);
                            router.refresh();
                          });
                        }}
                      >
                        Verifica
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        Scarica
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Storico Preventivi ({quoteRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quoteRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nessun preventivo richiesto da questa agenzia.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tour / Crociera</TableHead>
                    <TableHead>Adulti</TableHead>
                    <TableHead>Bambini</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteRequests.map((qr) => {
                    const qs =
                      quoteStatusConfig[qr.status] ?? quoteStatusConfig.sent;
                    return (
                      <TableRow key={qr.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {qr.request_type === "tour" ? "Tour" : "Crociera"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {qr.tour_title ?? qr.cruise_title ?? "\u2014"}
                        </TableCell>
                        <TableCell>{qr.participants_adults ?? 0}</TableCell>
                        <TableCell>{qr.participants_children ?? 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", qs.className)}
                          >
                            {qs.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(qr.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estratti Conto Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5" />
              Estratti Conto ({statements.length})
            </CardTitle>
            <NewStatementInlineDialog
              agencyId={agency.id}
              onSuccess={() => router.refresh()}
            />
          </div>
        </CardHeader>
        <CardContent>
          {statements.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nessun estratto conto per questa agenzia.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {statements.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {s.title ?? "Senza titolo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.data
                          ? new Date(s.data).toLocaleDateString("it-IT")
                          : "\u2014"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        s.stato === "Inviato via Mail"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      )}
                    >
                      {s.stato ?? "Bozza"}
                    </Badge>
                    {s.file_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={s.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {s.stato !== "Inviato via Mail" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={stmtActionId === s.id && isPending}
                        onClick={() => {
                          if (!confirm("Inviare via email all'agenzia?")) return;
                          setStmtActionId(s.id);
                          startTransition(async () => {
                            const result = await sendAccountStatementEmail(s.id);
                            setStmtActionId(null);
                            if (result.success) {
                              router.refresh();
                            } else {
                              alert(`Errore: ${result.error}`);
                            }
                          });
                        }}
                      >
                        {stmtActionId === s.id && isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={stmtActionId === s.id && isPending}
                      onClick={() => {
                        if (!confirm("Eliminare questo estratto conto?")) return;
                        setStmtActionId(s.id);
                        startTransition(async () => {
                          const result = await deleteAccountStatement(s.id);
                          setStmtActionId(null);
                          if (result.success) {
                            router.refresh();
                          } else {
                            alert(`Errore: ${result.error}`);
                          }
                        });
                      }}
                    >
                      {stmtActionId === s.id && isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline New Statement Dialog (for agency detail page)
// ---------------------------------------------------------------------------

function NewStatementInlineDialog({
  agencyId,
  onSuccess,
}: {
  agencyId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload fallito");
      const data = await res.json();
      setFileUrl(data.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fileUrl) {
      setError("Carica un file prima di procedere.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const data = form.get("data") as string;

    startTransition(async () => {
      const result = await createAccountStatement({
        agency_id: agencyId,
        title,
        file_url: fileUrl,
        data,
        stato: "Bozza",
      });

      if (result.success) {
        setOpen(false);
        setFileUrl(null);
        setFileName(null);
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Carica Estratto Conto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo Estratto Conto</DialogTitle>
          <DialogDescription>
            Carica un estratto conto per questa agenzia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="inline_title">Titolo *</Label>
            <Input
              id="inline_title"
              name="title"
              required
              placeholder="Es. Estratto Conto Gennaio 2026"
            />
          </div>

          <div>
            <Label htmlFor="inline_data">Data documento *</Label>
            <Input id="inline_data" name="data" type="date" required />
          </div>

          <div>
            <Label>File PDF *</Label>
            {fileName ? (
              <div className="mt-1 flex items-center gap-2 rounded-md border bg-green-50 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="flex-1 truncate">{fileName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileUrl(null);
                    setFileName(null);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Caricamento..." : "Clicca per caricare il PDF"}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <FileText className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending || !fileUrl}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for info rows
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      {!Icon && <div className="w-4" />}
      <div className="flex-1">
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-medium">{value || "\u2014"}</span>
      </div>
    </div>
  );
}
