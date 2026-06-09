---
type: decision
status: accepted
updated: 2026-06-09
summary: Model a transfer as one transaction row with from/to accounts, not two linked rows.
tags: [decision, adr, transactions, accounts]
---

# ADR 0001 — Transfers as a single row

## Status

accepted

## Context

A transfer moves money between two accounts. It can be modeled as (A) one row
with `from_account_id` + `to_account_id`, or (B) two linked rows (a debit and a
credit) joined by a `transfer_group_id`, double-entry style.

## Decision

Model a transfer as a **single row** with `type = transfer`, `from_account_id`,
and `to_account_id`. `category_id` is null for transfers.

## Alternatives considered

- **Two linked rows (double-entry).** Makes balance a uniform `SUM(amount)` with
  no branch, and is "accounting-correct". Rejected: one user action becomes two
  rows, so the transaction list must de-duplicate and edits/deletes must touch
  both sides — overkill for personal finance.

## Consequences

- The transaction list maps 1:1 to user actions (easy to read/edit/debug).
- The balance calculation needs a branch for transfers (see [[accounts]]).
- Coherence is enforced in Zod + a DB check: `transfer` needs both accounts and
  they must differ; `expense` only `from`; `income` only `to`.

Affects: [[transactions]] · [[accounts]]
Parent: [[decisions-index]]
