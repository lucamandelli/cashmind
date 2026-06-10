/**
 * Test utility — builds a minimal Fastify application with only the accounts
 * plugin registered (auth preHandler included). Used by integration tests.
 */
import Fastify from "fastify";
import accounts from "../routes/accounts.js";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(accounts, { prefix: "/" });
  return app;
}
