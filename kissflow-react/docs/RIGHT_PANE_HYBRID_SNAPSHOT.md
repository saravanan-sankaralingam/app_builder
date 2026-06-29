# Right pane spec — Hybrid design snapshot (for recovery)

Snapshot of the right-pane "Hybrid" design (shadcn cards + colored chips + section accent dots + visual nav cards). This was implemented after `RIGHT_PANE_SPEC_SNAPSHOT.md` (the flat-list pre-Hybrid version) and just before exploring the Editorial direction.

If a future change drifts away from this look, restore from here.

## Overall structure (unchanged from pre-Hybrid)

```
RightPane
├── Card frame  (bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[soft glassmorphism])
├── Pinned header (p-5 flex-shrink-0)
│   └── AppIdentity card (rounded-xl p-4, linear-gradient(135deg, purple-100 → magenta-100), 1px purple-300 border)
└── Scrollable body (flex-1 overflow-y-auto px-10 py-7 space-y-9)
     ├── Section: "Roles"
     ├── Section: "Data entities"
     ├── Section: "Pages"
     └── Section: "Navigation"
```

Outer container: `h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col`. Width: `7fr` of the grid.

## Section heading (new in Hybrid)

```jsx
function Section({ title, subtitle, count, accentColor, status, children }) {
  return (
    <div className="ai-fade-up">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
        <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight leading-snug">{title}</h3>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        <div className="flex-1" />
        {status === 'generating' && <PulsingPill />}
        {status === 'done' && <CheckPill />}
      </div>
      {subtitle && <p className="text-[12px] text-gray-500 mt-1 mb-4 leading-snug ml-[18px]">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div>{children}</div>
    </div>
  )
}
```

- **Accent dot** — 8×8 (`w-2 h-2 rounded-full`) before the title, colored per section:
  - Roles: `var(--magenta-500)`
  - Data entities: `var(--green-500)`
  - Pages: `var(--blue-500)`
  - Navigation: `var(--purple-500)`
- **Title** — 18px semibold gray-900
- **CountBadge** (right after title) — `text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-medium leading-none`
- **Subtitle** — 12px gray-500, indented `ml-[18px]` so it aligns under the title (not under the dot)
- **Status pill** — right-aligned, unchanged from pre-Hybrid

## Section content passed from RightPane

| Section | count | subtitle |
|---|---|---|
| Roles | `"3"` | `"Control access and responsibilities across your app"` |
| Data entities | `"3 entities · 14 fields"` (computed `MOCK_ENTITIES.reduce(acc + e.fields.length, 0)`) | `"Schema definitions with field types and per-role permissions"` |
| Pages | `"5"` | `"End-user pages composing the app interface"` |
| Navigation | `"4 top-level"` | `"Menu structure linking pages together"` |

## Helper components

### CountBadge
```jsx
function CountBadge({ children }) {
  return (
    <span className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-medium leading-none">
      {children}
    </span>
  )
}
```

### FieldTypeBadge (entity table type column)
```jsx
const FIELD_TYPE_BADGE: Record<string, string> = {
  Text: 'bg-gray-100 text-gray-700',
  Date: 'bg-blue-50 text-blue-700',
  Currency: 'bg-green-50 text-green-700',
  Reference: 'bg-purple-50 text-purple-700',
  Dropdown: 'bg-cyan-50 text-cyan-700',
  Status: 'bg-magenta-50 text-magenta-700',
  User: 'bg-purple-50 text-purple-700',
}

function FieldTypeBadge({ type }) {
  const cls = FIELD_TYPE_BADGE[type] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block text-[11px] ${cls} px-1.5 py-0.5 rounded font-medium leading-none`}>
      {type}
    </span>
  )
}
```

### PermissionChip (single-column permission display)
```jsx
const PERMISSION_BADGE = {
  read: { cls: 'bg-gray-100 text-gray-700', label: 'Read-only' },
  edit: { cls: 'bg-blue-100 text-blue-700', label: 'Edit' },
  manage: { cls: 'bg-green-100 text-green-700', label: 'Manage' },
}

function PermissionChip({ level }) {
  const { cls, label } = PERMISSION_BADGE[level]
  return (
    <span className={`inline-block text-[11px] ${cls} px-2 py-0.5 rounded font-medium leading-none`}>
      {label}
    </span>
  )
}
```

## Per-section bodies

### RoleList — shadcn cards (3 roles)

```jsx
<ul className="space-y-3">
  {items.map((item, i) => (
    <li
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all ai-fade-up"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <Users className="w-[18px] h-[18px]" strokeWidth={1.75} style={{ color: 'var(--magenta-500)' }} />
        <span className="text-[14px] font-semibold text-gray-900 leading-snug">{item.name}</span>
      </div>
      <ul className="space-y-1.5">
        {item.responsibilities.map((r, j) => (
          <li className="text-[13px] text-gray-600 leading-relaxed flex gap-2">
            <span className="text-gray-400 mt-0.5 select-none leading-snug">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </li>
  ))}
</ul>
```

### EntityTable — shadcn card with stats + colored chips (3 entities)

```jsx
<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all ai-fade-up">
  <div className="flex items-start gap-2.5">
    <Database className="w-[18px] h-[18px] mt-0.5" strokeWidth={1.75} style={{ color: 'var(--green-500)' }} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[14px] font-semibold text-gray-900 leading-snug">{entity.name}</h4>
        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
          {entity.fields.length} fields · {requiredCount} required
        </span>
      </div>
      <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{entity.description}</p>
    </div>
  </div>

  {/* Fields table: 3 cols (Field Name / Type / Required) */}
  {/* Required is a 2×2 green dot, not "Yes"/"No" */}
  {/* Type column uses <FieldTypeBadge /> */}

  {/* Permissions inline header + 2-column table */}
  {/* Permission column uses <PermissionChip /> (single column, no 3-column matrix) */}
</div>
```

Container cards separated by `space-y-3`. Inner tables: outer `border border-gray-200 rounded-lg overflow-hidden`, `bg-gray-50` headers, `border-b border-gray-100` row dividers, 12px text leading-snug.

### PageList — shadcn cards (5 pages)

```jsx
<ul className="space-y-2.5">
  {items.map((item, i) => (
    <li
      className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all ai-fade-up flex gap-3"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <FileText className="w-[18px] h-[18px] mt-0.5" strokeWidth={1.75} style={{ color: 'var(--blue-500)' }} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 leading-snug">{item.name}</p>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1">{item.description}</p>
      </div>
    </li>
  ))}
</ul>
```

### NavSitemap — purple-tinted cards with connector lines

```jsx
function NavSitemap({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => <NavCard item={item} animationDelay={i * 80} />)}
    </div>
  )
}

function NavCard({ item, animationDelay }) {
  return (
    <div
      className="rounded-xl border border-purple-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-all ai-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple-50) 60%, white), white)',
      }}
    >
      <div className="flex items-center gap-2.5 text-[14px]">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--purple-500)' }} />
        <span className="font-semibold text-gray-900">{item.label}</span>
        {!hasChildren && item.page && (
          <>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} style={{ color: 'var(--purple-400)' }} />
            <span className="text-gray-600 text-[13px]">{item.page}</span>
          </>
        )}
      </div>
      {hasChildren && (
        <div className="mt-3 pl-3 ml-1 space-y-2 border-l-2" style={{ borderColor: 'var(--purple-200)' }}>
          {item.children.map(child => (
            <div className="flex items-center gap-2 text-[13px]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--purple-400)' }} />
              <span className="font-medium text-gray-900">{child.label}</span>
              {child.page && (
                <>
                  <ArrowRight className="w-3 h-3" strokeWidth={2} style={{ color: 'var(--purple-400)' }} />
                  <span className="text-gray-600">{child.page}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Loading states (unchanged from pre-Hybrid)

- `SingleItemSkeleton({ icon, color, descriptionLines })` — icon in section color + title bar + N description bars
- `NavSkeleton` — small tree-shaped placeholder, no icon
- `SkeletonBar` — base helper, neutral gray + white shimmer

## Timing model (unchanged from pre-Hybrid)

- 5 agents × 4 ticks × 4s = 80s total
- `tickCount = floor(.../4)`, `phaseIdx = tick%4`
- Each section appears when its agent transitions out of 'queued'
- Resolved content + "Generated" pill appear when agent's state becomes 'done'

## Permission matrix (unchanged)

| Role | Vendor | Contract | Document |
|---|---|---|---|
| Vendor Manager | Manage | Edit | Edit |
| Procurement Lead | Edit | **Manage** | Read-only |
| Compliance Officer | Read-only | Edit | **Manage** |

## How to recover

1. Restore the three helper components (`CountBadge`, `FieldTypeBadge` + `FIELD_TYPE_BADGE` map, `PermissionChip` + `PERMISSION_BADGE` map).
2. Restore the `Section` signature with `subtitle`, `count`, `accentColor` props and the accent dot + count badge in the heading.
3. Restore `RoleList`, `EntityTable`, `PageList`, `NavSitemap`/`NavCard` with card chrome (`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300`).
4. Restore the Section call sites in RightPane that pass the count/subtitle/accentColor strings (see the table at the top of this doc).
