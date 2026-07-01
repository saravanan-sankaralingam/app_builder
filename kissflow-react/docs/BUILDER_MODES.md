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

**Layout:**
```
┌─────────────┬─────────────────────────────────┐
│ CopilotPanel│ AppSpecView                     │
│   (~320px)  │ (fills remaining width)         │
└─────────────┴─────────────────────────────────┘
```

**Content structure** (`components/app-view/AppSpecView.tsx`):

1. **Pinned identity header** — app name + description on a purple/magenta gradient card.
2. Four scrollable sections, each with an accent dot + 18px semibold title + count badge + subtitle:
   - **Roles** (magenta accent) — role cards with responsibility bullets
   - **Data entities** (green accent) — entity cards with description, fields table (name / type badge / required dot), and per-role permission chips
   - **Pages** (blue accent) — page cards with name + description
   - **Navigation** (purple accent) — one card per navigation with "shared with: {roles}" and an indented menu tree

**Data source:** `lib/app-specs.ts` — a per-app registry keyed by `appId`. Each entry conforms to the `AppSpec` interface:

```ts
interface AppSpec {
  roles: RoleSpec[]         // { name, responsibilities: string[] }
  entities: EntitySpec[]    // { name, description, fields: EntityField[], permissions: EntityPermission[] }
  pages: PageSpec[]         // { name, description }
  navigations: NavigationSpec[]  // { title, sharedWith: string[], menu: NavMenuItem[] }
}
```

**Adding a new static app to Spec:**
1. Register the app in `lib/static-apps.ts`.
2. Author an `AppSpec` entry for it in `lib/app-specs.ts`. That's it — `AppSpecView` picks it up by id.
3. If no entry exists for an id, the panel renders a "No spec yet" empty state pointing to the file.

**Visual language borrowed from `/new/app` creation flow:** the RightPane in `components/new-app/AppCreatingView.tsx` uses the same section shape, field-type badges, and permission chips — Spec mode is intentionally the same visual so users see the same document during creation and after the app is live.

---

## 3. Build

**Purpose:** The actual low-code builder — sidebar, tab bar, and per-tab editors (DataForm, Board, Process, List, Page, Navigation, etc.).

**Fallback branch** after the spec conditional. This is the original builder UI: `BuilderSidebar` + `BuilderTabBar` + tab-specific editor components (`FormBuilder`, `ListEditor`, `PageEditor`, `NavigationEditor`, etc.) plus the `BuilderUtilityBar`.

See the root `CLAUDE.md` § "BuilderUtilityBar Buttons by Tab Type" and `ComponentsProperties.md` for the styling spec of this mode.
