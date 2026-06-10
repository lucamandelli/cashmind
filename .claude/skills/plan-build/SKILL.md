---
name: plan-build
description: Use to turn a CashMind feature note into a development plan — when the user is ready to start coding a feature and wants the build planned (e.g. "plan the build for Categories", "how should we attack transactions", "/plan-build 3", "now plan the frontend for this feature"). Reads the feature note, picks the best execution approach (sequential / fan-out / backend→frontend split), and writes a transient plan to the gitignored plans/ dir. Use this AFTER /plan-feature has produced the feature note.
---

# Planning a build (`/plan-build`)

Turn a durable feature note into a **development plan**: how to actually attack
the build. The plan is **transient scratch** — it exists only to drive the work,
then it's thrown away. The durable record is the feature note + its ADRs + the
code-pointer updates `/document` makes at build time.

So the plan never goes in `docs/` (the second brain holds no agent artifacts). It
lives in a **gitignored `plans/` directory** at the repo root — it persists
across sessions while you build, but never enters git history or the docs graph.

## Why this exists

Different features want different attack patterns, and picking wrong wastes work
(parallel agents colliding on a shared schema; a frontend planned against an API
that doesn't exist yet). This skill reads the feature's *structure* and matches it
to the right approach, then writes a plan grounded in code that **actually
exists** — never in guesses about code yet to be written.

It **owns the plan document** but **delegates execution** to proven skills: it
decides *which* approach, those skills define *how* to run it.

## Read first

- The **feature note** (`docs/features/<slug>.md`) — especially the `Flow` and
  `Files` sections, which carry the contract impact, layer breakdown, and
  sub-units you need.
- Its `Touches:` line in `features-index.md` and the notes it points to — your
  navigation map from docs straight to the relevant code, no blind exploration.
- `docs/ARCHITECTURE.md` — which layer/technology each piece lives in.
- `docs/conventions.md` — the testing strategy (what gets TDD, how we test).

## Workflow

### 1. Build the dependency graph

From the note's structure (`Flow` + `Files`), its `Touches:` notes, and
`ARCHITECTURE.md`, work out the feature's tasks and how they depend on each
other: what's the shared spine, what's a leaf, which layer each piece is in.

### 2. Choose the approach (match the heuristics)

Match the graph against this table, then **propose the approach with explicit
rationale and get the user's approval** before writing the plan. Don't ask cold
(that's your job), don't decide silently (the user can't catch a bad call).

| Signal in the feature | Approach |
|---|---|
| Touches the **shared Zod / Prisma contract** | **Sequential, start→end.** The contract is the spine; parallel work collides on it. |
| Parts are **independent** | **Fan out** agents immediately. |
| **Sequential spine, then independent leaves** | Build the spine sequentially, **then** fan out the leaves. |
| **Backend then frontend**, want fresh UI context | **Split into separate plans / sessions** — backend first (see step 4). |

These are guides, not laws — if the feature's real shape suggests something else,
propose that and explain why.

### 3. Refine the `Touches:` line

You now have a sharper task→file mapping than `/plan-feature` did. If the real
blast radius differs (a note it missed, one that turned out irrelevant), update
the feature's `Touches:` line in `features-index.md`. (Code-level pointers still
belong in the correlated notes, written at build time by `/document` — not here.)

### 4. Decide how many plans, and when

- **Independent split** (true fan-out, no inter-stage dependency) → write **all
  plans at once**.
- **Dependent split** (backend→frontend, spine→leaves) → write **only the current
  stage's plan now.** Generate the next stage's plan in a *later run*, after this
  stage merges — so it references the **real, merged code** and the docs
  `/document` matured, not guesses. This is also why feature-4-style work gets a
  fresh session per stage: the next run starts clean and grounded in reality.

The next stage is carried by an explicit pointer in the plan (see the `Next
stage` section below) — there's no session monitoring, so the plan itself is the
hand-off.

### 5. Write the plan

Write to `plans/<slug>.md` (single plan) or `plans/<slug>-<stage>.md` (split,
e.g. `plans/categories-backend.md`). Use this structure:

```markdown
# Plan: <feature> [— <stage>]

- Feature note: [[<slug>]]            ← read this first
- Branch: feat/<n>-<slug>             ← create off main, step 1
- Approach: <sequential | fan-out | spine-then-fanout | split> — <one-line rationale: which heuristic matched>

## Tasks
Ordered. Each task: what to do · files to touch (from Touches + ARCHITECTURE) · depends-on.

## Execution
Which proven skill runs this, and what parallelizes:
- Sequential work → delegate to `superpowers:executing-plans`.
- Fan-out work → delegate to `superpowers:dispatching-parallel-agents`.
Mark which task groups run in parallel vs in order.

## Testing
Per `docs/conventions.md`. Name where TDD applies (`superpowers:test-driven-development`)
— e.g. money-correctness work like balances.

## Doc checkpoints
When to run `/document`, on which note — e.g. "after the Prisma model lands →
`/document domain/categories`". This carries the docs-travel-with-code obligation
into the plan so the executing agent can't forget it.

## Risks / Gotchas
Carry forward the feature note's Gotchas and known traps relevant to execution.

## Verification
Success criteria — how to know the feature is actually done.

## Done
Open a PR for the branch. [If this is a dependent split, add a Next stage section.]

## Next stage   ← only for dependent splits
The next stage and how to resume it. E.g.:
"Next stage — frontend. When this backend PR is merged, run
`/plan-build <slug> --stage frontend --from plans/<slug>-backend.md`. That run
reads this plan (what was built / deferred) **plus** the merged backend code and
the domain/api notes `/document` matured, and plans the frontend grounded in
reality."
```

### 6. Resume a later stage (dependent splits)

When re-invoked for the next stage (the user points you at the prior plan): read
the prior stage plan to learn what was built and what was deferred, **and** read
the now-merged code + the updated docs as ground truth. The plan is the cheap
hand-off; the code is authoritative. Then write the next stage's plan.

## Lifecycle

- The plan is gitignored scratch. After the feature ships (PR merged), it can be
  deleted or left — it never touched the docs graph or git history.
- **Exception — multi-stage features:** keep all stage plans in `plans/` until the
  **whole feature** ships, since later stages read earlier ones to resume.

## Guardrails

- **Ground every plan in code that exists.** Never write a plan (or a stage) that
  references not-yet-built code as if it were real.
- **Plans are transient and out of `docs/`.** Never write build sequencing into
  the durable feature note — that's why the note carries structure only.
- The feature branch off `main` is always task 1; the PR is always the finish.
- If the chosen approach is non-obvious, the one-line rationale in the header must
  say which heuristic it matched and why.
