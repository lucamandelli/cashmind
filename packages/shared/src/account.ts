import { z } from "zod";

export const CreateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
});
export type CreateAccount = z.infer<typeof CreateAccountSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Account = z.infer<typeof AccountSchema>;
