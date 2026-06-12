---
type: overview
status: current
updated: 2026-06-12
summary: Sub-hub for Architecture Decision Records (the "why").
tags: [decisions, adr, moc]
---

# Decisions (ADRs)

One note per decision, capturing the rationale so it isn't lost. [[ARCHITECTURE]]
is the seed for the first batch; promote each significant choice into its own ADR
over time.

## ADRs

- [[0001-transfer-single-row]] — transfers modeled as a single row
- [[0002-auth-account-rename]] — Better Auth's `Account` renamed to `AuthAccount`
- [[0003-single-user-signup-lock]] — public sign-up locked in the MVP (single-user)
- [[0004-conditional-account-delete]] — archived accounts may be hard-deleted, but only when not entangled by transfers
- [[0005-design-token-system]] — adopt the design-system tokens as canonical; alias shadcn's names onto them (Tailwind v4 `@theme inline`, `.dark` class)
- [[0006-frontend-feature-folder-architecture]] — thin routes → pages as containers → feature folders for UI/logic/data; all writes via `useMutation`; shared transport in `services/api.ts`
- [[0007-money-column-bigint]] — store money columns as BIGINT; bound at JS MAX_SAFE_INTEGER so bigint↔number conversion is always precision-exact

Parent: [[00-overview]]
