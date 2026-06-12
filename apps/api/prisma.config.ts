import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // process.env instead of env() so `prisma generate` works without DATABASE_URL
  // (generate doesn't connect; migrate/db push will still fail at connection time if unset)
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
