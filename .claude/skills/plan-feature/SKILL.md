---
name: plan-feature
description: Use to turn a CashMind roadmap line into a complete, durable feature note — when the user wants to flesh out, design, spec, or "write up" a feature from docs/features/features-index.md (e.g. "plan the Categories feature", "let's design transactions", "/plan-feature 2"). Elicits the real decisions by grilling, writes the feature note, spins off ADRs, and collapses the roadmap entry to a routing summary. Use this BEFORE planning the build (/plan-build) — it produces the note that /plan-build consumes.
---

# Planning a feature (`/plan-feature`)

Turn a thin line in the MVP roadmap into a full feature note — the same kind of
note as `docs/features/walking-skeleton.md`, born from a real interrogation of
the design, not from guessing.

The output is **durable documentation** (it lives in `docs/`, the second brain).
So it records the feature's *intent and structure* — never sequencing or
execution mechanics. Those are `/plan-build`'s job, and they're transient.

## Why this exists

The roadmap entry is ~15 thin lines of scope. A real feature note has a stepped
flow, a files map, non-obvious rules, the decisions behind it (as ADRs), and the
gotchas. **That richness can't be auto-expanded from the thin entry — it has to
be elicited.** That's how the walking skeleton was written, and it's why this
skill grills you instead of fabricating plausible-but-wrong decisions (a copied
or invented fact is a future lie).

A second job: collapse the roadmap entry into a tiny **routing summary** so an
agent can see a feature's blast radius without paying to open the whole note.

## Read first (ground the grill in reality)

Read these before asking anything, so decisions build on what's already settled:

- `docs/README.md` — the note types, the **Feature template** (headings, in
  order), frontmatter, and linking convention. Follow it; don't reinvent it.
- `docs/ARCHITECTURE.md` — the stack and *which tech lives where*. This stops you
  re-litigating "which technology for this layer" — it's already decided.
- The target's current entry in `docs/features/features-index.md`.
- The correlated notes the feature will touch (the index entry's `Uses:` lines,
  plus anything in `docs/domain/` and `docs/api/` clearly in scope).
- The feature note **if one already exists** on disk (see step 2).

## Workflow

### 1. Resolve the target

Take the feature from the argument — a number (`/plan-feature 2`) or a slug
(`/plan-feature categories`) — resolved against the `features-index.md` headings.
No argument → list the not-yet-built items and ask which one.

### 2. Grill to elicit the design

Invoke the **`grill-me`** skill and interview the user until you reach shared
understanding — flow, the real decisions and their alternatives, the rules, the
layers it touches, the gotchas. This is the heart of the skill: the note is only
as good as the interrogation behind it.

**If a note already exists** for this feature: read it, treat its content as
*already-elicited* decisions, and **grill only the gaps**. Never blind-overwrite
work that's already there.

### 3. Write the feature note

Create / update `docs/features/<slug>.md` on the **Feature template** from
`docs/README.md` (`What it is / Flow / Files / Rules / Uses / Gotchas`). Born
`status: planned` (a fresh feature); bump `updated:` and advance `status:` only
if the code maturity actually warrants it.

**Enrich `Flow` and `Files` with the feature's *structure*** — this is what
`/plan-build` reads to choose its execution approach, so make these explicit:

- **Contract impact** — does it touch the shared Zod / Prisma contract? (This is
  the single biggest signal for how the build must be sequenced.)
- **Layer breakdown** — which layers are involved (`packages/shared` / `apps/api`
  / `apps/web`) and how they depend on each other.
- **Natural sub-units** — the independently-shippable pieces (e.g. three entry
  forms + a list view), and which depend on which.

Record **structure (the WHAT/WHY), never sequencing.** Say *"this feature is one
Zod union + one route + three forms + a list, and the forms depend on the
route"* — do **not** write *"build the route first, then fan out the forms."*
That ordering is a planning decision `/plan-build` makes from this structure.

### 4. Spin off ADRs for load-bearing decisions

When a decision surfaced in the grill clears the bar — it has **real alternatives
considered** and **non-trivial consequences** — give it its own numbered ADR in
`docs/decisions/NNNN-slug.md` (next number; ADR template in `docs/README.md`) and
link it from the note's `Uses` (`Decided in [[NNNN-slug]]`). Trivial or obvious
choices stay as a line in the note's `Rules` — don't flood `decisions/` with thin
ADRs that only rot. A node type earns its existence.

### 5. Link, but plant no premature facts

- Point the note's `Uses` at the correlated notes (`Uses [[accounts]] ·
  [[accounts-api]]`). Backlinks then answer "what touches this?" for free — no
  manual reverse-annotation needed.
- For a correlated note that **doesn't exist yet** but is needed for navigation,
  create a **`status: planned` stub** (frontmatter + a one-line summary + the
  links) so the wikilink resolves.
- **Write no real code pointers** into correlated notes here. The feature isn't
  built — a pointer to `Category` at `routes/categories.ts` would point at code
  that doesn't exist (a future lie). Real `Source of truth` pointers land at
  build time, via `/document`, in the same commit as the code.

### 6. Collapse the roadmap entry to a routing summary

Replace the feature's verbose entry in `features-index.md` with a compact,
agent-readable block — the cheap routing layer an agent scans to decide whether
opening the full note is worth the context cost:

```markdown
### 1 · Accounts (thicken)
Grow create/list into full account management (edit, archive, full schema).
→ [[accounts-management]] · Touches: [[accounts]] · [[accounts-api]] · status: planned
```

- Keep the heading (it preserves build-order position).
- One summary line — reuse the note's frontmatter `summary:` so there's a single
  source of that sentence.
- The `→ [[note]]` pointer to the full note.
- A **`Touches:`** line of wikilinks — the feature's blast radius, in *links not
  copied facts*. This is `/plan-build`'s routing input, so it can navigate
  straight to the right docs (and from there to code) instead of exploring the
  codebase blind. It's **provisional**; `/plan-build` refines it once the plan
  sharpens the task→file mapping.

### 7. Hand off

End by telling the user the note is ready and suggesting the next step — **do not
auto-run it**, because building is a separate moment they may not be ready for:

> Feature note ready: `docs/features/<slug>.md`. Run `/plan-build <slug>` when
> you're ready to plan the build.

## Guardrails

- **Grill, don't guess.** If you can't get a decision out of the user, leave it
  open in the note (`status: draft`, a `TODO:` line) rather than inventing one.
- **Verify any path or symbol** you name against the repo before writing it.
- **Structure, not sequencing** in the durable note (step 3). Sequencing is
  transient and belongs to `/plan-build`.
- Register new areas: a new sub-hub gets linked from `docs/00-overview.md`; a new
  top-level area gets added to the index in `CLAUDE.md`.
