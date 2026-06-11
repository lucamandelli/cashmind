---
type: overview
status: current
updated: 2026-06-10
summary: MVP roadmap — the ordered, dependency-sorted feature backlog to ship CashMind. Each item becomes its own feature note when work on it starts.
tags: [features, moc, roadmap]
---

# Features — MVP Roadmap

This note is two things at once:

1. **The hub** for end-to-end product flows (front + back). Each feature note
   links to the API and domain notes it touches, so backlinks reveal "what uses
   this".
2. **The MVP roadmap** — the ordered list of work to ship CashMind, sorted by
   dependency (you can't build a thing before the thing it stands on).

## How this roadmap works (lifecycle)

- **No separate `backlog/` folder.** A feature's life-stage is its `status`
  frontmatter: `planned` → `draft` → `current`. A parallel folder would only
  create migration friction and stale wikilinks.
- **Notes are created lazily.** While an item is just a line in this roadmap it
  has no note yet. It earns a full note (in the style of [[log-expense]]) **when
  you pick it up to build** — born `status: planned`, matured to `current` as the
  code lands. We don't pre-write 6 skeleton notes that would only rot.
- **This roadmap is the WHY/WHERE of the plan.** The WHAT of each feature lives
  in its own note (once it exists), in Zod, and in Prisma — not duplicated here.

## Build order

Items 0–5 are product; **1c is a foundation** item (frontend plumbing the later
product phases stand on); items 6–7 are **delivery** (not product features, but the
MVP isn't "done" until the app is usable on a phone with data protected).

### 0 · Walking skeleton

A thin vertical slice that crosses **every** layer once — the goal is to prove
the stack wires together (Prisma → shared Zod → Fastify route → httpOnly cookie →
TanStack Query → UI), not to ship breadth.

- **Scope:** minimal sign-in (one **seeded** single user, email+password — no
  sign-up, reset, or email verification) → `POST /accounts` creates one account
  → `GET /accounts` lists only that session's `user_id`.
- **Drags in (foundation):**
  - The financial `Account` Prisma model + `packages/shared/src/account.ts` Zod.
  - **Rename Better Auth's `Account` → `AuthAccount`** (`account: { modelName }`)
    so the domain keeps the `Account` name every doc already uses. _(Worth an ADR.)_
  - The `/accounts` route, scoped by session `user_id` (never from input).
- **Why first:** auth + `user_id` scoping is the riskiest "do the pieces fit?"
  and it's the app's #1 invariant — the skeleton must exercise the *real*
  session, not a stub.
- Uses: [[accounts]]

### 1 · Accounts (thicken)
Grow the skeleton's create/list into full account management (full schema, edit,
archive/unarchive) and ship the app's first production-quality UI.
→ [[accounts-management]] · Touches: [[accounts]] · [[accounts-api]] · status: planned

### 1b · Delete account
Permanently delete an archived account, gated by a transfer-entanglement guard and
a destructive-confirm modal — the deliberate escape hatch out of archive.
→ [[delete-account]] · Touches: [[accounts]] · [[accounts-api]] · [[accounts-management]] · [[0004-conditional-account-delete]] · status: planned

### 1c · Design tokens — _foundation_
Wire the design-system color/token set into Tailwind v4 + shadcn (`apps/web`) so it
becomes the shared visual language for every frontend phase after it. Not a product
flow — its rationale and build brief live in the ADR; the `## Frontend design tokens`
convention section lands with the code. Existing screens are **not** re-skinned here.
→ [[0005-design-token-system]] · Touches: [[conventions]] · status: planned

### 2 · Categories

- **Scope:** pt-BR **seed** per user + CRUD; `kind` field (`income` | `expense`);
  archive, never delete. The picker filters by `kind`.
- **Why before transactions:** the seed makes categories nearly free, and the
  dashboard needs them. Category stays **optional** on a transaction, so fast
  entry is preserved.

### 3 · Transactions (full CRUD)

**One feature**, because it's one Zod discriminated union (`CreateTransactionSchema`)
and one route — a union wants to be written whole. Includes all three types.

- **Scope:** schema + route + the four balance branches (one block) · the three
  entry forms (expense → income → transfer) · the **list / history** view (read,
  filter by month/account/category/type) · edit · delete.
- **Build order inside the item:** schema+route+coherence → expense form (prove
  the slice) → income & transfer as variations → list/history → edit/delete.
- **Category optional** (`nullable`) on expense/income; transfers never have one.
- **Extends [[delete-account]]:** once transactions exist, the account-delete route
  must gain the transfer-entanglement guard and `onDelete: Cascade` on the
  `Transaction → account` FK (both vacuous until now). See
  [[0004-conditional-account-delete]].
- Uses: [[transactions]] · [[log-expense]] (the expense entry form) ·
  [[0001-transfer-single-row]] · [[0001-date-day-shift]]

### 4 · Balances

- **Scope:** per-account + total, **computed on read** (never stored). Display on
  the accounts list + a total summary.
- **TDD here** — this is the heart of money correctness (the four-branch formula
  in [[accounts]]). Explicit item so it gets the tests it deserves, not a display
  tacked onto Accounts.
- **Why after transactions:** balance is only meaningful once transactions exist
  (before that it's just `initialBalance`).

### 5 · Dashboard

- **Scope (minimal):** month selector (typed, Zod-validated search params in
  TanStack Router) · spend-by-category (Recharts) · income × expense for the
  month.
- **Explicitly cut from MVP:** multi-month trends, chart→list drill-down, any
  budget view (phase 2).

### 6 · PWA — _delivery_

- **Scope:** installable on the phone (Vite PWA plugin + app shell). The product
  is mobile-first daily logging; this is what makes it usable day to day.

### 7 · Deploy + Backup — _delivery_

- **Scope:** VPS + Docker Compose (Postgres + API + Nginx + Certbot/HTTPS), per
  the [[deployment]] runbook · **nightly `pg_dump` → object storage** (mandatory
  the moment real data exists — your own data counts).

## Phase 2+ (not MVP)

- CSV import · Budgets · Recurring transactions (needs a scheduled job) · Savings
  goals · LLM / agent integration. See the Scope table in [[ARCHITECTURE]].

Parent: [[00-overview]]
