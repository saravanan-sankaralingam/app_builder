'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Bot, FileText, Database, Zap, Palette, Shield, Cable, Sparkles, ChevronLeft, ChevronRight, Check, PartyPopper, Users, LayoutGrid, ArrowLeft, ArrowRight, CheckCircle, UserKey, Layout, Plug } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { IconCircleCheckFilled } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopilotPanelProps {
  appName: string
  appDescription?: string
  appIcon: string
  appIconBg: string
}

interface SubAction {
  id: string
  title: string
}

interface PermissionOption {
  id: string
  title: string
  description: string
}

interface SuggestedRole {
  id: string
  name: string
  description: string
  selected: boolean
}

// Mock suggested roles from AI scan
const MOCK_SUGGESTED_ROLES: SuggestedRole[] = [
  { id: 'admin', name: 'Admin', description: 'Full access to all features and settings', selected: false },
  { id: 'manager', name: 'Manager', description: 'Can approve requests and manage team members', selected: false },
  { id: 'employee', name: 'Employee', description: 'Can submit requests and view own data', selected: false },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to reports and dashboards', selected: false },
]

const PERMISSION_OPTIONS: PermissionOption[] = [
  { id: 'all', title: 'All Permissions', description: 'Grant full access to all features' },
  { id: 'duplicate', title: 'Duplicate from existing role', description: 'Copy permissions from another role' },
  { id: 'none', title: 'No Permissions', description: 'Start with no access, add later' },
  { id: 'custom', title: 'Custom Permissions', description: 'Configure specific permissions' },
]

// Mock existing roles for duplicate permission flow
const EXISTING_ROLES = [
  { id: 'admin', name: 'Admin', description: 'Full access to all features and settings' },
  { id: 'manager', name: 'Manager', description: 'Can approve requests and manage team members' },
  { id: 'employee', name: 'Employee', description: 'Can submit requests and view own data' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to reports and dashboards' },
  { id: 'hr-manager', name: 'HR Manager', description: 'Manages employee records and leave approvals' },
  { id: 'finance-lead', name: 'Finance Lead', description: 'Handles expense approvals and invoices' },
  { id: 'project-lead', name: 'Project Lead', description: 'Manages projects and assigns tasks' },
  { id: 'auditor', name: 'Auditor', description: 'Reviews and audits all transactions' },
]

// Role context actions (shown after selecting a role from View all roles)
const ROLE_CONTEXT_ACTIONS = [
  { id: 'modify-role', title: 'Modify' },
  { id: 'show-permissions', title: 'Show permissions' },
  { id: 'duplicate-from-view', title: 'Duplicate role' },
]

// Modification options for roles
interface ModificationOption {
  id: string
  title: string
  description: string
}

const MODIFICATION_OPTIONS: ModificationOption[] = [
  { id: 'change-name', title: 'Change name', description: 'Rename this role' },
  { id: 'modify-permissions', title: 'Modify permissions', description: 'Update access rights and capabilities' },
]

// Permission change options (shown as chips)
const PERMISSION_CHANGE_OPTIONS = [
  { id: 'full-access', title: 'Give full access' },
  { id: 'remove-access', title: 'Remove all access' },
  { id: 'custom', title: 'Custom' },
]

// Data entity permission options (shown when clicking a data entity)
// Process entities only have reports, dataform and board have views and reports
const getDataEntityOptions = (entityType: 'dataform' | 'board' | 'process') => {
  const baseOptions = [
    { id: 'modify-permission', title: 'Modify permission', description: 'Change access level for this entity' },
  ]

  if (entityType === 'process') {
    // Process only has reports
    return [
      ...baseOptions,
      { id: 'reports-permission', title: 'Reports permission', description: 'Control report generation access' },
    ]
  }

  // DataForm and Board have both views and reports
  return [
    ...baseOptions,
    { id: 'views-permission', title: 'Views permission', description: 'Manage view access and visibility' },
    { id: 'reports-permission', title: 'Reports permission', description: 'Control report generation access' },
  ]
}

// Permission level chips (shown when modifying entity permission)
const PERMISSION_LEVEL_CHIPS: { id: PermissionLevel; title: string }[] = [
  { id: 'no-permission', title: 'No Access' },
  { id: 'read-only', title: 'Read Only' },
  { id: 'initiate', title: 'Initiate' },
  { id: 'edit', title: 'Edit' },
  { id: 'manage', title: 'Manage' },
]

// Permission levels for data entities
type PermissionLevel = 'no-permission' | 'read-only' | 'initiate' | 'edit' | 'manage'

// Mock data entities for the app
const MOCK_DATA_ENTITIES = [
  { id: 'expense-report', name: 'Expense Report', type: 'process' as const },
  { id: 'leave-request', name: 'Leave Request', type: 'board' as const },
  { id: 'employee-directory', name: 'Employee Directory', type: 'dataform' as const },
  { id: 'project-tracker', name: 'Project Tracker', type: 'board' as const },
  { id: 'invoice-approval', name: 'Invoice Approval', type: 'process' as const },
  { id: 'vendor-onboarding', name: 'Vendor Onboarding', type: 'process' as const },
  { id: 'asset-inventory', name: 'Asset Inventory', type: 'dataform' as const },
  { id: 'purchase-order', name: 'Purchase Order', type: 'process' as const },
  { id: 'timesheet', name: 'Timesheet', type: 'board' as const },
  { id: 'training-requests', name: 'Training Requests', type: 'board' as const },
  { id: 'customer-feedback', name: 'Customer Feedback', type: 'dataform' as const },
  { id: 'travel-request', name: 'Travel Request', type: 'process' as const },
]

// Mock views for entities (dataform and board only)
type ViewType = 'table' | 'kanban' | 'gallery' | 'calendar'
const MOCK_ENTITY_VIEWS: Record<string, Array<{ id: string; name: string; type: ViewType; permission: PermissionLevel }>> = {
  'leave-request': [
    { id: 'leave-table', name: 'All Requests', type: 'table', permission: 'read-only' },
    { id: 'leave-kanban', name: 'By Status', type: 'kanban', permission: 'edit' },
    { id: 'leave-calendar', name: 'Calendar View', type: 'calendar', permission: 'read-only' },
  ],
  'employee-directory': [
    { id: 'emp-table', name: 'Employee List', type: 'table', permission: 'manage' },
    { id: 'emp-gallery', name: 'Photo Directory', type: 'gallery', permission: 'read-only' },
  ],
  'project-tracker': [
    { id: 'proj-table', name: 'All Projects', type: 'table', permission: 'edit' },
    { id: 'proj-kanban', name: 'Project Board', type: 'kanban', permission: 'edit' },
  ],
  'asset-inventory': [
    { id: 'asset-table', name: 'Asset List', type: 'table', permission: 'manage' },
    { id: 'asset-gallery', name: 'Asset Gallery', type: 'gallery', permission: 'read-only' },
  ],
  'timesheet': [
    { id: 'time-table', name: 'Timesheet Entries', type: 'table', permission: 'edit' },
    { id: 'time-calendar', name: 'Calendar View', type: 'calendar', permission: 'read-only' },
  ],
  'training-requests': [
    { id: 'train-table', name: 'All Requests', type: 'table', permission: 'read-only' },
    { id: 'train-kanban', name: 'By Status', type: 'kanban', permission: 'edit' },
  ],
  'customer-feedback': [
    { id: 'feedback-table', name: 'All Feedback', type: 'table', permission: 'manage' },
    { id: 'feedback-gallery', name: 'Feedback Cards', type: 'gallery', permission: 'read-only' },
  ],
}

// Mock reports for all entities
const MOCK_ENTITY_REPORTS: Record<string, Array<{ id: string; name: string; permission: PermissionLevel }>> = {
  'expense-report': [
    { id: 'exp-summary', name: 'Expense Summary', permission: 'read-only' },
    { id: 'exp-by-category', name: 'By Category', permission: 'read-only' },
    { id: 'exp-monthly', name: 'Monthly Trends', permission: 'manage' },
  ],
  'leave-request': [
    { id: 'leave-summary', name: 'Leave Summary', permission: 'read-only' },
    { id: 'leave-balance', name: 'Balance Report', permission: 'edit' },
  ],
  'employee-directory': [
    { id: 'emp-headcount', name: 'Headcount Report', permission: 'manage' },
    { id: 'emp-dept', name: 'By Department', permission: 'read-only' },
  ],
  'project-tracker': [
    { id: 'proj-status', name: 'Project Status', permission: 'edit' },
    { id: 'proj-timeline', name: 'Timeline Report', permission: 'read-only' },
  ],
  'invoice-approval': [
    { id: 'inv-pending', name: 'Pending Approvals', permission: 'edit' },
    { id: 'inv-monthly', name: 'Monthly Summary', permission: 'read-only' },
  ],
  'vendor-onboarding': [
    { id: 'vendor-status', name: 'Onboarding Status', permission: 'edit' },
    { id: 'vendor-list', name: 'Vendor List', permission: 'read-only' },
  ],
  'asset-inventory': [
    { id: 'asset-summary', name: 'Asset Summary', permission: 'manage' },
    { id: 'asset-depreciation', name: 'Depreciation Report', permission: 'read-only' },
  ],
  'purchase-order': [
    { id: 'po-pending', name: 'Pending Orders', permission: 'edit' },
    { id: 'po-monthly', name: 'Monthly Summary', permission: 'read-only' },
  ],
  'timesheet': [
    { id: 'time-summary', name: 'Hours Summary', permission: 'edit' },
    { id: 'time-utilization', name: 'Utilization Report', permission: 'read-only' },
  ],
  'training-requests': [
    { id: 'train-summary', name: 'Training Summary', permission: 'read-only' },
    { id: 'train-budget', name: 'Budget Report', permission: 'manage' },
  ],
  'customer-feedback': [
    { id: 'feedback-summary', name: 'Feedback Summary', permission: 'read-only' },
    { id: 'feedback-trends', name: 'Sentiment Trends', permission: 'manage' },
  ],
  'travel-request': [
    { id: 'travel-pending', name: 'Pending Requests', permission: 'edit' },
    { id: 'travel-expense', name: 'Travel Expenses', permission: 'read-only' },
  ],
}

// View/Report action options
const VIEW_REPORT_OPTIONS = [
  { id: 'modify', title: 'Modify', description: 'Edit the configuration' },
  { id: 'change-permission', title: 'Change permission', description: 'Update access level' },
]

// Role-entity permissions mapping
const ROLE_PERMISSIONS: Record<string, Record<string, PermissionLevel>> = {
  admin: {
    'expense-report': 'manage',
    'leave-request': 'manage',
    'employee-directory': 'manage',
    'project-tracker': 'manage',
    'invoice-approval': 'manage',
    'vendor-onboarding': 'manage',
    'asset-inventory': 'manage',
    'purchase-order': 'manage',
    'timesheet': 'manage',
    'training-requests': 'manage',
    'customer-feedback': 'manage',
    'travel-request': 'manage',
  },
  manager: {
    'expense-report': 'edit',
    'leave-request': 'edit',
    'employee-directory': 'read-only',
    'project-tracker': 'manage',
    'invoice-approval': 'edit',
    'vendor-onboarding': 'read-only',
    'asset-inventory': 'read-only',
    'purchase-order': 'edit',
    'timesheet': 'edit',
    'training-requests': 'edit',
    'customer-feedback': 'read-only',
    'travel-request': 'edit',
  },
  employee: {
    'expense-report': 'initiate',
    'leave-request': 'initiate',
    'employee-directory': 'read-only',
    'project-tracker': 'read-only',
    'invoice-approval': 'no-permission',
    'vendor-onboarding': 'no-permission',
    'asset-inventory': 'read-only',
    'purchase-order': 'initiate',
    'timesheet': 'initiate',
    'training-requests': 'initiate',
    'customer-feedback': 'initiate',
    'travel-request': 'initiate',
  },
  viewer: {
    'expense-report': 'read-only',
    'leave-request': 'read-only',
    'employee-directory': 'read-only',
    'project-tracker': 'read-only',
    'invoice-approval': 'read-only',
    'vendor-onboarding': 'read-only',
    'asset-inventory': 'read-only',
    'purchase-order': 'read-only',
    'timesheet': 'read-only',
    'training-requests': 'read-only',
    'customer-feedback': 'read-only',
    'travel-request': 'read-only',
  },
  'hr-manager': {
    'expense-report': 'read-only',
    'leave-request': 'manage',
    'employee-directory': 'manage',
    'project-tracker': 'read-only',
    'invoice-approval': 'no-permission',
    'vendor-onboarding': 'no-permission',
    'asset-inventory': 'read-only',
    'purchase-order': 'no-permission',
    'timesheet': 'manage',
    'training-requests': 'manage',
    'customer-feedback': 'read-only',
    'travel-request': 'edit',
  },
  'finance-lead': {
    'expense-report': 'manage',
    'leave-request': 'read-only',
    'employee-directory': 'read-only',
    'project-tracker': 'read-only',
    'invoice-approval': 'manage',
    'vendor-onboarding': 'edit',
    'asset-inventory': 'edit',
    'purchase-order': 'manage',
    'timesheet': 'read-only',
    'training-requests': 'read-only',
    'customer-feedback': 'no-permission',
    'travel-request': 'manage',
  },
  'project-lead': {
    'expense-report': 'edit',
    'leave-request': 'read-only',
    'employee-directory': 'read-only',
    'project-tracker': 'manage',
    'invoice-approval': 'read-only',
    'vendor-onboarding': 'read-only',
    'asset-inventory': 'read-only',
    'purchase-order': 'initiate',
    'timesheet': 'edit',
    'training-requests': 'edit',
    'customer-feedback': 'edit',
    'travel-request': 'initiate',
  },
  auditor: {
    'expense-report': 'read-only',
    'leave-request': 'read-only',
    'employee-directory': 'read-only',
    'project-tracker': 'read-only',
    'invoice-approval': 'read-only',
    'vendor-onboarding': 'read-only',
    'asset-inventory': 'read-only',
    'purchase-order': 'read-only',
    'timesheet': 'read-only',
    'training-requests': 'read-only',
    'customer-feedback': 'read-only',
    'travel-request': 'read-only',
  },
}

// Entity type icons and colors
const ENTITY_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  dataform: { icon: 'ClipboardList', color: '#22C55E', label: 'Data Form' },
  board: { icon: 'LayoutGrid', color: '#8B5CF6', label: 'Board' },
  process: { icon: 'Workflow', color: '#F97316', label: 'Process' },
}

// Helper function to format permission level for display
function formatPermissionLevel(level: PermissionLevel): string {
  const labels: Record<PermissionLevel, string> = {
    'no-permission': 'No permission',
    'read-only': 'Read-only',
    'initiate': 'Initiate',
    'edit': 'Edit',
    'manage': 'Manage',
  }
  return labels[level]
}

// Helper function to get permission color
function getPermissionColor(level: PermissionLevel): string {
  // Use gray for no permission, black for all others
  return level === 'no-permission' ? 'text-gray-400' : 'text-gray-900'
}

type ConversationState = 'idle' | 'awaiting_role_name' | 'awaiting_permission_type' | 'awaiting_duplicate_role' | 'awaiting_custom_permission' | 'awaiting_new_role_name' | 'awaiting_permission_change' | 'awaiting_duplicated_role_name'

// Intent detection for role-related messages
interface ParsedRoleIntent {
  intent: 'add_role' | 'modify_role' | 'query_role_capabilities' | 'unknown'
  roleName?: string
  permissionType?: 'all' | 'none' | 'duplicate' | 'custom'
  duplicateFrom?: string
  customDescription?: string
}

// Helper function to parse role-related intents from user message
function parseRoleIntent(message: string): ParsedRoleIntent {
  const lowerMessage = message.toLowerCase().trim()

  // Check if the message is about roles
  const isAboutRoles = /\broles?\b/i.test(lowerMessage)

  // Check if asking about role capabilities (questions about what's possible)
  const isQueryPattern =
    // Direct questions
    /\b(what|which|how|can|could|tell|show|list|explain|help)\b/i.test(lowerMessage) &&
    // Combined with possibility/capability words
    (
      /\b(possibilities|possible|options|features|capabilities|can do|able to|available|do with|have with)\b/i.test(lowerMessage) ||
      /\b(help|tell|show|explain|about)\b.*\broles?\b/i.test(lowerMessage) ||
      /\broles?\b.*\b(help|tell|show|explain|about|options|features)\b/i.test(lowerMessage)
    )

  if (isAboutRoles && isQueryPattern) {
    return { intent: 'query_role_capabilities' }
  }

  // Check for add/create role intent - broad detection
  const addRolePatterns = [
    /(?:add|create|make)\b.*\brole\b/i,  // Any "add/create/make ... role" pattern
    /(?:i\s+)?(?:want|need|would like)\s+(?:to\s+)?(?:add|create|make)\b.*\brole\b/i,
    /(?:can you|please|could you)\s+(?:add|create|make)\b.*\brole\b/i,
    /\bnew\s+role\b/i,
  ]

  const isAddRole = addRolePatterns.some(pattern => pattern.test(lowerMessage))

  if (isAddRole) {
    const result: ParsedRoleIntent = { intent: 'add_role' }

    // Try to extract role name from the ORIGINAL message (to preserve case)
    const namePatterns = [
      // Pattern for: Add a new role "Finance Head" (role followed by quoted name)
      /\brole\s+["']([^"']+)["']/i,
      // Pattern for: Add a "Chief of Design" role (quoted name before "role")
      /(?:add|create|make)\s+(?:a\s+)?(?:new\s+)?["']([^"']+)["']\s+role/i,
      // Pattern for: role called/named "Manager" or role called Manager
      /\brole\s+(?:called|named|with name)\s+["']?([^"'\s][^"']*?)["']?(?:\s+with|\s+having|\s+duplicat|\s*$)/i,
      // Pattern for: add Manager role (unquoted name before "role")
      /(?:add|create|make)\s+(?:a\s+)?(?:new\s+)?([A-Z][a-zA-Z0-9_\s]*?)\s+role(?:\s|$)/i,
    ]

    for (const pattern of namePatterns) {
      const match = message.match(pattern)  // Use original message to preserve case
      if (match && match[1]) {
        const extractedName = match[1].trim()
        // Don't treat common words as role names
        if (!['a', 'an', 'the', 'new', 'with', 'and', 'role'].includes(extractedName.toLowerCase())) {
          result.roleName = extractedName
          break
        }
      }
    }

    // Try to extract permission type
    if (lowerMessage.includes('all permission') || lowerMessage.includes('full access') || lowerMessage.includes('full permission')) {
      result.permissionType = 'all'
    } else if (lowerMessage.includes('no permission') || lowerMessage.includes('without permission') || lowerMessage.includes('empty permission')) {
      result.permissionType = 'none'
    } else if (/\b(duplicat|copy|same as|based on|like)\b/i.test(lowerMessage)) {
      result.permissionType = 'duplicate'
      // Try to extract which role to duplicate from (use original message to preserve case)
      const duplicatePatterns = [
        // "duplicating the permission from "Admin" role"
        /(?:duplicat\w*|copy\w*)\s+(?:the\s+)?(?:permission\w*\s+)?(?:from|of)\s+["']([^"']+)["']/i,
        // "duplicate from Admin role"
        /(?:duplicat\w*|copy\w*)\s+(?:the\s+)?(?:permission\w*\s+)?(?:from|of)\s+([a-zA-Z][a-zA-Z0-9_\s]*?)(?:\s+role)?(?:\s*$|,|\s+and|\s+with)/i,
        // "same as Admin" or "like Admin"
        /(?:same\s+as|like|based\s+on)\s+["']?([^"'\s][^"']*?)["']?(?:\s+role)?(?:\s*$|,|\s+and)/i,
        // "from "Admin" role" (standalone)
        /from\s+["']([^"']+)["']\s*(?:role)?/i,
      ]
      for (const pattern of duplicatePatterns) {
        const match = message.match(pattern)  // Use original message to preserve case
        if (match && match[1]) {
          result.duplicateFrom = match[1].trim()
          break
        }
      }
    } else if (lowerMessage.includes('custom permission')) {
      result.permissionType = 'custom'
    }

    return result
  }

  // Check for modify role intent
  if (
    lowerMessage.includes('modify role') ||
    lowerMessage.includes('edit role') ||
    lowerMessage.includes('update role') ||
    lowerMessage.includes('change role')
  ) {
    return { intent: 'modify_role' }
  }

  return { intent: 'unknown' }
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  showAppCard?: boolean
  showSuggestions?: boolean
  showSubActions?: SubAction[]
  showPermissionOptions?: boolean
  showExistingRoles?: boolean
  showRoleSuccess?: { roleName: string; permissionType: string; duplicatedFrom?: string }
  showSuggestedRoles?: SuggestedRole[]
  showAddedRoles?: { selectedRoles: string[] }
  showDisabledSubActions?: {
    categoryTitle: string
    categoryIconBg: string
    categoryIconColor: string
    categoryIconName: string
    subActions: SubAction[]
    selectedActionId: string
  }
  showRoleChips?: boolean
  showModificationOptions?: boolean
  showRoleRenameSuccess?: { oldName: string; newName: string }
  showPermissionChangeSuccess?: { roleName: string; changeDescription: string }
  showPermissionChangeChips?: boolean
  showDuplicateRoleSuccess?: { newRoleName: string; duplicatedFrom: string }
  showRoleChipsForDuplicate?: boolean
  showAllRolesList?: boolean
  showRoleContextActions?: { roleName: string }
  showPermissionsTable?: {
    roleName: string
    permissions: Array<{
      entityId: string
      entityName: string
      entityType: 'dataform' | 'board' | 'process'
      permissionLevel: PermissionLevel
    }>
  }
  showDataEntityOptions?: {
    entityId: string
    entityName: string
    entityType: 'dataform' | 'board' | 'process'
    roleName: string
    currentPermission: PermissionLevel
  }
  showPermissionLevelChips?: {
    entityId: string
    entityName: string
    roleName: string
    currentPermission: PermissionLevel
  }
  showViewsTable?: {
    entityId: string
    entityName: string
    roleName: string
    views: Array<{ id: string; name: string; type: ViewType; permission: PermissionLevel }>
  }
  showReportsTable?: {
    entityId: string
    entityName: string
    roleName: string
    reports: Array<{ id: string; name: string; permission: PermissionLevel }>
  }
  showViewReportOptions?: {
    itemId: string
    itemName: string
    itemType: 'view' | 'report'
    entityName: string
    roleName: string
    currentPermission: PermissionLevel
  }
}

interface SuggestionAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  subActions?: SubAction[]
}

const SUGGESTION_ACTIONS: SuggestionAction[] = [
  {
    id: 'manage-roles',
    title: 'Roles & Permissions',
    description: 'Define user roles and permissions',
    icon: UserKey,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    subActions: [
      { id: 'view-all-roles', title: 'View all roles' },
      { id: 'suggest-roles', title: 'Suggest roles' },
      { id: 'add-role', title: 'Add role(s)' },
      { id: 'modify-role-permission', title: 'Modify role/permission' },
      { id: 'duplicate-role', title: 'Duplicate role' },
    ],
  },
  {
    id: 'manage-data-entity',
    title: 'Data',
    description: 'Create and manage data structures',
    icon: Database,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    subActions: [
      { id: 'add-entity', title: 'Add Data Entity' },
      { id: 'modify-entity', title: 'Modify Data Entity' },
    ],
  },
  {
    id: 'manage-ui',
    title: 'Interface',
    description: 'Design pages, forms, and views',
    icon: Layout,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    subActions: [
      { id: 'add-page', title: 'Add Page' },
      { id: 'modify-page', title: 'Modify Page' },
    ],
  },
  {
    id: 'manage-integration',
    title: 'Integration',
    description: 'Connect external services and APIs',
    icon: Plug,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    subActions: [
      { id: 'add-integration', title: 'Add Integration' },
      { id: 'modify-integration', title: 'Modify Integration' },
    ],
  },
]

function AppIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} />
  }
  return <IconComponent className={className} />
}

export function CopilotPanel({ appName, appDescription, appIcon, appIconBg }: CopilotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Your app has been generated successfully!',
      timestamp: new Date(),
      showAppCard: true,
      showSuggestions: true,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [conversationState, setConversationState] = useState<ConversationState>('idle')
  const [pendingRoleName, setPendingRoleName] = useState('')
  const [drillThroughCategory, setDrillThroughCategory] = useState<string | null>(null)
  const [completedAction, setCompletedAction] = useState<string | null>(null)
  const [showSuggestRolesFlow, setShowSuggestRolesFlow] = useState(false)
  const [isScanningRoles, setIsScanningRoles] = useState(false)
  const [suggestedRoles, setSuggestedRoles] = useState<SuggestedRole[]>([])
  const [selectedPermissionOption, setSelectedPermissionOption] = useState<string | null>(null)
  const [selectedRoleToModify, setSelectedRoleToModify] = useState<string | null>(null)
  const [selectedModificationOption, setSelectedModificationOption] = useState<string | null>(null)
  const [roleBeingRenamed, setRoleBeingRenamed] = useState<string | null>(null)
  const [roleForPermissionChange, setRoleForPermissionChange] = useState<string | null>(null)
  const [selectedPermissionChangeOption, setSelectedPermissionChangeOption] = useState<string | null>(null)
  const [roleBeingDuplicated, setRoleBeingDuplicated] = useState<string | null>(null)
  const [selectedRoleToDuplicate, setSelectedRoleToDuplicate] = useState<string | null>(null)
  const [selectedRoleFromList, setSelectedRoleFromList] = useState<string | null>(null)
  const [selectedRoleContextAction, setSelectedRoleContextAction] = useState<string | null>(null)
  const [roleInContext, setRoleInContext] = useState<string | null>(null)
  const [selectedDataEntity, setSelectedDataEntity] = useState<string | null>(null)
  const [selectedDataEntityOption, setSelectedDataEntityOption] = useState<string | null>(null)
  const [selectedPermissionLevel, setSelectedPermissionLevel] = useState<string | null>(null)
  const [entityForPermissionChange, setEntityForPermissionChange] = useState<{
    entityId: string
    entityName: string
    entityType: 'dataform' | 'board' | 'process'
    roleName: string
    currentPermission: PermissionLevel
  } | null>(null)
  const [selectedViewOrReport, setSelectedViewOrReport] = useState<string | null>(null)
  const [selectedViewReportOption, setSelectedViewReportOption] = useState<string | null>(null)
  const [viewReportForPermissionChange, setViewReportForPermissionChange] = useState<{
    itemId: string
    itemName: string
    itemType: 'view' | 'report'
    entityName: string
    roleName: string
    currentPermission: PermissionLevel
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Get the current drill-through category details
  const currentDrillThrough = drillThroughCategory
    ? SUGGESTION_ACTIONS.find(s => s.id === drillThroughCategory)
    : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Handle conversation state - user is responding to a specific question
    if (conversationState === 'awaiting_role_name') {
      // User provided role name, now ask for permissions
      setPendingRoleName(text)
      setConversationState('awaiting_permission_type')

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Great! How would you like to set up permissions for the '${text}' role?`,
          timestamp: new Date(),
          showPermissionOptions: true,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    if (conversationState === 'awaiting_custom_permission') {
      // User provided custom permission description, create role
      setConversationState('idle')

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          showRoleSuccess: {
            roleName: pendingRoleName,
            permissionType: 'Custom Permissions',
          },
        }
        setMessages(prev => [...prev, assistantMessage])
        setPendingRoleName('')
      }, 500)
      return
    }

    if (conversationState === 'awaiting_new_role_name') {
      // User provided new role name, show success
      setConversationState('idle')
      const oldName = roleBeingRenamed || ''

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          showRoleRenameSuccess: {
            oldName: oldName,
            newName: text,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
        setRoleBeingRenamed(null)
      }, 500)
      return
    }

    if (conversationState === 'awaiting_permission_change') {
      // User provided permission change description, show success
      setConversationState('idle')
      const roleName = roleForPermissionChange || ''

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          showPermissionChangeSuccess: {
            roleName: roleName,
            changeDescription: text,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
        setRoleForPermissionChange(null)
      }, 500)
      return
    }

    if (conversationState === 'awaiting_duplicated_role_name') {
      // User provided new role name for duplication, show success
      setConversationState('idle')
      const originalRole = roleBeingDuplicated || ''

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          showDuplicateRoleSuccess: {
            newRoleName: text,
            duplicatedFrom: originalRole,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
        setRoleBeingDuplicated(null)
      }, 500)
      return
    }

    // Parse intent from free-form message
    const parsedIntent = parseRoleIntent(text)

    // Handle role capability questions
    if (parsedIntent.intent === 'query_role_capabilities') {
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's what you can do with Roles:\n\n• **Add Role** - Create a new role with custom name and permissions\n• **Modify Role** - Update an existing role's name or permissions\n\nFor permissions, you can:\n• Grant **All Permissions** for full access\n• Set **No Permissions** and add them later\n• **Duplicate** permissions from an existing role\n• Configure **Custom Permissions** for specific access\n\nWould you like to add or modify a role?`,
          timestamp: new Date(),
          showSubActions: [
            { id: 'add-role', title: 'Add Role' },
            { id: 'modify-role', title: 'Modify Role' },
          ],
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Handle add role intent with smart orchestration
    if (parsedIntent.intent === 'add_role') {
      const { roleName, permissionType, duplicateFrom } = parsedIntent

      // Case 1: User provided both name and permission
      if (roleName && permissionType) {
        if (permissionType === 'duplicate' && duplicateFrom) {
          // Full info with duplicate - create role immediately
          setConversationState('idle')
          setTimeout(() => {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              showRoleSuccess: {
                roleName: roleName,
                permissionType: 'Duplicated Permissions',
                duplicatedFrom: duplicateFrom,
              },
            }
            setMessages(prev => [...prev, assistantMessage])
          }, 500)
          return
        } else if (permissionType === 'duplicate' && !duplicateFrom) {
          // Has name, wants to duplicate but didn't specify from which role
          setPendingRoleName(roleName)
          setConversationState('awaiting_duplicate_role')
          setTimeout(() => {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I'll create the '${roleName}' role. Which role would you like to duplicate permissions from?`,
              timestamp: new Date(),
              showExistingRoles: true,
            }
            setMessages(prev => [...prev, assistantMessage])
          }, 500)
          return
        } else if (permissionType === 'custom') {
          // Has name, wants custom permissions
          setPendingRoleName(roleName)
          setConversationState('awaiting_custom_permission')
          setTimeout(() => {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I'll create the '${roleName}' role with custom permissions. Please describe the permissions you would like to set:`,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMessage])
          }, 500)
          return
        } else {
          // Has name and simple permission type (all or none)
          setConversationState('idle')
          setTimeout(() => {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              showRoleSuccess: {
                roleName: roleName,
                permissionType: permissionType === 'all' ? 'All Permissions' : 'No Permissions',
              },
            }
            setMessages(prev => [...prev, assistantMessage])
          }, 500)
          return
        }
      }

      // Case 2: User provided only name, ask for permission
      if (roleName && !permissionType) {
        setPendingRoleName(roleName)
        setConversationState('awaiting_permission_type')
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Great! How would you like to set up permissions for the '${roleName}' role?`,
            timestamp: new Date(),
            showPermissionOptions: true,
          }
          setMessages(prev => [...prev, assistantMessage])
        }, 500)
        return
      }

      // Case 3: User wants to add role but didn't provide name
      if (!roleName) {
        setConversationState('awaiting_role_name')
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'What would you like to name this role?',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
        }, 500)
        return
      }
    }

    // Handle modify role intent
    if (parsedIntent.intent === 'modify_role') {
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'll help you modify a role. This feature is coming soon!`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Default AI response for unrecognized intents
    setIsLoading(true)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with that. This feature is coming soon! For now, you can use the Edit button to return to the builder and make modifications there.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: SuggestionAction) => {
    // Drill through to show sub-actions
    setDrillThroughCategory(suggestion.id)
  }

  const handleBackToQuickStart = () => {
    setDrillThroughCategory(null)
  }

  const handleSubActionClick = (subAction: SubAction) => {
    // Mark this action as completed (for disabled state styling)
    setCompletedAction(subAction.id)

    // Get icon name from the component
    const getIconName = (icon: React.ComponentType<{ className?: string }>) => {
      if (icon === Users) return 'Users'
      if (icon === Database) return 'Database'
      if (icon === LayoutGrid) return 'LayoutGrid'
      if (icon === Cable) return 'Cable'
      return 'Folder'
    }

    // Add user message with disabled sub-actions card (shows what was available and what was selected)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: subAction.title,
      timestamp: new Date(),
      showDisabledSubActions: currentDrillThrough ? {
        categoryTitle: currentDrillThrough.title === 'Role' ? 'Roles & Permission' : currentDrillThrough.title,
        categoryIconBg: currentDrillThrough.iconBg,
        categoryIconColor: currentDrillThrough.iconColor,
        categoryIconName: getIconName(currentDrillThrough.icon),
        subActions: currentDrillThrough.subActions || [],
        selectedActionId: subAction.id,
      } : undefined,
    }

    setMessages(prev => [...prev, userMessage])

    // Handle "Suggest roles" - show loading then AI suggestions
    if (subAction.id === 'suggest-roles') {
      setShowSuggestRolesFlow(true)
      setIsScanningRoles(true)
      setSuggestedRoles([])

      // Simulate AI scanning (2 seconds)
      setTimeout(() => {
        setIsScanningRoles(false)
        const roles = MOCK_SUGGESTED_ROLES.map(role => ({ ...role, selected: false }))
        setSuggestedRoles(roles)
      }, 2000)
      return
    }

    // Handle "Add Role" specially
    if (subAction.id === 'add-role') {
      setConversationState('awaiting_role_name')
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'What would you like to name this role?',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Handle "Modify role/permission" - show role chips
    if (subAction.id === 'modify-role-permission') {
      setSelectedRoleToModify(null)
      setSelectedModificationOption(null)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Which role would you like to modify?',
          timestamp: new Date(),
          showRoleChips: true,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Handle "Duplicate role" - show role chips for selection
    if (subAction.id === 'duplicate-role') {
      setSelectedRoleToDuplicate(null)
      setRoleBeingDuplicated(null)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Which role would you like to duplicate?',
          timestamp: new Date(),
          showRoleChipsForDuplicate: true,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Handle "View all roles" - show list of roles with descriptions
    if (subAction.id === 'view-all-roles') {
      setSelectedRoleFromList(null)
      setSelectedRoleContextAction(null)
      setRoleInContext(null)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Here are all the roles in your app. Click on a role to see available actions:',
          timestamp: new Date(),
          showAllRolesList: true,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
      return
    }

    // Default response for other sub-actions
    setIsLoading(true)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you ${subAction.title.toLowerCase()}. This feature is coming soon!`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleToggleSuggestedRole = (roleId: string) => {
    setSuggestedRoles(prev => prev.map(role =>
      role.id === roleId ? { ...role, selected: !role.selected } : role
    ))
  }

  const handleAddSelectedRoles = () => {
    const selectedRoles = suggestedRoles.filter(role => role.selected)
    if (selectedRoles.length === 0) return

    const selectedRoleNames = selectedRoles.map(r => r.name)

    // Add AI message showing what was suggested (with the list embedded, marking selected ones)
    const aiSuggestionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'I scanned your app. Based on the data, access patterns, workflows and interface structure, here are roles worth adding:',
      timestamp: new Date(),
      showSuggestedRoles: suggestedRoles.map(r => ({ ...r })), // snapshot with selection state preserved
    }

    // Add user message showing what they selected
    const userSelectionMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'user',
      content: `Add ${selectedRoleNames.join(', ')}`,
      timestamp: new Date(),
    }

    // Add success message showing what was added
    const successMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showAddedRoles: {
        selectedRoles: selectedRoleNames,
      },
    }

    // Reset suggest roles flow
    setShowSuggestRolesFlow(false)
    setSuggestedRoles([])

    // Add all messages to the thread
    setMessages(prev => [...prev, aiSuggestionMessage, userSelectionMessage, successMessage])
  }

  const handleCancelSuggestRoles = () => {
    // Hide the suggest roles flow UI
    setShowSuggestRolesFlow(false)
    setSuggestedRoles([])
    setIsScanningRoles(false)
    // Keep completedAction set - don't reset it
    // This keeps "Suggest roles" shown as selected/disabled

    // Add assistant message asking what to do next
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'What would you like to do next?',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMessage])
  }

  const handlePermissionOptionClick = (option: PermissionOption) => {
    // Mark this permission option as selected (for disabled state styling)
    setSelectedPermissionOption(option.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: option.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    switch (option.id) {
      case 'all':
      case 'none':
        // Direct success - create role immediately
        setConversationState('idle')
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            showRoleSuccess: {
              roleName: pendingRoleName,
              permissionType: option.id === 'all' ? 'All Permissions' : 'No Permissions',
            },
          }
          setMessages(prev => [...prev, assistantMessage])
          setPendingRoleName('')
        }, 500)
        break

      case 'duplicate':
        // Show existing roles to select from
        setConversationState('awaiting_duplicate_role')
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Which role would you like to duplicate permissions from?',
            timestamp: new Date(),
            showExistingRoles: true,
          }
          setMessages(prev => [...prev, assistantMessage])
        }, 500)
        break

      case 'custom':
        // Ask for custom permission description
        setConversationState('awaiting_custom_permission')
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Please describe the custom permissions you would like to set for this role:',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
        }, 500)
        break
    }
  }

  const handleExistingRoleClick = (role: { id: string; name: string }) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: role.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Reset state and show success
    setConversationState('idle')
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        showRoleSuccess: {
          roleName: pendingRoleName,
          permissionType: 'Duplicated Permissions',
          duplicatedFrom: role.name,
        },
      }
      setMessages(prev => [...prev, assistantMessage])
      setPendingRoleName('')
    }, 500)
  }

  const handleRoleToModifyClick = (role: { id: string; name: string }) => {
    // Mark this role as selected (for disabled state styling)
    setSelectedRoleToModify(role.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: role.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show modification options
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to do with the '${role.name}' role?`,
        timestamp: new Date(),
        showModificationOptions: true,
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleRoleToDuplicateClick = (role: { id: string; name: string }) => {
    // Mark this role as selected (for disabled state styling)
    setSelectedRoleToDuplicate(role.id)
    setRoleBeingDuplicated(role.name)
    setConversationState('awaiting_duplicated_role_name')

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: role.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Ask for new role name
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to name the new role?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleRoleFromListClick = (role: { id: string; name: string; description: string }) => {
    // Mark this role as selected (for disabled state styling)
    setSelectedRoleFromList(role.id)
    setRoleInContext(role.name)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: role.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show context actions for this role
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to do with the '${role.name}' role?`,
        timestamp: new Date(),
        showRoleContextActions: { roleName: role.name },
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleRoleContextActionClick = (action: { id: string; title: string }) => {
    // Mark this action as selected (for disabled state styling)
    setSelectedRoleContextAction(action.id)

    const roleName = roleInContext || ''

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: action.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Handle different context actions
    if (action.id === 'modify-role') {
      // Show modification options (same as modify role/permission flow)
      setSelectedRoleToModify(EXISTING_ROLES.find(r => r.name === roleName)?.id || null)
      setSelectedModificationOption(null)

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `What would you like to do with the '${roleName}' role?`,
          timestamp: new Date(),
          showModificationOptions: true,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else if (action.id === 'show-permissions') {
      // Show permissions table for the role
      const roleId = EXISTING_ROLES.find(r => r.name === roleName)?.id || ''
      const rolePerms = ROLE_PERMISSIONS[roleId] || {}

      const permissions = MOCK_DATA_ENTITIES.map(entity => ({
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        permissionLevel: (rolePerms[entity.id] || 'no-permission') as PermissionLevel,
      }))

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Permissions for '${roleName}':`,
          timestamp: new Date(),
          showPermissionsTable: { roleName, permissions },
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else if (action.id === 'duplicate-from-view') {
      // Start duplicate role flow
      setRoleBeingDuplicated(roleName)
      setConversationState('awaiting_duplicated_role_name')

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `What would you like to name the new role?`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    }
  }

  const handleModificationOptionClick = (option: ModificationOption) => {
    // Mark this option as selected (for disabled state styling)
    setSelectedModificationOption(option.id)

    // Get the name of the role being modified
    const roleBeingModified = EXISTING_ROLES.find(r => r.id === selectedRoleToModify)?.name || ''

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: option.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Handle different modification options
    if (option.id === 'change-name') {
      setRoleBeingRenamed(roleBeingModified)
      setConversationState('awaiting_new_role_name')
    } else if (option.id === 'modify-permissions') {
      setRoleForPermissionChange(roleBeingModified)
      setSelectedPermissionChangeOption(null) // Reset for new selection
    }

    setTimeout(() => {
      let responseContent = ''
      let showChips = false

      switch (option.id) {
        case 'change-name':
          responseContent = 'What would you like to rename this role to?'
          break
        case 'modify-permissions':
          responseContent = `How would you like to modify permissions for the '${roleBeingModified}' role?`
          showChips = true
          break
        default:
          responseContent = 'This feature is coming soon!'
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        showPermissionChangeChips: showChips,
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handlePermissionChangeChipClick = (chipOption: { id: string; title: string }) => {
    // Mark this chip as selected
    setSelectedPermissionChangeOption(chipOption.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chipOption.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    const roleName = roleForPermissionChange || ''

    if (chipOption.id === 'custom') {
      // Ask for custom permission description
      setConversationState('awaiting_permission_change')
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Please describe the permission changes you would like to make:',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else {
      // Direct success for full access or remove access
      const changeDescription = chipOption.id === 'full-access'
        ? 'Granted full access to all features'
        : 'Removed all access permissions'

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          showPermissionChangeSuccess: {
            roleName: roleName,
            changeDescription: changeDescription,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
        setRoleForPermissionChange(null)
      }, 500)
    }
  }

  const handleDataEntityClick = (
    entityId: string,
    entityName: string,
    entityType: 'dataform' | 'board' | 'process',
    roleName: string,
    currentPermission: PermissionLevel
  ) => {
    // Mark this entity as selected
    setSelectedDataEntity(entityId)
    setSelectedDataEntityOption(null) // Reset any previous option selection
    setSelectedPermissionLevel(null) // Reset permission level selection

    // Store entity context for permission change flow
    setEntityForPermissionChange({
      entityId,
      entityName,
      entityType,
      roleName,
      currentPermission,
    })

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: entityName,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show data entity options
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to do with '${entityName}' for the '${roleName}' role?`,
        timestamp: new Date(),
        showDataEntityOptions: {
          entityId,
          entityName,
          entityType,
          roleName,
          currentPermission,
        },
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleDataEntityOptionClick = (option: { id: string; title: string; description: string }) => {
    // Mark this option as selected
    setSelectedDataEntityOption(option.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: option.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    if (option.id === 'modify-permission' && entityForPermissionChange) {
      // Show permission level chips
      const currentPermLabel = formatPermissionLevel(entityForPermissionChange.currentPermission)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Current permission for '${entityForPermissionChange.entityName}' is '${currentPermLabel}'. Select a new permission level:`,
          timestamp: new Date(),
          showPermissionLevelChips: {
            entityId: entityForPermissionChange.entityId,
            entityName: entityForPermissionChange.entityName,
            roleName: entityForPermissionChange.roleName,
            currentPermission: entityForPermissionChange.currentPermission,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else if (option.id === 'views-permission' && entityForPermissionChange) {
      // Show views table
      const views = MOCK_ENTITY_VIEWS[entityForPermissionChange.entityId] || []
      setSelectedViewOrReport(null) // Reset view/report selection
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Views for '${entityForPermissionChange.entityName}':`,
          timestamp: new Date(),
          showViewsTable: {
            entityId: entityForPermissionChange.entityId,
            entityName: entityForPermissionChange.entityName,
            roleName: entityForPermissionChange.roleName,
            views,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else if (option.id === 'reports-permission' && entityForPermissionChange) {
      // Show reports table
      const reports = MOCK_ENTITY_REPORTS[entityForPermissionChange.entityId] || []
      setSelectedViewOrReport(null) // Reset view/report selection
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Reports for '${entityForPermissionChange.entityName}':`,
          timestamp: new Date(),
          showReportsTable: {
            entityId: entityForPermissionChange.entityId,
            entityName: entityForPermissionChange.entityName,
            roleName: entityForPermissionChange.roleName,
            reports,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else {
      // Show coming soon response for other options
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `This feature is coming soon! You'll be able to ${option.description.toLowerCase()}.`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    }
  }

  const handlePermissionLevelChipClick = (level: { id: PermissionLevel; title: string }) => {
    if (!entityForPermissionChange) return

    // Mark this level as selected
    setSelectedPermissionLevel(level.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: level.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show success message
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Permission for '${entityForPermissionChange.entityName}' has been updated to '${level.title}' for the '${entityForPermissionChange.roleName}' role.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      // Reset entity context
      setEntityForPermissionChange(null)
    }, 500)
  }

  const handleViewClick = (
    view: { id: string; name: string; type: ViewType; permission: PermissionLevel },
    entityName: string,
    roleName: string
  ) => {
    // Mark this view as selected
    setSelectedViewOrReport(view.id)
    setSelectedViewReportOption(null) // Reset option selection

    // Store context for further actions
    setViewReportForPermissionChange({
      itemId: view.id,
      itemName: view.name,
      itemType: 'view',
      entityName,
      roleName,
      currentPermission: view.permission,
    })

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: view.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show view options
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to do with the '${view.name}' view?`,
        timestamp: new Date(),
        showViewReportOptions: {
          itemId: view.id,
          itemName: view.name,
          itemType: 'view',
          entityName,
          roleName,
          currentPermission: view.permission,
        },
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleReportClick = (
    report: { id: string; name: string; permission: PermissionLevel },
    entityName: string,
    roleName: string
  ) => {
    // Mark this report as selected
    setSelectedViewOrReport(report.id)
    setSelectedViewReportOption(null) // Reset option selection

    // Store context for further actions
    setViewReportForPermissionChange({
      itemId: report.id,
      itemName: report.name,
      itemType: 'report',
      entityName,
      roleName,
      currentPermission: report.permission,
    })

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: report.name,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Show report options
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `What would you like to do with the '${report.name}' report?`,
        timestamp: new Date(),
        showViewReportOptions: {
          itemId: report.id,
          itemName: report.name,
          itemType: 'report',
          entityName,
          roleName,
          currentPermission: report.permission,
        },
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 500)
  }

  const handleViewReportOptionClick = (option: { id: string; title: string; description: string }) => {
    if (!viewReportForPermissionChange) return

    // Mark this option as selected
    setSelectedViewReportOption(option.id)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: option.title,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    if (option.id === 'change-permission') {
      // Show permission level chips for view/report
      const currentPermLabel = formatPermissionLevel(viewReportForPermissionChange.currentPermission)
      const itemTypeLabel = viewReportForPermissionChange.itemType === 'view' ? 'view' : 'report'
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Current permission for '${viewReportForPermissionChange.itemName}' ${itemTypeLabel} is '${currentPermLabel}'. Select a new permission level:`,
          timestamp: new Date(),
          showPermissionLevelChips: {
            entityId: viewReportForPermissionChange.itemId,
            entityName: viewReportForPermissionChange.itemName,
            roleName: viewReportForPermissionChange.roleName,
            currentPermission: viewReportForPermissionChange.currentPermission,
          },
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    } else {
      // Show coming soon response for modify option
      const itemTypeLabel = viewReportForPermissionChange.itemType === 'view' ? 'view' : 'report'
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Modify ${itemTypeLabel} feature is coming soon!`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isExpanded
          ? "w-[320px] ml-2 mr-2 rounded-t-[8px] p-[1px] overflow-hidden"
          : "w-11 flex-shrink-0"
      )}
      style={isExpanded ? {
        background: 'linear-gradient(135deg, #F0C0E1 0%, #CFCFF3 100%)',
      } : undefined}
    >
      <div className={cn(
        "flex flex-col overflow-hidden h-full",
        isExpanded && "bg-white rounded-t-[7px]"
      )}>

      {/* Header / Collapsed Icon */}
      {isExpanded ? (
        <div
          className="flex-shrink-0 py-3 px-4 border-b cursor-pointer"
          style={{ borderColor: '#E0C8DC' }}
          onClick={() => setIsExpanded(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.19688 22.0707L2.81868 34.5322C2.55321 35.2878 1.72546 35.6851 0.969847 35.4197C0.214238 35.1542 -0.183094 34.3264 0.0823803 33.5708L4.46058 21.1094C5.3631 18.5406 8.98821 18.5188 9.92146 21.0766L14.4742 33.5545C14.7487 34.3068 14.3613 35.1393 13.6089 35.4138C12.8565 35.6883 12.0241 35.3009 11.7496 34.5486L7.19688 22.0707Z" fill="#a855f7"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.98084 30.089C1.98084 29.2881 2.63008 28.6388 3.43097 28.6388H11.1318C11.9327 28.6388 12.582 29.2881 12.582 30.089C12.582 30.8898 11.9327 31.5391 11.1318 31.5391H3.43097C2.63008 31.5391 1.98084 30.8898 1.98084 30.089Z" fill="#a855f7"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.0518 18.2953C19.8527 18.2953 20.5019 18.9445 20.5019 19.7454V34.047C20.5019 34.8479 19.8527 35.4971 19.0518 35.4971C18.2509 35.4971 17.6017 34.8479 17.6017 34.047V19.7454C17.6017 18.9445 18.2509 18.2953 19.0518 18.2953Z" fill="#a855f7"/>
                <path d="M31.8789 10.2327C32.0494 9.44346 33.1753 9.44346 33.3457 10.2327L33.697 11.8591C34.2468 14.4048 36.2517 16.3835 38.8045 16.8998L39.3985 17.02C40.2006 17.1822 40.2006 18.3286 39.3985 18.4908L38.6917 18.6338C36.1966 19.1384 34.2194 21.0421 33.6205 23.5162L33.3416 24.6685C33.1564 25.4336 32.0683 25.4336 31.8831 24.6685L31.6041 23.5163C31.0053 21.0421 29.028 19.1384 26.5329 18.6338L25.8262 18.4908C25.0241 18.3286 25.0241 17.1822 25.8262 17.02L26.4202 16.8998C28.9729 16.3835 30.9778 14.4048 31.5277 11.8591L31.8789 10.2327Z" fill="#22c55e"/>
                <path d="M17.8046 5.03628C17.974 4.31851 18.9956 4.31851 19.1649 5.03628C19.635 7.02823 21.1903 8.58353 23.1822 9.05357C23.9 9.22295 23.9 10.2445 23.1822 10.4139C21.1903 10.8839 19.635 12.4392 19.1649 14.4312C18.9956 15.1489 17.974 15.1489 17.8046 14.4312C17.3346 12.4392 15.7793 10.8839 13.7874 10.4139C13.0696 10.2445 13.0696 9.22295 13.7874 9.05357C15.7793 8.58353 17.3346 7.02823 17.8046 5.03628Z" fill="#ec4899"/>
              </svg>
              <h2 className="text-[12px] font-semibold text-gray-900">App Copilot</h2>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-7 h-7 rounded-md bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-purple-600" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      {isExpanded && (
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pt-2">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'user' ? (
              // User message - with optional disabled sub-actions card
              <div className="space-y-2">
                {/* Disabled Sub-Actions Card (shows what options were available) */}
                {message.showDisabledSubActions && (
                  <div className="space-y-2">
                    {/* Header with category icon and title */}
                    <div className="flex items-center gap-1 ml-1">
                      {(() => {
                        const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[message.showDisabledSubActions.categoryIconName]
                        return IconComponent ? (
                          <IconComponent className={cn('w-3 h-3', message.showDisabledSubActions.categoryIconColor)} />
                        ) : null
                      })()}
                      <h4 className="text-[12px] font-semibold text-gray-900">
                        {message.showDisabledSubActions.categoryTitle}
                      </h4>
                    </div>

                    {/* Sub-actions list (all disabled, selected one highlighted) */}
                    <div className="space-y-1.5">
                      {message.showDisabledSubActions.subActions.map((subAction) => {
                        const isSelected = message.showDisabledSubActions!.selectedActionId === subAction.id
                        return (
                          <div
                            key={subAction.id}
                            className={cn(
                              "rounded-lg px-3 py-2.5 border",
                              isSelected
                                ? "bg-purple-50 border-purple-100"
                                : "bg-gray-100 border-gray-200"
                            )}
                          >
                            <span className={cn(
                              "text-[12px] font-medium",
                              isSelected ? "text-purple-400" : "text-gray-600"
                            )}>
                              {subAction.title}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* User message - avatar on top, message below (right aligned) */}
                <div className="flex flex-col items-end space-y-1 mt-4">
                  {/* User Avatar */}
                  <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-orange-500">SS</span>
                  </div>
                  {/* Message text */}
                  <div className="bg-gray-200 px-3 py-1.5 rounded-lg text-[12px] text-gray-900">
                    {message.content}
                  </div>
                </div>
              </div>
            ) : (
              // Assistant message
              <div className="space-y-3">
                {/* App Creation Success Card */}
                {message.showAppCard ? (
                  <div className="space-y-2">
                    {/* AI Avatar */}
                    <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
                    </div>

                    {/* Combined App Success Card - Green Theme */}
                    <div className="rounded-lg border border-green-200 bg-green-50 overflow-hidden">
                      <div className="px-3 py-3">
                        {/* Success Icon and Title Row */}
                        <div className="flex items-center gap-2">
                          <IconCircleCheckFilled className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-[13px] font-semibold text-green-700">App Created Successfully</span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-gray-700 leading-relaxed mt-2">
                          Your app "{appName}" is ready — {appDescription || 'start by setting up roles, data entities, and user interfaces to customize your application.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* Regular AI Icon for non-success messages */}
                    <div className="w-6 h-6 rounded-full border border-purple-200 bg-purple-50 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
                    </div>

                    {/* Message text */}
                    <div className="text-[12px] text-gray-900 whitespace-pre-line leading-relaxed p-1">
                      {message.content}
                    </div>

                    {/* Sub Actions */}
                    {message.showSubActions && message.showSubActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.showSubActions.map((subAction) => (
                          <button
                            key={subAction.id}
                            onClick={() => handleSubActionClick(subAction)}
                            className="px-3 py-1.5 text-[11px] font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                          >
                            {subAction.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Permission Options */}
                    {message.showPermissionOptions && (
                      <div className="space-y-1.5 mt-2">
                        {PERMISSION_OPTIONS.map((option) => {
                          const isSelected = selectedPermissionOption === option.id
                          const isDisabled = selectedPermissionOption !== null && !isSelected

                          return (
                            <button
                              key={option.id}
                              onClick={() => !selectedPermissionOption && handlePermissionOptionClick(option)}
                              disabled={selectedPermissionOption !== null}
                              className={cn(
                                "w-full text-left rounded-lg px-3 py-2 transition-all",
                                isSelected
                                  ? "bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "bg-gray-100 border border-gray-200 cursor-default"
                                    : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {option.title}
                                </h4>
                                <p className={cn(
                                  "text-[11px]",
                                  isSelected ? "text-purple-300" : isDisabled ? "text-gray-500" : "text-gray-700"
                                )}>
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Existing Roles Selection */}
                    {message.showExistingRoles && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EXISTING_ROLES.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleExistingRoleClick(role)}
                            className="px-3 py-1.5 text-[11px] font-medium text-gray-900 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                          >
                            {role.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Role Chips for Modification */}
                    {message.showRoleChips && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EXISTING_ROLES.map((role) => {
                          const isSelected = selectedRoleToModify === role.id
                          const isDisabled = selectedRoleToModify !== null && !isSelected

                          return (
                            <button
                              key={role.id}
                              onClick={() => !selectedRoleToModify && handleRoleToModifyClick(role)}
                              disabled={selectedRoleToModify !== null}
                              className={cn(
                                "px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors",
                                isSelected
                                  ? "text-purple-400 bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-default"
                                    : "text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              {role.name}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Role Chips for Duplication */}
                    {message.showRoleChipsForDuplicate && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EXISTING_ROLES.map((role) => {
                          const isSelected = selectedRoleToDuplicate === role.id
                          const isDisabled = selectedRoleToDuplicate !== null && !isSelected

                          return (
                            <button
                              key={role.id}
                              onClick={() => !selectedRoleToDuplicate && handleRoleToDuplicateClick(role)}
                              disabled={selectedRoleToDuplicate !== null}
                              className={cn(
                                "px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors",
                                isSelected
                                  ? "text-purple-400 bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-default"
                                    : "text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              {role.name}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Modification Options */}
                    {message.showModificationOptions && (
                      <div className="space-y-1.5 mt-2">
                        {MODIFICATION_OPTIONS.map((option) => {
                          const isSelected = selectedModificationOption === option.id
                          const isDisabled = selectedModificationOption !== null && !isSelected

                          return (
                            <button
                              key={option.id}
                              onClick={() => !selectedModificationOption && handleModificationOptionClick(option)}
                              disabled={selectedModificationOption !== null}
                              className={cn(
                                "w-full text-left rounded-lg px-3 py-2 transition-all",
                                isSelected
                                  ? "bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "bg-gray-100 border border-gray-200 cursor-default"
                                    : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {option.title}
                                </h4>
                                <p className={cn(
                                  "text-[11px]",
                                  isSelected ? "text-purple-300" : isDisabled ? "text-gray-500" : "text-gray-700"
                                )}>
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Permission Change Chips */}
                    {message.showPermissionChangeChips && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PERMISSION_CHANGE_OPTIONS.map((chipOption) => {
                          const isSelected = selectedPermissionChangeOption === chipOption.id
                          const isDisabled = selectedPermissionChangeOption !== null && !isSelected

                          return (
                            <button
                              key={chipOption.id}
                              onClick={() => !selectedPermissionChangeOption && handlePermissionChangeChipClick(chipOption)}
                              disabled={selectedPermissionChangeOption !== null}
                              className={cn(
                                "px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors",
                                isSelected
                                  ? "text-purple-400 bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-default"
                                    : "text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              {chipOption.title}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Role Success Card */}
                    {message.showRoleSuccess && (
                      <div className="space-y-2 mt-1">
                        {/* Success Message */}
                        <p className="text-[12px] text-gray-900 p-1">
                          New role created successfully!
                        </p>

                        {/* Role Card */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="px-3 py-3">
                            {/* Role Name with checkmark */}
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-semibold text-gray-900">
                                {message.showRoleSuccess.roleName}
                              </span>
                            </div>

                            {/* Permission Description */}
                            <p className="text-[11px] text-gray-600 mt-1.5 ml-6">
                              {message.showRoleSuccess.duplicatedFrom
                                ? `Permissions duplicated from ${message.showRoleSuccess.duplicatedFrom}`
                                : message.showRoleSuccess.permissionType
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Role Rename Success Card */}
                    {message.showRoleRenameSuccess && (
                      <div className="space-y-2 mt-1">
                        {/* Success Message */}
                        <p className="text-[12px] text-gray-900 p-1">
                          Role renamed successfully!
                        </p>

                        {/* Rename Card */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="px-3 py-3">
                            {/* New Role Name with checkmark */}
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-semibold text-gray-900">
                                {message.showRoleRenameSuccess.newName}
                              </span>
                            </div>

                            {/* Previous name */}
                            <p className="text-[11px] text-gray-600 mt-1.5 ml-6">
                              Previously: {message.showRoleRenameSuccess.oldName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Permission Change Success Card */}
                    {message.showPermissionChangeSuccess && (
                      <div className="space-y-2 mt-1">
                        {/* Success Message */}
                        <p className="text-[12px] text-gray-900 p-1">
                          Permissions updated successfully!
                        </p>

                        {/* Permission Change Card */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="px-3 py-3">
                            {/* Role Name with checkmark */}
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-semibold text-gray-900">
                                {message.showPermissionChangeSuccess.roleName}
                              </span>
                            </div>

                            {/* Change description */}
                            <p className="text-[11px] text-gray-600 mt-1.5 ml-6">
                              {message.showPermissionChangeSuccess.changeDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duplicate Role Success Card */}
                    {message.showDuplicateRoleSuccess && (
                      <div className="space-y-2 mt-1">
                        {/* Success Message */}
                        <p className="text-[12px] text-gray-900 p-1">
                          Role duplicated successfully!
                        </p>

                        {/* Duplicate Role Card */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="px-3 py-3">
                            {/* New Role Name with checkmark */}
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-semibold text-gray-900">
                                {message.showDuplicateRoleSuccess.newRoleName}
                              </span>
                            </div>

                            {/* Duplicated from */}
                            <p className="text-[11px] text-gray-600 mt-1.5 ml-6">
                              Duplicated from: {message.showDuplicateRoleSuccess.duplicatedFrom}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* All Roles List (View all roles flow) */}
                    {message.showAllRolesList && (
                      <div className="space-y-1.5 mt-2 max-h-[260px] overflow-y-auto">
                        {EXISTING_ROLES.map((role) => {
                          const isSelected = selectedRoleFromList === role.id
                          const isDisabled = selectedRoleFromList !== null && !isSelected

                          return (
                            <button
                              key={role.id}
                              onClick={() => !selectedRoleFromList && handleRoleFromListClick(role)}
                              disabled={selectedRoleFromList !== null}
                              className={cn(
                                "w-full text-left rounded-lg px-3 py-2 transition-all",
                                isSelected
                                  ? "bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "bg-gray-100 border border-gray-200 cursor-default"
                                    : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              {/* Role info - same style as Quick start options but without icon */}
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {role.name}
                                </h4>
                                <p className={cn(
                                  "text-[11px]",
                                  isSelected ? "text-purple-300" : isDisabled ? "text-gray-500" : "text-gray-700"
                                )}>
                                  {role.description}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Role Context Actions (after selecting a role from View all roles) */}
                    {message.showRoleContextActions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ROLE_CONTEXT_ACTIONS.map((action) => {
                          const isSelected = selectedRoleContextAction === action.id
                          const isDisabled = selectedRoleContextAction !== null && !isSelected

                          return (
                            <button
                              key={action.id}
                              onClick={() => !selectedRoleContextAction && handleRoleContextActionClick(action)}
                              disabled={selectedRoleContextAction !== null}
                              className={cn(
                                "px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors",
                                isSelected
                                  ? "text-purple-400 bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-default"
                                    : "text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              {action.title}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Permissions Table (Show permissions flow) */}
                    {message.showPermissionsTable && (
                      <div className="mt-2 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex-1 text-[10px] font-medium text-gray-500 uppercase tracking-wide">Data Entity</div>
                          <div className="w-24 text-[10px] font-medium text-gray-500 uppercase tracking-wide text-center">Permission</div>
                        </div>
                        {/* Table Rows - max 8 visible, rest scrollable */}
                        <div className="max-h-[288px] overflow-y-auto">
                          {message.showPermissionsTable.permissions.map((perm) => {
                            const typeConfig = ENTITY_TYPE_CONFIG[perm.entityType]
                            const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[typeConfig.icon]
                            const isSelected = selectedDataEntity === perm.entityId
                            const isDisabled = selectedDataEntity !== null && !isSelected
                            return (
                              <button
                                key={perm.entityId}
                                onClick={() => !selectedDataEntity && handleDataEntityClick(
                                  perm.entityId,
                                  perm.entityName,
                                  perm.entityType,
                                  message.showPermissionsTable!.roleName,
                                  perm.permissionLevel
                                )}
                                disabled={selectedDataEntity !== null}
                                className={cn(
                                  "w-full flex items-center px-3 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors text-left",
                                  isSelected
                                    ? "bg-purple-50"
                                    : isDisabled
                                      ? "bg-gray-50 opacity-60"
                                      : "hover:bg-gray-50 cursor-pointer"
                                )}
                              >
                                {/* Entity column with icon */}
                                <div className="flex-1 flex items-center gap-2">
                                  {IconComponent && (
                                    <IconComponent className="w-4 h-4" style={{ color: typeConfig.color }} />
                                  )}
                                  <span className={cn(
                                    "text-[12px]",
                                    isSelected ? "text-purple-600 font-medium" : "text-gray-900"
                                  )}>{perm.entityName}</span>
                                </div>
                                {/* Permission column */}
                                <div className="w-24 text-center">
                                  <span className={cn("text-[11px] font-medium", getPermissionColor(perm.permissionLevel))}>
                                    {formatPermissionLevel(perm.permissionLevel)}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Data Entity Options (shown when clicking a data entity) */}
                    {message.showDataEntityOptions && (
                      <div className="space-y-2 mt-2">
                        {getDataEntityOptions(message.showDataEntityOptions.entityType).map((option) => {
                          const isSelected = selectedDataEntityOption === option.id
                          const isDisabled = selectedDataEntityOption !== null && !isSelected
                          return (
                            <button
                              key={option.id}
                              onClick={() => !selectedDataEntityOption && handleDataEntityOptionClick(option)}
                              disabled={selectedDataEntityOption !== null}
                              className={cn(
                                "w-full text-left rounded-lg px-3 py-2 transition-all",
                                isSelected
                                  ? "bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "bg-gray-100 border border-gray-200 cursor-default"
                                    : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {option.title}
                                </h4>
                                <p className={cn(
                                  "text-[11px]",
                                  isSelected ? "text-purple-300" : isDisabled ? "text-gray-500" : "text-gray-700"
                                )}>
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Permission Level Chips (shown when modifying entity permission) */}
                    {message.showPermissionLevelChips && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PERMISSION_LEVEL_CHIPS
                          .filter((level) => level.id !== message.showPermissionLevelChips!.currentPermission)
                          .map((level) => {
                            const isSelected = selectedPermissionLevel === level.id
                            const isDisabled = selectedPermissionLevel !== null && !isSelected

                            return (
                              <button
                                key={level.id}
                                onClick={() => !selectedPermissionLevel && handlePermissionLevelChipClick(level)}
                                disabled={selectedPermissionLevel !== null}
                                className={cn(
                                  "px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors",
                                  isSelected
                                    ? "text-purple-400 bg-purple-50 border border-purple-100 cursor-default"
                                    : isDisabled
                                      ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-default"
                                      : "text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                )}
                              >
                                {level.title}
                              </button>
                            )
                          })}
                      </div>
                    )}

                    {/* Views Table (shown when clicking Views permission) */}
                    {message.showViewsTable && (
                      <div className="mt-2 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex-1 text-[10px] font-medium text-gray-500 uppercase tracking-wide">View</div>
                          <div className="w-20 text-[10px] font-medium text-gray-500 uppercase tracking-wide text-center">Type</div>
                          <div className="w-24 text-[10px] font-medium text-gray-500 uppercase tracking-wide text-center">Permission</div>
                        </div>
                        {/* Table Rows */}
                        <div className="max-h-[200px] overflow-y-auto">
                          {message.showViewsTable.views.map((view) => {
                            const isSelected = selectedViewOrReport === view.id
                            const isDisabled = selectedViewOrReport !== null && !isSelected
                            return (
                              <button
                                key={view.id}
                                onClick={() => !selectedViewOrReport && handleViewClick(
                                  view,
                                  message.showViewsTable!.entityName,
                                  message.showViewsTable!.roleName
                                )}
                                disabled={selectedViewOrReport !== null}
                                className={cn(
                                  "w-full flex items-center px-3 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors text-left",
                                  isSelected
                                    ? "bg-purple-50"
                                    : isDisabled
                                      ? "bg-gray-50 opacity-60"
                                      : "hover:bg-gray-50 cursor-pointer"
                                )}
                              >
                                <div className="flex-1">
                                  <span className={cn(
                                    "text-[12px]",
                                    isSelected ? "text-purple-600 font-medium" : "text-gray-900"
                                  )}>{view.name}</span>
                                </div>
                                <div className="w-20 text-center">
                                  <span className="text-[11px] text-gray-500 capitalize">{view.type}</span>
                                </div>
                                <div className="w-24 text-center">
                                  <span className={cn("text-[11px] font-medium", getPermissionColor(view.permission))}>
                                    {formatPermissionLevel(view.permission)}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Reports Table (shown when clicking Reports permission) */}
                    {message.showReportsTable && (
                      <div className="mt-2 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex-1 text-[10px] font-medium text-gray-500 uppercase tracking-wide">Report</div>
                          <div className="w-24 text-[10px] font-medium text-gray-500 uppercase tracking-wide text-center">Permission</div>
                        </div>
                        {/* Table Rows */}
                        <div className="max-h-[200px] overflow-y-auto">
                          {message.showReportsTable.reports.map((report) => {
                            const isSelected = selectedViewOrReport === report.id
                            const isDisabled = selectedViewOrReport !== null && !isSelected
                            return (
                              <button
                                key={report.id}
                                onClick={() => !selectedViewOrReport && handleReportClick(
                                  report,
                                  message.showReportsTable!.entityName,
                                  message.showReportsTable!.roleName
                                )}
                                disabled={selectedViewOrReport !== null}
                                className={cn(
                                  "w-full flex items-center px-3 py-2.5 border-b border-gray-100 last:border-b-0 transition-colors text-left",
                                  isSelected
                                    ? "bg-purple-50"
                                    : isDisabled
                                      ? "bg-gray-50 opacity-60"
                                      : "hover:bg-gray-50 cursor-pointer"
                                )}
                              >
                                <div className="flex-1">
                                  <span className={cn(
                                    "text-[12px]",
                                    isSelected ? "text-purple-600 font-medium" : "text-gray-900"
                                  )}>{report.name}</span>
                                </div>
                                <div className="w-24 text-center">
                                  <span className={cn("text-[11px] font-medium", getPermissionColor(report.permission))}>
                                    {formatPermissionLevel(report.permission)}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* View/Report Options (shown when clicking a view or report) */}
                    {message.showViewReportOptions && (
                      <div className="space-y-2 mt-2">
                        {VIEW_REPORT_OPTIONS.map((option) => {
                          const isSelected = selectedViewReportOption === option.id
                          const isDisabled = selectedViewReportOption !== null && !isSelected
                          return (
                            <button
                              key={option.id}
                              onClick={() => !selectedViewReportOption && handleViewReportOptionClick(option)}
                              disabled={selectedViewReportOption !== null}
                              className={cn(
                                "w-full text-left rounded-lg px-3 py-2 transition-all",
                                isSelected
                                  ? "bg-purple-50 border border-purple-100 cursor-default"
                                  : isDisabled
                                    ? "bg-gray-100 border border-gray-200 cursor-default"
                                    : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {option.title}
                                </h4>
                                <p className={cn(
                                  "text-[11px]",
                                  isSelected ? "text-purple-300" : isDisabled ? "text-gray-500" : "text-gray-700"
                                )}>
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Suggested Roles List (in message thread - read-only) */}
                    {message.showSuggestedRoles && message.showSuggestedRoles.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.showSuggestedRoles.map((role) => (
                          <div
                            key={role.id}
                            className={cn(
                              "border rounded-lg px-3 py-2.5",
                              role.selected
                                ? "border-purple-300 bg-purple-50/50"
                                : "border-gray-200 bg-gray-50 opacity-60"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {/* Checkbox indicator (read-only) */}
                              <div className={cn(
                                "w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0",
                                role.selected
                                  ? "bg-purple-500 border-purple-500"
                                  : "border-gray-300 bg-white"
                              )}>
                                {role.selected && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              {/* Role info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[12px] font-medium text-gray-900">
                                  {role.name}
                                </h4>
                                <p className="text-[11px] text-gray-700 mt-0.5">
                                  {role.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Added Roles Success Card */}
                    {message.showAddedRoles && (
                      <div className="space-y-2 mt-1">
                        {/* Success Message */}
                        <p className="text-[12px] text-gray-900 p-1">
                          {message.showAddedRoles.selectedRoles.length} role{message.showAddedRoles.selectedRoles.length > 1 ? 's' : ''} added successfully!
                        </p>

                        {/* Roles Cards */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="px-3 py-3 space-y-2">
                            {message.showAddedRoles.selectedRoles.map((roleName, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[12px] font-semibold text-gray-900">
                                  {roleName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                                      </div>
                )}

                {/* Suggestions - Quick start Section with Drill-through */}
                {message.showSuggestions && !completedAction && (
                  <div className="space-y-2 mt-5">
                    {/* Drill-through View */}
                    {drillThroughCategory && currentDrillThrough ? (
                      <>
                        {/* Header: Category Title on left, Back Button on right (back hidden during active flow) */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 ml-1">
                            <currentDrillThrough.icon className={cn('w-3 h-3', currentDrillThrough.iconColor)} />
                            <h4 className="text-[12px] font-semibold text-gray-900">
                              {currentDrillThrough.title === 'Role' ? 'Roles & Permission' : currentDrillThrough.title}
                            </h4>
                          </div>
                          {/* Back button - hidden during active suggest roles flow */}
                          {!showSuggestRolesFlow && !completedAction && (
                            <button
                              onClick={handleBackToQuickStart}
                              className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Back</span>
                            </button>
                          )}
                        </div>

                        {/* Sub-actions - show with disabled/selected state when action is completed */}
                        <div className="space-y-1.5 mt-2">
                          {currentDrillThrough.subActions?.map((subAction) => {
                            const isSelected = completedAction === subAction.id
                            const isDisabled = completedAction !== null && !isSelected

                            return (
                              <button
                                key={subAction.id}
                                onClick={() => !completedAction && handleSubActionClick(subAction)}
                                disabled={completedAction !== null}
                                className={cn(
                                  "w-full text-left rounded-lg px-3 py-2.5 transition-all",
                                  isSelected
                                    ? "bg-purple-50 border border-purple-100 cursor-default"
                                    : isDisabled
                                      ? "bg-gray-100 border border-gray-200 cursor-default"
                                      : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                )}
                              >
                                <span className={cn(
                                  "text-[12px] font-medium",
                                  isSelected ? "text-purple-400" : isDisabled ? "text-gray-600" : "text-gray-900"
                                )}>
                                  {subAction.title}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Main Quick start Options */}
                        <div className="flex items-center gap-1 ml-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <p className="text-[12px] text-gray-900 font-semibold">
                            Quick start
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          {SUGGESTION_ACTIONS.map((suggestion) => {
                            const Icon = suggestion.icon
                            return (
                              <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  {/* Icon */}
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0',
                                      suggestion.iconBg
                                    )}
                                  >
                                    <Icon className={cn('w-3 h-3', suggestion.iconColor)} />
                                  </div>
                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-medium text-gray-900">
                                      {suggestion.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-700">
                                      {suggestion.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="space-y-2">
            <div className="w-6 h-6 rounded-full border border-purple-200 bg-purple-50 flex items-center justify-center">
              <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Suggest Roles Flow */}
        {showSuggestRolesFlow && (
          <div className="space-y-2">
            {/* AI Avatar */}
            <div className="w-6 h-6 rounded-full border border-purple-200 bg-purple-50 flex items-center justify-center">
              <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
            </div>

            {isScanningRoles ? (
              // Scanning loading state
              <div className="space-y-2">
                <p className="text-[12px] text-gray-900 p-1">Scanning your app to suggest roles...</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              // Suggested roles list
              <div className="space-y-3">
                <p className="text-[12px] text-gray-900 p-1 leading-relaxed">
                  I scanned your app. Based on the data, access patterns, workflows and interface structure, here are roles worth adding:
                </p>

                {/* Roles list with checkboxes */}
                <div className="space-y-2">
                  {suggestedRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleToggleSuggestedRole(role.id)}
                      className={cn(
                        "w-full text-left border rounded-lg px-3 py-2.5 transition-all cursor-pointer",
                        role.selected
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className={cn(
                          "w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                          role.selected
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-300 bg-white"
                        )}>
                          {role.selected && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                        {/* Role info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-medium text-gray-900">
                            {role.name}
                          </h4>
                          <p className="text-[11px] text-gray-700 mt-0.5">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Cancel button */}
                  <button
                    onClick={handleCancelSuggestRoles}
                    className="flex-1 py-2 px-4 rounded-lg text-[12px] font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Submit button */}
                  <button
                    onClick={handleAddSelectedRoles}
                    disabled={!suggestedRoles.some(r => r.selected)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg text-[12px] font-medium transition-colors",
                      suggestedRoles.some(r => r.selected)
                        ? "bg-purple-500 text-white hover:bg-purple-600 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Add Selected Roles
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Input Area */}
      {isExpanded && (
      <div className="flex-shrink-0 mt-4 px-2 pb-2">
        <div
          className="rounded-[12px] p-[1px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #E58DC9 0%, #A8A8E9 100%)' }}
        >
          <div className="rounded-[11px] p-3 bg-white">
          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="w-full resize-none text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none min-h-[40px] max-h-[100px] bg-transparent"
            rows={1}
            disabled={isLoading}
          />

          {/* Bottom row with hint and buttons */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-700">Type '/' for referring datamodels</span>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-7 w-7 p-0 rounded-full disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #D341A5 0%, #6E6EDB 100%)' }}
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Button>
          </div>
        </div>
        </div>
      </div>
      )}
    </div>
    </div>
  )
}
