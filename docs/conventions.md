---
type: conventions
status: current
updated: 2026-06-11
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
- **`apps/web` uses `noEmit: true`** — Vite owns compilation; `tsc -b` is type-check only. Without this, `tsc` emits `.js` / `.js.map` files alongside sources and breaks TanStack Router's route generator (conflicting `.tsx` + `.js` for the same route).

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

## Frontend design tokens

Tokens live in `apps/web/src/index.css`. Fonts load from Google Fonts via
`apps/web/index.html`.

New frontend code writes **design roles** — `bg-surface`, `text-positive`,
`text-text-2`, `bg-surface-3` — as the primary styling vocabulary.
shadcn names (`bg-primary`, `bg-background`, `text-foreground`) remain valid
because they are aliased onto the design roles; existing components already
using them continue to work.

**JetBrains Mono** (`font-mono`) is **reserved for monetary amounts** — tabular
figures that align in columns. This is a direct fit for the integer-cents money
invariant. Never use it for decorative or non-numeric text.

Dark mode resolves when the `.dark` class is on a parent element; both themes
are wired (use `dark:` utilities freely), but **no toggle UI ships yet** — that
is a later UI task.

See [[0005-design-token-system]] for the decision rationale, and `apps/web/src/index.css`
for the actual token definitions. Do not copy token values or tables into docs —
a copied fact is a future lie.

Parent: [[00-overview]]
