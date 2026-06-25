# Platform — New App (left-nav Create > App)

> ⚠️ **Current state: design-only mock flow, no backend writes.** This is the
> left-nav-driven app-creation flow we are actively iterating on. Everything
> the user types or uploads is ignored — the demo always presents the same
> "Vendor Onboarding and Management" content downstream. The agent timeline,
> hex animation, and section skeletons are timed mocks, not real AI work.
> No `createApp()` call is made. Once the design and copy are signed off,
> this flow will replace the Explorer's `/create` + `/create/app` flow (see
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
   │                       ├──►  AIScanningDialog  (hex animation, 5s)
   │                       │       complete
   │                       ├──►  AppReviewDialog   (name + description)
   │                       │       Create app
   │                       └──►  AppCreatingView   (agents build the spec)
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

## 3 — AI scanning popover (`AIScanningDialog`)

`components/new-app/AIScanningDialog.tsx`. Forked from `components/create/AIScanningDialog.tsx`.

- **Frame**: `w-[550px] h-[420px] p-7 rounded-xl bg-white` with a soft drop shadow over a `bg-black/50` overlay
- **Title**: `AI at work` — 24px semibold with the magenta-500 → purple-500 265° gradient (text)
- **Centrepiece**: a **rounded-corner SVG hexagon** (radius 80, corner radius 16, perimeter ≈ 388.5)
  - **Fill**: static `linearGradient` magenta-500 → purple-500 → blue-500 (135°)
  - **Stroke**: 3px gradient stroke (magenta-300 → white → blue-300) with `stroke-dasharray="80 ${HEX_PERIMETER - 80}"` — only one bright "comet" is visible at a time, traversing the perimeter every 3 seconds
  - **Halo**: container has a CSS `filter` with two stacked `drop-shadow()` calls cycling magenta → purple → blue every 4.5s — gives the hex a colour-morphing aura
  - **Agent icon overlay**: a 48×48 lucide glyph centred over the hex, white with a 1px drop-shadow, fades in/out as the cycling agent changes
- **Agent rotation**: seven mock agents in the `AGENTS` array (Document parser, Rule extractor, Role identifier, Data Modeler, Role Designer, Workflow Architect, UI Composer). The dialog runs for a total of `TOTAL_DURATION = 5_000` ms (5 seconds), with each agent visible for ~714ms (`STEP_DURATION = TOTAL_DURATION / AGENTS.length`). The labels rotate purely for narrative effect during scanning.
- **Below the hex**: an agent name row (`{name} working…` with blinking-cursor ellipsis) and a description line (`text-sm text-gray-600`). Both re-key on agent change to re-fire the `ai-fade-up` (8px slide + opacity) animation.
- **Abort button** at the bottom, ghost variant in red.

Keyframes are inlined inside the dialog via a `<style>` element (`InlineKeyframes`) — failsafe in case `globals.css` is cached.

## 4 — Review dialog (`AppReviewDialog`)

`components/new-app/AppReviewDialog.tsx`. Forked from `components/create/AppReviewDialog.tsx` with three deliberate differences:

- **Same frame as scanning** (`w-[550px] h-[420px]`) so the dialog doesn't jump between the two beats
- **Icon picker entirely removed** — the original component had a 20-icon grid + color swatches. Gone. The `onCreateApp` callback signature was trimmed to `(data: { name: string; description: string })` to match.
- **Title gradient** uses the brand tokens directly: `linear-gradient(265deg, var(--magenta-500), var(--purple-500))` — same 265° magenta→purple read as the AI scanning dialog and the building screen, all three on one chord.
- **Title size** is 24px (`text-2xl`), the description below it is 12px regular gray-700 with a tight 4px gap above (`mb-1` on the title block, `mb-6` below the subtitle).
- Form fields (`App name`, `Description`) use the app-wide standards baked into `components/ui/label.tsx`, `input.tsx`, and `textarea.tsx` — see [`FORM_STANDARDS.md`](FORM_STANDARDS.md).
- Action row pinned to the bottom of the 420px frame via `mt-auto`. Primary `Create app` button uses `bg-blue-500 hover:bg-blue-600` (brand primary).

## 5 — Building screen (`AppCreatingView`) — the centrepiece

`components/new-app/AppCreatingView.tsx`. The post-create artifact view. **This is the screen we are actively iterating on.**

**Outer container**: full-height (`min-h-[calc(100vh-3.5rem)]`) on `bg-[#FDF8FC]` (light pink-purple wash) with three large blurred colour orbs as background atmosphere (`BackgroundAtmosphere`):
- Top-left magenta orb, 620×620, blur(60px), 18% alpha
- Right-centre purple orb, 540×540, blur(60px), 16% alpha
- Bottom-left blue orb, 480×480, blur(60px), 10% alpha

**Back button** floats absolute at `top-6 left-6 z-20` so the right pane can take the full height.

**Asymmetric 5:7 grid** (`grid-cols-[5fr_7fr] gap-6 p-6`) — 24px outer padding, 24px gap between panes.

### Left pane — narrative

Content is pinned to the top of the pane (`justify-start`); the timeline below it flows naturally to fill the remaining height. The previous BUILDING chip and the central liquid-morph animation have both been removed — the screen now reads as a quieter, type-and-list composition.

The whole left-pane content column is wrapped in `w-full max-w-[480px]` so the title block + AI hero icon get the wider canvas. The **agent timeline** inside has its own `max-w-[400px] mx-auto` so it stays narrower (the agent rows would feel sparse at 480px), centered under the title.

**Title block** (centred, `mb-8` below):
- Title `Your app is being crafted, layer by layer` — **24px semibold**, magenta-500 → purple-500 265° gradient (same gradient as the Review dialog title). "Layer by layer" ties to the 5-agent timeline and the 5-layer architecture (Data / Interface / Logic / Roles / Settings).
- Description `Our AI agents are collaborating in real time to bring your {appName} app to life — defining roles, modeling data, and composing pages along the way.` — **13px gray-900**, `leading-relaxed`, `max-w-[440px]` (slightly narrower than the 480px wrapper for visual rhythm). The app name is highlighted via `font-semibold` inline. The em-dash list mirrors three of the five agents in the timeline below. Wired through from `AppCreatingView` via an `appName` prop on `LeftPane`.

**AI hero icon** (centred, `mb-8` below the title block):
- Standalone lucide `Sparkles` glyph, **80×80** (`w-20 h-20`), colour `var(--purple-500)`, `strokeWidth={1.25}` for an airy look.
- No squircle container behind it — the glyph reads on its own.

**Agent timeline** — enclosed in a glassy container:
- Outer ring: `linear-gradient(246.77deg, var(--purple-200), var(--magenta-200))` at 1.5px (the AI-gradient border)
- Inner surface: **`color-mix(in srgb, var(--white) 75%, transparent)`** (75% of the `--white` token; the page wash + atmosphere orbs bleed through subtly), `rounded-[10.5px]` (12 − 1.5 = 10.5 so corners stay concentric with the outer)
- **36px interior padding** (`p-9`)
- Implemented as **two nested divs** rather than the linear-gradient(white,white) padding-box trick — outer div carries the gradient, inner div carries the translucent fill.

Inside the container, 5 sequential rows with a faded vertical connector line (`left-[16px] top-3 bottom-3`, **inline** `linear-gradient(to bottom, transparent, var(--gray-300), transparent)` — uses the project's `--gray-300` token, not Tailwind's `gray-200`). Rows are flat (no card backgrounds) and separated by `space-y-4` (16px gap).

**Agent avatar** (the new visual identity):
- Shape: **rounded-corner squircle octagon** — imported as `AVATAR_PATH_D` constant from `/Downloads/shape_octogan.svg`, rendered via SVG `<path>` with `viewBox="0 0 198 198"` so it scales cleanly into any container size
- Size: **32×32** (`w-[32px] h-[32px]`)
- Centred glyph: white lucide icon at 16×16 (`w-4 h-4`), `strokeWidth={2.25}` for crisp small-size legibility
- The five colour assignments form a warm-to-cool progression so the list reads at a glance:

  | # | Agent | Colour | Glyph | Why this glyph |
  |---|---|---|---|---|
  | 1 | Role creator agent | **magenta** | `Users` | people / permissions |
  | 2 | Flow creator agent | **purple** | `Workflow` | sequencing / workflow |
  | 3 | Entity creator agent | **blue** | `Database` | data models |
  | 4 | Page creator agent | **cyan** | `LayoutGrid` | UI layouts |
  | 5 | Navigation creator agent | **green** | `Compass` | wayfinding |

**Per-state avatar treatment** (state differentiation is now wired in — `AgentStatus` branches on `state`):

| State | Avatar component | Visual |
|---|---|---|
| **Active** | `<ActiveGradientShiftAvatar>` | Bold avatar whose fill gradient **rotates 360°** via inline SVG `<animateTransform>`. Three-stop gradient `var(--{color}-300) → var(--{color}-600) → var(--{color}-300)`, `gradientTransform` rotates `0 0.5 0.5 → 360 0.5 0.5`, `dur="4.5s" repeatCount="indefinite"`. Colours appear to flow through the squircle. |
| **Queued** | `<StaticBoldAvatar>` wrapped in `<div style={{ opacity: 0.35 }}>` | Bold static `-400 → -500` linear-gradient avatar + white glyph, dimmed to 35% opacity. Reads as a "pending peer" to the active row. Chosen from a 4-variant swatch exploration — see [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md#queued-state-explorations-archived). |
| **Done** | `<StaticBoldAvatar>` | Bold static `-400 → -500` linear-gradient avatar + white glyph, full opacity. The row itself adds `opacity-90` as a subtle "settled" cue. |

Other active-state avatar variants we explored (`pulse-halo`, `orbit-border`, `pulse-glow`, `dashed-ring-spin`) are archived in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md) with copy-paste recipes.

**Name + description treatment by state** (font sizes: name **14px**, description **12px**):

| State | Name | Description |
|---|---|---|
| **Queued** | `<SkeletonBar width="60%" height="14px" shimmering />` (the existing right-pane helper, reused) | `<SkeletonBar width="85%" height="10px" shimmering />`. Both bars use the right-pane shimmer language so the left timeline and the right spec sections share one "not yet generated" vocabulary. Wrapped in `space-y-2.5 pt-1` to mirror `SectionSkeleton`. |
| **Active** | `text-[14px] text-gray-900 font-semibold tracking-tight` — the previous `…` magenta cursor was removed | `<div class="text-[12px] mt-0.5 leading-snug">` containing two siblings: (1) `<span class="text-shimmer">` with `background-image: linear-gradient(90deg, var(--gray-600) ... var(--{color}-500) @50% ... var(--gray-600))` and `background-clip: text` — a coloured highlight band sweeps across the gray letters; (2) **three 4×4 dots** in `var(--{color}-500)` with staggered `dot-pulse-i` animation (200ms delays, opacity 0.25 ↔ 1, scale 0.85 ↔ 1.1, 1.4s loop) — the loading-trail. Dots sit on the text baseline via `inline-flex align-middle gap-3px`. |
| **Done** | `text-[14px] text-gray-900 font-medium` (no cursor, no shimmer) + row-level `opacity-90` | Plain `<p class="text-[12px] mt-0.5 text-gray-600 leading-snug">` |

### Right pane — spec artifact

A **glassmorphic card** (`bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-...`) split into two vertical zones.

**Pinned header** (`px-9 py-7 flex-shrink-0`) holds the **`AppIdentity` card**:
- Outlined container: `bg-gray-50 border border-gray-200 rounded-xl p-4`
- **No app icon** (icon was removed in design iteration — the container itself reads as the identity surface)
- App name — 16px semibold gray-900, `leading-snug`
- Description — 13px regular gray-600, `leading-relaxed`, falls back to a polished 2-line default (`FALLBACK_DESCRIPTION`) if the prop description is shorter than 60 characters

**Scrollable content** (`flex-1 overflow-y-auto px-9 py-7 space-y-7`) renders one `SpecSection` per agent that has activated:
- Section icon tile — flat `bg-[var(--magenta-100)]` square (32×32, `rounded-lg`) with the agent's lucide glyph in `text-magenta-600` (no gradient, no inset shadow)
- Section title — 13px semibold gray-900
- Status pill (right-aligned):
  - **Generating** — magenta-50 pill with pulsing magenta-500 dot
  - **Done** — green-50 pill with check
- Content below the header row (indented `pl-[44px]` to align with the title) — **skeleton placeholder**: 1 title-style bar (14px tall, 48% wide) + 3 description-style bars (10px tall, decreasing widths)
- **Skeleton uses neutral gray, not magenta** — base is `rgba(34,42,59,0.05) → 0.10 → 0.05`; the shimmer overlay is `rgba(255,255,255,0.65)` (a white highlight band sweeping every 1.8s)

### Timing

- `AGENT_DURATION = 6_000` ms per agent
- `HOLD_AFTER_LAST = 1_500` ms — extra hold before `onComplete` fires
- `TOTAL_DURATION = AGENT_DURATION * AGENTS.length + HOLD_AFTER_LAST` = 31.5s total

**Currently HELD at the first agent (Role creator)** for design iteration — the interval and the completion timer are commented out in the `useEffect` of `AppCreatingView` (clearly marked `HOLD:`). Uncomment that block to resume the sequence.

## Mock data summary

| Value | Defined in | Used by |
|---|---|---|
| `MOCK_APP_NAME = 'Vendor Onboarding and Management'` | `BuildWithAIView.tsx:31` | Review dialog → AppCreatingView's AppIdentity |
| `MOCK_APP_DESCRIPTION` (250-char polished 2-line summary) | `BuildWithAIView.tsx:32` | Same path |
| `FALLBACK_DESCRIPTION` (safety net if appDescription < 60 chars) | `AppCreatingView.tsx` | AppIdentity description slot |
| `AGENTS` array (7 entries) | `AIScanningDialog.tsx` | The scanning popover's rotating label |
| `AGENTS` array (5 entries: Role, Flow, Entity, Page, Navigation) — each carries `id`, `name`, `description`, `sectionTitle`, `icon` (lucide), and **`color`** (typed as `'magenta' \| 'purple' \| 'blue' \| 'cyan' \| 'green'`) | `AppCreatingView.tsx` | Left-pane timeline avatars + right-pane spec sections |
| `AVATAR_PATH_D` — SVG path for the rounded squircle-octagon agent avatar, 198×198 coords (source: `/Downloads/shape_octogan.svg`) | `AppCreatingView.tsx` | Every agent avatar in the left-pane timeline |
| `FALLBACK_DESCRIPTION` (safety net if appDescription < 60 chars) — already listed above | `AppCreatingView.tsx` | AppIdentity description slot |

## Animation primitives

All keyframes are inlined inside `<InlineKeyframes>` components in `AIScanningDialog.tsx` and `AppCreatingView.tsx` — failsafe against `globals.css` cache misses. The cards on `NewAppView` use the gradient-border classes from `globals.css` (`.new-app-ai-border`, `.new-app-scratch-border`).

| Animation | Where | What it does |
|---|---|---|
| `ai-fade-up` | AppIdentity, every `SpecSection`, agent name/description rotations | 8px slide + opacity from 0 — 0.55s out-expo easing |
| `ai-cursor` | Defined but **no longer used in `AppCreatingView`** — was the `…` cursor next to the active agent name; removed in favour of the 3-dot pulse trail at the end of the description. Still wired in `AIScanningDialog`. | Step-2 cursor blink — 0.9s loop |
| `hex-stroke-flow` | AIScanningDialog hex border | `stroke-dashoffset` march around the rounded-hex perimeter — 3s |
| `hex-halo` | AIScanningDialog hex container | Multi-`drop-shadow` colour cycle magenta → purple → blue → magenta — 4.5s |
| `skeleton-shimmer-i` | `SkeletonBar` overlay — right-pane `SectionSkeleton`s **and** left-pane queued agent name + description bars | White highlight band sweep across each bar — 1.8s |
| `text-shimmer-i` | The active agent description text (a coloured band sweeps through the letters via `background-clip: text`) | `background-position: 200% 0% → -200% 0%` — 4.5s linear |
| `dot-pulse-i` | The three loading-trail dots at the end of the active description | Opacity 0.25 ↔ 1 + scale 0.85 ↔ 1.1 — 1.4s, staggered 0 / 200 / 400ms across the three dots |
| `ai-pulse-ping` | Defined in `InlineKeyframes` but **not used** by the current `gradient-shift` avatar treatment. Available for revival via the archive doc. | scale 1 → 2.2 + opacity 1 → 0 — 3.2s loop |

**SVG `<animateTransform>` (not a CSS keyframe):** the active-state avatar's `<linearGradient>` declares `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="4.5s" repeatCount="indefinite" />` inline, rotating the gradient inside the squircle. Pure SVG SMIL — needs no CSS keyframe and doesn't appear in `InlineKeyframes`.

**Avatar gradients are inline per-agent.** Each agent avatar uses a unique SVG `<linearGradient id="agent-grad-{color}">` defined inside the avatar's `<svg>` — magenta / purple / blue / cyan / green. Active uses a 3-stop rotating gradient (`-300 → -600 → -300`); queued/done use the static 2-stop (`-400 → -500`).

**Removed in recent iterations**:
- `ai-liquid` keyframe + `.ai-liquid` class — the central liquid-morph blob in the left pane was deleted; the `LiquidCentrepiece` function is gone.
- `.ai-gradient` class — the old animating multi-stop magenta background. Replaced by per-agent inline SVG gradients.
- The Building chip (uppercase `BUILDING` pill above the title) — gone with its pulsing dot.
- The magenta `…` cursor next to the active agent name — replaced by the 3-dot pulse trail at the end of the description.
- `orbit-stroke-i`, `glow-pulse-i`, `spin-slow-i` keyframes — added briefly to support the active-state variant exploration; removed when `gradient-shift` was chosen. Their recipes live in [`AGENT_ACTIVE_VARIANTS.md`](AGENT_ACTIVE_VARIANTS.md).

## Forked vs shared (vs `/create` flow)

| File in `components/new-app/` | Origin | Diverged how |
|---|---|---|
| `NewAppView.tsx` | new | (no origin) — built fresh for this flow |
| `BuildWithAIView.tsx` | `components/create/AIPromptViewNew.tsx` | Stubbed `createApp()`, mock app name/description override, `bg-blue-500` primary instead of magenta gradient, success-screen no-op |
| `AIScanningDialog.tsx` | `components/create/AIScanningDialog.tsx` | Hex centrepiece, agent rotation, 5s total runtime, sized to match review dialog |
| `AppReviewDialog.tsx` | `components/create/AppReviewDialog.tsx` | Icon picker removed, gradient title at 24px, callback signature trimmed to `{name, description}`, sized to match scanning dialog |
| `AppCreatingView.tsx` | new | Two-pane (5:7) layout with agent timeline + spec artifact — does not exist in the `/create` flow |

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
- **Sequence held at first agent** — `AppCreatingView` is currently parked on the Role creator agent (interval and completion timer commented out in `useEffect`). Uncomment that block to resume the agent sequence end-to-end.
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
- `components/new-app/AIScanningDialog.tsx` — AI-at-work popover (hex animation)
- `components/new-app/AppReviewDialog.tsx` — review name/description before commit
- `components/new-app/AppCreatingView.tsx` — two-pane building screen with agent timeline + spec artifact
- `components/layout/Sidebar.tsx:67-98` (`createOptions` + `CreateOptionsList`) — left-nav Create popover; only the App entry routes here today
- `app/globals.css` — `.new-app-ai-border` and `.new-app-scratch-border` gradient-border classes used by `NewAppView`'s method cards
- `lib/schema/types.ts` — `APP_COLORS`, `AppIconName`, `AppColor` (kept; not used by this flow's components currently)

## Related

- [`PLATFORM_CREATE.md`](PLATFORM_CREATE.md) — the Explorer-driven `/create` + `/create/app` flow this one will eventually replace
- [`PLATFORM_EXPLORER.md`](PLATFORM_EXPLORER.md) — describes the Explorer's `Create` button that still routes to `/create` today
- [`FORM_STANDARDS.md`](FORM_STANDARDS.md) — form-field typography rules used in the Review dialog
- [`COLORS.md`](COLORS.md) — brand colour tokens used throughout this flow
