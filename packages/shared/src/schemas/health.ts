import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  db: z.literal("ok"),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
