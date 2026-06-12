---
type: adr
status: accepted
date: 2026-06-12
summary: Adopt a feature-folder architecture for apps/web — thin routes, pages as containers, feature modules for UI/logic/data.
tags: [frontend, architecture, react, tanstack-router, shadcn]
---

# 0006 — Frontend feature-folder architecture

## Context

`apps/web` grew organically: route files contained full page logic, `AccountRow`
lived inside the accounts route file, `AccountForm` lived in `features/accounts/`
but bypassed React Query via raw `fetch`, and error-response parsing was
copy-pasted four times. The codebase had no agreed structure for the next feature
to follow.

## Decision

Adopt a feature-folder layout as the canonical frontend structure. Full spec in
[[conventions]] (Frontend architecture section). Key choices:

**Route files own only routing.** TanStack Router is file-based; it owns the
`routes/` directory and auto-generates `routeTree.gen.ts`. Embedding page logic in
route files conflates two concerns and makes components untestable in isolation.
Route files now do exactly one thing: `createFileRoute(...).component = <Page>`.

**`features/<name>/`** encapsulates everything about one domain slice: components,
hooks, services (fetchers), local Zod schema, and types, exposed via a single
`index.ts` barrel. This is the unit future developers add when shipping a new feature.

**All server writes go through `useMutation`.** Raw `fetch` in components was the
source of duplicated invalidation logic and unhandled error state. `useMutation` +
centralized `onSuccess: invalidateQueries` eliminates the duplication. Error state
is surfaced via `mutation.error`, not scattered `try/catch`.

**Shared transport in `services/api.ts`.** `apiFetch` + `extractErrorMessage` collapse
the four identical error-parsing blocks into one place. Every fetcher in a feature's
`services/<name>Api.ts` calls `apiFetch`; no feature handles HTTP-level concerns.

**Two shadcn exceptions** are intentional and must never be changed to match our
own conventions:

1. `components/ui/` stays flat — `components.json` hardcodes `ui → @/components/ui`.
   The shadcn CLI regenerates files there; our barrel pattern would break it.
2. `lib/utils.ts` is the `cn` helper — shadcn hardcodes `@/lib/utils` in every
   generated component. Moving it breaks shadcn updates.

**Placeholder directories** (`store/`, `utils/`) are created with `.gitkeep` now
rather than added ad-hoc later. This documents intent: `store/` is for global
Zustand stores, `utils/` is for pure framework-agnostic helpers.

## Consequences

- Every new feature follows the `features/<name>/` template. `features/accounts/`
  is the canonical example.
- Components are props-driven and independently testable.
- Money logic (the `amountReais` Zod schema, `toMinor`/`toMajor` wiring) is
  isolated in `accountForm.schema.ts` and unit-tested as a regression guard.
- `routes/` remains TanStack Router's domain — do not add business logic there.
- The two shadcn exceptions are load-bearing; removing them breaks the CLI.

Related: [[conventions]], [[0005-design-token-system]]
Parent: [[decisions-index]]
