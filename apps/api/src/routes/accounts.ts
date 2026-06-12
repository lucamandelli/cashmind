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
  initialBalance: bigint;
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
    // Convert BIGINT→number at the boundary. Values are bounded ≤ MAX_SAFE_INTEGER
    // by AmountMinorSchema, so Number() is always precision-exact here.
    initialBalance: Number(a.initialBalance),
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

    let name: string, initialBalance: number, currency: string;
    try {
      ({ name, initialBalance, currency } = CreateAccountSchema.parse(request.body));
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: err.errors[0]?.message ?? "validation error" });
      }
      throw err;
    }

    const created = await db.account.create({
      data: { userId, name, initialBalance: BigInt(initialBalance), currency },
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
    // Convert initialBalance to bigint at the Prisma boundary when present.
    const dbData = {
      ...data,
      ...(data.initialBalance !== undefined
        ? { initialBalance: BigInt(data.initialBalance) }
        : {}),
    };
    const { count } = await db.account.updateMany({
      where: { id, userId },
      data: dbData,
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

  // DELETE /accounts/:id — permanently hard-delete an archived account.
  // Guard ladder (read-first, so 404 and 409 are distinguishable):
  //   1. Row not found or belongs to another user  →  404
  //   2. Account is active (archivedAt is null)     →  409  (must archive first)
  //   3. Account is archived                        →  204  (deleted, no body)
  //
  // NOTE: When transactions exist (Feature 3), this route must also reject
  // deletion of an account that has transfers to a surviving account, and the
  // Transaction→account FK gets onDelete: Cascade. See ADR 0004
  // (docs/decisions/0004-conditional-account-delete.md). Vacuous until then.
  app.delete("/accounts/:id", async (request, reply) => {
    const userId = (request as FastifyRequest & { userId: string }).userId;
    const { id } = request.params as { id: string };

    // Read first so 404 (not yours / missing) and 409 (active) are separate codes.
    const existing = await db.account.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "not found" });

    if (existing.archivedAt === null) {
      return reply.status(409).send({ error: "account is not archived" });
    }

    // Scoped by both id AND userId for defence-in-depth.
    await db.account.deleteMany({ where: { id, userId } });
    return reply.status(204).send();
  });
};

export default accounts;
