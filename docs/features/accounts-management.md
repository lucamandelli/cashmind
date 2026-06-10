---
type: feature
status: planned
updated: 2026-06-10
summary: Feature 1 — grow the walking skeleton's create/list into full account management (full schema, edit, archive/unarchive) and ship the app's first production-quality UI (authed shell, login glow-up, accounts CRUD).
tags: [feature, accounts, archive, ui]
---

# Accounts management

## What it is

Feature 1 ("Accounts thicken", item 1 of [[features-index]]). Turns Feature 0's
throwaway create/list ([[walking-skeleton]]) into real account management, and
ships the app's **first production-quality UI** — everything the skeleton left as
bare scaffolding. Two fronts that meet at the shared Zod contract: a thicker
**accounts** resource (back) and a refined authenticated **UI** (front).

## Flow

**Manage accounts**

1. The authed user lands on the accounts screen (inside the shell, below).
2. "Add" / per-row "edit" open the same `AccountForm` in a Dialog (desktop) /
   Drawer (mobile). Amounts are typed in reais and converted to integer cents at
   the UI edge via the money helper.
3. The form validates against the shared Zod schema → `POST /accounts` or
   `PATCH /accounts/:id`.
4. Archive / unarchive a row → `POST /accounts/:id/archive` · `/unarchive`. The
   list shows active accounts by default; a toggle reveals archived ones
   (`?includeArchived=true`).
5. TanStack Query invalidates and the list re-renders.

**Auth shell + login**

- A pathless layout route guards every authed page once and renders the shared
  header (logo + sign-out); the accounts page becomes its child. Routing stack
  in [[ARCHITECTURE]].
- The login screen is refined to product quality (branded lockup, password
  visibility, proper loading/error states). Auth behavior is unchanged —
  public sign-up stays locked ([[0003-single-user-signup-lock]]).

## Files

**Structure** (what `/plan-build` sequences from):

- **Contract impact — yes.** One change to the shared Zod contract
  (`packages/shared/src/account.ts`: thicken `AccountSchema`, add an update
  schema) plus the matching Prisma migration. This is the spine: both the API
  and every form/list downstream read from it, so it lands before the layers
  that consume it.
- **Layers — three.** `packages/shared` (contract + the money helper) →
  `apps/api` (edit + archive/unarchive routes, archived filter on list) →
  `apps/web` (auth shell, login glow-up, `AccountForm`, list). Web depends on
  the route, which depends on the contract; the money helper is a leaf the form
  and list both import.
- **Natural sub-units** (independently shippable once the contract lands):
  1. **Backend thicken** — schema/migration + edit + archive/unarchive +
     archived filter (the `accounts` resource).
  2. **Money helper** — `money.ts`, TDD, self-contained (no UI/API dependency).
  3. **Auth shell** — the pathless `_authenticated` layout (session guard +
     header), `Logo`, login glow-up. Pure front; depends only on existing auth.
  4. **Accounts UI** — `AccountForm` (create/edit) + list with the
     active/archived toggle. Depends on sub-units 1 + 2, and renders inside 3.

Targets created/changed (planned):

- `apps/api/prisma/schema.prisma` — thicken `Account` (initial balance, currency,
  archive) + migration.
- `packages/shared/src/account.ts` — extend the schemas; add the update schema.
- `packages/shared/src/money.ts` — money helper (reais ⇄ cents, BRL format),
  **TDD** (colocated test is the spec).
- `apps/api/src/routes/accounts.ts` — add edit + archive/unarchive; honor the
  archived filter on list.
- `apps/web/src/routes/_authenticated.tsx` — shell layout (session guard + header).
- `apps/web/src/routes/_authenticated/accounts.tsx` — accounts page (moved here).
- `apps/web/src/features/accounts/AccountForm.tsx` — create/edit form.
- `apps/web/src/components/Logo.tsx` — theme-aware brand mark.
- `apps/web/src/routes/login.tsx` — glow-up.
- `apps/web/src/assets/brand/` (lockup, symbol, symbol-dark) ·
  `apps/web/public/icons/` (app-icon source SVGs — ink/paper variants; favicon
  and PWA manifest wiring is Feature 6).

Field shapes, validation, and endpoint contracts live in the code, not here —
see `packages/shared/src/account.ts` (Zod), the Prisma model, and
`apps/api/src/routes/accounts.ts`. Endpoint summary lives in the [[accounts-api]]
note.

## Rules

- **`userId` from the session only** — the project's #1 isolation invariant. A
  row that isn't the session user's simply isn't found (`404`), never leaked.
- **Money is integer cents.** Conversion happens once, at the UI edge, through the
  money helper — never re-implemented per form.
- **`initialBalance` is editable anytime** and may be negative. Editing is safe
  because balance is **computed on read** ([[accounts]]) — there is no stored
  balance to drift, it just recomputes. Negative is allowed: with no `type` field
  to distinguish credit from debit, a debt / credit-card start is legitimate.
- **`currency` exists but has no UI** — default BRL, mono-currency in practice;
  the field keeps the door open to multi-currency with no migration
  ([[ARCHITECTURE]]).
- **Archive, never delete.** The list shows active accounts by default; archived
  ones are revealed behind a toggle and can be unarchived. History is always
  preserved.
- **The list row shows the formatted `initialBalance`** for now; Feature 4
  (Balances) swaps that same slot's source to the computed balance.
- **No `type` field yet.** Deferred per the complexity-tax principle
  ([[ARCHITECTURE]]): nothing branches on account type today, and it is cheap to
  add (nullable column) the day a feature actually needs it.
- **Accounts are text-only — no color or icon.** Rows differentiate by name +
  balance. A visual differentiator is deferred for the same reason as `type`:
  nothing depends on it, and a nullable column is a cheap add when the UI is
  actually felt to need it. Keeps this first production UI focused on the CRUD.
- **Archive is a state transition, not a field edit.** It gets dedicated action
  endpoints (`/archive` · `/unarchive`); `PATCH /accounts/:id` never writes
  `archived_at`. Explicit intent, idempotent, simple to guard — and the
  alternative (folding it into `PATCH`) is obvious enough not to need an ADR.
- **React naming**: our own components are PascalCase files; route files stay
  lowercase (TanStack maps filename → URL) and shadcn primitives stay lowercase
  (their CLI convention). Documented in [[conventions]].

> [!note] Single-user assumptions
> A few choices here lean on "one user today" and should be revisited when the
> app opens to family / friends (a tracked future — [[0003-single-user-signup-lock]]):
> **no account-name uniqueness** (duplicate names allowed) and **light archive**
> (no heavy confirmation). These are **product / UX** assumptions only — data
> isolation already holds regardless, because every query filters by the
> session's `user_id`.

## Uses

The [[accounts]] domain note (balance formula, archive invariant) and the
[[accounts-api]] API resource (endpoint summary). Auth scope decided in
[[0003-single-user-signup-lock]]; the stack, money, and currency rationale live
in [[ARCHITECTURE]]. Naming convention in [[conventions]].

## Gotchas

- **Dark-mode logo**: the symbol's `$` is ink (black), so it vanishes on a dark
  surface — `Logo` is theme-aware (uses `cashmind-symbol-dark.svg` on dark). Dark
  mode itself is **not** built in this feature; the `Logo` just must not block it.
- **Brand assets must live under `src/`** (`apps/web/src/assets/brand/`) to follow
  Vite's import convention; app icons / favicon go in `apps/web/public/`.
- The list's balance column is **initial balance, not live balance**, until
  Feature 4 — harmless now, since no transactions exist before Feature 3.

Parent: [[features-index]]
