# Platform Shell

UI specs for the Platform's chrome (top nav, left nav, anything else outside the route content). These specs apply to all `app/(main)/*` routes — see [`../app/(main)/CLAUDE.md`](../app/<!-- main -->(main)/CLAUDE.md).

> **Scope note:** This is the **Platform** shell only. The Builder route (`app/builder/[appId]/`) uses its own shell (`BuilderLayout.tsx`) and is documented separately.

## Top nav

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│ [Account logo]                                  [Profile photo]   │
└──────────────────────────────────────────────────────────────────┘
   left end                                          right end
```

- **Left end:** account's logo
- **Right end:** profile photo of the currently logged-in user
- Center is intentionally empty for now

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

## Left nav

> *TBD — to be filled in when described.*

## Where this is implemented

`components/layout/TopBar.tsx` and `components/layout/Sidebar.tsx` are the current shell components used by `components/layout/AppLayout.tsx`. The profile dropdown should be added to `TopBar.tsx` (or a new sub-component) following the spec above.
