# Platform Explorer

> ⚠️ **Current state: visual scaffold, partial wiring.** The header, toolbar,
> grid, and accordion-by-type all render against the real `/api/apps` data
> today. But Template gallery, More-options, and Pin persistence are stubs;
> role-aware click targets aren't implemented; and several sort options share
> the same `updatedAt` fallback because the backend doesn't have separate
> `publishedAt` / `lastOpenedAt` fields yet. A proper implementation (real
> per-user role, working Template gallery, pin persistence, distinct sort
> semantics) is planned as a follow-up.

The Explorer is the **app-discovery surface** of the Platform — the comprehensive index of every app the user has access to. It sits inside the Platform shell (top nav + left nav, see [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md)), so this doc only covers the **content area** of `/explorer`.

Route: `/explorer` → `app/(main)/explorer/page.tsx`. Left nav selection: **Explorer** (see `Sidebar.tsx`).

## Purpose

Explorer is the **browsable library of every app the user has access to** — the comprehensive index that Home's *Recently accessed* row only samples, and the inverse of Marketplace (installed vs installable).

It serves both audiences from the same surface:
- **End-users** open an app to use it (→ app runtime, `/app/[appId]`)
- **Builders / admins** open an app to edit it (→ Builder, `/builder/[appId]`)

Today the card body always opens the runtime; the **bottom-right blue Edit button** opens the Builder in a new tab. **Role-aware** primary click target (admin → Builder, member/viewer → runtime) is deferred — needs a role field on `AppData` first.

**What Explorer is NOT:**
- Not a *task* surface (My Items owns items-on-my-plate)
- Not a *catalog* surface (Marketplace owns apps the user could install)
- Not a *highlight reel* (Home's `Recently accessed` owns the recent ~5)

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [White header card — Retail One pattern]                        │
│  Explorer                          [Template gallery] [Create]  │
│  Live · Managed by me · Others                                  │
├─────────────────────────────────────────────────────────────────┤
│ Search…                          Sort [Type ▾]   [list][grid]   │
│                                                                 │
│ ┌─ Card ─┐ ┌─ Card ─┐ ┌─ Card ─┐ ┌─ Card ─┐ ┌─ Card ─┐         │
│ │        │ │        │ │        │ │        │ │        │         │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│ (or, when sort = Type) Accordion sections grouped by app type   │
└─────────────────────────────────────────────────────────────────┘
```

- Page background: **`bg-gray-200` + `min-h-[calc(100vh-50px)]`** (`ExplorerView.tsx:162`). Deliberately darker than the other Platform pages (which use `bg-gray-50`) — Explorer matches the Retail-One-runtime tone because the white header card is the focal surface.
- Header wrapper: `px-5 py-3` (`ExplorerView.tsx:164`) — mirrors Retail One's outer header padding (`app/(main)/app/retail-one/page.tsx:56`).
- Content wrapper: `px-6 pb-6 pt-3 space-y-6` (`ExplorerView.tsx:172`). `pt-3` (12px) + the header's `py-3` (12px) = **24px gap** between header card and toolbar; `space-y-6` (24px) between toolbar and the grid.

## Header card

`components/explorer/ExplorerHeader.tsx`. Mirrors the Retail One header pattern (`app/(main)/app/retail-one/page.tsx:56-213`).

- White card: `bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between`
- **Top row** — title left, actions right:
  - **Explorer** title — `text-lg font-semibold text-gray-900` (no icon; intentional vs Retail One which has the ShoppingBag glyph)
  - **Template gallery** — secondary button. Icon is an inline multi-color SVG (red triangle + green circle + blue square) because lucide has no native multi-colour shapes glyph. `onClick` is a TODO stub.
  - **Create** — primary `bg-blue-600` button, links to `/create`.
- **Bottom row** — filter tabs, underline-on-active (Retail One pattern):
  - Each tab: `relative px-1 pt-1 pb-3 text-sm`
  - Active: `text-gray-900 font-medium` + `after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900`
  - Inactive: `text-gray-600 font-normal hover:text-gray-900`
  - Three tabs: **Live · Managed by me · Others** (default: `Live`)

### Filter tab → API mapping

| Tab | Maps to | Source |
|---|---|---|
| Live | apps with `status === 'live'` + the static `retail-one` demo prepended | `ExplorerView.tsx:93-98` |
| Managed by me | apps with `status === 'draft'` | `ExplorerView.tsx:99-103` |
| Others | everything not already shown | `ExplorerView.tsx:104` |

`Managed by me` is currently a stand-in for "draft status" — real per-user role isn't wired yet.

## Toolbar

`components/explorer/ExplorerToolbar.tsx`. Single row: search left, sort + view toggle right.

### Search

- Input: `h-9`, `bg-white border border-gray-300 rounded-lg`; hover `border-gray-400`; focus `border-blue-500` + `ring-1 ring-blue-100`
- Placeholder: `"Type here to search"`
- Search icon (absolute-positioned inside the input): `text-gray-700`
- Filters `name`, `description`, and `createdBy` via case-insensitive `includes` (`ExplorerView.tsx:82-90`)

### Sort dropdown

- Trigger: `h-9 w-auto gap-2 rounded-lg border border-gray-300 bg-white px-3`. Single-line label: `Sort {value}` — `"Sort"` prefix in `text-gray-500 font-normal`, value in `text-gray-900 font-medium`, chevron is `text-gray-500 size-4`.
- **Trigger ↔ popover decoupled.** shadcn's default `SelectContent` binds its width to `w-[var(--radix-select-trigger-width)]` (`components/ui/select.tsx:67`), which would shrink the menu whenever a short option like `Name` is selected. Overridden here with `className="w-56"` on `<SelectContent>` so the popover stays a fixed 224px regardless of trigger width. **Don't remove that override.**
- Six options:
  | Value | Label | Sort behaviour |
  |---|---|---|
  | `recent` | Recently opened (default) | `updatedAt` desc |
  | `name` | Name | alphabetical |
  | `type` | Type | alphabetical within type; **triggers accordion grouping** (see below) |
  | `created` | Recently created | `createdAt` desc |
  | `published` | Recently published | `updatedAt` desc (no separate `publishedAt` today) |
  | `modified` | Recently modified | `updatedAt` desc |

### View toggle

- Pill bar: `rounded-full border border-gray-200 bg-white p-0.5`
- Two buttons: list / grid, each `h-7 w-9 rounded-full`
- Active: `bg-purple-100 text-purple-700` (lavender tint, matches reference screenshot)
- Inactive: `text-gray-500 hover:text-gray-700`

## App grid + card

`components/explorer/AppsGrid.tsx` + `components/explorer/AppCard.tsx`.

Grid layout:
- Grid mode: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5`
- List mode: `flex flex-col gap-3`

### Grid card

Fixed `h-[220px]`, `flex flex-col`, `bg-white rounded-xl border border-gray-300 p-5`.
Hover: `border-gray-400` + `shadow-[0_4px_12px_rgba(0,0,0,0.06)]` + `-translate-y-0.5`.

| Element | Styling |
|---|---|
| **Top-right cluster** (hover-only) | `absolute top-5 right-5 flex items-center gap-2`. Top-aligned with the app icon at `p-5`. |
| ↳ Pin button | `h-7 w-7 rounded-full`, default `text-gray-500`. Hover: `bg-gray-200 text-yellow-500`. Pinned state (`isPinned` local state): `text-yellow-500` with `fill-current` on the glyph. |
| ↳ MoreVertical button | `h-7 w-7 rounded-full text-gray-700`. Hover: `bg-gray-200`. Click is a TODO stub. |
| **Bottom-right Edit button** (hover-only) | `absolute bottom-5 right-5 h-7 w-7 rounded-full bg-blue-600` solid circle, white `Pencil` glyph (`h-3.5 w-3.5`). Click opens `/builder/[appId]` in a new tab. |
| **App icon** | `w-7 h-7 rounded-md mb-3`, bg color from `app.iconBg` (hex), glyph `h-4 w-4 text-white` |
| **App name** | `text-base font-semibold text-gray-900 line-clamp-2 leading-snug`, `title={app.name}` for full-name tooltip on hover |
| **Description** | `text-xs font-normal text-gray-700 leading-relaxed line-clamp-2 h-10` (fixed 40px so cards align even when description is short), `title={app.description}` |
| **Created by block** (pinned to bottom via `mt-auto pr-10`) | Label: `text-[11px] font-normal text-gray-700` · Name: `text-[11px] font-medium text-gray-700 truncate mt-1` |

`pr-10` on the Created-by block reserves clearance for the bottom-right edit circle. All three hover-buttons sit on the card's `p-5` grid (`top-5 right-5`, `bottom-5 right-5`) so they align with the app icon at the top-left.

### List card

- `flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300`; hover `border-gray-400` + soft shadow
- Icon container: `w-11 h-11 rounded-xl`, glyph `h-5 w-5`
- Edit pencil on hover at top-right (no blue circle treatment)
- **Pin / More / blue-circle Edit redesign is grid-only.** The list view hasn't been retuned yet.

## Sort-by-Type — accordion view

When `sortBy === 'type'`, the flat grid is swapped for `components/explorer/AppsGroupedByType.tsx`. Five sections, fixed order:

```
> Application
> Process
> Board
> Dataset
> List
```

- All sections **expanded by default** (`useState<Set<AppGroupType>>(new Set(APP_GROUP_TYPES))`)
- Click a row to toggle. Chevron rotates `-rotate-90` when collapsed (`ChevronDown` from lucide).
- Open section renders the same `<AppsGrid>` so grid/list view mode still applies inside each group.
- Empty sections still show their header (matches the reference behaviour).

### How an app's type is decided

`AppData.type?: AppGroupType` (defined in `types/app.ts:6-9`). Values: `'Application' | 'Process' | 'Board' | 'Dataset' | 'List'`.

- Static `retail-one` is pinned to `'Application'` (`ExplorerView.tsx:66`)
- Every backend app is bucketed deterministically by hashing its UUID → `deriveAppType()` (`ExplorerView.tsx:19-25`). Stable across renders so an app doesn't jump categories.
- The **backend doesn't store an app type yet** — when it does, swap `deriveAppType()` for the real field. The backend's `App.type` is only `'app' | 'portal'` today, not the 5 categories used by the accordion.

## Data wiring

`components/explorer/ExplorerView.tsx`:
- Fetches from `listApps()` (`lib/api/apps.ts:60`) on mount.
- Prepends one static app (`retail-one`) in front of the API list so the in-tree demo always appears under **Live** (`ExplorerView.tsx:58-68`).
- Transforms `App` → `AppData` (`types/app.ts`), resolving the icon name string to a lucide component via `getIconByName()` (`lib/icons.ts:154`).
- Applies **search → tab filter → sort** in that order, memoised on `[apps, searchQuery, activeFilter, sortBy]`.

### Per-app icon + colour storage

Stored **in the backend**, not in code:

| Where | What |
|---|---|
| `backend/prisma/schema.prisma:59-60` | `icon String @default("Folder")` · `iconBg String @default("#3b82f6") @map("icon_bg")` |
| `backend/src/modules/app/app.schema.ts:15-16` | Zod validation: `icon` is any string, `iconBg` must match `#RRGGBB` |
| `lib/api/apps.ts:18-19` | API returns both on every App |
| `lib/icons.ts` | Maps the `icon` string → lucide component (`Folder` if unknown) |

Updating an app's visual is a PUT to `/api/apps/:id` with `{icon, iconBg}` — no auth required today. The Managed-by-me draft apps were seeded with varied pairs on 2026-06-22:

| App | icon | iconBg |
|---|---|---|
| Expense management app | Wallet | `#f59e0b` amber |
| Build a Employee Service | Users | `#6366f1` indigo |
| Employee Management | User | `#10b981` emerald |
| Time-off Management | Calendar | `#8b5cf6` purple |
| Test App Sara | Zap | `#ec4899` pink |
| Expense Management (BRD) | CreditCard | `#ef4444` red |
| My Test App | Star | `#06b6d4` cyan |
| Test App | Briefcase | `#14b8a6` teal |

## Dropdown popover theming (global side-effect)

The Sort dropdown styling change was promoted to a global theme tweak — applied to **all Selects and DropdownMenus** across the app (not just Explorer):

- Hover (focused) row: `focus:bg-gray-200` (was `focus:bg-accent`)
- Text colour no longer shifts on hover (the old `focus:text-accent-foreground` was dropped)
- Selected indicator (CheckIcon / CircleIcon): `text-green-500`
- Destructive-variant items in DropdownMenu keep their red focus bg/text — only the default variant retuned

Files touched:
- `components/ui/select.tsx:115`, `:125`
- `components/ui/dropdown-menu.tsx:77`, `:95`, `:103`, `:131`, `:138`, `:214`

This change is visible in the profile dropdown in `TopBar.tsx:108-156` and any other Select / DropdownMenu in the app.

## Conventions

- Explorer is in the **Platform** half of the codebase — must **not** import from `components/builder/`
- Page component (`app/(main)/explorer/page.tsx`) stays **thin** — composes `<ExplorerView>` from `components/explorer/`
- Selection in the left nav: **Explorer** is marked active when this route is open (handled by `Sidebar.tsx`)
- Card hover-only buttons (Pin / More / Edit) all use `opacity-0 group-hover:opacity-100` on the card's `group` — keep this pattern when adding new card-level actions
- The Sort dropdown's `<SelectContent className="w-56">` is the explicit per-instance override that decouples popover width from trigger width. **Don't remove it.**
- Static demo apps (currently just `retail-one`) live at the top of the `useMemo` in `ExplorerView.tsx` — add new ones there if you want them to appear regardless of API state

## What's intentionally NOT implemented yet

- **Role-aware primary click target** — every card body opens runtime today; Builder is via the edit button only. Needs a per-app role field on `AppData`.
- **Template gallery button** — renders but `onClick` is undefined.
- **MoreVertical menu** — button renders, `onClick` is a TODO stub. No menu opens.
- **Pin persistence** — `isPinned` is local `useState` per card; not stored anywhere, lost on remount.
- **"Managed by me" semantics** — currently `status === 'draft'`. Once auth lands, it should mean "apps owned/admin'd by current user".
- **`publishedAt` / `lastOpenedAt` fields** — sort options *Recently opened*, *Recently published*, and *Recently modified* all fall back to `updatedAt`. Distinct semantics require new backend fields.
- **App type in backend** — currently derived by hash on the frontend; the backend's `App.type` is only `'app' | 'portal'`, not the 5 categories the accordion uses.
- **List view for the new card design** — Pin / More / blue-circle Edit redesign is grid-only. List rows still show only the pencil edit icon at top-right.
- **Loading / error / empty states** — basic spinner and "No apps found" exist but aren't designed.
- **URL state for filters / search / sort / view mode** — all local component state today; refresh resets to defaults.
- **No tests.**
- **Mobile / responsiveness** — fixed `h-[220px]` cards and the 5-column grid assume desktop.

## Where this is implemented

- `app/(main)/explorer/page.tsx` — thin route entry, composes `<ExplorerView>`
- `components/explorer/ExplorerView.tsx` — top-level container, data fetching, filter + sort + type-assignment logic, conditional render between flat grid and accordion-by-type
- `components/explorer/ExplorerHeader.tsx` — white header card (Retail One pattern), title + Template gallery + Create + filter tabs
- `components/explorer/ExplorerToolbar.tsx` — search input + Sort dropdown + view toggle
- `components/explorer/AppsGrid.tsx` — responsive grid (or list flex)
- `components/explorer/AppCard.tsx` — single card with hover actions (Pin / More / Edit)
- `components/explorer/AppsGroupedByType.tsx` — accordion sections per type (only renders when `sortBy === 'type'`)
- `types/app.ts` — `AppData`, `AppGroupType`, `APP_GROUP_TYPES`
- `lib/icons.ts` — `getIconByName()` resolves backend icon string → lucide component
- `lib/api/apps.ts` — `listApps()` (and `updateApp()` for seeding varied icons)
