---
type: api
status: current
updated: 2026-06-11
summary: Financial accounts resource — user-scoped CRUD with archive/unarchive state transitions and conditional hard-delete.
tags: [api, accounts]
---

# API — Accounts

## Overview

Financial accounts scoped to the authenticated user. Feature 1 ships the full
resource: create, list (with archived filter), edit, and archive/unarchive as
explicit state transitions. Feature 1b adds a conditional hard-delete for archived
accounts. Every `:id` operation is scoped to the session user — a row belonging to
another user returns `404`, never leaks.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/accounts` | List active accounts for the session user, newest first |
| `GET` | `/accounts?includeArchived=true` | List all accounts including archived |
| `POST` | `/accounts` | Create an account for the session user |
| `PATCH` | `/accounts/:id` | Edit user-editable fields (name, initialBalance, currency) |
| `POST` | `/accounts/:id/archive` | Archive the account (sets `archivedAt`); idempotent |
| `POST` | `/accounts/:id/unarchive` | Restore an archived account (clears `archivedAt`); idempotent |
| `DELETE` | `/accounts/:id` | Permanently hard-delete an archived account; `204` on success |

Request/response shapes: `CreateAccountSchema`, `UpdateAccountSchema`, and
`AccountSchema` in `packages/shared/src/account.ts` (source of truth — field
rules and validation live there, not here).

## Rules

- **`userId` comes from the session only** — never from the request body or query
  string. This is the project's #1 data-isolation invariant.
- Every endpoint returns `401` if there is no valid session cookie.
- **Foreign-id isolation:** `:id` operations filter by `userId`; a row that
  belongs to another user returns `404` — it is not found, never leaked.
- **Archive is a state transition, not a field edit.** `PATCH` never writes
  `archivedAt`. The dedicated `/archive` and `/unarchive` endpoints own that
  field — this keeps intent explicit and the guard trivially enforceable.
- **`PATCH` requires at least one field.** An empty body `{}` returns `400`
  (enforced by a `.refine()` on `UpdateAccountSchema`).
- `GET /accounts` returns active accounts (`archivedAt IS NULL`) by default;
  pass `?includeArchived=true` to include archived rows.
- `initialBalance` may be negative (credit-card / debt starting balance is
  legitimate — see [[accounts]] for the balance formula).
- **`DELETE /accounts/:id` guard ladder** (read-first, so each code is
  distinguishable): row not found or belongs to another user → `404`; account is
  active (`archivedAt IS NULL`) → `409` ("account is not archived"); account is
  archived and non-entangled → `204` (row hard-deleted, no body). The
  transfer-entanglement guard (a second distinct `409`) is **deferred to Feature 3**
  — until the `Transaction` model exists every archived account qualifies for
  deletion. Full rationale in [[0004-conditional-account-delete]].

## Decisions

Naming decided in [[0002-auth-account-rename]]. Archive-as-transition rationale
in [[accounts-management]] (Rules section). Walking skeleton origin in
[[walking-skeleton]]. Conditional hard-delete design and guard ladder rationale in
[[0004-conditional-account-delete]].

Parent: [[api-index]]
