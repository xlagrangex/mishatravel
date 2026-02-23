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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { updateAgencyStatus, deleteAgency, verifyAgencyDocument } from "../actions";

interface AgencyDetailProps {
  agency: Agency;
  quoteRequests: (QuoteRequest & {
    tour_title?: string;
    cruise_title?: string;
  })[];
  documents?: AgencyDocument[];
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
  sent: { label: "Inviato", className: "border-blue-200 bg-blue-50 text-blue-700" },
  in_review: { label: "In Revisione", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  offer_sent: { label: "Offerta Inviata", className: "border-purple-200 bg-purple-50 text-purple-700" },
  accepted: { label: "Accettato", className: "border-green-200 bg-green-50 text-green-700" },
  declined: { label: "Rifiutato", className: "border-red-200 bg-red-50 text-red-700" },
  payment_sent: { label: "Pagamento Inviato", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  confirmed: { label: "Confermato", className: "border-green-200 bg-green-50 text-green-700" },
  rejected: { label: "Respinto", className: "border-red-200 bg-red-50 text-red-700" },
};

export default function AgencyDetail({
  agency,
  quoteRequests,
  documents = [],
}: AgencyDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<string | null>(null);

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
    </div>
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
