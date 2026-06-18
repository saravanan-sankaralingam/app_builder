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

> *TBD — to be filled in when described.*

## Where this is implemented

- `components/layout/TopBar.tsx` — top nav including logo, search, right cluster icon buttons, profile dropdown
- `components/layout/Sidebar.tsx` — left nav (current shell)
- `components/layout/AppLayout.tsx` — CSS grid shell that combines TopBar + Sidebar + main content
- `components/notifications/NotificationCard.tsx` — card UI used by both callout and Center page
- `components/notifications/NotificationCallout.tsx` — popover content for the Bell
- `app/(main)/notifications/page.tsx` — full Notification Center page
- `lib/mock/notifications.ts` — hardcoded notification data (10 entries, mock)
