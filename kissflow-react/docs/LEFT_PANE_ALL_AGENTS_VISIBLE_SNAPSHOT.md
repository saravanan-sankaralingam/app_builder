# Left pane — "all 5 agents always visible" behaviour snapshot

Snapshot of how the left pane's agent timeline renders **before** switching to the progressive "only show agents that have started" model. Restore from here if we want to bring back the always-on full roster.

## Behaviour

All 5 agents (Role / Flow / Entity / Page / Navigation) render in the timeline container from the moment the screen mounts. Their state changes over the 80-second sequence — but every row stays mounted the whole time.

| State | Visual |
|---|---|
| **Queued** (agent hasn't started yet) | Hexagon avatar in its full bold gradient + two stacked skeleton bars in the content column — 60% × 14px (name) and 85% × 10px (description), separated by `space-y-2.5 pt-1`. |
| **Active** | Hexagon avatar with gradient-shift rotating fill + checklist box: title `{Agent name} working on it ●●●` + a `var(--gray-50)` rectangular box below containing 4 phase rows. Each row: `Check` (past) / `Loader2 animate-spin` (current) / `Circle` outline (future). |
| **Done** | Hexagon avatar in bold static gradient + line: `{Agent name} has completed generating {section} ✓✓`. |

## Where this is implemented

`components/new-app/AppCreatingView.tsx` → `LeftPane`:

```jsx
<ol className="relative space-y-4">
  {/* Vertical connector line */}
  <div className="absolute left-[16px] top-3 bottom-3 w-px" style={...} />
  {AGENTS.map((agent, i) => (
    <AgentRow
      key={agent.id}
      agent={agent}
      state={stateFor(i, currentIdx)}
      phaseIdx={i === currentIdx ? phaseIdx : 0}
    />
  ))}
</ol>
```

Every agent gets an `<AgentRow>`. The queued branch inside `AgentRow` renders skeleton bars; the active branch renders the checklist box; the done branch renders the success line.

## Container dimensions

The outer timeline container (`rounded-xl p-[1.5px]` with `max-w-[400px] mx-auto`) wraps an inner div with `rounded-[10.5px] p-9` and `background: color-mix(in srgb, var(--white) 90%, transparent)`. The inner `<ol>` uses `space-y-4` between agents.

Because all 5 rows always render, the container's height is constant (~5 rows + 4×16px gaps + 72px padding). Queued rows occupy the same vertical space as active/done rows — no growth as the sequence progresses.

## How to recover this behaviour

If we want the always-on roster back:
1. In `LeftPane`'s map over `AGENTS`, remove the queued filter (don't `return null` for queued rows).
2. Keep the queued skeleton bar rendering in `AgentRow` (still present in code — just unused after the progressive change).
3. The connector line and `space-y-4` rhythm stay as they are.
