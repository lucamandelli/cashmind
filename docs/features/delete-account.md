---
type: feature
status: planned
updated: 2026-06-10
summary: Feature 1b — permanently delete an archived account, gated by a transfer-entanglement guard and a destructive-confirm modal; the deliberate escape hatch out of archive.
tags: [feature, accounts, delete]
---

# Delete account

## What it is

Feature 1b — a thin follow-on to [[accounts-management]]. Adds a **permanent
hard-delete** for archived accounts: the single, deliberate exception to the
project's "archive, never delete" rule, gated so it can **never corrupt another
account's balance**. Decided in [[0004-conditional-account-delete]].

## Flow

1. On the accounts screen, the user toggles to reveal archived accounts (the
   archived view from [[accounts-management]]).
2. An archived account that **qualifies** (no transfers to a surviving account)
   shows a **Delete** action. An entangled one shows no Delete — just a one-line
   "has transfers — can only stay archived."
3. Clicking Delete opens a **destructive confirm modal**: it warns that the
   deletion is permanent, removes the account and its transaction history, and
   cannot be undone.
4. Confirm → `DELETE /accounts/:id`. On success the account and its
   self-contained expenses/incomes are gone; TanStack Query invalidates and the
   row disappears.
5. The server enforces the guard ladder **independently of the UI** (must be
   archived; no surviving transfer counterpart) — see [[accounts-api]].

## Files

**Structure** (what `/plan-build` sequences from):

- **Contract impact — none.** Delete has no request body and returns `204`, so it
  introduces **no new shared Zod shape**. Unlike [[accounts-management]], this
  feature does **not** move the `packages/shared` contract — it's a route plus a
  UI affordance.
- **Layers — two.** `apps/api` (the `DELETE` route + guards) → `apps/web` (the
  conditional Delete affordance + confirm modal on archived rows). No
  `packages/shared` change, so the usual contract-first spine doesn't apply here;
  web depends only on the route.
- **Natural sub-units:**
  1. **Backend delete** — `DELETE /accounts/:id` with the archive-first guard.
     (The transfer-entanglement guard is *vacuous* until Feature 3 — see Gotchas.)
  2. **Delete UI** — the conditional Delete affordance on archived rows + the
     destructive confirm modal. Depends on sub-unit 1.

Targets created/changed (planned):

- `apps/api/src/routes/accounts.ts` — add `DELETE /accounts/:id` with the
  archive-first guard (and, from Feature 3 on, the transfer-entanglement guard).
- `apps/web/src/features/accounts/` — Delete affordance on qualifying archived
  rows + a destructive confirm modal (an `AlertDialog`).
- *(Feature 3, not here)* the `Transaction` model's account FK gains
  `onDelete: Cascade`, and this route gains the transfer-entanglement check.

The endpoint summary and full status-code contract live in [[accounts-api]]
(added at build time) — not duplicated here. There is no request body to point at.

## Rules

- **Delete only from archived.** An active account cannot be deleted — it must be
  archived first. This two-step is what makes a permanent action deliberate.
- **Transfer-entanglement guard.** An archived account is deletable only if it has
  **no transfers to a surviving account** (archived *or* active). Self-contained
  expenses/incomes cascade away with it; a transfer couples two accounts, so
  deleting its rows would silently change the counterpart's computed balance.
  Decided in [[0004-conditional-account-delete]].
- **Archive is the permanent hide for entangled accounts.** They can never be
  hard-deleted; archive already removes them from view and preserves every other
  account's correctness ([[accounts]]).
- **`userId` from the session only** — the same isolation invariant as the rest of
  the resource; a row that isn't the session user's is `404`, never leaked.
- **Destructive confirm, not type-to-confirm.** A single confirm modal with a
  clear "permanent, no undo" warning. Type-to-confirm is rejected because
  duplicate account names are allowed ([[accounts-management]]), which makes a
  name-match guard weak anyway.
- The full status-code contract (the `409`/`404`/`204` ladder) lives in
  [[accounts-api]] at build time — not copied here.

## Uses

The [[accounts]] domain note (balance formula, why transfers entangle), the
[[accounts-api]] resource (the `DELETE` endpoint + guard ladder), and
[[accounts-management]] (the archived state this builds on). The whole design is
decided in [[0004-conditional-account-delete]].

## Gotchas

- **The transfer guard is vacuous until Feature 3.** This feature ships *before*
  transactions exist, so at build time no account can have a transfer — **every**
  archived account is deletable, and the guard is correct-but-trivial. When
  [[transactions]] lands it **must** extend this route with the
  transfer-entanglement check and wire `onDelete: Cascade` on the
  `Transaction → account` FK. This obligation is cross-referenced from the
  Transactions roadmap entry so it isn't forgotten.
- **Narrow escape hatch, by design.** Post-Feature-3, any account that ever did a
  single transfer is permanently undeletable. That's intended (see the ADR's
  Consequences), not a bug — in practice delete mostly serves "I created this
  account by mistake / it never really got used."
- **Deletion removes history from reporting.** A deleted account's expenses/
  incomes vanish from the Feature 5 dashboard — consistent with "completely
  lost," but a real consequence to state plainly.

Parent: [[features-index]]
