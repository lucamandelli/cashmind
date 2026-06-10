/**
 * AccountForm — money wiring unit tests.
 *
 * Tests the one piece of real UI logic: parsing a user-typed reais string
 * to integer cents (toMinor), and the round-trip from stored cents to the
 * form's pre-fill value (toMajor → string → toMinor).
 *
 * We extract and test the parsing function directly (same logic as the
 * FormSchema transform in AccountForm.tsx) without mounting the component,
 * keeping this fast and dependency-free.
 */

import { describe, it, expect } from "vitest";
import { toMinor, toMajor } from "@cashmind/shared";

// ---------------------------------------------------------------------------
// Mirror of the FormSchema.amountReais transform in AccountForm.tsx.
// If you change the parsing logic there, update this too.
//
// Strategy:
//   - If input contains a comma → pt-BR format: strip dots (thousands seps),
//     replace comma with period (decimal sep).
//   - If input has only dots → English/JS format (e.g. "9.99" from toMajor
//     pre-fill): pass through directly.
// ---------------------------------------------------------------------------
function parseReais(raw: string): number {
  const trimmed = raw.trim();
  const normalised = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const n = Number.parseFloat(normalised);
  if (Number.isNaN(n)) throw new Error("Enter a valid amount");
  return n;
}

/** Parse a user-typed reais string to integer cents. */
function reaisToCents(raw: string): number {
  return toMinor(parseReais(raw));
}

/** Round-trip: stored cents → form pre-fill (toMajor as string) → back to cents. */
function roundTrip(cents: number): number {
  const prefill = String(toMajor(cents)); // e.g. "9.99" for 999
  return reaisToCents(prefill);           // parse that string back
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AccountForm money wiring — reais input to integer cents", () => {
  it("parses a plain integer reais value", () => {
    expect(reaisToCents("100")).toBe(10000);
  });

  it("parses a value with dot decimal separator (e.g. copied from a calculator)", () => {
    expect(reaisToCents("9.99")).toBe(999);
  });

  it("parses a value with comma decimal separator (pt-BR convention)", () => {
    expect(reaisToCents("9,99")).toBe(999);
  });

  it("parses a value with dot thousands separator and comma decimal (pt-BR full)", () => {
    // "1.234,56" → strip dots → "1234,56" → replace comma → "1234.56" → 123456 cents
    expect(reaisToCents("1.234,56")).toBe(123456);
  });

  it("handles a negative value — no min(0) applied", () => {
    expect(reaisToCents("-500")).toBe(-50000);
  });

  it("handles a negative value with decimal (credit card debt scenario)", () => {
    expect(reaisToCents("-1,50")).toBe(-150);
  });

  it("handles zero", () => {
    expect(reaisToCents("0")).toBe(0);
  });

  it("handles a string with leading/trailing whitespace", () => {
    expect(reaisToCents("  50  ")).toBe(5000);
  });

  it("throws on non-numeric input", () => {
    expect(() => reaisToCents("abc")).toThrow("Enter a valid amount");
  });
});

describe("AccountForm money wiring — edit mode round-trip (toMajor → toMinor)", () => {
  it("round-trips a positive balance: stored cents → pre-fill string → cents", () => {
    expect(roundTrip(999)).toBe(999);
  });

  it("round-trips a larger positive balance", () => {
    expect(roundTrip(123456)).toBe(123456);
  });

  it("round-trips a negative balance — credit card debt", () => {
    expect(roundTrip(-15000)).toBe(-15000);
  });

  it("round-trips zero", () => {
    expect(roundTrip(0)).toBe(0);
  });
});
