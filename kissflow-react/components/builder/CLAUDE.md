# Builder

> Read [`../../CLAUDE.md`](../../CLAUDE.md) first for the Platform vs Builder vs Runtime engine map. This file covers **Builder-specific** code only.

Builder is the authoring tool. App authors use it to define data layers, fields, views, pages, navigation, components, roles, automations, and settings — the 5 layers from the product overview.

## Required reading before changes

- [`../../docs/BUILDER_LAYERS.md`](../../docs/BUILDER_LAYERS.md) — the 5 Layers (Data, Interface, Logic, Roles & Permissions, Settings) that segregate the Builder UI
- [`../../docs/BUILDER_MODES.md`](../../docs/BUILDER_MODES.md) — Play / Spec X / Spec Y / Build modes, layout switching, what each mode shows
- [`../../ComponentsProperties.md`](../../ComponentsProperties.md) — property panel + utility bar styling spec, which utility-bar buttons appear per tab type
- [`../../docs/PAGE_BUILDER.md`](../../docs/PAGE_BUILDER.md) — Page editor (3-section drag-and-drop layout)
- [`../../STYLE_BACKUPS.md`](../../STYLE_BACKUPS.md) — pre-experiment style snapshots for quick revert

**Critical design rule (from BUILDER_MODES):** Spec X and Spec Y are *readable specification documents*, not configuration editors. Removing editor UI ≠ removing content — every editor field must map to a prose/table analogue in the spec.

## Entry routes

- `app/builder/[appId]/page.tsx` — fetches the app, renders `BuilderLayout`
- `app/builder/[appId]/layout.tsx` — bypasses the Platform shell; the Builder has its own chrome

## Shell

`BuilderLayout.tsx` is the top-level Builder shell. It owns the mode state (`'play' | 'spec-x' | 'spec-y' | 'build'`) and swaps the entire main area based on mode. See `docs/BUILDER_MODES.md` for the exact line numbers (initial state at ~463, branches at ~1433 / ~1459 / ~2114).

```
┌─────────────────────────────────────────────────┐
│ BuilderTopBar  (mode toggle: Play/X/Y/Build)    │
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
| **Play mode (runtime preview)** | `AppRuntimePreview.tsx`, `copilot/`, `CopilotPanel.tsx` |
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

## Conventions

- All Builder UI must respect the active mode. Anything that *edits* config goes only in Build mode. Spec X / Spec Y are read-only prose; Play is live preview.
- Property panel styling follows `ComponentsProperties.md` — don't freelance, the spec is precise about spacing/typography
- Utility bar visibility follows the per-tab-type table in the root `CLAUDE.md` (and `ComponentsProperties.md`). Adding a new tab type means updating that table.
- Don't import from `app/(main)/` here — Builder must not depend on Platform routes
