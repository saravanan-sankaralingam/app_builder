# Right pane spec — design snapshot (for recovery)

Snapshot of the right-pane spec document inside `components/new-app/AppCreatingView.tsx` as it stands today, before we explore a richer design.

If a future change goes wrong, restore from this doc.

## Overall structure

```
RightPane
├── Card frame  (bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[soft glassmorphism])
├── Pinned header (p-5 flex-shrink-0)
│   └── AppIdentity card (rounded-xl p-4, linear-gradient(135deg, purple-100 → magenta-100), 1px purple-300 border)
│        ├── App name — 16px semibold gray-900
│        └── Description — 13px gray-600 leading-relaxed (60-char min, else FALLBACK_DESCRIPTION)
└── Scrollable body (flex-1 overflow-y-auto px-10 py-7 space-y-9)
     ├── Section: "Roles"
     ├── Section: "Data entities"
     ├── Section: "Pages"
     └── Section: "Navigation"
```

Outer container uses `h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col`. Width is `7fr` of the grid (vs `5fr` left).

## Section heading style

- Component: `Section({ title, status, children })`
- Layout: `flex items-center gap-2.5 mb-4`
- **No icon** on the section heading
- Title: `text-[18px] font-semibold text-gray-900 tracking-tight leading-snug`
- Status pill: right-aligned
  - `generating` → magenta-50 bg + magenta-100 border + 1.5px pulsing magenta-500 dot (using `ai-pulse-ping`) + "Generating" text in magenta-700, 11px font-medium
  - `done` → green-50 bg + green-100 border + `Check` icon (2.5×2.5, strokeWidth 3.5) + "Generated" text in green-700

## Item-level icon colors (per section)

| Section | Icon | Color |
|---|---|---|
| Roles | `Users` (lucide) | `var(--magenta-500)` |
| Data entities | `Database` (lucide) | `var(--green-500)` |
| Pages | `FileText` (lucide) | `var(--blue-500)` |
| Navigation | (no per-item icon) — tree bullets `•`, connectors `└`, arrows `→` | `var(--purple-500)` |

Icon size: 18×18 (16×16 on entity table title). strokeWidth 1.75.

## Per-section bodies

### Roles (`RoleList` component, 3 roles)

Each role row:
- Outer: `flex gap-3 ai-fade-up` with 80ms-staggered animationDelay
- Users icon (18×18, magenta-500, strokeWidth 1.75, mt-0.5)
- Content column (flex-1 min-w-0):
  - Role name — 14px semibold gray-900 leading-snug
  - Bulleted `<ul className="mt-2 space-y-1.5">` of 4 responsibilities
    - Each `<li>` — `text-[13px] text-gray-600 leading-relaxed flex gap-2`
    - Bullet: `•` in gray-400 + select-none
- Outer ul spacing: `space-y-5`

Roles content (truncated):
- **Vendor Manager** — 4 bullets about lifecycle, handoffs, reviews, offboarding
- **Procurement Lead** — 4 bullets about commercial terms, proposals, sign-off, escalations
- **Compliance Officer** — 4 bullets about docs, insurance, risk, regulations

### Data entities (`EntityTable` component, 3 entities)

Each entity is a vertical card:
- Outer: `flex gap-2.5 ai-fade-up`
- Database icon (18×18, green-500, mt-0.5)
- Content column (flex-1 min-w-0):
  - Entity name — 14px semibold gray-900 leading-snug
  - Description (13px gray-600 leading-relaxed mt-1) — 2 lines
  - **Fields table** (3 cols: Field Name / Field Type / Required)
    - `border border-gray-200 rounded-lg overflow-hidden bg-white`
    - Header: `bg-gray-50`, `text-left px-3 py-2 font-medium text-gray-700 border-b`
    - Rows: alternating with `border-b border-gray-100`
    - Loading rows show skeleton bars (90px / 60px / 32px wide × 10px tall, shimmering)
  - **Permissions** — title + description as a single inline paragraph (`Permissions — Who can view, edit, or fully manage X records. Each role has exactly one permission level.`)
    - 13px text, title span in font-semibold gray-900, rest in gray-600
    - Table (4 cols: Role / Read-only / Edit / Manage)
    - `PermissionCell({ active })` renders a green Check (3.5×3.5, strokeWidth 3, green-500) when active, else empty cell
- Entity cards separated by `space-y-6` (24px)

Permissions matrix:
| Role | Vendor | Contract | Document |
|---|---|---|---|
| Vendor Manager | Manage | Edit | Edit |
| Procurement Lead | Edit | **Manage** | Read-only |
| Compliance Officer | Read-only | Edit | **Manage** |

### Pages (`IconList` component, 5 pages)

Each page row:
- Outer: `flex gap-3 ai-fade-up` with 80ms-staggered animationDelay
- FileText icon (18×18, blue-500, strokeWidth 1.75, mt-0.5)
- Content column (flex-1 min-w-0):
  - Page name — 14px semibold gray-900 leading-snug
  - Description — 13px gray-600 leading-relaxed mt-1 — 2-3 lines

Pages content (truncated):
- **Vendor Dashboard** — overview, widgets, alerts
- **Vendor Profile** — info + history + timeline
- **Onboarding Form** — multi-step intake + approval routing
- **Renewal Tracker** — calendar + alerts + sign-off
- **Reports** — analytics + scorecards + exports

### Navigation (`NavSitemap` + `NavNode` components)

Tree structure indented per depth:
- Outer `NavSitemap`: `space-y-1.5`
- Each `NavNode`:
  - Row: `flex items-baseline text-[14px] leading-snug`, `paddingLeft: depth * 18px`
  - Bullet/connector: `•` at depth 0, `└` for nested — purple-500
  - Label: font-semibold gray-900
  - If leaf with mapped page: `→` (purple-500) + page name in gray-600
  - If parent: children rendered recursively

Tree content:
```
• Home → Vendor Dashboard
• Vendors
  └ All Vendors → Vendor Profile
  └ Add Vendor → Onboarding Form
• Renewals → Renewal Tracker
• Reports → Reports
```

## Loading states

- `SingleItemSkeleton({ icon, color, descriptionLines })` — 1 icon (in section color) + 1 title bar (48% × 14px) + N description bars (100/92/76/60% × 10px), all shimmering. Used by Roles (4 lines), Data entity Flow-active (2 lines), Pages (2 lines).
- `NavSkeleton` — small tree-shaped placeholder: 1 title bar (40% × 12px) + 2 indented bars (55%/50% × 10px) + 1 bottom bar (35% × 12px). All shimmering.
- `SkeletonBar({ width, height, shimmering })` — base helper (existing). Neutral gray base + white-band shimmer via `skeleton-shimmer-i` keyframe (1.8s loop).
- `EntityTable` rowsLoading: column headers visible, rows are skeleton bars per column.

## Timing model

- 5 agents × 4 ticks × 4s = 80s total
- `tickCount` is the single counter; `currentIdx = floor(tickCount / 4)`, `phaseIdx = tickCount % 4`
- Each section appears when its agent transitions out of 'queued' (i.e., currentIdx reaches that index)
- Resolved content + "Generated" pill appear when agent's state becomes 'done'
- No dedicated success/wait tick — agent's last rotating phase ends → next agent starts simultaneously at the same instant the previous agent's left-pane row shows the success line + green check.

## Status pill source of truth

Right-pane status pills now driven by:
- `rolesResolved = roleState === 'done'`
- `entitiesResolved = entityState === 'done'`
- `pagesResolved = pageState === 'done'`
- `navResolved = navState === 'done'`

## Key mock-data exports (search anchors)

- `MOCK_ROLES: RoleSpec[]` — 3 roles with `name` + `responsibilities: string[]`
- `MOCK_ENTITIES: EntitySpec[]` — 3 entities with `name`, `description`, `fields`, `permissions`
- `MOCK_PAGES: PageSpec[]` — 5 pages with `name`, `description`
- `MOCK_NAV: NavMenuItem[]` — 4 top-level items (Home, Vendors+submenus, Renewals, Reports)

## Color tokens used

- App identity card: `var(--purple-100)`, `var(--magenta-100)`, `var(--purple-300)`
- Pills: `bg-magenta-50`, `border-magenta-100`, `text-magenta-700`, `bg-magenta-500` (dot), `bg-green-50`, `border-green-100`, `text-green-700`
- Section icons: `var(--magenta-500)`, `var(--green-500)`, `var(--blue-500)`, `var(--purple-500)`
- Skeletons: `rgba(34, 42, 59, 0.05)` base, white-band 0.65 opacity overlay
- Tables: `border-gray-200`, `bg-gray-50` (headers), `border-gray-100` (row dividers)

## How to recover

1. Restore mock data constants (MOCK_ROLES, MOCK_ENTITIES, MOCK_PAGES, MOCK_NAV).
2. Restore the components: `Section`, `IconList`, `SingleItemSkeleton`, `NavSkeleton`, `RoleList`, `EntityNameList`, `EntityTable`, `PermissionCell`, `NavSitemap`, `NavNode`.
3. Restore the `RightPane` body order: Roles → Data entities → Pages → Navigation; each gated by its `*Resolved` flag against the resolved content vs the loader.
