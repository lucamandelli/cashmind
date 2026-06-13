---
type: conventions
status: current
updated: 2026-06-12
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

Dark mode resolves when `.dark` is on `<html>`. The **toggle ships on the auth
screens** (Welcome + Login) via `useTheme` (`hooks/useTheme.ts`) and
`ThemeToggle` (`components/ThemeToggle/`). Other screens adopt them at their own
rebrand. See [[0009-theme-toggle]] for the persistence and no-flash script
decisions.

See [[0005-design-token-system]] for the token-system rationale, and `apps/web/src/index.css`
for the actual token definitions. Do not copy token values or tables into docs —
a copied fact is a future lie.

## Frontend architecture

`apps/web` follows a feature-folder structure. The canonical example is
`features/accounts/`. See [[0006-frontend-feature-folder-architecture]] for the
decision rationale and the two intentional shadcn exceptions.

**Layers and their contracts:**

- **`routes/`** — routing only. TanStack Router owns this directory and
  auto-generates `routeTree.gen.ts`. Every route file does exactly one thing:
  `createFileRoute(...).component = <Page>`. No logic, no JSX beyond the import.
- **`pages/`** — containers. A page composes one feature's hooks and components
  together, manages top-level local state (open/editing/showArchived), and wires
  handlers. Pages are not reused — one page per route.
- **`features/<name>/`** — feature modules, each owning:
  - `components/` — props-driven, presentational. No direct data fetching.
  - `hooks/` — React Query queries + mutations. All server writes use `useMutation`;
    no raw `fetch` in components.
  - `services/<name>Api.ts` — pure async fetchers over `services/api.ts`.
  - `<name>.schema.ts` — Zod schema local to the feature's form (alongside `hooks/`).
  - `types/index.ts` — feature-local types.
  - `index.ts` — public API barrel; only this barrel is imported from outside the feature.
- **`layouts/`** — shell components (`AuthLayout`, `AuthenticatedLayout`). Imported
  by route files or pages; never import downward into features.
- **`services/api.ts`** — shared transport: `apiFetch` (adds `credentials`, JSON
  headers when a body is present, throws on non-ok) + `extractErrorMessage`.
- **`config/queryClient.ts`** — the singleton `QueryClient`; imported by `main.tsx`
  and test wrappers.
- **`hooks/`**, **`utils/`**, **`store/`** — global dirs for cross-feature concerns.
  `store/` and `utils/` are placeholder dirs (`store/.gitkeep`, `utils/.gitkeep`)
  intentionally reserved for Zustand stores and pure helpers when needed.

**Two shadcn exceptions (intentional, documented):**

1. `components/ui/` stays flat — shadcn CLI manages it; `components.json` hardcodes
   the path.
2. `lib/utils.ts` is the `cn` helper — shadcn requires `@/lib/utils`; never move it.

Our own components follow the `components/<Name>/Name.tsx` + barrel pattern.

Parent: [[00-overview]]
