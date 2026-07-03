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

**Rendered via `@xyflow/react` (React Flow, MIT).** The library is already a project dependency. Two custom node types are registered — `stepChip` and `diamond` — each with the same Kissflow orange palette. Edges use React Flow's built-in `smoothstep` type for orthogonal routing with rounded corners; we set the source and target handles per edge based on the target row's position relative to the source (see rules below), so the library's edge router does the actual line drawing. `WF_LAYOUT` (in `AppSpecView.tsx`) is the single geometry constant driving both the swimlane grid background and node positions.

**Step chip — two variants** (both in `AppSpecView.tsx`):

1. **Regular** (`step.next.length <= 1`) — `bg-orange-100 border-orange-300 text-orange-700` rounded-md rectangle with a filled orange-500 badge showing the step's `column` number. If `step.optional` is true, border becomes dashed. If `step.condition` is set, a small italic `text-orange-600` caption sits under the name showing the condition text.
2. **Diamond** (`step.next.length > 1` — the step branches) — a compact **32 × 32 px** rhombus (same visual height as a regular chip) via `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` on a full-container `absolute inset-0` layer, `bg-orange-100` fill and `1.5px solid` (or dashed if optional) `orange-500` border. The only content is a bold **`?`** in orange-500 — no step name inside the diamond itself. A native `title` tooltip on the container enumerates the branch targets and their conditions — `Condition\n→ Finance review: if amount > $1,000\n→ Compliance check: if international travel\n→ Approve: default path` — built by `buildBranchTooltip(step, workflow)`. `cursor-help` on the container hints that hovering reveals the routing.

**Data model rule — branch targets share the diamond's column.** Every step listed in a diamond's `next` array is authored at the same `column` as the diamond, in its own row (per assignee). The only exception: a branch target whose assignee matches the diamond's assignee (same row) cannot share the diamond's column — it goes one column to the right. Downstream (non-branch) steps that come after the convergence point pick up at column+1 from the last branch column, as normal. See `poa-4 Send to supplier` in Purchase Order Approval for the same-row-goes-right case; every other diamond example uses same-column below/above targets.

**Connector lines** — drawn entirely by React Flow.
- Each node registers **four handles** (`target-left/top/bottom` and `source-right` for chips; `target-left` and `source-right/top/bottom` for diamonds). Handles are hidden via inline styles (`opacity: 0`, transparent background/border) — they exist for edge attach points but this is a read-only view, not an interactive editor.
- **Edge type: `smoothstep`** — the built-in step edge with rounded corners. Handles the same L-shape / Z-shape routing that the old hand-rolled `orthPathHorizontal` / `orthPathVertical` produced, but it's library-managed. Style: `stroke: var(--orange-500)`, `strokeWidth: 1.5`, `markerEnd: MarkerType.ArrowClosed` in orange-500.
- **Handle selection per edge** (source and target picked in `buildWorkflowLayout`):
  - **From a diamond**, the target row's index relative to the diamond decides the vertex:
    - Same row → `sourceHandle: 'source-right'` → target's `target-left`.
    - Above the diamond → `sourceHandle: 'source-top'` → target's `target-bottom`.
    - Below the diamond → `sourceHandle: 'source-bottom'` → target's `target-top`.
  - **From a regular chip**: always `sourceHandle: 'source-right'` → target's `target-left`. React Flow's smoothstep does the routing when the target sits on a different row.
- The `ReactFlow` container is put in **static mode** — `panOnDrag={false}`, `zoomOnScroll={false}`, `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`, `defaultViewport={{ x: 0, y: 0, zoom: 1 }}`. `proOptions={{ hideAttribution: true }}` suppresses the "React Flow" watermark. `style={{ background: 'transparent' }}` so the grid dividers underneath show through.
- **Swimlane chrome is a CSS Grid** with four cells:
  - `gridRow 1, col 1`: **Corner cell** ("Assignee"), `position: sticky; top: 0; left: 0; z-index: 30` — visible in both scroll directions.
  - `gridRow 1, col 2`: **Header row** (Step 1, Step 2, …), `position: sticky; top: 0; z-index: 20` — stays at the top for vertical scroll.
  - `gridRow 2, col 1`: **Assignee column** (role names + `Undefined`), `position: sticky; left: 0; z-index: 10` — stays at the left for horizontal scroll.
  - `gridRow 2, col 2`: **Step area** — the React Flow container. Nodes are positioned in step-area coordinates only (`x = (column-1) * columnWidth`, `y = rowIdx * rowHeight`, no `laneLabelWidth`/`headerHeight` offset), and CSS-drawn 1px `--gray-200` dividers sit behind React Flow at each column/row boundary.
- **Scroll model**: the outer wrapper is `overflow-auto` with `maxHeight: 480px`, so both horizontal AND vertical scrolling happen INSIDE the swimlane, not inside the surrounding spec pane. Header row + assignee column stay pinned via CSS sticky. `maxWidth: 100%` on the scroll wrapper caps the card width to its container, so wide flows scroll rather than overflow the parent.
- Geometry (`laneLabelWidth: 160`, `columnWidth: 200`, `headerHeight: 36`, `rowHeight: 80`, `chipWidth: 152`, `chipHeight: 44`, `diamondSize: 32`) is centralised in `WF_LAYOUT`.
- Resize behaviour is handled internally by React Flow + native browser scroll — no more `useLayoutEffect` + refs + `ResizeObserver` machinery.

**Known limitation:** when a diamond has two below-targets in different rows (e.g. Expense Claim Approval's `Manager review` fanning out to both Finance review and Compliance check), both arrows exit from the same bottom vertex and their vertical segments overlap on the shared portion. The two arrowheads still land at their respective target tops so destinations are unambiguous. Future improvement: fan out with a small handle-position offset per branch to visually separate the segments — React Flow supports multiple handles on the same side which would make this a one-line change.

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
