# Builder Top-Bar Modes

> **Important design rule:** the **App Spec** is a **readable specification document**, not a configuration editor. It translates the app's technical configuration into prose for a non-technical reader. Anything interactive (dropdowns, pickers, "Manage >" buttons) belongs in **Build mode**, not the Spec.
>
> **History:** the Builder used to ship two spec *modes* — Spec X (flat nav, split content) and Spec Y (expandable tree, full-width detail). Both were removed on 2026-07-01 in favour of a single Spec mode driven by per-app content in `lib/app-specs.ts`, and shortly after the Spec was **moved out of the top-bar toggle entirely** into a **modal** opened from an "App Spec" button in the header (see [§ App Spec](#app-spec-modal) below). The frozen structural snapshot of the older Spec X/Y UI lives at [`SPEC_X_SPEC_Y_SNAPSHOT.md`](SPEC_X_SPEC_Y_SNAPSHOT.md) as historical reference — the code is gone.

The Builder header exposes a centered toggle group with **two** modes — **Play** and **Build** — that swap the entire main area below the header. The toggle lives in `components/builder/BuilderTopBar.tsx`; the layout switching lives in `components/builder/BuilderLayout.tsx`.

State: `mode: 'play' | 'spec' | 'build'` — but only `'play'` and `'build'` are reachable from the toggle now. `BuilderLayout` initialises to `'play'` and still contains a (now-unreachable) `'spec'` branch; that branch and the `'spec'` union member are dead code kept for now. The App Spec lives in a modal instead (see below).

### BuilderTopBar styling (key bits)

- **App icon** (left cluster): rendered without a background tile. Size `h-5 w-5` (20×20), `strokeWidth={1.25}`, color via `iconColorFromBg(appIconBg)` from `lib/icon-color.ts`. The outer "App Info" wrapper has `pl-3` for left breathing room. See [`COLORS.md`](COLORS.md) "Rendering an app icon on a white surface" for the wider rule.
- **Mode toggle** (centered Play / Build): active state is `bg-blue-500 text-white` (brand primary blue). Inactive state is `text-gray-900 hover:bg-gray-200`. Pill chrome is **white with a hairline border** — `bg-white border border-gray-200 rounded-lg p-0.5`.
- **App Spec CTA** (right cluster, before the Help/Message icon buttons): a ghost text button — lucide `FileText` icon + "App Spec" — that opens the App Spec modal (see [§ App Spec](#app-spec-modal)).
- **Run button** (right cluster, just before Deploy): green **outline** pill — `bg-white border border-green-500 text-green-600 hover:bg-green-50`, with a filled `Play` icon. Same green family as Deploy but inverted.
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
- If the `appId` is in the `PLATFORM_APP_PAGES` map in `components/app-view/PlatformAppPreview.tsx` (Retail One, Inventory Management, Expense Management, **Vendor Onboarding and Management** today) → `<PlatformAppPreview />` renders the actual Platform page at `/app/<slug>` inside the Builder, wrapped in an `AppPreviewProvider` (`inBuilderPlay: true` + role state). **This map is a manual registry — a new static app needs an entry here IN ADDITION to `lib/static-apps.ts`, or Play falls through to the empty shell.** See [`APP_NAV_HEADER.md`](APP_NAV_HEADER.md#mirrored-in-the-builders-play-mode).
- Otherwise → `<AppRuntimePreview />` renders a copilot-driven empty shell. Pages are added via `addNavItemCallback` and switched via `switchToPageCallback`.

### Runtime preview header — matches the Platform in-app header

For static apps, the Platform page's sticky header (`h-[86px] px-5 py-3` white card, line-underline tabs) drives the visual. **In Builder Play the header adapts:** the end-user Manage / More / Pin / collaborator-avatars / share controls are hidden and a **Role switcher** (`AppNavRoleSwitcher`) takes the Manage slot, so authors can preview the app as any role. Switching the role can re-render per-role content (the Vendor app ships per-role dashboards and per-role tabs). See [`APP_NAV_HEADER.md`](APP_NAV_HEADER.md) for the canonical spec.

12px gap between the header card and the content follows (`gap-3` on the wrapping flex column).

**Use it when:** You want to demo or sanity-check the app's runtime behaviour from the builder.

---

## App Spec (modal)

**Purpose:** A single readable spec document per app — translate the technical configuration into prose the business team can read. It is opened on demand from the **App Spec** button in the header; it is **not** a top-bar mode.

**Opened as a modal** — Radix Dialog primitives in `components/builder/BuilderTopBar.tsx`:
- Overlay `bg-gray-900/50`; content centered, **80vw × 90vh**, `rounded-2xl bg-white shadow-xl`.
- **Modal header** (`h-14 px-5`, bottom border): title **"App Spec"** on the left; on the right a **"Last updated N mins ago"** label, a **Refresh** button (outlined blue — `border-blue-500 text-blue-600 hover:bg-blue-100`, lucide `RefreshCw`), a hairline divider, then a **close ✕**.
- **Body** sits on `bg-gray-50` and renders `<AppSpecView appId={appId} />` filling the remaining height.

**Inner structure** (`components/app-view/AppSpecView.tsx`) — the root container is now **plain** (no background, no corner radius, no frosted blur; the modal body's `bg-gray-50` shows through):

1. **Identity header** (`p-5`) — app name + description on a purple/magenta gradient card (`linear-gradient(135deg, var(--purple-100) 0%, var(--magenta-100) 100%)` with `var(--purple-300)` border). *(The "Last updated / Refresh" controls that used to live here now sit in the modal header above.)*
2. **Two-column body**:
   - **Left 20%** — QuickNav card. Header **"IN THIS SPEC"** (`text-[11px] uppercase tracking-wide text-gray-700`), then **5** icon+label entries — **Roles** (`Users`), **Data entities** (`Database`), **Workflows** (`Workflow`), **Pages** (`FileText`), **Navigation** (`Compass`). Clicking scrolls the right pane to the section via `scrollIntoView({ behavior: 'smooth' })`.
   - **Right 80%** — content card, `divide-y divide-gray-200` with generous per-section padding.

**Section header** — each section starts with a vertical accent bar (`w-[3px] h-5`, section color), an `text-[18px] font-semibold` title, a rounded-full count badge, and a one-line subtitle.

**Per-section content:**
- **Roles** — role cards (`Users` icon + name + one-line description). Each card **always shows** a **"Permissions"** heading (`text-[13px] font-semibold`) above a 2-column table listing every entity and this role's permission chip (`Read-only` / `Edit` / `Manage`, or `No access`). *(The old "View permissions" expand/collapse toggle was removed — permissions are always visible.)*
- **Data entities** — entity cards (`Database` icon + name + "X fields · Y required" + description), then an **indented** (`ml-[26px]`) 2-column fields table (field name with a red `*` for required, then a type badge). The indent aligns the table with the role permission tables.
- **Workflows** — one card per workflow, each a **pan/zoom React Flow graph** (no swimlanes). See [§ Workflows](#workflows) below.
- **Pages** — page cards (`FileText` icon + name + description).
- **Navigation** — one card per navigation (`Compass` icon + title + "Shared with: {role names}" + an indented menu tree).

**Data source:** `lib/app-specs.ts` — a per-app registry keyed by `appId` (Retail One, Inventory Management, Expense Management, **Vendor Onboarding and Management**). If no entry exists for an id, `getAppSpec` returns `null` and the panel renders a "No spec yet" empty state. Each entry conforms to the `AppSpec` interface:

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

Each workflow renders as a left-to-right **React Flow graph on a pan/zoom canvas** (no swimlanes). Steps read horizontally from a **Start** card to a **Completed** card; a **decision diamond** is inserted before any parallel branch, and the parallel steps fan out and converge back to the spine.

```ts
export const UNDEFINED_ASSIGNEE = 'Undefined'  // runtime-decided assignee; the step's chip shows an italic "Conditional"

interface WorkflowStep {
  id: string
  name: string
  assignee: string   // role name OR UNDEFINED_ASSIGNEE
  column: number     // 1-based (legacy). The current graph layout IGNORES this and derives columns from graph structure; kept for data compatibility.
  next: string[]     // ids of the next step(s); >1 = branch (a decision diamond is inserted); empty = terminal
  condition?: string // NOT rendered on the chip anymore; a step whose assignee is UNDEFINED_ASSIGNEE shows an italic "Conditional" instead
  optional?: boolean // NOT rendered anymore (steps use a solid border); kept in the data model
}

interface WorkflowSpec {
  name: string
  description: string
  entity?: string                  // which entity this workflow governs
  steps: WorkflowStep[]
}
```

**Layout algorithm** (`buildWorkflowLayout` in `AppSpecView.tsx`) — a graph layout, not a grid. The authored `column` field is **ignored**; positions come from the graph structure:
1. **Build the node/edge set.** Add a synthetic `__start__` and `__finish__`. `__start__` → the root step(s) (steps no other step points to). For a branching step (`next.length > 1`), insert a synthetic **diamond** node (`dia:<id>`) between the step and its targets. Terminal steps (`next: []`) → `__finish__`.
2. **Columns = longest path from Start** (Kahn topological order) — so every node gets its own column and the flow reads horizontally. The branch step, its diamond, the parallel steps, and the convergence step each land in successive columns.
3. **Rows** — the spine sits on row 0. A diamond spreads its children symmetrically one row apart (a 2-way branch → rows −0.5 / +0.5); a convergence node (in-degree > 1) returns to row 0.
4. **Geometry** — each column is sized to its widest node and columns are spaced a fixed `columnGap` apart (uniform edge-to-edge horizontal spacing); rows are a fixed `rowHeight` apart. `WF_LAYOUT` holds the constants: `columnGap`, `rowHeight`, `chipWidth`, `chipHeight`, `finishWidth`, `finishHeight`, `diamondSize`, `padding`.

**Node types** (registered in `workflowNodeTypes`, all in `AppSpecView.tsx`):
- **`terminal`** — the **Start** and **Completed** cards.
  - **Start** — a step-like chip (`chipWidth × chipHeight`): `bg var(--blue-100)`, `border var(--blue-400)`, title text `var(--blue-700)`, and an assignee row (`User` icon + **initiator role(s)**) in `var(--blue-600)`. Initiators are the owners of the root step(s).
  - **Completed** — a narrower, shorter green card (`finishWidth × finishHeight`), centered text, no assignee: `bg var(--green-100)`, `border var(--green-400)`, text `var(--green-700)`. (Replaces the old "Finish" pill.)
- **`stepChip`** — an orange step card (`bg var(--orange-100)`, `border var(--orange-400)` solid, title `var(--orange-700)`). Shows the **step name** then an assignee row (`User` icon + the **role**). A step whose `assignee === UNDEFINED_ASSIGNEE` shows an italic **"Conditional"** in place of the role. **No** number badge, **no** raw condition text, **no** hover tooltip. Fixed height so its centre aligns to the spine.
- **`diamond`** — a decision node before a branch. Rendered as an **inline SVG `<polygon>`** (not a CSS clip-path, so the border is visible): `fill var(--purple-100)`, `stroke var(--purple-400)` solid, `strokeWidth 1.5`.

**Edges** (`buildWorkflowLayout` + a custom `curve` edge type):
- **Same-row** edges (the spine) → `type: 'straight'`, thin gray (`stroke var(--gray-500)`, `strokeWidth 1`).
- **Row-changing** edges (branch fan-out / merge) → `type: 'curve'` — a custom `CurveEdge` that draws a smooth **bezier** (`getBezierPath`), `strokeWidth 1.25`.
- All edges connect `source-right → target-left` (hidden handles) with an `ArrowClosed` marker in `var(--gray-500)`.

**Canvas** — the `ReactFlow` is a **pan + zoom** surface inside a **fixed-height (360px)** container:
- `panOnDrag`, `zoomOnScroll`, `zoomOnPinch`, `zoomOnDoubleClick` enabled; `minZoom 0.3`, `maxZoom 2`; **default zoom 100%** via `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` (no `fitView`).
- `<Controls showInteractive={false} position="bottom-right" />` gives zoom-in / zoom-out / fit-view buttons; `<Background variant={Dots} color="var(--gray-300)" />` draws the canvas grid.
- Nodes stay read-only: `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`; `proOptions={{ hideAttribution: true }}`.

**Modelling the branch / dynamic-assignee cases:**

| Scenario | Data pattern |
|---|---|
| Linear flow | `next: [nextId]` on every step |
| Conditional branch (fork) | Predecessor's `next: [a, b]` — a diamond is auto-inserted; a & b fan out and (typically) converge |
| Convergence | Multiple steps' `next` arrays all point at the same successor step (returns to the spine) |
| Dynamic-assignee step | `assignee: UNDEFINED_ASSIGNEE` — the chip shows an italic "Conditional" instead of a role |

The Vendor Onboarding Approval and Expense Claim Approval workflows are the canonical branch/convergence examples.

**Adding a new app to the Spec:**
1. Author an `AppSpec` entry in `lib/app-specs.ts` and register it in `APP_SPECS`.
2. `AppSpecView` picks it up by id; no other wiring. If no entry exists, it renders a "No spec yet" empty state.

**Visual language borrowed from `/new/app` creation flow:** the RightPane in `components/new-app/AppCreatingView.tsx` uses the same section shape, field-type badges, and permission chips — the Spec is intentionally the same visual so users see the same document during creation and after the app is live.

---

## 2. Build

**Purpose:** The actual low-code builder — sidebar, tab bar, and per-tab editors (DataForm, Board, Process, List, Page, Navigation, etc.).

**Fallback branch** after the spec conditional. This is the original builder UI: `BuilderSidebar` + `BuilderTabBar` + tab-specific editor components (`FormBuilder`, `ListEditor`, `PageEditor`, `NavigationEditor`, etc.) plus the `BuilderUtilityBar`.

See the root `CLAUDE.md` § "BuilderUtilityBar Buttons by Tab Type" and `ComponentsProperties.md` for the styling spec of this mode.
