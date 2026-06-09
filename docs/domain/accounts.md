---
type: domain
status: current
updated: 2026-06-09
summary: Accounts/wallets and how the balance is computed (on read, with the transfer branch).
tags: [domain, accounts, balance]
---

# Accounts

## What it is

An account is a place money lives (e.g. Nubank, cash, savings). Every transaction
belongs to an account. Modeled from the schema so we know *where* money is, not
only how much came in/out.

## Invariants

- Balance is **computed on read**, not stored, to avoid a denormalized field
  drifting from the transactions.
- Balance formula for account `X`:

  ```
  balance(X) = initialBalance(X)
             + Σ income.amountMinor      where account_id = X
             - Σ expense.amountMinor     where account_id = X
             - Σ transfer.amountMinor    where from_account_id = X
             + Σ transfer.amountMinor    where to_account_id   = X
  ```

- All amounts are **integer cents** (`amountMinor`).
- Accounts are **archived, never deleted** (`archived_at`).

## Relations

- Holds many transactions — see [[transactions]].
- A `transfer` touches two accounts (from/to) — see [[0001-transfer-single-row]].

## Source of truth

- Prisma model: `Account` (`apps/api/prisma/schema.prisma`)
- Zod schema: `packages/shared/src/account.ts`

Parent: [[domain-index]]
