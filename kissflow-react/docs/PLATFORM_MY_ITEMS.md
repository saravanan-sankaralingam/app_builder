# Platform — My Items

> ⚠️ **Current state: visual placeholder only.** Like the Home page, this is
> the shape and look — not the real thing. Tabs switch and the left sidebar
> filters the visible list, but no data is fetched, no filters are wired,
> no clicks navigate, no statuses are real. A proper implementation
> (real assigned / created / watchlist queries, real status filters, real
> navigation, working empty / loading / error states) is planned as a
> follow-up.

Personal aggregation page that lets a user see every work item that has them on it — assigned, owned, or being watched — across all apps.

Route: `/my-items` → `app/(main)/my-items/page.tsx`. Left nav selection: **My Items** (`topItems[1]` in `Sidebar.tsx`).

## Three tabs

| Tab | What it shows | Right-side filters |
|---|---|---|
| **Assigned to me (62)** | Items currently in a step assigned to the user. | `Due by` chip (with red unread dot) + `All` dropdown |
| **Created by me** | Items the user originally created, regardless of where they sit in the workflow now. | `In progress / Not started / Completed` toggle + `Created · All` dropdown |
| **Watchlist** | Items the user has explicitly chosen to follow. | `In progress / Completed` toggle + `Created · All` dropdown |

Switching tabs **resets the selected app filter** in the sidebar back to `All items`.

The `Assigned to me` tab is the default landing state.

## Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ My items                                                                    │
│                                                                             │
│ [ Assigned to me (62) ] [ Created by me ] [ Watchlist ]   [ filters here ]  │
├──────────────────┬─────────────────────────────────────────────────────────┤
│  Sidebar (260px) │  Main content                                            │
│                  │                                                          │
│  [ All items ]   │  Tab-specific list:                                      │
│  Feedback App    │   • Assigned → 4-column row cards                        │
│  Procurement…    │   • Created  → 5-column row cards (with Progress bar)    │
│  Warehouse…      │   • Watchlist → empty-state illustration                 │
│  …               │                                                          │
└──────────────────┴─────────────────────────────────────────────────────────┘
```

- Page background: `bg-gray-50` (matches Home).
- Sidebar fixed width: `260px`. Sidebar is `bg-white` rounded card with selected item using `bg-blue-50 text-blue-700`.
- Main content area: vertical stack of row cards (`flex flex-col gap-3`).

## Cards

Both list cards share the same outer shell:
```
bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:shadow-sm
```

### Assigned-to-me card (4-column meta row)

| Title row | `[App icon]` + bold title |
| Meta row (4 fields) | App · Step · Initiated by · Due date |

### Created-by-me card (5-column meta row)

| Title row | `[App icon]` + bold title |
| Meta row (5 fields) | App · Step · Currently assigned to · Due date · Progress |

The **Progress** field renders a 1.5px tall gray-100 track with an orange-500 fill driven by `item.progress` (0–100). Width capped at `max-w-[120px]` so the bar doesn't dominate the card on wide screens.

The **App** field renders the app name followed by a small external-link icon — visual cue for "this app lives elsewhere."

The **Currently assigned to** / **Initiated by** fields render a small colored disc with the role's initial (e.g. `L` for "Lead", `M` for "Manager") followed by the role name. These are intentionally **not** real user avatars in the screenshot — they're step / role colors, not people.

## Sidebar app filters

- Always shows **All items (totalCount)** at the top, with a `LayoutGrid` icon.
- Then one row per app in `apps` (from `lib/mock/my-items.ts`) **that has a non-zero count for the active tab** — apps with 0 items in the current tab are hidden.
- Selected row: `bg-blue-50 text-blue-700 font-medium`. Inactive: `text-gray-700 hover:bg-gray-50`.
- Each row: icon · name (truncated) · `(count)` aligned right.

The counts shown in the sidebar swap between `assignedCount` and `createdCount` (from each `AppFilter`) depending on the active tab. Watchlist currently has no app counts — the sidebar just shows `All items (0)`.

## Watchlist empty state

When the Watchlist tab is active (and it is, by default since the watchlist is empty in this scaffold):

```
                    [ illustration ]

              Your watchlist is empty

   Watch items you want to follow and keep track of their progress.
```

The illustration is a placeholder — a small white clipboard with a green tab on top + a blue pen-badge disc, all on a rounded gray-100 background. Replace with the polished asset later.

## Filter chips (visual-only)

Every right-side filter on the header is a visual stub:
- `Due by` + red dot — purely decorative; no calendar picker.
- `All` dropdown — no menu opens on click.
- `In progress / Not started / Completed` toggle — clicking changes the selected pill's state, but doesn't filter any data.
- `Created · All` chip — purely decorative.

All filter state is held in local `useState` on the page component.

## What's intentionally NOT implemented yet

- **Real data wiring** — `assignedItems`, `createdItems`, and `apps` are static fixtures in `lib/mock/my-items.ts`. No API, no auth, no cross-app aggregation.
- **Click destinations** — every card's `onClick` is a `/* TODO */` stub.
- **Filter functionality** — all right-side filters and the status toggle change local state but don't filter the visible list.
- **App filter behaviour** — the sidebar's per-app filtering DOES work locally (filters `assignedItems` / `createdItems` by `appId`), but only because the arrays already include `appId`. This is the only "real" interaction on the page.
- **Watchlist data** — `tabCounts.watchlist = 0` is hard-coded; the empty state is the only state. No populated-watchlist design yet.
- **Loading / error states** — none designed.
- **Avatars** — `Initiated by` / `Currently assigned to` use coloured-disc-with-initial placeholders. The screenshot's real avatars come from a user store that doesn't exist yet.
- **External-link icon next to App name** — currently a static decoration; doesn't actually link anywhere.
- **Pagination / infinite scroll** — the lists render as-is. Long lists will overflow the viewport without scroll constraints.
- **Polished illustration for the watchlist empty state** — currently a hand-built clipboard+pen mockup. Swap for the real asset later.
- **No tests** — none.
- **Mobile / responsiveness** — the 260px sidebar + multi-column cards assume desktop.

## Where this is implemented

- `app/(main)/my-items/page.tsx` — the route. Holds local state (active tab, selected app, status filters) and composes the sections.
- `components/my-items/MyItemsHeader.tsx` — title + tab pills + tab-specific right-side filters. Exports `MyItemsTab`, `CreatedStatus`, `WatchlistStatus` types.
- `components/my-items/MyItemsSidebar.tsx` — `All items` + per-app filter list. Reads `countKey` to know which AppFilter count to display.
- `components/my-items/AssignedItemCard.tsx` — 4-column meta card for the Assigned tab.
- `components/my-items/CreatedItemCard.tsx` — 5-column meta card (with Progress bar) for the Created tab.
- `components/my-items/WatchlistEmpty.tsx` — empty-state illustration + copy for the Watchlist tab.
- `lib/mock/my-items.ts` — all mock data: `apps`, `assignedItems`, `createdItems`, and a `tabCounts` constant for the tab/sidebar badges.
