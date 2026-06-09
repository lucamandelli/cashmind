---
type: overview
status: current
updated: 2026-06-09
summary: Long-form architecture reference for CashMind — the design snapshot behind 00-overview and the ADRs.
tags: [overview, architecture, reference]
---

# CashMind — Architecture & Decisions

> Personal finance app to track spending and income.
> Living reference for the MVP's architectural decisions. The graph hub is
> [[00-overview]]; one-off decisions get promoted into [[decisions-index]] (ADRs).

---

## Overview

- **Single-user first**, with a **multi-user-ready** schema (`user_id` on every
  data table). Sharing with family/friends only "if the app turns out well".
- **Mobile-first web app** (responsive, installable PWA). No native app.
- Data entry in stages: **manual first → CSV import next**. Open banking maybe
  later (only if there's a free service, e.g. GoCardless/Nordigen in the EU).

---

## High-level architecture

- **Monorepo** with **npm workspaces**:

  ```
  cashmind/
  ├─ apps/
  │  ├─ web/      → React + Vite (frontend)
  │  └─ api/      → Fastify (backend)
  ├─ packages/
  │  └─ shared/   → Zod schemas + inferred types
  ├─ docker-compose.yml   → Postgres (dev)
  └─ package.json         → workspaces config
  ```

- **TypeScript end-to-end** (one language).
- Front↔back communication via **REST + shared Zod schemas**.
  - The same Zod schema (in `packages/shared`) validates: the **API** (Fastify),
    the **form** (React Hook Form), the **URL search params** (TanStack Router),
    and — in the future — the **agent's tools**.

---

## Backend — `apps/api`

| Item | Choice |
|---|---|
| Framework | **Fastify** (lean; without NestJS's weight) |
| ORM | **Prisma** (migrations + Prisma Studio to inspect data) |
| Database | **PostgreSQL** in all environments (Docker locally) |
| Auth | **Better Auth** (self-hosted, Prisma adapter) |
| Session | **`httpOnly` + `secure` cookie** (XSS-safe; no JWT in localStorage) |
| Env validation | **Zod** schema validated at boot (fails fast if a var is missing) |

- `.env` is gitignored; `.env.example` is committed.

---

## Frontend — `apps/web`

| Item | Choice | Note |
|---|---|---|
| Build/framework | **React + Vite (SPA)** | No Next.js — app is private, no SSR/SEO |
| Styling + components | **Tailwind CSS + shadcn/ui** | Mobile-first; we own the component code |
| Routing | **TanStack Router** | **Typed, Zod-validated search params** (dashboard filters) |
| Server state | **TanStack Query** | Cache, refetch, invalidation |
| Forms | **React Hook Form + Zod resolver** | |
| Client state | **Zustand** | **Only** UI/client state (theme, in-memory user). **NEVER** server data — that's TanStack Query |
| Charts | **Recharts** | |
| Dates (front) | **date-fns** | pt-BR formatting, month navigation |

---

## Domain model

```
User → Accounts → Transactions → Categories
```

### Transactions
- Types: `income`, `expense`, `transfer`.
- **Transfer = a single row** with `from_account_id` + `to_account_id`
  — see [[0001-transfer-single-row]].
- Coherence rule (validated in Zod + a DB check):
  - `expense` → only `from_account_id`
  - `income` → only `to_account_id`
  - `transfer` → both, and the two accounts must differ
- `category_id` is **nullable** (transfers have no category).

### Money
- Representation: **integer cents** (`amountMinor`). Never `float`.
- Base currency **BRL**, mono-currency in practice. The `currency` field already
  exists on records (door open to multi-currency with no painful migration).
- A formatting helper isolates conversion (`toMinor` / `toMajor` / `formatBRL`).
- An explicit rounding rule for divisions (splits/percentages).

### Accounts
- **Accounts/wallets** modeled from the schema (Nubank, cash, etc.).
- Balance computed on read — see [[accounts]].

### Categories
- **Shallow hierarchy** (self-reference via `parent_id`, max 2 levels).
- **pt-BR seed** per user + fully customizable.
- `kind` field (`income` | `expense`); the picker filters by transaction type.
- **Archive (`archived_at`), never delete** — preserves history/reports.

### Dates
- Transaction date → a **`DATE`** column (no time/zone; avoids the UTC
  "day shift" — see [[0001-date-day-shift]]).
- `created_at` / `updated_at` → **`timestamptz`** in UTC (audit, Prisma-managed).
- pt-BR formatting only at the UI edge.

---

## Scope

| Feature | Phase |
|---|---|
| CRUD transactions + accounts + categories | **MVP** |
| Per-account + total balances | **MVP** |
| Dashboard (spend by category, income×expense) | **MVP** |
| CSV import | Phase 2 |
| Budgets | Phase 2 |
| Recurring transactions | Phase 2 (needs a scheduled job) |
| Savings goals | Backlog |
| Multi-user: public sign-up + password reset + email verification | Future — locked in MVP, see [[0003-single-user-signup-lock]] |
| LLM / agent integration | Future (see below) |

---

## Quality & tooling

See [[conventions]] for the operational detail. Summary:

| Item | Choice |
|---|---|
| Tests | **Vitest** (unit/integration) + **Playwright** (E2E on sacred flows) |
| Test Postgres | **Testcontainers** |
| Test focus | **TDD on money/balance math**; integration on critical routes; little cosmetic UI testing |
| Lint + format | **Biome** (single tool) |
| TypeScript | `strict: true` from the start |
| Node | Pinned via **`.nvmrc`** (Node 22 LTS) |

---

## Deploy & infra

See [[deployment]] for the runbook. Summary:

- **Single VPS** running **Docker Compose**: Postgres + Fastify API +
  **Nginx + Certbot** (reverse proxy + HTTPS).
  - Nginx chosen for prior familiarity (industry standard); Certbot handles the
    Let's Encrypt certificate.
- Production mirrors dev (same Docker Compose).
- **Automatic backup is mandatory** (`pg_dump` nightly → object storage like
  B2/S3) from the moment the first family member has data in the app.

---

## Future phase — LLM / agent integration

> Out of current scope (still being learned). Decisions already aligned for when
> the time comes:

- Official **`@anthropic-ai/sdk`** (TypeScript) — no Python needed.
- Staged in sub-phases:
  - **3a — single calls:** auto-categorization (model **`claude-haiku-4-5`**) and
    monthly summaries (**`claude-sonnet-4-6`**). No loop; the model suggests, the
    user confirms.
  - **3b — conversational agent:** SDK tool runner with **tools defined in Zod**
    (`betaZodTool`), reusing the schemas in `packages/shared`.
- **Non-negotiable security rules:**
  1. The **Anthropic API key lives only on the backend** — never in React.
  2. The **agent's tools always filter by the session's `user_id`** — the model
     never chooses whose data it sees.
  3. **Reads free; writes confirmed** (human-in-the-loop for creating/editing
     transactions).

---

## Minor details (decide during implementation)

- Fastify security middleware: CORS, rate-limit, helmet.
- Logging: **`pino`** (integrates natively with Fastify).
- CI: GitHub Actions (lint + test on PR).
- PWA: the Vite PWA plugin.

---

## Guiding principle

> **Don't pay the complexity tax before the real pain exists.**
> Anticipate in the schema only what's expensive to add later (`user_id`,
> `account_id`, `currency`); leave isolated tables (budgets, recurring) for when
> the need actually shows up.

Parent: [[00-overview]]
