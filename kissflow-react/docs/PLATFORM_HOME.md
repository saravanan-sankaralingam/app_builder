# Platform Home

The Home page is the **landing surface** of the Platform — what users see when they hit `/` after sign-in. It sits inside the Platform shell (top nav + left nav, see [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md)), so this doc only covers the **content area** of `/`.

Route: `/` → `app/(main)/page.tsx`. Left nav selection: **Home** (`topItems[0]` in `Sidebar.tsx`).

> **Status:** the route currently renders `PlaceholderPage` with a Home icon. Everything below is being designed; sections marked **TBD** are placeholders the spec will fill in iteratively.

## Purpose

> *TBD — short description of what this page exists to do for the user. Examples of intent the spec will lock in:*
> - *Quick re-entry into recently-used apps?*
> - *Surface what needs the user's attention today?*
> - *Anchor for cross-app actions / search / starter content?*

## Layout

> *TBD — the rough top-down arrangement of the page (hero / cards / list / sections / etc.). Add the ASCII sketch here once decided.*

## Sections and content

> *TBD — for each section: what it shows, where the data comes from (mock vs API), order, empty state.*

## Behavior

> *TBD — click targets, hover affordances, state transitions, any popovers/modals owned by Home.*

## Conventions

- Page component (`app/(main)/page.tsx`) should stay **thin**. Fetching + composition happens there; the actual sections live in `components/home/` (to be created).
- Home is in the **Platform** half of the codebase — it must not import from `components/builder/`. Shared rendering pieces go to `components/views/`, `components/common/`, or `lib/api/`.
- Selection in the left nav: **Home** must be marked active when this route is open (handled today by `Sidebar.tsx` via `pathname === '/'`).

## What's intentionally NOT implemented yet

> *TBD — list any decisions deferred (e.g. real data wiring, personalization, A/B variants), so a future agent can tell "missing because deferred" apart from "missing by oversight."*

## Where this is implemented

- `app/(main)/page.tsx` — the route (currently a placeholder).
- `components/home/*` — feature components for the page (to be created as sections get specced).
- Any shared building blocks the page reuses live in `components/common/`, `components/views/`, `components/ui/`, or `lib/`.
