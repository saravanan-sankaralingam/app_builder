# Platform Home

The Home page is the **landing surface** of the Platform — what users see when they hit `/` after sign-in. It sits inside the Platform shell (top nav + left nav, see [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md)), so this doc only covers the **content area** of `/`.

Route: `/` → `app/(main)/page.tsx`. Left nav selection: **Home** (`topItems[0]` in `Sidebar.tsx`).

## Purpose

Personalised dashboard that lets a returning user pick up work without browsing into each app first. The widgets aggregate **across all apps the user has access to**:
- Items waiting for the user to act (queue)
- Items the user owns / is tracking (created by me)
- Conversations that mention the user (tagged comments)
- Personal todos (free-form, separate from the workflow items)
- Apps the user has touched recently

A **Customize** button is shown next to the welcome but is currently a placeholder — no panel, no behaviour. Re-introduce when the widget-management feature is specced.

## Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 👋 Welcome, {user}                                          [ Customize ]     │
├──────────────────────────────────────────────────────────────────┬───────────┤
│  Items in your queue (N)                                          │ My to-do  │
│  ┌──────────────────────────────────────────────────────────────┐ │  (N)      │
│  │ Item | Flow/App | From | Step/Status | Due by                │ │ ┌───────┐ │
│  │ rows…                                                         │ │ │ empty │ │
│  └──────────────────────────────────────────────────────────────┘ │ │ state │ │
│                                                                   │ └───────┘ │
│  Items created by me (N)                                          ├───────────┤
│  ┌──────────────────────────────────────────────────────────────┐ │ Tagged    │
│  │ icon · title · status badge · createdBy                       │ │ comments │
│  │ rows…                                                         │ │ ┌───────┐ │
│  └──────────────────────────────────────────────────────────────┘ │ │ feed  │ │
│                                                                   │ └───────┘ │
├──────────────────────────────────────────────────────────────────┴───────────┤
│  Recently accessed                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ app card │ │ app card │ │ app card │ │ app card │ │ app card │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Outer grid: 2-column main area on top (`lg:grid-cols-3` — left 2 cols / right 1 col), full-width Recently-accessed row below.
- Card surface comes from `components/home/HomeCard.tsx` (white bg, `border border-gray-200 rounded-xl p-5`).
- Page background: **`bg-gray-50`** (`#F7FAFF`).

## Sections and content

| Section | Component | Data | Notes |
|---|---|---|---|
| Welcome banner | `WelcomeBanner` | `userName` string | Greeting + Customize button (placeholder onClick) |
| Items in your queue | `ItemsInQueue` | `queueItems`, `queueTotalCount` | 5-column table (`Item · Flow/App · From · Step/Status · Due by`). Status badges via `StatusBadge`. Row click → TODO navigate to record. |
| Items created by me | `ItemsCreatedByMe` | `createdItems`, `createdTotalCount` | List of rows with icon, title, status badge, and creator name. Row click → TODO. |
| My to-do | `MyTodo` | `todoItems`, `todoTotalCount` | Currently empty → renders the "You're in the clear!" empty state with a Sparkles icon in an amber-100 disc (placeholder for the polished illustration). When data exists, renders a list. |
| Tagged comments | `TaggedComments` | `taggedComments` | Avatar + author + timestamp / message / linked-item pill (`KFA-12081 · 4.0 Product Issues`). The pill only renders when `linkedItem.code` is non-empty. |
| Recently accessed | `RecentlyAccessed` | `recentApps` | Responsive grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`). Each card: rounded square icon tile (h-9 w-9) + app name + meta line. |

### Status badge colors

Defined once in `components/home/StatusBadge.tsx`:

| Status | Style |
|---|---|
| New | `bg-blue-50 text-blue-700` |
| In progress | `bg-amber-50 text-amber-700` |
| Research | `bg-purple-50 text-purple-700` |
| Backlog | `bg-gray-100 text-gray-700` |
| Design | `bg-pink-50 text-pink-700` |
| Default State / Delivered Handoff | `bg-emerald-50 text-emerald-700` |

Unknown statuses fall back to gray.

### Count badges

The `(N)` suffix in each header is the **total** for the category, not just the rows currently rendered. E.g. `Items in your queue (99)` shows 10 rows but the badge says 99.

## Behavior

- **All click targets are TODO stubs** for now — buttons render in the right places but don't navigate yet.
- **Customize** — `onClick` is a `/* TODO */` no-op; the button is purely visual.
- **Empty states** — currently only `MyTodo` has an empty state designed (centered icon + "You're in the clear!"). Other widgets assume non-empty data.

## Conventions

- Page component (`app/(main)/page.tsx`) stays **thin** — it composes widgets, that's it.
- Widgets live in `components/home/*` and pull their data from `lib/mock/home.ts` directly (no props plumbed through the page). When the backend exists, swap those imports for hooks/queries; the page composition won't need to change.
- Home is in the **Platform** half of the codebase — must not import from `components/builder/`.
- Status colors are centralised in `StatusBadge.tsx`. Any new status names should be added there to keep the palette consistent.
- Selection in the left nav: **Home** is marked active when this route is open (handled by `Sidebar.tsx` via `pathname === '/'`).

## What's intentionally NOT implemented yet

- **Customize panel** — button renders, action is a stub.
- **Real data wiring** — all six widgets read from `lib/mock/home.ts`. No backend calls.
- **Click destinations** — row clicks don't navigate; replace the `/* TODO */` stubs as routes / record viewers come online.
- **Empty states for non-todo widgets** — only `MyTodo` has a designed empty state. The others assume content.
- **Polished illustration for the to-do empty state** — currently a Sparkles icon in an amber disc as a placeholder. Replace with the real "in the clear" artwork when ready.
- **User context** — `userName` is hard-coded in the page (`"Saravanan Sankaralingam"`). Swap for the real auth context when wired.

## Where this is implemented

- `app/(main)/page.tsx` — the route, composes the widgets.
- `components/home/HomeCard.tsx` — shared white-card surface + `HomeCardHeader`.
- `components/home/WelcomeBanner.tsx` — greeting + Customize button.
- `components/home/ItemsInQueue.tsx` — the 5-column queue table.
- `components/home/MyTodo.tsx` — todo list with empty state.
- `components/home/ItemsCreatedByMe.tsx` — created-by-me list.
- `components/home/TaggedComments.tsx` — tagged-comments feed.
- `components/home/RecentlyAccessed.tsx` — recently-accessed app grid.
- `components/home/StatusBadge.tsx` — shared status pill component + color map.
- `lib/mock/home.ts` — all mock data for the page.
