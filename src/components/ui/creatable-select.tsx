"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface CreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function CreatableSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filtered = React.useMemo(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((s) => s.toLowerCase().includes(lower));
  }, [inputValue, options]);

  const showCreate = React.useMemo(() => {
    if (!inputValue.trim()) return false;
    const lower = inputValue.toLowerCase().trim();
    return !options.some((o) => o.toLowerCase() === lower);
  }, [inputValue, options]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setOpen(true);
  }

  function handleSelect(option: string) {
    setInputValue(option);
    onChange(option);
    setOpen(false);
  }

  function handleFocus() {
    setOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const hasItems = filtered.length > 0 || showCreate;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && hasItems && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-input bg-popover p-1 shadow-md">
          {filtered.map((option) => (
            <li
              key={option}
              className="cursor-pointer rounded-sm px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option}
            </li>
          ))}
          {showCreate && (
            <li
              className="cursor-pointer rounded-sm px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-primary font-medium"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(inputValue.trim());
              }}
            >
              <Plus className="size-3.5" />
              Crea &ldquo;{inputValue.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
