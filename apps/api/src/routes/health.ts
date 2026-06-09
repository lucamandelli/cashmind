import type { FastifyPluginAsync } from "fastify";
import { HealthResponseSchema } from "@cashmind/shared";
import { db } from "../db.js";

const health: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => {
    try {
      await db.$queryRaw`SELECT 1`;

      const body = HealthResponseSchema.parse({
        status: "ok",
        db: "ok",
        timestamp: new Date().toISOString(),
      });

      return reply.send(body);
    } catch (err) {
      app.log.error(err, "Health check failed");
      return reply.status(500).send({ status: "error", db: "error" });
    }
  });
};

export default health;
