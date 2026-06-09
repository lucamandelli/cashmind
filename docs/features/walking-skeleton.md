---
type: feature
status: current
updated: 2026-06-09
summary: Feature 0 — a thin vertical slice (seeded sign-in → create/list one Account scoped by session user_id) that proves the whole stack wires together.
tags: [feature, walking-skeleton, auth, accounts]
---

# Walking skeleton

## What it is

The thinnest slice that crosses **every** layer once. The goal is to prove the
stack fits together — Prisma → shared Zod → Fastify (real session) → `httpOnly`
cookie → TanStack Query → guarded UI — not to ship account management. Item 0 of
[[features-index]].

## Flow

1. **Seed** (once, server-side): a script creates the single owner via **direct
   DB insert** using Better Auth's own password hasher. `disableSignUp` is a
   total lock — it blocks the sign-up handler itself, so `auth.api.signUpEmail`
   is also rejected server-side. See [[0003-single-user-signup-lock]].
2. **Sign in**: `/login` form (email+password) → Better Auth React client →
   `POST /api/auth/sign-in/email` → server sets the `httpOnly` session cookie.
3. **Guard**: `/accounts` `beforeLoad` checks the session; no session → redirect
   to `/login`.
4. **Create**: form on `/accounts` → `POST /accounts` → route reads `user_id`
   **from the session** (never from input) → Prisma insert.
5. **List**: `GET /accounts` → Prisma `where userId = session.user_id` →
   TanStack Query renders only this user's rows.
6. **Sign out**: clears the session, bounces back to `/login`.

## Files

Targets created/changed by this slice (planned):

- `apps/api/prisma/schema.prisma` — add financial `Account`; rename Better Auth's
  `Account` → `AuthAccount` ([[0002-auth-account-rename]]) + migration.
- `apps/api/prisma/seed.ts` — idempotent owner seed via direct DB insert (Better Auth's own hasher).
- `apps/api/src/auth.ts` — enable `emailAndPassword`, `disableSignUp: true`.
- `apps/api/src/routes/accounts.ts` — `POST`/`GET /accounts`, session-scoped.
- `packages/shared/src/account.ts` — Zod schemas (source of truth for shape).
- `apps/web/src/lib/auth-client.ts` — Better Auth React client.
- `apps/web/src/routes/login.tsx`, `apps/web/src/routes/accounts.tsx`.

## Rules

- **`user_id` comes from the session, never from input or the route body** — the
  app's #1 invariant. `POST`/`GET /accounts` both filter by `session.user_id`.
- **Public sign-up is locked** (`disableSignUp: true`); only the seeded user
  exists — see [[0003-single-user-signup-lock]].
- The `Account` model is intentionally **minimal** here; the full schema
  (initialBalance, currency, archive) lands in Feature 1 (Accounts thicken).
- The **web layer is functional scaffolding, not finished UI** — Feature 0 is the
  *only* deliberate bare-scaffold exception, because it is the seam, not a
  product. Default shadcn styling, plain-text error/loading states (like the
  existing health page), no polish. **The real UI for this accounts screen is
  built in Feature 1 (Accounts thicken)**, alongside the full schema — each
  product feature (1–5) ships its surface at production quality. Item 6 (PWA) is
  *delivery* (installability), not UI polish.

## Uses

Domain [[accounts]]. Decided in [[0002-auth-account-rename]] and
[[0003-single-user-signup-lock]].

## Gotchas

- **Vite `/api` proxy strips the `/api` prefix** (so `/api/health` → backend
  `/health`). Better Auth defaults to base path `/api/auth`, so its mount and the
  proxy must be reconciled or sign-in 404s. Resolve when wiring auth.
- **`disableSignUp` is total**, not HTTP-only — it blocks the sign-up handler,
  so even `auth.api.signUpEmail` (server-side) is rejected. The seed creates
  the owner via direct DB insert with Better Auth's own password hasher, so
  the hashed password verifies correctly on sign-in.
- **Fastify consumes the body stream** before `toNodeHandler` can read it,
  causing a `400 VALIDATION_ERROR` on sign-in. Fix: use `auth.handler` (Fetch
  API) and build a `Request` from `request.body` (already parsed by Fastify).
  See [[0003-fastify-auth-body-stream]].

Parent: [[features-index]]
