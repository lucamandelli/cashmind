---
name: document
description: Use after creating or changing a feature, API resource, domain rule, decision, ops/infra, or fixing a bug in CashMind — to create or update the matching living-documentation note under docs/ in the same commit. Also use when the user asks to "document this", "update the docs", or "write it down".
---

# Documenting CashMind (`/document`)

Keep `docs/` — the project's second brain — in sync with the code. Documentation
and code travel together in the **same commit**.

The conventions, types, linking rules, frontmatter, and templates are defined
once in `docs/README.md`. **Read it** rather than duplicating it here.

## When to run

- Right after a change lands behavior (a feature, an endpoint, a domain rule, an
  infra/deploy change, a fixed bug), before committing.
- When the user explicitly asks to document something.

## Workflow

1. **Classify** the change into one of the 8 types (see `docs/README.md`):
   overview, domain, api, feature, decision, ops, conventions, log.
2. **Locate or create** the note:
   - Use the right folder and a stable kebab-case filename.
   - API: one note per **resource**, not per endpoint.
   - ADRs and log entries are numbered (`NNNN-slug.md`).
3. **Apply the template** for that type (headings, in order — see `docs/README.md`).
4. **Write WHY and WHERE, not WHAT.** Never copy field lists, validation rules,
   DB columns, or test assertions — point to Zod (`packages/shared`), Prisma, or
   the test files instead. A copied fact is a future lie.
5. **Link** with `[[note-name]]`, labeled in prose, in the consistent direction:
   feature → api/domain; any note → its ADR; log → the affected feature/api.
6. **Frontmatter**: set/keep `type`, `status`, `summary`, `tags`, and bump
   `updated` to today.
7. **Register new areas**: if you created a new sub-hub, link it from
   `docs/00-overview.md`; if you created a new top-level area, add it to the
   index in `CLAUDE.md`.
8. **Stay in the same commit** as the code change.

## Guardrails

- Don't invent file paths or symbols — verify them in the repo first.
- Prefer updating an existing note over creating a near-duplicate.
- If a note is now wrong but you can't fix it fully, set `status: deprecated` and
  say why, rather than leaving a confident lie.
- Keep notes short and skimmable; predictable structure over prose.
