# How this documentation works

This `docs/` folder is CashMind's **living documentation** — a second brain that
is **optimized to be read by Claude Code** and doubles as an **Obsidian vault**
for the human to navigate visually as a graph.

> Claude does not see Obsidian's graph view — it reads Markdown files and follows
> `[[wikilinks]]`. The graph is a side effect of good linking, for the human.

## Principles

- **Optimize for the machine.** Predictable structure beats pretty prose.
- **Document the WHY and the WHERE; let the code be the WHAT.** Never hand-copy
  field lists, validation rules, DB columns, or test assertions — those live in
  Zod (`packages/shared`), Prisma, and test files. Point to them instead.
- **Docs travel with code.** Every note lives in the repo and is updated in the
  **same commit** as the code change it describes.
- **A node type earns its existence** when it has (1) a distinct moment of use,
  (2) enough content to navigate on its own, and (3) drift you can control.

## The 8 note types

| Type | Folder | One note per… | Holds |
|---|---|---|---|
| Overview | `00-overview.md` | (single) | Central MOC / graph hub |
| Domain | `domain/` | entity / concept | Business entities, invariants, balance rules |
| API | `api/` | **resource** (not endpoint) | REST resources: endpoints summary, rules |
| Feature | `features/` | feature | End-to-end product flows (front + back) |
| Decision | `decisions/` | decision | ADRs — the rationale behind a choice |
| Ops | `ops/` | topic | Infra, deploy, Nginx/Certbot, backup, runbook |
| Conventions | `conventions.md` | (single) | How we build: testing, tooling, code style |
| Log | `log/` | bug / gotcha | Known bugs and resolved traps |

## Linking convention (builds the graph + "what touches this")

- Link with `[[note-name]]` and **label the relation in prose**:
  `Uses [[transactions]] and [[accounts]]. Decided in [[0001-transfer-single-row]].`
- **Consistent direction** (this is what makes backlinks useful):
  - Feature → the API / Domain notes it uses
  - Any note → the ADR that justifies its decisions
  - Log/Bug → the feature / API where it lives
- Backlinks then answer "what uses this?" automatically — no manual upkeep.
- **MOC pattern:** `00-overview.md` is the hub → `<area>-index.md` are sub-hubs
  (one per folder, unique basename so wikilinks don't collide) → leaf notes.
  This produces the central-node graph.

## Frontmatter (every note)

```yaml
---
type: api            # one of the 8 types
status: current      # current | draft | deprecated
updated: 2026-06-09  # bump on every edit
summary: One line. This is what Claude reads to decide whether to open the note.
tags: [api, transactions]
---
```

## Naming

Stable, kebab-case, path-predictable: `docs/api/transactions.md`,
`docs/features/log-expense.md`, `docs/decisions/0001-transfer-single-row.md`.
ADRs and log entries are numbered (`NNNN-slug.md`).

## Templates per type

Use the same H2 headings, in order, so information is always in a predictable
place. The `/document` skill applies these automatically.

**Feature** (`features/*.md`)

```markdown
## What it is     — 1–2 sentences, product view
## Flow           — step by step, front → API → DB
## Files          — map: point to the real files
## Rules          — non-obvious business rules
## Uses           — [[api-x]], [[domain-y]], [[adr-z]]
## Gotchas
```

**API per resource** (`api/*.md`)

```markdown
## Overview       — what this resource does
## Endpoints      — method + path + one line each (shape → point to Zod)
## Rules          — business rules
## Decisions      — [[adr-...]]
```

**Domain** (`domain/*.md`)

```markdown
## What it is
## Invariants     — e.g. balance formula, coherence rules
## Relations      — to other entities
## Source of truth — Prisma model X / Zod schema Y
```

**Decision / ADR** (`decisions/NNNN-*.md`)

```markdown
## Status         — proposed | accepted | superseded by [[adr-...]]
## Context
## Decision
## Alternatives considered
## Consequences
```

**Log / Bug** (`log/NNNN-*.md`)

```markdown
## Symptom
## Cause
## Fix
## Where          — [[affected feature / api]]
```

**Ops** = runbook by steps. **Conventions** = rules by topic.
**Overview and `<area>-index.md`** carry no template — they are pure link hubs.
