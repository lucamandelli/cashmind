import { describe, expect, it } from "vitest";
import {
  AmountMinorSchema,
  MAX_AMOUNT_MINOR,
  MIN_AMOUNT_MINOR,
  divideMinor,
  formatBRL,
  parseReais,
  toMajor,
  toMinor,
} from "./money.js";

describe("toMinor", () => {
  it("converts whole BRL to cents", () => {
    expect(toMinor(1)).toBe(100);
    expect(toMinor(10)).toBe(1000);
  });

  it("converts decimal BRL to cents", () => {
    expect(toMinor(9.99)).toBe(999);
    expect(toMinor(0.01)).toBe(1);
    expect(toMinor(1.5)).toBe(150);
  });

  it("rounds half-up on floating-point values", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS — rounds to 30
    expect(toMinor(0.1 + 0.2)).toBe(30);
    // 1.005 in IEEE 754 is actually 1.00499999999... so it rounds DOWN to 100.
    // This is correct: never pass user input as a float; always convert from string.
    expect(toMinor(1.005)).toBe(100);
  });

  it("handles zero", () => {
    expect(toMinor(0)).toBe(0);
  });
});

describe("toMajor", () => {
  it("converts cents back to BRL", () => {
    expect(toMajor(100)).toBe(1);
    expect(toMajor(999)).toBeCloseTo(9.99);
    expect(toMajor(0)).toBe(0);
  });
});

describe("formatBRL", () => {
  it("formats cents as pt-BR currency string", () => {
    // Intl.NumberFormat uses a non-breaking space (U+00A0 or narrow NBSP U+202F)
    // between "R$" and the number depending on the Node/ICU version.
    // We assert structure, not the exact whitespace character.
    expect(formatBRL(9999)).toMatch(/R\$\s*99,99/u);
    expect(formatBRL(100)).toMatch(/R\$\s*1,00/u);
    expect(formatBRL(0)).toMatch(/R\$\s*0,00/u);
  });

  it("formats large amounts with thousands separator", () => {
    // 1_000_000 cents = R$ 10.000,00
    expect(formatBRL(1_000_000)).toMatch(/R\$\s*10\.000,00/u);
  });
});

describe("divideMinor", () => {
  it("divides evenly", () => {
    expect(divideMinor(100, 2)).toBe(50);
    expect(divideMinor(999, 3)).toBe(333);
  });

  it("rounds half-up on fractions", () => {
    // 100 / 3 = 33.333... → rounds to 33
    expect(divideMinor(100, 3)).toBe(33);
    // 101 / 2 = 50.5 → rounds to 51
    expect(divideMinor(101, 2)).toBe(51);
  });
});

// ---------------------------------------------------------------------------
// parseReais — parse a user-typed BRL string into a JS major-unit number,
// then composed with toMinor to reach integer cents.
// ---------------------------------------------------------------------------

describe("parseReais — accepted inputs", () => {
  it("parses a plain integer ('100') → 100", () => {
    expect(parseReais("100")).toBe(100);
  });

  it("parses dot-decimal English format ('9.99') → 9.99", () => {
    expect(parseReais("9.99")).toBeCloseTo(9.99);
  });

  it("parses comma-decimal pt-BR format ('9,99') → 9.99", () => {
    expect(parseReais("9,99")).toBeCloseTo(9.99);
  });

  it("parses pt-BR thousands + comma decimal ('1.234,56') → 1234.56", () => {
    expect(parseReais("1.234,56")).toBeCloseTo(1234.56);
  });

  it("parses a negative plain integer ('-500') → -500", () => {
    expect(parseReais("-500")).toBe(-500);
  });

  it("parses a negative comma-decimal ('-1,50') → -1.5", () => {
    expect(parseReais("-1,50")).toBeCloseTo(-1.5);
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(parseReais("  100  ")).toBe(100);
  });
});

describe("parseReais → toMinor — composed cent values", () => {
  it("'100' → toMinor → 10000 cents", () => {
    expect(toMinor(parseReais("100"))).toBe(10000);
  });

  it("'9.99' → toMinor → 999 cents", () => {
    expect(toMinor(parseReais("9.99"))).toBe(999);
  });

  it("'9,99' → toMinor → 999 cents", () => {
    expect(toMinor(parseReais("9,99"))).toBe(999);
  });

  it("'1.234,56' → toMinor → 123456 cents", () => {
    expect(toMinor(parseReais("1.234,56"))).toBe(123456);
  });

  it("'-500' → toMinor → -50000 cents", () => {
    expect(toMinor(parseReais("-500"))).toBe(-50000);
  });

  it("'-1,50' → toMinor → -150 cents", () => {
    expect(toMinor(parseReais("-1,50"))).toBe(-150);
  });
});

describe("parseReais — rejected inputs (must throw)", () => {
  it("throws on ambiguous double-comma input ('1,234,56') — the shipped silent bug", () => {
    // More than one comma is an ambiguous fat-finger; previously silently yielded 123 cents.
    expect(() => parseReais("1,234,56")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseReais("")).toThrow();
  });

  it("throws on whitespace-only string", () => {
    expect(() => parseReais("   ")).toThrow();
  });

  it("throws on non-numeric text ('abc')", () => {
    expect(() => parseReais("abc")).toThrow();
  });

  it("throws on NaN-producing input ('--1')", () => {
    expect(() => parseReais("--1")).toThrow();
  });

  it("throws on non-finite input ('Infinity')", () => {
    expect(() => parseReais("Infinity")).toThrow();
  });
});

describe("parseReais — edit round-trip (toMajor → String → parseReais → toMinor)", () => {
  it("round-trips a positive amount: 999 cents → '9.99' → 999 cents", () => {
    expect(toMinor(parseReais(String(toMajor(999))))).toBe(999);
  });

  it("round-trips a large positive amount: 123456 cents → '1234.56' → 123456 cents", () => {
    expect(toMinor(parseReais(String(toMajor(123456))))).toBe(123456);
  });

  it("round-trips a negative amount: -15000 cents → '-150' → -15000 cents", () => {
    expect(toMinor(parseReais(String(toMajor(-15000))))).toBe(-15000);
  });

  it("round-trips zero: 0 cents → '0' → 0 cents", () => {
    expect(toMinor(parseReais(String(toMajor(0))))).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AmountMinorSchema — integer-cents validation with JS-safe-integer ceiling
// ---------------------------------------------------------------------------

describe("AmountMinorSchema", () => {
  it("accepts 0", () => {
    expect(AmountMinorSchema.parse(0)).toBe(0);
  });

  it("accepts MAX_AMOUNT_MINOR (Number.MAX_SAFE_INTEGER)", () => {
    expect(AmountMinorSchema.parse(MAX_AMOUNT_MINOR)).toBe(MAX_AMOUNT_MINOR);
  });

  it("accepts MIN_AMOUNT_MINOR (-Number.MAX_SAFE_INTEGER)", () => {
    expect(AmountMinorSchema.parse(MIN_AMOUNT_MINOR)).toBe(MIN_AMOUNT_MINOR);
  });

  it("accepts a large value within bounds (12000000000 — the original crash value)", () => {
    expect(AmountMinorSchema.parse(12_000_000_000)).toBe(12_000_000_000);
  });

  it("rejects MAX_AMOUNT_MINOR + 1 (out of range)", () => {
    expect(() => AmountMinorSchema.parse(MAX_AMOUNT_MINOR + 1)).toThrow();
  });

  it("rejects MIN_AMOUNT_MINOR - 1 (out of range)", () => {
    expect(() => AmountMinorSchema.parse(MIN_AMOUNT_MINOR - 1)).toThrow();
  });

  it("rejects a non-integer (1.5 is not an integer amount of cents)", () => {
    expect(() => AmountMinorSchema.parse(1.5)).toThrow();
  });
});
