---
type: log
status: current
updated: 2026-06-10
summary: Better Auth tables (user, session, auth_account, verification) still use TIMESTAMP(3) instead of TIMESTAMPTZ — tracked for a dedicated cleanup pass.
tags: [log, gotcha, dates, auth, prisma]
---

# 0004 — Better Auth tables still on TIMESTAMP(3), not TIMESTAMPTZ

## Symptom

The CLAUDE.md invariant states `created_at` / `updated_at` must be `timestamptz`
in UTC. The domain `Account` table was corrected in Feature 1 (migration
`20260610205445_account_timestamps_timestamptz`), but the four Better Auth-managed
tables still store timestamps as `TIMESTAMP(3)` (no timezone):

- `user` — `createdAt`, `updatedAt`
- `session` — `createdAt`, `updatedAt`, `expiresAt`
- `auth_account` — `createdAt`, `updatedAt`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`
- `verification` — `createdAt`, `updatedAt`, `expiresAt`

## Cause

Better Auth's Prisma adapter scaffold generates its own schema fragment. The
walking-skeleton migration (`20260609053602_init`) created these tables as
`TIMESTAMP(3)`. Feature 1 intentionally left them untouched: modifying Better
Auth-managed models risks divergence from the adapter's expectations and could
break authentication on library upgrades.

## Fix

Migrate these columns to `TIMESTAMPTZ` in a dedicated pass — ideally aligned with
a Better Auth version upgrade or after verifying the adapter is tolerant of the
type change. Add `@db.Timestamptz` to the four models in `schema.prisma` and
generate a corrective migration. Scope: **authentication tables only**; no domain
logic is affected.

Do NOT fold this into a feature migration — it is an infrastructure-only change.

## Where

`apps/api/prisma/schema.prisma` — `User`, `Session`, `AuthAccount`, `Verification`
models. Migration history in `apps/api/prisma/migrations/`.

Parent: [[log-index]]
