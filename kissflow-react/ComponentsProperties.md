# Dataform Properties Panel - Styling Documentation

## Global Settings

| Property | Value |
|----------|-------|
| Font Family | Inter |
| Panel Width | 288px (w-72) |
| Background | White |
| Border | None (removed) |

---

## 1. Property Panel Header

**File:** `components/builder/PropertyPanelHeader.tsx`

| Property | Value | Pixels |
|----------|-------|--------|
| Padding Horizontal | px-4 | 16px |
| Padding Vertical | py-2 | 8px |
| Border Bottom | border-gray-200 | #e5e7eb |

### Title

| Property | Value | Pixels |
|----------|-------|--------|
| Font Size | text-[14px] | 14px |
| Font Weight | font-medium | 500 |
| Color | text-gray-900 | #111827 |

### Field Type Icon

| Property | Value | Pixels |
|----------|-------|--------|
| Size | h-4 w-4 | 16x16px |
| Color | text-gray-500 | #6b7280 |
| Gap from Title | gap-2 | 8px |

### Delete Button

| Property | Value | Pixels |
|----------|-------|--------|
| Padding | p-1.5 | 6px |
| Icon Size | h-4 w-4 | 16x16px |
| Color | text-red-500 | #ef4444 |
| Hover Color | text-red-600 | #dc2626 |
| Hover Background | bg-red-50 | #fef2f2 |
| Border Radius | rounded | 4px |

---

## 2. Tab Bar Section

**File:** `components/builder/FormBuilder.tsx`

### Container

| Property | Value | Pixels |
|----------|-------|--------|
| Padding | p-0.5 | 2px |
| Border Bottom | border-gray-200 | #e5e7eb |

### Tab Bar Inner Container

| Property | Value | Pixels |
|----------|-------|--------|
| Background | bg-gray-200 | #e5e7eb |
| Padding | p-1 | 4px |
| Gap | gap-0.5 | 2px |
| Border Radius | rounded-lg | 8px |

### Tab Item (Inactive)

| Property | Value | Pixels |
|----------|-------|--------|
| Layout | flex flex-col items-center | - |
| Padding Vertical | py-1.5 | 6px |
| Border Radius | rounded-lg | 8px |
| Text Color | text-gray-700 | #374151 |
| Hover Color | text-gray-900 | #111827 |

### Tab Item (Active)

| Property | Value | Pixels |
|----------|-------|--------|
| Background | bg-white | #ffffff |
| Text Color | text-gray-900 | #111827 |
| Shadow | shadow-sm | subtle |

### Tab Icon

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| Size | h-4 w-4 (16px) | h-3.5 w-3.5 (14px) |
| Active Color | text-blue-500 | text-blue-500 |

### Tab Label

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| Font Size | text-[11px] | text-[10px] |
| Font Weight | font-medium | font-medium |

---

## 3. Tab Content Area

| Property | Value | Pixels |
|----------|-------|--------|
| Padding | p-4 | 16px |
| Overflow | overflow-auto | - |
| Flex | flex-1 | fills remaining |
| Gap Between Fields | space-y-3 | 12px |

---

## 4. Field Labels

| Property | Value | Pixels |
|----------|-------|--------|
| Padding Left | pl-0.5 | 2px |
| Font Size | text-[11px] | 11px |
| Font Weight | font-medium | 500 |
| Color | text-gray-700 | #374151 |
| Gap Below Label | space-y-1 | 4px |

---

## 5. Input Fields

**File:** `components/ui/input.tsx`

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-7 | 28px |
| Font Size | text-xs | 12px |
| Border Radius | rounded-md | 6px |
| Padding Horizontal | px-3 | 12px |
| Shadow | none | removed |
| Border | border-input | default |

### Disabled Input (Field ID)

| Property | Value |
|----------|-------|
| Background | bg-gray-100 |
| Font | font-mono |
| State | disabled |

---

## 6. Select/Dropdown

**File:** `components/ui/select.tsx`

### SelectTrigger (size="sm")

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-7 | 28px |
| Font Size | text-xs | 12px |
| Border Radius | rounded-md | 6px |
| Shadow | none | removed |

### SelectItem (Dropdown Options)

| Property | Value | Pixels |
|----------|-------|--------|
| Padding Vertical | py-3 | 12px |
| Padding Left | pl-2 | 8px |
| Padding Right | pr-8 | 32px |
| Font Size | text-xs | 12px |
| Border Radius | rounded-sm | 2px |

### SelectContent Viewport

| Property | Value | Pixels |
|----------|-------|--------|
| Padding | p-1 | 4px |
| Gap Between Items | space-y-1 | 4px |

### Dropdown Item Content

| Property | Value | Pixels |
|----------|-------|--------|
| Icon-Text Gap | gap-1 | 4px |
| Icon Size | h-3.5 w-3.5 | 14px |
| Text Size | text-xs | 12px |

---

## 7. Switch Control

**File:** `components/ui/switch.tsx`

### Track

| Property | Value | Pixels |
|----------|-------|--------|
| Width | w-7 | 28px |
| Height | h-4 | 16px |
| Border Radius | rounded-full | full |
| Checked Color | bg-blue-600 | #2563eb |
| Unchecked Color | bg-gray-400 | #9ca3af |

### Thumb

| Property | Value | Pixels |
|----------|-------|--------|
| Size | h-3 w-3 | 12px |
| Color | bg-white | #ffffff |
| Border Radius | rounded-full | full |
| Translation (checked) | translate-x-3 | 12px |

---

## 8. Field List (Settings Tab)

### Fields Included

1. **Name** - Input (editable)
2. **Field Type** - Select dropdown
3. **Required** - Switch toggle
4. **Field ID** - Input (disabled)
5. **Help Text** - Input (editable)
6. **Default Value** - Input (editable)
7. **Is this a computed field?** - Switch toggle

---

## Color Reference

| Color | Tailwind Class | Hex |
|-------|----------------|-----|
| Gray 100 | bg-gray-100 | #f3f4f6 |
| Gray 200 | bg-gray-200 | #e5e7eb |
| Gray 400 | bg-gray-400 | #9ca3af |
| Gray 500 | text-gray-500 | #6b7280 |
| Gray 600 | text-gray-600 | #4b5563 |
| Gray 700 | text-gray-700 | #374151 |
| Gray 900 | text-gray-900 | #111827 |
| Blue 500 | text-blue-500 | #3b82f6 |
| Blue 600 | bg-blue-600 | #2563eb |
| Red 500 | text-red-500 | #ef4444 |

---

## Spacing Reference

| Tailwind | Pixels |
|----------|--------|
| 0.5 | 2px |
| 1 | 4px |
| 1.5 | 6px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 7 | 28px |

---

## 9. Builder Utility Bar

**File:** `components/builder/BuilderUtilityBar.tsx`

### Container

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-11 | 44px |
| Background | bg-white | #ffffff |
| Border Bottom | border-gray-300 | #d1d5db |
| Padding Horizontal | px-4 | 16px |
| Layout | flex items-center justify-between | - |

### Title

| Property | Value | Pixels |
|----------|-------|--------|
| Font Size | text-sm | 14px |
| Font Weight | font-medium | 500 |
| Color | text-gray-900 | #111827 |

---

### View Switcher (Form/Workflow/Permission)

*Only visible for Board and Process tab types*

#### Outer Container

| Property | Value | Pixels |
|----------|-------|--------|
| Position | absolute left-1/2 -translate-x-1/2 | centered |
| Background | bg-gray-100 | #f3f4f6 |
| Padding | p-0.5 | 2px |
| Border Radius | rounded-lg | 8px |

#### Sliding Indicator (Animated Background)

| Property | Value |
|----------|-------|
| Height | h-7 (28px) |
| Background | bg-white |
| Border Radius | rounded-md (6px) |
| Shadow | shadow-sm |
| Animation | transition-all duration-300 ease-in-out |
| Position | Dynamic (calculated via refs) |

#### View Switcher Buttons

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-7 | 28px |
| Padding Horizontal | px-3 | 12px |
| Font Size | text-xs | 12px |
| Font Weight | font-medium | 500 |
| Border Radius | rounded-md | 6px |
| Gap (icon-text) | gap-1.5 | 6px |
| Transition | transition-colors duration-200 | - |

#### Button States

| State | Text Color | Icon Color |
|-------|------------|------------|
| Active | text-gray-900 | text-blue-500 |
| Inactive | text-gray-600 | inherit |
| Hover (inactive) | text-gray-900 | inherit |

#### Button Icons

| Button | Icon | Size |
|--------|------|------|
| Form | FileText | h-3.5 w-3.5 (14px) |
| Workflow | Workflow | h-3.5 w-3.5 (14px) |
| Permission | ShieldCheck | h-3.5 w-3.5 (14px) |

---

### Action Buttons (Right Side)

#### Views & Reports Buttons

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-6 | 24px |
| Font Size | text-xs | 12px |
| Padding Horizontal | px-2 | 8px |
| Icon Size | h-3.5 w-3.5 | 14px |
| Text Color | text-gray-700 | #374151 |
| Hover Text | text-gray-900 | #111827 |
| Hover Background | bg-gray-200 | #e5e7eb |

#### Share & Settings Buttons (Icon Only)

| Property | Value | Pixels |
|----------|-------|--------|
| Size | h-6 w-6 | 24x24px |
| Padding | p-0 | 0px |
| Icon Size | h-4 w-4 | 16px |
| Text Color | text-gray-700 | #374151 |
| Hover Text | text-gray-900 | #111827 |
| Hover Background | bg-gray-200 | #e5e7eb |

#### Save Button

| Property | Value | Pixels |
|----------|-------|--------|
| Height | h-6 | 24px |
| Font Size | text-xs | 12px |
| Padding Horizontal | px-3 | 12px |
| Background | bg-gray-900 | #111827 |
| Hover Background | bg-gray-800 | #1f2937 |

#### More Button (Icon Only)

| Property | Value | Pixels |
|----------|-------|--------|
| Size | h-6 w-6 | 24x24px |
| Padding | p-0 | 0px |
| Icon Size | h-4 w-4 | 16px |
| Background | bg-gray-300 | #d1d5db |
| Hover Background | bg-gray-400 | #9ca3af |

---

### Property Panel Action Buttons

**File:** `components/builder/FormBuilder.tsx`

| Property | Value | Pixels |
|----------|-------|--------|
| Width | w-28 | 112px |
| Height | h-7 | 28px |
| Font Size | text-xs | 12px |
| Padding Horizontal | px-2.5 | 10px |
| Gap (icon-text) | gap-1 | 4px |
| Icon Size | h-3.5 w-3.5 | 14px |
| Variant | outline | - |

*Applied to: Validation, Visibility, Style, Event buttons*

---

## 10. Module Icon Colors

**Files:** `components/builder/BuilderSidebar.tsx`, `components/builder/BuilderTabBar.tsx`

### Sidebar Module Colors

| Module | Color Name | Hex |
|--------|------------|-----|
| DataForm | Green | #22C55E |
| Board | Purple | #8B5CF6 |
| Process | Orange | #F97316 |
| List | Blue | #3B82F6 |
| External Data | Yellow | #EAB308 |
| Page | Sky Blue | #0EA5E9 |
| Navigation | Pink | #EC4899 |
| Component | Rust | #B94E15 |
| Integration | Purple | #8B5CF6 |
| Connections | Green | #22C55E |

### Tab Bar Icon Colors

| Tab Type | Color Name | Hex |
|----------|------------|-----|
| Home | Blue | #3B82F6 |
| DataForm | Green | #22C55E |
| Board | Purple | #8B5CF6 |
| Process | Orange | #F97316 |
| List | Blue | #3B82F6 |
| Navigation | Pink | #EC4899 |
| Page | Sky Blue | #0EA5E9 |
| Variables | Orange | #F97316 |
| Resources | Yellow | #EAB308 |
| Components | Rust | #B94E15 |
| Connections | Green | #22C55E |

---

## 11. BuilderUtilityBar Buttons by Tab Type

| Tab Type | Views | Reports | Share | Settings | Save | More |
|----------|-------|---------|-------|----------|------|------|
| DataForm | ✓ | ✓ | ✓ (drill-through) | ✓ (drill-through) | ✓ | ✓ |
| Board | ✓ | ✓ | ✓ (drill-through) | ✓ (drill-through) | ✓ | ✓ |
| Process | ✓ | ✓ | ✓ (drill-through) | ✓ (drill-through) | ✓ | ✓ |
| List | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Page | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Navigation | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Home | - | - | - | - | - | - |
| Variables | - | - | - | - | - | - |
| Resources | - | - | - | - | - | - |
| Components | - | - | - | - | - | - |
| Connections | - | - | - | - | - | - |

### Legend
- ✓ = Button is visible
- ✓ (drill-through) = Button opens drill-through page
- ✗ = Button is hidden
- \- = No action bar shown

---

*Last Updated: Based on current FormBuilder, BuilderUtilityBar, BuilderSidebar, and BuilderTabBar implementation*
