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

The view reuses `AppCreatingView`'s `LeftPane` — title + hero slot + the gradient-ringed agent timeline — but with a different roster, different copy, its own hero animation, and per-agent phase durations. This shared layout means the user lands on a visually consistent screen before and after the review dialog (the popup opens on top of this view, not in place of it).

**Frame**:
- `h-[calc(100vh-3.5rem)]` (full viewport minus the topbar) with `bg-[#FDF8FC]`, `BackgroundAtmosphere` orbs, and the same back button (top-left, `top-6 left-6 z-20`).
- Content area: `flex items-start justify-center overflow-y-auto pt-6` — top-aligned so the title pins to the top and the agent timeline grows downward as new rows appear.
- Renders `<InlineKeyframes />` itself (exported from `AppCreatingView`) so the shared sub-item animations (`ai-fade-up`, `dot-pulse`, `ai-pulse-ping`) actually load on this screen.

**Title + description** (passed into `LeftPane` as props):
- Title: `Decoding your requirements` — magenta-500 → purple-500 265° gradient.
- Description: `Our Requirements Analyst and Solutions Architect agents are interpreting your prompt and drafting the blueprint for your app.`

**Custom hero — swaps mid-run**: instead of the default Sparkles-on-blob glyph, `AgentScanningView` passes a `hero` prop that picks its `<img src>` from `currentIdx` — so the animation matches the currently-active agent:

- **`currentIdx === 0`** (Requirements Analyst) → `/agent-scanning-loader.svg`
- **`currentIdx >= 1`** (Solutions Architect + post-completion) → `/doc-generation-loader.svg`

Both SVGs share a **286×260 viewBox** and are rendered at **176×160** in the hero slot. A React `key` (`'scan' | 'doc-gen'`) is attached to the `<img>` so the browser remounts on swap and the second SVG's SMIL animation starts from frame 0. Both assets already use the AI-brand gradient palette (magenta-500 / purple-500 / blue-500) — see "Loader assets" below.

**2 pre-review agents** (`SCANNING_AGENTS` in `AgentScanningView.tsx`). All names carry the trailing "agent" word for consistency with the post-review timeline. Variable phase counts and per-agent phase durations — the tick math derives from a precomputed `TICK_SCHEDULE` so each agent runs at its own pace:

| # | Agent | Color | Glyph | Sub-item duration | Sub-items | Done line |
|---|---|---|---|---|---|---|
| 1 | Requirements Analyst agent | magenta | `ClipboardCheck` | 3s | 2 | has captured the requirements |
| 2 | Solutions Architect agent | purple | `Layers` | 5s | 7 | has drafted the app blueprint |

**Requirements Analyst sub-items** (2 × 3s = 6s):
- Reading your prompt and attachments
- Distilling intent and success criteria

**Solutions Architect sub-items** (7 × 5s = 35s):
- Framing the app scope and boundaries
- Mapping roles to jobs-to-be-done
- Modelling the data entities
- Architecting fields and constraints
- Composing pages and end-user flows
- Enriching entities with context
- Weaving it into a cohesive blueprint

**Timing**:
- `AGENT_PHASE_DURATIONS_MS = [3_000, 5_000]` — Requirements Analyst = 3s/sub-item, Solutions Architect = 5s/sub-item.
- `CUMULATIVE_TICKS = [2, 9]` — agent 0 owns ticks 0–1, agent 1 owns ticks 2–8.
- `TICK_SCHEDULE` = `[3000, 6000, 11000, 16000, 21000, 26000, 31000, 36000, 41000]` — wall-clock ms at which `tickCount` advances by 1.
- Total scan: **~41 seconds** + 200ms buffer → `AppReviewDialog` opens on top at ~41.2s.

**Scheduler**: `useEffect` maps `TICK_SCHEDULE` into individual `setTimeout` calls (one per tick advance) — a fixed `setInterval` can't handle mixed durations, so the schedule-driven pattern replaces it.

**Abort**: the back button calls `onAbort`, which returns to the prompt screen.

## 4 — Review dialog (`AppReviewDialog`)

`components/new-app/AppReviewDialog.tsx`. Forked from `components/create/AppReviewDialog.tsx` with three deliberate differences:

- **Frame** is `w-[550px] h-[460px] p-8` — a fixed-height modal that pops over `AgentScanningView` once both scanning agents (Requirements Analyst → Solutions Architect) complete, so the dialog opens on a deliberately quiet background instead of replacing the screen.
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

`LeftPane` is **shared between `AgentScanningView` and `AppCreatingView`**. Props:
- `agents: Agent[]` — the roster to render (SCANNING_AGENTS or AGENTS).
- `title: string`, `description: React.ReactNode` — the heading block above the hero.
- `currentIdx: number`, `phaseIdx: number` — drives which agent is active + which sub-item within.
- `hero?: React.ReactNode` — overrides the default hero. If not passed, falls back to a custom AI sparkle SVG on a settled `flat-liquid` blob (see fallback below).
- `completedAction?: React.ReactNode` — reserved for inline post-completion content. Currently **unused** on both screens (the post-review completion is a popover instead — see `AppCreatedDialog`).

**Container sizing**:
- Outer wrapper column: `w-full max-w-[540px]`.
- Timeline gradient ring: `max-w-[520px] mx-auto`. Outer 1.5px ring (magenta-200 → purple-200) → inner `p-9`.
- Agent list `<ol>`: `max-w-[360px] mx-auto` — rows stay narrow within the wider ringed box.
- Outer wrapper padding: `py-10 px-8`, with `overflow-y-auto` if content overflows.

**Title block** (centred, `mb-8` below): title uses the magenta-500 → purple-500 265° gradient; description renders as 13px gray-900, `leading-relaxed`, `max-w-[440px]`.

**Hero** (centred, `mb-8` below the title block):
- Both screens now pass a **custom animated SVG loader** via the `hero` prop:
  - `AgentScanningView` passes a two-stage `<img>` that swaps between `/agent-scanning-loader.svg` and `/doc-generation-loader.svg` based on `currentIdx` (see §3 above). Rendered at **176×160**.
  - `AppCreatingView` passes a static `<img src="/app-builder-loader.svg" />` — a browser-frame mockup that shape-shifts through Dashboard → Table → Form states via inline SMIL, sized at **180×145** (proportional to the 231×186 source viewBox).
- **Fallback** (no `hero` prop passed): a standalone lucide `<Sparkles />`-style custom SVG (magenta→purple gradient star + magenta "+" + purple ring) at **48×48**, sitting on an 88×88 `flat-liquid` blob (magenta-300 → purple-300 → blue-300 with `ai-liquid-i` border-radius morph, 50% opacity). A periodic SVG SMIL flash sweeps across the icon silhouette every 3.6s via a clipPath. None of this renders on either current screen — kept for reference in case we swap back.
**Agent timeline** — gradient-ringed container:
- Outer ring: `linear-gradient(246.77deg, var(--purple-200), var(--magenta-200))` at 1.5px (`rounded-[24px]`).
- Inner surface: `color-mix(in srgb, var(--white) 90%, transparent)` — slightly translucent so the page wash + atmosphere orbs bleed through. `rounded-[22.5px]` (24 − 1.5) so corners stay concentric.
- `p-9` interior padding.
- The inner `<ol>` carries a faded vertical connector line (`absolute left-[16px] top-3 bottom-3`, `linear-gradient(to bottom, transparent, var(--gray-300), transparent)`) and `space-y-4` rhythm between rows.

**Progressive reveal** — queued agents are **not rendered** until their turn (`if (state === 'queued') return null` inside `LeftPane`'s `.map()`). So the timeline grows downward as each agent activates, and the title above stays pinned to the top. For the previous "always-visible roster" behaviour, see [`LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md`](LEFT_PANE_ALL_AGENTS_VISIBLE_SNAPSHOT.md).

**Agent avatar**:
- Shape: **rounded-corner square** — `AVATAR_PATH_D` is `'M 12 0 H 20 A 12 12 0 0 1 32 12 V 20 A 12 12 0 0 1 20 32 H 12 A 12 12 0 0 1 0 20 V 12 A 12 12 0 0 1 12 0 Z'` rendered with `viewBox="0 0 32 32"`.
- Size: **32×32** with a white **16×16** lucide glyph centred.
- Post-review roster is only 2 agents (App Builder = magenta / `Wand2`, Validator = green / `ShieldCheck`) — see the per-agent table in the "Mock data summary" section.

**Per-state avatar treatment**:

| State | Component | Visual |
|---|---|---|
| **Queued** | _Not rendered_ | Removed from the DOM entirely until promotion to active. |
| **Active** | `<ActiveGradientShiftAvatar>` | Three-stop gradient `var(--{color}-300) → var(--{color}-600) → var(--{color}-300)` whose `gradientTransform` rotates 0° → 360° over 4.5s via SVG `<animateTransform>`. Colours flow through the shape. |
| **Done** | `<StaticBoldAvatar>` | Bold static `-400 → -500` linear-gradient avatar + white glyph, full opacity. Row carries `opacity-90` as a subtle "settled" cue. |

Other active-state avatar variants we explored (`pulse-halo`, `orbit-border`, `pulse-glow`, `dashed-ring-spin`) are archived in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md).

**Row content by state** — every row is a **two-line stack** (name on line 1, tag / success line on line 2) top-aligned against the 32px avatar. Both lines carry `whitespace-nowrap` so they never break onto a second visual line:

| State | Content |
|---|---|
| **Queued** | Two skeleton bars stacked (`space-y-2.5`): a 60% × 14px name bar and an 85% × 10px description bar, both `shimmering`. |
| **Active** | **Line 1**: `{agent.name}` in `text-[13px] font-semibold gray-900`. **Line 2**: `is working on it` in `text-[13px] gray-600` + a `<DotTrail color={accentColor}>` (three pulsing dots using `dot-pulse-i`). Below the two lines, a `mt-2 rounded-md p-2.5 space-y-1.5` checklist box (`bg: var(--gray-50)`, `border: 1px solid var(--gray-100)`) showing the agent's **past + current** phase rows. Past = green `<Check>` + faded `gray-500` text. Current = blue radar ping (a 10×10 ring expanding via `ai-pulse-ping` around a solid `var(--blue-500)` dot) + bold `gray-900` text. Future phases are **not rendered** until promoted to current — the box grows as the agent progresses. |
| **Done** | **Line 1**: `{agent.name}` in `text-[13px] font-semibold gray-900`. **Line 2**: `{agent.successPhrase}` in `text-[13px] gray-600` + an inline `<CheckCheck>` (green-500, `strokeWidth 2.5`, `align-middle`, `ml-1.5`). Each agent owns its own success sentence (`has captured the requirements`, `has drafted the app blueprint`, `has built the app structure`, `has designed the interface`, `has published the app`). Row carries `opacity-90` as a subtle "settled" cue. |

**Completion CTA** — the "App generated successfully" message + Open app button has moved from an inline slot on the `LeftPane` to a **modal popover** (`AppCreatedDialog`) rendered by `AppCreatingView` itself. See "Completion dialog" below. The `LeftPane`'s `completedAction` prop still exists on the interface (kept for potential future inline use) but is unused by both current screens.

**Completion dialog** (`AppCreatedDialog`, defined near the top of `AppCreatingView.tsx`) — aesthetic modal that opens on top of the building screen the moment the App Publisher agent finishes.

- **Backdrop**: `fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]`. The resolved right-pane spec is glimpsed but muted behind the popup.
- **Outer card**: 460px wide gradient hairline ring (`p-[1.5px]`, `linear-gradient(246.77deg, purple-200 → magenta-200)`) — same brand ring language as the agent timeline and Section chrome — wrapping a solid-white inner surface. `ai-fade-up` entrance + deep drop-shadow (`0 24px 60px rgba(34,42,59,0.18)`) so the modal lifts clearly off the backdrop.
- **Inner card**: `rounded-[18.5px] px-9 pt-20 pb-16 bg-white overflow-hidden`. Very generous top and bottom padding so the badge + confetti have breathing room and the composition doesn't feel cramped.
- **Close button** (top-right, `absolute top-4 right-4`): 32×32 hit target with a 16×16 gray-500 `<X />` glyph, `hover:bg-gray-100`, focus-visible ring. Fires `onClose`, which flips `AppCreatingView`'s local `dialogClosed` state — the popover doesn't re-open once dismissed, letting the user inspect the right-pane spec undisturbed.
- **Badge composition** (`relative z-10 w-14 h-14`):
  - Static soft green halo behind (radial gradient + `blur(14px)`, `scale(1.6)`).
  - **Two attention-grabbing pulse rings** (`ai-pulse-ping` filled `green-500` at `opacity 0.28`), offset by `animationDelay: 1.6s` so the effect is nearly continuous.
  - Solid 56×56 green circle (linear-gradient `green-500 → darker green` for depth, `ring-4 ring-white`, soft green drop-shadow).
  - White `<CheckCheck>` (24×24, `strokeWidth 2.75`) with the **`.success-check-pop`** class — pops in on mount with a spring overshoot (`0.85s cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - **Confetti burst** — 12 particles fanned across all four quadrants (defined in `CONFETTI_PARTICLES` at module scope), fired from the badge centre. Mixed shapes (6 squares + 6 circles), 8–11px, AI-brand palette (magenta / purple / blue / cyan / green tones). Each particle carries its own `--cx`, `--cy`, `--cr` CSS custom properties. The `.confetti-particle` animation runs the `confetti-burst-i` keyframe on a **3.6s repeating loop with a rest phase** — pop-in at 7%, fully visible flying to endpoint by 40%, fades out by 55%, invisible from 55–100% so bursts have breathing room between iterations. Staggered `animation-delay` (0–110ms) keeps the loop organic across cycles. Every particle has a subtle drop-shadow (`box-shadow: 0 1px 3px color-mix(in srgb, {color} 40%, transparent)`) so it reads on the white card.
- **Title**: `App Generated Successfully` — `text-[22px] font-semibold` in solid `var(--green-600)`, echoing the badge.
- **Sub-line**: `Your requested app **{appName}** is now ready to view.` — `text-[13px] gray-600 max-w-[340px]`; app name is highlighted inline (`font-semibold text-gray-900`).
- **Primary CTA**: shared `<Button>` component with `px-6 bg-blue-500 hover:bg-blue-600 text-white` — **same style as the review dialog's "Create app"** button so the two moments read visually consistent. Fires `onOpen` (which is the parent's `onComplete` callback — currently a no-op stub in `BuildWithAIView`).
- **Gate flag**: `HOLD_COMPLETION_DIALOG = false` at the top of `AppCreatingView.tsx`. Flip to `true` during design iteration to suppress the popup and keep the right-pane spec visible.
- **Open condition** on the parent side: `open={allAgentsDone && !HOLD_COMPLETION_DIALOG && !dialogClosed}` — so the popover fires once when all five agents finish, and stays dismissed until the flow is remounted.

### Right pane — spec artifact

A **glassmorphic card** (`bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-...`) split into two vertical zones.

**Pinned identity header** holds the `AppIdentity` card — name (16px semibold gray-900) + description (13px gray-600 with a `FALLBACK_DESCRIPTION` for short props) — sitting on a `purple-100 → magenta-100` gradient tile.

**Scrollable content**: `flex-1 overflow-y-auto px-10 py-7 divide-y divide-gray-200 [&>*]:py-[18px] [&>*:first-child]:pt-0 [&>*:last-child]:pb-0`. **Five sections**; a 1px `gray-200` separator is auto-inserted between adjacent sections via `divide-y`, with 18px equal breathing room on either side.

**Section chrome** (`<Section>` component):
- Header row: 16×16 lucide `icon` in the section's `accentColor` + section title (**16px semibold gray-900**) + optional count badge + a status pill on the right (see below).
- Subtitle sits below at `ml-[26px]` (16px icon + 10px `gap-2.5`), `text-[12px] gray-700`.
- Content: `<div className="pl-[26px]">{children}</div>` — every list, resolved or skeleton, aligns under the title text.
- **Count badge** (`CountBadge`): `text-[11px]` medium `gray-700` on a `bg-gray-100` pill, `px-1.5 py-1 rounded-full`. Every section chip shows a bare integer (Roles 3, Data entities 3, Workflows 4, Pages 4, Navigation 2) — the previous "3 entities · 15 fields" composite on Data entities was simplified to match the others.
- **Status pills** are solid, no borders:
  - **Generating** — `bg-magenta-500 text-white` with a white pulsing dot (`bg-white` inner + `ai-pulse-ping` ring).
  - **Generated** — `bg-green-500 text-white` with a white inline `<Check>`.

**Sequential reveal** — only one section is in the **Generating** state at a time. Each section's shown/resolved logic keys off two phase indexes: `builderPhase` (App Builder agent, 6 sub-items covering the data/logic layer) and `designerPhase` (Interface Designer agent, 2 sub-items covering the interface). App Publisher (1 sub-item) doesn't gate any section — by then everything is resolved.

| # | Section | Icon (accent) | Shown from | Resolved at | Loading window |
|---|---|---|---|---|---|
| 1 | Roles | `Users` (magenta-500) | always | `builderPhase >= 1` | phase 0 |
| 2 | Data entities | `Database` (green-500) | `builderPhase >= 1` | `builderPhase >= 5` | phases 1–4 |
| 3 | Workflows | `Workflow` (orange-500) | `builderPhase >= 5` | `builderPhase >= 6` | phase 5 |
| 4 | Pages | `FileText` (blue-500) | `builderPhase >= 6` (i.e. App Builder done, Designer active) | `designerPhase >= 1` | Designer phase 0 |
| 5 | Navigation | `Compass` (purple-500) | `designerPhase >= 1` | `designerPhase >= 2` | Designer phase 1 |

Each `*Shown` gate corresponds to the previous section resolving, so the pane grows one section at a time — the user always sees the most recently completed sections above the currently generating one, with the divider separating them.

**Skeleton loaders — no card chrome**. All five sections use the same flat `<RowListSkeleton count={N} lines={M} />`:
- `count` = the number of items about to be generated (`MOCK_ROLES.length`, etc.) — so the row count matches what will appear on resolution.
- Each row: 16×16 `<Circle>` in `gray-300` (placeholder for the tick) + a shimmering `<SkeletonBar>` for the text. Widths vary slightly per row (`60 + (i*7)%25 %`) so the skeleton doesn't look mechanically repeated.
- `lines > 1`: adds N−1 finer 8px bars for multi-line rows (used for Data entities + Workflows: `lines={2}` for name + fields/steps).

**Resolved content — checklist style**. All five resolved lists use the same tick + name pattern (**13px** gray-900 on both lines, `<ul className="space-y-3">` = **12px** vertical gap between rows, staggered `ai-fade-up` 80ms/row). Loading skeletons (`RowListSkeleton`) also use `space-y-3` so there's no vertical shift when a section flips from Generating → Generated.

| Section | Resolved row |
|---|---|
| **Roles** | `<Check>` (green-500, 16×16, stroke 3) + role name — no responsibilities |
| **Data entities** | `<Check>` + name + a second line: `Fields: name1, name2, name3, …` (13px gray-600, label in gray-500). Descriptions and per-role permissions are hidden. |
| **Workflows** | `<Check>` + workflow name + a second line: `Steps: Draft, Manager Review, Legal Sign-off, Approved` (13px gray-600, label in gray-500). Same visual pattern as Data entities. |
| **Pages** | `<Check>` + page name — no description |
| **Navigation** | `<Check>` + navigation title — no shared-with, no menu tree |

**Retained but not rendered**: `EntityTable`, `NavMenu`, `PermissionChip`, and the old card-per-item versions of `RoleList` / `PageList` / `NavSitemap` live in the file with no callers, kept as recoverable code if we want to revive the richer views later.

### Timing

Post-review roster is **5 agents** total: **2 pre-run** (Requirements Analyst + Solutions Architect, both shown as `done` from mount thanks to `INITIAL_TICK_COUNT`) + **3 running** (App Builder + Interface Designer + App Publisher).

- `AGENT_PHASE_DURATIONS_MS = [3_000, 5_000, 5_000, 5_000, 5_000]` — first two entries are shape-completeness placeholders (their agents never fire); App Builder = 5s/sub-item, Interface Designer = 5s/sub-item, App Publisher = 5s/sub-item.
- `CUMULATIVE_TICKS = [2, 9, 15, 17, 18]` — Reqs Analyst owns ticks 0–1, Sol Architect 2–8, App Builder 9–14, Interface Designer 15–16, App Publisher tick 17.
- `INITIAL_TICK_COUNT = CUMULATIVE_TICKS[APP_BUILDER_AGENT_IDX - 1] = 9` — `useState` starts here so the two scanning agents read as `done` on mount.
- `TICK_SCHEDULE = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000]` — 9 ticks × 5s covering App Builder's 6 phases + Interface Designer's 2 + App Publisher's 1. `useEffect` maps this into individual `setTimeout` calls that bump `tickCount` by `INITIAL_TICK_COUNT + idx + 1`, so ticks advance from 9 → 18.
- **Total build sequence: ~45 seconds** — App Builder 30s + Interface Designer 10s + App Publisher 5s.
- The right-pane sequence has finished by the time Interface Designer wraps (all five sections resolved); the App Publisher phase (5s) is purely a left-pane narrative beat before the `AppCreatedDialog` opens.
- `AppCreatedDialog` opens automatically the moment `allAgentsDone` becomes true (i.e., all 5 agents `done`). `onComplete` still fires only when the user clicks **Open app** — not on auto-open.

## Mock data summary

| Value | Defined in | Used by |
|---|---|---|
| `MOCK_APP_NAME = 'Vendor Onboarding and Management'` | `BuildWithAIView.tsx` | Review dialog → AppCreatingView's AppIdentity |
| `MOCK_APP_DESCRIPTION` (250-char polished 2-line summary) | `BuildWithAIView.tsx` | Same path |
| `FALLBACK_DESCRIPTION` (safety net if appDescription < 60 chars) | `AppCreatingView.tsx` | AppIdentity description slot |
| `SCANNING_AGENTS` array (2 entries: **Requirements Analyst agent** — 2 sub-items × 3s; **Solutions Architect agent** — 7 sub-items × 5s). Each carries `id`, `name`, `sectionTitle`, `icon`, `color`, `phases: string[]` (variable length), `successPhrase`. | `AgentScanningView.tsx` | Pre-review LeftPane timeline (no right pane on this screen) |
| `AGENTS` array (5 entries: **Requirements Analyst agent** (magenta / `ClipboardCheck`, 2 phases — pre-run, done from mount), **Solutions Architect agent** (purple / `Layers`, 7 phases — pre-run, done from mount), **App Builder agent** (blue / `Wand2`, 6 phases × 5s = 30s), **Interface Designer agent** (cyan / `Palette`, 2 phases × 5s = 10s), **App Publisher agent** (green / `Rocket`, 1 phase × 5s)). | `AppCreatingView.tsx` | Post-review LeftPane timeline. First two carried over from the scanning screen so the user sees the full narrative. RightPane sections key off `builderPhase` (App Builder) + `designerPhase` (Interface Designer). |
| `APP_BUILDER_AGENT_IDX = 2`, `DESIGNER_AGENT_IDX = 3` | `AppCreatingView.tsx` | Ticker constants — the two agents that actually drive the right-pane sequential reveal. |
| `AVATAR_PATH_D` — rounded square path (`'M 12 0 H 20 A 12 12 0 0 1 32 12 V 20 A 12 12 0 0 1 20 32 H 12 A 12 12 0 0 1 0 20 V 12 A 12 12 0 0 1 12 0 Z'`), 32×32 coords. Replaced the earlier octagon-squircle path. | `AppCreatingView.tsx` | Every agent avatar (active + done) |
| `MOCK_ROLES` (3 roles: Vendor Manager, Procurement Lead, Compliance Officer) | `AppCreatingView.tsx` | RightPane Roles section |
| `MOCK_ENTITIES` (3 entities: Vendor, Contract, Document) | `AppCreatingView.tsx` | RightPane Data entities section — each row renders name + `Fields: …` comma-separated |
| `MOCK_WORKFLOWS` — `WorkflowSpec[]` with 4 entries (Vendor Onboarding Approval, Contract Review Cycle, Renewal Reminder, Compliance Audit). Each carries `name: string` + `steps: string[]` (4 steps per workflow). | `AppCreatingView.tsx` | RightPane Workflows section — each row renders name + `Steps: …` comma-separated |
| `MOCK_PAGES` (4 pages: Vendor Dashboard, Vendor Profile, Renewal Tracker, Reports) | `AppCreatingView.tsx` | RightPane Pages section — currently only `name` is rendered in the checklist |
| `MOCK_NAV` — `NavigationSpec[]` with 2 entries (Buyer Navigation, Compliance Navigation), each containing `title`, `sharedWith: string[]`, `menu: NavMenuItem[]` | `AppCreatingView.tsx` | RightPane Navigation section — currently only `title` is rendered in the checklist |
| `CONFETTI_PARTICLES` — 12 particles for the `AppCreatedDialog` celebration burst. Each carries `{x, y, rot, color, size, shape, delay}`. Colors pulled from the AI palette + green. | `AppCreatingView.tsx` | Completion popover — see "Completion dialog" in §5 |

## Loader assets

Three animated SVGs served from `kissflow-react/public/`. Each is a self-contained SVG (SMIL + inline `<style>` keyframes) — no React state, no CSS wiring needed. The three assets are hot-swappable — drop a fresh SVG at the same public path with the same viewBox and the render is proportional automatically. The current set was refreshed from `Downloads/doc_scan.svg`, `Downloads/blue_print_gen.svg`, and `Downloads/app-builder.svg`.

| File | Used on | Render size | Notes |
|---|---|---|---|
| `/agent-scanning-loader.svg` | `AgentScanningView`, when `currentIdx === 0` (Requirements Analyst active) | 176×160 | Document-scan animation, 286×260 viewBox |
| `/doc-generation-loader.svg` | `AgentScanningView`, when `currentIdx >= 1` (Solutions Architect active + post-completion) | 176×160 | Blueprint-generation animation, 286×260 viewBox — same aspect as the scan loader so no layout shift on swap |
| `/app-builder-loader.svg` | `AppCreatingView` hero (full duration — plays through App Builder + Interface Designer + App Publisher) | 180×145 | App-builder animation, 231×186 viewBox |

**Two-stage hero swap** — `AgentScanningView` renders a keyed `<img>` where the `key` is `'scan' | 'doc-gen'`. When `currentIdx` transitions from 0 → 1 the element remounts, forcing the browser to restart the new SVG's SMIL animation from frame 0 instead of picking up mid-cycle.

## Animation primitives

All keyframes are inlined inside the `<InlineKeyframes>` component in `AppCreatingView.tsx` (exported and re-rendered by `AgentScanningView` so both screens share the same animation block). The cards on `NewAppView` use the gradient-border classes from `globals.css` (`.new-app-ai-border`, `.new-app-scratch-border`).

| Animation | Where | What it does |
|---|---|---|
| `ai-fade-up` | AppIdentity, every spec `<Section>`, every agent `<li>` row, the completion CTA block, the active-row checklist box | 8px slide + opacity from 0 — 0.55s out-expo easing |
| `skeleton-shimmer-i` | `SkeletonBar` overlay in the right-pane skeleton loaders | White highlight band sweep across each bar — 1.8s |
| `text-shimmer-i` | Available; not currently used (previously drove the active-row single-sentence shimmer that was replaced by the checklist box). | `background-position: 200% 0% → -200% 0%` — 4.5s linear |
| `dot-pulse-i` | The three dots after `is working on it` on the active row's title line (`<DotTrail>`) | Opacity 0.25 ↔ 1 + scale 0.85 ↔ 1.1 — 1.4s, staggered 0 / 200 / 400ms across the three dots |
| `ai-pulse-ping` | The blue radar ring around the **current** sub-item dot in the active-row checklist box | scale 1 → 2.2 + opacity 1 → 0 — 3.2s loop |
| `mat-spin-rotate-i` / `mat-spin-dash-i` | Material-style indeterminate spinner — defined but **not currently used** since the current sub-item state now renders the radar ping instead. Kept for revival. | Rotation + dash-array pulse — 2.2s |
| `ai-liquid-i` | The `.flat-liquid` class — used by `LeftPane`'s fallback hero (sparkle-on-blob composition). Neither current screen exercises that branch since both pass a custom `hero` SVG loader. Kept for revival. | Border-radius morph — 6s |
| `ai-icon-flash-i` / `.ai-icon-flash` | Diagonal white shine sweep across the fallback sparkle hero (clipped to the icon silhouette via SVG SMIL inside the sparkle SVG). Currently unused since the fallback hero doesn't render on either screen. | Skew + translate — 3.6s |
| `success-check-pop-i` / `.success-check-pop` | The white `<CheckCheck>` inside the completion popover's green badge. Plays once on mount. | `scale(0.2) rotate(-8deg) → scale(1.2) rotate(4deg) → scale(0.94) rotate(-2deg) → scale(1) rotate(0)` — 0.85s `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot) |
| `confetti-burst-i` / `.confetti-particle` | The 12 confetti particles bursting outward from the badge on the completion popover. Loops indefinitely. | pop-in at 7% → fly to endpoint by 40% → fade to 55% → invisible 55%–100% for rest phase — 3.6s infinite loop, `cubic-bezier(0.16, 1, 0.3, 1)`. Endpoints driven by CSS custom properties `--cx`, `--cy`, `--cr` per particle. |

**SVG `<animateTransform>` (not a CSS keyframe):** the active-state avatar's `<linearGradient>` declares `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="4.5s" repeatCount="indefinite" />` inline, rotating the gradient inside the rounded-square shape.

**Avatar gradients are inline per-agent.** Each avatar's `<svg>` declares its own `<linearGradient id="agent-grad-{color}">` — magenta / green (post-review roster) or magenta / purple (pre-review roster). Active uses a 3-stop rotating gradient (`-300 → -600 → -300`); done uses the static 2-stop (`-400 → -500`).

**Removed / superseded in recent iterations**:
- **5-agent post-review roster** (Role / Flow / Entity / Page / Navigation creator, 4s×4 phases each = 80s) → then **2-agent** (App Builder + Validator) → now **5-agent** (Requirements Analyst + Solutions Architect pre-run, App Builder + **Interface Designer** + **App Publisher** running). App Builder gained a "Wiring up the workflows" phase (now 6 phases total). Validator replaced by **App Publisher** (`Rocket` / green, 1 phase — "Publishing the app"). Designer / Publisher were renamed to **Interface Designer** / **App Publisher** to better describe their scope.
- **Right-pane typography compression** — section title 18px → 16px, list content 14px → 13px on both lines, list row gap `space-y-2` (8px) → `space-y-3` (12px), count-badge padding `py-0.5` → `py-1`, Data entities count went from `"3 entities · 15 fields"` → bare `"3"` to match the other sections.
- **Active row's `working on it`** → `is working on it` (small copy tweak so the sentence flows as `{name}` on line 1, `is working on it ●●●` on line 2).
- **6-agent pre-review roster** (Requirement Validator → Entity enricher, 1.2s×4 phases each = 29s) → replaced by 2-agent roster (Requirements Analyst 2×3s + Solutions Architect 7×5s = ~41s).
- **Single-line agent rows** (`{name} {tag}` on one row) → replaced by **two-line stack** (name on line 1, tag/success on line 2). Both lines `whitespace-nowrap`; row top-aligns naturally against the 32px avatar without special padding.
- **Single-agent-index right-pane logic** (`builderPhase` alone drove all 4 sections) → replaced by **two-agent-index** logic (`builderPhase` drives Roles + Data entities + Workflows; `designerPhase` drives Pages + Navigation).
- **4-section right pane** (Roles / Data entities / Pages / Navigation) → **5 sections** with the new **Workflows** section inserted between Data entities and Pages. Icon `Workflow` in `orange-500`; each row shows name + `Steps: …` comma-separated.
- **Plain white completion modal** (small green circle + "App generated successfully" title + Open app pill) → **aesthetic celebration popover** with gradient hairline ring, pulsing green badge, `success-check-pop` spring animation on the tick, and a **repeating confetti burst** (12 particles, 3.6s loop with rest phase). Added a **close button** (X, top-right) wired to `AppCreatingView`'s `dialogClosed` state so it stays dismissed. Sub-line now names the app inline (`Your requested app **{appName}** is now ready to view.`). CTA switched from a custom pill button to the shared `<Button>` component matching the review dialog's "Create app".
- **`PHASE_DURATION` / `PHASES_PER_AGENT` module exports** — gone. Replaced by per-file `AGENT_PHASE_DURATIONS_MS` + `TICK_SCHEDULE` (module-computed at load time).
- **Setinterval tick advance** — gone. Replaced by `setTimeout` map over `TICK_SCHEDULE` so each phase can carry its own duration.
- **Card-per-item lists** for Roles / Pages / Navigation, and the multi-column `EntityTable` for Data entities → replaced by flat checklist rows (green tick + name), with entities showing `Fields: name1, name2, …` as their second line.
- **Card-chrome skeleton loaders** (`SingleItemSkeleton` in a bordered white card) → replaced by flat `RowListSkeleton` (N rows, each with a gray Circle + shimmering bars).
- **Inline completion CTA** (below the agent timeline in the LeftPane) → replaced by the `AppCreatedDialog` popover.
- **Section header colored dot + text-only title** → replaced by `Section`'s optional `icon` prop (16×16 lucide glyph in the section's accent colour). Content and subtitle indent to `26px` (16px icon + 10px `gap-2.5`) to align under the title text.
- **Border-and-background status pills** → replaced by solid-fill pills (`bg-magenta-500 text-white` for Generating, `bg-green-500 text-white` for Generated).
- **Default Sparkles-on-blob hero** on both screens → replaced by custom animated SVG loaders passed via the `hero` prop (see Loader assets). The fallback composition + `ai-liquid-i` / `ai-icon-flash-i` animations are kept in code for revival.
- The previous **hex-centric scanning popover** (`AIScanningDialog`) and its `hex-stroke-flow` + `hex-halo` keyframes are no longer wired into the flow. The file remains as historical context but is not rendered.
- The **always-visible roster** behaviour and the **single-sentence text-shimmer** active-agent treatment — see snapshot docs for the previous behaviour.
- `orbit-stroke-i`, `glow-pulse-i`, `spin-slow-i` keyframes — added briefly to support the active-state variant exploration; removed when `gradient-shift` was chosen. Recipes live in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md).

## Forked vs shared (vs `/create` flow)

| File in `components/new-app/` | Origin | Diverged how |
|---|---|---|
| `NewAppView.tsx` | new | (no origin) — built fresh for this flow |
| `BuildWithAIView.tsx` | `components/create/AIPromptViewNew.tsx` | Stubbed `createApp()`, mock app name/description override, `bg-blue-500` primary instead of magenta gradient, success-screen no-op |
| `AgentScanningView.tsx` | new | Pre-review screen reusing `AppCreatingView`'s `LeftPane`. Replaces the hex-centric scanning popover. **2-agent roster** (Requirements Analyst 2×3s → Solutions Architect 7×5s), ~41s total, per-agent phase durations via `TICK_SCHEDULE`. Two-stage hero SVG (scan → doc-gen) keyed on `currentIdx`. |
| `AIScanningDialog.tsx` | `components/create/AIScanningDialog.tsx` | **No longer rendered in this flow** (replaced by `AgentScanningView`). File kept for reference. |
| `AppReviewDialog.tsx` | `components/create/AppReviewDialog.tsx` | Icon picker removed, gradient title at 24px, callback signature trimmed to `{name, description}`, sized to `w-[550px] h-[460px] p-8` |
| `AppCreatingView.tsx` | new | Two-pane (5:7) layout with agent timeline + spec artifact. **5-agent roster** (2 pre-run + App Builder 6×5s + Interface Designer 2×5s + App Publisher 1×5s = ~45s of runtime). Sequential right-pane reveal driven by `builderPhase` (Roles / Data entities / Workflows) + `designerPhase` (Pages / Navigation). Custom `/app-builder-loader.svg` hero. Completion `AppCreatedDialog` popover (aesthetic — gradient ring, pulsing badge, confetti loop) opens on `allAgentsDone`, gated by `HOLD_COMPLETION_DIALOG` (currently `false` — popover is live) and `dialogClosed` local state. Exports `LeftPane`, `BackgroundAtmosphere`, `InlineKeyframes`, and the `Agent` interface so `AgentScanningView` can compose the same shell. |

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
- **Open app routing is a no-op** — the completion CTA in `AppCreatedDialog` (green-circle check + confetti burst + "App Generated Successfully" + Open app button) calls `onComplete`, which `BuildWithAIView`'s `handleCreatingComplete` currently stubs out (no navigation, no real app to open). This needs design + a target route once the rest of the flow is wired up.
- **`HOLD_COMPLETION_DIALOG` design-iteration flag** — a `const HOLD_COMPLETION_DIALOG = false` at the top of `AppCreatingView.tsx` gates the popover so it can be temporarily suppressed while iterating on the building screen. Currently `false` (popover fires normally). Flip to `true` to hide the popover and keep the resolved right-pane spec visible after all agents finish.
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
