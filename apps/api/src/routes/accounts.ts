import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { z, ZodError } from "zod";
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountSchema,
} from "@cashmind/shared";
import { auth } from "../auth.js";
import { db } from "../db.js";

async function getUserId(request: FastifyRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
  return session?.user.id ?? null;
}

/** Shape returned by Prisma for account rows — maps to AccountSchema. */
type AccountRow = {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currency: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const serialize = (a: AccountRow) =>
  AccountSchema.parse({
    id: a.id,
    userId: a.userId,
    name: a.name,
    initialBalance: a.initialBalance,
    currency: a.currency,
    archivedAt: a.archivedAt ? a.archivedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  });

/** Query-string schema for GET /accounts */
const ListQuerySchema = z.object({
  includeArchived: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

const accounts: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request, reply) => {
    const userId = await getUserId(request);
    if (!userId) return reply.status(401).send({ error: "unauthorized" });
    (request as FastifyRequest & { userId: string }).userId = userId;
  });

  // GET /accounts — active only by default; ?includeArchived=true includes archived
  app.get("/accounts", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { includeArchived } = ListQuerySchema.parse(request.query);
    const rows = await db.account.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { createdAt: "desc" },
    });
    return reply.send(rows.map(serialize));
  });

  // POST /accounts — create a new account
  app.post("/accounts", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { name, initialBalance, currency } = CreateAccountSchema.parse(
      request.body,
    );
    const created = await db.account.create({
      data: { userId, name, initialBalance, currency },
    });
    return reply.status(201).send(serialize(created));
  });

  // PATCH /accounts/:id — edit user-editable fields; never writes archivedAt
  app.patch("/accounts/:id", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { id } = request.params as { id: string };

    let data: ReturnType<typeof UpdateAccountSchema.parse>;
    try {
      data = UpdateAccountSchema.parse(request.body);
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: err.errors[0]?.message ?? "validation error" });
      }
      throw err;
    }

    // UpdateAccountSchema already excludes archivedAt. Mutation is scoped
    // atomically by both id AND userId — no separate findFirst needed.
    const { count } = await db.account.updateMany({
      where: { id, userId },
      data,
    });
    if (count === 0) return reply.status(404).send({ error: "not found" });

    // Re-read the updated row to return the full serialised shape.
    const updated = await db.account.findFirst({ where: { id, userId } });
    return reply.send(serialize(updated!));
  });

  // POST /accounts/:id/archive — set archivedAt; idempotent
  app.post("/accounts/:id/archive", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { id } = request.params as { id: string };

    // Read first so we can preserve idempotency: do not overwrite an existing
    // archivedAt timestamp on re-archive. The read is scoped by userId.
    const existing = await db.account.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "not found" });

    // Mutation is also scoped atomically by both id AND userId.
    await db.account.updateMany({
      where: { id, userId },
      data: { archivedAt: existing.archivedAt ?? new Date() },
    });
    const archived = await db.account.findFirst({ where: { id, userId } });
    return reply.send(serialize(archived!));
  });

  // POST /accounts/:id/unarchive — clear archivedAt; idempotent
  app.post("/accounts/:id/unarchive", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { id } = request.params as { id: string };

    // Mutation scoped atomically by both id AND userId.
    const { count } = await db.account.updateMany({
      where: { id, userId },
      data: { archivedAt: null },
    });
    if (count === 0) return reply.status(404).send({ error: "not found" });

    const unarchived = await db.account.findFirst({ where: { id, userId } });
    return reply.send(serialize(unarchived!));
  });
};

export default accounts;
