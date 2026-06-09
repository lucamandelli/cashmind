---
type: ops
status: current
updated: 2026-06-09
summary: The monorepo was scaffolded — workspaces, tooling, and end-to-end hello path working. Describes WHERE each piece lives.
tags: [ops, scaffold, monorepo, tooling]
---

# Monorepo Scaffold

## Why this structure

npm workspaces monorepo with three packages (`packages/shared`, `apps/api`,
`apps/web`) because the same Zod schema needs to validate: the Fastify request,
the React Hook Form form, and the TanStack Router search params. A single
`packages/shared` eliminates type duplication and ensures API and frontend never
drift. Details in [[ARCHITECTURE]].

## Where each piece lives

| Piece | Path | Responsibility |
|---|---|---|
| Zod schemas + money helpers | `packages/shared/src/` | Source of truth for types |
| REST API | `apps/api/src/` | Fastify + Prisma + Better Auth |
| DB schema | `apps/api/prisma/schema.prisma` | Prisma models (Better Auth only for now) |
| Frontend SPA | `apps/web/src/` | React + Vite + TanStack Router/Query |
| Dev Postgres | `docker-compose.yml` | `postgres:16`, port 5432 |
| Env vars | `apps/api/.env` (gitignored) | Template at `.env.example` in root |

## Hello path — architecture proof

The scaffold acceptance gate is this flow running end-to-end:

```
Browser → GET /api/health
  → Vite proxy (port 5173, rewrites /api → /)
  → Fastify (port 3001, route GET /health)
  → Prisma SELECT 1 on Postgres
  → response validated against HealthResponseSchema (@cashmind/shared)
  → TanStack Query (cache + types) renders in React
```

To run: `docker compose up -d` → `npm run dev` at the repo root.

## Tooling configured

- **Biome** — lint + format, config at `biome.json` in root
- **TypeScript** — `strict: true`, project references (`tsc -b`); base at `tsconfig.base.json`
- **Vitest** — unit/integration; config per workspace; `src/**` only
- **Playwright** — config at `apps/web/playwright.config.ts`; no specs yet
- **Node 22 LTS** — pinned in `.nvmrc`

## Scaffold gotchas

- **Prisma + npm workspaces:** the generator `output` points to
  `../../../node_modules/.prisma/client` (monorepo root) to avoid a hoisting
  mismatch. See schema at `apps/api/prisma/schema.prisma`.
- **`@cashmind/shared` in Vite:** alias in `vite.config.ts` points to
  `packages/shared/src/index.ts` (raw TS source) for cross-workspace HMR;
  `tsc -b` uses `dist/` via project references.
- **`Account` name collision:** see [[0002-better-auth-account-collision]].
- **Better Auth `--env-file`:** the API `dev` script uses
  `tsx watch --env-file .env` to load `.env` when run via workspace from the
  repo root.
- **Helmet + Fastify 5 scoping:** `@fastify/helmet` must be registered directly
  in `server.ts` (not inside a child plugin wrapper). Its `addHook('onRoute')`
  does not apply to routes in the parent scope when registered via a child plugin.

Parent: [[ops-index]]
