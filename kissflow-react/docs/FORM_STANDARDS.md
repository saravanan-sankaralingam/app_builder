# Form-Field Standards

App-wide convention for form fields (labels + inputs + selects + textareas). These rules are baked into the base `components/ui/*` primitives so call sites don't need to repeat them.

## The rhythm

| Element | Size | Color | Weight | Spacing |
|---|---|---|---|---|
| **Label** | 12px (`text-xs`) | `text-gray-700` | `font-medium` | `mb-2` (8px below) |
| **Value text** (Input / Textarea / Select) | 14px (`text-sm`) | `text-gray-900` | `font-normal` | — |

That's it. Together they create the label-over-field rhythm used everywhere from the new-app create flow to the Builder property panels.

## Where the rules live (single source of truth)

| Rule | File · Line |
|---|---|
| Label | `kissflow-react/components/ui/label.tsx:11` — `labelVariants` |
| Input value | `kissflow-react/components/ui/input.tsx:13` |
| Textarea value | `kissflow-react/components/ui/textarea.tsx:13` |
| Select value (trigger + SelectValue) | `kissflow-react/components/ui/select.tsx:25, 42` |

Updating any of those four lines updates the whole app — that's the whole point.

## Conventions for callers

**Do** import and use `<Label>`, `<Input>`, `<Textarea>`, `<Select>` from `@/components/ui/*` and pass *only* the props the component needs (`value`, `onChange`, `placeholder`, `htmlFor`, etc.).

**Don't** add these on a call site — they're already in the base:
- ❌ `<Label className="text-sm text-gray-600 mb-1">` — the old pre-standard pattern
- ❌ `<Input className="text-xs font-medium text-gray-900">` — fights the new default
- ❌ `<SelectTrigger className="text-xs">` — would render at 12px instead of the 14px standard

**Layout overrides are fine** — `<Label className="mb-4">` for a one-off larger gap, or `<SelectTrigger className="w-56">` for a fixed width. The rule is: don't re-state the typography/colour standard at the call site.

## Intentional exceptions

A handful of places legitimately deviate. **Don't sweep these without a design decision.**

| Surface | Class | Why |
|---|---|---|
| Icon-picker section headers in `AppReviewDialog`, `AppNameForm`, `AppSuggestionDialog` | `text-xs text-gray-500 uppercase tracking-wide` | These aren't form-field labels — they're sub-section captions ("Choose icon", "Choose color"). The Label component is used for accessibility, not its typography. |
| Emphasised labels in `analyzing/AppSuggestionDialog.tsx` | `text-[12px] font-semibold text-gray-900` | Used as a heavier label variant on the dialog — intentional design choice. If we add a `variant="emphasis"` to the Label component later, these should be migrated. |

If a future field genuinely needs different typography, prefer **promoting it into a Label variant** over an ad-hoc className override. That keeps the rules discoverable in one place.

## Audit (2026-06-23 sweep)

The standard was established on 2026-06-23. As part of the rollout, 21 call sites were swept clean of redundant overrides:

- 15 Builder + Create dialogs (Label sweep — stripped `text-sm text-gray-600` etc.)
- 6 trigger / mb overrides (SelectTrigger `text-xs`, Label `mb-1`/`mb-1.5`, ExplorerToolbar's redundant `text-sm text-gray-900`)

The remaining call-site classnames in those files are **layout-only** (`w-full`, `mb-4`, `pr-6`, etc.) — none of them re-state typography or colour.

## Related

- [`COLORS.md`](COLORS.md) — colour tokens (`--gray-700`, `--gray-900` etc.)
- Memory: `[[form-label-standard]]`, `[[form-field-value-standard]]`, `[[design-tokens-first]]` (project memory — informs the assistant)
