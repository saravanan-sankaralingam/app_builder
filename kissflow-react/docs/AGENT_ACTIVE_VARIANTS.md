# Agent in-action variants (explored, archived)

> Archive of the five in-action avatar treatments we explored during design
> iteration on the **"Your app is being built"** screen
> (`components/new-app/AppCreatingView.tsx`). The final pick was **#3,
> `gradient-shift`** — that's the one wired into the production component
> today. The other four are kept here for revival, mixing, or layering with
> the chosen language.
>
> Each entry below is a self-contained recipe: keyframe (if any), variant
> component, and where it was applied during exploration. You can paste any
> of them back into `AppCreatingView.tsx` to bring it back.

## Quick comparison

| # | Variant | Agent slot during exploration | Effect | Duration |
|---|---|---|---|---|
| 1 | `pulse-halo` | Role (magenta) | Bold gradient avatar + same-shape halo pulses outward + fades behind it | 3.2s |
| 2 | `orbit-border` | Flow (purple) | Light `-100` fill + solid `-500` glyph + static gradient border + bright comet orbiting the perimeter | 3.5s |
| 3 | **`gradient-shift` (chosen)** | Entity (blue) | Bold gradient avatar whose fill gradient itself rotates 360°; colours appear to flow through the shape | 4.5s |
| 4 | `pulse-glow` | Page (cyan) | Bold gradient avatar + a coloured CSS drop-shadow breathing outward in a soft halo | 3s |
| 5 | `dashed-ring-spin` | Navigation (green) | Bold gradient avatar + a dashed gradient ring sitting outside (1.22× scale) rotating around it | 5s |

All variants share:

- 32×32 container
- The same squircle-octagon path `AVATAR_PATH_D` (imported from `/Downloads/shape_octogan.svg`)
- White centred glyph (`var(--white)`) at `w-4 h-4 strokeWidth={2.25}`, **except** `orbit-border` which uses a coloured `-500` glyph since the fill is light

## To revive a variant

1. Add its keyframe(s) to `InlineKeyframes` inside `AppCreatingView.tsx`.
2. Paste the variant component below `AgentStatus`.
3. Reintroduce the variant router in `AgentStatus`:
   ```ts
   if (state === 'active') {
     switch (variant) {
       case 'orbit-border': return <OrbitBorderAvatar ... />
       case 'pulse-halo':   return <PulseHaloAvatar    ... />
       // ...
     }
   }
   ```
4. Add a `variant` field on `Agent` and pick the variant per agent in `AGENTS`.

---

## 1 — `pulse-halo`

A duplicate squircle-octagon sits behind the bold gradient avatar, scales out to 2.2× and fades, then resets. Same-shape "ripple" radiating from the avatar.

**Keyframe + class (`InlineKeyframes`):**
```css
@keyframes ai-pulse-ping-i { 75%, 100% { transform: scale(2.2); opacity: 0; } }
.ai-pulse-ping { animation: ai-pulse-ping-i 3.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
```

**Component:**
```tsx
function PulseHaloAvatar({ state, color, Icon }: { state: AgentState; color: Agent['color']; Icon: LucideIcon }) {
  const gradId = `agent-grad-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      {state === 'active' && (
        <svg
          viewBox="0 0 198 198"
          className="absolute inset-0 w-full h-full ai-pulse-ping"
          aria-hidden="true"
          style={{ transformOrigin: 'center' }}
        >
          <path d={AVATAR_PATH_D} fill={`var(--${color}-400)`} />
        </svg>
      )}
      <svg viewBox="0 0 198 198" className="relative w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-500)`} />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}
```

---

## 2 — `orbit-border`

Replaces the avatar's full-color gradient with a **light** fill + **solid coloured glyph**. A static gradient border ring + a separate bright comet stroke orbit the perimeter via `stroke-dasharray` + animated `stroke-dashoffset`. Same technique as `AIScanningDialog`'s rounded-hex centrepiece.

**Keyframe (`InlineKeyframes`):**
```css
@keyframes orbit-stroke-i { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -100; } }
```

**Component:**
```tsx
function OrbitBorderAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  const borderGradId = `agent-orbit-border-${color}`
  const cometGradId = `agent-orbit-comet-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg
        viewBox="0 0 198 198"
        className="absolute inset-0 w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={borderGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-300)`} />
            <stop offset="100%" stopColor="var(--magenta-300)" />
          </linearGradient>
          <linearGradient id={cometGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--magenta-500)" />
            <stop offset="100%" stopColor={`var(--${color}-500)`} />
          </linearGradient>
        </defs>
        <path
          d={AVATAR_PATH_D}
          fill={`var(--${color}-100)`}
          stroke={`url(#${borderGradId})`}
          strokeWidth={8}
        />
        <path
          d={AVATAR_PATH_D}
          fill="none"
          pathLength={100}
          stroke={`url(#${cometGradId})`}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray="22 78"
          style={{ animation: 'orbit-stroke-i 3.5s linear infinite' }}
        />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: `var(--${color}-500)` }}
      />
    </div>
  )
}
```

---

## 3 — `gradient-shift` ★ chosen

The active avatar keeps the bold gradient look but the gradient **itself** rotates inside the shape via SVG `<animateTransform>` — colours appear to flow through the squircle perimeter. No global keyframe needed; the animation is declared inline in the SVG. Three stops (`-300 → -600 → -300`) give it a clear bright/dark cycle as it spins.

**No `InlineKeyframes` entry required.**

**Component (this is the one in production):**
```tsx
function GradientShiftAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  const gradId = `agent-shift-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg viewBox="0 0 198 198" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor={`var(--${color}-300)`} />
            <stop offset="50%" stopColor={`var(--${color}-600)`} />
            <stop offset="100%" stopColor={`var(--${color}-300)`} />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0.5 0.5"
              to="360 0.5 0.5"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}
```

---

## 4 — `pulse-glow`

Bold gradient avatar but the *container* gets a CSS `filter: drop-shadow()` that breathes outward in the agent's `-500` colour. The path itself is static; the glow around it pulses. Uses a CSS custom property (`--glow-color`) so one keyframe works for all five colour families.

**Keyframe (`InlineKeyframes`):**
```css
@keyframes glow-pulse-i {
  0%, 100% { filter: drop-shadow(0 0 3px var(--glow-color)); }
  50%      { filter: drop-shadow(0 0 10px var(--glow-color)) drop-shadow(0 0 16px var(--glow-color)); }
}
```

**Component:**
```tsx
function PulseGlowAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  const gradId = `agent-grad-${color}`
  return (
    <div
      className="relative w-[32px] h-[32px]"
      style={
        {
          ['--glow-color' as string]: `var(--${color}-500)`,
          animation: 'glow-pulse-i 3s ease-in-out infinite',
        } as React.CSSProperties
      }
    >
      <svg viewBox="0 0 198 198" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-500)`} />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}
```

---

## 5 — `dashed-ring-spin`

A second SVG with the squircle-octagon path stroked dashedly sits **outside** the main avatar (scaled to 1.22× via SVG transform with translate-99/scale/translate-back). The whole wrapper SVG rotates via the `spin-slow-i` keyframe, so the dashes appear to march around the perimeter.

**Keyframe (`InlineKeyframes`):**
```css
@keyframes spin-slow-i { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
```

**Component:**
```tsx
function DashedRingSpinAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  const gradId = `agent-grad-${color}`
  const ringGradId = `agent-ring-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg
        viewBox="0 0 198 198"
        className="absolute inset-0 w-full h-full overflow-visible"
        style={{
          animation: 'spin-slow-i 5s linear infinite',
          transformOrigin: 'center',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-600)`} />
          </linearGradient>
        </defs>
        <path
          d={AVATAR_PATH_D}
          fill="none"
          stroke={`url(#${ringGradId})`}
          strokeWidth={10}
          strokeDasharray="14 12"
          transform="translate(99 99) scale(1.22) translate(-99 -99)"
        />
      </svg>
      <svg viewBox="0 0 198 198" className="relative w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-500)`} />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`url(#${gradId})`} />
      </svg>
      <Icon
        className="absolute inset-0 m-auto w-4 h-4"
        strokeWidth={2.25}
        style={{ color: 'var(--white)' }}
      />
    </div>
  )
}
```

---

---

## Queued-state explorations (archived)

A separate exploration pass for the **queued** avatar treatment ran four swatches in parallel, one per queued agent slot, while the active row used `gradient-shift`. The chosen winner was **#4 `faded-bold`**.

| # | Variant | Agent slot | Effect |
|---|---|---|---|
| 1 | `color-shimmer` | Flow (purple) | Light `var(--purple-100)` fill + `var(--purple-400)` glyph + a horizontal white band sweeping diagonally via SVG `<animateTransform translate>` (1.8s) |
| 2 | `full-skeleton` | Entity (blue) | Neutral grey squircle (`rgba(34, 42, 59, 0.08)`) + the same white-band shimmer, **no glyph**. Strictest match with the right-pane `SectionSkeleton`. |
| 3 | `muted-static` | Page (cyan) | Solid `var(--cyan-100)` fill + `var(--cyan-400)` glyph. **No animation.** |
| 4 | **`faded-bold` ★ chosen** | Navigation (green) | The bold static `-400 → -500` gradient avatar (same as `StaticBoldAvatar`) wrapped in `<div style={{ opacity: 0.35 }}>`. Identical to the active/done treatment, just dimmed. |

### Why `faded-bold` won

- Cheapest implementation (just an opacity wrapper around the existing `StaticBoldAvatar`)
- Keeps each agent's identity (colour + icon) visible while clearly demoting it relative to the active row
- Doesn't compete with the active row's motion — queued rows are visually quiet
- The agent's name + description above it carry the loading-shimmer language; the avatar doesn't need to also shimmer to communicate "queued"

### Recipes for the unused queued variants

**`color-shimmer` (purple slot in the swatch):**
```tsx
function QueuedColorShimmerAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  const shimmerId = `agent-q-shimmer-${color}`
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg viewBox="0 0 198 198" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={shimmerId} gradientUnits="userSpaceOnUse" x1="0" y1="99" x2="100" y2="99">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.65" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
            <animateTransform attributeName="gradientTransform" type="translate" from="-100 0" to="300 0" dur="1.8s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        <path d={AVATAR_PATH_D} fill={`var(--${color}-100)`} />
        <path d={AVATAR_PATH_D} fill={`url(#${shimmerId})`} />
      </svg>
      <Icon className="absolute inset-0 m-auto w-4 h-4" strokeWidth={2.25} style={{ color: `var(--${color}-400)` }} />
    </div>
  )
}
```

**`full-skeleton` (blue slot in the swatch):** same SVG markup, but the colored fill becomes `fill="rgba(34, 42, 59, 0.08)"` and the `<Icon>` is omitted.

**`muted-static` (cyan slot in the swatch):**
```tsx
function QueuedMutedStaticAvatar({ color, Icon }: { color: Agent['color']; Icon: LucideIcon }) {
  return (
    <div className="relative w-[32px] h-[32px]">
      <svg viewBox="0 0 198 198" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d={AVATAR_PATH_D} fill={`var(--${color}-100)`} />
      </svg>
      <Icon className="absolute inset-0 m-auto w-4 h-4" strokeWidth={2.25} style={{ color: `var(--${color}-400)` }} />
    </div>
  )
}
```

To revive any of these, paste the component into `AppCreatingView.tsx` and replace the queued branch in `AgentStatus`:
```ts
if (state === 'queued') return <QueuedColorShimmerAvatar color={color} Icon={Icon} />
```

---

## Related files

- `kissflow-react/components/new-app/AppCreatingView.tsx` — the production component (currently uses **#3 gradient-shift** for the active state and **#4 faded-bold** for the queued state)
- `kissflow-react/docs/PLATFORM_NEW_APP.md` — overall spec for the `/new/app` flow
