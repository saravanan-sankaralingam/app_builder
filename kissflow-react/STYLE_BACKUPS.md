# Component Style Backups

**Last updated:** 2026-05-12
**Purpose:** Document current styling before experiments - easy reference for reverting changes

---

## Table of Contents
1. [LoaderDemoView](#loaderdemoview)
2. [BuilderLayout](#builderlayout)
3. [BuilderTopBar](#buildertopbar)
4. [CopilotPanel](#copilotpanel)
5. [AppRuntimePreview](#appruntimepreview)
6. [Global Styles](#global-styles)

---

## LoaderDemoView
**File:** `components/create/LoaderDemoView.tsx`

### Container
```tsx
className="min-h-[calc(100vh-3.5rem)] p-6 flex flex-col items-center justify-center relative"
style={{
  background: 'linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)',
}}
```

### Back Button
```tsx
className="absolute top-6 left-6"
// Button itself:
className="w-11 h-11 bg-gray-100 hover:bg-gray-200"
```

### Heading
```tsx
className="text-[24px] font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
```
Text: "Your Demo App app is being created"

### Description
```tsx
className="text-sm text-gray-800 text-center max-w-md mb-8"
```

### SVG Animation Container
```tsx
className="w-[240px] h-[192px] mb-[20px]"
```

### Step Title
```tsx
className="text-[14px] font-medium text-gray-900 text-center mb-1"
```

### Step Description
```tsx
className="text-[12px] text-gray-600 text-center max-w-[240px]"
```

### Progress Bar Container
```tsx
className="w-[240px]"
```

### Progress Bar Background
```tsx
className="h-2 bg-white/50 rounded-full overflow-hidden"
```

### Progress Bar Fill
```tsx
className="h-full transition-all duration-500 ease-out relative overflow-hidden rounded-full"
style={{
  width: `${CREATION_STEPS[currentStep].progress}%`,
  background: 'linear-gradient(265deg, #d341a5, #6e6edb)',
}}
```

### Shimmer Effect
```tsx
className="absolute inset-0 w-full h-full animate-shimmer"
style={{
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
}}
```

### Animation Durations
```typescript
const CREATION_STEPS: CreationStep[] = [
  {
    title: 'Creating roles',
    description: 'Defining user permissions and roles',
    progress: 16,
    duration: 24000, // 2 cycles of 12s SVG animation
  },
  {
    title: 'Create data entities',
    description: 'Setting up data models',
    progress: 33,
    duration: 48000, // 1 cycle of 48s SVG animation
  },
  {
    title: 'Creating views',
    description: 'Building visualization views',
    progress: 50,
    duration: 48000, // 2 cycles of 24s SVG animation
  },
  {
    title: 'Creating reports',
    description: 'Generating analytics and reports',
    progress: 67,
    duration: 48000, // 2 cycles of 24s SVG animation
  },
  {
    title: 'Creating pages',
    description: 'Designing custom pages',
    progress: 83,
    duration: 72000, // 2 cycles of 36s SVG animation
  },
  {
    title: 'Finalising app',
    description: 'Finalizing app configurations',
    progress: 100,
    duration: 80000, // 2 cycles of 40s SVG animation
  },
]
```

---

## BuilderLayout
**File:** `components/builder/BuilderLayout.tsx`

### Main Container
```tsx
className="h-screen bg-white flex flex-col overflow-hidden"
```

### Content Container (with sidebar)
```tsx
className="flex-1 flex overflow-hidden"
```

### Sidebar
```tsx
className="w-14 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-4"
```

### Sidebar Icon Button
```tsx
className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
// Active state:
className="bg-purple-100 text-purple-600"
// Inactive state:
className="text-gray-600 hover:bg-gray-100"
```

### Main Content Area
```tsx
className="flex-1 flex flex-col overflow-hidden"
```

---

## BuilderTopBar
**File:** `components/builder/BuilderTopBar.tsx`

### Container
```tsx
className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4"
```

### Left Section
```tsx
className="flex items-center gap-3"
```

### Back Button
```tsx
className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md"
```

### App Name
```tsx
className="text-sm font-medium text-gray-900"
```

### Tab Chip
```tsx
className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
```

### Right Section
```tsx
className="flex items-center gap-2"
```

### Utility Buttons (Views, Reports, etc.)
```tsx
className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
```

### Save Button
```tsx
className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
```

---

## CopilotPanel
**File:** `components/builder/CopilotPanel.tsx`

### Main Container
```tsx
className="h-full flex flex-col bg-white"
```

### Header
```tsx
className="flex items-center justify-between px-4 py-3 border-b border-gray-200"
```

### Header Title
```tsx
className="text-sm font-semibold text-gray-900"
```

### Chat Container
```tsx
className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
```

### User Message Bubble
```tsx
className="flex justify-end"
// Inner bubble:
className="max-w-[80%] px-4 py-2 bg-purple-600 text-white rounded-2xl rounded-tr-sm text-sm"
```

### Assistant Message Bubble
```tsx
className="flex justify-start"
// Inner bubble:
className="max-w-[80%] px-4 py-2 bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm text-sm"
```

### Input Container
```tsx
className="border-t border-gray-200 px-4 py-3"
```

### Input Field
```tsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
placeholder="Ask Copilot..."
```

---

## AppRuntimePreview
**File:** `components/builder/AppRuntimePreview.tsx`

### Main Container
```tsx
className="h-full bg-white overflow-auto"
```

### Content Container
```tsx
className="p-6"
```

### Placeholder State
```tsx
className="h-full flex items-center justify-center"
// Text:
className="text-gray-500 text-sm"
```

---

## Global Styles
**File:** `app/globals.css`

### Key Variables
```css
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--popover: 0 0% 100%;
--popover-foreground: 240 10% 3.9%;
--primary: 271 91% 65%;  /* Purple brand color */
--primary-foreground: 0 0% 98%;
--secondary: 240 4.8% 95.9%;
--secondary-foreground: 240 5.9% 10%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--accent: 240 4.8% 95.9%;
--accent-foreground: 240 5.9% 10%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 271 91% 65%;
--radius: 0.5rem;
```

### Shimmer Animation
```css
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

---

## SVG Files Reference
**Location:** `/public/`

- `role-creation-loader.svg` - 12s cycle, white background 50% opacity
- `data-entity-loader.svg` - 48s cycle
- `view-loader.svg` - 24s cycle
- `report-loader.svg` - 24s cycle
- `page-loader.svg` - 36s cycle
- `ai-app-loader.svg` - 40s cycle (finalizing step)

---

## Common Color Palette

### Purple (Primary Brand)
- `purple-600`: #9333ea (buttons, active states)
- `purple-700`: #7e22ce (hover states)
- `purple-100`: #f3e8ff (light backgrounds)

### Pink (Accent)
- `pink-500`: #ec4899 (gradients)

### Gray (Neutrals)
- `gray-50`: #f9fafb (sidebar background)
- `gray-100`: #f3f4f6 (light buttons, inactive states)
- `gray-200`: #e5e7eb (borders, dividers)
- `gray-600`: #4b5563 (secondary text)
- `gray-700`: #374151 (primary text)
- `gray-800`: #1f2937 (dark text)
- `gray-900`: #111827 (headings)

### Gradients
- **Heading gradient**: `from-purple-600 to-pink-500`
- **Progress bar gradient**: `linear-gradient(265deg, #d341a5, #6e6edb)`
- **Loader background**: `linear-gradient(180deg, #FDF2F8 0%, #F5F3FF 50%, #EDE9FE 100%)`

---

## Typography Scale

- **Headings (h2)**: 24px, font-bold
- **Section titles (h3)**: 14px, font-medium
- **Body text**: 14px, font-normal
- **Small text**: 12px, font-normal
- **Micro text**: 11px, font-normal

---

## Spacing Reference

- **Page padding**: p-6 (1.5rem)
- **Section spacing**: space-y-4 (1rem vertical)
- **Component gaps**: gap-3 (0.75rem)
- **Tight gaps**: gap-2 (0.5rem)

---

## Usage Instructions

### To Restore a Style:
1. Find the component section above
2. Copy the exact className or style object
3. Paste it back into the component file
4. Save and refresh

### To Document New Experiments:
1. Add a new section with date
2. Note: "EXPERIMENT: [Date] - [Description]"
3. Document the changed values
4. Keep this file updated

---

**Tip:** Use Cmd+F (Mac) or Ctrl+F (Windows) to quickly search for components!
