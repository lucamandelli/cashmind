---
type: decision
status: accepted
updated: 2026-06-12
summary: Store money columns as BIGINT (PostgreSQL INT8), bounded at JS MAX_SAFE_INTEGER on the app side so the bigint↔number boundary conversion is always precision-exact.
tags: [decision, adr, money, database, bigint]
---

# 0007 — Money columns as BIGINT, bounded at JS safe integer

## Status

accepted

## Context

`Account.initialBalance` was a Prisma `Int` (PostgreSQL INT4, max 2,147,483,647).
Creating an account with a balance of 12,000,000,000 cents (R$ 120M) caused a
Prisma `ConversionError` at the DB write, surfacing as an unhandled 500 to the
client. INT4 caps at R$ 21,474,836.47 — an arbitrary and undocumented ceiling that
is plainly too small for money.

A secondary bug: `POST /accounts` called `CreateAccountSchema.parse()` without a
try/catch, so even ordinary Zod validation failures returned 500 rather than 400.

## Decision

**Migrate money columns from INT4 to BIGINT (INT8).** `INT4 ⊂ BIGINT`, so
existing rows migrate losslessly via `ALTER COLUMN ... SET DATA TYPE BIGINT`.

**Keep the app-side type as `number`.** The `amountMinor: number` invariant
(from `CLAUDE.md`) remains. Only the Prisma boundary deals in `bigint`:
write `BigInt(value)` going in, `Number(dbValue)` coming out.

**Bound inputs at `Number.MAX_SAFE_INTEGER`** (≈ R$ 90 trillion) via
`AmountMinorSchema` in `packages/shared/src/money.ts` (source of truth per the
Zod-schema invariant). This guarantees that `Number()` at the read boundary is
always precision-exact — no silent truncation.

**Guard `POST /accounts` with try/catch on parse** (mirrors the existing PATCH
pattern) so validation failures return `400` instead of `500`.

## Alternatives considered

- **Cap at a smaller "reasonable" business limit** (e.g. R$ 1 billion). Rejected:
  arbitrary business caps belong in product rules, not the storage layer. The DB
  should hold whatever a safe JS number can represent; product UX can validate
  separately if needed.
- **Store money as `Decimal` / `Numeric`.** Would allow arbitrary precision but
  complicates the Prisma boundary (no JS native type). BIGINT + JS-safe-integer
  ceiling is sufficient for the foreseeable scale (~R$ 90 trillion).
- **Leave INT4 and add a Zod max at 2,147,483,647.** Rejected: the cap is an
  arbitrary platform artifact, not a real money limit. Every future money column
  would carry the same silent ceiling.

## Consequences

- `initialBalance` is now stored as BIGINT in PostgreSQL. Future money columns
  (`Transaction.amountMinor`) should follow the same pattern.
- `AccountRow.initialBalance` in `apps/api/src/routes/accounts.ts` is typed
  `bigint`; `serialize()` converts to `number` via `Number()`.
- `AmountMinorSchema` (in `packages/shared`) is the single validation fence for
  all money amounts — it enforces integer + `[MIN_AMOUNT_MINOR, MAX_AMOUNT_MINOR]`.
  The schema is the source of truth; do not copy the bounds to other files.
- The frontend form schema (`accountForm.schema.ts`) adds a `.refine` that checks
  the converted minor value is within the same bounds — giving the user an inline
  error before a round-trip.
- `POST /accounts` now returns `400` on invalid input (matching `PATCH`).

Related: [[accounts]], [[accounts-api]]
Parent: [[decisions-index]]
