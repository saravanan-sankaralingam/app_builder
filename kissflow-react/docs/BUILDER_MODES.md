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
  workflows: WorkflowSpec[] // see the Workflows section below
  pages: PageSpec[]         // { name, description }
  navigations: NavigationSpec[]  // { title, sharedWith: string[], menu: NavMenuItem[] }
}
```

### Workflows

Each workflow renders as a swimlane diagram — rows are assignees, columns are step positions, and SVG lines connect steps to show flow.

```ts
export const UNDEFINED_ASSIGNEE = 'Undefined'  // dynamic-assignee swimlane (bottom row)

interface WorkflowStep {
  id: string
  name: string
  assignee: string   // role name OR UNDEFINED_ASSIGNEE
  column: number     // 1-based; multiple steps may share a column (parallel branches)
  next: string[]     // ids of the next step(s); multi = parallel/conditional branch; empty = terminal
  condition?: string // e.g. "if amount > $1,000" — rendered as a caption on the step chip
  optional?: boolean // true → dashed border to signal "may be skipped"
}

interface WorkflowSpec {
  name: string
  description: string
  entity?: string                  // which entity this workflow governs
  steps: WorkflowStep[]
}
```

**Layout algorithm** (`WorkflowCard` in `AppSpecView.tsx`):
1. Rows = the app's `roles` in declared order, filtered to roles that own at least one step, plus **`Undefined`** appended at the bottom if any step uses it. The Undefined row label renders italic gray-600 as a soft hint that the assignee is decided at runtime.
2. Columns = `1..maxColumn` where `maxColumn = max(step.column)`. Header row shows `Step 1`, `Step 2`, ….
3. CSS Grid: `gridTemplateColumns: "minmax(160px, max-content) repeat(maxColumn, minmax(160px, 1fr))"`. `overflow-x-auto` on the wrapper so long flows scroll horizontally.
4. For each `(assignee, column)` cell, place the matching step chip if one exists — otherwise leave empty. Multiple steps at the same column (parallel branches) sit in different assignee rows.

**Step chip — two variants** (both in `StepChip` inside `AppSpecView.tsx`):

1. **Regular** (`step.next.length <= 1`) — `bg-orange-100 border-orange-300 text-orange-700` rounded-md rectangle with a filled orange-500 badge showing the step's `column` number. If `step.optional` is true, border becomes dashed. If `step.condition` is set, a small italic `text-orange-600` caption sits under the name showing the condition text.
2. **Diamond** (`step.next.length > 1` — the step branches) — the whole cell becomes a rhombus via `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` on a full-cell `absolute inset-0` layer, `bg-orange-100` fill and `1.5px solid` (or dashed if optional) `orange-500` border. Content inside: a lucide **`Split`** icon + the step name, both centered in the diamond's widest strip via `max-w-[62%]` so text doesn't clip the pointed edges. `min-h-[72px]` on the container so the diamond has enough vertical room; the grid row height picks this up and every row in that workflow inherits the same height. A native `title` tooltip on the container enumerates the branch targets and their conditions — `Condition\n→ Finance review: if amount > $1,000\n→ Compliance check: if international travel\n→ Approve: default path` — built by `buildBranchTooltip(step, workflow)`.

**Connector lines** — SVG overlay absolutely positioned over the grid.
- `useLayoutEffect` measures each rendered step element via `stepRefs` (a `Map<stepId, HTMLDivElement>`) after paint. One ref map covers both chip and diamond variants — both types register the same callback, and `getBoundingClientRect()` returns the same right-middle / left-middle attach points for both shapes (the diamond's right vertex sits exactly at `(rect.right, rect.top + rect.height/2)`).
- Path routing via `orthPath(x1, y1, x2, y2)`:
  - Same-row transition (`|y1 - y2| < 4`) → straight horizontal `M x1 y1 L x2 y2`.
  - Cross-row → Z-shape `M x1 y1 L xMid y1 L xMid y2 L x2 y2` where `xMid` is the midpoint between the two columns. This is the standard flowchart routing pattern and reads much more cleanly than diagonals when arrows fan out from a diamond.
- Stroke: **`orange-500`** at 1.5px with `strokeLinecap="round"` + `strokeLinejoin="round"` so the corners on Z-paths look intentional. Arrowhead via a `<marker>` with `orient="auto"` (correctly rotates for the final segment).
- `ResizeObserver` recomputes on container resize so lines stay in sync during horizontal scroll or window resize.
- Marker id is `useId()`-scoped so multiple workflow cards on the same page don't collide.

**Modelling the branch / skip / dynamic-assignee cases:**

| Scenario | Data pattern |
|---|---|
| Linear flow | `next: [nextId]` on every step, columns 1..N |
| Conditional branch (fork) | Predecessor's `next: [a, b]` — a and b are two conditional steps, each with a `condition` |
| Convergence | Multiple steps' `next` arrays all point at the same successor step |
| Skip step | A single step with `condition` set and, on its predecessor, both `next: [skipStep, nextStep]` — reader interprets: "if condition matches, go through the skip step; otherwise straight to nextStep" |
| Dynamic-assignee step | `assignee: UNDEFINED_ASSIGNEE` — routes to the Undefined swimlane at the bottom of the grid |
| Optional step | `optional: true` — dashed border signals it may be skipped even when the condition matches |

The Expense Claim Approval workflow (Expense Management app) exercises all four capabilities and is the canonical example in the codebase.

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
