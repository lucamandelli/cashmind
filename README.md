# CashMind

> A personal finance app to track spending and income — single-user first, with a multi-user-ready schema.

CashMind is a mobile-first web app (responsive, installable PWA) for keeping a clear picture of where your money goes. It's TypeScript end-to-end, built as an npm-workspaces monorepo where the frontend, backend, and a shared validation layer all speak the same types.

## Highlights

- **Track income, expenses, and transfers** across multiple accounts/wallets.
- **Balances computed on read** — per-account and total.
- **Dashboard** — spending by category, income vs. expense.
- **Mobile-first PWA** — installable, responsive, no native app.
- **Money is always integer cents** — never floats. Base currency BRL, mono-currency, with a `currency` field reserved for future multi-currency support.
- **Archive, never delete** domain records — history and reports stay intact.

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) end-to-end |
| Frontend | React + Vite (SPA), Tailwind CSS + shadcn/ui, TanStack Router & Query, React Hook Form, Zustand, Recharts |
| Backend | Fastify, Prisma, PostgreSQL, Better Auth (httpOnly cookie session) |
| Shared | Zod schemas + inferred types — the single source of truth for data shapes |
| Tooling | Biome (lint + format), Vitest, Playwright, Testcontainers |
| Runtime | Node 22 LTS (pinned via `.nvmrc`) |

The same Zod schema in `packages/shared` validates the API request, the React form, and the typed URL search params — so the frontend and backend never drift.

## Repository layout

```
cashmind/
├─ apps/
│  ├─ web/      → React + Vite (frontend)
│  └─ api/      → Fastify + Prisma + Better Auth (backend)
├─ packages/
│  └─ shared/   → Zod schemas + inferred types (imported by both apps)
├─ docs/        → living documentation (also an Obsidian vault)
├─ docker-compose.yml   → dev Postgres
└─ package.json         → npm workspaces config
```

## Getting started

**Prerequisites:** Node 22 (`nvm use`), npm 10, Docker.

```bash
# 1. Install dependencies
npm install

# 2. Configure the API environment
#    Copy the template and fill in the values.
cp .env.example apps/api/.env

# 3. Start the dev database (Postgres 16)
docker compose up -d

# 4. Run both apps (api + web) with hot reload
npm run dev
```

The web app runs on Vite (port 5173) and proxies `/api` to Fastify (port 3001). Verify the stack end-to-end by hitting the health route — `Browser → /api/health → Fastify → Prisma SELECT 1 → Postgres`.

## Scripts

Run from the repo root:

| Script | What it does |
|---|---|
| `npm run dev` | Start `api` and `web` together with hot reload |
| `npm run build` | Build `shared`, then `api`, then `web` |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint` | Biome lint |
| `npm run format` | Biome format (write) |
| `npm run check` | Biome lint + format (write) |
| `npm run test` | Run tests for `shared` and `api` |

## Documentation

`docs/` is the project's second brain — read by humans (as an Obsidian graph) and by AI assistants. Start here:

- **Graph hub / map of everything** → [`docs/00-overview.md`](docs/00-overview.md)
- **Architecture & decisions** → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **How the docs system works** → [`docs/README.md`](docs/README.md)
- **Conventions (build, test, style)** → [`docs/conventions.md`](docs/conventions.md)

Contributor rules and project invariants (money as cents, per-user scoping, dates, archiving) live in [`CLAUDE.md`](CLAUDE.md). The rule of thumb for docs: document the **why** and the **where**; let the code be the **what**.

## Roadmap

| Feature | Phase |
|---|---|
| CRUD transactions, accounts, categories | MVP |
| Per-account and total balances | MVP |
| Dashboard (spend by category, income × expense) | MVP |
| CSV import | Phase 2 |
| Budgets | Phase 2 |
| Recurring transactions | Phase 2 |
| Savings goals | Backlog |
| LLM / agent integration | Future |

Guiding principle: **don't pay the complexity tax before the real pain exists.**

## License

Private project — not licensed for redistribution.
