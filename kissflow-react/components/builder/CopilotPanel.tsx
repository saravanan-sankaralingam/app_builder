'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Bot, FileText, Database, Zap, Palette, Shield, Cable, Sparkles, ChevronLeft, ChevronRight, ChevronUp, Check, PartyPopper, Users, LayoutGrid, ArrowLeft, ArrowRight, CheckCircle, UserKey, Layout, Plug, Star, BarChart3, Box, Menu, GitBranch, Table, Trash2, AlertTriangle, CheckCircle2, CheckCheck, ArrowUpRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { IconCircleCheckFilled } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CopilotLoadingMessage, getLoadingConfig } from './copilot'
import { SlashCommandMenu } from './copilot/SlashCommandMenu'
import type { Artifact } from './copilot/artifactTypes'
import { ARTIFACT_TYPE_STYLES } from './copilot/artifactTypes'

interface CopilotPanelProps {
  appName: string
  appDescription?: string
  appIcon: string
  appIconBg: string
  onAddPageToPreview?: ((pageId: string, pageLabel: string) => void) | null
}

interface SubAction {
  id: string
  title: string
  prompt?: string
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

// Mock artifacts for slash command (converted from MOCK_DATA_ENTITIES + additional artifacts)
const MOCK_ARTIFACTS: Artifact[] = [
  // Role artifacts
  { id: 'admin-role', name: 'Admin', type: 'role' as const, category: 'role' as const, ...ARTIFACT_TYPE_STYLES.role },
  { id: 'manager-role', name: 'Manager', type: 'role' as const, category: 'role' as const, ...ARTIFACT_TYPE_STYLES.role },
  { id: 'employee-role', name: 'Employee', type: 'role' as const, category: 'role' as const, ...ARTIFACT_TYPE_STYLES.role },
  { id: 'viewer-role', name: 'Viewer', type: 'role' as const, category: 'role' as const, ...ARTIFACT_TYPE_STYLES.role },

  // Dataform artifacts (10+ items)
  { id: 'employee-directory', name: 'Employee Directory', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'asset-inventory', name: 'Asset Inventory', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'customer-feedback', name: 'Customer Feedback', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'vendor-list', name: 'Vendor List', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'product-catalog', name: 'Product Catalog', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'contact-database', name: 'Contact Database', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'location-directory', name: 'Location Directory', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'department-list', name: 'Department List', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'skill-matrix', name: 'Skill Matrix', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },
  { id: 'equipment-register', name: 'Equipment Register', type: 'dataform' as const, category: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.dataform },

  // Board artifacts (10+ items)
  { id: 'leave-request', name: 'Leave Request', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'project-tracker', name: 'Project Tracker', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'timesheet', name: 'Timesheet', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'training-requests', name: 'Training Requests', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'bug-tracker', name: 'Bug Tracker', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'feature-requests', name: 'Feature Requests', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'task-board', name: 'Task Board', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'sprint-board', name: 'Sprint Board', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'support-tickets', name: 'Support Tickets', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },
  { id: 'recruitment-pipeline', name: 'Recruitment Pipeline', type: 'board' as const, category: 'board' as const, ...ARTIFACT_TYPE_STYLES.board },

  // Process artifacts (10+ items)
  { id: 'expense-report', name: 'Expense Report', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'invoice-approval', name: 'Invoice Approval', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'vendor-onboarding', name: 'Vendor Onboarding', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'purchase-order', name: 'Purchase Order', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'travel-request', name: 'Travel Request', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'contract-approval', name: 'Contract Approval', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'employee-onboarding', name: 'Employee Onboarding', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'change-request', name: 'Change Request', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'asset-request', name: 'Asset Request', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'reimbursement', name: 'Reimbursement', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },
  { id: 'it-support', name: 'IT Support', type: 'process' as const, category: 'process' as const, ...ARTIFACT_TYPE_STYLES.process },

  // View artifacts (with parent references)
  // Leave Request (board) - views
  { id: 'leave-table', name: 'All Requests', type: 'datatable' as const, category: 'view' as const, parentId: 'leave-request', parentName: 'Leave Request', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'leave-kanban', name: 'By Status', type: 'datatable' as const, category: 'view' as const, parentId: 'leave-request', parentName: 'Leave Request', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'leave-calendar', name: 'Calendar View', type: 'datatable' as const, category: 'view' as const, parentId: 'leave-request', parentName: 'Leave Request', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },

  // Employee Directory (dataform) - views
  { id: 'emp-table', name: 'Employee List', type: 'datatable' as const, category: 'view' as const, parentId: 'employee-directory', parentName: 'Employee Directory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'emp-gallery', name: 'Photo Directory', type: 'gallery' as const, category: 'view' as const, parentId: 'employee-directory', parentName: 'Employee Directory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.gallery },

  // Project Tracker (board) - views
  { id: 'proj-table', name: 'All Projects', type: 'datatable' as const, category: 'view' as const, parentId: 'project-tracker', parentName: 'Project Tracker', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'proj-kanban', name: 'Project Board', type: 'datatable' as const, category: 'view' as const, parentId: 'project-tracker', parentName: 'Project Tracker', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },

  // Asset Inventory (dataform) - views
  { id: 'asset-table', name: 'Asset List', type: 'datatable' as const, category: 'view' as const, parentId: 'asset-inventory', parentName: 'Asset Inventory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'asset-gallery-view', name: 'Asset Gallery', type: 'gallery' as const, category: 'view' as const, parentId: 'asset-inventory', parentName: 'Asset Inventory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.gallery },

  // Timesheet (board) - views
  { id: 'time-table', name: 'Timesheet Entries', type: 'datatable' as const, category: 'view' as const, parentId: 'timesheet', parentName: 'Timesheet', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'time-calendar', name: 'Calendar View', type: 'datatable' as const, category: 'view' as const, parentId: 'timesheet', parentName: 'Timesheet', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },

  // Training Requests (board) - views
  { id: 'train-table', name: 'All Requests', type: 'datatable' as const, category: 'view' as const, parentId: 'training-requests', parentName: 'Training Requests', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'train-kanban', name: 'By Status', type: 'datatable' as const, category: 'view' as const, parentId: 'training-requests', parentName: 'Training Requests', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES.datatable },

  // Customer Feedback (dataform) - views
  { id: 'feedback-table', name: 'All Feedback', type: 'datatable' as const, category: 'view' as const, parentId: 'customer-feedback', parentName: 'Customer Feedback', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.datatable },
  { id: 'feedback-gallery', name: 'Feedback Cards', type: 'gallery' as const, category: 'view' as const, parentId: 'customer-feedback', parentName: 'Customer Feedback', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES.gallery },

  // Report artifacts (with parent references)
  // Expense Report (process) - reports
  { id: 'exp-summary', name: 'Expense Summary', type: 'table-report' as const, category: 'report' as const, parentId: 'expense-report', parentName: 'Expense Report', parentType: 'process' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'exp-by-category', name: 'By Category', type: 'chart-report' as const, category: 'report' as const, parentId: 'expense-report', parentName: 'Expense Report', parentType: 'process' as const, ...ARTIFACT_TYPE_STYLES['chart-report'] },
  { id: 'exp-monthly', name: 'Monthly Trends', type: 'chart-report' as const, category: 'report' as const, parentId: 'expense-report', parentName: 'Expense Report', parentType: 'process' as const, ...ARTIFACT_TYPE_STYLES['chart-report'] },

  // Leave Request (board) - reports
  { id: 'leave-summary', name: 'Leave Summary', type: 'table-report' as const, category: 'report' as const, parentId: 'leave-request', parentName: 'Leave Request', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'leave-balance', name: 'Balance Report', type: 'table-report' as const, category: 'report' as const, parentId: 'leave-request', parentName: 'Leave Request', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },

  // Employee Directory (dataform) - reports
  { id: 'emp-headcount', name: 'Headcount Report', type: 'table-report' as const, category: 'report' as const, parentId: 'employee-directory', parentName: 'Employee Directory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'emp-dept', name: 'By Department', type: 'chart-report' as const, category: 'report' as const, parentId: 'employee-directory', parentName: 'Employee Directory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES['chart-report'] },

  // Project Tracker (board) - reports
  { id: 'proj-status', name: 'Project Status', type: 'table-report' as const, category: 'report' as const, parentId: 'project-tracker', parentName: 'Project Tracker', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'proj-timeline', name: 'Timeline Report', type: 'chart-report' as const, category: 'report' as const, parentId: 'project-tracker', parentName: 'Project Tracker', parentType: 'board' as const, ...ARTIFACT_TYPE_STYLES['chart-report'] },

  // Invoice Approval (process) - reports
  { id: 'inv-pending', name: 'Pending Approvals', type: 'table-report' as const, category: 'report' as const, parentId: 'invoice-approval', parentName: 'Invoice Approval', parentType: 'process' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'inv-monthly', name: 'Monthly Summary', type: 'table-report' as const, category: 'report' as const, parentId: 'invoice-approval', parentName: 'Invoice Approval', parentType: 'process' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },

  // Asset Inventory (dataform) - reports
  { id: 'asset-summary', name: 'Asset Summary', type: 'table-report' as const, category: 'report' as const, parentId: 'asset-inventory', parentName: 'Asset Inventory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES['table-report'] },
  { id: 'asset-depreciation', name: 'Depreciation Report', type: 'chart-report' as const, category: 'report' as const, parentId: 'asset-inventory', parentName: 'Asset Inventory', parentType: 'dataform' as const, ...ARTIFACT_TYPE_STYLES['chart-report'] },

  // Page artifacts
  { id: 'home-page', name: 'Home Page', type: 'page' as const, category: 'page' as const, ...ARTIFACT_TYPE_STYLES.page },
  { id: 'dashboard-page', name: 'Dashboard', type: 'page' as const, category: 'page' as const, ...ARTIFACT_TYPE_STYLES.page },
  { id: 'reports-page', name: 'Reports', type: 'page' as const, category: 'page' as const, ...ARTIFACT_TYPE_STYLES.page },
  { id: 'settings-page', name: 'Settings', type: 'page' as const, category: 'page' as const, ...ARTIFACT_TYPE_STYLES.page },

  // Navigation artifacts
  { id: 'main-nav', name: 'Main Navigation', type: 'navigation' as const, category: 'navigation' as const, ...ARTIFACT_TYPE_STYLES.navigation },
  { id: 'sidebar-nav', name: 'Sidebar Navigation', type: 'navigation' as const, category: 'navigation' as const, ...ARTIFACT_TYPE_STYLES.navigation },
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

type ConversationState = 'idle' | 'awaiting_role_name' | 'awaiting_permission_type' | 'awaiting_duplicate_role' | 'awaiting_custom_permission' | 'awaiting_new_role_name' | 'awaiting_permission_change' | 'awaiting_duplicated_role_name' | 'awaiting_role_delete_selection' | 'awaiting_delete_confirmation' | 'awaiting_page_description'

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
  showPageSuccess?: {
    pageName: string
    pageDescription: string
    pageId: string
  }
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
  // Delete role flow fields
  showAllRolesListForDeletion?: boolean
  showDeleteConfirmation?: {
    roleIds: string[]
    roleNames: string[]
  }
  showDeleteSuccess?: {
    deletedCount: number
    deletedRoles: string[]
  }
  // Loading state fields
  isLoading?: boolean
  loadingStages?: string[]
  loadingDuration?: number
  loadingStageDurations?: number[]
  loadingAnimation?: 'pulse' | 'spin' | 'morph' | 'none'
  loadingComplete?: boolean
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
      { id: 'delete-roles', title: 'Delete role(s)' },
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

export function CopilotPanel({ appName, appDescription, appIcon, appIconBg, onAddPageToPreview }: CopilotPanelProps) {
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
  const [drawerDrillThroughCategory, setDrawerDrillThroughCategory] = useState<string | null>(null)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuQuery, setSlashMenuQuery] = useState('')
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 })
  const [referencedArtifacts, setReferencedArtifacts] = useState<Artifact[]>([])
  const [suggestedRoles, setSuggestedRoles] = useState<SuggestedRole[]>([])
  const [suggestedRolesSubmitted, setSuggestedRolesSubmitted] = useState(false)
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
  const [selectedRolesToDelete, setSelectedRolesToDelete] = useState<string[]>([])
  const [pendingDeleteRoles, setPendingDeleteRoles] = useState<string[]>([])
  const [deleteRolesSubmitted, setDeleteRolesSubmitted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Get the current drill-through category details
  const currentDrillThrough = drillThroughCategory
    ? SUGGESTION_ACTIONS.find(s => s.id === drillThroughCategory)
    : null

  // Get the current drawer drill-through category details (separate from top Quick start)
  const currentDrawerDrillThrough = drawerDrillThroughCategory
    ? SUGGESTION_ACTIONS.find(s => s.id === drawerDrillThroughCategory)
    : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Track if user has sent any messages
  useEffect(() => {
    const hasUserMessage = messages.some(msg => msg.role === 'user')
    if (hasUserMessage && !hasUserInteracted) {
      setHasUserInteracted(true)
    }
  }, [messages, hasUserInteracted])

  // Reset drawer drill-through state when drawer is opened
  useEffect(() => {
    if (quickActionsOpen) {
      setDrawerDrillThroughCategory(null)
    }
  }, [quickActionsOpen])

  // Helper function to add assistant message with loading animation
  const addAssistantMessageWithLoading = (messageContent: Partial<ChatMessage>, duration: number = 4000) => {
    // Create loading message
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      loadingStages: ['Loading...'],
      loadingDuration: duration,
      loadingAnimation: 'pulse'
    }

    setMessages(prev => [...prev, loadingMsg])

    // After duration, update message with actual content
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === loadingMsg.id
          ? {
              ...msg,
              ...messageContent,
              isLoading: false,
              loadingComplete: true
            }
          : msg
      ))
    }, duration)

    return loadingMsg.id
  }

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

      addAssistantMessageWithLoading({
        content: `Great! How would you like to set up permissions for the '${text}' role?`,
        showPermissionOptions: true,
      })
      return
    }

    if (conversationState === 'awaiting_custom_permission') {
      // User provided custom permission description, create role
      setConversationState('idle')

      addAssistantMessageWithLoading({
        content: '',
        showRoleSuccess: {
          roleName: pendingRoleName,
          permissionType: 'Custom Permissions',
        },
      })
      setPendingRoleName('')
      return
    }

    if (conversationState === 'awaiting_new_role_name') {
      // User provided new role name, show success
      setConversationState('idle')
      const oldName = roleBeingRenamed || ''

      addAssistantMessageWithLoading({
        content: '',
        showRoleRenameSuccess: {
          oldName: oldName,
          newName: text,
        },
      })
      setRoleBeingRenamed(null)
      return
    }

    if (conversationState === 'awaiting_permission_change') {
      // User provided permission change description, show success
      setConversationState('idle')
      const roleName = roleForPermissionChange || ''

      addAssistantMessageWithLoading({
        content: '',
        showPermissionChangeSuccess: {
          roleName: roleName,
          changeDescription: text,
        },
      })
      setRoleForPermissionChange(null)
      return
    }

    if (conversationState === 'awaiting_duplicated_role_name') {
      // User provided new role name for duplication, show success
      setConversationState('idle')
      const originalRole = roleBeingDuplicated || ''

      addAssistantMessageWithLoading({
        content: '',
        showDuplicateRoleSuccess: {
          newRoleName: text,
          duplicatedFrom: originalRole,
        },
      })
      setRoleBeingDuplicated(null)
      return
    }

    if (conversationState === 'awaiting_page_description') {
      // User described the page, create it
      handlePageDescriptionInput(text)
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
          addAssistantMessageWithLoading({
            content: '',
            showRoleSuccess: {
              roleName: roleName,
              permissionType: 'Duplicated Permissions',
              duplicatedFrom: duplicateFrom,
            },
          })
          return
        } else if (permissionType === 'duplicate' && !duplicateFrom) {
          // Has name, wants to duplicate but didn't specify from which role
          setPendingRoleName(roleName)
          setConversationState('awaiting_duplicate_role')
          addAssistantMessageWithLoading({
            content: `I'll create the '${roleName}' role. Which role would you like to duplicate permissions from?`,
            showExistingRoles: true,
          })
          return
        } else if (permissionType === 'custom') {
          // Has name, wants custom permissions
          setPendingRoleName(roleName)
          setConversationState('awaiting_custom_permission')
          addAssistantMessageWithLoading({
            content: `I'll create the '${roleName}' role with custom permissions. Please describe the permissions you would like to set:`,
          })
          return
        } else {
          // Has name and simple permission type (all or none)
          setConversationState('idle')
          addAssistantMessageWithLoading({
            content: '',
            showRoleSuccess: {
              roleName: roleName,
              permissionType: permissionType === 'all' ? 'All Permissions' : 'No Permissions',
            },
          })
          return
        }
      }

      // Case 2: User provided only name, ask for permission
      if (roleName && !permissionType) {
        setPendingRoleName(roleName)
        setConversationState('awaiting_permission_type')
        addAssistantMessageWithLoading({
          content: `Great! How would you like to set up permissions for the '${roleName}' role?`,
          showPermissionOptions: true,
        })
        return
      }

      // Case 3: User wants to add role but didn't provide name
      if (!roleName) {
        setConversationState('awaiting_role_name')
        addAssistantMessageWithLoading({
          content: 'What would you like to name this role?',
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Detect "/" at start or after space
    const lastChar = value[value.length - 1]
    const beforeLastChar = value[value.length - 2]

    if (lastChar === '/' && (!beforeLastChar || beforeLastChar === ' ')) {
      // Calculate position for menu (above the input)
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setSlashMenuPosition({
          x: rect.left,
          y: rect.top
        })
      }
      setShowSlashMenu(true)
      setSlashMenuQuery('')
    } else if (showSlashMenu) {
      // Extract query after "/"
      const lastSlashIndex = value.lastIndexOf('/')
      const query = value.slice(lastSlashIndex + 1)

      // Close menu if space is typed after slash (user moved on)
      if (query.includes(' ')) {
        setShowSlashMenu(false)
        setSlashMenuQuery('')
      } else {
        setSlashMenuQuery(query)
      }
    }
  }

  const handleArtifactSelect = (artifact: Artifact) => {
    // Remove the "/" command from input
    const lastSlashIndex = input.lastIndexOf('/')
    const beforeSlash = input.slice(0, lastSlashIndex)

    // Insert artifact reference (plain text)
    const reference = artifact.name
    setInput(beforeSlash + reference + ' ')

    // Track referenced artifacts for highlighting
    setReferencedArtifacts(prev => {
      // Avoid duplicates
      if (prev.some(a => a.id === artifact.id)) {
        return prev
      }
      return [...prev, artifact]
    })

    // Close menu
    setShowSlashMenu(false)
    setSlashMenuQuery('')

    // Focus back on input
    inputRef.current?.focus()
  }

  const handleActionClick = (action: SuggestionAction) => {
    // Close quick actions
    setQuickActionsOpen(false)

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: action.title,
      timestamp: new Date(),
    }

    // Trigger drill-through (same logic as clicking action card)
    setMessages(prev => [...prev, userMessage])
    setDrillThroughCategory(action.id)

    // Add assistant response with sub-actions
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Great! What would you like to do with ${action.title.toLowerCase()}?`,
      timestamp: new Date(),
      showDisabledSubActions: {
        categoryTitle: action.title,
        categoryIconBg: action.iconBg,
        categoryIconColor: action.iconColor,
        categoryIconName: getIconName(action.icon),
        subActions: action.subActions || [],
        selectedActionId: '',
      },
    }

    setMessages(prev => [...prev, assistantMessage])
  }

  const getIconName = (icon: React.ComponentType<any>): string => {
    // Extract icon name from component
    return icon.displayName || icon.name || 'Folder'
  }

  const handleSubActionClick = (subAction: SubAction) => {
    // Mark this action as completed (for disabled state styling)
    setCompletedAction(subAction.id)

    // Collapse the Quick Actions drawer
    setQuickActionsOpen(false)

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
      // Reset submitted flag for new suggestion
      setSuggestedRolesSubmitted(false)

      const config = getLoadingConfig('suggest-roles')

      // Create loading message
      const loadingMsg: ChatMessage = {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
        loadingStages: config.stages,
        loadingDuration: config.duration,
        loadingStageDurations: config.stageDurations,
        loadingAnimation: config.animation
      }

      setMessages(prev => [...prev, loadingMsg])

      // Simulate AI processing (8 seconds)
      setTimeout(() => {
        const roles = MOCK_SUGGESTED_ROLES.map(role => ({ ...role, selected: false }))

        // Store roles in state for interactive selection
        setSuggestedRoles(roles)

        // Update message to show results
        setMessages(prev => prev.map(msg =>
          msg.id === loadingMsg.id
            ? {
                ...msg,
                loadingComplete: true,
                showSuggestedRoles: roles // Keep for display purposes
              }
            : msg
        ))
      }, config.duration)
      return
    }

    // Handle "Add Role" specially
    if (subAction.id === 'add-role') {
      setConversationState('awaiting_role_name')
      addAssistantMessageWithLoading({
        content: 'What would you like to name this role?',
      })
      return
    }

    // Handle "Modify role/permission" - show role chips
    if (subAction.id === 'modify-role-permission') {
      setSelectedRoleToModify(null)
      setSelectedModificationOption(null)
      addAssistantMessageWithLoading({
        content: 'Which role would you like to modify?',
        showRoleChips: true,
      })
      return
    }

    // Handle "Duplicate role" - show role chips for selection
    if (subAction.id === 'duplicate-role') {
      setSelectedRoleToDuplicate(null)
      setRoleBeingDuplicated(null)
      addAssistantMessageWithLoading({
        content: 'Which role would you like to duplicate?',
        showRoleChipsForDuplicate: true,
      })
      return
    }

    // Handle "View all roles" - show list of roles with descriptions
    if (subAction.id === 'view-all-roles') {
      setSelectedRoleFromList(null)
      setSelectedRoleContextAction(null)
      setRoleInContext(null)
      addAssistantMessageWithLoading({
        content: 'Here are all the roles in your app. Click on a role to see available actions:',
        showAllRolesList: true,
      })
      return
    }

    // Handle "Delete role(s)" - show list of roles with checkboxes for deletion
    if (subAction.id === 'delete-roles') {
      setSelectedRolesToDelete([])
      setPendingDeleteRoles([])
      setDeleteRolesSubmitted(false)
      setConversationState('awaiting_role_delete_selection')
      addAssistantMessageWithLoading({
        showAllRolesListForDeletion: true,
      }, 2000)
      return
    }

    // Handle "Add page" - prompt for description
    if (subAction.id === 'add-page') {
      setConversationState('awaiting_page_description')
      addAssistantMessageWithLoading({
        content: 'Describe the page you want to build.',
      })
      return
    }

    // Default response for other sub-actions
    addAssistantMessageWithLoading({
      content: `I'll help you ${subAction.title.toLowerCase()}. This feature is coming soon!`,
    })
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

    // Add user message showing what they selected
    const userSelectionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Add ${selectedRoleNames.join(', ')}`,
      timestamp: new Date(),
    }

    // Add success message showing what was added
    const successMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showAddedRoles: {
        selectedRoles: selectedRoleNames,
      },
    }

    // Mark as submitted (keep roles visible but disabled)
    setSuggestedRolesSubmitted(true)

    // Add messages to the thread (removed aiSuggestionMessage to avoid duplicate list)
    setMessages(prev => [...prev, userSelectionMessage, successMessage])
  }

  // Handler for drawer main action clicks (to drill through in drawer)
  const handleDrawerSuggestionClick = (action: SuggestionAction) => {
    // Set drill-through category for drawer (does NOT affect top Quick start)
    setDrawerDrillThroughCategory(action.id)
  }

  // Handler for drawer back button
  const handleDrawerBackToQuickActions = () => {
    setDrawerDrillThroughCategory(null)
  }

  // Handler for drawer sub-action clicks (separate from top Quick start)
  const handleDrawerSubActionClick = (subAction: SubAction) => {
    // Collapse the Quick Actions drawer
    setQuickActionsOpen(false)

    // Handle "Add page" - prompt for description (don't add user message yet)
    if (subAction.id === 'add-page') {
      setConversationState('awaiting_page_description')

      const promptMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Describe the page you want to build.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, promptMessage])
      return
    }

    // Add simple user message (no disabled sub-actions card)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: subAction.title,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    // Handle "Suggest roles" - show loading then AI suggestions
    if (subAction.id === 'suggest-roles') {
      // Reset submitted flag for new suggestion
      setSuggestedRolesSubmitted(false)

      const config = getLoadingConfig('suggest-roles')

      // Create loading message
      const loadingMsg: ChatMessage = {
        id: `loading-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
        loadingStages: config.stages,
        loadingDuration: config.duration,
        loadingStageDurations: config.stageDurations,
        loadingAnimation: config.animation
      }

      setMessages(prev => [...prev, loadingMsg])

      // Simulate AI processing
      setTimeout(() => {
        const roles = MOCK_SUGGESTED_ROLES.map(role => ({ ...role, selected: false }))

        // Store roles in state for interactive selection
        setSuggestedRoles(roles)

        // Update message to show results
        setMessages(prev => prev.map(msg =>
          msg.id === loadingMsg.id
            ? {
                ...msg,
                loadingComplete: true,
                showSuggestedRoles: roles
              }
            : msg
        ))
      }, config.duration)

      return
    }

    // Handle custom role creation
    if (subAction.id === 'custom-role') {
      handleSend(subAction.prompt!)
      return
    }

    // Handle all other actions - send to AI with prompt
    if (subAction.prompt) {
      handleSend(subAction.prompt)
    }
  }

  // Helper to extract page name from user description
  const extractPageNameFromDescription = (description: string): string => {
    // Try to find page name patterns
    const patterns = [
      /(?:a|an|the)\s+([a-z\s]+?)\s+page/i,
      /(?:create|build|make)\s+([a-z\s]+?)\s+page/i,
      /^([a-z\s]+?)$/i,
    ]

    for (const pattern of patterns) {
      const match = description.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    // Default: capitalize first letter of entire description
    return description.charAt(0).toUpperCase() + description.slice(1)
  }

  const handlePageDescriptionInput = (description: string) => {
    // Extract page name from description
    const pageName = extractPageNameFromDescription(description)

    // Generate page ID (lowercase, hyphenated)
    const pageId = pageName.toLowerCase().replace(/\s+/g, '-')

    // Add page to preview navigation
    if (onAddPageToPreview) {
      onAddPageToPreview(pageId, pageName)
    }

    // Reset conversation state
    setConversationState('idle')

    // Show success message
    const successMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showPageSuccess: {
        pageName: pageName,
        pageDescription: `Your ${pageName} page has been created and added to the navigation.`,
        pageId: pageId,
      },
    }

    setMessages(prev => [...prev, successMessage])
  }

  const handleCancelSuggestRoles = () => {
    // Reset suggested roles and submitted flag
    setSuggestedRoles([])
    setSuggestedRolesSubmitted(false)
    // Keep completedAction set - don't reset it
    // This keeps "Suggest roles" shown as selected/disabled

    // Add assistant message asking what to do next
    addAssistantMessageWithLoading({
      content: 'What would you like to do next?',
    })
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
        addAssistantMessageWithLoading({
          content: '',
          showRoleSuccess: {
            roleName: pendingRoleName,
            permissionType: option.id === 'all' ? 'All Permissions' : 'No Permissions',
          },
        })
        setPendingRoleName('')
        break

      case 'duplicate':
        // Show existing roles to select from
        setConversationState('awaiting_duplicate_role')
        addAssistantMessageWithLoading({
          content: 'Which role would you like to duplicate permissions from?',
          showExistingRoles: true,
        })
        break

      case 'custom':
        // Ask for custom permission description
        setConversationState('awaiting_custom_permission')
        addAssistantMessageWithLoading({
          content: 'Please describe the custom permissions you would like to set for this role:',
        })
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
    addAssistantMessageWithLoading({
      content: '',
      showRoleSuccess: {
        roleName: pendingRoleName,
        permissionType: 'Duplicated Permissions',
        duplicatedFrom: role.name,
      },
    })
    setPendingRoleName('')
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
    addAssistantMessageWithLoading({
      content: `What would you like to name the new role?`,
    })
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
    addAssistantMessageWithLoading({
      content: `What would you like to do with the '${role.name}' role?`,
      showRoleContextActions: { roleName: role.name },
    })
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

      addAssistantMessageWithLoading({
        content: `What would you like to do with the '${roleName}' role?`,
        showModificationOptions: true,
      })
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

      addAssistantMessageWithLoading({
        content: `Permissions for '${roleName}':`,
        showPermissionsTable: { roleName, permissions },
      })
    } else if (action.id === 'duplicate-from-view') {
      // Start duplicate role flow
      setRoleBeingDuplicated(roleName)
      setConversationState('awaiting_duplicated_role_name')

      addAssistantMessageWithLoading({
        content: `What would you like to name the new role?`,
      })
    }
  }

  const handleToggleRoleForDeletion = (roleId: string) => {
    setSelectedRolesToDelete(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const handleDeleteSelectedRoles = () => {
    // Store selected roles for confirmation
    setPendingDeleteRoles(selectedRolesToDelete)

    // Build role names for user message
    const roleNames = selectedRolesToDelete
      .map(id => EXISTING_ROLES.find(r => r.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Delete ${roleNames}`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Update conversation state
    setConversationState('awaiting_delete_confirmation')

    // Mark as submitted (keep list visible but disabled)
    setDeleteRolesSubmitted(true)

    // Show confirmation message
    addAssistantMessageWithLoading({
      showDeleteConfirmation: {
        roleIds: selectedRolesToDelete,
        roleNames: roleNames.split(', ')
      }
    }, 1000)
  }

  const handleConfirmDeleteRoles = () => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Confirm Delete',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Get deleted role names
    const deletedRoleNames = pendingDeleteRoles
      .map(id => EXISTING_ROLES.find(r => r.id === id)?.name)
      .filter(Boolean) as string[]

    // Show success message
    addAssistantMessageWithLoading({
      showDeleteSuccess: {
        deletedCount: pendingDeleteRoles.length,
        deletedRoles: deletedRoleNames
      }
    }, 1500)

    // Reset state
    setSelectedRolesToDelete([])
    setPendingDeleteRoles([])
    setConversationState('idle')
  }

  const handleGoBackFromDeleteConfirmation = () => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Go Back',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Go back to role selection state (re-enable interaction)
    setConversationState('awaiting_role_delete_selection')
    setDeleteRolesSubmitted(false)

    // Re-display role selection with previous selections maintained
    addAssistantMessageWithLoading({
      showAllRolesListForDeletion: true
    }, 500)
  }

  const handleCancelDeleteRoles = () => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Cancel',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Reset state
    setSelectedRolesToDelete([])
    setPendingDeleteRoles([])
    setDeleteRolesSubmitted(false)
    setConversationState('idle')

    // Show cancellation message
    addAssistantMessageWithLoading({
      content: 'Role deletion cancelled.'
    }, 500)
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

      addAssistantMessageWithLoading({
        content: responseContent,
        showPermissionChangeChips: showChips,
      })
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
      addAssistantMessageWithLoading({
        content: 'Please describe the permission changes you would like to make:',
      })
    } else {
      // Direct success for full access or remove access
      const changeDescription = chipOption.id === 'full-access'
        ? 'Granted full access to all features'
        : 'Removed all access permissions'

      addAssistantMessageWithLoading({
        content: '',
        showPermissionChangeSuccess: {
          roleName: roleName,
          changeDescription: changeDescription,
        },
      })
      setRoleForPermissionChange(null)
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
    addAssistantMessageWithLoading({
      content: `What would you like to do with '${entityName}' for the '${roleName}' role?`,
      showDataEntityOptions: {
        entityId,
        entityName,
        entityType,
        roleName,
        currentPermission,
      },
    })
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
      addAssistantMessageWithLoading({
        content: `Current permission for '${entityForPermissionChange.entityName}' is '${currentPermLabel}'. Select a new permission level:`,
        showPermissionLevelChips: {
          entityId: entityForPermissionChange.entityId,
          entityName: entityForPermissionChange.entityName,
          roleName: entityForPermissionChange.roleName,
          currentPermission: entityForPermissionChange.currentPermission,
        },
      })
    } else if (option.id === 'views-permission' && entityForPermissionChange) {
      // Show views table
      const views = MOCK_ENTITY_VIEWS[entityForPermissionChange.entityId] || []
      setSelectedViewOrReport(null) // Reset view/report selection
      addAssistantMessageWithLoading({
        content: `Views for '${entityForPermissionChange.entityName}':`,
        showViewsTable: {
          entityId: entityForPermissionChange.entityId,
          entityName: entityForPermissionChange.entityName,
          roleName: entityForPermissionChange.roleName,
          views,
        },
      })
    } else if (option.id === 'reports-permission' && entityForPermissionChange) {
      // Show reports table
      const reports = MOCK_ENTITY_REPORTS[entityForPermissionChange.entityId] || []
      setSelectedViewOrReport(null) // Reset view/report selection
      addAssistantMessageWithLoading({
        content: `Reports for '${entityForPermissionChange.entityName}':`,
        showReportsTable: {
          entityId: entityForPermissionChange.entityId,
          entityName: entityForPermissionChange.entityName,
          roleName: entityForPermissionChange.roleName,
          reports,
        },
      })
    } else {
      // Show coming soon response for other options
      addAssistantMessageWithLoading({
        content: `This feature is coming soon! You'll be able to ${option.description.toLowerCase()}.`,
      })
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
    addAssistantMessageWithLoading({
      content: `Permission for '${entityForPermissionChange.entityName}' has been updated to '${level.title}' for the '${entityForPermissionChange.roleName}' role.`,
    })
    // Reset entity context
    setEntityForPermissionChange(null)
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
    addAssistantMessageWithLoading({
      content: `What would you like to do with the '${view.name}' view?`,
      showViewReportOptions: {
        itemId: view.id,
        itemName: view.name,
        itemType: 'view',
        entityName,
        roleName,
        currentPermission: view.permission,
      },
    })
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
    addAssistantMessageWithLoading({
      content: `What would you like to do with the '${report.name}' report?`,
      showViewReportOptions: {
        itemId: report.id,
        itemName: report.name,
        itemType: 'report',
        entityName,
        roleName,
        currentPermission: report.permission,
      },
    })
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
      addAssistantMessageWithLoading({
        content: `Current permission for '${viewReportForPermissionChange.itemName}' ${itemTypeLabel} is '${currentPermLabel}'. Select a new permission level:`,
        showPermissionLevelChips: {
          entityId: viewReportForPermissionChange.itemId,
          entityName: viewReportForPermissionChange.itemName,
          roleName: viewReportForPermissionChange.roleName,
          currentPermission: viewReportForPermissionChange.currentPermission,
        },
      })
    } else {
      // Show coming soon response for modify option
      const itemTypeLabel = viewReportForPermissionChange.itemType === 'view' ? 'view' : 'report'
      addAssistantMessageWithLoading({
        content: `Modify ${itemTypeLabel} feature is coming soon!`,
      })
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
          : "w-[40px] ml-2 mr-2 rounded-t-[8px] p-[1px] overflow-hidden flex-shrink-0"
      )}
      style={{
        background: 'var(--ai-gradient-300)',
      }}
    >
      <div className={cn(
        "flex flex-col overflow-hidden h-full bg-white rounded-t-[7px]"
      )}>

      {/* Header / Collapsed Icon */}
      {isExpanded ? (
        <>
        <div
          className="flex-shrink-0 py-3 px-4 cursor-pointer"
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
        {/* Gradient separator */}
        <div className="h-[1px] flex-shrink-0" style={{ background: 'var(--ai-gradient-300)' }} />
        </>
      ) : (
        <div
          className="flex-1 flex items-start justify-center pt-2 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.19688 22.0707L2.81868 34.5322C2.55321 35.2878 1.72546 35.6851 0.969847 35.4197C0.214238 35.1542 -0.183094 34.3264 0.0823803 33.5708L4.46058 21.1094C5.3631 18.5406 8.98821 18.5188 9.92146 21.0766L14.4742 33.5545C14.7487 34.3068 14.3613 35.1393 13.6089 35.4138C12.8565 35.6883 12.0241 35.3009 11.7496 34.5486L7.19688 22.0707Z" fill="#a855f7"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M1.98084 30.089C1.98084 29.2881 2.63008 28.6388 3.43097 28.6388H11.1318C11.9327 28.6388 12.582 29.2881 12.582 30.089C12.582 30.8898 11.9327 31.5391 11.1318 31.5391H3.43097C2.63008 31.5391 1.98084 30.8898 1.98084 30.089Z" fill="#a855f7"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M19.0518 18.2953C19.8527 18.2953 20.5019 18.9445 20.5019 19.7454V34.047C20.5019 34.8479 19.8527 35.4971 19.0518 35.4971C18.2509 35.4971 17.6017 34.8479 17.6017 34.047V19.7454C17.6017 18.9445 18.2509 18.2953 19.0518 18.2953Z" fill="#a855f7"/>
            <path d="M31.8789 10.2327C32.0494 9.44346 33.1753 9.44346 33.3457 10.2327L33.697 11.8591C34.2468 14.4048 36.2517 16.3835 38.8045 16.8998L39.3985 17.02C40.2006 17.1822 40.2006 18.3286 39.3985 18.4908L38.6917 18.6338C36.1966 19.1384 34.2194 21.0421 33.6205 23.5162L33.3416 24.6685C33.1564 25.4336 32.0683 25.4336 31.8831 24.6685L31.6041 23.5163C31.0053 21.0421 29.028 19.1384 26.5329 18.6338L25.8262 18.4908C25.0241 18.3286 25.0241 17.1822 25.8262 17.02L26.4202 16.8998C28.9729 16.3835 30.9778 14.4048 31.5277 11.8591L31.8789 10.2327Z" fill="#22c55e"/>
            <path d="M17.8046 5.03628C17.974 4.31851 18.9956 4.31851 19.1649 5.03628C19.635 7.02823 21.1903 8.58353 23.1822 9.05357C23.9 9.22295 23.9 10.2445 23.1822 10.4139C21.1903 10.8839 19.635 12.4392 19.1649 14.4312C18.9956 15.1489 17.974 15.1489 17.8046 14.4312C17.3346 12.4392 15.7793 10.8839 13.7874 10.4139C13.0696 10.2445 13.0696 9.22295 13.7874 9.05357C15.7793 8.58353 17.3346 7.02823 17.8046 5.03628Z" fill="#ec4899"/>
          </svg>
        </div>
      )}

      {/* Messages Area */}
      {isExpanded && (
      <div className="flex-1 overflow-y-auto space-y-4 px-2 pt-2 scrollbar-sleek">
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
                  <div className="bg-gray-200 px-3 py-1.5 rounded-lg text-[12px] text-gray-900 max-w-[280px]">
                    {message.content}
                  </div>
                </div>
              </div>
            ) : (
              // Assistant message
              <div className="space-y-3 max-w-[280px]">
                {/* Loading state with new loading components */}
                {message.isLoading ? (
                  <CopilotLoadingMessage
                    stages={message.loadingStages || ['Processing...']}
                    duration={message.loadingDuration || 5000}
                    stageDurations={message.loadingStageDurations}
                    animationType={message.loadingAnimation || 'pulse'}
                    showResult={message.loadingComplete}
                    resultContent={
                      message.loadingComplete && (
                        <div className="space-y-2">
                          {/* Message content */}
                          {message.content && (
                            <div className="text-[12px] text-gray-900 whitespace-pre-line leading-relaxed p-1">
                              {message.content}
                            </div>
                          )}

                          {/* Render all show* properties when loading is complete */}
                          {message.showSuggestedRoles && message.showSuggestedRoles.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[12px] text-gray-900 p-1 leading-relaxed">
                                I scanned your app. Based on the data, access patterns, workflows and interface structure, here are roles worth adding:
                              </p>

                              {/* Roles list with checkboxes - render from live state */}
                              <div className="space-y-2">
                                {suggestedRoles.map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => !suggestedRolesSubmitted && handleToggleSuggestedRole(role.id)}
                                    disabled={suggestedRolesSubmitted}
                                    className={cn(
                                      "w-full text-left rounded-lg px-3 py-2.5 border transition-all",
                                      suggestedRolesSubmitted
                                        ? role.selected
                                          ? "bg-purple-100 border-purple-200 cursor-default"
                                          : "bg-gray-50 border-gray-200 cursor-default opacity-60"
                                        : role.selected
                                          ? "bg-purple-100 border-purple-200"
                                          : "bg-white border-gray-200 hover:border-gray-300"
                                    )}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                                        suggestedRolesSubmitted
                                          ? role.selected
                                            ? "bg-purple-400 border-purple-400"
                                            : "bg-gray-100 border-gray-300"
                                          : role.selected
                                            ? "bg-purple-600 border-purple-600"
                                            : "bg-white border-gray-300"
                                      )}>
                                        {role.selected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={cn(
                                          "text-[12px] font-semibold",
                                          suggestedRolesSubmitted
                                            ? role.selected
                                              ? "text-purple-400"
                                              : "text-gray-500"
                                            : role.selected
                                              ? "text-purple-600"
                                              : "text-gray-900"
                                        )}>
                                          {role.name}
                                        </div>
                                        <div className={cn(
                                          "text-[11px] leading-relaxed mt-0.5",
                                          suggestedRolesSubmitted
                                            ? role.selected
                                              ? "text-purple-300"
                                              : "text-gray-400"
                                            : role.selected
                                              ? "text-purple-500"
                                              : "text-gray-600"
                                        )}>
                                          {role.description}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Action buttons - hide when submitted */}
                              {!suggestedRolesSubmitted && (
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={handleCancelSuggestRoles}
                                    className="px-3 py-2 rounded-lg text-[12px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleAddSelectedRoles}
                                    disabled={!suggestedRoles.some(r => r.selected)}
                                    className={cn(
                                      "flex-1 px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                                      suggestedRoles.some(r => r.selected)
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                  >
                                    Add Selected Roles
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* All Roles List for Deletion (Delete role(s) flow) */}
                          {message.showAllRolesListForDeletion && (
                            <div className="space-y-2">
                              {/* Simple Text Header */}
                              <p className="text-[12px] text-gray-900 p-1 leading-relaxed">
                                Select roles to delete
                              </p>

                              {/* Role Selection with Checkboxes */}
                              <div className="max-h-[260px] overflow-y-auto space-y-2">
                                {EXISTING_ROLES.map((role) => {
                                  const isChecked = selectedRolesToDelete.includes(role.id)

                                  return (
                                    <label
                                      key={role.id}
                                      onClick={() => !deleteRolesSubmitted && handleToggleRoleForDeletion(role.id)}
                                      className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                        deleteRolesSubmitted
                                          ? isChecked
                                            ? "bg-red-100 border-red-200 cursor-default"
                                            : "bg-gray-50 border-gray-200 cursor-default opacity-60"
                                          : isChecked
                                            ? "bg-red-100 border-red-200 cursor-pointer"
                                            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                                        deleteRolesSubmitted
                                          ? isChecked
                                            ? "bg-red-400 border-red-400"
                                            : "bg-gray-100 border-gray-300"
                                          : isChecked
                                            ? "bg-red-600 border-red-600"
                                            : "bg-white border-gray-300"
                                      )}>
                                        {isChecked && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                          "text-[12px] font-medium",
                                          deleteRolesSubmitted
                                            ? isChecked
                                              ? "text-red-400"
                                              : "text-gray-500"
                                            : isChecked
                                              ? "text-red-600"
                                              : "text-gray-900"
                                        )}>
                                          {role.name}
                                        </h4>
                                        <p className={cn(
                                          "text-[11px]",
                                          deleteRolesSubmitted
                                            ? isChecked
                                              ? "text-red-300"
                                              : "text-gray-400"
                                            : isChecked
                                              ? "text-red-500"
                                              : "text-gray-700"
                                        )}>
                                          {role.description}
                                        </p>
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>

                              {/* CTAs - hide when submitted */}
                              {!deleteRolesSubmitted && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleCancelDeleteRoles}
                                    className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleDeleteSelectedRoles}
                                    disabled={selectedRolesToDelete.length === 0}
                                    className={cn(
                                      "px-3 py-1.5 text-[11px] font-medium rounded transition-colors",
                                      selectedRolesToDelete.length === 0
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700 border border-red-600"
                                    )}
                                  >
                                    Delete Selected Roles ({selectedRolesToDelete.length})
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }
                  />
                ) : (
                  // Regular assistant message (when not loading)
                  <>
                    {/* App Creation Success Card */}
                    {message.showAppCard ? (
                  <div className="space-y-2">
                    {/* AI Avatar */}
                    <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-purple-600 fill-purple-600" />
                    </div>

                    {/* Combined App Success Card - AI Gradient Theme */}
                    <div className="rounded-[9px] p-[1px] overflow-hidden" style={{
                      background: 'var(--ai-gradient-200)'
                    }}>
                      <div className="rounded-[8px] px-3 py-3" style={{
                        background: 'var(--ai-gradient-100)'
                      }}>
                        {/* Success Icon and Title Row */}
                        <div className="flex items-center gap-2">
                          <IconCircleCheckFilled className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <span className="text-[13px] font-semibold text-purple-600">App Created Successfully</span>
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

                    {/* All Roles List for Deletion (Delete role(s) flow) */}
                    {message.showAllRolesListForDeletion && (
                      <div className="space-y-2">
                        {/* Simple Text Header */}
                        <p className="text-[12px] text-gray-900 p-1 leading-relaxed">
                          Select roles to delete
                        </p>

                        {/* Role Selection with Checkboxes */}
                        <div className="max-h-[260px] overflow-y-auto space-y-2">
                          {EXISTING_ROLES.map((role) => {
                            const isChecked = selectedRolesToDelete.includes(role.id)

                            return (
                              <label
                                key={role.id}
                                onClick={() => !deleteRolesSubmitted && handleToggleRoleForDeletion(role.id)}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                  deleteRolesSubmitted
                                    ? isChecked
                                      ? "bg-red-100 border-red-200 cursor-default"
                                      : "bg-gray-50 border-gray-200 cursor-default opacity-60"
                                    : isChecked
                                      ? "bg-red-100 border-red-200 cursor-pointer"
                                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                )}
                              >
                                <div className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                                  deleteRolesSubmitted
                                    ? isChecked
                                      ? "bg-red-400 border-red-400"
                                      : "bg-gray-100 border-gray-300"
                                    : isChecked
                                      ? "bg-red-600 border-red-600"
                                      : "bg-white border-gray-300"
                                )}>
                                  {isChecked && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    "text-[12px] font-medium",
                                    deleteRolesSubmitted
                                      ? isChecked
                                        ? "text-red-400"
                                        : "text-gray-500"
                                      : isChecked
                                        ? "text-red-600"
                                        : "text-gray-900"
                                  )}>
                                    {role.name}
                                  </h4>
                                  <p className={cn(
                                    "text-[11px]",
                                    deleteRolesSubmitted
                                      ? isChecked
                                        ? "text-red-300"
                                        : "text-gray-400"
                                      : isChecked
                                        ? "text-red-500"
                                        : "text-gray-700"
                                  )}>
                                    {role.description}
                                  </p>
                                </div>
                              </label>
                            )
                          })}
                        </div>

                        {/* CTAs - hide when submitted */}
                        {!deleteRolesSubmitted && (
                          <div className="flex gap-2">
                          <button
                            onClick={handleCancelDeleteRoles}
                            className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteSelectedRoles}
                            disabled={selectedRolesToDelete.length === 0}
                            className={cn(
                              "px-3 py-1.5 text-[11px] font-medium rounded transition-colors",
                              selectedRolesToDelete.length === 0
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 border border-red-600"
                            )}
                          >
                            Delete Selected Roles ({selectedRolesToDelete.length})
                          </button>
                        </div>
                        )}
                      </div>
                    )}

                    {/* Delete Confirmation */}
                    {message.showDeleteConfirmation && (
                      <div className="space-y-2">
                        <p className="text-[12px] text-gray-900 p-1 leading-relaxed">
                          Are you sure you want to delete {message.showDeleteConfirmation.roleIds.length} role(s)?
                        </p>
                        <ul className="text-[12px] text-gray-700 list-disc list-inside space-y-0.5 p-1 leading-relaxed">
                          {message.showDeleteConfirmation.roleNames.map((roleName) => (
                            <li key={roleName}>{roleName}</li>
                          ))}
                        </ul>
                        <p className="text-[12px] text-gray-600 p-1 leading-relaxed">
                          This action cannot be undone.
                        </p>

                        {/* CTAs */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleGoBackFromDeleteConfirmation}
                            className="px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors"
                          >
                            Go Back
                          </button>
                          <button
                            onClick={handleConfirmDeleteRoles}
                            className="px-3 py-1.5 text-[11px] font-medium bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded transition-colors"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete Success */}
                    {message.showDeleteSuccess && (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 mt-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-green-900 mb-1">
                              Successfully deleted {message.showDeleteSuccess.deletedCount} role(s)
                            </div>
                            <ul className="text-xs text-green-800 space-y-0.5">
                              {message.showDeleteSuccess.deletedRoles.map((roleName) => (
                                <li key={roleName}>• {roleName}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
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
                      <div className="mt-1">
                        {/* Success Card with purple styling */}
                        <div className="rounded-lg border border-purple-200 bg-purple-100 px-3 py-3">
                          {/* Header with icon and title */}
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCheck className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <span className="text-[13px] font-medium text-purple-600">
                              {message.showAddedRoles.selectedRoles.length} {message.showAddedRoles.selectedRoles.length === 1 ? 'Role' : 'Roles'} successfully added
                            </span>
                          </div>

                          {/* Bulleted list of roles */}
                          <ul className="space-y-1 ml-7">
                            {message.showAddedRoles.selectedRoles.map((roleName, index) => (
                              <li key={index} className="text-[12px] text-gray-900 list-disc">
                                {roleName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Page Created Success Card */}
                    {message.showPageSuccess && (
                      <div className="mt-1">
                        {/* Success Card with purple styling */}
                        <div className="rounded-lg border border-purple-200 bg-purple-100 px-3 py-3">
                          {/* Header with icon and title */}
                          <div className="flex items-center gap-2 mb-2">
                            <IconCircleCheckFilled className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <span className="text-[13px] font-medium text-purple-600">
                              Page Created Successfully
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[12px] text-gray-900 mb-1">
                            {message.showPageSuccess.pageDescription}
                          </p>

                          {/* Quick Link */}
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              // Preview already switches to new page automatically
                            }}
                            className="text-[12px] font-medium text-purple-600 hover:text-purple-700 cursor-pointer inline-flex items-center gap-1"
                          >
                            View Page
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
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
                          {/* Back button */}
                          {!completedAction && (
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
                            const isGloballyDisabled = hasUserInteracted

                            return (
                              <button
                                key={subAction.id}
                                onClick={() => !completedAction && !isGloballyDisabled && handleSubActionClick(subAction)}
                                disabled={completedAction !== null || isGloballyDisabled}
                                className={cn(
                                  "w-full text-left rounded-lg px-3 py-2.5 transition-all",
                                  isGloballyDisabled
                                    ? "bg-gray-50 border border-gray-200 cursor-default opacity-60"
                                    : isSelected
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
                                onClick={() => !hasUserInteracted && handleSuggestionClick(suggestion)}
                                disabled={hasUserInteracted}
                                className={cn(
                                  "w-full text-left border rounded-lg px-3 py-2 transition-all",
                                  hasUserInteracted
                                    ? "border-gray-200 bg-gray-50 cursor-default opacity-60"
                                    : "border-purple-100 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                )}
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
              </>
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

        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Input Area */}
      {isExpanded && (
      <div className="flex-shrink-0 mt-4 px-2 pb-2">
        {/* Quick actions bar */}
        {hasUserInteracted && (
        <div className="rounded-t-xl px-3 pt-2 pb-6 border border-purple-100/50 border-b-0 -mb-[13px] relative z-0" style={{ background: 'var(--ai-gradient-100)' }}>
          {/* Collapsible header */}
          <button
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            className="flex items-center justify-between hover:text-gray-900 transition-colors w-full"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-[12px] font-medium text-gray-900">Quick actions</span>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${quickActionsOpen ? 'rotate-0' : 'rotate-180'}`}
            />
          </button>

          {/* Expandable content */}
          {quickActionsOpen && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
              {drawerDrillThroughCategory && currentDrawerDrillThrough ? (
                <>
                  {/* Drill-through: Header with category title and back button */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <currentDrawerDrillThrough.icon className={cn('w-3 h-3', currentDrawerDrillThrough.iconColor)} />
                      <h4 className="text-[12px] font-semibold text-gray-900">
                        {currentDrawerDrillThrough.title}
                      </h4>
                    </div>
                    {/* Back button - always visible in drawer */}
                    <button
                      onClick={handleDrawerBackToQuickActions}
                      className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  {/* Sub-actions list - always enabled in drawer */}
                  <div className="space-y-1.5">
                    {currentDrawerDrillThrough.subActions?.map((subAction) => (
                      <button
                        key={subAction.id}
                        onClick={() => handleDrawerSubActionClick(subAction)}
                        className="w-full text-left rounded-lg px-3 py-2.5 transition-all border border-purple-100 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                      >
                        <span className="text-[12px] font-medium text-gray-900">
                          {subAction.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Main Quick Actions cards */}
                  <div className="space-y-1.5">
                    {SUGGESTION_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleDrawerSuggestionClick(action)}
                        className="w-full text-left border border-purple-100 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Icon */}
                          <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0', action.iconBg)}>
                            <action.icon className={cn('w-3 h-3', action.iconColor)} />
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-medium text-gray-900">
                              {action.title}
                            </h4>
                            <p className="text-[11px] text-gray-700">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        )}

        <div
          className="rounded-[12px] p-[1px] overflow-hidden relative z-10"
          style={{ background: 'var(--ai-gradient-400)' }}
        >
          <div className="rounded-[11px] p-3 bg-white">
          {/* Text input with colored overlay */}
          <div className="relative">
            {/* Actual textarea with matching styling */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="relative w-full resize-none text-[12px] placeholder:text-gray-400 focus:outline-none min-h-[40px] max-h-[100px] bg-transparent"
              style={{
                color: 'transparent',
                caretColor: '#111827',
                lineHeight: '1.5',
                padding: '0'
              }}
              rows={1}
              disabled={isLoading}
            />
            {/* Text overlay showing what user types with artifact highlighting */}
            <div
              className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-[12px] overflow-hidden"
              style={{
                lineHeight: '1.5',
                padding: '0',
                minHeight: '40px',
                top: 0,
                left: 0
              }}
            >
              {(() => {
                // Check if any part of the input matches an artifact name
                let result: React.ReactNode[] = []
                let remainingText = input
                let key = 0

                while (remainingText.length > 0) {
                  // Find if any artifact name starts at the current position
                  let matched = false

                  for (const artifact of referencedArtifacts) {
                    if (remainingText.startsWith(artifact.name)) {
                      // Found a match
                      result.push(
                        <span key={key++} style={{ color: 'var(--purple-600)' }}>
                          {artifact.name}
                        </span>
                      )
                      remainingText = remainingText.slice(artifact.name.length)
                      matched = true
                      break
                    }
                  }

                  if (!matched) {
                    // No artifact match, add the character as normal text
                    result.push(
                      <span key={key++} style={{ color: '#111827' }}>
                        {remainingText[0]}
                      </span>
                    )
                    remainingText = remainingText.slice(1)
                  }
                }

                return result
              })()}
            </div>
          </div>

          {/* Bottom row with hint and buttons */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-700">Type '/' for referring datamodels</span>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-7 w-7 p-0 rounded-full disabled:opacity-30"
              style={{ background: 'var(--ai-gradient-500)' }}
            >
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Button>
          </div>
        </div>
        </div>

        {/* Slash Command Menu */}
        <SlashCommandMenu
          isOpen={showSlashMenu}
          position={slashMenuPosition}
          onSelect={handleArtifactSelect}
          onClose={() => {
            setShowSlashMenu(false)
            setSlashMenuQuery('')
          }}
          currentQuery={slashMenuQuery}
          artifacts={MOCK_ARTIFACTS}
        />
      </div>
      )}
    </div>
    </div>
  )
}
