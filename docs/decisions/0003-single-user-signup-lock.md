---
type: decision
status: accepted
updated: 2026-06-09
summary: Lock public sign-up in the MVP (single seeded user); opening to family/friends (multi-user) is deferred and will require public sign-up + password reset + email verification.
tags: [decision, adr, auth, scope]
---

# ADR 0003 — Lock public sign-up in the MVP (single-user)

## Status

accepted

## Context

CashMind is **single-user first** (see [[ARCHITECTURE]]): the schema is
multi-user-ready (`user_id` on every row), but the only person using the app at
MVP is the owner. The roadmap's walking skeleton ([[walking-skeleton]], item 0 of
[[features-index]]) explicitly scopes auth to *"one seeded single user,
email+password — no sign-up, reset, or email verification"*.

The owner *intends* to open the app to family and friends later **if it proves
useful**. That future is real but uncommitted, and building it properly is a
large chunk of work (public registration UX, password recovery, email
verification, the email-sending infrastructure they all depend on). Doing it now
would be paying the complexity tax before the pain exists.

## Decision

**Ship the MVP with public registration closed.** Concretely:

- Enable email+password auth with **`disableSignUp: true`** (Better Auth config,
  `apps/api/src/auth.ts`).
- Create the single user **server-side via the seed** using a **direct DB
  insert** with Better Auth's own password hasher — `disableSignUp` is a
  *total* lock (it blocks the sign-up handler itself, not just the public HTTP
  endpoint, so `auth.api.signUpEmail` is also rejected). See [[walking-skeleton]]
  for the seam.
- Ship **no** sign-up, password-reset, or email-verification flows.

The public sign-up endpoint therefore rejects everyone; only the seeded owner
can sign in.

## Alternatives considered

- **Leave public sign-up open from day one.** Rejected: with no registration
  product (and no email verification or rate-limited reset), an open endpoint is
  an unlocked door letting any stranger who finds the API create an account, for
  zero MVP benefit.
- **Build the full multi-user auth surface now.** Rejected: password recovery and
  email verification both need an email-sending pipeline and UX we don't have —
  large, speculative work for a "maybe later" audience. Defer until the app earns
  it.

## Consequences

- **The lock is total, not HTTP-only.** `disableSignUp: true` blocks the sign-up
  *handler*, so even server-side calls via `auth.api.signUpEmail` are rejected.
  The seed creates the owner via direct DB insert with Better Auth's own hasher.
  Reopening starts by flipping `disableSignUp` to `false`, but that alone is
  **not** safe to ship — see below.
- **Going multi-user is a tracked future item, not a free flip.** It requires, at
  minimum: a public sign-up screen, **password recovery**, **email
  verification**, and the **transactional email** infrastructure those need.
  Recorded in the Scope table of [[ARCHITECTURE]] (Future row).
- Data isolation already holds regardless: every query filters by the session's
  `user_id` (project invariant), so additional users are safe to add later
  without a data-model migration.

Affects: [[ARCHITECTURE]] · [[walking-skeleton]]
Parent: [[decisions-index]]
