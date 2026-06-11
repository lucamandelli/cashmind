import { z } from "zod";

export const CreateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  initialBalance: z.number().int().default(0),
  currency: z.string().default("BRL"),
});
export type CreateAccount = z.infer<typeof CreateAccountSchema>;

/** Fields the user may edit on an existing account. Archive is a state transition — not a field edit. */
export const UpdateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    initialBalance: z.number().int(),
    currency: z.string(),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "at least one field required",
  });
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  initialBalance: z.number().int(),
  currency: z.string(),
  /** Null when active; ISO 8601 timestamptz string when archived. Read-only — mutated only via /archive and /unarchive. */
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Account = z.infer<typeof AccountSchema>;
