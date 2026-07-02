# Builder Top-Bar Modes

> **Important design rule:** Spec is a **readable specification document**, not a configuration editor. It translates the app's technical configuration into prose for a non-technical reader. Anything interactive (dropdowns, pickers, modals, "Manage >" buttons) belongs in **Build mode**, not Spec.
>
> **History:** the Builder used to ship two spec modes — Spec X (flat nav, split content) and Spec Y (expandable tree, full-width detail). Both were removed on 2026-07-01 in favour of a single Spec mode driven by per-app content in `lib/app-specs.ts`. The frozen structural + mock-data snapshot of that older UI lives at [`SPEC_X_SPEC_Y_SNAPSHOT.md`](SPEC_X_SPEC_Y_SNAPSHOT.md) as historical reference — the code is gone.

The Builder header exposes a centered toggle group with **three** modes that swap the entire main area below the header. The toggle lives in `components/builder/BuilderTopBar.tsx`; the layout switching lives in `components/builder/BuilderLayout.tsx`.

State: `mode: 'play' | 'spec' | 'build'`. The parent (`BuilderLayout`) initialises to `'play'`; the `BuilderTopBar` prop default is `'build'` but the parent always passes a value, so the prop default is dead.

### BuilderTopBar styling (key bits)

- **App icon** (left cluster): rendered without a background tile. Size `h-5 w-5` (20×20), `strokeWidth={1.25}`, color via `iconColorFromBg(appIconBg)` from `lib/icon-color.ts`. The outer "App Info" wrapper has `pl-3` for left breathing room. See [`COLORS.md`](COLORS.md) "Rendering an app icon on a white surface" for the wider rule.
- **Mode toggle** (centered Play / Spec / Build): active state is `bg-blue-500 text-white` (brand primary blue). Inactive state is `text-gray-900 hover:bg-gray-200`. Pill chrome `bg-gray-100 rounded-lg p-0.5`.
- **Deploy button** (right cluster): solid green pill — `bg-green-500 text-white hover:bg-green-600` with `border-transparent`. The Rocket icon inherits `currentColor`, so it renders white on the green.

---

## 1. Play

**Purpose:** Live runtime preview of the app being built. No spec or builder chrome — what end-users would see.

**Layout:**
```
┌─────────────┬─────────────────────────────────┐
│ CopilotPanel│ Runtime preview                 │
│   (~320px)  │ (fills remaining width)         │
└─────────────┴─────────────────────────────────┘
```

**What renders on the right:**
- If the `appId` matches a static app registered in `lib/static-apps.ts` (Retail One, Inventory Management, Expense Management today) → `<PlatformAppPreview />` renders the actual Platform page at `/app/<slug>` inside the Builder. See [`APP_NAV_HEADER.md`](APP_NAV_HEADER.md#mirrored-in-the-builders-play-mode).
- Otherwise → `<AppRuntimePreview />` renders a copilot-driven empty shell. Pages are added via `addNavItemCallback` and switched via `switchToPageCallback`.

### Runtime preview header — matches the Platform in-app header

For static apps, the Platform page's sticky header (`h-[86px] px-5 py-3` white card, line-underline tabs) drives the visual. For copilot-driven apps, `AppRuntimePreview` renders its own header with the same spec plus a "Viewing as" role-switcher dropdown on the right. See [`APP_NAV_HEADER.md`](APP_NAV_HEADER.md) for the canonical spec.

12px gap between the header card and the content follows (`gap-3` on the wrapping flex column).

**Use it when:** You want to demo or sanity-check the app's runtime behaviour from the builder.

---

## 2. Spec

**Purpose:** A single readable spec document per app. Same intent as the old Spec X / Spec Y — translate the technical configuration into prose the business team can read — but with one canonical layout and per-app content instead of shared mock data.

**Outer layout:**
```
┌─────────────┬─────────────────────────────────────────────────┐
│ CopilotPanel│ AppSpecView                                     │
│   (~320px)  │ (fills remaining width; 12px right gap via      │
│             │  `pr-3` on the BuilderLayout Spec wrapper)      │
└─────────────┴─────────────────────────────────────────────────┘
```

The AppSpecView outer container is `bg-white/75 backdrop-blur-2xl rounded-t-xl border border-b-0 border-white/90`. Same top-rounded, no-bottom-border shape as the CopilotPanel — the two panels visually "hang" from the top and merge into the Builder chrome at the bottom.

**Inner structure** (`components/app-view/AppSpecView.tsx`):

1. **Pinned identity header** (`p-5`) — app name + description on a purple/magenta gradient card (`linear-gradient(135deg, var(--purple-100) 0%, var(--magenta-100) 100%)` with `var(--purple-300)` border).
2. **Two-column body** (below the identity header):
   - **Left 20%** — QuickNav card, `w-1/5 flex-shrink-0 px-5 flex` outer + `rounded-t-xl border border-b-0 border-gray-200 bg-white` inner, stretches to full height. Header **"IN THIS SPEC"** in `text-[11px] font-normal uppercase tracking-wide text-gray-700`, then 4 button entries — each renders an icon + label:
     - **Roles** — `Users` icon
     - **Data entities** — `Database` icon
     - **Pages** — `FileText` icon
     - **Navigation** — `Compass` icon
     - Icons are `w-4 h-4` with `strokeWidth={1.75}` in `text-gray-700`. Labels are `text-[13px] font-medium text-gray-900`. Clicking scrolls the right pane to the matching section via `scrollIntoView({ behavior: 'smooth' })`.
   - **Right 80%** — content card, `flex-1 flex pr-5` outer + `rounded-t-xl border border-b-0 border-gray-200 bg-white` inner. Uses `divide-y divide-gray-200` + `[&>*:not(:first-child)]:pt-9 [&>*:not(:last-child)]:pb-9` — a 1px gray-200 separator sits between each section with 36px of breathing room on both sides.

**Section header** — each section starts with:
- **Vertical accent bar** — `w-[3px] h-5 rounded-sm` in the section's accent color (magenta / green / blue / purple)
- **Title** — `text-[18px] font-semibold text-gray-900`
- **Count badge** — small rounded-full pill (`text-[11px] bg-gray-100 text-gray-700 px-1.5 py-1 rounded-full`) showing the item count (e.g. "4" for 4 entities — no unit label, just the number)
- **Subtitle** — one line prose describing the section

**Per-section content:**
- **Roles** — role cards with just `Users` icon + name + one-line description (no bullet list of responsibilities anymore; simpler read).
- **Data entities** — entity cards with `Database` icon + name + inline stats ("X fields · Y required") + description, then a fields table (name / type badge / required dot) and a per-role permission chip table.
- **Pages** — page cards with `FileText` icon + name + description.
- **Navigation** — one card per navigation with `Compass` icon + title + "Shared with: {role names}" + an indented menu tree.

**Data source:** `lib/app-specs.ts` — a per-app registry keyed by `appId`. Each entry conforms to the `AppSpec` interface:

```ts
interface AppSpec {
  roles: RoleSpec[]         // { name, description: string }  (single-line prose, not bullets)
  entities: EntitySpec[]    // { name, description, fields: EntityField[], permissions: EntityPermission[] }
  pages: PageSpec[]         // { name, description }
  navigations: NavigationSpec[]  // { title, sharedWith: string[], menu: NavMenuItem[] }
}
```

**Adding a new static app to Spec:**
1. Register the app in `lib/static-apps.ts`.
2. Author an `AppSpec` entry for it in `lib/app-specs.ts`. That's it — `AppSpecView` picks it up by id.
3. If no entry exists for an id, the panel renders a "No spec yet" empty state pointing to the file.

**Visual language borrowed from `/new/app` creation flow:** the RightPane in `components/new-app/AppCreatingView.tsx` uses the same section shape, field-type badges, and permission chips — Spec mode is intentionally the same visual so users see the same document during creation and after the app is live. The two divergences today: (1) Spec mode has a left-column QuickNav that the creation flow doesn't, and (2) roles use a single description instead of bulleted responsibilities.

---

## 3. Build

**Purpose:** The actual low-code builder — sidebar, tab bar, and per-tab editors (DataForm, Board, Process, List, Page, Navigation, etc.).

**Fallback branch** after the spec conditional. This is the original builder UI: `BuilderSidebar` + `BuilderTabBar` + tab-specific editor components (`FormBuilder`, `ListEditor`, `PageEditor`, `NavigationEditor`, etc.) plus the `BuilderUtilityBar`.

See the root `CLAUDE.md` § "BuilderUtilityBar Buttons by Tab Type" and `ComponentsProperties.md` for the styling spec of this mode.
