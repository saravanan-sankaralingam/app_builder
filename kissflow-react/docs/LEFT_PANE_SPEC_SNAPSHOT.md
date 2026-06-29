# Left pane spec — design snapshot (for recovery)

Snapshot of the left pane (vertical agent timeline) in `components/new-app/AppCreatingView.tsx` as it stands before the "Hybrid Timeline" enrichment pass. If a future change drifts, restore from here.

## Overall structure

```
LeftPane (flex flex-col items-center justify-start py-10 px-8 overflow-y-auto)
└── Content column (w-full max-w-[480px])
    ├── Title block (centred, mb-8)
    │   ├── h1 — 24px semibold, magenta-500 → purple-500 265° gradient text
    │   └── p — 13px gray-900 leading-relaxed, max-w-[440px], appName highlighted in font-semibold
    ├── Sparkles hero icon (centred, mb-8)
    │   └── lucide Sparkles, w-20 h-20 (80×80), color var(--purple-500), strokeWidth 1.25
    └── Timeline container (gradient ring + glass fill, max-w-[400px] mx-auto)
        ├── Outer ring — rounded-xl p-[1.5px], background: linear-gradient(246.77deg, var(--purple-200), var(--magenta-200))
        └── Inner surface — rounded-[10.5px] p-9 (36px), background: color-mix(in srgb, var(--white) 75%, transparent)
            └── ol (relative, space-y-4) — 5 AgentRows
                ├── Vertical connector line — absolute left-[16px] top-3 bottom-3 w-px, background: linear-gradient(to bottom, transparent, var(--gray-300), transparent)
                ├── AgentRow #1 (Role)
                ├── AgentRow #2 (Flow)
                ├── AgentRow #3 (Entity)
                ├── AgentRow #4 (Page)
                └── AgentRow #5 (Navigation)
```

Outer container width: `7fr` ... actually left pane is `5fr` of the grid; right pane is `7fr`.

## Title block

```jsx
<div className="flex flex-col items-center text-center mb-8">
  <h1
    className="text-[24px] leading-[1.15] font-semibold bg-clip-text text-transparent tracking-tight"
    style={{
      backgroundImage: 'linear-gradient(265deg, var(--magenta-500), var(--purple-500))',
    }}
  >
    Your app is being crafted, layer by layer
  </h1>
  <p className="mt-3 text-[13px] text-gray-900 max-w-[440px] leading-relaxed">
    Our AI agents are collaborating in real time to bring your{' '}
    <span className="font-semibold">{appName}</span> app to life — defining roles,
    modeling data, and composing pages along the way.
  </p>
</div>
```

## Hero Sparkles icon

```jsx
<div className="flex justify-center mb-8">
  <Sparkles
    className="w-20 h-20"
    strokeWidth={1.25}
    style={{ color: 'var(--purple-500)' }}
  />
</div>
```

No container around the icon — sits free on the page wash.

## Timeline container

```jsx
<div
  className="rounded-xl p-[1.5px] w-full max-w-[400px] mx-auto"
  style={{
    background: 'linear-gradient(246.77deg, var(--purple-200) 0%, var(--magenta-200) 100%)',
  }}
>
  <div
    className="rounded-[10.5px] p-9"
    style={{ background: 'color-mix(in srgb, var(--white) 75%, transparent)' }}
  >
    <ol className="relative space-y-4">
      {/* Vertical connector line */}
      <div
        className="absolute left-[16px] top-3 bottom-3 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--gray-300), transparent)',
        }}
      />
      {AGENTS.map((agent, i) => (
        <AgentRow
          key={agent.id}
          agent={agent}
          state={stateFor(i, currentIdx)}
          phaseIdx={i === currentIdx ? phaseIdx : 0}
        />
      ))}
    </ol>
  </div>
</div>
```

## AgentRow — three states

```jsx
function AgentRow({ agent, state, phaseIdx }) {
  const showSuccess = state === 'done'
  return (
    <li
      className={cn(
        'relative flex items-start gap-3 py-1.5 transition-opacity duration-300',
        state === 'done' && 'opacity-90',
      )}
    >
      <div className="relative z-10 mt-0.5 flex-shrink-0">
        <AgentStatus state={state} color={agent.color} icon={agent.icon} />
      </div>
      <div className="flex-1 min-w-0 pt-px">
        {state === 'queued' ? (
          <div className="space-y-2.5 pt-1">
            <SkeletonBar width="60%" height="14px" shimmering />
            <SkeletonBar width="85%" height="10px" shimmering />
          </div>
        ) : showSuccess ? (
          <p className="text-[13px] leading-snug text-gray-600">
            <span className="font-semibold text-gray-900">{agent.name}</span>{' '}
            {agent.successPhrase}
            <CheckCheck
              className="inline-block ml-1.5 w-3.5 h-3.5 align-middle"
              strokeWidth={2.5}
              style={{ color: 'var(--green-500)' }}
            />
          </p>
        ) : (
          <p className="text-[13px] leading-snug">
            <span className="font-semibold text-gray-900">{agent.name}</span>{' '}
            <span
              className="text-shimmer"
              style={{
                backgroundImage: `linear-gradient(90deg, var(--gray-600) 0%, var(--gray-600) 35%, var(--${agent.color}-500) 50%, var(--gray-600) 65%, var(--gray-600) 100%)`,
              }}
            >
              {agent.phases[phaseIdx]}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                marginLeft: '6px',
                verticalAlign: 'middle',
              }}
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="dot-pulse"
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '9999px',
                    background: `var(--${agent.color}-500)`,
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </span>
          </p>
        )}
      </div>
    </li>
  )
}
```

## AgentStatus — avatar router (3 states, 2 components)

```jsx
function AgentStatus({ state, color, icon: Icon }) {
  if (state === 'active') {
    return <ActiveGradientShiftAvatar color={color} Icon={Icon} />
  }
  if (state === 'queued') {
    return (
      <div style={{ opacity: 0.35 }}>
        <StaticBoldAvatar color={color} Icon={Icon} />
      </div>
    )
  }
  return <StaticBoldAvatar color={color} Icon={Icon} />
}
```

### ActiveGradientShiftAvatar

32×32 squircle-octagon with a rotating linear gradient inside via SVG `<animateTransform>`:

- `<linearGradient gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">`
- 3 stops: `var(--{color}-300)` / `var(--{color}-600)` / `var(--{color}-300)`
- `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="4.5s" repeatCount="indefinite" />`
- Glyph: lucide icon `w-4 h-4`, `strokeWidth={2.25}`, `color: var(--white)`

### StaticBoldAvatar

32×32 with a static 2-stop gradient `var(--{color}-400) → var(--{color}-500)` and the same white glyph.

### Queued state

`StaticBoldAvatar` wrapped in `<div style={{ opacity: 0.35 }}>`.

## AGENTS array

5 agents in this order:

| Idx | id | name | color | Icon | sectionTitle |
|---|---|---|---|---|---|
| 0 | roles | Role creator agent | magenta | Users | Roles |
| 1 | flow | Flow creator agent | purple | Workflow | Flow |
| 2 | entity | Entity creator agent | blue | Database | Entities |
| 3 | page | Page creator agent | cyan | FileText (was LayoutGrid earlier) | Pages |
| 4 | navigation | Navigation creator agent | green | Compass | Navigation |

Each agent has 4 `phases: string[]` (rotating verb-phrases) and a `successPhrase` shown in the Done state with the `CheckCheck` icon.

### Phases per agent (rotating)

- **Role** — "is creating roles for your team" / "is drafting descriptions for each role" / "is mapping permissions to actions" / "is fine-tuning the role boundaries". Success: "successfully created the roles".
- **Flow** — "is plotting the approval flow" / "is mapping step-by-step transitions" / "is connecting the workflow stages" / "is finalizing the approval routing". Success: "successfully built the flow".
- **Entity** — "is modeling your data structure" / "is defining fields and their types" / "is mapping relationships between entities" / "is setting up validation rules". Success: "successfully modeled the entities".
- **Page** — "is composing the page layouts" / "is assembling forms and dashboards" / "is wiring up the detail views" / "is polishing the layout and spacing". Success: "successfully composed the pages".
- **Navigation** — "is laying out the menu structure" / "is wiring routes between every page" / "is organizing the sidebar items" / "is configuring the navigation paths". Success: "successfully built the navigation".

## Timing model

```ts
const PHASE_DURATION = 4_000  // 4s per phase
const PHASES_PER_AGENT = 4    // 4 rotating phases per agent
// 5 agents × 4 ticks × 4s = 80s total

// Single counter advanced every PHASE_DURATION:
const [tickCount, setTickCount] = useState(0)

// Derived:
const currentIdx = Math.min(Math.floor(tickCount / PHASES_PER_AGENT), AGENTS.length)
const phaseIdx = tickCount % PHASES_PER_AGENT

// Freeze logic: stop ticking once next > AGENTS.length * PHASES_PER_AGENT
// (so all agents transition to 'done' and the last one shows its success line)
```

## Animations used (all in `InlineKeyframes`)

| Keyframe | Where on the left pane | Effect |
|---|---|---|
| `ai-fade-up` | (not currently used by left pane after refactor — only right pane) | 8px slide + opacity 0→1 |
| `text-shimmer-i` | Active row's rotating phrase | gradient highlight sweeps left to right, 4.5s linear infinite |
| `dot-pulse-i` | 3 dots at the end of the active phrase | opacity 0.25↔1 + scale 0.85↔1.1, 1.4s, staggered 0/200/400ms |
| `ai-pulse-ping` | Defined but **not currently used** by the active avatar (`gradient-shift` uses SVG animateTransform, not CSS) | scale 1→2.2 + opacity 1→0 |

The active avatar's gradient rotation is **SVG `<animateTransform>` (SMIL)**, not a CSS keyframe.

## How to recover

1. Restore the `LeftPane` JSX with:
   - Title block (h1 with 265° magenta→purple gradient + p with appName highlight)
   - Sparkles hero icon (80×80, var(--purple-500), strokeWidth 1.25, no container)
   - Timeline container (gradient ring + 75% white fill + p-9 + max-w-400)
   - ol with the connector div + AGENTS.map → AgentRow
2. Restore `AgentRow` with the three branches (queued skeleton bars / active shimmer phrase + dots / done success phrase + CheckCheck).
3. Restore `AgentStatus` router + `ActiveGradientShiftAvatar` + `StaticBoldAvatar`.
4. Verify timing constants (`PHASE_DURATION = 4_000`, `PHASES_PER_AGENT = 4`).
5. Confirm `InlineKeyframes` still defines `text-shimmer-i` and `dot-pulse-i`.
