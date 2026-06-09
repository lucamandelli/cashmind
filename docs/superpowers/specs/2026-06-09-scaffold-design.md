# Scaffold Design — CashMind

**Date:** 2026-06-09
**Status:** approved
**Scope:** Initial monorepo scaffold — directory structure, tooling config, Prisma schema, package wiring. No feature implementation.

---

## Context

The project has extensive documentation (`docs/`) but zero code. This spec defines the scaffold that turns the architecture decisions in `docs/ARCHITECTURE.md` into a runnable skeleton.

---

## Directory Structure

```
cashmind/
├── apps/
│   ├── api/                    # Fastify + Prisma + Better Auth
│   │   ├── src/
│   │   │   ├── index.ts        # entry point (boot, env validation)
│   │   │   └── env.ts          # Zod schema for env vars
│   │   ├── prisma/
│   │   │   └── schema.prisma   # domain model
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── web/                    # React + Vite SPA
│       ├── src/
│       │   ├── main.tsx
│       │   └── App.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                 # Zod schemas + inferred types
│       ├── src/
│       │   ├── index.ts
│       │   ├── money.ts        # toMinor / toMajor / formatBRL
│       │   └── schemas/
│       │       ├── transaction.ts
│       │       ├── account.ts
│       │       └── category.ts
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml          # Postgres dev
├── package.json                # npm workspaces root
├── tsconfig.base.json          # shared TS strict base
├── biome.json                  # lint + format (single tool)
└── .nvmrc                      # Node 22 LTS
```

---

## Tooling

| Tool | Config file | Purpose |
|---|---|---|
| TypeScript `strict: true` | `tsconfig.base.json` | shared base; each workspace extends it |
| Biome | `biome.json` | lint + format (replaces ESLint + Prettier) |
| Vitest | root `package.json` scripts | unit/integration tests |
| Node 22 LTS | `.nvmrc` | pinned runtime |
| Docker Compose | `docker-compose.yml` | Postgres dev container |

---

## Dependencies by Workspace

### Root (devDependencies)
- `typescript`, `@biomejs/biome`, `vitest`

### `apps/api`
- **Runtime:** `fastify`, `@fastify/cookie`, `@fastify/cors`, `@prisma/client`, `better-auth`, `zod`, `pino`
- **Dev:** `prisma`, `tsx`, `@types/node`
- **Workspace:** `@cashmind/shared`

### `apps/web`
- **Runtime:** `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zustand`, `recharts`, `date-fns`, `zod`, `tailwindcss`
- **Dev:** `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`
- **Workspace:** `@cashmind/shared`

### `packages/shared`
- **Peer:** `zod`

---

## Prisma Schema (domain model)

All data tables include `userId`, `currency` (default `"BRL"`), `createdAt`, `updatedAt`.

### Models

**User** — Better Auth manages auth fields; app adds profile fields as needed.

**Account**
- `id`, `userId`, `name`, `currency` (default BRL), `archivedAt?`, timestamps
- Balance is computed on read (sum of transactions), never stored.

**Category**
- `id`, `userId`, `name`, `kind` (INCOME | EXPENSE), `parentId?` (max 2 levels), `archivedAt?`, timestamps
- Archive never delete — preserves history.

**Transaction**
- `id`, `userId`, `type` (INCOME | EXPENSE | TRANSFER)
- `amountMinor` (Int — cents, never float)
- `date` (Date — no time, no timezone; avoids UTC day-shift)
- `fromAccountId?`, `toAccountId?` — coherence enforced by Zod + DB check:
  - EXPENSE → only `fromAccountId`
  - INCOME → only `toAccountId`
  - TRANSFER → both, must differ
- `categoryId?` (nullable — transfers have no category)
- `currency` (default BRL), `description?`, timestamps

---

## Key Invariants (enforced from day one)

1. `amountMinor` is always `Int` (cents). Never `Float`.
2. Every query filters by `userId`. Never chosen by input or model.
3. Transaction `date` is `DATE` (Prisma `@db.Date`). `createdAt`/`updatedAt` are `DateTime` (timestamptz UTC).
4. Archive (`archivedAt`) never delete for categories and accounts.
5. Zod schemas in `packages/shared` are the single source of truth — infer types, don't redefine.

---

## Out of Scope

- Auth routes and session middleware (Phase 1 feature work)
- React pages and routing setup (Phase 1 feature work)
- Vitest / Playwright test files (added per feature via TDD)
- CI pipeline (GitHub Actions — post-scaffold)
- PWA config (post-scaffold)
