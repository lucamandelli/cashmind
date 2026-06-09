import env from "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import health from "./routes/health.js";
import accounts from "./routes/accounts.js";

const app = Fastify({ logger: true });

// Security: must be registered before routes
await app.register(cors, {
  origin: env.WEB_ORIGIN,
  credentials: true,
});
await app.register(helmet);
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Better Auth handler — mounted at /auth/* (Vite proxy strips /api prefix)
const authHandler = toNodeHandler(auth);
app.all("/auth/*", async (request, reply) => {
  await authHandler(request.raw, reply.raw);
  reply.hijack();
});

// Routes
await app.register(health, { prefix: "/" });
await app.register(accounts, { prefix: "/" });

// Start
await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info(`CashMind API listening on port ${env.PORT}`);
