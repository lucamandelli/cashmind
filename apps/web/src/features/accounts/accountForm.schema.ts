import { z } from "zod";
import { parseReais } from "@cashmind/shared";

export const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(100, "Name must be 100 characters or fewer"),
  /**
   * Amount typed by the user in BRL major units (reais). May be negative.
   * RHF stores NumericFormat's clean `values.value` (English-format numeric
   * string, e.g. "6000" or "9.99") — NOT the formatted display string.
   * The transform calls parseReais() then toMinor() via the caller.
   */
  amountReais: z
    .string()
    .transform((v) => {
      try {
        return parseReais(v);
      } catch {
        return Number.NaN;
      }
    })
    .pipe(z.number().finite("Enter a valid amount")),
});

export type FormValues = z.input<typeof FormSchema>;
