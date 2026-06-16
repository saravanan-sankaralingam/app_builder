# Kissflow App Builder

A low-code application development platform. Users build apps in a visual builder, test in a dev sandbox, and deploy to production.

```
┌─────────────────┐      ┌─────────────────┐
│   App Builder   │ ──── │  Dev Sandbox    │ ──── Deploy ──── Production
│  (Low-code UI)  │      │  (Test/Preview) │
└─────────────────┘      └─────────────────┘
```

## Where to look

This is a monorepo with two halves. For code-level conventions, read the nested `CLAUDE.md`:

| You're working on | Read |
|---|---|
| App lifecycle (creation, dev/prod, publish, archive) | [`docs/APP_LIFECYCLE.md`](docs/APP_LIFECYCLE.md) |
| Data Layer architecture (metadata + dynamic runtime schemas) | [`docs/DATA_LAYER_ARCHITECTURE.md`](docs/DATA_LAYER_ARCHITECTURE.md) |
| Frontend (React/Next.js UI, builder, views) | [`kissflow-react/CLAUDE.md`](kissflow-react/CLAUDE.md) |
| Backend (Fastify API, Prisma, auth) | [`backend/CLAUDE.md`](backend/CLAUDE.md) |
| Builder structure (5 Layers: Data, Interface, Logic, Roles, Settings) | [`kissflow-react/docs/BUILDER_LAYERS.md`](kissflow-react/docs/BUILDER_LAYERS.md) |
| Builder modes (Play/Spec X/Spec Y/Build) | [`kissflow-react/docs/BUILDER_MODES.md`](kissflow-react/docs/BUILDER_MODES.md) |
| Property panel + utility bar styling | [`kissflow-react/ComponentsProperties.md`](kissflow-react/ComponentsProperties.md) |
| Page editor layout | [`kissflow-react/docs/PAGE_BUILDER.md`](kissflow-react/docs/PAGE_BUILDER.md) |
| Color tokens | [`kissflow-react/docs/COLORS.md`](kissflow-react/docs/COLORS.md) |
| Pre-experiment style snapshots | [`kissflow-react/STYLE_BACKUPS.md`](kissflow-react/STYLE_BACKUPS.md) |

The rest of this file is the **product model** — what apps are made of. Read it once; the nested files have everything you need after that.

## Quick start

```bash
# Frontend
cd kissflow-react && npm run dev    # http://localhost:4001

# Backend
cd backend && npm run dev           # http://localhost:3000
cd backend && npm run db:migrate    # apply migrations
cd backend && npm run db:seed       # seed dev data
```

The frontend reads `NEXT_PUBLIC_API_URL` from `kissflow-react/.env.local` to decide whether to talk to the local backend (`http://localhost:3000`) or the hosted Render backend. Toggle the comment in that file.

## Product model: 5 app construction layers

Apps are composed of 5 layers. The **Data layer** is the foundation; everything else builds on it.

```
1. DATA LAYER (Foundation)
   ├── DataForm  — data without workflow
   ├── Board     — data with unstructured workflow (item can move to any step)
   └── Process   — data with structured workflow (predefined step sequence)

2. INTERFACE LAYER
   ├── Views   — Table, Kanban, Gallery, Calendar, Timeline, Sheet
   ├── Forms   — Create, Edit, View
   └── Pages   — custom drag-and-drop pages (see PAGE_BUILDER.md)

3. LOGIC LAYER
   ├── Automations
   ├── Validations
   └── Computed fields / formulas

4. ROLES & PERMISSIONS LAYER
   ├── Role definitions
   ├── Field-level permissions
   └── Step-level permissions (workflows only)

5. SETTINGS LAYER
   ├── App configuration
   ├── Integrations
   └── Notifications
```

### Data layer types

| Type | Description | Workflow |
|---|---|---|
| **DataForm** | Simple data collection (like a database table) | None |
| **Board** | Kanban-style tracking with flexible workflow | Unstructured (any step → any step) |
| **Process** | Formal workflow with defined transitions | Structured (predefined step sequence) |

### Data layer DB shape

```
App (1) ──── (N) DataLayer ──── (N) Field         # schema definition
                    │
                    ├──── (N) WorkflowStep         # board / process only
                    │
                    └──── (N) DataItem             # actual records (data: JSON)
```

- **DataLayer** — container for a form/board/process within an app
- **Field** — field definitions (name, type, options, validation)
- **WorkflowStep** — workflow steps with transitions (board allows all; process restricts via `allowedNextSteps`)
- **DataItem** — data stored as JSON with a reference to the current step

Full schema lives in `backend/prisma/schema.prisma`. Backend-side conventions for adding/modifying models are in [`backend/CLAUDE.md`](backend/CLAUDE.md#database).

## Architecture at a glance

- **Frontend** (`kissflow-react/`) — Next.js 16 App Router, React 19, Tailwind v4, Radix/shadcn. Runs on `:4001`.
- **Backend** (`backend/`) — Fastify 5, Prisma 6 + PostgreSQL, JWT auth (access + refresh). Runs on `:3000`.

CSS Grid layout shell lives in `kissflow-react/components/layout/AppLayout.tsx`:
```
┌─────────────────────────────────────┐
│ TopBar (3.5rem, full width)         │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│ (3.5rem) │ (scrolls independently)  │
└──────────┴──────────────────────────┘
```

The Builder route (`app/builder/[appId]/`) uses a different shell — see `kissflow-react/CLAUDE.md` and `docs/BUILDER_MODES.md`.
