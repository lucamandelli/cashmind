---
type: overview
status: current
updated: 2026-06-10
summary: Sub-hub for known bugs and gotchas — date shift, Better Auth account collision, Fastify body stream, Better Auth timestamp drift.
tags: [log, moc]
---

# Log — bugs & gotchas

Known bugs and resolved traps. One note per bug/gotcha, numbered. Each links to
the feature or API where it lives, so backlinks surface "what bit us here".

## Entries

- [[0001-date-day-shift]] — transaction date shifting by one day
- [[0002-better-auth-account-collision]] — `Account` name collision (Better Auth vs. financial domain)
- [[0003-fastify-auth-body-stream]] — `toNodeHandler` consumes body stream; fix via `auth.handler`
- [[0004-better-auth-tables-timestamp3]] — Better Auth tables still on `TIMESTAMP(3)`; needs dedicated cleanup pass

Parent: [[00-overview]]
