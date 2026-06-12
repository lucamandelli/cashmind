import { z } from "zod";

/**
 * App-side money range. We convert BIGINT→number at the API edge, so the safe
 * ceiling is JS MAX_SAFE_INTEGER (~R$ 90 trillion), not the full INT8 range.
 * Bounding here guarantees Number() at the boundary is always precision-exact.
 */
export const MAX_AMOUNT_MINOR = Number.MAX_SAFE_INTEGER;
export const MIN_AMOUNT_MINOR = -Number.MAX_SAFE_INTEGER;

/** Reusable integer-cents schema. Reused by accounts now and Transaction amountMinor later. */
export const AmountMinorSchema = z
  .number()
  .int()
  .min(MIN_AMOUNT_MINOR, "Amount is too large")
  .max(MAX_AMOUNT_MINOR, "Amount is too large");

/**
 * Rounding rule: half-up (round half away from zero).
 * Used for splits/percentages. Never use Math.round (banker's rounding) or floats.
 */
function roundHalfUp(n: number): number {
  return Math.floor(n + 0.5);
}

/**
 * Convert a BRL major-unit value (e.g. 9.99) to integer cents.
 * Always pass user input through this before storing.
 */
export function toMinor(major: number): number {
  return roundHalfUp(major * 100);
}

/**
 * Convert integer cents back to major-unit BRL (for display only).
 */
export function toMajor(minor: number): number {
  return minor / 100;
}

/**
 * Format integer cents as a BRL currency string (pt-BR locale).
 * e.g. 9999 → "R$ 99,99"
 */
export function formatBRL(minor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toMajor(minor));
}

/**
 * Divide integer cents by a divisor, rounding half-up.
 * Use for splits and percentage calculations.
 */
export function divideMinor(minor: number, divisor: number): number {
  return roundHalfUp(minor / divisor);
}

/**
 * Parse a user-typed BRL reais string into a JS major-unit number (e.g. 9.99).
 * Pass the result to toMinor() to get integer cents.
 *
 * Accepts:
 *   - Plain integers:            "100"       → 100
 *   - Dot-decimal (JS/English):  "9.99"      → 9.99
 *   - Comma-decimal (pt-BR):     "9,99"      → 9.99
 *   - pt-BR with thousands dot:  "1.234,56"  → 1234.56
 *   - Negatives:                 "-500"      → -500, "-1,50" → -1.5
 *
 * Throws on: empty/whitespace-only input, more than one comma (ambiguous),
 * non-numeric text, NaN, or non-finite results.
 */
export function parseReais(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") throw new Error("Enter a valid amount");

  let normalised: string;
  if (trimmed.includes(",")) {
    // pt-BR format: commas are decimal separators; dots are thousands separators.
    const commaCount = (trimmed.match(/,/g) ?? []).length;
    if (commaCount !== 1) throw new Error("Enter a valid amount");
    // Remove all dots (thousands separators), replace comma with period.
    normalised = trimmed.replace(/\./g, "").replace(",", ".");
  } else {
    // English/JS decimal or plain integer — pass through directly.
    normalised = trimmed;
  }

  const n = Number.parseFloat(normalised);
  if (Number.isNaN(n) || !Number.isFinite(n)) throw new Error("Enter a valid amount");
  return n;
}
