# App Nav Header

The **app nav header** is the white card that sits at the top of every deployed app page (e.g. `/app/retail-one`, `/app/inventory-management`). It carries the app identity, collaboration affordances, app-level actions, and the app's section tabs.

This is **not** the Platform shell (TopBar + Sidebar). The Platform shell lives outside the page and is documented in [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md). The app nav header is rendered **inside** each app page's content area.

```
┌─────────────────────────────────────────────────────────────────┐
│ Platform TopBar (50px, from AppLayout)                          │  ← shell
├──┬──────────────────────────────────────────────────────────────┤
│  │ ┌──────────────────────────────────────────────────────┐ ▲   │
│S │ │ [icon] App Name 📌 [SS][JD][AK] ⊕  [Manage] [⋯]      │ │   │
│i │ │                                                        │ sticky
│d │ │ Tab1  Tab2  Tab3                                       │ │   │
│e │ └──────────────────────────────────────────────────────┘ ▼   │
│b │ ────────────────────────────────────────────────────────     │
│a │ View content (scrolls under the sticky header)               │
│r │                                                              │
└──┴──────────────────────────────────────────────────────────────┘
```

## Where it lives

There is **no shared component yet** — each app page renders its own header inline. That's intentional for now; the apps are still diverging in tab structure and per-tab content, and it's too early to abstract.

| App | File |
|---|---|
| Retail One | `app/(main)/app/retail-one/page.tsx` |
| Inventory Management | `app/(main)/app/inventory-management/page.tsx` |
| Expense Management | `app/(main)/app/expense-management/page.tsx` |
| Vendor Onboarding and Management | `app/(main)/app/vendor-onboarding-and-management/page.tsx` |

Because the header is duplicated across all four pages, a header change is a **four-file edit** (see the Play-mode role-switcher block below for the pattern already applied this way). When it stabilises, lift the header into `components/app-view/AppNavHeader.tsx` and parameterise it (`icon`, `title`, `tabs`, `currentTab`, `onTabChange`). Until then, keep the structure identical across pages by following the contract below.

## Anatomy (top to bottom)

The header is a single white rounded card (`bg-white rounded-lg`) wrapping two rows of content. Fixed height: **86px**. Outer wrapper provides the gutter and the sticky behaviour.

```tsx
<div className="sticky top-0 z-10 bg-gray-100 px-5 py-3">           {/* sticky wrapper */}
  <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
    {/* Row 1 — info + actions */}
    <div className="flex items-center justify-between">
      {/* Left cluster */}
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-{brand}-600" />
        <h1 className="text-lg font-semibold text-gray-900">App Name</h1>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"><Pin /></Button>
        <div className="flex items-center -space-x-2">
          {/* avatar stack — 6×6, ring-2 ring-white */}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full"><UserPlus /></Button>
      </div>
      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="gap-2 h-8 text-[13px]"><Settings /> Manage</Button>
        <Button variant="secondary" size="sm" className="h-8 w-8 p-0"><MoreVertical /></Button>
      </div>
    </div>

    {/* Row 2 — section tabs */}
    <div className="flex gap-3 -mb-3">
      {tabs.map(...)}
    </div>
  </div>
</div>
```

### Row 1 — Info + actions

| Element | Style | Notes |
|---|---|---|
| App icon | `h-5 w-5 text-{brand}-600` (lucide) | Brand colour per app, pulled from the brand families in [`COLORS.md`](COLORS.md) — not Tailwind's defaults. Retail One = `blue-600` + `ShoppingBag`; Inventory = `yellow-600` + `Package`. Match the Sidebar entry. |
| App title | `text-lg font-semibold text-gray-900` | The app's display name. |
| Pin button | `Button ghost h-7 w-7 rounded-full` | Currently a no-op visual affordance. |
| Avatar stack | `w-6 h-6 rounded-full ... ring-2 ring-white`, `-space-x-2` | 3 placeholder collaborators. Coloured by initial cluster (blue/green/purple). |
| Add user | `Button ghost h-7 w-7 rounded-full` + `UserPlus` | No-op. |
| Manage | `Button secondary sm h-8 text-[13px]` + `Settings` | Opens app management (TODO). |
| Overflow | `Button secondary sm h-8 w-8 p-0` + `MoreVertical` | App-level menu (TODO). |

### Row 2 — Section tabs (line-underline variant)

Each tab is a `<button>` that flips a local `currentView` state. The active tab gets a 2-px black underline via an `::after` pseudo-element; inactive tabs are `text-gray-600`.

```tsx
<button
  onClick={() => setCurrentView(tab.key)}
  className={cn(
    "relative px-1 pt-1 pb-3 text-sm transition-colors",
    currentView === tab.key
      ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
      : "text-gray-600 font-normal hover:text-gray-900"
  )}
>
  {tab.label}
</button>
```

The `-mb-3` on the tab row pulls the underline flush with the bottom edge of the 86-px card so the active-tab indicator visually attaches to the card border.

Tabs in current apps:
- **Retail One** — Home, Home-N, Home-P, Site Evaluation, Site Evaluation-N, Store Acquisition, Store Acquisition-N, Projects, Project Status, Rules Engine
- **Inventory Management** — Dashboard, Inventory, Master

## Manage mode

Clicking **Manage** in Row 1 puts the app page into **Manage mode**. The state is local to the page (`const [isManaging, setIsManaging] = useState(false)`).

What changes:

| Surface | Default mode | Manage mode |
|---|---|---|
| Row 1 (icon + title + avatars + Manage + ⋯) | unchanged | unchanged |
| Row 2 | section tabs | breadcrumb: `App Name > Manage` |
| Body | per-tab view content | `<ManageView />` grid |
| Sticky header | yes | yes |

```
┌──────────────────────────────────────────────┐
│ [icon] App Name 📌 [SS][JD][AK] ⊕  [Manage]  │  ← Row 1 stays
│ App Name › Manage                            │  ← Row 2 swaps to breadcrumb
└──────────────────────────────────────────────┘
[ ManageView — 6-card grid ]
```

**Breadcrumb structure:**

```tsx
<nav className="flex items-center gap-1.5 text-sm pl-8 mb-2">
  <button
    type="button"
    onClick={() => setIsManaging(false)}
    className="text-blue-600 font-medium hover:underline leading-none"
  >
    {appName}
  </button>
  <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
  <span className="text-gray-700 font-medium leading-none">Manage</span>
</nav>
```

**Alignment notes:**
- `pl-8` (32px) indents the breadcrumb so the app-name text horizontally lines up with the `<h1>` title in Row 1 above. That 32px = the Row 1 icon width (`h-5 w-5` = 20px) + the `gap-3` (12px) before the title.
- `mb-2` (8px) lifts the breadcrumb up from the card's lower edge. The header card's `flex flex-col justify-between` would otherwise pin the breadcrumb flush with the bottom, which looks crowded.
- `leading-none` on the text spans aligns their baselines with the `ChevronRight` icon centerline (default line-height would let the chevron float high relative to the text).
- `shrink-0` on the chevron prevents it from being compressed if the app-name text grows long.

The app-name crumb is the exit affordance — clicking it sets `isManaging = false` and returns the user to whichever tab they were last on (the tab's `currentView` state is preserved while in Manage mode).

The Manage button itself remains visible and clickable in Manage mode — currently a no-op there, since you're already in Manage mode.

### ManageView (the body)

Shared component at `components/app-view/ManageView.tsx` — a single white card containing 6 management tiles in two rows:

- **Row 1** — `Edit app` sits alone, sized to one column.
- **Row 2** — `Settings`, `Integrations`, `Share`, `Audit log`, `Roles` flow into the remaining columns.

| Tile | Icon | Color family | Action (TODO) |
|---|---|---|---|
| Edit app | `Pencil` | **magenta** (permanent `bg-magenta-100` card bg) | Open app builder |
| Settings | `Settings` | blue | App settings |
| Integrations | `Cable` | purple | Integrations list |
| Share | `Share2` | red | Share dialog |
| Audit log | `FileText` | orange | Audit log viewer |
| Roles | `Users` | yellow | Role management |

All color families come from `globals.css` — see the "Brand palette only" note in [`COLORS.md`](COLORS.md). Don't reach for `amber`, `emerald`, `slate`, etc.

**Tile anatomy** (icon on the left, text on the right):

```tsx
<button className={cn(
  'group flex items-start gap-3 text-left p-4 rounded-lg border border-transparent transition-colors',
  card.baseBg,        // optional permanent bg (Edit app uses bg-magenta-100)
  card.hoverBg,       // hover:bg-{color}-100 (NOT -50; brand palette starts at 100)
  card.hoverBorder,   // hover:border-{color}-200
)}>
  <div className={cn('shrink-0 h-14 w-14 rounded-lg flex items-center justify-center', card.iconBg)}>
    <Icon className={cn('h-6 w-6', card.iconColor)} />
  </div>
  <div className="min-w-0 flex-1">
    <div className="text-base font-semibold text-gray-800 mb-1">{card.title}</div>
    <div className="text-xs font-normal text-gray-700 leading-relaxed">{card.description}</div>
  </div>
</button>
```

| Element | Spec |
|---|---|
| Icon container | **56×56px** (`h-14 w-14`), `rounded-lg`, `bg-{color}-200` |
| Icon | **24×24px** (`h-6 w-6`), `text-{color}-600` |
| Title | **16px** semibold gray-800 (`text-base font-semibold text-gray-800`) |
| Description | **12px** regular gray-700 (`text-xs font-normal text-gray-700`) |
| Layout | `flex items-start gap-3` — icon left, text stacked on the right |
| Hover | Light tint (`hover:bg-{color}-100`) + matching border (`hover:border-{color}-200`). Transparent border at rest (`border-transparent`) avoids a layout shift on hover. |

Edit app's permanent card background (`bg-magenta-100`) is delivered via an optional `baseBg` field on the `ManageCard` interface. Other tiles leave `baseBg` undefined.

**Grid layout** — two grids, one per row, both at the same column template so columns line up:

```tsx
{/* Row 1 — Edit app alone. auto-fill keeps empty tracks as placeholders
    so Edit app sizes to ONE column instead of stretching to fill the row. */}
<div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-8 gap-y-5">
  <CardButton card={editApp} />
</div>

{/* Row 2 — the remaining 5. auto-fit collapses empty tracks, so when a card
    wraps to a new line it stretches to fill that line. */}
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-8 gap-y-5">
  {rest.map((card) => <CardButton key={card.key} card={card} />)}
</div>
```

Why two grids with different auto modes:
- **`auto-fill` (row 1)** keeps empty tracks visible — so Edit app sizes to one column and aligns with the cards below.
- **`auto-fit` (row 2)** collapses empty tracks — so when fewer cards fit on a wrapped line, they expand to fill it (the wrap-fill behaviour spec'd in the reference).
- Both grids use **`minmax(300px, 1fr)`** so a card never shrinks below 300px and stretches to fill its share when there's room.
- **Gap is 32px column × 20px row** (`gap-x-8 gap-y-5`), with `space-y-5` between the two grids so the vertical rhythm is consistent.

To add or change a tile, edit the `cards` array in `ManageView.tsx`. It's intentionally one source for all apps so the Manage surface stays consistent across the Platform.

### Edit app → Builder hand-off

`ManageView` accepts an optional `onEditApp?: () => void` prop. When provided, the Edit app tile fires it on click; when omitted, the tile is a no-op.

Each app page decides whether to wire it up:

```tsx
// In app/(main)/app/inventory-management/page.tsx
<ManageView
  onEditApp={() =>
    window.open('/builder/inventory-management', '_blank', 'noopener,noreferrer')
  }
/>
```

Retail One currently passes no handler — its Edit app tile renders but does nothing.

**Why the Builder works without a backend for prototype apps:** the route `app/builder/[appId]/page.tsx` consults a frontend-only static-apps registry at `lib/static-apps.ts` before hitting `getApp(appId)`. If the slug matches an entry there (today: `inventory-management`), the App shape is hydrated from the registry, the rename handler short-circuits to local state, and the Builder shell renders with the right name + icon. Nested calls (`/data-layers`, `/navigations`, `/pages`) will return empty/404 — the Builder handles this the same way it would for a brand-new real app with nothing in it yet.

**Adding another static app to the registry:**
1. Append an entry to `staticApps` in `lib/static-apps.ts`. Keyed by id; the value must satisfy the `App` interface from `lib/api/apps.ts` (icon as a lucide name string, iconBg as a brand hex from [`COLORS.md`](COLORS.md), system user for `createdBy`/`updatedBy`).
2. Wire the corresponding app page's `onEditApp` to `window.open('/builder/<slug>', '_blank', 'noopener,noreferrer')`.
3. No backend changes, no migrations.

## Sticky behaviour

The outer wrapper is `sticky top-0 z-10 bg-gray-100`. This pins the header to the top of the **scroll container**, which is the `<main>` element in `components/layout/AppLayout.tsx` (`overflow-auto`). The body of the app page scrolls underneath while the header stays in view.

Rules:
- Always put `bg-gray-100` (the page background) on the sticky wrapper. Without it the gray gutter strip turns transparent and the scrolling content shows through the `px-5 py-3` padding.
- `z-10` is enough — nothing in a normal app page sits above it. If you ever layer a Popover/Tooltip from the header, those use Radix portals and live above the document flow anyway.
- The sticky wrapper itself has no rounded corners; only the inner white card has `rounded-lg`. That keeps the gray top strip flat against the Platform TopBar.

## State management

Each page holds two pieces of state:
- `currentView: ViewType` — which section tab is active
- `isManaging: boolean` — whether Manage mode is on

URL syncing is not wired up yet — refreshing the page resets both. `currentView` is preserved across the Manage round-trip (entering and leaving Manage mode does not reset the active tab).

When the time comes to persist, prefer URL search params (`?tab=dashboard`) over a global store, per the frontend convention in [`../CLAUDE.md`](../CLAUDE.md#code-style).

## Adding a new app

To match the convention:

1. Create `app/(main)/app/<slug>/page.tsx`.
2. Copy the header block from `inventory-management/page.tsx` and replace:
   - The icon import + element
   - The `h1` text and the breadcrumb's app-name label
   - The `ViewType` union and the tab buttons
   - The `currentView === '...'` blocks below
   - Keep the `isManaging` state and the `<ManageView />` body block — both come from the shared component, no per-app tweaking needed.
3. Add the app to:
   - `components/layout/Sidebar.tsx` → `initialRecentApps`
   - `components/explorer/ExplorerView.tsx` → `staticApps`
4. Keep the icon/colour pair consistent across the Sidebar entry, the Explorer card, and the in-app header.

If a third app would have identical structure, that is the right moment to lift `AppNavHeader` into `components/app-view/` and accept `tabs: { key, label }[]` + `currentTab` + `onTabChange` props.

## Mirrored in the Builder's Play mode

The Builder's **Play mode** runtime preview renders an app header card with the same spec, so switching between the Platform and the Builder's Play mode is visually seamless. It lives in `components/builder/AppRuntimePreview.tsx`:

- Same `h-[86px] px-5 py-3` white card, same `flex items-stretch justify-between` topology
- Same identity row (icon-left, `text-lg font-semibold` title)
- Same line-underline-on-active tab strip with the `-mb-3` flush-underline trick
- Same icon treatment — no background tile; icon rendered via `iconColorFromBg(appIconBg)` + `strokeWidth={1.25}` at 20×20 (see [`COLORS.md`](COLORS.md) "Rendering an app icon on a white surface")
- The only addition vs Platform: a "Viewing as" role-switcher dropdown on the right, since Play mode is for testing role-specific behaviour

When changing the Platform header, change the Builder Play header to match — they're intentionally identical.

### PlatformAppPreview — chrome overrides for Builder embedding

For **static apps** registered in `lib/static-apps.ts`, Play mode renders the actual Platform page via `components/app-view/PlatformAppPreview.tsx` — the full `/app/<slug>` page component. Because the Platform page is sized for the Platform viewport (`min-h-[calc(100vh-50px)] bg-gray-100`) and has its own gutter padding, `PlatformAppPreview` applies three arbitrary Tailwind child-selector overrides so the page fits cleanly inside the Builder chrome:

```tsx
<div className="flex-1 overflow-auto
  [&>div]:!bg-transparent          {/* kill Platform root bg-gray-100 */}
  [&>div]:!min-h-0                 {/* kill min-h-[calc(100vh-50px)] */}
  [&>div>div]:!p-0                 {/* kill sticky-wrapper px-5 py-3 and content wrapper p-6 */}
  [&>div>div+div]:!pt-3            {/* restore 12px gap between header and content */}
  [&>div>div+div]:!px-2            {/* 8px left/right on the content area */}
">
  <PageComponent />
</div>
```

These only apply inside the Builder — the Platform route at `/app/<slug>` is untouched.

### Static-app headers adapt in Play mode (role switcher)

`PlatformAppPreview` wraps the page in an `AppPreviewProvider` (`components/app-view/AppPreviewContext.tsx`) with `{ inBuilderPlay: true, appId, selectedRole, setSelectedRole }`. Each app page reads `useAppPreview()` and adapts its inline Row 1 **only in Builder Play**:

- **Hidden:** the **Pin** button, the collaborator **avatar stack**, the **Add-user / share** button, and the **Manage** + **More (⋯)** buttons. These are end-user affordances that don't make sense while authoring.
- **Added:** an **`AppNavRoleSwitcher`** (`components/app-view/AppNavRoleSwitcher.tsx`) in the Manage slot — a "Viewing as {role}" pill whose dropdown lists the app's roles (resolved via `resolveAppRoles(appId)` in `app-roles.ts`, from the spec or a fallback). Selecting a role updates `selectedRole` in context.
- **Per-role content:** pages may branch on `selectedRole`. The Vendor Onboarding app ships **per-role dashboards** and **per-role tabs** (e.g. Requester sees "My Requests" / "Browse Vendors"; Finance sees "Spend Overview"). On the Platform route there's no provider, so `selectedRole` is undefined and the default (full) content shows — no regression.

The Platform route at `/app/<slug>` (no provider) always shows the full end-user header.

## Related

- [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md) — Platform TopBar + Sidebar (the surrounding shell)
- [`BUILDER_MODES.md`](BUILDER_MODES.md) — Play / Build modes + the App Spec modal; Play's header is the Platform header (adapted for role preview)
- [`COLORS.md`](COLORS.md) — brand palette + `iconColorFromBg` helper for icon-on-white surfaces
- [`../CLAUDE.md`](../CLAUDE.md) — frontend stack and conventions
- [`../app/(main)/CLAUDE.md`](../app/(main)/CLAUDE.md) — Platform routes including `/app/[appId]`
