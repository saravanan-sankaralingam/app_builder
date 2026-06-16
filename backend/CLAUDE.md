# Backend — kissflow-backend

> See `../CLAUDE.md` for product overview and data-layer model. This file is the **backend-specific** context.

## Stack

- **Fastify 5** REST API
- **Prisma 6** + **PostgreSQL**
- **JWT** auth (access + refresh tokens) via `@fastify/jwt`
- **Zod** for env + request schemas
- **TypeScript** + **tsx** for dev

## Run

```bash
npm run dev          # http://localhost:3000 (tsx watch)
npm run build        # prisma generate + tsc
npm run start        # production: node dist/server.js

# DB
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed dev DB
npm run db:studio    # open Prisma Studio
```

Config lives in `.env` — `DATABASE_URL`, `JWT_SECRET` (≥32 chars), `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `PORT`, optional `SYSTEM_BOT_USER_ID`. `src/config/env.ts` validates with Zod and exits 1 on bad config.

## Directory map

```
src/
├── server.ts             # Entry: builds app, listens on env.PORT
├── app.ts                # buildApp() — registers CORS, JWT, multipart, routes
├── config/
│   └── env.ts            # Zod-validated env loader
├── middleware/
│   └── auth.middleware.ts
├── modules/              # One folder per resource — see "Module shape" below
│   ├── auth/
│   ├── app/
│   ├── data-layer/
│   ├── field/
│   ├── navigation/
│   ├── page/
│   ├── view/
│   ├── report/
│   ├── component/
│   └── upload/
├── utils/
│   └── password.ts       # bcrypt helpers
└── types/

prisma/
├── schema.prisma         # Source of truth for DB schema
├── migrations/           # Versioned migrations (do not edit applied ones)
└── seed.ts               # Dev seed data
```

## Module shape

Every resource module follows the same 4-file convention:

```
modules/<resource>/
├── <resource>.routes.ts      # Fastify route registration (URL prefix set in app.ts)
├── <resource>.controller.ts  # Request → service call, response mapping
├── <resource>.service.ts     # Business logic, Prisma queries
└── <resource>.schema.ts      # Zod schemas for request body / params / responses
```

When adding a new resource:
1. Create the four files above
2. Register in `src/app.ts` with a `/api/...` prefix (see lines 50-60 for the pattern)
3. If it owns DB tables, update `prisma/schema.prisma` and run `npm run db:migrate`

## Route map (prefixes set in `src/app.ts`)

| Prefix | Module |
|---|---|
| `GET /health` | inline in `app.ts` |
| `/api/auth` | auth |
| `/api/apps` | app |
| `/api/apps/:appId/data-layers` | data-layer (nested) |
| `/api/data-layers` | data-layer (direct) |
| `/api/data-layers/:dataLayerId/fields` | field |
| `/api/data-layers/:dataLayerId/views` | view |
| `/api/data-layers/:dataLayerId/reports` | report |
| `/api/apps/:appId/navigations` | navigation |
| `/api/apps/:appId/pages` | page |
| `/api/apps/:appId/components` | component |
| `/api/apps/:appId/components/:componentId/upload` | upload |

## Database

Core models — see `prisma/schema.prisma` for full definitions:

```
User           # id, email, name, password, role (admin/member/viewer)
App            # id, name, slug, type (app/portal), status (draft/live/archived)
RefreshToken   # JWT refresh tokens

DataLayer      # id, appId, name, slug, type (dataform/board/process)
Field          # id, dataLayerId, name, slug, type, required, options, config, order
WorkflowStep   # id, dataLayerId, name, slug, color, order, allowedNextSteps
DataItem       # id, dataLayerId, data (JSON), currentStepId, createdById, updatedById
```

**Data layer types:** `dataform` (no workflow), `board` (any step → any step), `process` (predefined transitions only). See `../CLAUDE.md` for the conceptual model.

> **Runtime data storage is in transition.** Today, records live in `DataItem.data` (JSON blob). The **target architecture is dynamic / physical schema** — each Data Layer gets its own physical table, generated from metadata via DDL on save. Read [`../docs/DATA_LAYER_ARCHITECTURE.md`](../docs/DATA_LAYER_ARCHITECTURE.md) before designing new data-layer backend work. Treat anything you build against `DataItem.data` today as **interim**.

> **Dev vs Prod target: two physical databases** — `kissflow_dev_db` and `kissflow_prod_db`. App identity is a single row (in prod); metadata and dynamic runtime tables exist independently in both DBs. Publish copies dev metadata → prod and runs DDL on prod. Current single-DB setup is interim. See [`../docs/DATA_LAYER_ARCHITECTURE.md`](../docs/DATA_LAYER_ARCHITECTURE.md#dev-vs-prod-isolation-decided).

## CORS

`app.ts:24-27` sets `origin: true, credentials: true` — allows any origin in dev. Tighten for production.

## Auth

JWT registered via `@fastify/jwt` (`app.ts:30`). Routes that need auth use the middleware in `middleware/auth.middleware.ts`. Refresh tokens are persisted in the `RefreshToken` table.

## Code style

- ESM with `.js` import extensions (e.g. `from './config/env.js'`) — Prisma + tsx need this
- Zod for ALL request validation — never trust `request.body` directly
- Throw typed errors in services; controllers translate to HTTP responses
- Prisma client: import once, reuse — don't instantiate per request
