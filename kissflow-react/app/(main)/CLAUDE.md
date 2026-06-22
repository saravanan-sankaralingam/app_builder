# Platform

> Read [`../../CLAUDE.md`](../../CLAUDE.md) first for the Platform vs Builder vs Runtime engine map. This file covers **Platform-specific** code only.

Platform is the broader Kissflow product surface — everything end-users (not app authors) see. It includes the home shell, app discovery, app creation, and the live runtime when a user opens a deployed app.

## Routes

All Platform routes live under `app/(main)/` and share the main shell via `app/(main)/layout.tsx` → `components/layout/AppLayout.tsx`.

| Route | Purpose | Components |
|---|---|---|
| `/` | Home — Platform landing surface | `app/(main)/page.tsx` (currently a placeholder). Spec lives in [`../../docs/PLATFORM_HOME.md`](../../docs/PLATFORM_HOME.md); future feature components will live in `components/home/`. |
| `/explorer` | App explorer — browse apps | `components/explorer/*` |
| `/create` | New app wizard | `components/create/*` |
| `/my-items` | User's items aggregated across apps — Assigned to me, Created by me, Watchlist tabs | `components/my-items/*`. Spec lives in [`../../docs/PLATFORM_MY_ITEMS.md`](../../docs/PLATFORM_MY_ITEMS.md). |
| `/store` | App marketplace | `components/marketplace/*`. Spec lives in [`../../docs/PLATFORM_MARKETPLACE.md`](../../docs/PLATFORM_MARKETPLACE.md). |
| `/notifications` | Full Notification Center — opened from the Bell's "Show all" link | `components/notifications/*`. Layout & rules in [`../../docs/PLATFORM_SHELL.md`](../../docs/PLATFORM_SHELL.md#notification-center-full-page). |
| `/app/[appId]` | **End-user app runtime** — renders a deployed app for end-users | calls into the runtime engine |

## Shell (TopBar + Sidebar)

`components/layout/AppLayout.tsx` is the Platform shell — CSS Grid with TopBar (3.5rem, full width) + Sidebar (3.5rem) + scrolling main content. Applied to every `(main)` route via the route group's `layout.tsx`.

Note: the Builder route (`app/builder/[appId]/`) does **not** use this shell — it has its own `BuilderLayout`. So changes to `AppLayout.tsx` affect Platform only.

**UI spec for the shell** (top nav layout, profile dropdown items and order, left nav): [`../../docs/PLATFORM_SHELL.md`](../../docs/PLATFORM_SHELL.md). Always check this before changing `TopBar.tsx` or `Sidebar.tsx`.

## End-user app runtime (`/app/[appId]`)

This route is where end-users actually use a deployed app. It loads the app's meta-config from the backend and hands off to the **runtime engine** (`components/views/`, `components/common/`, `lib/api/`) for rendering.

**Important:** the rendering logic does NOT live here. It lives in the shared runtime engine. This route is a thin loader that:
1. Fetches the `App` + its `DataLayer[]`, `Field[]`, `View[]` from the backend
2. Routes the user to the appropriate view based on URL state
3. Delegates rendering to view components in `components/views/<type>/`

If you're adding or changing how a view renders, you're working on the runtime engine — see [`../../CLAUDE.md`](../../CLAUDE.md) "Runtime engine" section, not this file.

## Conventions

- Page components in `app/(main)/**/page.tsx` should be **thin** — fetch + delegate to a feature component in `components/<feature>/`
- Platform pages never import from `components/builder/`. If you need a shared piece, lift it to `components/common/` or the runtime engine
- The Render-hosted backend is the "production-like" target — Platform's `app/[appId]` must work against either local or hosted backend (driven by `NEXT_PUBLIC_API_URL`)
