# Platform Shell

UI specs for the Platform's chrome (top nav, left nav, anything else outside the route content). These specs apply to all `app/(main)/*` routes — see [`../app/(main)/CLAUDE.md`](../app/<!-- main -->(main)/CLAUDE.md).

> **Scope note:** This is the **Platform** shell only. The Builder route (`app/builder/[appId]/`) uses its own shell (`BuilderLayout.tsx`) and is documented separately.

## Top nav

**Layout (visual left → right):**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]              [Search]              [Help docs] [Agent help] [Notif] [Profile] │
└─────────────────────────────────────────────────────────────────────────────────────┘
  left end             center                ──── right cluster ────       right end
```

- **Left end:** account's logo
- **Center:** Search (scope TBD — to be defined when search is built)
- **Right cluster** (left → right): Help docs · Agent help · Notification · Profile photo
- **Right end:** Profile photo of the currently logged-in user

### Right cluster items

| Position (L→R) | Item | Click behavior |
|---|---|---|
| 1 (leftmost of cluster) | Help docs | Navigates to `https://community.kissflow.com/` — **opens in a new tab** (`target="_blank"`) |
| 2 | Agent help | Opens the **Agent chat window as a popover anchored to the bottom-right corner of the viewport** (not anchored to the icon). The chat window is **persistent across page navigation** until the user explicitly dismisses it. |
| 3 | Notification | Opens the **notification callout** (popover). See "Notification callout" section below. |
| 4 (rightmost) | Profile photo | Opens the profile dropdown — see below |

## Profile dropdown (click profile photo)

A callout opens with menu items in this exact order. Each item has an icon (specific icon choice is **TBD by the designer**). Use generous spacing between items.

```
┌──────────────────────────────┐
│  [icon]  My settings         │
│  [icon]  Themes              │
│  [icon]  Connector builder   │
├──────────────────────────────┤  ← separator
│  [icon]  Environments        │
│  [icon]  Account administration │
│  [icon]  Account governance  │
├──────────────────────────────┤  ← separator
│  [icon]  Sign out            │
└──────────────────────────────┘
```

### Item order (verbatim, must be preserved)

| # | Item | Icon |
|---|---|---|
| 1 | My settings | TBD (designer) |
| 2 | Themes | TBD (designer) |
| 3 | Connector builder | TBD (designer) |
|   | — separator — | |
| 4 | Environments | TBD (designer) |
| 5 | Account administration | TBD (designer) |
| 6 | Account governance | TBD (designer) |
|   | — separator — | |
| 7 | Sign out | TBD (designer) |

### Rules

- **Order is exact** — these seven items, in this order, with separators after item 3 and item 6.
- **Every item has an icon** — no text-only items.
- **Generous spacing between items** — directional rule; tighten to a token-based value once design tokens are defined.
- Hover and active states follow the standard menu styling (TBD if not already covered by `components/ui/dropdown-menu.tsx`).

## Notification callout

Popover anchored to the Bell icon (`align="end"`, `sideOffset={8}`). Implementation: `components/notifications/NotificationCallout.tsx`.

```
┌──────────────────────────────────────┐
│  Notification              [⚙]        │  ← title left, settings icon right
├──────────────────────────────────────┤
│  Mark all as read                     │  ← link
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ [Avatar]  Sales App        ●   │  │  ← card (gray-50 bg)
│  │           John assigned a deal │  │     • avatar (user)
│  │           2 min ago            │  │     • app name (small, gray)
│  └────────────────────────────────┘  │     • message
│  ┌────────────────────────────────┐  │     • time
│  │ … more cards …                  │  │     • blue dot = unread
│  └────────────────────────────────┘  │
│  (scrolls — max-h ~360px, shows ~3–4)│
├──────────────────────────────────────┤
│  Show all                             │  ← link → /notifications
└──────────────────────────────────────┘
```

**Rules:**
- Width: **380px** (callout)
- Card background: **`bg-gray-50`**, hover `bg-gray-100`
- Card height **varies with message length** (no fixed height)
- Scrollable list capped at `max-h-[360px]` so ~3–4 cards are visible without scrolling
- "Mark all as read" updates `isRead` on all visible notifications client-side (no backend yet)
- "Show all" navigates to `/notifications`
- Settings icon → currently stub (TBD where it routes)

### Card anatomy (left to right)

1. **User avatar** (initials, colored bg) — represents the user behind the notification
2. **App name** (small, `text-gray-500`) — which app the notification is from
3. **Message** (`text-gray-900`) — the notification text
4. **Time** (small, `text-gray-400`) — relative time, e.g. "2 min ago"
5. **Unread dot** (blue, top-right of card) — only when `isRead === false`

Same card component (`NotificationCard.tsx`) is reused on the full Notification Center page. There it renders wider because the parent container is `max-w-3xl` instead of `380px`.

## Notification Center (full page)

Route: `/notifications` → `app/(main)/notifications/page.tsx`. Uses the Platform shell (top + left nav stay visible); **nothing is selected in the left nav**.

```
┌─────────────────────────────────────────────────────────────┐
│   [←]  Notification                                          │  ← back arrow + title
├─────────────────────────────────────────────────────────────┤
│   All      Unread      Mentions                              │  ← tabs
├─────────────────────────────────────────────────────────────┤
│                                                              │
│           ┌──────────────────────────────────────┐          │
│           │ [Avatar]  App name           ●        │          │
│           │           Message …                   │          │  ← cards
│           │           Time                        │          │     centered
│           └──────────────────────────────────────┘          │     on the
│           ┌──────────────────────────────────────┐          │     screen,
│           │ …                                     │          │     broader
│           └──────────────────────────────────────┘          │     than callout
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- Content is centered with `max-w-3xl` (~768px) — broader than callout's 380px
- Back arrow → `router.back()`
- Tabs:
  - **All** — show every notification
  - **Unread** — filter `!isRead`
  - **Mentions** — filter `isMention`
- Active tab gets `border-b-2 border-blue-600 text-blue-600 font-medium`; inactive gets `text-gray-600`
- Empty state: centered "No notifications" message

## Left nav

> *TBD — to be filled in when described.*

## Where this is implemented

`components/layout/TopBar.tsx` and `components/layout/Sidebar.tsx` are the current shell components used by `components/layout/AppLayout.tsx`. The profile dropdown should be added to `TopBar.tsx` (or a new sub-component) following the spec above.
