# Builder

> Read [`../../CLAUDE.md`](../../CLAUDE.md) first for the Platform vs Builder vs Runtime engine map. This file covers **Builder-specific** code only.

Builder is the authoring tool. App authors use it to define data layers, fields, views, pages, navigation, components, roles, automations, and settings — the 5 layers from the product overview.

## Required reading before changes

- [`../../docs/BUILDER_LAYERS.md`](../../docs/BUILDER_LAYERS.md) — the 5 Layers (Data, Interface, Logic, Roles & Permissions, Settings) that segregate the Builder UI
- [`../../docs/BUILDER_MODES.md`](../../docs/BUILDER_MODES.md) — Play / Build modes + the App Spec modal, layout switching, what each mode shows
- [`../../ComponentsProperties.md`](../../ComponentsProperties.md) — property panel + utility bar styling spec, which utility-bar buttons appear per tab type
- [`../../docs/PAGE_BUILDER.md`](../../docs/PAGE_BUILDER.md) — Page editor (3-section drag-and-drop layout)
- [`../../STYLE_BACKUPS.md`](../../STYLE_BACKUPS.md) — pre-experiment style snapshots for quick revert

**Critical design rule (from BUILDER_MODES):** the App Spec is a *readable specification document*, not a configuration editor. Removing editor UI ≠ removing content — every editor field must map to a prose/table analogue in the spec. Per-app spec content lives in `lib/app-specs.ts` and renders through `components/app-view/AppSpecView.tsx`. The Spec is **no longer a top-bar mode** — it opens in a **modal** from the "App Spec" button in `BuilderTopBar.tsx` (`mode` still carries a dead `'spec'` value).

## Entry routes

- `app/builder/[appId]/page.tsx` — fetches the app, renders `BuilderLayout`
- `app/builder/[appId]/layout.tsx` — bypasses the Platform shell; the Builder has its own chrome

## Shell

`BuilderLayout.tsx` is the top-level Builder shell. It owns the mode state (`'play' | 'spec' | 'build'`, but only Play/Build are reachable from the toggle) and swaps the entire main area based on mode. The App Spec opens in a modal from `BuilderTopBar`, independent of mode. See `docs/BUILDER_MODES.md` for what each mode shows.

```
┌─────────────────────────────────────────────────┐
│ BuilderTopBar  (toggle: Play / Build · App Spec) │
├─────────────────────────────────────────────────┤
│ BuilderTabBar  (open tabs across the app)       │
├─────────────────────────────────────────────────┤
│ BuilderUtilityBar  (per-tab actions)            │
├──────────┬──────────────────────────────────────┤
│ Builder  │ Editor area                          │
│ Sidebar  │ (FormBuilder / PageEditor / etc.)    │
└──────────┴──────────────────────────────────────┘
```

## File map

| Concern | Files |
|---|---|
| **Shell** | `BuilderLayout.tsx`, `BuilderTopBar.tsx`, `BuilderTabBar.tsx`, `BuilderUtilityBar.tsx`, `BuilderSidebar.tsx` |
| **Play mode (runtime preview)** | `AppRuntimePreview.tsx`, `copilot/`, `CopilotPanel.tsx`, `GenerationLoadingPane.tsx` |
| **Property panels** | `PropertyPanelHeader.tsx`, `PropertySectionTitle.tsx` (styling per `ComponentsProperties.md`) |
| **Data layer editors** | `FormBuilder.tsx` (form fields), `DataFormSettingsEditor.tsx`, `DataFormShareEditor.tsx`, `ListEditor.tsx`, `PageEditor.tsx` |
| **Create dialogs** (one per artifact type) | `BoardCreateDialog`, `DataFormCreateDialog`, `ProcessCreateDialog`, `ListCreateDialog`, `PageCreateDialog`, `NavigationCreateDialog`, `ViewCreateDialog`, `ReportCreateDialog`, `ComponentCreateDialog` |
| **Card components** (artifact tiles in sidebar lists) | `ViewCard`, `ReportCard`, `ComponentCard` |
| **Section editors** (groups of artifacts) | `ViewsSection`, `ReportsSection`, `NavigationsSection`, `NavigationEditor`, `ComponentsEditor`, `ComponentEditor`, `ResourcesEditor`, `RolesEditor`, `VariablesEditor` |
| **Cross-cutting dialogs** | `RenameDialog`, `DuplicateDialog`, `UploadDialog` |
| **Parked / WIP** | `_parked/` (do not touch unless explicitly bringing one back) |

## How Builder consumes the runtime engine

Builder's **Play mode** shows a live preview of the app as end-users would see it. The actual rendering is the same runtime engine that Platform's `/app/[appId]` uses — Builder just embeds it in `AppRuntimePreview.tsx`.

Implication: when fixing a view-rendering bug, the fix usually lives in `components/views/<type>/`, not here. Test in **both** Play mode AND a Platform run-through to make sure both surfaces stay correct.

`CopilotPanel.tsx` is the chat-style assistant in Play mode. It can drive the preview via `addNavItemCallback` (add a page) and `switchToPageCallback` (jump to a page).

**Chat-slot swap during generation.** When the app is still being generated (user reached the Builder mid-flow via the "Preview app" CTA on `/new/app`), Play mode and Spec mode both swap the 320px left rail: `GenerationLoadingPane.tsx` replaces `CopilotPanel.tsx`. `GenerationLoadingPane` reuses `LeftPane` from `components/new-app/AppCreatingView.tsx` in `compact` mode, driven by the root-level [`GenerationContext`](../../context/GenerationContext.tsx) (mounted in `app/layout.tsx`) so phase progression survives the route change from `/new/app` → `/builder/[appId]`. The swap is gated on `useGeneration().isGenerating`; once the final tick fires, `CopilotPanel` returns automatically in the same slot — no width jump, no `AppRuntimePreview` reflow.

## Conventions

- All Builder UI must respect the active mode. Anything that *edits* config goes only in Build mode. Spec is a read-only spec document; Play is live runtime preview.
- App Spec workflow diagrams use `@xyflow/react` (React Flow) as a **left-to-right pan/zoom graph** (no swimlanes). If you touch the layout, also touch `BUILDER_MODES.md` § Workflows — the doc has the graph-layout contract (longest-path columns; diamonds auto-inserted before branches; Start / step-chip / diamond / Completed node types; straight spine edges vs bezier `curve` branch edges), the `WF_LAYOUT` geometry constants, and the pan/zoom canvas settings.
- **The right-pane flex chain needs `min-w-0` at every level** — outer split, right-pane outer, and right-pane card. Missing this makes a wide child (a wide diagram, a big table) stretch the whole pane past the available width instead of triggering its own scroll.
- Property panel styling follows `ComponentsProperties.md` — don't freelance, the spec is precise about spacing/typography
- Utility bar visibility follows the per-tab-type table in the root `CLAUDE.md` (and `ComponentsProperties.md`). Adding a new tab type means updating that table.
- Don't import from `app/(main)/` here — Builder must not depend on Platform routes
- When rendering the app icon on a white surface (`BuilderTopBar`, Play-mode `AppRuntimePreview`), follow the house style in [`../../docs/COLORS.md`](../../docs/COLORS.md#rendering-an-app-icon-on-a-white-surface--libicon-colorts): no background tile, `h-5 w-5`, `strokeWidth={1.25}`, color via `iconColorFromBg(appIconBg)`. Three different files have local `AppIcon` helpers (BuilderTopBar, AppRuntimePreview, CopilotPanel); each one accepts `style` and `strokeWidth` so the lucide icon underneath can be styled.
- The Play-mode runtime header in `AppRuntimePreview` mirrors the Platform's in-app header. See [`../../docs/APP_NAV_HEADER.md`](../../docs/APP_NAV_HEADER.md#mirrored-in-the-builders-play-mode) — when one changes, change both.
