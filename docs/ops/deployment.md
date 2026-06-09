---
type: ops
status: draft
updated: 2026-06-09
summary: Deploy CashMind to a single VPS with Docker Compose, Nginx + Certbot, and a nightly DB backup.
tags: [ops, deploy, infra]
---

# Deployment

## Target

A single VPS running Docker Compose: Postgres + Fastify API + Nginx (reverse
proxy serving the SPA) with Certbot for HTTPS. Production mirrors local dev
(same Compose file, production overrides).

## Steps (runbook)

1. Provision the VPS; install Docker + Docker Compose.
2. Clone the repo; create `.env` from `.env.example` (never commit `.env`).
3. `docker compose -f docker-compose.prod.yml up -d` — Postgres, API, Nginx.
4. Build the SPA (`apps/web`) and serve the static output via Nginx.
5. Configure Nginx: reverse-proxy `/api` → Fastify; serve SPA for everything else.
6. Run Certbot to issue/renew the Let's Encrypt certificate.

## Backup (non-negotiable once anyone else has data)

- Nightly `pg_dump` → object storage (e.g. Backblaze B2 / S3), with retention.
- Treat as a release gate before sharing the app with family.

## Env vars

Validated by a Zod schema at API boot (fails fast if missing). See
`apps/api/src/env.ts` _(TODO)_ and `.env.example`.

## Gotchas

- Don't expose Postgres to the public internet — keep it on the Compose network.

Parent: [[ops-index]]
