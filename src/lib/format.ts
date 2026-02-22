/**
 * Format a price value for display.
 *
 * Handles: number, string with commas ("1.234,00"), string with euro sign,
 * descriptive strings ("Su richiesta"), null/undefined.
 *
 * Returns formatted EUR string like "€ 1.234" or the descriptive text as-is.
 */
export function displayPrice(value: number | string | null | undefined): string {
  if (value == null) return "—";

  if (typeof value === "number") {
    return formatEur(value);
  }

  // String value
  const trimmed = value.trim();
  if (!trimmed) return "—";

  // Try to extract a numeric value from the string
  // Remove euro sign, "a persona", and other common suffixes
  const cleaned = trimmed
    .replace(/€/g, "")
    .replace(/\s*a persona\b/gi, "")
    .replace(/\s*per persona\b/gi, "")
    .trim();

  // Try parsing as Italian-format number (1.234,56 → 1234.56)
  const num = parseItalianNumber(cleaned);
  if (num !== null && isFinite(num)) {
    return formatEur(num);
  }

  // Non-numeric string (e.g. "Su richiesta", "Prezzo su richiesta")
  return trimmed;
}

/**
 * Parse an Italian-format number string.
 * "1.234,56" → 1234.56, "925" → 925, "2027,00" → 2027
 */
function parseItalianNumber(str: string): number | null {
  // Remove dots used as thousands separator, replace comma with dot for decimal
  const normalized = str.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Format a number as EUR with Italian locale.
 * 1234 → "€ 1.234", 1234.5 → "€ 1.235"
 */
function formatEur(n: number): string {
  const rounded = Math.round(n);
  return `€ ${rounded.toLocaleString("it-IT")}`;
}
