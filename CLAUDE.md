# CashMind — Claude Code Guide

CashMind is a personal finance app to track spending and income. Single-user
first, with a multi-user-ready schema. Web app, mobile-first (responsive PWA).
TypeScript end-to-end.

Full architecture and rationale: see `docs/ARCHITECTURE.md`.

## Invariants (apply to ALL code — never violate)

- **Language is English.** All code (identifiers, comments, strings) and all
  `docs/` notes must be written in English. Conversations with the user may be
  in any language, but anything committed to the repo is English.
- **Money is integer cents** (`amountMinor: number`). Never use floats for money.
- **Every data row is scoped by `user_id`.** Queries always filter by the
  authenticated user. The user is never chosen by input or by an LLM.
- **Zod schemas in `packages/shared` are the source of truth** for data shapes,
  validation, and types. Don't redefine types — infer them from Zod.
- **Transaction date is a `DATE`** (no time, no timezone). `created_at` /
  `updated_at` are `timestamptz` in UTC **in our domain tables**. Better Auth's
  tables follow the library's own schema (they keep `TIMESTAMP(3)`) — don't migrate
  them to match our convention; see `docs/log/0004-better-auth-tables-timestamp3.md`.
- **Archive, never delete** domain records (categories, accounts): set `archived_at`.
  Exception: a non-entangled archived account may be hard-deleted via
  `DELETE /accounts/:id` — see `docs/decisions/0004-conditional-account-delete.md`.
- Base currency is **BRL**, mono-currency. The `currency` field exists on records
  so multi-currency can be added later without a migration.

## Repo map

- `apps/web` — React + Vite SPA (frontend)
- `apps/api` — Fastify (backend)
- `packages/shared` — Zod schemas + inferred types (imported by both apps)

## Living documentation (`docs/`)

`docs/` is the project's second brain. It is optimized to be read by you (Claude)
and doubles as an Obsidian vault for the human to navigate as a graph.

**How the system works (types, links, templates): `docs/README.md`.**
**Map of everything (graph hub): `docs/00-overview.md`.**

### Two rules — non-negotiable

1. **Before** changing an area, READ its note under `docs/`.
2. **After** changing that area's behavior, UPDATE its note in the **same commit**
   (use the `/document` skill). Documentation and code travel together.

### Scope rule

Document the **WHY** and the **WHERE**. Let the code be the **WHAT**.
Never hand-copy contracts that already live in Zod / Prisma / tests — point to
them instead. A copied fact is a future lie.

### Definition of Done (do this automatically — don't wait to be asked)

When you finish a change:

1. Code respects the invariants above.
2. **Only if** the change affects something the docs describe — behavior,
   business rules, API surface, a decision, or structure — update the relevant
   `docs/` note (same commit) via the `/document` skill.
   Purely cosmetic or trivial tweaks (styling, colors, copy, refactors with no
   behavior change) do **NOT** need docs — we document the WHY/WHERE, not the WHAT.
3. Commit with a Conventional Commit (see [conventions](docs/conventions.md)).

### Index

- Overview / graph hub → `docs/00-overview.md`
- Domain (entities, balance rules) → `docs/domain/`
- API (REST resources) → `docs/api/`
- Features (end-to-end product flows) → `docs/features/`
- Decisions (ADRs — the "why") → `docs/decisions/`
- Ops (infra, deploy, backup, runbook) → `docs/ops/`
- Conventions (how we build, testing strategy) → `docs/conventions.md`
- Log (known bugs & gotchas) → `docs/log/`
