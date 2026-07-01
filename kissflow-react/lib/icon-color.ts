/**
 * Map an app's `iconBg` (the light tint stored on the App model) to the
 * brand `-500` shade used when the icon is rendered without its
 * background — e.g. in the in-app header, the BuilderTopBar, and the
 * Play-mode AppRuntimePreview after removing the colored tile.
 *
 * Source of truth is `app/globals.css` — see also `docs/COLORS.md`.
 *
 * Includes legacy mappings for Tailwind-default hex values still living
 * in older static app entries (e.g. Retail One's iconBg `#DBEAFE`).
 */
const ICON_BG_TO_ICON_COLOR: Record<string, string> = {
  // Brand -100 → -500
  '#F2F7FF': '#0565FF', // blue
  '#F2FAF4': '#009E4F', // green
  '#FFF2F7': '#DE1F8E', // magenta
  '#FFFAF0': '#F0B100', // yellow
  '#FFF3F0': '#E52C29', // red
  '#FFF4ED': '#FA6814', // orange
  '#F7F2FF': '#6D2BF0', // purple
  '#EFF4F4': '#008A8A', // cyan
  '#F0F4FA': '#0086C9', // skyblue
  '#FFF2F2': '#E31B54', // pink
  '#FCF2ED': '#B94E15', // rust

  // Legacy Tailwind-default iconBg values still present in static-app entries
  '#DBEAFE': '#0565FF', // Tailwind blue-100 → brand blue-500 (Retail One)
}

/**
 * Returns the icon color for a given `iconBg`. Lookup is case-insensitive on
 * the hex. Falls back to the input itself if no mapping is found (so callers
 * don't get a missing color — they just keep today's behaviour).
 */
export function iconColorFromBg(iconBg: string): string {
  const normalized = iconBg.trim().toUpperCase()
  return ICON_BG_TO_ICON_COLOR[normalized] ?? iconBg
}
