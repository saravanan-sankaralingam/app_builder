# Platform — Create

> ⚠️ **Current state: partly wired, partly stubbed, with two parallel AI
> implementations.** "Create from scratch" works end-to-end (POSTs to
> `/api/apps` and opens the Builder). The AI flow exists in **two variants**
> ("Build with AI" + "Build with AI (old)") — both reach a creation step but
> the routes through them differ and only one should survive. The first
> screen at `/create` lists six item types (App, Process, Board, Portal,
> Dataset, Integration) but only **App** routes forward; the other five
> `console.log` and stay put. This doc captures the surface as it stands so
> we can resolve the known issues against a known baseline.

The Create flow is how a user spawns a new app from the Platform. It sits inside the Platform shell (top nav + left nav, see [`PLATFORM_SHELL.md`](PLATFORM_SHELL.md)).

Routes:

| Route | Component | Purpose |
|---|---|---|
| `/create` | `app/(main)/create/page.tsx` → `<CreateView>` | **Step 1 — pick what to create.** Lists 6 item types; only `App` routes forward. |
| `/create/app` | `app/(main)/create/app/page.tsx` → `<AppCreateView>` | **Step 2 — pick a creation method**, then drives the entire AI / scratch flow as a single client-side state machine. |

There is no per-step URL — every sub-state on `/create/app` (AI prompt, analyzing, suggestion dialog, creating, conversation, generating, preview, building, loader demo) is held in local `useState`, not in the URL. **One consequence: browser back/refresh always returns you to the method-selection state.**

## `/create` — item-type selection

`components/create/CreateView.tsx`. Single-column layout, gray-50 page bg, title `Create from scratch`, back button top-left, a vertical list of six cards.

Each card is a `<CreateOptionCard>` (`components/create/CreateOptionCard.tsx`) — icon tile + title + description. The cards (`CreateView.tsx:8-57`):

| Card | Icon | onClick today |
|---|---|---|
| **App** | `LayoutGrid` | `router.push('/create/app')` |
| **Process** | `GitBranch` | `console.log` only — does nothing |
| **Board** | `LayoutDashboard` | `console.log` only |
| **Portal** | `Globe` | `console.log` only |
| **Dataset** | `Database` | `console.log` only |
| **Integration** | `Plug` | `console.log` only |

All five non-App cards are **dead clicks** — the route navigation for them isn't implemented.

## `/create/app` — the AppCreateView state machine

`components/create/AppCreateView.tsx`. One component holds a `mode` enum (`AppCreateView.tsx:17`) and conditionally renders one of ~10 sub-views.

```
type CreateMode =
  | 'selection'      // default — pick a method
  | 'ai-prompt'      // OLD AI prompt screen
  | 'ai-prompt-new'  // NEW AI prompt screen
  | 'analyzing'      // AI is "analysing" the prompt (animation)
  | 'name-dialog'    // confirm suggested name/description/icon
  | 'creating'       // 60-second multi-step creation animation
  | 'conversation'   // OLD chat-style refinement (currently unreachable)
  | 'generating'     // OLD generation layout with chat + dashboard preview
  | 'preview'        // OLD post-generation preview
  | 'building'       // placeholder for "full builder"
  | 'loader-demo'    // dev/debug surface for the creation loader
```

### Method selection (`mode === 'selection'`)

The default render. Renders four `<CreateMethodCard>` tiles in a 4-column grid (`AppCreateView.tsx:296-342`).

| Card | Routes to | Status |
|---|---|---|
| **Build with AI** | `setMode('ai-prompt-new')` → `<AIPromptViewNew>` | Active, intended primary AI path |
| **Build with AI (old)** | `setMode('ai-prompt')` → `<AIPromptView>` | Active, legacy AI path — **candidate for removal** |
| **Create from scratch** | Opens `<AppNameForm>` modal | Active, works end-to-end |
| **Loader animation** | `setMode('loader-demo')` → `<LoaderDemoView>` | Dev-only — debug surface for `<AppCreatingView>`'s 60-second animation |

### "Create from scratch" path

Modal form, no mode change.

1. Click → `<AppNameForm>` opens (`components/create/AppNameForm.tsx`) — collects `name`, optional `description`, `icon` (lucide name from a fixed palette), `iconBg` (one of `APP_COLORS` in `lib/schema/types`).
2. Submit → `handleFormSubmit()` (`AppCreateView.tsx:133-159`) → `createApp()` POST `/api/apps` (`lib/api/apps.ts:83`).
3. On success: closes the modal, opens `/builder/[newApp.id]` in a new tab, and routes the current tab to `/explorer`.
4. On error: re-throws so the form displays the message inline.

This is the **only path that calls `createApp()` from `AppCreateView` directly**. The AI path also calls `createApp()` but from inside `<AppCreatingView>` (`components/create/analyzing/AppCreatingView.tsx`).

### "Build with AI" path (new — primary)

```
selection
  → ai-prompt-new          (AIPromptViewNew.tsx)
    submit (prompt + files)
  → analyzing              (analyzing/AIAnalyzingView.tsx)
    fake delay → returns AISuggestionResult
  → name-dialog            (analyzing/AppSuggestionDialog.tsx)
    confirm
  → creating               (analyzing/AppCreatingView.tsx)
    7-step loop totalling ~60s — calls createApp() internally
  → (currently) handleCreatingComplete is a console.log
```

`<AIPromptViewNew>` accepts attachments (`.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg`, 10MB cap each, max 3000 chars in prompt). It also exposes an internal "scanning dialog" + "review dialog" path (`AIScanningDialog`, `AppReviewDialog`) that can short-circuit straight to app creation — that flow currently coexists with the parent state machine and is worth straightening out.

`<AppCreatingView>` plays the 7-step animation hard-coded in `CREATION_STEPS` (`AppCreatingView.tsx:18-58`):
- Creating roles → data → views → reports → pages → navigation → assembling apps
- Each step ~8.57s (60s total / 7 steps)
- Calls `createApp()` partway through; navigation behaviour on completion is currently a placeholder

### "Build with AI (old)" path (legacy)

```
selection
  → ai-prompt              (AIPromptView.tsx)
    submit (prompt + files) — no attachments-with-files-array variant
  → analyzing              (same component as the new path)
  → name-dialog            (same dialog)
  → creating               (same creating view)
```

Functionally overlaps with the new path; the divergence is in `<AIPromptView>` vs `<AIPromptViewNew>` (UX of the prompt screen). After the prompt is submitted, the two paths converge on the same `analyzing` / `name-dialog` / `creating` subsequence.

Additionally, `handleConversationPhaseChange` (`AppCreateView.tsx:112-118`) and `handleGenerationPhaseChange` (`:120-126`) wire up `mode === 'conversation' | 'generating' | 'preview' | 'building'`, which are **currently unreachable from the selection screen** — they survive from an earlier conversation-based UX and feed into `<ConversationView>` (`conversation/`) and `<AppGenerationLayout>` (`generation/`). Marked for removal unless we revive that flow.

### Loader demo (`mode === 'loader-demo'`)

`<LoaderDemoView>` — visual harness for `<AppCreatingView>` so we can tune the 60s animation without going through the full AI path. **Not a real user surface.**

## Component inventory

```
app/(main)/create/
├── page.tsx                       /create  → <CreateView>
└── app/page.tsx                   /create/app → <AppCreateView>

components/create/
├── CreateView.tsx                 6-item type selector (only App routes forward)
├── CreateOptionCard.tsx           Card used by CreateView
├── AppCreateView.tsx              State machine for /create/app
├── CreateMethodCard.tsx           Tile used in the method-selection grid
│
├── AppNameForm.tsx                "Create from scratch" modal (works end-to-end)
│
├── AIPromptView.tsx               OLD AI prompt screen
├── AIPromptViewNew.tsx            NEW AI prompt screen (attachments + scanning/review dialogs)
├── AIScanningDialog.tsx           Used by AIPromptViewNew's short-circuit path
├── AppReviewDialog.tsx            Used by AIPromptViewNew's short-circuit path
│
├── analyzing/
│   ├── AIAnalyzingView.tsx        "Analyzing your prompt…" animation, returns AISuggestionResult
│   ├── AppSuggestionDialog.tsx    Confirm suggested name/description/icon/colour
│   ├── AppCreatingView.tsx        60-second 7-step creation animation; calls createApp()
│   └── index.ts
│
├── conversation/                  LEGACY chat-style refinement (currently unreachable)
│   ├── ConversationView.tsx
│   ├── ConversationInput.tsx
│   ├── ChatMessage.tsx
│   ├── ClarifyingQuestionsCard.tsx
│   ├── ConfirmGenerateCard.tsx
│   ├── RoleSuggestionCard.tsx
│   ├── ThinkingIndicator.tsx
│   ├── UserStoriesCard.tsx
│   ├── mockData.ts
│   ├── types.ts
│   └── index.ts
│
├── generation/                    LEGACY post-generation preview (currently unreachable)
│   ├── AppGenerationLayout.tsx
│   ├── ChatPanel.tsx
│   ├── DashboardPreview.tsx
│   ├── GenerationProgress.tsx
│   └── index.ts
│
└── LoaderDemoView.tsx             Dev-only harness for AppCreatingView
```

## Data flow at a glance

```
CreateView                     CreateOptionCard × 6
   │  click "App" only
   ▼
AppCreateView   (mode: selection)
   │
   ├── "Create from scratch"  ─►  AppNameForm modal ─►  createApp() ─►  open Builder + push /explorer
   │
   ├── "Build with AI"        ─►  AIPromptViewNew ─►  AIAnalyzingView ─►  AppSuggestionDialog
   │                                                                       │
   │                                                                       ▼
   │                                                                  AppCreatingView ─►  createApp()
   │
   ├── "Build with AI (old)"  ─►  AIPromptView ─────►  AIAnalyzingView ─►  AppSuggestionDialog ─►  AppCreatingView
   │
   └── "Loader animation"     ─►  LoaderDemoView (dev only)
```

## Backend touchpoints

- `POST /api/apps` (`lib/api/apps.ts:83` → `createApp()`) — used by both the scratch form and `<AppCreatingView>`
- Schema: `backend/prisma/schema.prisma` App model — accepts `name`, `description`, `icon`, `iconBg`, `type` (`app` / `portal`)
- The Process / Board / Dataset / Integration items from the first screen aren't backed by routes today — when they're wired up, expect new POST endpoints (or a single typed POST with `type` discriminator)

## Conventions

- Create is in the **Platform** half of the codebase — must **not** import from `components/builder/`
- Page components (`page.tsx`) stay **thin** — they wrap a single feature component (`<CreateView>` / `<AppCreateView>`)
- The state machine lives entirely in `AppCreateView`. Sub-views are **dumb** — they take callbacks (`onSubmit`, `onBack`, `onComplete`) and never call `createApp()` directly *except* for `<AppCreatingView>`, which historically owns the creation moment because the animation timing is part of the UX
- Selection in the left nav: `/create` and `/create/app` aren't currently surfaced as a top-level nav item — Create is reached from the **Create** button in the Explorer header

## Known issues (to resolve in upcoming work)

These are the rough spots the user has flagged or that are visible from the code today. **Treat this as the starting agenda**, not a final list:

1. **Two AI variants in production code** — `AIPromptView` (old) and `AIPromptViewNew` (new) both ship on the selection screen. Decide which survives; remove the other and the `'ai-prompt' | 'conversation' | 'generating' | 'preview' | 'building'` modes that go with the legacy flow.
2. **Five dead cards on `/create`** — Process / Board / Portal / Dataset / Integration click but go nowhere. Either wire them up or hide them until the routes exist.
3. **No URL state on `/create/app`** — refresh or back button always returns to method selection. Sub-states should probably reflect in the URL (e.g. `?method=ai`, `?phase=analyzing`).
4. **`createApp()` called from two places** — `AppCreateView.handleFormSubmit` (scratch) and `AppCreatingView` (AI). Centralise so error handling, navigation, and analytics live in one spot.
5. **AppCreatingView completion is a stub** — `handleCreatingComplete` in `AppCreateView.tsx:94-99` is a `console.log`. It should open the new app's Builder and route the current tab somewhere sensible (mirroring the scratch path).
6. **AIPromptViewNew has its own internal `createApp()` short-circuit** — via `AIScanningDialog` + `AppReviewDialog` — which bypasses the parent state machine entirely. Pick one ownership model.
7. **Loader demo is shipped on the user-facing selection screen** — should be moved behind a feature flag or dev-only route before any production rollout.
8. **No persistent draft state** — if the user is mid-prompt and navigates away, everything is lost. Consider localStorage or backend draft.
9. **No `Cancel` / `Discard` affordance** during `creating` — the 60-second animation can't be aborted.

## What's intentionally NOT implemented yet

- **The five non-App entry points** (Process / Board / Portal / Dataset / Integration) on `/create`
- **Real AI suggestion** — `AIAnalyzingView` returns mock `AISuggestionResult` values; no LLM call is made today
- **Real app generation** — `AppCreatingView` plays the 60-second animation in parallel with a single `createApp()` call (which just makes an empty app); it doesn't actually generate data layers, fields, views, etc.
- **Builder navigation after AI creation** — see issue #5 above
- **Telemetry / analytics** — none of the choices made in the flow are recorded
- **Tests** — none on the Create surface

## Where this is implemented

- `app/(main)/create/page.tsx` — `/create` route, composes `<CreateView>`
- `app/(main)/create/app/page.tsx` — `/create/app` route, composes `<AppCreateView>`
- `components/create/CreateView.tsx` — item-type selection (the 6-card list)
- `components/create/CreateOptionCard.tsx` — card used by `<CreateView>`
- `components/create/AppCreateView.tsx` — the central state machine for `/create/app`
- `components/create/CreateMethodCard.tsx` — tile used in method selection
- `components/create/AppNameForm.tsx` — scratch-create modal
- `components/create/AIPromptView.tsx` / `AIPromptViewNew.tsx` — AI prompt screens (legacy + current)
- `components/create/AIScanningDialog.tsx`, `AppReviewDialog.tsx` — AIPromptViewNew's short-circuit dialogs
- `components/create/analyzing/AIAnalyzingView.tsx` — "analysing prompt" animation
- `components/create/analyzing/AppSuggestionDialog.tsx` — confirm suggested name/icon
- `components/create/analyzing/AppCreatingView.tsx` — 60-second creation animation + `createApp()` call
- `components/create/conversation/*` — legacy chat refinement (unreachable)
- `components/create/generation/*` — legacy post-generation preview (unreachable)
- `components/create/LoaderDemoView.tsx` — dev harness for the creation loader
- `lib/api/apps.ts` — `createApp()` POST endpoint
- `lib/schema/types.ts` — `APP_COLORS`, `AppIconName`, `AppColor` used by the form + suggestion dialog
