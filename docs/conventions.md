---
type: conventions
status: current
updated: 2026-06-09
summary: How we build CashMind — testing strategy, tooling, and code style.
tags: [conventions]
---

# Conventions

How we build. These are stable, continuous rules (distinct from one-off ADRs in
[[decisions-index]]).

## Testing strategy

- **Vitest** for unit + integration; **Playwright** for the few sacred E2E flows.
- **TDD on money/balance logic** — the highest-value, lowest-cost place to test:
  `toMinor`/`toMajor`, formatting, the balance calculation (incl. the transfer
  branch), rounding on division, dashboard sums.
- **Integration tests** for critical API routes against a real Postgres via
  **Testcontainers** (coherence rules, transfer touches both accounts, auth gate).
- **Few React component tests** — only components with real logic.
- **E2E**: "log in → log expense → balance updates" and "transfer → both accounts
  change". Keep the set tiny.
- Don't document individual tests in Markdown — the test files are the living spec.

## Tooling

- **Biome** for lint + format (one tool).
- **TypeScript `strict: true`** from day one.
- **Node 22 LTS**, pinned via `.nvmrc`.
- Env validated with a **Zod** schema at boot; `.env` gitignored, `.env.example` committed.

## Language

**English only** in everything committed to the repo: identifiers, comments,
string literals, and all `docs/` notes. Conversations with users may be in any
language; the repo is English.

## Code style

- Shared types/schemas live in `packages/shared` (Zod) — infer, don't redefine.
- Money is integer cents everywhere; format only at the UI edge.
- REST endpoints validate input with the shared Zod schemas.

## Commits

We follow **Conventional Commits**:

```
type(scope): subject
```

- **types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`
- **scope** (optional, from the monorepo): `web`, `api`, `shared`, `docs`, `ops`
- **subject**: imperative, lowercase, no trailing period, in English

Examples: `feat(api): add transactions endpoint` ·
`fix(web): correct balance rounding` · `docs(domain): document balance formula`.

- Code and its `docs/` note change in the **same commit** (see [[README]]).
- No Commitlint/Husky enforcement yet — add it only if the convention slips.

Parent: [[00-overview]]
