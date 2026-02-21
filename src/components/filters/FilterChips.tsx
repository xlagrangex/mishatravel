"use client";

import { X } from "lucide-react";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string, value: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key, chip.value)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-[#C41E2F] hover:underline"
        >
          Rimuovi tutti
        </button>
      )}
    </div>
  );
}
