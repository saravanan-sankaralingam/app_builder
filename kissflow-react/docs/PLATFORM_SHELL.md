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

Each item is a `<Link>` (or a `<button>` for the primary Create variant) styled as a row that's identical-shape across collapsed and expanded modes — only the visibility of the label and right-side affordances changes.

| Class | Why |
|---|---|
| `group flex items-center h-9 rounded-lg` | **36px-tall** row, rounded highlight |
| `mx-[7px]` | horizontal gutter so the row is **36px wide** in the 50px collapsed nav `(50 − 7 − 7 = 36)` — the selected-state highlight reads as a perfect **36×36 square** in collapsed mode |
| `<div className="w-9 flex items-center justify-center flex-shrink-0">` | **36px** fixed-width icon column |
| `<Icon className="h-[18px] w-[18px]" />` | 18px icon, centered in the 36px column |
| `<span className="text-sm ... opacity-0/100">` | label, opacity-transitioned (150ms) on expand, `pointer-events-none` when hidden |

**Icon X position is the same in both modes** — `mx-[7px]` + `w-9` icon container with `justify-center` puts the icon's center at `7 + 18 = 25px` from the nav's left edge whether the nav is 50px or 240px wide. **Do not change this without recomputing.**

### Strokes and colors

- **Stroke width:** `1.5` for unselected items, `2` for the active item.
- **Default state:** `text-gray-800`. **Hover:** `text-gray-900` with **`bg-gradient-to-br from-purple-50 to-blue-50`** — the lightest pastel form of the active gradient, so hover and active feel like one family.
- **Active state:** `bg-gradient-to-br from-purple-600 to-blue-400 text-white` — diagonal "twilight" gradient (purple-600 top-left → blue-400 bottom-right). White text reads on both ends (purple-600 ~4.4:1, blue-400 ~3.5:1).

### Primary variant (Create new)

Items with `variant: 'primary'` (currently only Create new) render with a **filled icon button inside the row**, not a full-row solid color. This visually marks them as a primary action.

```
collapsed:                 expanded:
┌────────┐                ┌──────────────────────────────────┐
│  [+]   │                │  [+]  Create               →    │
└────────┘                └──────────────────────────────────┘
  └── 24x24 blue            └ 24x24 blue       └ label       └ ChevronRight
     rounded-md                rounded-md         text-gray-800   (h-4 w-4
     bg-blue-500              bg-blue-500          ml-2            ml-auto mr-3
     w/ white +               (always blue,        text-sm         text-gray-500
     icon (strokeWidth 2)     no hover change)                     fades in)
```

| Visual element | Class / detail |
|---|---|
| Row itself | Same row container as other items (h-9, mx-[7px], rounded-lg). Hover gradient is the same `from-purple-50 to-blue-50`. **No solid full-row bg.** |
| Icon button | `h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center` inside the w-9 icon column |
| Icon | `Plus` (lucide), `h-[18px] w-[18px] text-white`, `strokeWidth={2}` |
| Label | `<span>` with `ml-2 text-gray-800` (sits next to the blue button, not inside it). Label text is `"Create"`, **not** `"Create new"` |
| Right-arrow affordance | `ChevronRight` (lucide), `h-4 w-4 ml-auto mr-3 text-gray-500 strokeWidth={1.75}` — opacity 0 when collapsed, 1 when expanded |
| **Pressed look while popover is open** | The row's hover gradient is held on the row whenever `popoverOpen` is true (`popoverOpen && 'bg-gradient-to-br from-purple-50 to-blue-50'`). Gives the user a clear "this control is currently active" affordance even when the mouse has moved into the callout. |
| Rendering | Wrapped in a `<Popover>` (not `<Link>`). Trigger is a `<button>` with the row's classes. |

### Create callout (popover)

Opens to the right of the Create row with the 6 creation options.

```
Anchored:   side="right"  align="end"  sideOffset={8}
            ↑ callout's BOTTOM edge aligns with the Create row's bottom edge,
              so the callout extends UPWARD from that anchor point
```

| Option | Icon (lucide) | Icon color |
|---|---|---|
| 1. App | `Grid2x2Plus` | `text-pink-500` |
| 2. Process | `Workflow` | `text-orange-500` |
| 3. Board | `Columns3` | `text-purple-500` |
| 4. Portal | `Globe` | `text-pink-500` |
| 5. Dataset | `Database` | `text-red-500` |
| 6. Integration | `Plug` | `text-purple-500` |

**Order is exact** — don't reshuffle.

**Layout (`CreateOptionsList`):**
- Outer container: `w-[160px] py-1 space-y-1` — 160px wide, 4px between options
- Each option button: `w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md`
- Each option's icon: `h-4 w-4 strokeWidth={1.75}` + the per-option color class
- Each option's `onClick`: currently a stub `/* TODO: wire each create option's action */` followed by `onSelect()` (closes popover + collapses nav)

**Open-state behavior (load-bearing):**
- Popover open state is **controlled** by Sidebar (`createOpen` + `setCreateOpen`), not internal Radix state.
- Sidebar's `isExpanded` is computed as `isHovering || createOpen`. **This means the nav stays expanded while the popover is open, even after the user's mouse leaves the nav.** Mouse can move from the trigger row over the gap into the callout without the nav collapsing.
- The callout closes on:
  1. **User selects an option** → option's `onClick` runs `onSelect()` which calls **both** `onPopoverOpenChange(false)` (closes popover) **and** `onItemClick()` (forces `isHovering = false`). This belt-and-suspenders approach guarantees the nav collapses on selection, regardless of where the mouse happens to be when the click fires.
  2. **User clicks outside the popover** → Radix detects it, fires `onOpenChange(false)`, nav collapses if not hovering.

### Pin / Unpin affordance

App items in the Pinned and Recent sections show a pin/unpin button at the **right end of the row**, visible only on hover.

| Visual / behavior | Detail |
|---|---|
| Where it shows | Only on items in `pinnedApps` or `recentApps`. Home, My Items, Marketplace, Explorer, Create do **not** get a pin button (no `pinState` prop passed). |
| Visibility | `opacity-100` only when `isExpanded && isRowHovered`; otherwise `opacity-0 pointer-events-none`. Hidden entirely in collapsed mode. |
| `isRowHovered` source | State on `NavButton`, set by `onMouseEnter` / `onMouseLeave` on the `<Link>` itself — chosen over `group-hover:` for reliability across nested elements. Hovering **anywhere** on the row (label, icon, empty space) reveals the pin button. |
| Button container | `ml-auto mr-2 flex items-center justify-center h-6 w-6 rounded-full` — 24×24 circle, pushed to the right end |
| Icon | `Pin` when `pinState === 'unpinned'` (action: pin it); `PinOff` when `pinState === 'pinned'` (action: unpin it) |
| Icon size | `h-3.5 w-3.5` (14px), `strokeWidth={1.75}` |
| Icon color | `text-purple-500` on non-active row; **`text-purple-200`** on the active row (so it reads against the purple-blue gradient) |
| Button hover bg | Non-active row: `from-purple-200 to-blue-200` gradient; active row: `from-purple-500 to-blue-500` gradient. Same diagonal direction as the active-state gradient, just at intensities that work against each row's bg. |
| Click handling | `e.preventDefault()` + `e.stopPropagation()` so the surrounding `<Link>` does **not** navigate; then `onTogglePin?.()` fires. |
| State updates | `pinApp(item)` removes from Recent and **appends** to Pinned. `unpinApp(item)` removes from Pinned and **prepends** to Recent (most-recently-handled first). |
| Persistence | **In-memory only.** Refreshing the page resets to `initialPinnedApps = []` + `initialRecentApps = [Retail One]`. Backend persistence is the next milestone. |

### Vertical structure (top → bottom)

```
Home
My Items
Marketplace
Explorer
─── SectionDivider (label: "Pinned" if any, else "Recent") ───
[Pinned section — only when hasPinned]   ← scrolls inside, max-h = calc(100% - 150px)
[SectionDivider (label: "Recent") — only when hasPinned]
[Recent section]                          ← flex-1, min-h-0, overflow-y-auto
Create new (primary variant)              ← solid blue [+] button + "Create" + ChevronRight
─── SectionDivider (no label) ───         ← divider sits BELOW Create new, not above
[Kissflow brand mark + "powered by Kissflow"]
```

- Items use `gap-2` on the nav's flex container (8px between rows).
- **Top group** (Home, My Items, Marketplace, Explorer) is the discovery / navigation set — top-level destinations the user can always reach.
- **Middle** (Pinned + Recent) is the workspace — the user's actual apps.
- **Bottom group** holds Create new + the brand mark. The divider sits **between** Create new and the brand mark (i.e., below the [+] button, not above it), so Create new feels connected to the apps section above and only the brand mark gets visually separated as a footer.

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

`Sidebar.tsx` lifts pinned and recent into component state, seeded by these in-file constants:
- `initialPinnedApps: NavItem[] = []` — starts empty.
- `initialRecentApps: NavItem[] = [Retail One]` — single item for now.

```tsx
const [pinnedApps, setPinnedApps] = useState<NavItem[]>(initialPinnedApps)
const [recentApps, setRecentApps] = useState<NavItem[]>(initialRecentApps)

const pinApp = (item) => {
  setRecentApps(prev => prev.filter(a => a.href !== item.href))
  setPinnedApps(prev => [...prev, item])
}
const unpinApp = (item) => {
  setPinnedApps(prev => prev.filter(a => a.href !== item.href))
  setRecentApps(prev => [item, ...prev])
}
```

State is in-memory only — refreshes reset to the initial values. Backend persistence is the next milestone.

### Brand mark

Sits at the very bottom of the nav. In collapsed mode only the leaf icon shows; in expanded mode a small "powered by Kissflow" wordmark fades in next to it.

```tsx
<div className="mt-1 mx-[9px] flex items-center">
  <div className="w-8 flex items-center justify-center flex-shrink-0">
    <img src="/kissflow-logo.svg" alt="Kissflow" className="h-5 w-5" />
  </div>
  <span className={cn(
    'ml-2 text-[11px] text-gray-700 whitespace-nowrap transition-opacity duration-150',
    isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
  )}>
    powered by <span className="font-semibold">Kissflow</span>
  </span>
</div>
```

- Same `mx-[9px] w-8` column treatment as nav items, so the logo X position matches Home/Marketplace/etc. (~25px from nav left edge).
- Logo source SVG is 20×20; rendered at `h-5 w-5`.
- Wordmark: **`text-[11px] text-gray-700`** with the word **"Kissflow"** specifically in **`font-semibold`** (the rest `"powered by"` is regular weight).
- Wordmark opacity-transitions in/out on expand; `pointer-events-none` when hidden.

### What's intentionally NOT implemented yet

- **Each Create option's action** — clicking App / Process / Board / Portal / Dataset / Integration closes the popover but doesn't do anything else (`/* TODO: wire each create option's action */`).
- **Backend persistence for pin/unpin** — the in-memory toggle works correctly, but pinning state resets on refresh. Wire to backend when the API is ready.
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
