---
type: decision
status: accepted
updated: 2026-06-10
summary: Archived accounts may be permanently hard-deleted, but only when not entangled by transfers — relaxing "archive, never delete" without risking balance drift.
tags: [decision, adr, accounts, delete]
---

# 0004 — Conditional hard-delete of archived accounts

## Status

accepted

## Context

CashMind's standing invariant is **"archive, never delete"** for domain records
(stated in `CLAUDE.md` and [[accounts]]): destructive loss is avoided by setting
`archived_at`. But an archived list accumulates accounts a user genuinely wants
*gone* (created by mistake, a throwaway that never got used). [[accounts-management]]
gave accounts a reversible archived state; the open question is whether — and how
safely — an archived account can be permanently removed.

The hard constraint is the balance model: balances are **computed on read** from
transaction rows ([[accounts]]), and a transfer is a **single row touching two
accounts** ([[0001-transfer-single-row]]). So deleting rows can change a
*surviving* account's balance — which is exactly the drift the computed-on-read
design exists to prevent.

## Decision

Relax the invariant to allow a permanent hard-delete, but only when **both** hold:

1. the account is in the **archived** state (an active account must be archived
   first — a deliberate two-step), and
2. the account has **no transfers to a surviving account** (archived *or* active).

When both hold, the delete **cascades the account's own self-contained
expenses/incomes** — they only ever affected the account being removed, so wiping
them harms no one else. The API exposes `DELETE /accounts/:id`, gated by the guard
ladder (active → `409`; entangled → a distinct `409`; foreign/missing id → `404`;
success → `204`). The full ladder is the contract in [[accounts-api]]. The UI puts
the affordance behind a destructive confirm modal and shows it only on qualifying
archived rows. See [[delete-account]].

## Alternatives considered

- **Cascade everything** — delete the account and *all* its transactions,
  transfers included. **Rejected:** deleting a transfer row silently changes the
  counterpart account's computed balance with no audit trail — the precise drift
  the computed-on-read model exists to prevent.
- **Block on any transaction** — refuse the delete if the account has *any*
  transaction at all. **Rejected:** too restrictive. Expenses/incomes are
  self-contained and harmless to delete; only transfers entangle. Blocking on them
  would make delete near-useless for any account with history.
- **Relax the guard when the transfer counterpart is also archived.**
  **Rejected:** archive is reversible (`/unarchive`), so an archived counterpart is
  still a *surviving* account. Deleting the transfer would corrupt a balance that
  resurfaces the moment that counterpart is unarchived.

## Consequences

- The invariant becomes: **"archive, never delete — except a non-entangled
  archived account may be hard-deleted."** `CLAUDE.md` and [[accounts]] get this
  wording (referencing this ADR) **at build time**, in the same commit as the code.
- **It's a narrow escape hatch, not a general "remove account."** Once
  transactions exist (Feature 3), any account that ever participated in one
  transfer is permanently undeletable — it can only stay archived. Acceptable:
  archive already hides it and keeps every other balance correct.
- A deleted account's self-contained expenses/incomes **vanish from historical
  reporting** (the Feature 5 dashboard). Consistent with "permanently lost," but a
  real loss of history.
- The transfer-entanglement guard and the `onDelete: Cascade` FK **cannot be built
  until the `Transaction` model exists** — Feature 3 ([[transactions]]) must extend
  the delete route accordingly. Cross-referenced from the Transactions roadmap
  entry so it isn't lost.
- A future **cluster delete** (remove an archived account *together with* its
  archived transfer-counterparts, atomically) is **parked as phase-2** — it would
  safely dissolve an entire entangled cluster without corrupting survivors.

Parent: [[decisions-index]]
