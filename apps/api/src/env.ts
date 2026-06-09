import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SEED_USER_EMAIL: z.string().email().optional(),
  SEED_USER_PASSWORD: z.string().min(8).optional(),
  SEED_USER_NAME: z.string().default("Owner"),
});

const env = envSchema.parse(process.env);

export default env;
