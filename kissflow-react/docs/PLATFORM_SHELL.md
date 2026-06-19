# Platform Shell

UI specs for the Platform's chrome (top nav, left nav, anything else outside the route content). These specs apply to all `app/(main)/*` routes — see the [Platform code conventions](../app/%28main%29/CLAUDE.md).

> **Scope note:** This is the **Platform** shell only. The Builder route (`app/builder/[appId]/`) uses its own shell (`BuilderLayout.tsx`) and is documented separately.

## Top nav

**Layout (visual left → right):**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]              [Search]              [Help docs] [Agent help] [Notif] [Profile] │
└─────────────────────────────────────────────────────────────────────────────────────┘
  left end             center                ──── right cluster ────       right end
```

- **Left end:** account's logo. Served from `public/Logo.svg`. The TopBar renders it at `h-7` (28px height).
- **Center:** Search (scope TBD — to be defined when search is built). Shows a `Cmd+E/Ctrl+E` shortcut hint inside the input. The hint is **plain monospace text** (`text-[11px] text-gray-700 font-mono`) — no button background, border, or shadow.
- **Right cluster** (left → right): Help docs · Agent help · Notification · Profile photo
- **Right end:** Profile photo of the currently logged-in user

### Container styling

The `<header>` element is **solid white** with a soft drop shadow and a positioned stacking context so it sits above the left nav (whose expanded overlay would otherwise hide the shadow):

```
className: relative z-40 border-b border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]
```

- `relative z-40` — explicit stacking context. Required because the left nav uses `absolute z-30` for its overlay; without `z-40` here, the left nav's expanded panel would render *over* the top nav and hide its drop shadow.
- `bg-white` — **solid white only** (no `bg-white/80` translucency, no `backdrop-blur-sm`). Rule: the top nav stays opaque so its shadow reads cleanly against everything beneath.
- `border-b border-gray-100` — hairline divider at the bottom.
- `shadow-[0_4px_12px_rgba(0,0,0,0.04)]` — soft, diffuse drop shadow (4px down, 12px blur, 4% opacity). Falls onto the top edge of the left nav when expanded, reinforcing the "top nav is above" depth cue. Tuned to be subtle — if it ever feels heavy, lower opacity to `0.02–0.03`; if you want it softer/further, bump blur to `16–20px`.

### Right cluster styling rules

- Each of the 3 icon buttons (Help docs, Agent help, Notification) is **`h-9 w-9`** with **`rounded-full`** (circular hover background).
- Default icon color: **`text-gray-700`**. Hover icon color: **`text-gray-900`**. Hover background: **`bg-gray-100`**.
- Icon size inside each button: **`h-[18px] w-[18px]`**.
- Spacing between the 3 icons: **`gap-2`** (8px).
- Profile avatar gets an extra **`ml-2`** (8px) so total Bell → Avatar gap is 16px (more breathing room than between the icons).
- Profile avatar **focus ring is removed** (`focus:outline-none focus-visible:outline-none`) — no keyboard focus indicator. (If keyboard accessibility matters later, switch to a `data-[state=open]` style instead of removing entirely.)
- **No vertical separator** between the right cluster and the avatar — spacing alone separates them.

### Right cluster items

| Position (L→R) | Item | Click behavior |
|---|---|---|
| 1 (leftmost of cluster) | Help docs | Navigates to `https://community.kissflow.com/` — **opens in a new tab** (`target="_blank"`) |
| 2 | Agent help | Opens the **Agent chat window as a popover anchored to the bottom-right corner of the viewport** (not anchored to the icon). The chat window is **persistent across page navigation** until the user explicitly dismisses it. |
| 3 | Notification | Opens the **notification callout** (popover). See "Notification callout" section below. |
| 4 (rightmost) | Profile photo | Opens the profile dropdown — see below |

## Profile dropdown (click profile photo)

Dropdown anchored to the avatar (`align="end"`, `sideOffset={8}`). Implementation: `components/layout/TopBar.tsx`. 7 items in this exact order with separators after items 3 and 6:

```
┌──────────────────────────────┐
│  [UserRoundCog]  My settings        │
│  [Palette]       Themes             │
│  [Plug]          Connector builder  │
├──────────────────────────────┤  ← separator
│  [Server]        Environments       │
│  [UserRoundCog]  Account administration │
│  [ShieldCheck]   Account governance │
├──────────────────────────────┤  ← separator
│  [LogOut]        Sign out (red)     │
└──────────────────────────────┘
```

### Item order (verbatim, must be preserved)

| # | Item | Icon (lucide) | Notes |
|---|---|---|---|
| 1 | My settings | `UserRoundCog` | |
| 2 | Themes | `Palette` | |
| 3 | Connector builder | `Plug` | |
|   | — separator — | | |
| 4 | Environments | `Server` | |
| 5 | Account administration | `UserRoundCog` | **same icon as My settings — placeholder, designer to differentiate** |
| 6 | Account governance | `ShieldCheck` | |
|   | — separator — | | |
| 7 | Sign out | `LogOut` | Uses `variant="destructive"` on `DropdownMenuItem` — turns label + icon red |

### Rules

- **Order is exact** — these seven items, in this order, with separators after item 3 and item 6.
- **Every item has an icon** — no text-only items.
- **Sign out uses destructive variant** — handled by shadcn `DropdownMenuItem`'s `variant="destructive"` prop, which also styles the icon (so the icon must not carry its own `text-*` class).
- Spacing inside each item: `gap-3 py-2.5 px-2.5` for breathing room.
- Content width: `min-w-[220px] p-2` on `DropdownMenuContent`. Separators use `my-2`.
- Click handlers other than Sign out's destructive styling are currently **stubs** (`onClick={() => { /* TODO */ }}`).

## Notification callout

Popover anchored to the Bell icon (`align="end"`, `sideOffset={8}`). Implementation: `components/notifications/NotificationCallout.tsx`.

```
┌──────────────────────────────────────────────────┐
│  Notification     Mark all as read    [⚙]         │  ← single header row
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐  │
│  │ [Avatar]  Sales App                     ●  │  │  ← card (gray-50 bg)
│  │           John assigned a deal              │  │     • avatar (user)
│  │           2 min ago                         │  │     • app name (gray-700)
│  └────────────────────────────────────────────┘  │     • message (gray-900)
│  ┌────────────────────────────────────────────┐  │     • time (gray-700)
│  │ … more cards …                              │  │     • blue dot = unread
│  └────────────────────────────────────────────┘  │
│  (FIXED height: h-[360px], scrolls inside)        │
├──────────────────────────────────────────────────┤
│  Show all                                         │  ← link → /notifications
└──────────────────────────────────────────────────┘
```

**Rules:**
- Width: **380px**
- **Single header row**: title on the left; "Mark all as read" link + settings icon button on the right (`gap-2` between them).
- **No separate row for "Mark all as read"** — it lives in the header row.
- Card background: **`bg-gray-50`**, hover `bg-gray-100`.
- Card height **varies with message length** (no fixed height).
- Scrollable list is a **fixed height** — `h-[360px]` (not `max-h`). Cards scroll inside; the callout itself doesn't grow with content. This is important because Radix `ScrollArea` needs a definite height for its viewport (`size-full`) to constrain properly.
- "Mark all as read" updates `isRead` on all visible notifications client-side via component state (no backend yet).
- "Show all" navigates to `/notifications`.
- Settings icon → currently stub (TBD where it routes).

### Card anatomy (left to right)

1. **User avatar** (initials, colored bg) — represents the user behind the notification
2. **App name** (small, **`text-gray-700`**, font-medium) — which app the notification is from
3. **Message** (`text-gray-900`) — the notification text (primary content)
4. **Time** (small, **`text-gray-700`**) — relative time, e.g. "2 min ago"
5. **Unread dot** (blue, top-right of card) — only when `isRead === false`

Same card component (`NotificationCard.tsx`) is reused on the full Notification Center page. There it renders wider because the parent container is `max-w-4xl` instead of `380px`.

### Mock data

`lib/mock/notifications.ts` exports `mockNotifications: Notification[]` — 10 hardcoded entries with `{ id, appName, userInitials, userColor, message, time, isRead, isMention }`. Two of them have `isMention: true`. Replace with real API data when the backend exists.

## Notification Center (full page)

Route: `/notifications` → `app/(main)/notifications/page.tsx`. Uses the Platform shell (top + left nav stay visible); **nothing is selected in the left nav**.

```
┌─────────────────────────────────────────────────────────────────────┐
│  [←]  Notification                                                   │  ← header: white bg, left aligned
├─────────────────────────────────────────────────────────────────────┤
│                       (gray-100 layer)                               │
│                                                                      │
│      ┌──────────────────────────────────────────────────────────┐   │
│      │  All  Unread  Mentions       Mark all as read   [⚙]      │   │  ← section top row (border-b)
│      ├──────────────────────────────────────────────────────────┤   │
│      │  ┌──────────────────────────────────────────────────┐    │   │
│      │  │ Notification card                                  │    │   │  ← scrolls inside the section,
│      │  └──────────────────────────────────────────────────┘    │   │     not on the page
│      │  …                                                       │   │
│      └──────────────────────────────────────────────────────────┘   │
│      (white section, centered, max-w-4xl, rounded-lg)               │
└─────────────────────────────────────────────────────────────────────┘
```

**Layout rules:**
- Page background: **`bg-gray-100`**.
- Page layout: `flex flex-col` so the header pins to the top and the body fills the remaining height.
- **Header bar**: white background, contains only `[←] back arrow + "Notification" title`. **Left-aligned** with `px-6` (no centering). Bottom border.
- **Body wrapper**: `flex-1 overflow-hidden px-6 py-6` — takes remaining height but does **not** scroll.
- **White section** (`bg-white rounded-lg border border-gray-100`): **centered** (`mx-auto`), `max-w-4xl` (896px). Contains both the tabs+actions row and the scrollable list.

**Section top row** (inside the white section):
- Tabs on the **left**: All, Unread, Mentions.
- Actions on the **right**: "Mark all as read" link + settings icon button (`gap-2` between them).
- Bottom border separates this row from the scrollable list.

**Scrolling rule:**
- **Only the section scrolls.** The page itself, header, and section top row do not scroll. Implemented by:
  - Outer body wrapper: `flex-1 overflow-hidden`
  - White section: `h-full flex flex-col overflow-hidden`
  - Scrollable inner: `flex-1 overflow-y-auto`

**Tabs:**
- **All** — show every notification
- **Unread** — filter `!isRead`
- **Mentions** — filter `isMention`
- Active tab: `border-b-2 border-blue-600 text-blue-600 font-medium`. Inactive: `text-gray-600`.

**Actions:**
- **Mark all as read** — wired to component state; marks all loaded notifications as `isRead = true` immediately. No backend.
- **Settings icon** — stub.
- **Back arrow** — `router.back()` (browser history).
- **Empty state** — centered "No notifications" inside the scrollable area.

## Left nav

The left navigation rail. Implementation: `components/layout/Sidebar.tsx`. Used by all `app/(main)/*` routes via the Platform shell (`AppLayout.tsx`).

### Width and expand/collapse model

- **Collapsed width:** `50px` (`w-[50px]`) — matches the AppLayout grid column.
- **Expanded width:** `240px` (`w-60`).
- **Trigger:** hover (`onMouseEnter` on the nav → expand; `onMouseLeave` → collapse).
- **Also collapses:** when the user clicks any nav item (`onClick` handler → collapse).
- **Width + shadow transition:** `transition-[width,box-shadow] duration-200`.
- **Expanded shadow:** `shadow-[4px_0_24px_rgba(0,0,0,0.06)]` — soft right-side glow lifting it over the main content.

### Overlay (not push)

The expanded nav **overlays** the main content; the page does not reflow.

Implementation:
- Outer wrapper: `<div className="relative h-full">` — fills the 50px grid cell from `AppLayout`.
- Inner `<nav>`: `absolute left-0 top-0 bottom-0 z-30 overflow-hidden`. Width animates between 50px and 240px. The extra 190px when expanded extends **over** the main content area; the grid still reserves only 50px so the main content doesn't shift.
- z-index: nav at `z-30`, top nav at `z-40` (so the top nav's drop shadow falls onto the nav's top edge — not the other way around).

### Item structure (`NavButton`)

Each item is a `<Link>` styled as a row that's identical-shape across collapsed and expanded modes — only the visibility of the label changes.

| Class | Why |
|---|---|
| `flex items-center h-8 rounded-lg` | 32px-tall row, rounded highlight |
| `mx-[9px]` | horizontal gutter so the row is 32px wide in the 50px collapsed nav `(50 − 9 − 9 = 32)` and inset evenly when expanded |
| `<div className="w-8 flex items-center justify-center flex-shrink-0">` | fixed-width icon column |
| `<Icon className="h-[18px] w-[18px]" />` | 18px icon, centered in the 32px column |
| `<span className="text-sm ... opacity-0/100">` | label, opacity-transitioned (150ms) on expand, `pointer-events-none` when hidden |

**Icon X position is the same in both modes** — `mx-[9px]` + `w-8` icon container with `justify-center` puts the icon's center at `9 + 16 = 25px` from the nav's left edge whether the nav is 50px or 240px wide. **Do not change this without recomputing.**

### Strokes and colors

- **Stroke width:** `1.5` for unselected items, `2` for the active item.
- **Default state:** `text-gray-700`. **Hover:** `text-gray-900` with `bg-gray-100/70`.
- **Active state:** `bg-gradient-to-br from-purple-600 to-blue-400 text-white` — diagonal "twilight" gradient (purple-600 top-left → blue-400 bottom-right). Replaces the older flat `bg-blue-600`. White text reads on both ends (purple-600 ~4.4:1, blue-400 ~3.5:1).

### Vertical structure (top → bottom)

```
Home
My Items
─── SectionDivider (label: "Pinned" if any, else "Recent") ───
[Pinned section — only when hasPinned]   ← scrolls inside, max-h = calc(100% - 150px)
[SectionDivider (label: "Recent") — only when hasPinned]
[Recent section]                          ← flex-1, min-h-0, overflow-y-auto
─── SectionDivider (no label) ───
Explorer
Create new
─── SectionDivider (no label) ───
Marketplace
[Kissflow brand mark]                     ← public/kissflow-logo.svg, h-5 w-5
```

- Items use `gap-2` on the nav's flex container (8px between rows).
- Bottom group has its own flex container so the brand mark sits below Marketplace.

### Pinned vs Recent rules

| Rule | Detail |
|---|---|
| Pinned section is hidden when empty | When `pinnedApps.length === 0`, no header, no items, no separator before it. The Recent section's "Recent" pill takes the first divider's slot instead. |
| Recent always visible | At least 3 items fit; if Recent has fewer (e.g., just Retail One today), the section still occupies its natural height inside the middle area. |
| Pinned can grow until it would shrink Recent below 3 items | Constraint expressed as `style={{ maxHeight: 'calc(100% - 150px)' }}` on the Pinned scroll container. 150px ≈ 3 items + section divider. |
| Beyond Pinned's max | Pinned **scrolls inside itself** (`overflow-y-auto`). Users can keep pinning. |
| Recent overflow | Recent itself is `flex-1 overflow-y-auto` — scrolls if its content is taller than the remaining space. |

### `SectionDivider` (line ↔ pill, fixed-height slot)

Fixed `h-5 my-1` (28px outer height) container that swaps content between collapsed and expanded states **without changing its own footprint** — so hovering the nav doesn't shift any items above or below it.

| Mode | Renders |
|---|---|
| Collapsed | Centered thin line (`mx-auto w-6 h-px bg-gray-200/80`) — 24px wide, gray-200/80 |
| Expanded **without** a label | Full-width line (`mx-3 flex-1 h-px bg-gray-200/80`) |
| Expanded **with** a label | `[pill] ─────────` — the label pill (`rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-3`) followed by an 8px gap, then the line filling the rest of the row |

**Rule (no jump):** the divider's outer height is the same in all three states. The line ↔ pill swap is done **inside** the same fixed slot, so neighbouring items stay anchored when the nav expands or collapses.

### Section labels

- Shown **only when expanded**. Hidden in collapsed mode (no DOM presence; `SectionDivider` falls back to the line form).
- Style: pill — `rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider`.
- Used for: **"Pinned"** and **"Recent"** sections (the labels appear in the dividers above each section, not as separate rows).

### Mock data (current state)

`Sidebar.tsx` holds two arrays as in-file constants:
- `pinnedApps: NavItem[] = []` — empty (the pin/unpin feature is **not yet built** and will be implemented in a follow-up).
- `recentApps: NavItem[]` — currently `[Retail One]`. Will grow as the pin/unpin feature ships and we test more states.

When the pin/unpin feature lands, these will move to component state (or a store) and update dynamically.

### Brand mark

Sits at the very bottom of the nav, below Marketplace:
```tsx
<div className="mt-3 mx-[9px] w-8 flex items-center justify-center">
  <img src="/kissflow-logo.svg" alt="Kissflow" className="h-5 w-5" />
</div>
```
- Same `mx-[9px] w-8` column treatment as nav items, so the logo X position matches Home/Marketplace/etc. (~25px from nav left edge).
- Doesn't change size or position between collapsed and expanded modes.
- Source SVG is 20×20; the wrapper holds it at h-5 w-5.

### What's intentionally NOT implemented yet

- **Pin/unpin actions on each app card** — the design is decided (pinning moves an app into the Pinned section, unpinning removes it) but the interactive controls are deferred to the next thread.
- **Section heading pills in collapsed mode** — only the line form shows when collapsed. Labels appear only on expand.

## Where this is implemented

- `components/layout/TopBar.tsx` — top nav including logo, search, right cluster icon buttons, profile dropdown
- `components/layout/Sidebar.tsx` — left nav (overlay rail, hover-to-expand, Pinned/Recent sections, brand mark)
- `components/layout/AppLayout.tsx` — CSS grid shell that combines TopBar + Sidebar + main content
- `components/notifications/NotificationCard.tsx` — card UI used by both callout and Center page
- `components/notifications/NotificationCallout.tsx` — popover content for the Bell
- `app/(main)/notifications/page.tsx` — full Notification Center page
- `lib/mock/notifications.ts` — hardcoded notification data (10 entries, mock)
- `public/Logo.svg` — account logo, rendered in the TopBar left end
- `public/kissflow-logo.svg` — Kissflow brand mark, rendered at the bottom of the left nav
