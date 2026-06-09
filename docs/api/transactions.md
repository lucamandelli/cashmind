---
type: api
status: draft
updated: 2026-06-09
summary: Transactions resource — income/expense/transfer endpoints and coherence rules.
tags: [api, transactions]
---

# Transactions API

## Overview

CRUD for transactions. A transaction is `income`, `expense`, or `transfer`.
All endpoints are scoped to the authenticated user — `user_id` is taken from the
session, never from the request body.

## Endpoints

> Request/response shapes: see `packages/shared/src/transaction.ts`. Do not copy
> field lists here — point to the schema.

- `POST /transactions` — create one. Body validated by `CreateTransactionSchema`.
- `GET /transactions` — list, filtered by month/account/category/type via typed
  search params (shared schema with the dashboard filters).
- `PATCH /transactions/:id` — update.
- `DELETE /transactions/:id` — delete.

## Rules

- **Coherence by type** (enforced in the Zod schema + a DB check):
  - `expense` → only `from_account_id`
  - `income` → only `to_account_id`
  - `transfer` → both, and the two accounts must differ
- `category_id` is **nullable** — transfers have no category.
- Amounts are **integer cents** (`amountMinor`).
- Transaction `date` is a `DATE` (no time/zone) — see [[0001-date-day-shift]].

## Decisions

- Transfer modeled as a single row with from/to — [[0001-transfer-single-row]]

Parent: [[api-index]] · Used by [[log-expense]]
