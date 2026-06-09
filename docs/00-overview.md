---
type: overview
status: current
updated: 2026-06-09
summary: Central hub of the CashMind second brain — links out to every area.
tags: [overview, moc]
---

# CashMind — Overview

CashMind tracks personal spending and income. Single-user first, multi-user-ready
schema. Mobile-first web app (responsive PWA), TypeScript end-to-end
(React + Vite • Fastify • Prisma • PostgreSQL). Full rationale in [[ARCHITECTURE]].

This note is the **central hub** of the documentation graph. Each area below has
its own sub-hub (`index.md`) linking to leaf notes.

## Map of content

- **Domain** → [[domain-index]] — entities, balance rules, invariants
- **API** → [[api-index]] — REST resources and their rules
- **Features** → [[features-index]] — end-to-end product flows
- **Decisions** → [[decisions-index]] — ADRs (the "why")
- **Ops** → [[ops-index]] — infra, deploy, backup, runbook
- **Conventions** → [[conventions]] — how we build (testing, tooling, style)
- **Log** → [[log-index]] — known bugs and gotchas

## How to use this vault

How the documentation system itself works (types, links, templates, frontmatter):
see `docs/README.md`. Two rules: read the relevant note before changing an area,
update it in the same commit afterwards.
