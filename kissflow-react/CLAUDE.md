# Frontend — kissflow-react

> See `../CLAUDE.md` for product overview, data-layer model, and the 5-layer app construction map. This file is the **frontend-specific** context.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript** (strict, path alias `@/*` → `./`)
- **Tailwind CSS v4** (`globals.css` defines tokens; see [`docs/COLORS.md`](docs/COLORS.md))
- **Radix UI** via shadcn/ui pattern (`components/ui/`)

## Run

```bash
npm run dev          # http://localhost:4001
npm run lint
npm run build        # type-check + production build
```

Frontend talks to the backend via `NEXT_PUBLIC_API_URL` (set in `.env.local`). Defaults to `http://localhost:3000`. The Render-hosted backend URL is the alternative — toggle the comment in `.env.local`.

## Two categories: Platform and Builder

The frontend has two distinct surfaces. **Runtime is not a third category** — it's a shared engine consumed by both.

| Category | Routes | Components | Context file |
|---|---|---|---|
| **Platform** | `app/(main)/*` (home, explorer, create, my-items, store, **`app/[appId]` end-user runtime**) | `components/layout/` (shell), `components/explorer/`, `components/create/`, `components/my-items/` | [`app/(main)/CLAUDE.md`](app/(main)/CLAUDE.md) |
| **Builder** | `app/builder/[appId]/` | `components/builder/*` (40 files) | [`components/builder/CLAUDE.md`](components/builder/CLAUDE.md) |
| **Runtime engine** (shared) | — | `components/views/{table,kanban,gallery,calendar,timeline,sheet}`, `components/common/`, `components/app-view/`, `lib/api/`, `lib/schema/`, `lib/data-utils.ts` | this file, "Runtime engine" section below |

```
                  ┌─────────────────────────────────────┐
                  │       RUNTIME ENGINE                │
                  │   views/, common/, app-view/        │
                  │   lib/api/, lib/schema/             │
                  └────────────┬────────────────────────┘
                               │ consumed by both
              ┌────────────────┴────────────────┐
              │                                 │
       ┌──────▼──────┐                  ┌───────▼──────┐
       │  PLATFORM   │                  │   BUILDER    │
       │ (end-user)  │                  │ (authoring)  │
       │             │                  │              │
       │ app/(main)/ │                  │ app/builder/ │
       │ app/[appId] │                  │  Play mode → │
       │             │                  │  AppRuntime  │
       │             │                  │  Preview.tsx │
       └─────────────┘                  └──────────────┘
```

When you edit:
- anything under `app/(main)/` or `components/{layout,explorer,create,my-items}/` → load Platform context
- anything under `components/builder/` or `app/builder/` → load Builder context
- anything under `components/views/`, `components/common/`, `components/app-view/` → this file's "Runtime engine" section is the canonical doc

## Runtime engine (shared)

The runtime engine is the code that **renders a deployed app's UI** from its meta-config. Both the Platform end-user route (`app/(main)/app/[appId]/`) and the Builder's Play mode (`components/builder/AppRuntimePreview.tsx`) call into this engine. Changes here affect both surfaces.

**Where it lives:**

```
components/views/                # View renderers — one folder per view type
├── table/      TableView, EmployeeTable + Columns + Toolbar
├── kanban/
├── gallery/
├── calendar/
├── timeline/
└── sheet/

components/app-view/             # App-level runtime wrapper (currently empty — placeholder)
components/common/               # Shared runtime UI (e.g. PlaceholderPage)

lib/api/                         # Backend client per resource
├── client.ts                    # fetch wrapper, ApiError
├── apps.ts, data-layers.ts, views.ts, reports.ts, components.ts, upload.ts

lib/schema/                      # Shared TS types mirroring backend Prisma models
lib/data-utils.ts                # Data transform helpers used by views
```

**Conventions when adding to the engine:**
- A new view type goes in `components/views/<type>/` following the table pattern (one `<Type>View.tsx` entry point + supporting files)
- API calls always go through `lib/api/client.ts` — never call `fetch` directly
- Don't import from `components/builder/` or `components/explorer/` here. The runtime engine must stay consumable by both surfaces.

## Layout system (Platform shell)

CSS Grid shell in `components/layout/AppLayout.tsx`, applied via `app/(main)/layout.tsx`:
```
┌─────────────────────────────────────┐
│ TopBar (3.5rem, full width)         │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│ (3.5rem) │ (scrolls independently)  │
└──────────┴──────────────────────────┘
```

The Builder route (`app/builder/[appId]/`) uses its own shell from `components/builder/BuilderLayout.tsx` — see Builder context.

## Code style

- Client components start with `'use client'`
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- State: React hooks; URL search params for navigation state — avoid global stores unless justified
- Imports: prefer `@/` alias over relative `../../`
- Strict TypeScript — no `any` unless explicitly justified in a comment

## Testing

No test runner wired up yet. Validate with:
1. `npm run lint`
2. `npm run build`
3. Manual smoke at `http://localhost:4001`
