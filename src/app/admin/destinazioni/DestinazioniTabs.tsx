"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import DestinazioniTable from "./DestinazioniTable";
import MacroAreeTable from "./MacroAreeTable";
import { setMegaMenuMode } from "./macro-aree/actions";
import type { Destination, MacroArea } from "@/lib/types";

interface DestinazioniTabsProps {
  destinations: Destination[];
  macroAreas: MacroArea[];
  megaMenuMode: "dynamic" | "manual";
}

export default function DestinazioniTabs({
  destinations,
  macroAreas,
  megaMenuMode,
}: DestinazioniTabsProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "macro-aree" ? "macro-aree" : "destinazioni";
  const [mode, setMode] = useState(megaMenuMode);
  const [isPending, startTransition] = useTransition();

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? "manual" : "dynamic";
    setMode(newMode);
    startTransition(async () => {
      const result = await setMegaMenuMode(newMode);
      if (result.success) {
        toast.success(newMode === "manual" ? "Mega menu: modalita manuale" : "Mega menu: modalita dinamica");
      } else {
        toast.error(result.error);
        setMode(mode); // rollback
      }
    });
  };

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="destinazioni">
          Destinazioni ({destinations.length})
        </TabsTrigger>
        <TabsTrigger value="macro-aree">
          Macro Aree ({macroAreas.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="destinazioni" className="mt-6">
        <DestinazioniTable destinations={destinations} />
      </TabsContent>

      <TabsContent value="macro-aree" className="mt-6 space-y-4">
        {/* Mega menu mode toggle */}
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <Switch
            id="mega-menu-mode"
            checked={mode === "manual"}
            onCheckedChange={handleModeChange}
            disabled={isPending}
          />
          <div>
            <Label htmlFor="mega-menu-mode" className="text-sm font-medium cursor-pointer">
              {mode === "manual" ? "Mega menu: Manuale" : "Mega menu: Dinamico"}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "manual"
                ? "Il mega menu usa l'ordine e la visibilita definiti in questa tabella."
                : "Il mega menu si genera automaticamente dalle destinazioni pubblicate (ordine alfabetico)."}
            </p>
          </div>
        </div>

        <MacroAreeTable macroAreas={macroAreas} />
      </TabsContent>
    </Tabs>
  );
}
