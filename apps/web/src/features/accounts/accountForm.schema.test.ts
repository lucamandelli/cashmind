import { describe, it, expect } from "vitest";
import { toMinor } from "@cashmind/shared";
import { FormSchema } from "./accountForm.schema";

function parseAmount(raw: string): number {
  const result = FormSchema.safeParse({ name: "Test", amountReais: raw });
  if (!result.success) throw new Error(result.error.issues[0]?.message);
  return toMinor(result.data.amountReais);
}

describe("FormSchema — money wiring", () => {
  it('"9,99" → 999 cents via parseReais + toMinor', () => {
    expect(parseAmount("9.99")).toBe(999);
  });

  it('"6000" (NumericFormat clean value for 6.000,00) → 600000 cents', () => {
    expect(parseAmount("6000")).toBe(600000);
  });

  it('"6000.5" (NumericFormat clean value for 6.000,50) → 600050 cents', () => {
    expect(parseAmount("6000.5")).toBe(600050);
  });

  it("negative amounts are valid — -50 → -5000 cents", () => {
    expect(parseAmount("-50")).toBe(-5000);
  });

  it("non-numeric input fails validation", () => {
    const result = FormSchema.safeParse({ name: "Test", amountReais: "abc" });
    expect(result.success).toBe(false);
  });

  it("empty string fails validation", () => {
    const result = FormSchema.safeParse({ name: "Test", amountReais: "" });
    expect(result.success).toBe(false);
  });

  it("name required — empty name fails", () => {
    const result = FormSchema.safeParse({ name: "", amountReais: "10" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/required/i);
  });

  it("name max 100 chars", () => {
    const result = FormSchema.safeParse({ name: "a".repeat(101), amountReais: "10" });
    expect(result.success).toBe(false);
  });
});
