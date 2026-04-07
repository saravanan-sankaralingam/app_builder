# Page Builder

## Overview

The Page Builder allows users to create custom pages using a visual drag-and-drop interface. Pages are composed of widgets that can be arranged and configured to build rich user interfaces.

## Page Editor Layout

The Page Editor has a 3-section layout below the utility bar:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Utility Bar                                        │
├──────────────┬──────────────────────────────────────────┬───────────────────┤
│ Widget Panel │              Canvas Area                 │ Properties Panel  │
│   (240px)    │               (flex)                     │     (260px)       │
│              │                                          │                   │
│ [Widgets]    │  ┌─────────────────────────────────────┐ │ [Body]           │
│ [Library]    │  │ Body                                │ │                   │
│ [Structure]  │  │                                     │ │ [Settings]        │
│              │  │       Drop widgets here             │ │ [Visibility]      │
│ ┌──┐┌──┐┌──┐ │  │                                     │ │ [Style]           │
│ │  ││  ││  │ │  │                                     │ │ [Events]          │
│ └──┘└──┘└──┘ │  │                                     │ │                   │
│              │  └─────────────────────────────────────┘ │                   │
└──────────────┴──────────────────────────────────────────┴───────────────────┘
```

---

## Left Panel - Widget Panel (240px)

### Tab Bar
3 tabs with icons positioned above text, center-aligned:

| Tab | Icon | Description |
|-----|------|-------------|
| Widgets | LayoutGrid | List of available widgets to drag onto canvas |
| Library | BookOpen | Saved widget templates and components |
| Structure | Layers | Tree view of page structure |

### Widgets Tab

Widgets are organized into 3 categories, displayed in a 3-column grid:

#### General Widgets (17 widgets)
Blue theme (`bg-blue-100`, `text-blue-600`)

| Widget | Icon | Description |
|--------|------|-------------|
| Container | Square | Generic container for grouping widgets |
| Label | Type | Text label |
| Button | RectangleHorizontal | Clickable button |
| Icon | Star | Display icons |
| Divider | Minus | Horizontal line separator |
| Breadcrumb | ChevronRight | Navigation breadcrumb |
| Card | CreditCard | Card container |
| Progress bar | Activity | Progress indicator |
| Image | Image | Display images |
| Hyperlink | Link | Clickable link |
| Iframe | Frame | Embed external content |
| Richtext | FileText | Rich text content |
| Tab | PanelTop | Tabbed content container |
| Master details | LayoutList | Master-detail layout |
| Repeater | Repeat | Repeat content from data |
| Popup | Maximize2 | Modal/popup container |
| Custom component | Puzzle | Custom coded component |

#### View Widgets (8 widgets)
Purple theme (`bg-purple-100`, `text-purple-600`)

| Widget | Icon | Description |
|--------|------|-------------|
| Form | ClipboardList | Data entry form |
| Table | Table | Data table view |
| Gallery | LayoutGrid | Gallery/grid view |
| Sheet | Sheet | Spreadsheet view |
| Kanban | Columns | Kanban board view |
| Matrix | Grid3x3 | Matrix/grid layout |
| List | List | List view |
| Timeline | Clock | Timeline view |

#### Report Widgets (5 widgets)
Emerald theme (`bg-emerald-100`, `text-emerald-600`)

| Widget | Icon | Description |
|--------|------|-------------|
| Table | Table | Report table |
| Chart | BarChart3 | Data visualization chart |
| Card | CreditCard | Report card/KPI |
| Pivot | Table2 | Pivot table |
| Metrics | Gauge | Metrics display |

### Widget Item Styling
- Icon container: 40x40px, rounded-lg
- Colored background per category
- Icon: 20x20px, colored per category
- Label: 11px, gray-600, center-aligned
- Hover: scale-110 on icon, bg-gray-50 on item

---

## Center - Canvas Area

### Container
- Background: `bg-gray-100`
- Padding: 8px (`p-2`)
- The canvas area fills remaining horizontal space (`flex-1`)

### Body Container
- Background: White (`bg-white`)
- Border radius: 4px (`rounded`)
- Shadow: Subtle (`shadow-sm`)

### Selection Indicator
When the Body (or any widget) is selected:
- Border: 1px sky-blue (`border border-sky-400`)
- Badge: Inside container, top-left corner
  - Position: 2px from border (`top-0.5 left-0.5`)
  - Background: Sky blue (`bg-sky-400`)
  - Text: White, 10px font, "Body" (or widget name)
  - Border radius: 4px (`rounded`)

### Default Behavior
- When a new page is created, the Body is selected by default
- Empty state shows "Drop widgets here" placeholder text

---

## Right Panel - Properties Panel (260px)

### Header
Uses shared `PropertyPanelHeader` component:
- Icon: Widget icon (Square for Body)
- Title: Widget name ("Body")
- Optional delete button (not shown for Body)

### Property Tabs
4 tabs in segmented button style:

| Tab | Icon | Description |
|-----|------|-------------|
| Settings | Settings | General widget settings |
| Visibility | Eye | Show/hide conditions, role-based visibility |
| Style | Palette | Styling options (colors, spacing, etc.) |
| Events | Zap | Event handlers and actions |

### Tab Styling
- Container: `bg-gray-100 rounded-lg p-1`
- Active tab: `bg-white shadow-sm text-gray-900`
- Inactive tab: `text-gray-500 hover:text-gray-700`
- Layout: Icon above label, center-aligned

---

## Key Files

| File | Description |
|------|-------------|
| `/components/builder/PageEditor.tsx` | Main page editor component |
| `/components/builder/PropertyPanelHeader.tsx` | Shared property panel header |
| `/components/builder/PageCreateDialog.tsx` | Page creation dialog |

---

## Shared Components

### PropertyPanelHeader
Reusable header component for property panels:

```tsx
interface PropertyPanelHeaderProps {
  icon?: LucideIcon
  title: string
  onDelete?: () => void
}
```

Used in:
- `FormBuilder.tsx` - For field properties
- `PageEditor.tsx` - For widget properties
