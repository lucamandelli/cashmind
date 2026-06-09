---
type: overview
status: current
updated: 2026-06-09
summary: Sub-hub for domain entities and business rules.
tags: [domain, moc]
---

# Domain

Business entities, their invariants, and the rules that govern them. Source of
truth for shapes is the Prisma schema + Zod schemas in `packages/shared`; these
notes hold the rules and relations the code can't express.

## Entities

- [[accounts]] — accounts/wallets and the balance calculation
- _transactions — TODO_
- _categories — TODO_

Parent: [[00-overview]]
