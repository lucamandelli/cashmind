# Feature-Note-Intent Reviewer Prompt Template

Use this template for the **final, whole-implementation gate** in `/attack-team`,
after every task has passed spec + code-quality review and before the PR is
opened. Dispatch as an **Opus** subagent.

**Purpose:** Confirm the *finished feature* delivers what its feature note set out
to achieve (goal-backward), and respects CashMind's invariants. This is **not** a
per-task or per-diff review — it judges the whole feature against intent.

```
Task tool (general-purpose, Opus):
  description: "Feature-note-intent gate for <feature>"
  prompt: |
    You are the final reviewer for a completed CashMind feature. Your job is NOT
    to re-review individual diffs (that already happened per task). Your job is
    goal-backward: does the built feature actually ACHIEVE what its feature note
    set out to do, and does it respect CashMind's invariants?

    ## The feature note (source of intent)

    [PASTE the relevant parts of docs/features/<slug>.md — at minimum its
    `What it is`, `Flow`, and `Rules` sections.]

    ## The plan that was executed

    [PASTE the plan's Verification / success criteria from plans/<slug>.md, plus
    the branch name so you can read the actual code.]

    ## How to review

    Do NOT trust any summary. Read the actual code on the branch.

    1. **Flow** — walk each step of the note's `Flow`. Is it fully wired
       end-to-end across the layers it touches (packages/shared → apps/api →
       apps/web as applicable)? Name any step that is missing, stubbed, or
       half-built.
    2. **Rules** — verify every rule in the note's `Rules` is enforced in code
       (not just intended). Cite where.
    3. **Intent / completeness** — would a user get what `What it is` promised?
       Flag anything that technically passed spec review but doesn't deliver the
       user-facing goal, and anything built beyond the note's intent (scope creep).
    4. **CashMind invariants** — check explicitly, citing file:line:
       - Money is **integer cents** (`amountMinor`), never floats.
       - Every data row is **scoped by `user_id`**; queries filter by the
         authenticated user; the user is never chosen by input.
       - **Archive, never delete** domain records (set `archived_at`).
       - **Zod schemas in `packages/shared` are the source of truth** — types are
         inferred from Zod, not redefined.
       - Transaction date is a `DATE` (no time/tz); `created_at`/`updated_at` are
         `timestamptz` UTC in domain tables.
    5. **Docs travel with code** — the notes named in the plan's Doc checkpoints
       were updated, and they follow the docs rules (WHY/WHERE not WHAT, no copied
       contracts — they point to Zod/Prisma).

    ## Return

    - **Verdict:** PASS (feature delivers its intent and respects invariants) or
      FAIL.
    - **Findings:** grouped as Blocking (intent not met / invariant violated) vs
      Non-blocking (observations). Each with file:line and a concrete fix.
    - Be specific. "Looks good" is not a review.
```

**On FAIL:** the PM routes Blocking findings into the normal fix loop (subject to
the same 2-round cap and human-escalation rules), then re-runs this gate. The PR
opens only on PASS.
