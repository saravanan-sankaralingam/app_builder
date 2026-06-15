# Frontend — kissflow-react

> See `../CLAUDE.md` for product overview, data-layer model, and the 5-layer app construction map. This file is the **frontend-specific** context.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript** (strict mode, path alias `@/*` → `./`)
- **Tailwind CSS v4** (`globals.css` defines tokens; see [`docs/COLORS.md`](docs/COLORS.md) for the full palette)
- **Radix UI** via shadcn/ui pattern (`components/ui/`)

## Run

```bash
npm run dev          # http://localhost:4001 (Next.js)
npm run lint
npm run build        # type-check + production build
```

Frontend talks to the backend via `NEXT_PUBLIC_API_URL` (set in `.env.local`). Defaults to `http://localhost:3000` if unset. The Render-hosted backend URL is the alternative — toggle the comment in `.env.local`.

## Directory map

```
app/                      # Next.js App Router
├── (main)/               # Routes inside the main shell (TopBar + Sidebar)
│   ├── page.tsx          # Home
│   ├── explorer/         # App explorer
│   ├── create/           # App creation flow
│   ├── my-items/
│   └── store/
└── builder/[appId]/      # App Builder — the core authoring surface

components/
├── layout/               # AppLayout, TopBar, Sidebar — the main shell
├── builder/              # ALL builder UI — see "Builder" section below
├── views/                # Runtime view types (table, kanban, gallery, calendar, timeline, sheet)
├── app-view/             # In-app runtime rendering
├── create/               # App creation wizard
├── explorer/             # Explorer page
├── common/               # Cross-cutting UI
├── icons/                # Custom SVG icons
└── ui/                   # shadcn/Radix primitives (Button, Dialog, etc.)

lib/
├── api/                  # Backend client — one file per resource
│   ├── client.ts         # fetch wrapper, ApiError, response handling
│   ├── apps.ts           # /api/apps
│   ├── data-layers.ts    # /api/data-layers
│   ├── components.ts, views.ts, reports.ts, upload.ts
├── config.ts             # API_BASE_URL export
├── schema/               # Shared TS types mirroring backend Prisma models
├── icons.ts, data-utils.ts, date-utils.ts, utils.ts (cn)
```

## Layout system

CSS Grid shell in `components/layout/AppLayout.tsx`:
```
┌─────────────────────────────────────┐
│ TopBar (3.5rem, full width)         │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│ (3.5rem) │ (scrolls independently)  │
└──────────┴──────────────────────────┘
```

The `app/builder/[appId]/` route renders a different shell — see Builder section.

## Builder

The App Builder is where users author apps. Key reading **before touching builder code**:

- [`docs/BUILDER_MODES.md`](docs/BUILDER_MODES.md) — Play / Spec X / Spec Y / Build top-bar modes, layout switching, what each mode shows
- [`ComponentsProperties.md`](ComponentsProperties.md) — property panel + utility bar styling spec, and which utility-bar buttons appear per tab type
- [`docs/PAGE_BUILDER.md`](docs/PAGE_BUILDER.md) — Page editor (3-section drag-and-drop layout)
- [`STYLE_BACKUPS.md`](STYLE_BACKUPS.md) — pre-experiment style snapshots for quick revert

**Critical design rule** (from BUILDER_MODES): Spec X and Spec Y are *readable specification documents*, not configuration editors. Removing editor UI ≠ removing content — every editor field must map to a prose/table analogue in the spec.

Entry points:
- `components/builder/BuilderLayout.tsx` — top-level builder shell, mode switching
- `components/builder/BuilderTopBar.tsx` — Play/Spec X/Spec Y/Build toggle
- `components/builder/BuilderTabBar.tsx` — open-tab bar
- `components/builder/BuilderUtilityBar.tsx` — per-tab action buttons (Views, Reports, Share, Settings, Save, More)
- `components/builder/BuilderSidebar.tsx` — left tree of app artifacts

## Code style

- Client components must start with `'use client'`
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- State: React hooks; URL search params for navigation state — avoid global stores unless justified
- Imports: prefer the `@/` alias over relative `../../`
- Strict TypeScript — no `any` unless explicitly justified in a comment

## Testing

No test runner wired up yet. Validate with:
1. `npm run lint`
2. `npm run build` (type-check + production build catches most regressions)
3. Manual smoke in the browser at `http://localhost:4001`
