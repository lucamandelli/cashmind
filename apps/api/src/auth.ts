import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db.js";
import env from "./env.js";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: "cashmind",
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  emailAndPassword: { enabled: true, disableSignUp: true },
  account: { modelName: "authAccount" },
  basePath: "/auth",
  trustedOrigins: [env.WEB_ORIGIN],
});

export type Session = typeof auth.$Infer.Session;
