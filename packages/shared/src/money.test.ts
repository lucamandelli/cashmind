import { describe, expect, it } from "vitest";
import { divideMinor, formatBRL, toMajor, toMinor } from "./money.js";

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
