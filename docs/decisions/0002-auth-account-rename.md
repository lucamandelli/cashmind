---
type: decision
status: accepted
updated: 2026-06-09
summary: Rename Better Auth's `Account` model to `AuthAccount` so the domain keeps the `Account` name.
tags: [decision, adr, auth, accounts]
---

# ADR 0002 — Rename Better Auth's `Account` to `AuthAccount`

## Status

accepted

## Context

Better Auth ships a Prisma model named `Account` (it stores OAuth/credential
provider links: `providerId`, `accessToken`, `refreshToken`, …). CashMind's
domain *also* needs an `Account` — the financial account/wallet (Nubank, cash,
savings). Two different concepts want the same name in one schema.

The domain term is load-bearing across the whole project: `from_account_id`,
`to_account_id`, `account_id`, `packages/shared/src/account.ts`, [[accounts]],
and the balance formula all assume the financial entity is called `Account`.
"Account" is also the natural pt-BR user-facing word ("conta").

## Decision

**Rename the Better Auth model, not the domain one.** Better Auth supports custom
model/table names via config:

```ts
betterAuth({
  account: { modelName: "authAccount" }, // Prisma model AuthAccount → table auth_account
});
```

The financial entity keeps the name `Account`. Better Auth's internal model
becomes `AuthAccount`.

## Alternatives considered

- **Rename the financial entity to `Wallet`.** Rejected: churns everything already
  written (`from_account_id` → `from_wallet_id`, `account.ts`, [[accounts]], the
  balance formula) and diverges from the natural user-facing term "conta".
- **Name the financial entity `FinancialAccount`.** Rejected: verbose and ugly in
  code (`financialAccountId` everywhere).

## Consequences

- Zero churn in domain docs, Zod schemas, and field names — they were written
  assuming `Account`, and stay valid.
- Better Auth's table is remapped to `auth_account`; the rename must be applied in
  the auth config **and** reflected in a Prisma migration. Cheap now (the scaffold
  migration has no production data), expensive later.
- The Better Auth model is internal plumbing the user never sees, so renaming the
  thing nobody looks at is the low-cost move.

Affects: [[accounts]] · [[ARCHITECTURE]]
Parent: [[decisions-index]]
