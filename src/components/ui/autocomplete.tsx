"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export function Autocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal state when controlled value changes externally
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter suggestions based on input (case-insensitive)
  const filtered = React.useMemo(() => {
    if (!inputValue) return suggestions;
    const lower = inputValue.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(lower));
  }, [inputValue, suggestions]);

  // Close dropdown on outside click
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

  function handleSelect(suggestion: string) {
    setInputValue(suggestion);
    onChange(suggestion);
    setOpen(false);
  }

  function handleFocus() {
    if (filtered.length > 0) {
      setOpen(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

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
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-input bg-popover p-1 shadow-md">
          {filtered.map((suggestion) => (
            <li
              key={suggestion}
              className="cursor-pointer rounded-sm px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur before click
                handleSelect(suggestion);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
