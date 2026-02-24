"use client";

import { useState, useTransition } from "react";
import { saveTourPriceLabels } from "@/app/admin/tours/actions";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EditPriceLabelsDialogProps {
  tourId: string;
  currentLabel1: string;
  currentLabel2: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (label1: string, label2: string) => void;
}

export default function EditPriceLabelsDialog({
  tourId,
  currentLabel1,
  currentLabel2,
  open,
  onOpenChange,
  onSaved,
}: EditPriceLabelsDialogProps) {
  const [label1, setLabel1] = useState(currentLabel1);
  const [label2, setLabel2] = useState(currentLabel2);
  const [isPending, startTransition] = useTransition();

  // Sync state when dialog opens with new values
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLabel1(currentLabel1);
      setLabel2(currentLabel2);
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (!label1.trim() || !label2.trim()) {
      toast.error("Le etichette non possono essere vuote");
      return;
    }

    startTransition(async () => {
      const result = await saveTourPriceLabels(tourId, label1.trim(), label2.trim());
      if (result.success) {
        toast.success("Etichette prezzo aggiornate");
        onSaved(label1.trim(), label2.trim());
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-5" />
            Modifica Etichette Prezzo
          </DialogTitle>
          <DialogDescription>
            Personalizza i nomi delle colonne prezzo nelle partenze di questo tour.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Etichetta Prezzo 1 (colonna sinistra)</Label>
            <Input
              value={label1}
              onChange={(e) => setLabel1(e.target.value)}
              placeholder="es. Comfort"
            />
          </div>
          <div className="space-y-2">
            <Label>Etichetta Prezzo 2 (colonna destra)</Label>
            <Input
              value={label2}
              onChange={(e) => setLabel2(e.target.value)}
              placeholder="es. Deluxe"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salva Modifiche
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
