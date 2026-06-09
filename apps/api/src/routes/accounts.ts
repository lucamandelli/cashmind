import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { CreateAccountSchema, AccountSchema } from "@cashmind/shared";
import { auth } from "../auth.js";
import { db } from "../db.js";

async function getUserId(request: FastifyRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
  return session?.user.id ?? null;
}

const serialize = (a: {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}) =>
  AccountSchema.parse({
    id: a.id,
    userId: a.userId,
    name: a.name,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  });

const accounts: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request, reply) => {
    const userId = await getUserId(request);
    if (!userId) return reply.status(401).send({ error: "unauthorized" });
    (request as FastifyRequest & { userId: string }).userId = userId;
  });

  app.get("/accounts", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const rows = await db.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(rows.map(serialize));
  });

  app.post("/accounts", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { name } = CreateAccountSchema.parse(request.body);
    const created = await db.account.create({ data: { userId, name } });
    return reply.status(201).send(serialize(created));
  });
};

export default accounts;
