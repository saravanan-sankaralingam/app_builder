import { getAppSpec } from '@/lib/app-specs'

// Roles for apps that don't have an entry in lib/app-specs.ts yet.
const FALLBACK_ROLES: Record<string, string[]> = {
  'vendor-onboarding-and-management': [
    'Vendor Manager',
    'Requester',
    'Finance Approver',
    'Administrator',
  ],
}

/**
 * Resolves the role list for an app: spec-defined roles first, then a fallback
 * map for apps without a spec entry, then a generic default. Shared by the
 * Play-mode role switcher (`AppNavRoleSwitcher`) and the preview wrapper that
 * owns the selected-role state (`PlatformAppPreview`).
 */
export function resolveAppRoles(appId?: string): string[] {
  const specRoles = appId ? getAppSpec(appId)?.roles.map((r) => r.name) : undefined
  if (specRoles && specRoles.length > 0) return specRoles
  if (appId && FALLBACK_ROLES[appId]) return FALLBACK_ROLES[appId]
  return ['Administrator']
}
