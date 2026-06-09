---
type: api
status: current
updated: 2026-06-09
summary: Financial accounts resource — user-scoped create and list.
tags: [api, accounts]
---

# API — Accounts

## Overview

Financial accounts scoped to the authenticated user. Feature 0 ships the minimal
slice (create + list). Full schema (initial balance, currency, archive) lands in
Feature 1.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/accounts` | List accounts for the session user, newest first |
| `POST` | `/accounts` | Create an account for the session user |

Request/response shapes: `CreateAccountSchema` and `AccountSchema` in
`packages/shared/src/account.ts`.

## Rules

- **`userId` comes from the session only** — never from the request body or query
  string. This is the project's #1 data-isolation invariant.
- Both endpoints return `401` if there is no valid session cookie.
- `POST` validates the body against `CreateAccountSchema`; name is trimmed,
  1–100 chars.
- `GET` orders by `createdAt desc`.

## Decisions

Minimal model decided in [[0002-auth-account-rename]] (naming) and the walking
skeleton plan. Full thickening tracked in Feature 1.

Parent: [[api-index]]
