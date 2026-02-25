"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarPlus,
  Copy,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { addTourDepartureAction } from "@/app/admin/tours/actions";
import { addCruiseDepartureAction } from "@/app/admin/crociere/actions";
import { duplicateTourAction } from "@/app/admin/tours/actions";
import { duplicateCruiseAction } from "@/app/admin/crociere/actions";

interface ExpiredItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "tour" | "crociera";
  itemId: string;
  itemTitle: string;
  lastDepartureDate: string | null;
  onActionCompleted: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ExpiredItemDialog({
  open,
  onOpenChange,
  itemType,
  itemId,
  itemTitle,
  lastDepartureDate,
  onActionCompleted,
}: ExpiredItemDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  const [prezzo3, setPrezzo3] = useState("");
  const [prezzo4, setPrezzo4] = useState("");

  const isTour = itemType === "tour";
  const label = isTour ? "tour" : "crociera";
  const labelUpper = isTour ? "Tour" : "Crociera";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setShowAddForm(false);
      setFromCity("");
      setDataPartenza("");
      setPrezzo3("");
      setPrezzo4("");
    }
    onOpenChange(newOpen);
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = isTour
        ? await duplicateTourAction(itemId)
        : await duplicateCruiseAction(itemId);
      if (result.success) {
        toast.success(`${labelUpper} duplicat${isTour ? "o" : "a"} con successo`);
        onOpenChange(false);
        onActionCompleted();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleAddDeparture = () => {
    if (!fromCity.trim()) {
      toast.error("Inserisci la città di partenza");
      return;
    }
    if (!dataPartenza) {
      toast.error("Inserisci la data di partenza");
      return;
    }

    startTransition(async () => {
      const result = isTour
        ? await addTourDepartureAction(itemId, {
            from_city: fromCity.trim(),
            data_partenza: dataPartenza,
            prezzo_3_stelle: prezzo3 ? Number(prezzo3) : null,
            prezzo_4_stelle: prezzo4 || null,
          })
        : await addCruiseDepartureAction(itemId, {
            from_city: fromCity.trim(),
            data_partenza: dataPartenza,
          });

      if (result.success) {
        toast.success(
          `Nuova partenza aggiunta. ${labelUpper} ora visibile sul sito.`
        );
        onOpenChange(false);
        onActionCompleted();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleManageDepartures = () => {
    const basePath = isTour ? "/admin/tours" : "/admin/crociere";
    router.push(`${basePath}/${itemId}/modifica?tab=partenze`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="size-5" />
            {labelUpper} scadut{isTour ? "o" : "a"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {lastDepartureDate ? (
              <>
                L&apos;ultima partenza di{" "}
                <strong className="text-foreground">{itemTitle}</strong> è stata
                in data{" "}
                <strong className="text-foreground">
                  {formatDate(lastDepartureDate)}
                </strong>
                , per cui non risulta più visibile sul sito.
              </>
            ) : (
              <>
                <strong className="text-foreground">{itemTitle}</strong> non ha
                partenze configurate, per cui non risulta visibile sul sito.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-2">
          {/* Option 1: Duplicate */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={handleDuplicate}
            disabled={isPending}
          >
            {isPending && !showAddForm ? (
              <Loader2 className="size-4 animate-spin shrink-0" />
            ) : (
              <Copy className="size-4 shrink-0" />
            )}
            <div className="text-left">
              <p className="font-medium">Duplica e crea per nuova data</p>
              <p className="text-xs text-muted-foreground font-normal">
                Crea una copia in bozza con tutte le informazioni
              </p>
            </div>
          </Button>

          {/* Option 2: Add single departure */}
          <div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={isPending && !showAddForm}
            >
              <CalendarPlus className="size-4 shrink-0" />
              <div className="text-left">
                <p className="font-medium">Aggiungi nuova data di partenza</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Aggiungi una partenza per rendere visibile sul sito
                </p>
              </div>
            </Button>

            {showAddForm && (
              <div className="mt-3 ml-2 space-y-3 rounded-lg border p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Città di partenza</Label>
                    <Input
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      placeholder="es. Milano"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data partenza</Label>
                    <Input
                      type="date"
                      value={dataPartenza}
                      onChange={(e) => setDataPartenza(e.target.value)}
                      min={minDate}
                    />
                  </div>
                </div>

                {isTour && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prezzo Comfort (€)</Label>
                      <Input
                        type="number"
                        value={prezzo3}
                        onChange={(e) => setPrezzo3(e.target.value)}
                        placeholder="es. 1290"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prezzo Deluxe (€)</Label>
                      <Input
                        value={prezzo4}
                        onChange={(e) => setPrezzo4(e.target.value)}
                        placeholder="es. 1490"
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={handleAddDeparture}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending && showAddForm && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Aggiungi partenza
                </Button>
              </div>
            )}
          </div>

          {/* Option 3: Manage all departures */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={handleManageDepartures}
            disabled={isPending}
          >
            <Settings className="size-4 shrink-0" />
            <div className="text-left">
              <p className="font-medium">Gestisci tutte le partenze</p>
              <p className="text-xs text-muted-foreground font-normal">
                Apri il form completo per aggiungere più date
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
