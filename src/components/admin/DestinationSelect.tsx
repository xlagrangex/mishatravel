"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DestinationOption {
  id: string;
  name: string;
  macro_area: string | null;
}

interface DestinationSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  destinations: DestinationOption[];
  placeholder?: string;
}

export default function DestinationSelect({
  value,
  onValueChange,
  destinations,
  placeholder = "Seleziona destinazione",
}: DestinationSelectProps) {
  // Group destinations by macro_area
  const groups = new Map<string, DestinationOption[]>();

  for (const dest of destinations) {
    const key = dest.macro_area || "Altro";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(dest);
  }

  // Sort group keys alphabetically, but "Altro" always last
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    if (a === "Altro") return 1;
    if (b === "Altro") return -1;
    return a.localeCompare(b);
  });

  return (
    <Select
      value={value || ""}
      onValueChange={(val) => onValueChange(val === "" ? null : val)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sortedKeys.map((groupName) => (
          <SelectGroup key={groupName}>
            <SelectLabel>{groupName}</SelectLabel>
            {groups.get(groupName)!.map((dest) => (
              <SelectItem key={dest.id} value={dest.id}>
                {dest.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
