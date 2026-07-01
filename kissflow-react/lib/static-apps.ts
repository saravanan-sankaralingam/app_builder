import type { App } from './api/apps'

/**
 * Prototype-only static apps. Use when an app should render in the Builder
 * without a real backend record (e.g. UX prototypes wired up as frontend-only
 * pages under `app/(main)/app/<slug>/`).
 *
 * The Builder page consults this registry BEFORE calling `getApp(id)` — if a
 * matching id is found, the backend call is skipped and the App shape is
 * served from here. Renames and other backend-bound writes are short-circuited
 * to local state only.
 */
const SYSTEM_USER = {
  id: 'system',
  name: 'System',
  email: 'system@kissflow.com',
}

const FROZEN_TS = '2026-06-30T00:00:00.000Z'

export const staticApps: Record<string, App> = {
  'retail-one': {
    id: 'retail-one',
    name: 'Retail One',
    slug: 'retail-one',
    description: 'Comprehensive retail management application',
    icon: 'ShoppingBag',
    iconBg: '#DBEAFE',
    type: 'app',
    status: 'live',
    isPublic: false,
    version: 1,
    createdById: SYSTEM_USER.id,
    createdAt: FROZEN_TS,
    updatedById: SYSTEM_USER.id,
    updatedAt: FROZEN_TS,
    createdBy: SYSTEM_USER,
    updatedBy: SYSTEM_USER,
  },
  'inventory-management': {
    id: 'inventory-management',
    name: 'Inventory Management',
    slug: 'inventory-management',
    description: 'Track stock levels, movements, and replenishment across warehouses',
    icon: 'Boxes',
    iconBg: '#FFF4ED',
    type: 'app',
    status: 'live',
    isPublic: false,
    version: 1,
    createdById: SYSTEM_USER.id,
    createdAt: FROZEN_TS,
    updatedById: SYSTEM_USER.id,
    updatedAt: FROZEN_TS,
    createdBy: SYSTEM_USER,
    updatedBy: SYSTEM_USER,
  },
  'expense-management': {
    id: 'expense-management',
    name: 'Expense Management',
    slug: 'expense-management',
    description: 'Submit, approve, and track employee expense claims and reimbursements',
    icon: 'Receipt',
    iconBg: '#F7F2FF',
    type: 'app',
    status: 'live',
    isPublic: false,
    version: 1,
    createdById: SYSTEM_USER.id,
    createdAt: FROZEN_TS,
    updatedById: SYSTEM_USER.id,
    updatedAt: FROZEN_TS,
    createdBy: SYSTEM_USER,
    updatedBy: SYSTEM_USER,
  },
}

export function getStaticApp(id: string): App | null {
  return staticApps[id] ?? null
}

export function isStaticAppId(id: string): boolean {
  return id in staticApps
}
