---
type: feature
status: draft
updated: 2026-06-09
summary: User logs a single expense from the phone in a couple of taps.
tags: [feature, transactions, expense]
---

# Log expense

## What it is

The core daily action: the user records an expense (amount, account, category,
date, note) quickly — designed for a phone, two taps to reach the form.

## Flow

1. User taps "Add" → expense form (React Hook Form + Zod resolver).
2. Form validates against the shared `CreateTransactionSchema`.
3. `POST /transactions` with `type: "expense"` and `from_account_id`.
4. API re-validates with the same schema, persists via Prisma.
5. TanStack Query invalidates the transactions + balances queries → UI updates.

## Files

- Form: `apps/web/src/features/transactions/ExpenseForm.tsx` _(TODO)_
- Endpoint: `apps/api/src/routes/transactions.ts` _(TODO)_
- Shared schema: `packages/shared/src/transaction.ts` _(TODO)_

## Rules

- Amount entered in reais is converted to **integer cents** at the UI edge.
- `category_id` filtered to `kind = expense` categories.
- Date defaults to today (`DATE`, no timezone).

## Uses

- [[transactions]] (API) · [[accounts]] (domain) · [[0001-transfer-single-row]]

## Gotchas

- Don't store the amount as a float anywhere on the way down — cents only.

Parent: [[features-index]]
