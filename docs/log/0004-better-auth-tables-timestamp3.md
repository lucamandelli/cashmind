---
type: log
status: current
updated: 2026-06-10
summary: Better Auth tables (user, session, auth_account, verification) use TIMESTAMP(3) by design — they follow the library's schema and must NOT be migrated to TIMESTAMPTZ.
tags: [log, gotcha, dates, auth, prisma]
---

# 0004 — Better Auth tables stay on TIMESTAMP(3) by design

## Symptom

The `timestamptz` invariant (`created_at` / `updated_at` are `timestamptz` in UTC)
governs **our domain tables**. The four Better Auth-managed tables instead store
timestamps as `TIMESTAMP(3)` (no timezone):

- `user` — `createdAt`, `updatedAt`
- `session` — `createdAt`, `updatedAt`, `expiresAt`
- `auth_account` — `createdAt`, `updatedAt`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`
- `verification` — `createdAt`, `updatedAt`, `expiresAt`

This looks like a violation of the invariant. It is not — it is intentional.

## Cause

Better Auth's Prisma adapter owns the schema for these models; the
walking-skeleton migration (`20260609053602_init`) created them as the adapter
expects, i.e. `TIMESTAMP(3)`. Our `timestamptz` rule is a **domain-table**
convention, not something to force onto a library's own tables.

## Resolution — leave them alone (do NOT migrate)

**Do not** add `@db.Timestamptz` to `User` / `Session` / `AuthAccount` /
`Verification`, and do not write a migration to convert these columns. Changing a
library-managed schema risks diverging from the adapter's expectations and could
break authentication on a Better Auth upgrade — for a column type that buys us
nothing (these are auth bookkeeping rows, not money or transaction dates).

The invariant is scoped accordingly in `CLAUDE.md` and [[ARCHITECTURE]]:
`timestamptz` applies to our domain tables; Better Auth tables follow the lib.
Our own `account` table was correctly brought to `timestamptz` in Feature 1
(migration `20260610205445_account_timestamps_timestamptz`).

## Where

`apps/api/prisma/schema.prisma` — `User`, `Session`, `AuthAccount`, `Verification`
models (Better Auth-managed; leave as-is).

Parent: [[log-index]]
</content>
</invoke>
