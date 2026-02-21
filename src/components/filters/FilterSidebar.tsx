"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: "checkbox" | "range" | "toggle";
  options?: FilterOption[];
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
}

interface FilterSidebarProps {
  groups: FilterGroup[];
  state: Record<string, string[] | [number, number] | boolean>;
  onChange: (key: string, value: string[] | [number, number] | boolean) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterSidebar({ groups, state, onChange, onReset, className }: FilterSidebarProps) {
  const hasActiveFilters = Object.values(state).some((v) =>
    Array.isArray(v) ? v.length > 0 : v === true,
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">Filtri</h3>
        {hasActiveFilters && (
          <button onClick={onReset} className="text-xs text-[#C41E2F] hover:underline">
            Rimuovi tutti
          </button>
        )}
      </div>

      {groups.map((group, gi) => (
        <div key={group.key}>
          {gi > 0 && <Separator className="my-4" />}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{group.label}</h4>

            {group.type === "checkbox" && group.options && (
              <div className="space-y-2">
                {group.options.map((opt) => {
                  const current = (state[group.key] as string[]) || [];
                  const checked = current.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          const next = checked
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value];
                          onChange(group.key, next);
                        }}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {opt.label}
                      </span>
                      {opt.count !== undefined && (
                        <span className="text-xs text-gray-400 ml-auto">({opt.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {group.type === "range" && (
              <div>
                <Slider
                  min={group.rangeMin ?? 0}
                  max={group.rangeMax ?? 10000}
                  step={group.rangeStep ?? 100}
                  value={state[group.key] as [number, number] ?? [group.rangeMin ?? 0, group.rangeMax ?? 10000]}
                  onValueChange={(v) => onChange(group.key, v as [number, number])}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{((state[group.key] as [number, number]) ?? [group.rangeMin ?? 0])[0]}€</span>
                  <span>{((state[group.key] as [number, number]) ?? [0, group.rangeMax ?? 10000])[1]}€</span>
                </div>
              </div>
            )}

            {group.type === "toggle" && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={(state[group.key] as boolean) ?? false}
                  onCheckedChange={(v) => onChange(group.key, v)}
                />
                <span className="text-sm text-gray-600">Solo con disponibilita</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
