---
type: log
status: current
updated: 2026-06-09
summary: Better Auth creates an "account" table (credentials/providers) that collides with the domain "Account" (financial account/wallet).
tags: [log, auth, domain, prisma]
---

# 0002 — Name collision: `Account` in Better Auth vs. financial domain

## Symptom

When modelling the domain in the MVP phase, a table `account` already exists,
created by the Better Auth scaffold. Adding a Prisma model named `Account` for
the financial account/wallet concept causes a name collision in the schema.

## Cause

Better Auth requires an `Account` model in its Prisma adapter to store
authentication credentials (OAuth provider, access tokens, password hash, etc.).
The CashMind financial domain also has an "Account" concept (bank account,
wallet, etc.) — two distinct contexts, same name.

## Fix

In the domain phase (MVP), **rename the Prisma model for the financial account**
to avoid the collision. Validated options:

- `Wallet` — simple, unambiguous
- `FinancialAccount` — explicit, more verbose

Use `@@map("financial_account")` (or similar) for the database table, keeping
the table name clear regardless of the Prisma model name.

The Better Auth table (`account`) stays untouched.

## Where

Affects [[domain-index]] (entity naming decision) and [[decisions-index]]
(warrants an ADR on the name choice in the MVP phase). Also relevant for anyone
working on [[accounts]] — the domain note must record the final name chosen.
