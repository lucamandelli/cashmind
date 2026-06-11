---
type: decision
status: accepted
updated: 2026-06-11
summary: Adopt the CashMind design-system color/token set as the canonical styling vocabulary in apps/web — design roles are source of truth, shadcn's variable names are aliased onto them via Tailwind v4 @theme inline, dark mode keyed off the .dark class, Plus Jakarta Sans + JetBrains Mono (mono reserved for amounts).
tags: [decision, adr, frontend, design-system, tailwind, shadcn]
---

# 0005 — Design token system (Tailwind v4 + shadcn)

## Status

accepted

## Context

A design system now exists: `design-system/CashMind Color System.html` — a
self-contained "Color System v1" derived from the brand logo. It defines a raw
palette (an emerald ramp, a cool-neutral ramp, semantic anchors), a set of
**theme roles** for both light and dark (`--bg`, `--surface`/`-2`/`-3`,
`--border`/`-strong`, `--text`/`-2`/`-3`, `--text-on-primary`,
`--primary`/`-hover`/`-pressed`/`-subtle`/`-border`, `--focus`, the
finance-semantic `--positive`/`--negative`/`--warning`/`--info` with `-subtle`
tints, plus `--shadow`/`-card` and `--radius`/`-sm`/`-lg`), two fonts
(Plus Jakarta Sans for UI, JetBrains Mono for figures), and a theme switch keyed
off a `data-theme` attribute.

The app does not consume any of it yet. `apps/web/src/index.css` is bare
(`@import "tailwindcss"` only — Tailwind **v4**, via `@tailwindcss/vite`).
shadcn is configured with `cssVariables: true` / `baseColor: slate`, and the
installed components (`button`, `card`, `input`, `dialog`, `drawer`,
`alert-dialog`, `label`) hardcode shadcn's utility classes — `bg-primary`,
`text-foreground`, `bg-card`, `bg-destructive`, `border-input`, `ring-ring`, …
Those utilities resolve to shadcn's expected CSS variables (`--background`,
`--foreground`, `--card`, `--primary`, `--destructive`, `--border`, `--ring`, …),
**none of which are defined** — so generated components render unstyled. This is
the trap already recorded for this repo.

Two vocabularies therefore have to meet: the design system's role names and
shadcn's expected names. Doing this once, deliberately, sets the pattern every
future frontend phase (Categories, Transactions, Dashboard) will follow — which
is why it earns its own slot rather than being improvised inside the next
feature.

## Decision

Adopt the design-system tokens as the **canonical styling vocabulary** of
`apps/web`, wired into Tailwind v4 the way shadcn's own v4 setup does it:

1. **Design roles are the source of truth.** Declare the design system's roles as
   real CSS variables in `apps/web/src/index.css` — `:root` holds the light
   values, a `.dark` block holds the dark values (the system already ships both).
2. **shadcn names are aliases onto design roles**, not a second set of values:
   `--background: var(--bg)`, `--foreground: var(--text)`, `--card: var(--surface)`,
   `--primary: var(--primary)`, `--primary-foreground: var(--text-on-primary)`,
   `--destructive: var(--negative)`, `--border: var(--border)`,
   `--ring: var(--focus)`, and so on. The installed shadcn components light up with
   zero edits to their code.
3. **Expose both vocabularies as Tailwind utilities** via `@theme inline` (the v4
   directive for theme tokens that reference other CSS variables): map shadcn's
   `--color-*` namespace (`--color-background: var(--background)`, …) so existing
   components work, and map the design roles (`--color-surface: var(--surface)`,
   `--color-positive: var(--positive)`, `--color-text-2: var(--text-2)`, …) so new
   code can write the finance-native vocabulary (`bg-surface`, `text-positive`).
4. **Dark mode keyed off the `.dark` class**, declared once with the v4 custom
   variant `@custom-variant dark (&:is(.dark *))`. Both theme blocks are wired now
   (they're already authored — free), **default is light**, and there is **no
   toggle UI** this pass. This matches the `dark:` utilities already present in
   `Logo.tsx` and the broader shadcn/Tailwind convention; the design system's
   `data-theme` attribute is **not** adopted, to avoid diverging from `.dark`.
5. **Fonts:** wire Plus Jakarta Sans as the UI font and JetBrains Mono exposed as
   a mono token **reserved for monetary amounts** (tabular, aligned figures — a
   direct fit for the integer-cents money invariant in `CLAUDE.md`). Pull both via
   the font link the design file already uses.

### Wiring units (the handoff to `/plan-build`)

This ADR is the build brief in the absence of a feature note. The pieces:

- Token block in `apps/web/src/index.css` — raw palette + `:root` (light) +
  `.dark` (dark), lifted from the design system file.
- shadcn-name aliases onto design roles.
- `@theme inline` mapping for both the `--color-*` shadcn namespace and the design
  roles.
- `@custom-variant dark` one-liner; `.dark` block; default light; **no toggle**.
- Both fonts loaded; mono token reserved for amounts.
- `components.json` left as-is (`cssVariables: true`) — the wiring satisfies what
  it already expects.

### Non-goal (state it, so the build does not drift)

**Existing screens are NOT re-skinned this pass.** Login, the authenticated
shell, and the shipped accounts-management UI keep their current markup; they
simply stop rendering unstyled once the variables exist. Refining/redesigning
those screens against the new system is deliberately deferred to a later UI pass.

## Alternatives considered

- **Rename the design system into shadcn's scheme** (make its roles *be*
  `--background`, `--card`, …). **Rejected:** loses the finance-native vocabulary
  (`--surface`, `--positive`/`--negative`) that reads better in this domain than
  shadcn's generic names, and discards the design file as a faithful reference.
- **Rewrite each shadcn component to use design utilities directly** (drop
  shadcn's variable names). **Rejected:** invasive, edits vendored component code,
  and drifts from upstream — every future `shadcn add` would fight the convention.
- **Use the design system's `data-theme="dark"` attribute** for theming.
  **Rejected:** diverges from the `.dark` class that Tailwind's `dark:` utilities
  and `Logo.tsx` already assume, forcing extra configuration for no gain.
- **Wire light only, add dark later.** **Rejected:** both blocks are already
  authored and tested in the design file; keying them off `.dark` now is free and
  spares a second migration.

## Consequences

- **shadcn ↔ design-role is not 1:1.** shadcn also ships `--muted`, `--accent`,
  `--secondary`, `--popover` (+ their `-foreground`s), `--input`, `--chart-1..5`,
  and `--sidebar-*`, for which the design system has **no** direct counterpart.
  These are resolved **at build time by judgment** — derived from the palette
  (e.g. a muted surface from the neutral ramp, `--input` from `--border`) — not
  implied to map cleanly. Chart and sidebar tokens can be deferred until a feature
  needs them (Dashboard for charts).
- **The convention lands with the code.** A `## Frontend design tokens` section in
  [[conventions]] — documenting *where* the tokens live and *which* vocabulary new
  code uses — is written **at build time, in the same commit** as the `index.css`
  wiring (per "docs travel with code"). It is intentionally **not** written now, to
  avoid pointing at code that does not exist yet.
- **The source-of-truth artifact must become durable.**
  `design-system/CashMind Color System.html` is currently untracked; it should be
  **committed** (at repo root, outside `docs/`) as part of the build so references
  to it are not future-lies. Tokens in `index.css` become the runtime truth; the
  HTML file remains the human-readable reference.
- **Every later frontend phase inherits this vocabulary.** Categories,
  Transactions, and Dashboard build against these roles and the mono-for-amounts
  rule, so they share one visual language without re-deciding it.
- **A theme toggle is now cheap but out of scope.** Both themes resolve; shipping a
  toggle (and deciding persistence) is a later UI task, not this one.

Parent: [[decisions-index]]
