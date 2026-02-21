"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import FilterSidebar, { type FilterGroup } from "./FilterSidebar";

interface MobileFilterSheetProps {
  groups: FilterGroup[];
  state: Record<string, string[] | [number, number] | boolean>;
  onChange: (key: string, value: string[] | [number, number] | boolean) => void;
  onReset: () => void;
  activeCount: number;
}

export default function MobileFilterSheet({
  groups,
  state,
  onChange,
  onReset,
  activeCount,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filtri
          {activeCount > 0 && (
            <span className="size-5 rounded-full bg-[#C41E2F] text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtri</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <FilterSidebar groups={groups} state={state} onChange={onChange} onReset={onReset} />
        </div>
        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Reset
          </Button>
          <SheetClose asChild>
            <Button className="flex-1 bg-[#C41E2F] hover:bg-[#A31825] text-white">
              Applica
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
