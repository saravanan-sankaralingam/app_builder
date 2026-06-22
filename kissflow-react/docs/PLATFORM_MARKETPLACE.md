# Platform — Marketplace

> ⚠️ **Current state: visual placeholder only.** Like Home and My Items,
> this page is the shape and look — not the real thing. The hero is
> static, the 9 apps are hardcoded mock data, every "Install" / "Enquire"
> button is a stub, and the per-card preview thumbnails are stylized SVG
> mockups, not real screenshots. A proper implementation (real catalog
> queries, real install / enquire flows, real screenshots, search,
> categories, app detail page) is planned as a follow-up.

The Marketplace is the Platform's app store — where users discover
pre-built apps published by Kissflow (and eventually third parties) and
either install them into their account or enquire about paid offerings.

Route: `/store` → `app/(main)/store/page.tsx`. Left nav selection:
**Marketplace** (`topItems[2]` in `Sidebar.tsx`). The `/store` URL is the
existing path the left nav points at — we kept it instead of renaming to
`/marketplace` to avoid touching the shell spec.

## Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ │  ··· (dots)                                                  [figure]   │   │
│ │                                                                          │   │
│ │            Complete solutions, empowered business                         │   │
│ │     Find end-to-end applications that cater to your business …            │   │
│ │                                                                          │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ All apps (9)                                                                 │
│                                                                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                                    │
│ │ [thumb]  │  │ [thumb]  │  │ [thumb]  │                                    │
│ │ ▣ Name   │  │ ▣ Name   │  │ ▣ Name   │   ← icon · title · publisher       │
│ │ Kissflow │  │ Kissflow │  │ Kissflow │                                    │
│ │ desc …   │  │ desc …   │  │ desc …   │   ← 2-line clamp                   │
│ │ Paid [Enquire] │ Free [⤓ Install]   │ … │                                  │
│ └──────────┘  └──────────┘  └──────────┘                                    │
│ (repeat — 3 columns at lg+, 2 at sm, 1 below)                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Page background: `bg-gray-50` (matches Home / My Items).
- Page wrapper: `min-h-full p-6` — single column, no card surface around the page itself.
- Hero card uses a soft blue→indigo→purple gradient (`from-blue-50 via-indigo-50 to-purple-50`); spans the full page width.
- Grid: **always 3 columns, each card a fixed 300px wide.** Implemented as `grid-cols-[repeat(3,300px)] gap-4`, wrapped in `mx-auto w-fit` so the 3-card row (~932px including gaps) stays centered on the page regardless of viewport width.

## Hero banner

`components/marketplace/MarketplaceHero.tsx` — single card with:
- **Decorative dot grid** on the top-left (5×8 dots, `text-blue-200/80`).
- **Abstract figure** on the top-right — a small "person + screen" SVG stand-in (`text-indigo-200/80`). Replace with the polished illustration when the asset exists.
- **Centered text block** (`mx-auto max-w-2xl text-center`):
  - Title: `text-xl font-semibold text-gray-900` — *"Complete solutions, empowered business"*
  - Subtitle: `mt-2 text-sm text-gray-600` — *"Find end-to-end applications that cater to your business needs in the Kissflow App Store."*
- Rounded `rounded-xl border border-gray-200`. Padding `px-6 py-10` to keep the band tall but not heavy.

## App card

`components/marketplace/AppCard.tsx`. Single tile in the grid. Top-to-bottom order:

1. **Thumbnail** — `AppThumbnail` renders an aspect-`16/9` stylized SVG dashboard mock keyed by `app.thumbnail` (see below).
2. **Header row** — icon tile (`h-9 w-9 rounded-md` with `app.iconBg` + lucide icon in `text-white`) · app name (`text-sm font-semibold text-gray-900 truncate`) · publisher (`text-xs text-gray-500`).
3. **Description** — `text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]`. The `min-h` keeps cards aligned when one description is shorter than another.
4. **Footer row** — pricing label (`Free` / `Paid`, `text-xs font-medium text-gray-700`) on the left; action button on the right.

### Action button rules

- **Free apps** → `Install` button with a small `Download` icon.
- **Paid apps** → `Enquire` button, no icon.
- Both use `<Button size="sm" variant="outline">` with `h-7 px-3 text-xs gap-1.5 border-gray-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50`. Outline-style on a white card so the button is restrained, not loud.
- `onClick` is currently a `/* TODO: wire Install / Enquire action */` stub.

### Card surface + hover

Same outer treatment as the My Items cards:
```
bg-white rounded-xl border border-gray-200 p-4
  hover:border-gray-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.03)]
  transition-all
```

Soft shadow (`0 2px 6px rgba(0,0,0,0.03)`) so cards feel liftable without stealing focus from the thumbnail.

## Thumbnails

`components/marketplace/AppThumbnail.tsx` renders one of four pre-baked SVG mocks, picked via `app.thumbnail` and tinted by `app.thumbnailAccent`:

| `thumbnail` | Visual |
|---|---|
| `table` | List of rows with a colored chip + status pill — used for tracker-style apps (Applicant Tracking, Bug Tracking, Contract, Onboarding, Expense). |
| `pie-bars` | Donut chart on the left + 5 vertical bars on the right — used for analytics-style apps (Backlog Tracker / ROI). |
| `rings` | Three radial-progress rings — used for "scorecard" apps (ESG Management). |
| `bars-dashboard` | 3 KPI tiles up top + a bar chart below — used for ops dashboards (Employee Management, IT Asset Management). |

All four use a 16:9 `viewBox="0 0 160 90"` so they scale cleanly into whatever pixel size the parent gives. The `ACCENTS` map in the same file translates a tailwind color name (`red`, `blue`, `purple`, `emerald`, `amber`, `pink`, `orange`, `cyan`, `indigo`) into matched `{ strong, soft }` hex pairs. **These are decorative only** — they don't represent the actual app UI.

To add a new thumbnail style: add a case to `ThumbnailKind`, implement a new component in `AppThumbnail.tsx`, and reference it from one or more apps in `lib/mock/marketplace.ts`.

## Mock data

`lib/mock/marketplace.ts` exports `marketplaceApps: MarketplaceApp[]` — 20 apps lifted from the reference screenshots:

| # | Name | Pricing | Action |
|---|---|---|---|
| 1 | Applicant Tracking System | Paid | Enquire |
| 2 | Backlog Tracker and ROI Calculator | Free | Install |
| 3 | Bug Tracking System | Free | Install |
| 4 | Contract Management | Paid | Enquire |
| 5 | ESG Management | Paid | Enquire |
| 6 | Employee Management | Free | Install |
| 7 | Employee Onboarding App | Paid | Enquire |
| 8 | Expense and Travel Management | Paid | Enquire |
| 9 | IT Asset Management System | Paid | Enquire |
| 10 | Inpatient Experience Management | Paid | Enquire |
| 11 | Inventory Management | Paid | Enquire |
| 12 | Leave Management | Paid | Enquire |
| 13 | OKR | Paid | Enquire |
| 14 | Offline Forms | Paid | Enquire |
| 15 | Performance Management System | Paid | Enquire |
| 16 | Procure-to-Pay | Paid | Enquire |
| 17 | Professional Services Executive Dashboard | Free | Install |
| 18 | Retail Store Management | Paid | Enquire |
| 19 | Sourcing | Paid | Enquire |
| 20 | Supplier Management | Paid | Enquire |

`totalAppCount` is exported separately (currently equal to `marketplaceApps.length`) and powers the `All apps (N)` header — when pagination eventually arrives, the count can diverge from the rendered array.

## Conventions

- Page component (`app/(main)/store/page.tsx`) stays **thin** — it composes the hero + grid; everything else lives in `components/marketplace/`.
- Marketplace is in the **Platform** half of the codebase — must not import from `components/builder/`.
- Selection in the left nav: **Marketplace** is marked active when `pathname === '/store'` (the route hasn't been renamed).
- Action labels (`Install` vs `Enquire`) are driven purely by `pricing` — no override.

## What's intentionally NOT implemented yet

- **Real catalog** — `marketplaceApps` is a static array. No API, no auth, no filtering by tenant entitlements.
- **Install / Enquire flows** — buttons render but `onClick` is a stub. No installation pipeline, no enquiry form, no toast / confirmation.
- **App detail page** — clicking a card does nothing; there's no `/store/[appId]` route yet.
- **Search** — the top-nav search is shared across the Platform; it does nothing here.
- **Categories / filters** — the screenshot doesn't show them, and we chose to match it exactly. A category sidebar (HR / Finance / IT / Sales / …) is the most likely follow-up.
- **Pagination / lazy loading** — all 9 apps render at once. Long lists will spill the viewport.
- **Narrow-viewport behavior** — the grid is locked to 3 fixed-width 300px cards (~932px wide). Below that width the row will overflow horizontally rather than reflow. A responsive treatment is the next change once the desktop layout is finalised.
- **Real preview screenshots** — every thumbnail is one of four stylized SVG mocks. Replace per-app with real images when published.
- **Publisher diversity** — every app says "Kissflow". A real catalog will mix first-party + third-party publishers.
- **Pricing detail** — `Free` / `Paid` is binary; no tiers, no $ amounts, no trials.
- **Loading / error / empty states** — none designed.
- **Sort / "Recently added" / "Popular" sections** — only `All apps`. The screenshot doesn't show any other section, but a real store usually has them.
- **No tests** — none.
- **Mobile / responsiveness** — the grid steps down to 2 / 1 columns and the hero stays centered, but nothing is mobile-tuned beyond that.

## Where this is implemented

- `app/(main)/store/page.tsx` — the route, composes the hero + grid.
- `components/marketplace/MarketplaceHero.tsx` — hero banner with dots + figure.
- `components/marketplace/AllAppsGrid.tsx` — section heading + responsive grid wrapper.
- `components/marketplace/AppCard.tsx` — single app tile (thumbnail + icon + description + footer button).
- `components/marketplace/AppThumbnail.tsx` — 4 stylized SVG dashboard mocks + accent color map.
- `lib/mock/marketplace.ts` — `marketplaceApps`, `MarketplaceApp` / `ThumbnailKind` / `Pricing` types, `totalAppCount`.
