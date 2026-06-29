# Platform — New App (left-nav Create > App)

> ⚠️ **Current state: design-only mock flow, no backend writes.** This is the
> left-nav-driven app-creation flow we are actively iterating on. Everything
> the user types or uploads is ignored — the demo always presents the same
> "Vendor Onboarding and Management" content downstream. The agent timelines
> on both the pre-review and post-review screens, and the section
> skeletons, are timed mocks — not real AI work. No `createApp()` call is
> made. Once the design and copy are signed off, this flow will replace the
> Explorer's `/create` + `/create/app` flow (see
> [`PLATFORM_CREATE.md`](PLATFORM_CREATE.md)) and only then get wired to the
> backend.

The flow lives at `/new/app` and is reached from the **Create** button in the left navigation. Clicking Create opens a popover listing item types (App / Process / Board / Portal / Dataset / Integration) — only **App** routes forward to this flow today; the other five are stubs in `components/layout/Sidebar.tsx:67-98`.

## Routes

| Route | Component | Purpose |
|---|---|---|
| `/new/app` | `app/(main)/new/app/page.tsx` → `<NewAppView>` | Method-selection screen + state machine for the rest of the flow |

There is no per-step URL — every sub-state on `/new/app` (prompt screen, AI-at-work popover, review dialog, building screen) is held in local `useState`, not in the URL. Refresh / browser back always returns to method selection.

## The flow at a glance

```
left-nav Create > App
   │
   ▼
/new/app  ─►  NewAppView (method selection)
   │
   ├── Build with AI ───►  BuildWithAIView (prompt + uploads)
   │                          submit
   │                       ├──►  AgentScanningView (6-agent timeline, ~29s)
   │                       │       complete
   │                       ├──►  AppReviewDialog   (name + description)
   │                       │       Create app
   │                       └──►  AppCreatingView   (5-agent timeline + spec)
   │
   └── Create from scratch  ─►  TODO stub
```

Six concrete UI surfaces. Each is described below.

## 1 — Method selection (`NewAppView`)

`components/new-app/NewAppView.tsx`. Default render of `/new/app`.

- Full-bleed `bg-white`, content vertically and horizontally centred against the viewport
- Back arrow top-left → `router.back()`
- Page-mark icon: **58×58 magenta-100 tile (4px corner radius)** wrapping a **32×32 magenta-500 inset (6px corners)** with a **20×20 white `Grid2x2Plus` glyph**
- Title `Create an app` — 24px medium, gray-900
- Subtitle `Choose how you want to create your app` — 16px regular, gray-600
- 40px gap to the card grid (`mt-10`)
- Two **270×auto** outlined cards (12px radius, 2px border, `px-7 py-6`) side by side with `gap-6`:
  - **Build with AI** — gradient border via the `.new-app-ai-border` class in `globals.css` (purple-200 → magenta-200 normal, purple-400 → magenta-400 hover); `WandSparkles` glyph in `text-purple-500`; title "Build with AI" + description "Build an app in minutes with just a few inputs."
  - **Create from scratch** — gradient border via the `.new-app-scratch-border` class (blue-300 → blue-200 normal, blue-400 → blue-300 hover); `Grid2x2Plus` glyph in `text-magenta-500`; title "Create from scratch" + description "Build your app manually in the app builder."
- Both cards lift 4px on hover (`hover:-translate-y-1`) and pick up a neutral `hover:shadow-lg`
- Click → flips local `mode` state. `Build with AI` → `<BuildWithAIView>`; `Create from scratch` → TODO stub

## 2 — Prompt + uploads (`BuildWithAIView`)

`components/new-app/BuildWithAIView.tsx`. Forked from `components/create/AIPromptViewNew.tsx` — the original Explorer-flow version is unaffected.

Surfaces (controlled by local boolean flags):

1. **Default prompt screen** — the BRD upload box (10MB cap, `.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg`) + the 160px-tall textarea (3000-character cap with live counter). Submit button reads `Start building` and is the solid brand primary (`bg-blue-500`, not the previous magenta-purple gradient).
2. Submit fires `handleSubmit` → opens the **AI scanning dialog** (next section).
3. After scanning completes, the **review dialog** opens (section 4).
4. After the user confirms, `<AppCreatingView>` mounts (section 5).

**Mock-data shortcut:** `handleScanningComplete` ignores `prompt` and `attachments` entirely. It always sets:

```ts
const MOCK_APP_NAME = 'Vendor Onboarding and Management'
const MOCK_APP_DESCRIPTION =
  'Onboard new vendors and manage existing ones end-to-end. Procurement, Legal, and Finance teams review submissions, approve partnerships, and track document renewals with clear status visibility and a complete audit trail.'
```

So the user can type anything (or nothing meaningful) and the downstream surfaces always read crisply. Swap when wiring real AI.

The 10-second hardcoded timer that used to flip to a success screen has been removed; `AppCreatingView` now owns its own duration and calls back on completion. Success-screen behaviour is currently a stub no-op (`handleCreatingComplete`) since we don't want it surfacing during design iteration.

## 3 — AI scanning screen (`AgentScanningView`)

`components/new-app/AgentScanningView.tsx`. Full-screen pre-review surface (not a dialog). Replaces the previous hex-centric `AIScanningDialog` (which is still in the folder for reference but is no longer used in the flow).

The view reuses **the exact same `LeftPane` component** as `AppCreatingView` — title + Sparkles hero + the gradient-ringed agent timeline — but with a different roster, different copy, and faster phase timing. This shared layout means the user lands on a visually consistent screen before and after the review dialog (the popup opens on top of this view, not in place of it).

**Frame**:
- `h-[calc(100vh-3.5rem)]` (full viewport minus the topbar) with `bg-[#FDF8FC]`, `BackgroundAtmosphere` orbs, and the same back button (top-left, `top-6 left-6 z-20`).
- Content area: `flex items-start justify-center overflow-y-auto pt-6` — **top-aligned** so the title pins to the top and the agent timeline grows downward as new rows appear. (Earlier `items-center` made the whole stack re-centre and push the title up — fixed.)
- Renders `<InlineKeyframes />` itself (exported from `AppCreatingView`) so the shared sub-item animations (`ai-fade-up`, `dot-pulse`, `mat-spin-*`, `ai-pulse-ping`) actually load on this screen — earlier they didn't, which made the sub-item style read differently between the two screens.

**Title + description** (passed into `LeftPane` as props):
- Title: `Decoding your requirements` — same magenta-500 → purple-500 265° gradient as the post-review title.
- Description: `Six agents are reading your prompt and translating it into the roles, fields, pages, and entities for your app.`

**6 pre-review agents** (`SCANNING_AGENTS` in `AgentScanningView.tsx`). All names carry the trailing "agent" word for consistency with the post-review timeline:

| # | Agent | Color | Glyph | Done line |
|---|---|---|---|---|
| 1 | Requirement Validator agent | magenta | `ClipboardCheck` | has validated the requirements |
| 2 | Blueprint drafter agent | purple | `Layers` | has outlined the app architecture |
| 3 | App role definer agent | blue | `Users` | has defined the user roles |
| 4 | Field architect agent | cyan | `Database` | has architected the data fields |
| 5 | Page designer agent | green | `FileText` | has designed the page layouts |
| 6 | Entity enricher agent | magenta | `Wand2` | has enriched the entities |

Each has 4 rotating phase phrases (e.g. "is reading through your prompt", "is identifying the core use case", "is validating the scope", "is checking for missing details") that drive the active-row checklist box.

**Timing**:
- `SCANNING_PHASE_DURATION_MS = 1_200` — 1.2s per phase (compressed compared to AppCreatingView's 4s).
- `SCANNING_TOTAL_TICKS = 6 × 4 = 24` ticks.
- `SCANNING_TOTAL_DURATION_MS = 24 × 1200 + 200` ≈ **29 seconds**. The trailing 200ms buffer is just enough for the last agent's double-tick to render before `onComplete` fires.
- `onComplete` opens the `AppReviewDialog` on top of this view (the view stays mounted as the background of the modal).

**Abort**: the back button calls `onAbort`, which returns to the prompt screen.

## 4 — Review dialog (`AppReviewDialog`)

`components/new-app/AppReviewDialog.tsx`. Forked from `components/create/AppReviewDialog.tsx` with three deliberate differences:

- **Frame** is `w-[550px] h-[460px] p-8` — a fixed-height modal that pops over `AgentScanningView` once the 6th agent completes, so the dialog opens on a deliberately quiet background instead of replacing the screen.
- **Icon picker entirely removed** — the original component had a 20-icon grid + color swatches. Gone. The `onCreateApp` callback signature was trimmed to `(data: { name: string; description: string })` to match.
- **Title gradient** uses the brand tokens directly: `linear-gradient(265deg, var(--magenta-500), var(--purple-500))` — same 265° magenta→purple read as the post-review AppCreatingView title; the two heads echo each other across the dialog boundary.
- **Title text**: `Review the app details` — 24px (`text-2xl`) semibold gradient-clipped.
- **Sub-line**: `Almost there. Just review the app details before proceeding` — 12px regular gray-700, `mb-6`.
- Form fields (`App name`, `Description`) use the app-wide standards baked into `components/ui/label.tsx`, `input.tsx`, and `textarea.tsx` — see [`FORM_STANDARDS.md`](FORM_STANDARDS.md).
- Action row pinned to the bottom of the 460px frame via `mt-auto`. Primary `Create app` button uses `bg-blue-500 hover:bg-blue-600` (brand primary).

## 5 — Building screen (`AppCreatingView`) — the centrepiece

`components/new-app/AppCreatingView.tsx`. The post-create artifact view. **This is the screen we are actively iterating on.**

**Outer container**: full-height (`min-h-[calc(100vh-3.5rem)]`) on `bg-[#FDF8FC]` (light pink-purple wash) with three large blurred colour orbs as background atmosphere (`BackgroundAtmosphere`):
- Top-left magenta orb, 620×620, blur(60px), 18% alpha
- Right-centre purple orb, 540×540, blur(60px), 16% alpha
- Bottom-left blue orb, 480×480, blur(60px), 10% alpha

**Back button** floats absolute at `top-6 left-6 z-20` so the right pane can take the full height.

**Asymmetric 5:7 grid** (`grid-cols-[5fr_7fr] gap-6 p-6`) — 24px outer padding, 24px gap between panes.

### Left pane — narrative

`LeftPane` is now **shared between `AgentScanningView` (pre-review) and `AppCreatingView` (post-review)**. It takes `agents`, `title`, `description`, `phaseIdx`, `currentIdx`, and an optional `completedAction` prop. Both screens render the same shell — title block → standalone Sparkles glyph → gradient-ringed timeline — and differ only in their inputs.

**Container sizing** (after the recent widening):
- Outer wrapper column: `w-full max-w-[540px]` (was 480px).
- Title block + hero icon span the full 540px.
- Timeline gradient ring: `max-w-[520px] mx-auto` (was 400px). Outer 1.5px ring → inner `p-9`.
- The agent list inside the timeline (`<ol>`) is constrained to `max-w-[360px] mx-auto` so individual rows stay narrow even though the ringed box around them is wider — the user can read each agent line at a comfortable measure while the master container reads as a generous canvas.
- Outer wrapper padding: `py-10 px-8`, with `overflow-y-auto` if content overflows.

**Title block** (centred, `mb-8` below): the `title` and `description` props drive the heading and the line below it. Title uses the magenta-500 → purple-500 265° gradient; description renders as 13px gray-900, `leading-relaxed`, `max-w-[440px]`. On AppCreatingView the title is `Your app is being crafted, layer by layer` and the description names the app inline.

**AI hero glyph** (centred, `mb-8` below the title block):
- Standalone lucide `<Sparkles />` glyph at **48×48** (`w-12 h-12`), `var(--purple-500)`, `strokeWidth={1.5}`. The same icon used in the Start Building button, just larger.
- The earlier liquid-morph blob (`.flat-liquid` + `ai-liquid-i` border-radius keyframe) was removed in favour of just the glyph. The class and keyframe stay in `globals.css` / `InlineKeyframes` but are unused — revivable.

**Agent timeline** — gradient-ringed container:
- Outer ring: `linear-gradient(246.77deg, var(--purple-200), var(--magenta-200))` at 1.5px (`rounded-[24px]`).
- Inner surface: `color-mix(in srgb, var(--white) 90%, transparent)` — slightly translucent so the page wash + atmosphere orbs bleed through. `rounded-[22.5px]` (24 − 1.5) so corners stay concentric.
- `p-9` interior padding.
- The inner `<ol>` carries a faded vertical connector line (`absolute left-[16px] top-3 bottom-3`, `linear-gradient(to bottom, transparent, var(--gray-300), transparent)`) and `space-y-4` rhythm between rows.

**Progressive reveal** — queued agents are **not rendered** until their turn (`if (state === 'queued') return null` inside `LeftPane`'s `.map()`). So the timeline grows downward as each agent activates, and the title above stays pinned to the top. For the previous "always-visible roster" behaviour, see [`LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md`](LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md).

**Agent avatar**:
- Shape: **rounded-corner square** — `AVATAR_PATH_D` is `'M 12 0 H 20 A 12 12 0 0 1 32 12 V 20 A 12 12 0 0 1 20 32 H 12 A 12 12 0 0 1 0 20 V 12 A 12 12 0 0 1 12 0 Z'` rendered with `viewBox="0 0 32 32"`. (Earlier this was an octagon-squircle from `/Downloads/shape_octogan.svg`; the rounded square is the current shape.)
- Size: **32×32** with a white **16×16** lucide glyph centred.
- Same 5-color warm-to-cool progression on the post-review screen (magenta / purple / blue / cyan / green) — see the per-agent table in the "Mock data summary" section.

**Per-state avatar treatment**:

| State | Component | Visual |
|---|---|---|
| **Queued** | _Not rendered_ | Removed from the DOM entirely until promotion to active. |
| **Active** | `<ActiveGradientShiftAvatar>` | Three-stop gradient `var(--{color}-300) → var(--{color}-600) → var(--{color}-300)` whose `gradientTransform` rotates 0° → 360° over 4.5s via SVG `<animateTransform>`. Colours flow through the shape. |
| **Done** | `<StaticBoldAvatar>` | Bold static `-400 → -500` linear-gradient avatar + white glyph, full opacity. Row carries `opacity-90` as a subtle "settled" cue. |

Other active-state avatar variants we explored (`pulse-halo`, `orbit-border`, `pulse-glow`, `dashed-ring-spin`) are archived in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md).

**Row content by state** (13px name + sub-task box; the text-shimmer single-sentence treatment was replaced by a checklist box):

| State | Content |
|---|---|
| **Active** | Title line: `{Agent name}` in `font-semibold gray-900` + `working on it` in `gray-600` + a `<DotTrail color={accentColor}>` (three pulsing dots using `dot-pulse-i`). Below the title, a `mt-2 rounded-md p-2.5 space-y-1.5` checklist box (`bg: var(--gray-50)`, `border: 1px solid var(--gray-100)`) showing the agent's **past + current** phase rows. Past = green `<Check>` + faded `gray-500` text. Current = blue radar ping (a 10×10 ring expanding via `ai-pulse-ping` around a solid `var(--blue-500)` dot) + bold `gray-900` text. Future phases are **not rendered** until promoted to current — the box grows as the agent progresses. |
| **Done** | Single line: `<span class="font-semibold gray-900">{name}</span> {agent.successPhrase} ✓✓`. Each agent now owns its full done sentence via the `successPhrase` field (e.g. `has completed generating roles`), rather than a global "has completed generating {section}" template. The `<CheckCheck>` glyph is `var(--green-500)`, `strokeWidth={2.5}`. |

**Completion CTA** — the `LeftPane` accepts an optional `completedAction: React.ReactNode` slot rendered below the agent timeline with `mt-16` (64px breathing room) and an `ai-fade-up` entrance. On `AppCreatingView`, this slot is populated only once `currentIdx >= AGENTS.length` (i.e. the Navigation agent has finished). The block reads:

- **Line 1** — a 24×24 solid `var(--green-500)` circle containing a white `<CheckCheck>` (no card chrome around it) + "App generated successfully" in `text-[15px] font-medium gray-900`.
- **Line 2** — "Open app →" as an outlined button: `bg-white`, `border: var(--purple-300)`, `text: var(--purple-600)`, `rounded-lg`, `px-4 py-1.5`, gray-50 hover. Clicking it fires the `onComplete` prop (the parent `BuildWithAIView` decides where to route — currently a no-op stub).

`AgentScanningView` does **not** pass `completedAction`, so nothing appears there — the review dialog opens on top instead.

### Right pane — spec artifact

A **glassmorphic card** (`bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-...`) split into two vertical zones.

**Pinned identity header** holds the `AppIdentity` card — name (16px semibold gray-900) + description (13px gray-600 with a `FALLBACK_DESCRIPTION` for short props) — sitting on a `purple-100 → magenta-100` gradient tile.

**Scrollable content** (`flex-1 overflow-y-auto px-10 py-7 space-y-9`) renders one `<Section>` per agent that has activated. Each section has a title, subtitle, count chip, an accent colour, and a status pill (Generating / Done). Sections render their loader (`SingleItemSkeleton` — icon + title bar + description bars) until the driving agent's status flips to `done`, then they reveal the resolved content.

| # | Section | Agent drives | Resolved content |
|---|---|---|---|
| 1 | Roles | Role creator | `<RoleList>` — one card per role: `Users` icon + role name + bulleted responsibilities |
| 2 | Data entities | Flow + Entity creators | `<EntityTable>` per entity — name + description + field rows (id / name / type / required) + per-role `PermissionChip` row |
| 3 | Pages | Page creator | `<PageList>` — one card per page: `FileText` icon + page name + description |
| 4 | Navigation | Navigation creator | `<NavSitemap>` — one card **per navigation** (see below) |

**Navigation model** — the spec now supports **multiple navigations**, each describing a tailored menu for a specific group of roles. Shape:

```ts
interface NavigationSpec {
  title: string             // e.g. "Buyer Navigation"
  sharedWith: string[]      // role names this nav is exposed to
  menu: NavMenuItem[]       // top-level + sub-menu items with page mappings
}
```

Two mock navigations: **Buyer Navigation** (shared with Vendor Manager, Procurement Lead) and **Compliance Navigation** (shared with Compliance Officer). Each `<NavSitemap>` card mirrors the Roles/Pages layout:

- `Compass` icon top-left (`purple-500`), `gray-200` border + white background card, indented content column to the right.
- **Title** in `text-[14px] font-semibold gray-900`.
- **Shared with** — plain comma-separated text (no chips): `<span class="text-gray-500">Shared with: </span>Vendor Manager, Procurement Lead`.
- **Menu tree** — top-level rows with small `w-1 h-1 gray-500` dots; children indented under a vertical `border-l gray-200` connector with the same small gray dots. Each leaf shows `label → page` via an `<ArrowRight>` separator (`gray-400`).
- Loader uses the standard `<SingleItemSkeleton icon={Compass} color="var(--purple-500)" />` (matching Roles / Data / Pages skeleton style) — the previous custom `NavSkeleton` (tree-shaped placeholder) is kept in the file but is no longer rendered.

### Timing

- `PHASE_DURATION = 4_000` ms per phase, `PHASES_PER_AGENT = 4` → **16s per agent**.
- 5 agents × 16s = **80 seconds** total, then the timeline freezes at the post-completion tick. There is no separate "hold after last" timer in `AppCreatingView` — `onComplete` is only fired when the user clicks the **Open app** button in the completion CTA.
- The sequence runs end-to-end; nothing is held mid-flight.

## Mock data summary

| Value | Defined in | Used by |
|---|---|---|
| `MOCK_APP_NAME = 'Vendor Onboarding and Management'` | `BuildWithAIView.tsx` | Review dialog → AppCreatingView's AppIdentity |
| `MOCK_APP_DESCRIPTION` (250-char polished 2-line summary) | `BuildWithAIView.tsx` | Same path |
| `FALLBACK_DESCRIPTION` (safety net if appDescription < 60 chars) | `AppCreatingView.tsx` | AppIdentity description slot |
| `SCANNING_AGENTS` array (6 entries: Requirement Validator, Blueprint drafter, App role definer, Field architect, Page designer, Entity enricher — all with the "agent" suffix) — each carries `id`, `name`, `sectionTitle`, `icon`, `color`, `phases` (4 rotating phrases), `successPhrase` | `AgentScanningView.tsx` | Pre-review LeftPane timeline (no right pane on this screen) |
| `AGENTS` array (5 entries: Role creator, Flow creator, Entity creator, Page creator, Navigation creator — all with the "agent" suffix) | `AppCreatingView.tsx` | Post-review LeftPane timeline + RightPane spec sections |
| `AVATAR_PATH_D` — rounded square path (`'M 12 0 H 20 A 12 12 0 0 1 32 12 V 20 A 12 12 0 0 1 20 32 H 12 A 12 12 0 0 1 0 20 V 12 A 12 12 0 0 1 12 0 Z'`), 32×32 coords. Replaced the earlier octagon-squircle path. | `AppCreatingView.tsx` | Every agent avatar (active + done) |
| `MOCK_ROLES` (3 roles: Vendor Manager, Procurement Lead, Compliance Officer) | `AppCreatingView.tsx` | RightPane Roles section |
| `MOCK_ENTITIES` (3 entities: Vendor, Contract, Document) | `AppCreatingView.tsx` | RightPane Data entities section |
| `MOCK_PAGES` (4 pages: Vendor Dashboard, Vendor Profile, Renewal Tracker, Reports) | `AppCreatingView.tsx` | RightPane Pages section |
| `MOCK_NAV` — `NavigationSpec[]` with 2 entries (Buyer Navigation, Compliance Navigation), each containing `title`, `sharedWith: string[]`, `menu: NavMenuItem[]` | `AppCreatingView.tsx` | RightPane Navigation section |

## Animation primitives

All keyframes are inlined inside the `<InlineKeyframes>` component in `AppCreatingView.tsx` (exported and re-rendered by `AgentScanningView` so both screens share the same animation block). The cards on `NewAppView` use the gradient-border classes from `globals.css` (`.new-app-ai-border`, `.new-app-scratch-border`).

| Animation | Where | What it does |
|---|---|---|
| `ai-fade-up` | AppIdentity, every spec `<Section>`, every agent `<li>` row, the completion CTA block, the active-row checklist box | 8px slide + opacity from 0 — 0.55s out-expo easing |
| `skeleton-shimmer-i` | `SkeletonBar` overlay in the right-pane skeleton loaders | White highlight band sweep across each bar — 1.8s |
| `text-shimmer-i` | Available; not currently used (previously drove the active-row single-sentence shimmer that was replaced by the checklist box). | `background-position: 200% 0% → -200% 0%` — 4.5s linear |
| `dot-pulse-i` | The three dots after `working on it` on the active row's title line (`<DotTrail>`) | Opacity 0.25 ↔ 1 + scale 0.85 ↔ 1.1 — 1.4s, staggered 0 / 200 / 400ms across the three dots |
| `ai-pulse-ping` | The blue radar ring around the **current** sub-item dot in the active-row checklist box | scale 1 → 2.2 + opacity 1 → 0 — 3.2s loop |
| `mat-spin-rotate-i` / `mat-spin-dash-i` | Material-style indeterminate spinner — defined but **not currently used** since the current sub-item state now renders the radar ping instead. Kept for revival. | Rotation + dash-array pulse — 2.2s |
| `ai-liquid-i` | The `.flat-liquid` class for the (removed) liquid blob hero. Class + keyframe stay in place but are unused now that the hero is just a standalone Sparkles glyph. | Border-radius morph — 6s |

**SVG `<animateTransform>` (not a CSS keyframe):** the active-state avatar's `<linearGradient>` declares `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="4.5s" repeatCount="indefinite" />` inline, rotating the gradient inside the rounded-square shape.

**Avatar gradients are inline per-agent.** Each avatar's `<svg>` declares its own `<linearGradient id="agent-grad-{color}">` — magenta / purple / blue / cyan / green. Active uses a 3-stop rotating gradient (`-300 → -600 → -300`); done uses the static 2-stop (`-400 → -500`).

**Removed in recent iterations**:
- The previous **hex-centric scanning popover** (`AIScanningDialog`) and its `hex-stroke-flow` + `hex-halo` keyframes are no longer wired into the flow. The file remains as historical context but is not rendered.
- The central **liquid-morph blob** (`.flat-liquid` div with `ai-liquid-i` border-radius morph + Sparkles overlay) — replaced by a standalone lucide `<Sparkles />` glyph in `purple-500`.
- The **always-visible 5-agent roster** — queued agents now render `null` so the timeline grows progressively. The previous behaviour is documented in [`LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md`](LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md).
- The **single-sentence text-shimmer** treatment for active agents — replaced by `{name} working on it ●●●` + a `gray-50` checklist box showing past + current sub-items only. `text-shimmer-i` remains but is no longer rendered.
- The **`ai-cursor` blinking-ellipsis** keyframe — gone with the AIScanningDialog.
- Per-row "Building" chip and the magenta cursor are gone (already removed in earlier iterations; called out here only because the previous doc still listed them).
- `orbit-stroke-i`, `glow-pulse-i`, `spin-slow-i` keyframes — added briefly to support the active-state variant exploration; removed when `gradient-shift` was chosen. Recipes live in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md).

## Forked vs shared (vs `/create` flow)

| File in `components/new-app/` | Origin | Diverged how |
|---|---|---|
| `NewAppView.tsx` | new | (no origin) — built fresh for this flow |
| `BuildWithAIView.tsx` | `components/create/AIPromptViewNew.tsx` | Stubbed `createApp()`, mock app name/description override, `bg-blue-500` primary instead of magenta gradient, success-screen no-op |
| `AgentScanningView.tsx` | new | Pre-review screen reusing `AppCreatingView`'s `LeftPane`. Replaces the hex-centric scanning popover. 6-agent roster (Requirement Validator → Entity enricher), 1.2s phase duration, ~29s total. |
| `AIScanningDialog.tsx` | `components/create/AIScanningDialog.tsx` | **No longer rendered in this flow** (replaced by `AgentScanningView`). File kept for reference. |
| `AppReviewDialog.tsx` | `components/create/AppReviewDialog.tsx` | Icon picker removed, gradient title at 24px, callback signature trimmed to `{name, description}`, sized to `w-[550px] h-[460px] p-8` |
| `AppCreatingView.tsx` | new | Two-pane (5:7) layout with agent timeline + spec artifact. Exports `LeftPane`, `BackgroundAtmosphere`, `InlineKeyframes`, `PHASES_PER_AGENT`, and the `Agent` interface so `AgentScanningView` can compose the same shell. |

The Explorer's `components/create/*` flow is **untouched** while this flow iterates. When the design here is signed off, the plan is to retire `/create` and `/create/app` and route the left-nav AND the Explorer's Create button through `/new/app`.

## Conventions

- New App is in the **Platform** half of the codebase — must NOT import from `components/builder/`.
- All animations are inlined via `<InlineKeyframes>` style tags in each component, not in `globals.css` (after a Turbopack cache-miss incident). The only `globals.css` additions are the two gradient-border classes on `NewAppView`.
- Form-field labels and value text follow [`FORM_STANDARDS.md`](FORM_STANDARDS.md) — `<Label>` baseline is `text-xs text-gray-700 font-medium mb-2`, `<Input>` / `<Textarea>` value is `text-sm text-gray-900`. Don't override these on call sites.
- Brand tokens (`--magenta-*`, `--purple-*`, `--blue-*`, `--green-*`, `--gray-*`) live in `app/globals.css` — see [`COLORS.md`](COLORS.md). Use `var(--token-name)` or the Tailwind class (`bg-magenta-500`), not arbitrary hexes.
- All mock data is local to component files (no fixtures/ folder). When wiring real AI, replace the constants in-place — see "Mock data summary" above.

## What's intentionally NOT implemented yet

- **No `createApp()` call** anywhere in the flow — `BuildWithAIView.handleCreateApp` stops after setting `showCreatingScreen=true`; `AppCreatingView`'s completion is a no-op stub.
- **No real AI** — the scanning dialog and the building screen are timed animations with mock content. Switch to real LLM calls when ready.
- **Open app routing is a no-op** — the completion CTA on `AppCreatingView` (`✓ App generated successfully` + `Open app` outlined button) calls `onComplete`, which `BuildWithAIView`'s `handleCreatingComplete` currently stubs out (no navigation, no real app to open). This needs design + a target route once the rest of the flow is wired up.
- **Success screen** — exists as state in `BuildWithAIView` but is not designed yet; will be redesigned after the building screen settles.
- **Create from scratch** path — UI card exists; click handler is a `console.log` stub.
- **Other item types** (Process / Board / Portal / Dataset / Integration) — dead clicks in the Sidebar's Create popover.
- **No URL state** — refresh resets to method selection.
- **No persistent draft** — mid-prompt navigation loses data.
- **No tests**.

## Where this is implemented

- `app/(main)/new/app/page.tsx` — thin route entry
- `components/new-app/NewAppView.tsx` — method-selection screen + sub-mode state machine
- `components/new-app/BuildWithAIView.tsx` — prompt + uploads + orchestrator for scanning → review → creating
- `components/new-app/AgentScanningView.tsx` — pre-review AI-at-work screen (6-agent timeline)
- `components/new-app/AIScanningDialog.tsx` — old hex-animation scanning popover (no longer rendered; kept for reference)
- `components/new-app/AppReviewDialog.tsx` — review name/description modal that opens on top of `AgentScanningView`
- `components/new-app/AppCreatingView.tsx` — two-pane building screen + the shared `LeftPane`, `BackgroundAtmosphere`, `InlineKeyframes`, `Agent` exports consumed by `AgentScanningView`
- `components/layout/Sidebar.tsx` (`createOptions` + `CreateOptionsList`) — left-nav Create popover; only the App entry routes here today
- `app/globals.css` — `.new-app-ai-border` and `.new-app-scratch-border` gradient-border classes used by `NewAppView`'s method cards
- `lib/schema/types.ts` — `APP_COLORS`, `AppIconName`, `AppColor` (kept; not used by this flow's components currently)

## Related

- [`PLATFORM_CREATE.md`](PLATFORM_CREATE.md) — the Explorer-driven `/create` + `/create/app` flow this one will eventually replace
- [`PLATFORM_EXPLORER.md`](PLATFORM_EXPLORER.md) — describes the Explorer's `Create` button that still routes to `/create` today
- [`FORM_STANDARDS.md`](FORM_STANDARDS.md) — form-field typography rules used in the Review dialog
- [`COLORS.md`](COLORS.md) — brand colour tokens used throughout this flow
