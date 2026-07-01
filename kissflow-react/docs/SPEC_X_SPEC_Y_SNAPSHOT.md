# Spec X / Spec Y — Structural + Design Snapshot

> **HISTORICAL — this UI is no longer in the code.** Spec X and Spec Y were removed from the Builder on 2026-07-01 in favour of a single Spec mode driven by per-app content in `lib/app-specs.ts`. The current Builder ships **Play / Spec / Build**. Read [`BUILDER_MODES.md`](BUILDER_MODES.md) for the live docs.
>
> This file is preserved as the structural reference for the old modes — mock data shapes, section layouts, and design intent — in case anything from it needs to be brought back or referenced. All line numbers below are relative to the pre-removal state and no longer resolve.
>
> **Original intent (kept for context):** Spec X and Spec Y were readable specification documents, not configuration editors. This is a frozen reference of how they were built **as of 2026-06-30**.
>
> **Design rule (don't lose this):** Spec X and Spec Y are **readable specification documents, not configuration editors**. Removing editor UI ≠ removing content — every editor field in Build mode must map to a prose/table analogue in the spec.

---

## File map (as of snapshot)

| File | Purpose | Key lines |
|---|---|---|
| `components/builder/BuilderLayout.tsx` | Owns mode state, all mock data, every Spec-X / Spec-Y section's JSX | mock data ~117–574; Spec X branch starts line 1648; Spec Y branch ~2114 |
| `components/builder/BuilderTopBar.tsx` | The four-mode toggle (Play / Spec X / Spec Y / Build) | toggle ~434–482 |
| `components/builder/ViewsSection.tsx` | Renders view spec cards; called from both Spec X and Spec Y when section = "views" | `viewSpecs` map ~58 onwards |
| `components/builder/NavigationsSection.tsx` | Renders navigation specs; consumed by both spec modes | — |

Line numbers will drift. Treat them as bookmarks, not contracts.

---

## State variables

All held in `BuilderLayout`. Initial values are the prototype defaults shown.

| State | Type | Initial | Used by |
|---|---|---|---|
| `mode` | `'play' \| 'spec-x' \| 'spec-y' \| 'build'` | `'play'` (parent) / `'build'` (prop default — dead) | every mode branch |
| `selectedBlueprintSection` | `string` | `'roles'` | Spec X left nav + Spec Y top-level pick |
| `selectedDataEntity` | `string` | `mockDataEntities[0].id` (= `'1'`, Leave Request) | Spec X right pane (Data entities inner list) |
| `showRelationships` | `boolean` | `false` | Spec X Data entities → "Show relationships" modal |
| `expandedSection` | `string` | `'roles'` | Spec Y left-nav accordion (single open at a time) |
| `selectedEntityInSpecY` | `string \| null` | `null` | Spec Y tree → selected entity |
| `selectedWorkflow` | `string \| null` | `null` | Both modes; falls back to first workflow if null |
| `selectedRole` | `string \| null` | `null` | Both modes; falls back to first role if null |
| `selectedViewInSpecX` | `{ entityId, viewName } \| null` | `null` | Spec X "Views" inner selection (passes `focusedView` to `ViewsSection`) |
| `selectedViewInSpecY` | `{ entityId, viewName } \| null` | `null` | Spec Y views tree selection |
| `selectedReportInSpecX` / `Y` | `{ entityId, reportName } \| null` | `null` | Reports analogue of the views selection |
| `selectedNavigationInSpecX` / `Y` | `string \| null` | `null` | Selected navigation in either spec mode |
| `dataEntityTab` | `'fields' \| 'permissions'` | `'fields'` | Inner tab on entity detail card |

---

## Mock data — exact shapes

The Spec modes are powered entirely by these in-file mocks. There is **no backend** for spec data; everything is hardcoded in `BuilderLayout.tsx`.

### `mockDataEntities` (6 entries)

```ts
{
  id: string                          // '1'..'6'
  name: string
  type: 'Data Form' | 'Board' | 'Process'
  fields: Array<{
    name: string
    type: string                      // 'Text' | 'Dropdown' | 'Date' | 'Multi-line Text' | 'User' | 'Number' | 'Yes/No' | 'Multi-select' | 'Email' | ...
    id: string                        // snake_case
    required: boolean
  }>
}
```

| id | Name | Type | Field count |
|---|---|---|---|
| 1 | Leave Request | Process | 7 |
| 2 | Leave Balance | Data Form | 6 |
| 3 | Holiday Calendar | Data Form | 5 |
| 4 | Time-off Policy | Data Form | 7 |
| 5 | Approval Workflow | Board | 6 |
| 6 | Employee Directory | Data Form | 6 |

Entity-type icon mapping (rendered as small pills in the entity list):

| Type | Icon | Color |
|---|---|---|
| Data Form | `ClipboardList` | `text-blue-600` / `bg-blue-50` |
| Board | `Grid3x3` | `text-purple-600` / `bg-purple-50` |
| Process | `Workflow` | `text-orange-600` / `bg-orange-50` |

> Note: these are Tailwind defaults (not brand palette). Pre-dates the brand-palette discipline; flag in any restoration.

### `mockWorkflows` (2 entries — only Process + Board entities have workflows)

```ts
type WorkflowAssignee =
  | { kind: 'user'; initials: string; name: string; bgColor: string }
  | { kind: 'mapping'; label: string }    // e.g. "Employee.Reporting Manager"

interface Workflow {
  id: string                    // 'wf-1', 'wf-2'
  entityId: string              // matches mockDataEntities.id
  entityName: string
  entityType: 'Process' | 'Board'
  steps: Array<{
    id: string
    name: string
    description: string
    assignee: WorkflowAssignee
    trigger: string             // e.g. 'When submitted', 'Happens always'
    isStart?: boolean
  }>
}
```

- `wf-1` → Leave Request (Process): 5 steps — Draft, Manager Review, HR Approval, Approved, Rejected
- `wf-2` → Approval Workflow (Board): 4 levels — Backlog, In Progress, Review, Done

### `mockRoles` (3 entries)

```ts
{
  id: string                    // 'role-1' Employee, 'role-2' Manager, 'role-3' HR Admin
  name: string
  description: string
  color: string                 // bg-blue-100 / bg-green-100 / bg-purple-100
  textColor: string             // text-blue-700 / text-green-700 / text-purple-700
  permissions: Array<{
    entityId: string
    entityName: string
    canView: boolean
    canCreate: boolean
    canEdit: 'all' | 'own' | 'none'
    canDelete: boolean
    fieldPermissions: Array<{ fieldId: string; canView: boolean; canEdit: boolean }>
    actionPermissions: Array<{ action: string; allowed: boolean }>
  }>
}
```

| Role | Description | Visible entities |
|---|---|---|
| Employee | "Regular employees who can submit and view their own requests" | Leave Request, Leave Balance |
| Manager | "Team managers who can approve/reject team member requests" | Leave Request, Leave Balance, Approval Workflow |
| HR Admin | "HR administrators with full access" | All 4 of the above + Holiday Calendar, Time-off Policy |

### `mockViews` (19 entries, grouped by entity)

```ts
{ entityId: string; name: string; type: 'Table' | 'Gallery' | 'Sheet' | 'Kanban' | 'List' | 'Matrix' | 'Timeline' }
```

Convention enforced:
- **Data Form entities** → views can be `Table` / `Gallery` / `Sheet`
- **Board entities** → views can be `Kanban` / `List` / `Matrix` / `Timeline`
- **Process entities** → fixed 4 views all of type `Table`: **My Items**, **My Tasks**, **Participated Items**, **Admin Items** (product convention, do not rename)

### `mockReports` (~17 entries)

```ts
{
  entityId: string
  name: string
  type: 'Table' | 'Chart' | 'Pivot' | 'Card'
  chartSubtype?:
    | 'Area' | 'Stacked Area'
    | 'Horizontal Bar' | 'Vertical Bar'
    | 'Stacked Horizontal Bar' | 'Stacked Vertical Bar'
    | '100% Stacked Vertical Bar' | '100% Stacked Horizontal Bar'
    | 'Line' | 'Combo' | 'Scatter'
    | 'Pie' | 'Doughnut'
  description?: string
}
```

Each report carries a short prose description that gets rendered verbatim in the spec.

### `mockNavigations` (2 entries: Employee Nav, HR Nav)

```ts
interface NavigationData {
  id: string                // 'nav-1', 'nav-2'
  name: string
  items: Array<{
    id: string
    label: string
    pageName?: string       // present on leaf
    children?: NavigationItem[]   // present on branch
  }>
}
```

Branches can have 1 level of nested children (e.g. HR Nav > Requests > Pending).

### `permissionColumnsForEntityType(type)` helper

```ts
'Data Form' → ['Read-only', 'Edit', 'Manage']
'Board'     → ['Read-only', 'Initiate', 'Edit', 'Manage']
'Process'   → ['Initiate', 'Manage']
```

Drives the column set in the permissions tables. The role's actual selected level per entity is derived by `roleSelectedPermForEntity(role, entityId, cols)` via a priority cascade (Manage > Edit > Initiate > Read-only).

---

## Spec X — Structure

### Outer layout

```
┌─────────────────────────────────────────────────────────────┐
│ BuilderTopBar (mode toggle pinned center)                   │
├─────────────────────────────────────────────────────────────┤
│ BuilderTabBar                                                │
├──────────────┬──────────────────────────────────────────────┤
│ CopilotPanel │ Spec main area                               │
│   ~320px     │                                              │
│              │   ┌─ App header card ──────────────────────┐ │
│              │   │ 40x40 icon (appIconBg) + name + desc   │ │
│              │   └────────────────────────────────────────┘ │
│              │   ┌─ Blueprint frame ──────────────────────┐ │
│              │   │ ┌─ Nav 180px ──┬─ Content pane ──────┐ │ │
│              │   │ │ 8 sections  │ section-specific UI │ │ │
│              │   │ └─────────────┴─────────────────────┘ │ │
│              │   └────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

### Frame styling tokens

| Element | Class |
|---|---|
| Main pane wrapper | `flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white pr-2 pb-2` |
| App header card | `bg-gray-50 border border-gray-200 rounded-lg p-4` |
| App icon container | `w-10 h-10 rounded-lg flex items-center justify-center` (uses inline `style={{ backgroundColor: appIconBg }}`) |
| App name | `text-base font-semibold text-gray-900` |
| App description | `text-[13px] text-gray-600 leading-relaxed` |
| Blueprint frame | `bg-white border border-gray-200 rounded-lg flex flex-1` |
| Left nav | `w-[180px] border-r border-gray-200 p-3 flex-shrink-0` |
| Nav button (active) | `bg-blue-50 text-blue-700 font-medium` |
| Nav button (inactive) | `text-gray-700 hover:bg-gray-100` |
| Nav button (common) | `w-full text-left px-2.5 py-1.5 text-[13px] rounded-md flex items-center gap-2` |
| Nav icon | `h-3.5 w-3.5 text-gray-500 flex-shrink-0` |

### Left nav — 8 sections in order

| Order | `selectedBlueprintSection` key | Label | Icon |
|---|---|---|---|
| 1 | `roles` | App Roles | `UserKey` |
| 2 | `data-entities` | Data entities | `Database` |
| 3 | `workflows` | Workflows | `Workflow` |
| 4 | `permissions` | Permissions | (TBD — see code) |
| 5 | `views` | Views | (TBD) |
| 6 | `reports` | Reports | (TBD) |
| 7 | `interface` | Interface | (TBD) |
| 8 | `integrations` | Integrations | (TBD) |

### Per-section content

| Section | Right-pane structure |
|---|---|
| **App Roles** | One static card per role (Employee / Manager / HR Admin). Each card has the role name, description, and a list of capabilities with green-check bullets. |
| **Data entities** | Inner two-column: **left list 200px** of entities (type-icon + name); **right detail** showing the selected entity. Detail has: header bar with name + type pill + "Shared with" avatar stack + **"Show relationships"** button. Below: tab strip (`'fields' \| 'permissions'`). Fields tab → table (Field Name / Type / ID / Required). Permissions tab → matrix of role × column set (from `permissionColumnsForEntityType`). |
| **Workflows** | One card per workflow. Inside each card: **vertical timeline** of numbered circular step nodes connected by a vertical line. Each step renders step name, description, assignee (user avatar OR mapping label), and trigger. `selectedWorkflow` falls back to first workflow if null. |
| **Permissions** | One table per role × entity. Columns include View / Create / Edit (all/own) / Delete plus action-permission chips. `selectedRole` falls back to first role if null. |
| **Views** | Delegates to `<ViewsSection>` with `entities`, `views`, and an optional `focusedView` (from `selectedViewInSpecX`). Each entity's views are grouped together. **Data Form views** render a full spec card (see below). **Board / Process views** are listed as simple rows (rich spec TBD). |
| **Reports** | One section per entity. Each report renders type + chartSubtype + the verbatim description from the mock. |
| **Interface** | Renders the `mockNavigations` via `NavigationsSection`. |
| **Integrations** | Placeholder ("coming soon"). |

### Relationships modal (Data entities → "Show relationships")

- Opens at **900×700**.
- Renders a React Flow diagram of entity edges.
- Edge style: animated smoothstep.
- Toggled via `showRelationships` state.

### `ViewsSection` — Data Form view spec card

Each Data Form view emits a card containing:

1. **Description** — one-line prose from `viewSpecs[\`${entityId}-${viewName}\`].description`
2. **Columns table** — three columns: Field / Type / Permission. Permission chips:
   - **Editable** — pencil icon, gray-700 text
   - **Read-only** — lock icon, gray-500 text
   - **Hidden** — eye-off icon, gray-400 text
3. **Data filter** — single-sentence prose (e.g. "Year equals the current calendar year")
4. **Quick filters** — comma-separated list (e.g. "Leave Type")
5. **Bulk actions** — comma-separated list (e.g. "Export to CSV, Recalculate balance")
6. **Default sort** — sentence ("Sort by Employee, ascending")
7. **Table style** — string token (e.g. "Basic")

Specs keyed by `${entityId}-${viewName}` in `viewSpecs: Record<string, ViewSpec>`. Adding a view to `mockViews` does **not** auto-create a spec — the spec card falls back to a basic header until a `viewSpecs` entry is added.

`ViewType` icon mapping inside `ViewsSection`:

| ViewType | Icon |
|---|---|
| Table | `TableIcon` |
| Gallery | `LayoutGrid` |
| Sheet | `Sheet` |
| Kanban | `KanbanSquare` |
| List | `List` |
| Matrix | `Grid3x3` |
| Timeline | `GanttChart` |

---

## Spec Y — Structure

### Outer layout

Same outer chrome as Spec X (BuilderTopBar + TabBar + CopilotPanel ~320px + main pane). The difference is **inside** the blueprint frame.

```
┌──────────────┬──────────────────────────────────────────────┐
│ CopilotPanel │ Spec main area                               │
│              │   ┌─ App header card (same) ───────────────┐ │
│              │   ├─ Blueprint frame ──────────────────────┤ │
│              │   │ ┌─ Nav 220px ────┬─ Content (full) ───┐│ │
│              │   │ │ Expandable     │ Full-width detail  ││ │
│              │   │ │ tree, 1 open   │ for selected item  ││ │
│              │   │ └────────────────┴────────────────────┘│ │
│              │   └─────────────────────────────────────────┘│
└──────────────┴──────────────────────────────────────────────┘
```

### Nav tree shape (single-open accordion, governed by `expandedSection`)

```
App Roles                     (leaf — same content as Spec X roles section)
Data entities       ▾/▸
  • Leave Request
  • Leave Balance
  • Holiday Calendar
  • Time-off Policy
  • Approval Workflow
  • Employee Directory
Workflows           ▾/▸
  • Leave Request (Process)
  • Approval Workflow (Board)
Permissions         ▾/▸
  • Employee
  • Manager
  • HR Admin
Views               ▾/▸
  • Leave Request — My Items / My Tasks / Participated Items / Admin Items
  • Leave Balance — All Balances / Employee Cards / Bulk Edit
  • ... (grouped under each entity)
Reports             ▾/▸
  • (grouped per entity, same as Views)
Interface           ▾/▸
  • Employee Nav
  • HR Nav
Integrations                  (leaf — coming soon)
```

### Right-pane resolution rule

- Parent section selected with nothing nested → overview (e.g. all 3 role cards for "App Roles") **or** a hint ("Select a data entity from the left navigation").
- Nested item selected → full-width detail for that single item only.

### Differences from Spec X

| Dimension | Spec X | Spec Y |
|---|---|---|
| Nav width | 180px | 220px |
| Nav style | Flat list | Expandable tree, 1 section open at a time |
| Item selection lives in | Content pane (inner list) | Left nav |
| Content pane | Split (list + detail) for entities | Full-width detail |
| Same sections | ✔ (all 8) | ✔ (all 8) |
| Same mock data | ✔ | ✔ |

---

## Shared visual conventions across both modes

| Pattern | Style |
|---|---|
| App header card | Gray-50 bg, gray-200 border, rounded-lg, 16px padding, 40×40 icon, semibold title, 13px description |
| Blueprint frame | White bg, gray-200 border, rounded-lg, flexes to fill |
| Active nav button | `bg-blue-50 text-blue-700 font-medium` |
| Inactive nav button | `text-gray-700 hover:bg-gray-100` |
| Spec card | White bg, gray-200 border, rounded-lg, internal sub-headers in `text-xs uppercase tracking-wide font-medium text-gray-500` style |
| Permission chip — Editable | `text-gray-700` + `Pencil h-3 w-3` icon |
| Permission chip — Read-only | `text-gray-500` + `Lock h-3 w-3` icon |
| Permission chip — Hidden | `text-gray-400` + `EyeOff h-3 w-3` icon |
| Workflow step circle | Numbered, vertically connected by a 2px gray-200 line |
| Entity-type pill | Per type — see entity-type icon mapping table above |

---

## Things to preserve if rebuilding

1. **The split design intent**: Spec X = stable nav + inner item selection; Spec Y = tree-driven, full-width detail. Both reach the same content, just route through it differently.
2. **The "no edit" contract**: Spec X/Y never expose dropdowns, modals (except read-only ones like the relationships diagram), or "Manage >" buttons. Everything is read-only prose / tables / cards.
3. **Process view names are fixed**: My Items / My Tasks / Participated Items / Admin Items — product convention.
4. **`viewSpecs` is the spec source for Data Form views**. Without an entry, a view degrades to a stub. Don't move the spec into `mockViews` itself — keeping them separate lets you have a view exist without a written spec yet.
5. **Single mock source**: all spec data lives in `BuilderLayout.tsx`. If you move it out, both Spec X and Spec Y branches need to read from the same place.
6. **`permissionColumnsForEntityType`**: keep the cascade (Manage > Edit > Initiate > Read-only) for the role-permission inference.
7. **Workflow timeline is vertical**, not horizontal — matches Kissflow product convention.
8. **Relationships modal is read-only React Flow** — animated smoothstep edges, 900×700 footprint.

---

## Known debt at snapshot time

- Entity-type icon mapping uses Tailwind default colors (`text-blue-600`, `bg-blue-50`, `text-orange-600` etc.). The `-50` shade isn't in the brand palette; these would need to migrate to brand tokens during any rebuild. See [`COLORS.md`](COLORS.md) "Brand palette only" section.
- Board and Process views render as simple rows in `ViewsSection` (no full spec card yet). Listed in `BUILDER_MODES.md` as "rich spec to be added later."
- Reports / Interface / Integrations placeholders in Spec X — Reports has real data, others are stubs.
- `BuilderTopBar`'s prop default for `mode` is `'build'` but `BuilderLayout` always passes a value, so the prop default is dead code.
