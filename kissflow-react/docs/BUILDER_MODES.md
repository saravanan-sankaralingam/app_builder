# Builder Top-Bar Modes

> **Important design rule:** Spec X and Spec Y are **readable specification documents**, not configuration editors. They translate the app's technical configuration into prose for a non-technical reader. Anything interactive (dropdowns, pickers, modals, "Manage >" buttons) belongs in **Build mode**, not Spec.


The Builder header exposes a centered toggle group with four modes that swap the entire main area below the header. The toggle lives in `components/builder/BuilderTopBar.tsx` (lines ~434-482); the layout switching lives in `components/builder/BuilderLayout.tsx` (initial state at line ~463, branches at lines ~1433 / ~1459 / ~2114 and the fallback `build` branch after).

State: `mode: 'play' | 'spec-x' | 'spec-y' | 'build'`. The parent (`BuilderLayout`) initializes to `'play'`; the `BuilderTopBar` prop default is `'build'` but the parent always passes a value, so the prop default is dead.

---

## 1. Play

**Purpose:** Live runtime preview of the app being built. No spec or builder chrome — what end-users would see.

**Layout:**
```
┌─────────────┬─────────────────────────────────┐
│ CopilotPanel│ AppRuntimePreview               │
│   (~320px)  │ (fills remaining width)         │
└─────────────┴─────────────────────────────────┘
```

**Content:**
- Left: `CopilotPanel` — chat-style assistant scoped to the app. Can add pages to the preview via `addNavItemCallback` and switch the preview to a specific page via `switchToPageCallback`.
- Right: `AppRuntimePreview` — the app as it would run, wrapped in a rounded top-left container with `pr-2 pb-2` outer spacing.

**Use it when:** You want to demo or sanity-check the app's runtime behaviour from the builder.

---

## 2. Spec X

**Purpose:** Browse the app's specification as a flat blueprint. Two layers of selection: top-level section (fixed left nav) and a sub-item (inner list inside the content pane).

**Layout:**
```
┌─────────────┬──────────────────────────────────────────────┐
│ CopilotPanel│ ┌─ App header card (icon + name + desc) ──┐ │
│             │ ├─ Blueprint frame ────────────────────────┤ │
│             │ │ ┌─ Nav (180px) ─┬─ Content pane ────────┐│ │
│             │ │ │ App Roles     │ section-specific UI   ││ │
│             │ │ │ Data entities │                       ││ │
│             │ │ │ Workflows     │                       ││ │
│             │ │ │ Permissions   │                       ││ │
│             │ │ │ Interface     │                       ││ │
│             │ │ │ Integrations  │                       ││ │
│             │ │ └───────────────┴───────────────────────┘│ │
│             │ └──────────────────────────────────────────┘ │
└─────────────┴──────────────────────────────────────────────┘
```

**Left nav (flat, 180px wide):** App Roles · Data entities · Workflows · Permissions · Views · Reports · Interface · Integrations.

**Right content per section:**

| Section | What it shows |
|---|---|
| **App Roles** | Static cards per role (Employee / Manager / HR Admin) with green-check capability bullets |
| **Data entities** | Inner two-column: 200px entity list (left) + selected entity details (right). Details include "Shared with" avatars and a Field Name / Type / ID / Required table. Header has a **"Show relationships"** button that opens a 900×700 modal with a React Flow diagram of entity edges (animated smoothstep). |
| **Workflows** | Card per workflow with a **vertical timeline** of numbered circular step nodes connected by a vertical line, step name and description to the right of each circle. Process entities show approval steps; board entities show levels. Matches the Kissflow product convention of vertical workflows. |
| **Permissions** | One table per role × entity with View / Create / Edit (all/own) / Delete columns plus action-permission chips |
| **Views** | Renders `ViewsSection` (`components/builder/ViewsSection.tsx`). Views grouped by data entity. **Data Form views show a full spec card** per view: description + Columns table (Field / Type / Permission with Editable / Read-only / Hidden chips) + Data filter sentence + Quick filters list + Bulk actions list + Default sort sentence + Table style. **Board and Process views** are listed as simple rows for now (rich spec to be added later). DataForm view types: Table/Gallery/Sheet. Board: Kanban/List/Matrix/Timeline. Process: My Items / My Tasks / Participated Items / Admin Items (all Table) — Process view names are product convention. Per-view config lives in `viewSpecs` inside `ViewsSection.tsx`. |
| **Reports** | Placeholder ("coming soon") |
| **Interface** | Placeholder ("coming soon") |
| **Integrations** | Placeholder ("coming soon") |

**Key state:** `selectedBlueprintSection`, `selectedDataEntity`, `showRelationships`.

---

## 3. Spec Y

**Purpose:** Same blueprint content as Spec X, but collapses the two layers of selection into one expandable tree in the left nav, freeing the right pane to be full-width for the selected item.

**Layout:**
```
┌─────────────┬──────────────────────────────────────────────┐
│ CopilotPanel│ ┌─ App header card ───────────────────────┐ │
│             │ ├─ Blueprint frame ────────────────────────┤ │
│             │ │ ┌─ Nav (220px) ──┬─ Content (full) ─────┐│ │
│             │ │ │ App Roles       │ Full-width detail   ││ │
│             │ │ │ ▾ Data entities │ for whatever is     ││ │
│             │ │ │   • Employee... │ selected in the     ││ │
│             │ │ │   • Leave Req.. │ tree.               ││ │
│             │ │ │ ▸ Workflows     │                     ││ │
│             │ │ │ ▸ Permissions   │                     ││ │
│             │ │ │ Interface       │                     ││ │
│             │ │ │ Integrations    │                     ││ │
│             │ │ └─────────────────┴─────────────────────┘│ │
│             │ └──────────────────────────────────────────┘ │
└─────────────┴──────────────────────────────────────────────┘
```

**Left nav (expandable tree, 220px wide):**
- App Roles (leaf)
- Data entities ▸ expands to list each entity inline
- Workflows ▸ expands to list each workflow inline
- Permissions ▸ expands to list each role inline
- Views ▸ expands to list each view grouped by entity inline — selecting a view shows just that view's spec card in the right pane (via `ViewsSection`'s `focusedView` prop)
- Reports (leaf)
- Interface (leaf)
- Integrations (leaf)

Only one section expands at a time (`expandedSection` state, single-string).

**Right pane behaviour:**
- Pick a parent section with nothing nested selected → overview content (e.g., roles cards) or a hint ("Select a data entity from the left navigation").
- Pick a nested entity / workflow / role → full-width detail view for that single item.

**Key state:** `expandedSection`, `selectedBlueprintSection`, `selectedEntityInSpecY`, `selectedWorkflow`, `selectedRole`.

---

## 4. Build

**Purpose:** The actual low-code builder — sidebar, tab bar, and per-tab editors (DataForm, Board, Process, List, Page, Navigation, etc.).

**Fallback branch** after the spec-y conditional. This is the original builder UI: `BuilderSidebar` + `BuilderTabBar` + tab-specific editor components (`FormBuilder`, `ListEditor`, `PageEditor`, `NavigationEditor`, etc.) plus the `BuilderUtilityBar`.

See `CLAUDE.md` § "BuilderUtilityBar Buttons by Tab Type" and `ComponentsProperties.md` for the styling spec of this mode.

---

## Comparing Spec X vs Spec Y

| | Spec X | Spec Y |
|---|---|---|
| Nav width | 180px | 220px |
| Nav style | Flat list | Expandable tree |
| Where item-selection happens | Inside content pane (inner list) | Inside left nav |
| Content pane | Split (list + detail) for entities | Full-width detail |
| Top-level sections | Same six | Same six |
| Underlying data | Same mocks (`mockDataEntities`, `mockWorkflows`, `mockRoles`) | Same mocks |

Open design question: which model to keep. Spec X gives a stable nav and lets the user scan a section's items without committing; Spec Y is more compact and gives more room to detail content but hides the item list one click deeper when collapsed.
