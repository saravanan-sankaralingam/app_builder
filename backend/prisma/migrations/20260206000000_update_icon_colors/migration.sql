-- Update existing app icon colors from light (100/200) shades to solid Tailwind 500 colors
-- This migration maps light background colors to their corresponding 500 shade equivalents

-- Blue: light (#dbeafe, #bfdbfe, #93c5fd) -> solid (#3b82f6)
UPDATE "apps" SET "icon_bg" = '#3b82f6' WHERE "icon_bg" IN ('#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa');

-- Green: light (#dcfce7, #bbf7d0, #86efac) -> solid (#22c55e)
UPDATE "apps" SET "icon_bg" = '#22c55e' WHERE "icon_bg" IN ('#dcfce7', '#bbf7d0', '#86efac', '#4ade80');

-- Amber: light (#fef3c7, #fde68a, #fcd34d) -> solid (#f59e0b)
UPDATE "apps" SET "icon_bg" = '#f59e0b' WHERE "icon_bg" IN ('#fef3c7', '#fde68a', '#fcd34d', '#fbbf24');

-- Red: light (#fee2e2, #fecaca, #fca5a5) -> solid (#ef4444)
UPDATE "apps" SET "icon_bg" = '#ef4444' WHERE "icon_bg" IN ('#fee2e2', '#fecaca', '#fca5a5', '#f87171');

-- Purple: light (#f3e8ff, #e9d5ff, #d8b4fe) -> solid (#a855f7)
UPDATE "apps" SET "icon_bg" = '#a855f7' WHERE "icon_bg" IN ('#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc');

-- Pink: light (#fce7f3, #fbcfe8, #f9a8d4) -> solid (#ec4899)
UPDATE "apps" SET "icon_bg" = '#ec4899' WHERE "icon_bg" IN ('#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6');

-- Cyan: light (#cffafe, #a5f3fc, #67e8f9) -> solid (#06b6d4)
UPDATE "apps" SET "icon_bg" = '#06b6d4' WHERE "icon_bg" IN ('#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee');

-- Orange: light (#ffedd5, #fed7aa, #fdba74) -> solid (#f97316)
UPDATE "apps" SET "icon_bg" = '#f97316' WHERE "icon_bg" IN ('#ffedd5', '#fed7aa', '#fdba74', '#fb923c');

-- Update default column value
ALTER TABLE "apps" ALTER COLUMN "icon_bg" SET DEFAULT '#3b82f6';
