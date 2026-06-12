---
type: decision
status: accepted
updated: 2026-06-12
summary: Migrate from Prisma 6 to 7 — adopt the new prisma-client generator, driver adapter (@prisma/adapter-pg), and prisma.config.ts for the CLI connection string.
tags: [decisions, prisma, database, tooling]
---

# 0008 — Prisma v7 Migration

## Status

Accepted

## Context

Prisma 7 introduces three breaking changes that all hit `apps/api`:

1. `url` is no longer valid in `datasource` inside `schema.prisma` — the
   CLI connection string moves to `prisma.config.ts`.
2. `new PrismaClient()` without a driver adapter throws — Prisma drops its
   Rust query engine in favour of database-specific JS adapters.
3. The `prisma-client-js` generator is in maintenance mode and will be removed
   — the replacement is the `prisma-client` generator, which requires a custom
   `output` path (no more `node_modules` magic).

The project was on 6.19.3. Rather than defer the migration and hit these at an
unknown future upgrade, we did it when the forward-compat warning first appeared.

## Decision

- Add `apps/api/prisma.config.ts` — the Prisma CLI reads the connection string
  from there via `defineConfig` / `env("DATABASE_URL")`.
- Install `@prisma/adapter-pg` and pass a `PrismaPg` adapter when constructing
  `PrismaClient` in `apps/api/src/db.ts` and `apps/api/src/test/authForTest.ts`.
- Switch to the `prisma-client` generator with `output = "../src/generated/prisma"`
  and `moduleFormat = "esm"` (matches the project's `"type": "module"` + NodeNext).
  The generated client lives under `src/` so `tsc -b` bundles it into `dist/`.
- Add `postinstall: prisma generate` to `apps/api/package.json` so the generated
  client exists after a fresh `npm install`; flip `build` to
  `prisma generate && tsc -b`.
- Gitignore `apps/api/src/generated/` — it's a build artifact.

Better Auth is unaffected: its `prismaAdapter(db, …)` receives the fully-constructed
`PrismaClient` instance; the connection mechanism is transparent to it. Table schemas
and the `TIMESTAMP(3)` convention (see `docs/log/0004-better-auth-tables-timestamp3.md`)
are untouched.

## Alternatives considered

**Stay on `prisma-client-js` generator (legacy mode):** Still requires the adapter
and `prisma.config.ts` changes. Defers the generator switch to a future upgrade
without reducing work. Rejected — do it once, do it now.

**Use `pg` pool instead of `@prisma/adapter-pg`:** Possible, but the official adapter
is the canonical path; it handles connection pooling, prepared statements, and
future Prisma features (e.g. Accelerate) consistently.

## Consequences

- CLI commands (`prisma migrate dev`, `prisma studio`, `prisma generate`) now load
  the connection string from `prisma.config.ts`; the `url` field is gone from
  `schema.prisma`.
- Import path for `PrismaClient` is now `./generated/prisma/client.js` (from `src/`)
  instead of `@prisma/client`.
- `DATABASE_URL` must be set before `new PrismaClient()` is called, since `PrismaPg`
  reads `connectionString` eagerly. The Testcontainer test setup already satisfies
  this (see `apps/api/src/test/setupEnv.ts`).

Parent: [[decisions-index]]
