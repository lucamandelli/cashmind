import env from "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { fromNodeHeaders } from "better-auth/node";
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
// Uses auth.handler (Fetch API) because Fastify consumes the body stream before
// toNodeHandler can read it; request.body is already parsed and safe to use.
app.route({
  method: ["GET", "POST"],
  url: "/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const req = new Request(url.toString(), {
      method: request.method,
      headers: fromNodeHeaders(request.headers),
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });
    const response = await auth.handler(req);
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body ? await response.text() : null);
  },
});

// Routes
await app.register(health, { prefix: "/" });
await app.register(accounts, { prefix: "/" });

// Start
await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info(`CashMind API listening on port ${env.PORT}`);
