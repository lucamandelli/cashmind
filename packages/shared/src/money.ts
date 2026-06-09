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
