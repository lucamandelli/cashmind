/**
 * Test-only auth instance that includes the testUtils plugin.
 * Kept separate from the production auth config so testUtils never leaks
 * into a production build.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { testUtils } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

// Each test file that imports this module gets a client scoped to the test DB
// (DATABASE_URL is set in setupEnv.ts before any import).
const testDb = new PrismaClient();

export const testAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "test-secret-32-chars-long-enough!!",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  database: prismaAdapter(testDb, { provider: "postgresql" }),
  advanced: { cookiePrefix: "cashmind" },
  session: { cookieCache: { enabled: false } },
  emailAndPassword: { enabled: true, disableSignUp: true },
  account: { modelName: "authAccount" },
  basePath: "/auth",
  trustedOrigins: [process.env.WEB_ORIGIN ?? "http://localhost:5173"],
  plugins: [testUtils()],
});

export { testDb };
