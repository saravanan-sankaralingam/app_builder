'use client'

import { ReactNode, useState, useEffect, useCallback } from 'react'
import { BuilderThemeRoot } from '@/context/BuilderThemeContext'
import { API_BASE_URL } from '@/lib/config'
import { ClipboardList, LayoutGrid, Workflow, Navigation, FileText, List, Variable, FolderOpen, Plus, Inbox, Search, Component, Cable, UserKey, Users, Check, Network, X, Database, ShieldCheck, FileBarChart, Layout, Plug, RefreshCw, Play } from 'lucide-react'
import { ReactFlow, Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BuilderTopBar } from './BuilderTopBar'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderTabBar, Tab, HOME_TAB } from './BuilderTabBar'
import { BuilderUtilityBar } from './BuilderUtilityBar'
import { DataFormCreateDialog } from './DataFormCreateDialog'
import { BoardCreateDialog } from './BoardCreateDialog'
import { ProcessCreateDialog } from './ProcessCreateDialog'
import { NavigationCreateDialog } from './NavigationCreateDialog'
import { PageCreateDialog } from './PageCreateDialog'
import { ListCreateDialog } from './ListCreateDialog'
import { FormBuilder } from './FormBuilder'
import { ListEditor } from './ListEditor'
import { VariablesEditor } from './VariablesEditor'
import { ResourcesEditor } from './ResourcesEditor'
import { ComponentsEditor } from './ComponentsEditor'
import { ComponentEditor } from './ComponentEditor'
import { RolesEditor } from './RolesEditor'
import { ComponentData } from './ComponentCard'
import { NavigationEditor } from './NavigationEditor'
import { PageEditor } from './PageEditor'
import { ViewCreateDialog } from './ViewCreateDialog'
import { ReportCreateDialog, ReportType } from './ReportCreateDialog'
import { RenameDialog } from './RenameDialog'
import { DuplicateDialog } from './DuplicateDialog'
import { ViewCard } from './ViewCard'
import { ReportCard } from './ReportCard'
import { DataFormShareEditor } from './DataFormShareEditor'
import { DataFormSettingsEditor } from './DataFormSettingsEditor'
import { CopilotPanel } from './CopilotPanel'
import { AppRuntimePreview } from './AppRuntimePreview'
import { ViewsSection, getViewTypeIcon } from './ViewsSection'
import { ReportsSection, getReportTypeIcon } from './ReportsSection'
import { NavigationsSection, type Navigation as NavigationData } from './NavigationsSection'
import { View, listViews, createView } from '@/lib/api/views'
import { Report, listReports, createReport } from '@/lib/api/reports'
import { listComponents as fetchComponentsApi } from '@/lib/api/components'
import * as LucideIcons from 'lucide-react'

function AppIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} />
  }
  return <IconComponent className={className} />
}

// Custom Node Component for React Flow
function EntityNode({ data }: { data: any }) {
  const getIcon = () => {
    switch (data.type) {
      case 'Data Form':
        return { Icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
      case 'Board':
        return { Icon: LayoutGrid, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
      case 'Process':
        return { Icon: Workflow, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
      default:
        return { Icon: ClipboardList, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
    }
  }

  const { Icon, color, bgColor, borderColor } = getIcon()

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-3 w-48 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${bgColor} rounded p-1 border ${borderColor}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <h4 className="text-xs font-semibold text-gray-900">{data.label}</h4>
      </div>
      <div className="text-[10px] text-gray-600 space-y-0.5">
        {data.fields?.map((field: string, idx: number) => (
          <div key={idx}>• {field}</div>
        ))}
      </div>
    </div>
  )
}

const nodeTypes = {
  entity: EntityNode,
}

interface BuilderLayoutProps {
  children?: ReactNode
  appId: string
  appName: string
  appDescription?: string
  appIcon: string
  appIconBg: string
  onSidebarItemClick?: (id: string) => void
  onNameChange?: (name: string) => Promise<{ success: boolean; error?: string }>
}

export function BuilderLayout({
  children,
  appId,
  appName,
  appDescription,
  appIcon,
  appIconBg,
  onSidebarItemClick,
  onNameChange,
}: BuilderLayoutProps) {

  const [tabs, setTabs] = useState<Tab[]>([HOME_TAB])
  const [activeTabId, setActiveTabId] = useState('home')
  const [selectedBlueprintSection, setSelectedBlueprintSection] = useState('roles')
  const [selectedViewInSpecY, setSelectedViewInSpecY] = useState<{ entityId: string; viewName: string } | null>(null)
  const [selectedViewInSpecX, setSelectedViewInSpecX] = useState<{ entityId: string; viewName: string } | null>(null)
  const [selectedReportInSpecX, setSelectedReportInSpecX] = useState<{ entityId: string; reportName: string } | null>(null)
  const [selectedReportInSpecY, setSelectedReportInSpecY] = useState<{ entityId: string; reportName: string } | null>(null)
  const [selectedNavigationInSpecX, setSelectedNavigationInSpecX] = useState<string | null>(null)
  const [selectedNavigationInSpecY, setSelectedNavigationInSpecY] = useState<string | null>(null)
  const [showRelationships, setShowRelationships] = useState(false)

  // Spec Y specific states - accordion behavior (only one section open at a time)
  const [expandedSection, setExpandedSection] = useState<string>('roles') // 'roles', 'data-entities', 'workflows', 'permissions', 'interface', 'integrations'
  const [selectedEntityInSpecY, setSelectedEntityInSpecY] = useState<string | null>(null)

  // Data Entities mock data and state
  const mockDataEntities = [
    {
      id: '1',
      name: 'Leave Request',
      type: 'Process' as const,
      fields: [
        { name: 'Employee Name', type: 'Text', id: 'employee_name', required: true },
        { name: 'Leave Type', type: 'Dropdown', id: 'leave_type', required: true },
        { name: 'Start Date', type: 'Date', id: 'start_date', required: true },
        { name: 'End Date', type: 'Date', id: 'end_date', required: true },
        { name: 'Reason', type: 'Multi-line Text', id: 'reason', required: false },
        { name: 'Manager', type: 'User', id: 'manager', required: true },
        { name: 'Status', type: 'Dropdown', id: 'status', required: true },
      ]
    },
    {
      id: '2',
      name: 'Leave Balance',
      type: 'Data Form' as const,
      fields: [
        { name: 'Employee', type: 'User', id: 'employee', required: true },
        { name: 'Leave Type', type: 'Dropdown', id: 'leave_type', required: true },
        { name: 'Total Days', type: 'Number', id: 'total_days', required: true },
        { name: 'Used Days', type: 'Number', id: 'used_days', required: true },
        { name: 'Available Days', type: 'Number', id: 'available_days', required: true },
        { name: 'Year', type: 'Number', id: 'year', required: true },
      ]
    },
    {
      id: '3',
      name: 'Holiday Calendar',
      type: 'Data Form' as const,
      fields: [
        { name: 'Holiday Name', type: 'Text', id: 'holiday_name', required: true },
        { name: 'Date', type: 'Date', id: 'date', required: true },
        { name: 'Type', type: 'Dropdown', id: 'type', required: true },
        { name: 'Description', type: 'Multi-line Text', id: 'description', required: false },
        { name: 'Country', type: 'Dropdown', id: 'country', required: false },
      ]
    },
    {
      id: '4',
      name: 'Time-off Policy',
      type: 'Data Form' as const,
      fields: [
        { name: 'Policy Name', type: 'Text', id: 'policy_name', required: true },
        { name: 'Leave Type', type: 'Dropdown', id: 'leave_type', required: true },
        { name: 'Annual Allocation', type: 'Number', id: 'annual_allocation', required: true },
        { name: 'Accrual Rate', type: 'Number', id: 'accrual_rate', required: false },
        { name: 'Carry Over Allowed', type: 'Yes/No', id: 'carry_over', required: true },
        { name: 'Max Carry Over Days', type: 'Number', id: 'max_carry_over', required: false },
        { name: 'Applicable To', type: 'Multi-select', id: 'applicable_to', required: true },
      ]
    },
    {
      id: '5',
      name: 'Approval Workflow',
      type: 'Board' as const,
      fields: [
        { name: 'Request ID', type: 'Text', id: 'request_id', required: true },
        { name: 'Employee', type: 'User', id: 'employee', required: true },
        { name: 'Approver', type: 'User', id: 'approver', required: true },
        { name: 'Status', type: 'Dropdown', id: 'status', required: true },
        { name: 'Comments', type: 'Multi-line Text', id: 'comments', required: false },
        { name: 'Action Date', type: 'Date', id: 'action_date', required: false },
      ]
    },
    {
      id: '6',
      name: 'Employee Directory',
      type: 'Data Form' as const,
      fields: [
        { name: 'Employee Name', type: 'Text', id: 'emp_name', required: true },
        { name: 'Email', type: 'Email', id: 'email', required: true },
        { name: 'Department', type: 'Dropdown', id: 'department', required: true },
        { name: 'Manager', type: 'User', id: 'manager', required: true },
        { name: 'Join Date', type: 'Date', id: 'join_date', required: true },
        { name: 'Employment Type', type: 'Dropdown', id: 'emp_type', required: true },
      ]
    },
  ]
  const [selectedDataEntity, setSelectedDataEntity] = useState(mockDataEntities[0].id)

  // Views grouped by entity. DataForm: Table/Gallery/Sheet. Board: Kanban/List/Matrix/Timeline.
  // Process: My Items / My Tasks / Participated Items / Admin Items (all Table).
  const mockViews: Array<{ entityId: string; name: string; type: 'Table' | 'Gallery' | 'Sheet' | 'Kanban' | 'List' | 'Matrix' | 'Timeline' }> = [
    // Leave Request (Process)
    { entityId: '1', name: 'My Items', type: 'Table' },
    { entityId: '1', name: 'My Tasks', type: 'Table' },
    { entityId: '1', name: 'Participated Items', type: 'Table' },
    { entityId: '1', name: 'Admin Items', type: 'Table' },
    // Leave Balance (Data Form)
    { entityId: '2', name: 'All Balances', type: 'Table' },
    { entityId: '2', name: 'Employee Cards', type: 'Gallery' },
    { entityId: '2', name: 'Bulk Edit', type: 'Sheet' },
    // Holiday Calendar (Data Form)
    { entityId: '3', name: 'All Holidays', type: 'Table' },
    { entityId: '3', name: 'Calendar Cards', type: 'Gallery' },
    { entityId: '3', name: 'Bulk Upload', type: 'Sheet' },
    // Time-off Policy (Data Form)
    { entityId: '4', name: 'Active Policies', type: 'Table' },
    { entityId: '4', name: 'Policy Tiles', type: 'Gallery' },
    { entityId: '4', name: 'Policy Editor', type: 'Sheet' },
    // Approval Workflow (Board)
    { entityId: '5', name: 'Approval Pipeline', type: 'Kanban' },
    { entityId: '5', name: 'All Approvals', type: 'List' },
    { entityId: '5', name: 'Approver × Status', type: 'Matrix' },
    { entityId: '5', name: 'Approval History', type: 'Timeline' },
    // Employee Directory (Data Form)
    { entityId: '6', name: 'All Employees', type: 'Table' },
    { entityId: '6', name: 'Employee Cards', type: 'Gallery' },
    { entityId: '6', name: 'Bulk Import', type: 'Sheet' },
  ]

  // Reports grouped by entity. Four categories: Table, Chart, Pivot, Card.
  // Chart reports can carry a sub-type (Area / Bar variants / Line / Pie / etc.).
  const mockReports: Array<{ entityId: string; name: string; type: 'Table' | 'Chart' | 'Pivot' | 'Card'; chartSubtype?: 'Area' | 'Stacked Area' | 'Horizontal Bar' | 'Vertical Bar' | 'Stacked Horizontal Bar' | 'Stacked Vertical Bar' | '100% Stacked Vertical Bar' | '100% Stacked Horizontal Bar' | 'Line' | 'Combo' | 'Scatter' | 'Pie' | 'Doughnut'; description?: string }> = [
    // Leave Request (Process)
    { entityId: '1', name: 'Leave Requests by Status', type: 'Chart', chartSubtype: 'Stacked Vertical Bar', description: 'Number of requests by status, stacked by leave type, over the current quarter.' },
    { entityId: '1', name: 'Approvals Funnel', type: 'Chart', chartSubtype: 'Combo', description: 'Submitted vs. approved vs. rejected counts per month with a trailing trend line.' },
    { entityId: '1', name: 'Requests Summary', type: 'Table', description: 'Tabular roll-up of requests with submitter, approver, and current step.' },
    { entityId: '1', name: 'Leave Type × Department', type: 'Pivot', description: 'Cross-tab of leave-type rows against department columns, counting requests.' },
    // Leave Balance (Data Form)
    { entityId: '2', name: 'Balance Utilization', type: 'Chart', chartSubtype: 'Horizontal Bar', description: 'Used vs. available days per employee for the current year.' },
    { entityId: '2', name: 'Balance Overview Cards', type: 'Card', description: 'KPI cards for total allocated, used, available, and carry-over days.' },
    { entityId: '2', name: 'Leave Mix', type: 'Chart', chartSubtype: 'Pie', description: 'Share of used days across leave types.' },
    // Holiday Calendar (Data Form)
    { entityId: '3', name: 'Holidays by Country', type: 'Pivot', description: 'Country rows against month columns, marking holiday counts.' },
    { entityId: '3', name: 'Holiday Density', type: 'Chart', chartSubtype: 'Area', description: 'Number of holidays per month over the year.' },
    // Time-off Policy (Data Form)
    { entityId: '4', name: 'Policy Coverage', type: 'Table', description: 'Each policy with applicable employee groups, allocation, and accrual rate.' },
    { entityId: '4', name: 'Allocation by Policy', type: 'Chart', chartSubtype: 'Vertical Bar', description: 'Annual allocation in days for each active policy.' },
    // Approval Workflow (Board)
    { entityId: '5', name: 'Cycle Time by Step', type: 'Chart', chartSubtype: 'Line', description: 'Average time spent in each step over the last 90 days.' },
    { entityId: '5', name: 'Approver Throughput', type: 'Chart', chartSubtype: 'Stacked Horizontal Bar', description: 'Items processed per approver, stacked by outcome.' },
    { entityId: '5', name: 'Pipeline Snapshot', type: 'Card', description: 'KPI cards for active items, blocked items, and median age.' },
    // Employee Directory (Data Form)
    { entityId: '6', name: 'Headcount by Department', type: 'Chart', chartSubtype: 'Doughnut', description: 'Share of employees across departments.' },
    { entityId: '6', name: 'Hiring Trend', type: 'Chart', chartSubtype: 'Line', description: 'Joins per month over the trailing year.' },
    { entityId: '6', name: 'Employee Distribution', type: 'Pivot', description: 'Department rows against employment-type columns.' },
    { entityId: '6', name: 'Directory Snapshot', type: 'Table', description: 'Flat list of all active employees with manager and join date.' },
  ]

  // Navigations: each navigation is a tree of menus / sub-menus. Every node maps to exactly one page.
  const mockNavigations: NavigationData[] = [
    {
      id: 'nav-1',
      name: 'Employee Nav',
      items: [
        { id: 'ep-home', label: 'Home', pageName: 'Employee Dashboard' },
        {
          id: 'ep-leave',
          label: 'Leave',
          children: [
            { id: 'ep-leave-my', label: 'My Requests', pageName: 'My Leave Requests' },
            { id: 'ep-leave-new', label: 'New Request', pageName: 'Submit Leave Request' },
            { id: 'ep-leave-bal', label: 'My Balance', pageName: 'My Leave Balance' },
          ],
        },
        {
          id: 'ep-calendar',
          label: 'Calendar',
          children: [
            { id: 'ep-cal-team', label: 'Team Calendar', pageName: 'Team Leave Calendar' },
            { id: 'ep-cal-holiday', label: 'Holidays', pageName: 'Holiday Calendar' },
          ],
        },
        { id: 'ep-profile', label: 'Profile', pageName: 'Employee Profile' },
      ],
    },
    {
      id: 'nav-2',
      name: 'HR Nav',
      items: [
        { id: 'hr-home', label: 'Overview', pageName: 'HR Overview Dashboard' },
        {
          id: 'hr-requests',
          label: 'Requests',
          children: [
            { id: 'hr-req-pending', label: 'Pending', pageName: 'Pending Leave Requests' },
            { id: 'hr-req-approved', label: 'Approved', pageName: 'Approved Leave Requests' },
            { id: 'hr-req-rejected', label: 'Rejected', pageName: 'Rejected Leave Requests' },
            { id: 'hr-req-all', label: 'All Requests', pageName: 'All Leave Requests' },
          ],
        },
        {
          id: 'hr-balances',
          label: 'Balances',
          children: [
            { id: 'hr-bal-all', label: 'All Balances', pageName: 'All Leave Balances' },
            { id: 'hr-bal-adjust', label: 'Adjust Balance', pageName: 'Balance Adjustment Form' },
          ],
        },
        {
          id: 'hr-config',
          label: 'Configuration',
          children: [
            { id: 'hr-cfg-policy', label: 'Time-off Policies', pageName: 'Time-off Policy List' },
            { id: 'hr-cfg-holiday', label: 'Holiday Calendar', pageName: 'Holiday Calendar Admin' },
          ],
        },
        { id: 'hr-reports', label: 'Reports', pageName: 'HR Reports Hub' },
      ],
    },
    {
      id: 'nav-3',
      name: 'Manager Nav',
      items: [
        { id: 'mg-inbox', label: 'My Inbox', pageName: 'Manager Inbox' },
        {
          id: 'mg-team',
          label: 'Team',
          children: [
            { id: 'mg-team-cal', label: 'Team Calendar', pageName: 'Team Leave Calendar' },
            { id: 'mg-team-bal', label: 'Team Balances', pageName: 'Team Leave Balances' },
          ],
        },
        { id: 'mg-history', label: 'Decision History', pageName: 'My Decision History' },
      ],
    },
  ]

  // Helper function to get entity type icon and color
  const getEntityTypeIcon = (type: 'Data Form' | 'Board' | 'Process') => {
    switch (type) {
      case 'Data Form':
        return { icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'Board':
        return { icon: LayoutGrid, color: 'text-purple-600', bgColor: 'bg-purple-50' }
      case 'Process':
        return { icon: Workflow, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    }
  }

  // Workflows mock data - only for Process and Board entities
  type WorkflowAssignee =
    | { kind: 'user'; initials: string; name: string; bgColor: string }
    | { kind: 'mapping'; label: string }
  const mockWorkflows: Array<{
    id: string
    entityId: string
    entityName: string
    entityType: 'Process' | 'Board'
    steps: Array<{
      id: string
      name: string
      description: string
      assignee: WorkflowAssignee
      trigger: string
      isStart?: boolean
    }>
  }> = [
    {
      id: 'wf-1',
      entityId: '1', // Leave Request (Process)
      entityName: 'Leave Request',
      entityType: 'Process',
      steps: [
        { id: 'step-1', name: 'Draft', description: 'Employee creates leave request', assignee: { kind: 'user', initials: 'AA', name: 'Anita A.', bgColor: 'bg-green-500' }, trigger: 'Happens always', isStart: true },
        { id: 'step-2', name: 'Manager Review', description: 'Manager reviews and approves/rejects', assignee: { kind: 'mapping', label: 'Employee.Reporting Manager' }, trigger: 'When submitted' },
        { id: 'step-3', name: 'HR Approval', description: 'HR team final approval', assignee: { kind: 'mapping', label: 'HR Team.Approver' }, trigger: 'When manager approves' },
        { id: 'step-4', name: 'Approved', description: 'Leave request approved', assignee: { kind: 'user', initials: 'SY', name: 'System', bgColor: 'bg-blue-500' }, trigger: 'On HR approval' },
        { id: 'step-5', name: 'Rejected', description: 'Leave request rejected', assignee: { kind: 'user', initials: 'SY', name: 'System', bgColor: 'bg-red-500' }, trigger: 'On rejection' },
      ]
    },
    {
      id: 'wf-2',
      entityId: '5', // Approval Workflow (Board)
      entityName: 'Approval Workflow',
      entityType: 'Board',
      steps: [
        { id: 'level-1', name: 'Backlog', description: 'Pending items', assignee: { kind: 'user', initials: 'TM', name: 'Team', bgColor: 'bg-gray-400' }, trigger: 'Happens always', isStart: true },
        { id: 'level-2', name: 'In Progress', description: 'Currently being processed', assignee: { kind: 'mapping', label: 'Request.Assignee' }, trigger: 'When picked up' },
        { id: 'level-3', name: 'Review', description: 'Under review', assignee: { kind: 'mapping', label: 'Reviewer Mapping.Mapped User' }, trigger: 'When marked ready' },
        { id: 'level-4', name: 'Done', description: 'Completed items', assignee: { kind: 'user', initials: 'SY', name: 'System', bgColor: 'bg-green-500' }, trigger: 'On approval' },
      ]
    },
  ]
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  // Permissions mock data - Role → Data Entity hierarchy
  const mockRoles = [
    {
      id: 'role-1',
      name: 'Employee',
      description: 'Regular employees who can submit and view their own requests',
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      permissions: [
        {
          entityId: '1',
          entityName: 'Leave Request',
          canView: true,
          canCreate: true,
          canEdit: 'own', // 'all', 'own', 'none'
          canDelete: false,
          fieldPermissions: [
            { fieldId: 'employee_name', canView: true, canEdit: false },
            { fieldId: 'leave_type', canView: true, canEdit: true },
            { fieldId: 'start_date', canView: true, canEdit: true },
            { fieldId: 'end_date', canView: true, canEdit: true },
            { fieldId: 'reason', canView: true, canEdit: true },
            { fieldId: 'manager', canView: true, canEdit: false },
            { fieldId: 'status', canView: true, canEdit: false },
          ],
          actionPermissions: [
            { action: 'Submit', allowed: true },
            { action: 'Approve', allowed: false },
            { action: 'Reject', allowed: false },
            { action: 'Cancel', allowed: true },
          ]
        },
        {
          entityId: '2',
          entityName: 'Leave Balance',
          canView: true,
          canCreate: false,
          canEdit: 'none',
          canDelete: false,
          fieldPermissions: [],
          actionPermissions: []
        },
      ]
    },
    {
      id: 'role-2',
      name: 'Manager',
      description: 'Team managers who can approve/reject team member requests',
      color: 'bg-green-100',
      textColor: 'text-green-700',
      permissions: [
        {
          entityId: '1',
          entityName: 'Leave Request',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: false,
          fieldPermissions: [
            { fieldId: 'employee_name', canView: true, canEdit: false },
            { fieldId: 'leave_type', canView: true, canEdit: true },
            { fieldId: 'start_date', canView: true, canEdit: true },
            { fieldId: 'end_date', canView: true, canEdit: true },
            { fieldId: 'reason', canView: true, canEdit: true },
            { fieldId: 'manager', canView: true, canEdit: true },
            { fieldId: 'status', canView: true, canEdit: true },
          ],
          actionPermissions: [
            { action: 'Submit', allowed: true },
            { action: 'Approve', allowed: true },
            { action: 'Reject', allowed: true },
            { action: 'Cancel', allowed: true },
          ]
        },
        {
          entityId: '2',
          entityName: 'Leave Balance',
          canView: true,
          canCreate: false,
          canEdit: 'own',
          canDelete: false,
          fieldPermissions: [],
          actionPermissions: []
        },
        {
          entityId: '5',
          entityName: 'Approval Workflow',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: false,
          fieldPermissions: [],
          actionPermissions: [
            { action: 'Move to In Progress', allowed: true },
            { action: 'Move to Review', allowed: true },
            { action: 'Move to Done', allowed: true },
          ]
        },
      ]
    },
    {
      id: 'role-3',
      name: 'HR Admin',
      description: 'HR administrators with full access to all leave management',
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      permissions: [
        {
          entityId: '1',
          entityName: 'Leave Request',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: true,
          fieldPermissions: [
            { fieldId: 'employee_name', canView: true, canEdit: true },
            { fieldId: 'leave_type', canView: true, canEdit: true },
            { fieldId: 'start_date', canView: true, canEdit: true },
            { fieldId: 'end_date', canView: true, canEdit: true },
            { fieldId: 'reason', canView: true, canEdit: true },
            { fieldId: 'manager', canView: true, canEdit: true },
            { fieldId: 'status', canView: true, canEdit: true },
          ],
          actionPermissions: [
            { action: 'Submit', allowed: true },
            { action: 'Approve', allowed: true },
            { action: 'Reject', allowed: true },
            { action: 'Cancel', allowed: true },
            { action: 'Override', allowed: true },
          ]
        },
        {
          entityId: '2',
          entityName: 'Leave Balance',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: true,
          fieldPermissions: [],
          actionPermissions: []
        },
        {
          entityId: '3',
          entityName: 'Holiday Calendar',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: true,
          fieldPermissions: [],
          actionPermissions: []
        },
        {
          entityId: '4',
          entityName: 'Time-off Policy',
          canView: true,
          canCreate: true,
          canEdit: 'all',
          canDelete: true,
          fieldPermissions: [],
          actionPermissions: []
        },
      ]
    },
  ]
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [dataEntityTab, setDataEntityTab] = useState<'fields' | 'permissions'>('fields')

  const permissionColumnsForEntityType = (type: 'Data Form' | 'Board' | 'Process'): string[] => {
    if (type === 'Data Form') return ['Read-only', 'Edit', 'Manage']
    if (type === 'Board') return ['Read-only', 'Initiate', 'Edit', 'Manage']
    return ['Initiate', 'Manage']
  }

  const roleSelectedPermForEntity = (role: typeof mockRoles[number], entityId: string, cols: string[]): string => {
    const p = role.permissions.find(rp => rp.entityId === entityId)
    if (p) {
      // Priority: highest applicable level the role qualifies for AND that exists in cols
      const priority: Array<{ level: string; granted: boolean }> = [
        { level: 'Manage', granted: p.canDelete === true },
        { level: 'Edit', granted: p.canEdit === 'all' || p.canEdit === 'own' },
        { level: 'Initiate', granted: p.canCreate === true },
        { level: 'Read-only', granted: p.canView === true },
      ]
      for (const { level, granted } of priority) {
        if (granted && cols.includes(level)) return level
      }
    }
    // Fallback: lowest available column (guarantees at least one selection per role)
    return cols[0]
  }

  const [activeView, setActiveView] = useState<'form' | 'workflow' | 'permission' | 'views' | 'reports' | 'share' | 'settings' | 'view-detail' | 'report-detail' | 'component-detail'>('form')

  // Component state
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null)
  const [isComponentNewlyCreated, setIsComponentNewlyCreated] = useState(false)

  // Callback to add nav items to preview from Copilot
  const [addNavItemCallback, setAddNavItemCallback] = useState<
    ((pageId: string, pageLabel: string) => void) | null
  >(null)
  const [switchToPageCallback, setSwitchToPageCallback] = useState<
    ((pageId: string) => void) | null
  >(null)
  const [components, setComponents] = useState<ComponentData[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)

  // Views state
  const [views, setViews] = useState<View[]>([])
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [isLoadingViews, setIsLoadingViews] = useState(false)

  // Reports state
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // View create dialog state
  const [viewCreateDialogOpen, setViewCreateDialogOpen] = useState(false)
  const [isCreatingView, setIsCreatingView] = useState(false)

  // Report create dialog state
  const [reportCreateDialogOpen, setReportCreateDialogOpen] = useState(false)
  const [isCreatingReport, setIsCreatingReport] = useState(false)

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [entityDetails, setEntityDetails] = useState<{ name: string; description?: string } | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // Duplicate dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Mode state: 'play' | 'spec-x' | 'spec-y' | 'build'
  const [mode, setMode] = useState<'play' | 'spec-x' | 'spec-y' | 'build'>('play')

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const handleTabClose = (tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId))
    // If closing active tab, switch to the first remaining tab
    if (tabId === activeTabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId)
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id)
      }
    }
  }

  // Handle create item from sidebar
  const handleCreateItem = (type: string) => {
    setCreateType(type)
    setCreateDialogOpen(true)
  }

  // Handle data form creation
  const handleDataFormCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'dataform',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create data form')
      }

      const result = await response.json()
      const newDataForm = result.data

      // Create new tab for the data form
      const newTab: Tab = {
        id: `dataform-${newDataForm.id}`,
        label: newDataForm.name,
        icon: ClipboardList,
        closable: true,
        type: 'dataform',
        entityId: newDataForm.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create data form:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle board creation
  const handleBoardCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'board',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create board')
      }

      const result = await response.json()
      const newBoard = result.data

      // Create new tab for the board
      const newTab: Tab = {
        id: `board-${newBoard.id}`,
        label: newBoard.name,
        icon: LayoutGrid,
        closable: true,
        type: 'board',
        entityId: newBoard.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle process creation
  const handleProcessCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'process',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create process')
      }

      const result = await response.json()
      const newProcess = result.data

      // Create new tab for the process
      const newTab: Tab = {
        id: `process-${newProcess.id}`,
        label: newProcess.name,
        icon: Workflow,
        closable: true,
        type: 'process',
        entityId: newProcess.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create process:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle navigation creation
  const handleNavigationCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/navigations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create navigation')
      }

      const result = await response.json()
      const newNavigation = result.data

      // Create new tab for the navigation
      const newTab: Tab = {
        id: `navigation-${newNavigation.id}`,
        label: newNavigation.name,
        icon: Navigation,
        closable: true,
        type: 'navigation',
        entityId: newNavigation.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create navigation:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle page creation
  const handlePageCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create page')
      }

      const result = await response.json()
      const newPage = result.data

      // Create new tab for the page
      const newTab: Tab = {
        id: `page-${newPage.id}`,
        label: newPage.name,
        icon: FileText,
        closable: true,
        type: 'page',
        entityId: newPage.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create page:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle list creation
  const handleListCreate = async (data: { name: string; description?: string }) => {
    if (!appId) return

    setIsCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/data-layers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: 'list',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create list')
      }

      const result = await response.json()
      const newList = result.data

      // Create new tab for the list
      const newTab: Tab = {
        id: `list-${newList.id}`,
        label: newList.name,
        icon: List,
        closable: true,
        type: 'list',
        entityId: newList.id,
      }

      // Add tab and switch to it
      setTabs((prevTabs) => [...prevTabs, newTab])
      setActiveTabId(newTab.id)

      // Close dialog
      setCreateDialogOpen(false)
      setCreateType(null)
    } catch (error) {
      console.error('Failed to create list:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Get the active tab
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  // Fetch views when navigating to views page
  useEffect(() => {
    if (activeView === 'views' && activeTab?.entityId) {
      setIsLoadingViews(true)
      listViews(activeTab.entityId)
        .then(views => setViews(views.filter(v => !v.isDefault)))
        .catch(console.error)
        .finally(() => setIsLoadingViews(false))
    }
  }, [activeView, activeTab?.entityId])

  // Fetch reports when navigating to reports page
  useEffect(() => {
    if (activeView === 'reports' && activeTab?.entityId) {
      setIsLoadingReports(true)
      listReports(activeTab.entityId)
        .then(reports => setReports(reports.filter(r => !r.isDefault)))
        .catch(console.error)
        .finally(() => setIsLoadingReports(false))
    }
  }, [activeView, activeTab?.entityId])

  // Fetch components when navigating to components tab
  useEffect(() => {
    if (activeTab?.type === 'components' && appId) {
      setIsLoadingComponents(true)
      fetchComponentsApi(appId)
        .then(fetchedComponents => {
          const componentData: ComponentData[] = fetchedComponents.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            type: c.type,
            method: c.method,
            prompt: c.prompt || undefined,
            status: 'draft' as const,
            createdAt: new Date(c.createdAt),
          }))
          setComponents(componentData)
        })
        .catch(console.error)
        .finally(() => setIsLoadingComponents(false))
    }
  }, [activeTab?.type, appId])

  // Handle view change (form/workflow/permission switcher)
  const handleViewChange = (view: 'form' | 'workflow' | 'permission') => {
    setActiveView(view)
  }

  // Handle views button click - navigate to views drill-through
  const handleViewsClick = () => {
    setActiveView('views')
  }

  // Handle reports button click - navigate to reports drill-through
  const handleReportsClick = () => {
    setActiveView('reports')
  }

  // Handle share button click - navigate to share drill-through
  const handleShareClick = () => {
    setActiveView('share')
  }

  // Handle settings button click - navigate to settings drill-through
  const handleSettingsClick = () => {
    setActiveView('settings')
  }

  // Handle component click - navigate to component detail
  const handleComponentClick = (component: ComponentData, isNewlyCreated = false) => {
    setSelectedComponent(component)
    setIsComponentNewlyCreated(isNewlyCreated)
    setActiveView('component-detail')
  }

  // Handle adding a new component
  const handleAddComponent = (component: ComponentData) => {
    setComponents(prev => [...prev, component])
  }

  // Handle duplicating a component
  const handleDuplicateComponent = (component: ComponentData) => {
    const duplicated: ComponentData = {
      ...component,
      id: `component-${Date.now()}`,
      name: `${component.name} (Copy)`,
      createdAt: new Date(),
    }
    setComponents(prev => [...prev, duplicated])
  }

  // Handle breadcrumb back - return to previous view
  const handleBreadcrumbBack = () => {
    if (activeView === 'view-detail') {
      setActiveView('views')
      setSelectedView(null)
    } else if (activeView === 'report-detail') {
      setActiveView('reports')
      setSelectedReport(null)
    } else if (activeView === 'component-detail') {
      setActiveView('form')
      setSelectedComponent(null)
    } else {
      setActiveView('form')
    }
  }

  // Handle breadcrumb middle click (for three-level navigation)
  const handleBreadcrumbMiddleClick = () => {
    if (activeView === 'view-detail') {
      setActiveView('views')
      setSelectedView(null)
    } else if (activeView === 'report-detail') {
      setActiveView('reports')
      setSelectedReport(null)
    }
  }

  // Handle view card click - navigate to view detail
  const handleViewClick = (view: View) => {
    setSelectedView(view)
    setActiveView('view-detail')
  }

  // Handle report card click - navigate to report detail
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setActiveView('report-detail')
  }

  // Handle new view button click
  const handleNewViewClick = () => {
    setViewCreateDialogOpen(true)
  }

  // Handle new report button click
  const handleNewReportClick = () => {
    setReportCreateDialogOpen(true)
  }

  // Handle report creation
  const handleReportCreate = async (data: { name: string; type: ReportType }) => {
    if (!activeTab?.entityId) return

    setIsCreatingReport(true)
    try {
      const newReport = await createReport(activeTab.entityId, {
        name: data.name,
        type: data.type,
      })

      setReportCreateDialogOpen(false)
      setSelectedReport(newReport)
      setActiveView('report-detail')
    } catch (error) {
      console.error('Failed to create report:', error)
    } finally {
      setIsCreatingReport(false)
    }
  }

  // Handle view creation
  const handleViewCreate = async (data: { name: string; type: string }) => {
    if (!activeTab?.entityId) return

    setIsCreatingView(true)
    try {
      const newView = await createView(activeTab.entityId, {
        name: data.name,
        type: data.type as 'datatable' | 'gallery' | 'sheet',
      })

      setViewCreateDialogOpen(false)
      setSelectedView(newView)
      setActiveView('view-detail')
    } catch (error) {
      console.error('Failed to create view:', error)
    } finally {
      setIsCreatingView(false)
    }
  }

  // Handle rename click - fetch entity details and open dialog
  const handleRenameClick = async () => {
    if (!activeTab?.entityId) return

    setRenameDialogOpen(true)
    setIsFetchingDetails(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/data-layers/${activeTab.entityId}`
      )
      if (response.ok) {
        const result = await response.json()
        setEntityDetails({
          name: result.data.name,
          description: result.data.description || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch entity details:', error)
      // Fallback to tab label
      setEntityDetails({ name: activeTab.label, description: '' })
    } finally {
      setIsFetchingDetails(false)
    }
  }

  // Handle rename submit
  const handleRename = async (data: { name: string; description?: string }) => {
    if (!activeTab?.entityId) return

    setIsRenaming(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/apps/${appId}/data-layers/${activeTab.entityId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Failed to rename')

      // Update tab label
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, label: data.name } : tab
      ))

      setRenameDialogOpen(false)
      setEntityDetails(null)
    } catch (error) {
      console.error('Rename failed:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  // Get module name for rename dialog
  const getModuleName = (type?: string): string => {
    switch (type) {
      case 'dataform': return 'Dataform'
      case 'board': return 'Board'
      case 'process': return 'Process'
      case 'list': return 'List'
      default: return 'Item'
    }
  }

  // Handle duplicate click - open duplicate dialog
  const handleDuplicateClick = () => {
    if (!activeTab?.entityId) return
    setDuplicateDialogOpen(true)
  }

  // Handle duplicate submit
  const handleDuplicate = async (data: { name: string; includeViews: boolean; includeReports: boolean }) => {
    if (!activeTab?.entityId) return

    setIsDuplicating(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/apps/${appId}/data-layers/${activeTab.entityId}/duplicate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Failed to duplicate')

      const result = await response.json()
      const newDataLayer = result.data

      // Get icon for the new data layer type
      const getIconForType = (type: string) => {
        switch (type) {
          case 'dataform': return ClipboardList
          case 'board': return LayoutGrid
          case 'process': return Workflow
          case 'list': return List
          default: return ClipboardList
        }
      }

      // Create new tab and switch to it
      const newTab: Tab = {
        id: `${newDataLayer.type}-${newDataLayer.id}`,
        label: newDataLayer.name,
        icon: getIconForType(newDataLayer.type),
        closable: true,
        type: newDataLayer.type,
        entityId: newDataLayer.id,
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)

      setDuplicateDialogOpen(false)
    } catch (error) {
      console.error('Duplicate failed:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  // Generate breadcrumb for drill-through pages
  const getBreadcrumb = () => {
    if (activeView === 'view-detail' && selectedView && activeTab) {
      return {
        parent: activeTab.label,
        middle: 'Views',
        current: selectedView.name
      }
    }
    if (activeView === 'report-detail' && selectedReport && activeTab) {
      return {
        parent: activeTab.label,
        middle: 'Reports',
        current: selectedReport.name
      }
    }
    if (activeView === 'component-detail' && selectedComponent && activeTab) {
      return {
        parent: 'Components',
        current: selectedComponent.name
      }
    }
    if (activeView === 'views' && activeTab) {
      return { parent: activeTab.label, current: 'Views' }
    }
    if (activeView === 'reports' && activeTab) {
      return { parent: activeTab.label, current: 'Reports' }
    }
    if (activeView === 'share' && activeTab) {
      return { parent: activeTab.label, current: 'Share' }
    }
    if (activeView === 'settings' && activeTab) {
      return { parent: activeTab.label, current: 'Settings' }
    }
    return undefined
  }

  // Render content based on active tab type and active view
  const renderContent = () => {
    if (!activeTab || activeTab.type === 'home') {
      return children
    }

    // Handle view-detail (third-level drill-through)
    if (activeView === 'view-detail' && selectedView) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-gray-500">View editor for &ldquo;{selectedView.name}&rdquo; coming soon...</p>
        </div>
      )
    }

    // Handle report-detail (third-level drill-through)
    if (activeView === 'report-detail' && selectedReport) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-gray-500">Report editor for &ldquo;{selectedReport.name}&rdquo; coming soon...</p>
        </div>
      )
    }

    // Handle component-detail (component drill-through)
    if (activeView === 'component-detail' && selectedComponent) {
      return <ComponentEditor component={selectedComponent} appId={appId} isNewlyCreated={isComponentNewlyCreated} />
    }

    // Handle drill-through views (views, reports) for data layers
    if (activeView === 'views' && (activeTab.type === 'dataform' || activeTab.type === 'board' || activeTab.type === 'process' || activeTab.type === 'list')) {
      // Loading state - centered
      if (isLoadingViews) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )
      }

      // Empty state - centered with no header
      if (views.length === 0) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <Inbox className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500 mb-4">Your views will appear here.</p>
              <button
                onClick={handleNewViewClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                New view
              </button>
            </div>
          </div>
        )
      }

      // Has views - show header + grid
      return (
        <div className="h-full w-full bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Views</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search views..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-400 rounded-md bg-white placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 w-48"
                />
              </div>
              <button
                onClick={handleNewViewClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New view
              </button>
            </div>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {views.map(view => (
              <ViewCard key={view.id} view={view} onClick={handleViewClick} />
            ))}
          </div>
        </div>
      )
    }

    if (activeView === 'reports' && (activeTab.type === 'dataform' || activeTab.type === 'board' || activeTab.type === 'process' || activeTab.type === 'list')) {
      // Loading state - centered
      if (isLoadingReports) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )
      }

      // Empty state - centered with no header
      if (reports.length === 0) {
        return (
          <div className="h-full w-full bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <Inbox className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500 mb-4">Your reports will appear here.</p>
              <button
                onClick={handleNewReportClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                New report
              </button>
            </div>
          </div>
        )
      }

      // Has reports - show header + grid
      return (
        <div className="h-full w-full bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-400 rounded-md bg-white placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 w-48"
                />
              </div>
              <button
                onClick={handleNewReportClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New report
              </button>
            </div>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {reports.map(report => (
              <ReportCard key={report.id} report={report} onClick={handleReportClick} />
            ))}
          </div>
        </div>
      )
    }

    // Handle share drill-through for dataform, board, process
    if (activeView === 'share' && activeTab.type === 'dataform') {
      return <DataFormShareEditor dataFormName={activeTab.label} />
    }

    if (activeView === 'share' && (activeTab.type === 'board' || activeTab.type === 'process')) {
      return (
        <div className="h-full w-full bg-white flex items-center justify-center">
          <p className="text-gray-500">Share settings coming soon...</p>
        </div>
      )
    }

    // Handle settings drill-through for dataform, board, process
    if (activeView === 'settings' && activeTab.type === 'dataform') {
      return <DataFormSettingsEditor dataFormName={activeTab.label} />
    }

    if (activeView === 'settings' && (activeTab.type === 'board' || activeTab.type === 'process')) {
      return (
        <div className="h-full w-full bg-white flex items-center justify-center">
          <p className="text-gray-500">Settings coming soon...</p>
        </div>
      )
    }

    // For board and process, check the active view
    if (activeTab.type === 'board' || activeTab.type === 'process') {
      if (activeView === 'workflow') {
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {/* Empty workflow view */}
          </div>
        )
      }
      if (activeView === 'permission') {
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {/* Empty permission view */}
          </div>
        )
      }
    }

    if (activeTab.type === 'dataform' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="dataform"
        />
      )
    }

    if (activeTab.type === 'board' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="board"
        />
      )
    }

    if (activeTab.type === 'process' && activeTab.entityId) {
      return (
        <FormBuilder
          entityId={activeTab.entityId}
          entityName={activeTab.label}
          entityType="process"
        />
      )
    }

    if (activeTab.type === 'list' && activeTab.entityId) {
      return (
        <ListEditor
          entityId={activeTab.entityId}
          entityName={activeTab.label}
        />
      )
    }

    if (activeTab.type === 'navigation') {
      return <NavigationEditor navigationId={activeTab.entityId} navigationName={activeTab.label} />
    }

    if (activeTab.type === 'page' && activeTab.entityId) {
      return <PageEditor pageId={activeTab.entityId} pageName={activeTab.label} />
    }

    if (activeTab.type === 'variables') {
      return <VariablesEditor />
    }

    if (activeTab.type === 'resources') {
      return <ResourcesEditor />
    }

    if (activeTab.type === 'components') {
      return (
        <ComponentsEditor
          appId={appId}
          components={components}
          isLoading={isLoadingComponents}
          onComponentClick={handleComponentClick}
          onAddComponent={handleAddComponent}
          onDuplicateComponent={handleDuplicateComponent}
        />
      )
    }

    if (activeTab.type === 'permissions') {
      return <RolesEditor appId={appId} />
    }

    // Default fallback
    return children
  }

  return (
    <BuilderThemeRoot className="h-screen flex flex-col bg-gradient-to-br from-slate-200 via-blue-100 to-purple-100">
      {/* Top Bar */}
      <header className="flex-shrink-0">
        <div className="h-11">
          <BuilderTopBar
            appName={appName}
            appIcon={appIcon}
            appIconBg={appIconBg}
            onNameChange={onNameChange}
            recentApps={[
              { id: '1', name: 'Test App', icon: 'Puzzle', iconBg: '#F97316' },
              { id: '2', name: 'Procurement app', icon: 'ShoppingCart', iconBg: '#EC4899' },
              { id: '3', name: 'Order Management', icon: 'Package', iconBg: '#14B8A6' },
              { id: '4', name: 'Test application', icon: 'Component', iconBg: '#8B5CF6' },
              { id: '5', name: 'EM Test', icon: 'User', iconBg: '#10B981' },
            ]}
            onAppSwitch={(appId) => console.log('Switch to app:', appId)}
            onGoToExplorer={() => console.log('Go to explorer')}
            mode={mode}
            onModeChange={(newMode) => setMode(newMode)}
          />
        </div>
      </header>

      {/* Main area with sidebar and content */}
      <div className="flex-1 flex overflow-hidden">
        {mode === 'play' ? (
          // Play Mode Layout
          <>
            {/* Copilot Panel - 320px with spacing */}
            <CopilotPanel
              appName={appName}
              appDescription={appDescription}
              appIcon={appIcon}
              appIconBg={appIconBg}
              onAddPageToPreview={addNavItemCallback}
              onSwitchToPage={switchToPageCallback}
            />

            {/* Runtime Preview - remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-transparent pr-2 pb-2">
                <AppRuntimePreview
                  appName={appName}
                  appIcon={appIcon}
                  appIconBg={appIconBg}
                  onAddNavItem={(callback) => setAddNavItemCallback(() => callback)}
                  onSwitchToPage={(callback) => setSwitchToPageCallback(() => callback)}
                />
              </div>
            </div>
          </>
        ) : mode === 'spec-x' ? (
          // Spec X Mode Layout (Original two-column layout)
          <>
            {/* Copilot Panel - 320px with spacing */}
            <CopilotPanel
              appName={appName}
              appDescription={appDescription}
              appIcon={appIcon}
              appIconBg={appIconBg}
              onAddPageToPreview={addNavItemCallback}
              onSwitchToPage={switchToPageCallback}
            />

            {/* Spec Content Area - remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white pr-2 pb-2">
                <div className="flex-1 bg-white flex flex-col">
                  {/* App Header Section */}
                  <div className="p-4 pb-0 flex-shrink-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {/* App Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: appIconBg }}
                        >
                          <AppIcon name={appIcon} className="h-5 w-5 text-white" />
                        </div>

                        {/* App Info */}
                        <div className="flex-1">
                          <h1 className="text-base font-semibold text-gray-900 mb-1">
                            {appName}
                          </h1>
                          {appDescription && (
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              {appDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout: Blueprint Nav + Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="bg-white border border-gray-200 rounded-lg flex flex-1">
                      {/* Left: Blueprint Navigation */}
                      <div className="w-[180px] border-r border-gray-200 p-3 flex-shrink-0">
                        <nav className="space-y-1.5">
                          <button
                            onClick={() => setSelectedBlueprintSection('roles')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'roles'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <UserKey className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            App Roles
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('data-entities')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'data-entities'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Database className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Data entities
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('workflows')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'workflows'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Workflow className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Workflows
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('permissions')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'permissions'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Permissions
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('views')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'views'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <LayoutGrid className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Views
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('reports')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'reports'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <FileBarChart className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Reports
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('interface')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'interface'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Layout className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Interface
                          </button>
                          <button
                            onClick={() => setSelectedBlueprintSection('integrations')}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'integrations'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Plug className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Integrations
                          </button>
                        </nav>
                      </div>

                      {/* Right: Content Area */}
                      <div className="flex-1 overflow-auto p-4">
                        {selectedBlueprintSection === 'roles' && (
                          <>
                            {/* Application Roles Section */}
                            <div>
                              <h2 className="text-base font-semibold text-gray-900 mb-4">App Roles</h2>

                              <div className="space-y-6">
                                {/* Employee Role */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Employee</h3>
                                  </div>
                                  <div className="space-y-2 ml-6">
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can submit leave requests for vacation, sick leave, and other time-off types.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can view their current leave balance and accrual history across all leave types.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can track the approval status of submitted requests and receive notifications.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Manager Role */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Manager</h3>
                                  </div>
                                  <div className="space-y-2 ml-6">
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can approve or reject leave requests from direct reports with optional comments.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can view team calendar to check availability and plan coverage during leave periods.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can generate team leave reports and analyze leave patterns for better resource planning.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* HR Admin Role */}
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">HR Admin</h3>
                                  </div>
                                  <div className="space-y-2 ml-6">
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can configure company-wide leave policies (types, accrual rates, blackout periods).
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can manually adjust user leave balances and manage carryover rules.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can generate audit logs of all leave-related actions so that I can ensure compliance and trace any discrepancies.
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-[13px] text-gray-600 leading-relaxed">
                                        Can assign and revoke user roles and permissions so that only authorised people can approve, submit, or view leave data.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {selectedBlueprintSection === 'data-entities' && (
                          <>
                            {/* Data Entities Section */}
                            <div className="flex flex-col h-full">
                              {/* Header with Title and Relationships Link */}
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-900">Data Entities</h2>
                                <button
                                  onClick={() => setShowRelationships(true)}
                                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                  <Network className="h-3.5 w-3.5" />
                                  Show relationships
                                </button>
                              </div>

                              {/* Relationships Popover */}
                              {showRelationships && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRelationships(false)}>
                                  <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ width: '900px', height: '700px' }} onClick={(e) => e.stopPropagation()}>
                                    {/* Popover Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ height: '60px' }}>
                                      <div className="flex items-center gap-2">
                                        <Network className="h-5 w-5 text-gray-700" />
                                        <h3 className="text-base font-semibold text-gray-900">Data Entity Relationships</h3>
                                      </div>
                                      <button
                                        onClick={() => setShowRelationships(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <X className="h-5 w-5" />
                                      </button>
                                    </div>

                                    {/* React Flow Diagram - Fixed 640px height */}
                                    <div style={{ width: '100%', height: '640px' }}>
                                      <ReactFlowProvider>
                                        <ReactFlow
                                          nodes={[
                                            {
                                              id: 'employee-directory',
                                              type: 'entity',
                                              position: { x: 50, y: 50 },
                                              data: {
                                                label: 'Employee Directory',
                                                type: 'Data Form',
                                                fields: ['Employee Name', 'Email', 'Manager']
                                              }
                                            },
                                            {
                                              id: 'leave-request',
                                              type: 'entity',
                                              position: { x: 350, y: 50 },
                                              data: {
                                                label: 'Leave Request',
                                                type: 'Process',
                                                fields: ['Employee Name', 'Leave Type', 'Start/End Date', 'Manager']
                                              }
                                            },
                                            {
                                              id: 'leave-balance',
                                              type: 'entity',
                                              position: { x: 650, y: 50 },
                                              data: {
                                                label: 'Leave Balance',
                                                type: 'Data Form',
                                                fields: ['Employee', 'Leave Type', 'Total Days']
                                              }
                                            },
                                            {
                                              id: 'timeoff-policy',
                                              type: 'entity',
                                              position: { x: 200, y: 300 },
                                              data: {
                                                label: 'Time-off Policy',
                                                type: 'Data Form',
                                                fields: ['Policy Name', 'Leave Type', 'Annual Allocation']
                                              }
                                            },
                                            {
                                              id: 'approval-workflow',
                                              type: 'entity',
                                              position: { x: 500, y: 300 },
                                              data: {
                                                label: 'Approval Workflow',
                                                type: 'Board',
                                                fields: ['Request ID', 'Employee', 'Approver']
                                              }
                                            }
                                          ]}
                                          edges={[
                                            {
                                              id: 'e1',
                                              source: 'employee-directory',
                                              target: 'leave-request',
                                              type: 'smoothstep',
                                              animated: true,
                                              label: 'Employee',
                                              labelStyle: { fontSize: 10, fill: '#4B5563', fontWeight: 500 },
                                              labelBgStyle: { fill: '#F9FAFB', fillOpacity: 0.9 },
                                              labelBgPadding: [4, 6],
                                              labelBgBorderRadius: 4,
                                              style: { stroke: '#9CA3AF', strokeWidth: 2 }
                                            },
                                            {
                                              id: 'e2',
                                              source: 'leave-request',
                                              target: 'leave-balance',
                                              type: 'smoothstep',
                                              animated: true,
                                              label: 'Updates Balance',
                                              labelStyle: { fontSize: 10, fill: '#4B5563', fontWeight: 500 },
                                              labelBgStyle: { fill: '#F9FAFB', fillOpacity: 0.9 },
                                              labelBgPadding: [4, 6],
                                              labelBgBorderRadius: 4,
                                              style: { stroke: '#9CA3AF', strokeWidth: 2 }
                                            },
                                            {
                                              id: 'e3',
                                              source: 'leave-request',
                                              target: 'approval-workflow',
                                              type: 'smoothstep',
                                              animated: true,
                                              label: 'Triggers',
                                              labelStyle: { fontSize: 10, fill: '#4B5563', fontWeight: 500 },
                                              labelBgStyle: { fill: '#F9FAFB', fillOpacity: 0.9 },
                                              labelBgPadding: [4, 6],
                                              labelBgBorderRadius: 4,
                                              style: { stroke: '#9CA3AF', strokeWidth: 2 }
                                            },
                                            {
                                              id: 'e4',
                                              source: 'timeoff-policy',
                                              target: 'leave-request',
                                              type: 'smoothstep',
                                              animated: true,
                                              label: 'Governs Rules',
                                              labelStyle: { fontSize: 10, fill: '#4B5563', fontWeight: 500 },
                                              labelBgStyle: { fill: '#F9FAFB', fillOpacity: 0.9 },
                                              labelBgPadding: [4, 6],
                                              labelBgBorderRadius: 4,
                                              style: { stroke: '#9CA3AF', strokeWidth: 2 }
                                            }
                                          ]}
                                          nodeTypes={nodeTypes}
                                          fitView
                                          fitViewOptions={{ padding: 0.2 }}
                                          attributionPosition="bottom-left"
                                          minZoom={0.5}
                                          maxZoom={2}
                                          defaultEdgeOptions={{
                                            type: 'smoothstep',
                                            animated: true,
                                          }}
                                        >
                                          <Background />
                                          <Controls />
                                        </ReactFlow>
                                      </ReactFlowProvider>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Two Column Layout: List + Details */}
                              <div className="flex gap-6 flex-1 min-h-0">
                                {/* Left: Data Entities List */}
                                <div className="w-[200px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                  <div className="space-y-1.5">
                                    {mockDataEntities.map((entity) => {
                                      const { icon: Icon, color, bgColor } = getEntityTypeIcon(entity.type)
                                      return (
                                        <button
                                          key={entity.id}
                                          onClick={() => setSelectedDataEntity(entity.id)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                                            selectedDataEntity === entity.id
                                              ? 'bg-white'
                                              : 'hover:bg-white/50'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <div className={`${bgColor} rounded p-0.5 flex-shrink-0`}>
                                              <Icon className={`h-3 w-3 ${color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h3 className="text-[13px] font-normal truncate text-gray-900">
                                                {entity.name}
                                              </h3>
                                            </div>
                                          </div>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Right: Selected Entity Details */}
                                <div className="flex-1">
                                  {(() => {
                                    const selectedEntity = mockDataEntities.find(e => e.id === selectedDataEntity)
                                    if (!selectedEntity) return null

                                    const { icon: Icon, color, bgColor } = getEntityTypeIcon(selectedEntity.type)

                                    return (
                                      <div>
                                        {/* Header */}
                                        <div className="mb-4 flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                          <div className={`${bgColor} rounded p-1.5`}>
                                            <Icon className={`h-4 w-4 ${color}`} />
                                          </div>
                                          <h3 className="text-sm font-semibold text-gray-900">{selectedEntity.name}</h3>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                                          <button
                                            onClick={() => setDataEntityTab('fields')}
                                            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                                              dataEntityTab === 'fields'
                                                ? 'text-blue-700 border-blue-600'
                                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                            }`}
                                          >
                                            Fields
                                          </button>
                                          <button
                                            onClick={() => setDataEntityTab('permissions')}
                                            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                                              dataEntityTab === 'permissions'
                                                ? 'text-blue-700 border-blue-600'
                                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                            }`}
                                          >
                                            Permissions
                                          </button>
                                        </div>

                                        {dataEntityTab === 'fields' ? (
                                          /* Fields Table */
                                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full">
                                              <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field Name</th>
                                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field Type</th>
                                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field ID</th>
                                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Required</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {selectedEntity.fields.map((field, index) => (
                                                  <tr key={field.id} className={index !== selectedEntity.fields.length - 1 ? 'border-b border-gray-200' : ''}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{field.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{field.type}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{field.id}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                      {field.required ? (
                                                        <span className="text-green-600 text-xs font-medium">Yes</span>
                                                      ) : (
                                                        <span className="text-gray-400 text-xs font-medium">No</span>
                                                      )}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          /* Permissions Table (Role × Permission) */
                                          (() => {
                                            const cols = permissionColumnsForEntityType(selectedEntity.type)
                                            return (
                                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                  <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Role</th>
                                                      {cols.map(col => (
                                                        <th key={col} className="text-center px-4 py-2.5 text-xs font-semibold text-gray-700">{col}</th>
                                                      ))}
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {mockRoles.map((role, i) => {
                                                      const selectedCol = roleSelectedPermForEntity(role, selectedEntity.id, cols)
                                                      return (
                                                        <tr key={role.id} className={i !== mockRoles.length - 1 ? 'border-b border-gray-200' : ''}>
                                                          <td className="px-4 py-3 text-sm text-gray-900">{role.name}</td>
                                                          {cols.map(col => (
                                                            <td key={col} className="px-4 py-3 text-center">
                                                              {selectedCol === col ? (
                                                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                              ) : (
                                                                <span className="text-gray-300 text-sm">—</span>
                                                              )}
                                                            </td>
                                                          ))}
                                                        </tr>
                                                      )
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )
                                          })()
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {selectedBlueprintSection === 'workflows' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Workflows</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                Visual representation of approval steps for Process entities and levels for Board entities.
                              </p>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-0">
                              {/* Left: Workflow List */}
                              <div className="w-[200px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <div className="space-y-1.5">
                                  {mockWorkflows.map((workflow) => {
                                    const { icon: Icon, color, bgColor } = getEntityTypeIcon(workflow.entityType)
                                    const activeId = selectedWorkflow ?? mockWorkflows[0].id
                                    return (
                                      <button
                                        key={workflow.id}
                                        onClick={() => setSelectedWorkflow(workflow.id)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                                          activeId === workflow.id
                                            ? 'bg-white'
                                            : 'hover:bg-white/50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <div className={`${bgColor} rounded p-0.5 flex-shrink-0`}>
                                            <Icon className={`h-3 w-3 ${color}`} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h3 className="text-[13px] font-normal truncate text-gray-900">
                                              {workflow.entityName}
                                            </h3>
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Right: Selected Workflow Detail */}
                              <div className="flex-1 overflow-auto">
                                {(() => {
                                  const activeId = selectedWorkflow ?? mockWorkflows[0].id
                                  const workflow = mockWorkflows.find(w => w.id === activeId)
                                  if (!workflow) return null
                                  const { icon: Icon, color, bgColor } = getEntityTypeIcon(workflow.entityType)
                                  return (
                                    <div>
                                      {/* Header card */}
                                      <div className="mb-4 flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <div className={`${bgColor} rounded p-1.5`}>
                                            <Icon className={`h-4 w-4 ${color}`} />
                                          </div>
                                          <h3 className="text-sm font-semibold text-gray-900">{workflow.entityName}</h3>
                                        </div>
                                      </div>

                                      {/* Workflow Canvas (card stack) */}
                                      <div className="relative rounded-lg p-6">
                                        <div className="flex flex-col items-center gap-0">
                                          {workflow.steps.map((step, index) => (
                                            <div key={step.id} className="flex flex-col items-center w-full">
                                              {/* Card */}
                                              <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="text-sm font-semibold text-gray-900">{step.name}</h4>
                                                  {step.isStart && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
                                                      <Play className="h-3 w-3" />
                                                      Start
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                  {step.assignee.kind === 'user' ? (
                                                    <>
                                                      <div className={`h-6 w-6 rounded-full ${step.assignee.bgColor} flex items-center justify-center text-white text-[10px] font-medium`}>
                                                        {step.assignee.initials}
                                                      </div>
                                                      <span className="text-xs text-gray-700">{step.assignee.name}</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <ClipboardList className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                      <span className="text-xs text-gray-600 italic">{step.assignee.label}</span>
                                                    </>
                                                  )}
                                                </div>
                                                <div className="mt-2 border-t border-gray-100" />
                                                <div className="mt-2 flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5">
                                                    <Check className="h-3 w-3 text-green-600" />
                                                    <span className="text-[11px] text-gray-500">{step.trigger}</span>
                                                  </div>
                                                  <RefreshCw className="h-3 w-3 text-gray-400" />
                                                </div>
                                              </div>
                                              {/* Connector */}
                                              {index < workflow.steps.length - 1 && (
                                                <div className="w-px h-4 bg-gray-300" />
                                              )}
                                            </div>
                                          ))}
                                          {/* Terminal connector + Completed pill */}
                                          <div className="w-px h-4 bg-gray-300" />
                                          <span className="inline-flex items-center px-3 py-1 rounded-full border border-green-500 text-green-700 text-xs font-medium bg-white">
                                            Completed
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedBlueprintSection === 'permissions' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Permissions</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                Role-based access control showing permissions for each data entity.
                              </p>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-0">
                              {/* Left: Roles List */}
                              <div className="w-[200px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <div className="space-y-1.5">
                                  {mockRoles.map((role) => {
                                    const activeId = selectedRole ?? mockRoles[0].id
                                    return (
                                      <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                                          activeId === role.id
                                            ? 'bg-white'
                                            : 'hover:bg-white/50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <div className="bg-gray-200 rounded p-0.5 flex-shrink-0">
                                            <Users className="h-3 w-3 text-gray-700" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h3 className="text-[13px] font-medium truncate text-gray-900">
                                              {role.name}
                                            </h3>
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Right: Selected Role Detail */}
                              <div className="flex-1 overflow-auto">
                                {(() => {
                                  const activeId = selectedRole ?? mockRoles[0].id
                                  const role = mockRoles.find(r => r.id === activeId)
                                  if (!role) return null
                                  return (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                      {/* Role Header */}
                                      <div className={`${role.color} px-4 py-3 border-b border-gray-200`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Users className={`h-4 w-4 ${role.textColor}`} />
                                            <h3 className={`text-sm font-semibold ${role.textColor}`}>{role.name}</h3>
                                          </div>
                                          <span className="text-xs text-gray-600">{role.permissions.length} entities</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                                      </div>

                                      {/* Permissions Table */}
                                      <div className="overflow-x-auto">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-700">Data Entity</th>
                                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-700">View</th>
                                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-700">Create</th>
                                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-700">Edit</th>
                                              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-700">Delete</th>
                                              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-700">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {role.permissions.map((perm, index) => (
                                              <tr key={perm.entityId} className={index !== role.permissions.length - 1 ? 'border-b border-gray-200' : ''}>
                                                <td className="px-4 py-2.5 text-sm text-gray-900">{perm.entityName}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canView ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canCreate ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canEdit === 'all' ? (
                                                    <span className="text-xs font-medium text-green-600">All</span>
                                                  ) : perm.canEdit === 'own' ? (
                                                    <span className="text-xs font-medium text-yellow-600">Own</span>
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canDelete ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                  {perm.actionPermissions.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {perm.actionPermissions.filter(a => a.allowed).map((action) => (
                                                        <span key={action.action} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">
                                                          {action.action}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedBlueprintSection === 'views' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Views</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                Views available across the app's data entities, with their columns, filters, permissions, and behavior.
                              </p>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-0">
                              {/* Left: Views grouped by Entity */}
                              <div className="w-[220px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <div className="space-y-3">
                                  {mockDataEntities.map((entity) => {
                                    const entityViews = mockViews.filter(v => v.entityId === entity.id)
                                    if (entityViews.length === 0) return null
                                    const { icon: EIcon, color: eColor, bgColor: eBg } = getEntityTypeIcon(entity.type)
                                    const activeView = selectedViewInSpecX ?? { entityId: mockViews[0].entityId, viewName: mockViews[0].name }
                                    return (
                                      <div key={entity.id}>
                                        {/* Entity header */}
                                        <div className="flex items-center gap-1.5 px-2 py-1">
                                          <div className={`${eBg} rounded p-0.5 flex-shrink-0`}>
                                            <EIcon className={`h-3 w-3 ${eColor}`} />
                                          </div>
                                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 truncate">
                                            {entity.name}
                                          </h4>
                                        </div>
                                        {/* Nested views */}
                                        <div className="space-y-0.5 ml-1">
                                          {entityViews.map((view) => {
                                            const { icon: VIcon, color: vColor, bgColor: vBg } = getViewTypeIcon(view.type)
                                            const isActive = activeView.entityId === view.entityId && activeView.viewName === view.name
                                            return (
                                              <button
                                                key={`${view.entityId}-${view.name}`}
                                                onClick={() => setSelectedViewInSpecX({ entityId: view.entityId, viewName: view.name })}
                                                className={`w-full text-left pl-3 pr-2.5 py-1.5 rounded-md transition-colors ${
                                                  isActive ? 'bg-white' : 'hover:bg-white/50'
                                                }`}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <div className={`${vBg} rounded p-0.5 flex-shrink-0`}>
                                                    <VIcon className={`h-3 w-3 ${vColor}`} />
                                                  </div>
                                                  <span className="text-[13px] font-normal truncate text-gray-900">
                                                    {view.name}
                                                  </span>
                                                </div>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Right: Selected View Detail */}
                              <div className="flex-1 overflow-auto">
                                {(() => {
                                  const activeView = selectedViewInSpecX ?? { entityId: mockViews[0].entityId, viewName: mockViews[0].name }
                                  return (
                                    <ViewsSection
                                      entities={mockDataEntities}
                                      views={mockViews}
                                      focusedView={activeView}
                                    />
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedBlueprintSection === 'reports' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Reports</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                Reports defined for each data entity. Each falls into one of four categories: Table, Chart, Pivot, or Card.
                              </p>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-0">
                              {/* Left: Reports grouped by Entity */}
                              <div className="w-[220px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <div className="space-y-3">
                                  {mockDataEntities.map((entity) => {
                                    const entityReports = mockReports.filter(r => r.entityId === entity.id)
                                    if (entityReports.length === 0) return null
                                    const { icon: EIcon, color: eColor, bgColor: eBg } = getEntityTypeIcon(entity.type)
                                    const activeReport = selectedReportInSpecX ?? { entityId: mockReports[0].entityId, reportName: mockReports[0].name }
                                    return (
                                      <div key={entity.id}>
                                        {/* Entity header */}
                                        <div className="flex items-center gap-1.5 px-2 py-1">
                                          <div className={`${eBg} rounded p-0.5 flex-shrink-0`}>
                                            <EIcon className={`h-3 w-3 ${eColor}`} />
                                          </div>
                                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 truncate">
                                            {entity.name}
                                          </h4>
                                        </div>
                                        {/* Nested reports */}
                                        <div className="space-y-0.5 ml-1">
                                          {entityReports.map((report) => {
                                            const { icon: RIcon, color: rColor, bgColor: rBg } = getReportTypeIcon(report.type)
                                            const isActive = activeReport.entityId === report.entityId && activeReport.reportName === report.name
                                            return (
                                              <button
                                                key={`${report.entityId}-${report.name}`}
                                                onClick={() => setSelectedReportInSpecX({ entityId: report.entityId, reportName: report.name })}
                                                className={`w-full text-left pl-3 pr-2.5 py-1.5 rounded-md transition-colors ${
                                                  isActive ? 'bg-white' : 'hover:bg-white/50'
                                                }`}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <div className={`${rBg} rounded p-0.5 flex-shrink-0`}>
                                                    <RIcon className={`h-3 w-3 ${rColor}`} />
                                                  </div>
                                                  <span className="text-[13px] font-normal truncate text-gray-900">
                                                    {report.name}
                                                  </span>
                                                </div>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Right: Selected Report Detail */}
                              <div className="flex-1 overflow-auto">
                                {(() => {
                                  const activeReport = selectedReportInSpecX ?? { entityId: mockReports[0].entityId, reportName: mockReports[0].name }
                                  return (
                                    <ReportsSection
                                      entities={mockDataEntities}
                                      reports={mockReports}
                                      focusedReport={activeReport}
                                    />
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedBlueprintSection === 'interface' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Interface</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                Navigations defined in this app. Each navigation is a tree of menus and sub-menus mapped to pages.
                              </p>
                            </div>

                            <div className="flex gap-6 flex-1 min-h-0">
                              {/* Left: Navigation list */}
                              <div className="w-[220px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <div className="space-y-1">
                                  {mockNavigations.map((nav) => {
                                    const activeId = selectedNavigationInSpecX ?? mockNavigations[0].id
                                    const isActive = activeId === nav.id
                                    return (
                                      <button
                                        key={nav.id}
                                        onClick={() => setSelectedNavigationInSpecX(nav.id)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                                          isActive ? 'bg-white' : 'hover:bg-white/50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <div className="bg-blue-50 rounded p-0.5 flex-shrink-0">
                                            <Navigation className="h-3 w-3 text-blue-600" />
                                          </div>
                                          <span className="text-[13px] font-normal truncate text-gray-900">
                                            {nav.name}
                                          </span>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Right: Selected Navigation Sitemap */}
                              <div className="flex-1 overflow-auto">
                                {(() => {
                                  const activeId = selectedNavigationInSpecX ?? mockNavigations[0].id
                                  return (
                                    <NavigationsSection
                                      navigations={mockNavigations}
                                      focusedNavigation={activeId}
                                    />
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedBlueprintSection === 'integrations' && (
                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h2 className="text-base font-semibold text-gray-900">Integrations</h2>
                              <p className="text-[13px] text-gray-600 mt-1">
                                External services and connections this app depends on.
                              </p>
                            </div>
                            <div className="flex gap-6 flex-1 min-h-0">
                              <div className="w-[200px] flex-shrink-0 bg-gray-50 rounded-lg p-2 h-full overflow-auto">
                                <p className="text-[12px] text-gray-500 px-2 py-2">No integrations yet.</p>
                              </div>
                              <div className="flex-1 overflow-auto">
                                <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
                                  <p className="text-[13px] text-gray-500">Integrations content coming soon.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : mode === 'spec-y' ? (
          // Spec Y Mode Layout (Nested data entities in left nav)
          <>
            {/* Copilot Panel - 320px with spacing */}
            <CopilotPanel
              appName={appName}
              appDescription={appDescription}
              appIcon={appIcon}
              appIconBg={appIconBg}
              onAddPageToPreview={addNavItemCallback}
              onSwitchToPage={switchToPageCallback}
            />

            {/* Spec Y Content Area - remaining space */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white pr-2 pb-2">
                <div className="flex-1 bg-white flex flex-col">
                  {/* App Header Section */}
                  <div className="p-4 pb-0 flex-shrink-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {/* App Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: appIconBg }}
                        >
                          <AppIcon name={appIcon} className="h-5 w-5 text-white" />
                        </div>

                        {/* App Info */}
                        <div className="flex-1">
                          <h1 className="text-base font-semibold text-gray-900 mb-1">
                            {appName}
                          </h1>
                          {appDescription && (
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                              {appDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout: Blueprint Nav with nested entities + Full Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="bg-white border border-gray-200 rounded-lg flex flex-1">
                      {/* Left: Blueprint Navigation with Nested Data Entities */}
                      <div className="w-[220px] border-r border-gray-200 p-3 flex-shrink-0 overflow-auto">
                        <nav className="space-y-1.5">
                          <button
                            onClick={() => {
                              setExpandedSection('roles')
                              setSelectedBlueprintSection('roles')
                              setSelectedEntityInSpecY(null)
                              setSelectedViewInSpecY(null)
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'roles' && !selectedEntityInSpecY
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <UserKey className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            App Roles
                          </button>

                          {/* Data Entities - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'data-entities' ? '' : 'data-entities')
                                setSelectedBlueprintSection('data-entities')
                                setSelectedEntityInSpecY(null)
                                setSelectedViewInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'data-entities' && !selectedEntityInSpecY
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Database className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Data entities
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'data-entities' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Data Entity Items */}
                            {expandedSection === 'data-entities' && (
                              <div className="ml-3 mt-1 space-y-1">
                                {mockDataEntities.map((entity) => {
                                  const { icon: Icon, color, bgColor } = getEntityTypeIcon(entity.type)
                                  return (
                                    <button
                                      key={entity.id}
                                      onClick={() => {
                                        setSelectedEntityInSpecY(entity.id)
                                        setSelectedBlueprintSection('data-entities')
                                      }}
                                      className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center gap-1.5 ${
                                        selectedEntityInSpecY === entity.id
                                          ? 'bg-blue-50 text-blue-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <div className={`${bgColor} rounded p-0.5 flex-shrink-0`}>
                                        <Icon className={`h-2.5 w-2.5 ${color}`} />
                                      </div>
                                      <span className="truncate">{entity.name}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Workflows - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'workflows' ? '' : 'workflows')
                                setSelectedBlueprintSection('workflows')
                                setSelectedEntityInSpecY(null)
                                setSelectedWorkflow(null)
                                setSelectedRole(null)
                                setSelectedViewInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'workflows' && !selectedWorkflow
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Workflow className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Workflows
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'workflows' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Workflow Items (Process/Board only) */}
                            {expandedSection === 'workflows' && (
                              <div className="ml-3 mt-1 space-y-1">
                                {mockWorkflows.map((workflow) => {
                                  const { icon: Icon, color, bgColor } = getEntityTypeIcon(workflow.entityType)
                                  return (
                                    <button
                                      key={workflow.id}
                                      onClick={() => {
                                        setSelectedWorkflow(workflow.id)
                                        setSelectedBlueprintSection('workflows')
                                        setSelectedEntityInSpecY(null)
                                        setSelectedRole(null)
                                      }}
                                      className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center gap-1.5 ${
                                        selectedWorkflow === workflow.id
                                          ? 'bg-blue-50 text-blue-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <div className={`${bgColor} rounded p-0.5 flex-shrink-0`}>
                                        <Icon className={`h-2.5 w-2.5 ${color}`} />
                                      </div>
                                      <span className="truncate">{workflow.entityName}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Permissions - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'permissions' ? '' : 'permissions')
                                setSelectedBlueprintSection('permissions')
                                setSelectedEntityInSpecY(null)
                                setSelectedWorkflow(null)
                                setSelectedRole(null)
                                setSelectedViewInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'permissions' && !selectedRole
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Permissions
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'permissions' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Role Items */}
                            {expandedSection === 'permissions' && (
                              <div className="ml-3 mt-1 space-y-1">
                                {mockRoles.map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => {
                                      setSelectedRole(role.id)
                                      setSelectedBlueprintSection('permissions')
                                      setSelectedEntityInSpecY(null)
                                      setSelectedWorkflow(null)
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center gap-1.5 ${
                                      selectedRole === role.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className={`${role.color} rounded p-0.5 flex-shrink-0`}>
                                      <Users className={`h-2.5 w-2.5 ${role.textColor}`} />
                                    </div>
                                    <span className="truncate">{role.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Views - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'views' ? '' : 'views')
                                setSelectedBlueprintSection('views')
                                setSelectedEntityInSpecY(null)
                                setSelectedWorkflow(null)
                                setSelectedRole(null)
                                setSelectedViewInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'views' && !selectedViewInSpecY
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <LayoutGrid className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Views
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'views' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Views (grouped by entity) */}
                            {expandedSection === 'views' && (
                              <div className="ml-3 mt-1 space-y-2">
                                {mockDataEntities.map((entity) => {
                                  const entityViews = mockViews.filter(v => v.entityId === entity.id)
                                  if (entityViews.length === 0) return null
                                  const { icon: EntityIcon, color: entityColor, bgColor: entityBg } = getEntityTypeIcon(entity.type)
                                  return (
                                    <div key={entity.id}>
                                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                        <div className={`${entityBg} rounded p-0.5 flex-shrink-0`}>
                                          <EntityIcon className={`h-2.5 w-2.5 ${entityColor}`} />
                                        </div>
                                        <span className="truncate">{entity.name}</span>
                                      </div>
                                      <div className="space-y-0.5">
                                        {entityViews.map((view) => (
                                          <button
                                            key={`${view.entityId}-${view.name}`}
                                            onClick={() => {
                                              setSelectedViewInSpecY({ entityId: view.entityId, viewName: view.name })
                                              setSelectedBlueprintSection('views')
                                              setSelectedEntityInSpecY(null)
                                              setSelectedWorkflow(null)
                                              setSelectedRole(null)
                                            }}
                                            className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center justify-between gap-1.5 ${
                                              selectedViewInSpecY && selectedViewInSpecY.entityId === view.entityId && selectedViewInSpecY.viewName === view.name
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                          >
                                            <span className="truncate">{view.name}</span>
                                            <span className="text-[10px] text-gray-400 flex-shrink-0">{view.type}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          {/* Reports - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'reports' ? '' : 'reports')
                                setSelectedBlueprintSection('reports')
                                setSelectedEntityInSpecY(null)
                                setSelectedWorkflow(null)
                                setSelectedRole(null)
                                setSelectedViewInSpecY(null)
                                setSelectedReportInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'reports' && !selectedReportInSpecY
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <FileBarChart className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Reports
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'reports' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Reports (grouped by entity) */}
                            {expandedSection === 'reports' && (
                              <div className="ml-3 mt-1 space-y-2">
                                {mockDataEntities.map((entity) => {
                                  const entityReports = mockReports.filter(r => r.entityId === entity.id)
                                  if (entityReports.length === 0) return null
                                  const { icon: EntityIcon, color: entityColor, bgColor: entityBg } = getEntityTypeIcon(entity.type)
                                  return (
                                    <div key={entity.id}>
                                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                        <div className={`${entityBg} rounded p-0.5 flex-shrink-0`}>
                                          <EntityIcon className={`h-2.5 w-2.5 ${entityColor}`} />
                                        </div>
                                        <span className="truncate">{entity.name}</span>
                                      </div>
                                      <div className="space-y-0.5">
                                        {entityReports.map((report) => (
                                          <button
                                            key={`${report.entityId}-${report.name}`}
                                            onClick={() => {
                                              setSelectedReportInSpecY({ entityId: report.entityId, reportName: report.name })
                                              setSelectedBlueprintSection('reports')
                                              setSelectedEntityInSpecY(null)
                                              setSelectedWorkflow(null)
                                              setSelectedRole(null)
                                              setSelectedViewInSpecY(null)
                                            }}
                                            className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center justify-between gap-1.5 ${
                                              selectedReportInSpecY && selectedReportInSpecY.entityId === report.entityId && selectedReportInSpecY.reportName === report.name
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                          >
                                            <span className="truncate">{report.name}</span>
                                            <span className="text-[10px] text-gray-400 flex-shrink-0">{report.type}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          {/* Interface - Expandable */}
                          <div>
                            <button
                              onClick={() => {
                                setExpandedSection(expandedSection === 'interface' ? '' : 'interface')
                                setSelectedBlueprintSection('interface')
                                setSelectedEntityInSpecY(null)
                                setSelectedWorkflow(null)
                                setSelectedRole(null)
                                setSelectedViewInSpecY(null)
                                setSelectedReportInSpecY(null)
                                setSelectedNavigationInSpecY(null)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center justify-between ${
                                selectedBlueprintSection === 'interface' && !selectedNavigationInSpecY
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Layout className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                Interface
                              </span>
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedSection === 'interface' ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            {/* Nested Navigations */}
                            {expandedSection === 'interface' && (
                              <div className="ml-3 mt-1 space-y-0.5">
                                {mockNavigations.map((nav) => (
                                  <button
                                    key={nav.id}
                                    onClick={() => {
                                      setSelectedNavigationInSpecY(nav.id)
                                      setSelectedBlueprintSection('interface')
                                      setSelectedEntityInSpecY(null)
                                      setSelectedWorkflow(null)
                                      setSelectedRole(null)
                                      setSelectedViewInSpecY(null)
                                      setSelectedReportInSpecY(null)
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md transition-colors flex items-center gap-1.5 ${
                                      selectedNavigationInSpecY === nav.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="bg-blue-50 rounded p-0.5 flex-shrink-0">
                                      <Navigation className="h-2.5 w-2.5 text-blue-600" />
                                    </div>
                                    <span className="truncate">{nav.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setExpandedSection('integrations')
                              setSelectedBlueprintSection('integrations')
                              setSelectedEntityInSpecY(null)
                              setSelectedViewInSpecY(null)
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-2 ${
                              selectedBlueprintSection === 'integrations' && !selectedEntityInSpecY
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Plug className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            Integrations
                          </button>
                        </nav>
                      </div>

                      {/* Right: Full Width Content Area */}
                      <div className="flex-1 overflow-auto p-4">
                        {/* Show selected entity details if an entity is selected */}
                        {selectedEntityInSpecY ? (
                          (() => {
                            const selectedEntity = mockDataEntities.find(e => e.id === selectedEntityInSpecY)
                            if (!selectedEntity) return null

                            const { icon: Icon, color, bgColor } = getEntityTypeIcon(selectedEntity.type)

                            return (
                              <div>
                                {/* Header */}
                                <div className="mb-4 flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                  <div className={`${bgColor} rounded p-1.5`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                  </div>
                                  <h3 className="text-sm font-semibold text-gray-900">{selectedEntity.name}</h3>
                                </div>

                                {/* Tabs */}
                                <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                                  <button
                                    onClick={() => setDataEntityTab('fields')}
                                    className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                                      dataEntityTab === 'fields'
                                        ? 'text-blue-700 border-blue-600'
                                        : 'text-gray-600 border-transparent hover:text-gray-900'
                                    }`}
                                  >
                                    Fields
                                  </button>
                                  <button
                                    onClick={() => setDataEntityTab('permissions')}
                                    className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                                      dataEntityTab === 'permissions'
                                        ? 'text-blue-700 border-blue-600'
                                        : 'text-gray-600 border-transparent hover:text-gray-900'
                                    }`}
                                  >
                                    Permissions
                                  </button>
                                </div>

                                {dataEntityTab === 'fields' ? (
                                  /* Fields Table */
                                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field Name</th>
                                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field Type</th>
                                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Field ID</th>
                                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Required</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedEntity.fields.map((field, index) => (
                                          <tr key={field.id} className={index !== selectedEntity.fields.length - 1 ? 'border-b border-gray-200' : ''}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{field.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{field.type}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{field.id}</td>
                                            <td className="px-4 py-3 text-sm">
                                              {field.required ? (
                                                <span className="text-green-600 text-xs font-medium">Yes</span>
                                              ) : (
                                                <span className="text-gray-400 text-xs font-medium">No</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  /* Permissions Table (Role × Permission) */
                                  (() => {
                                    const cols = permissionColumnsForEntityType(selectedEntity.type)
                                    return (
                                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Role</th>
                                              {cols.map(col => (
                                                <th key={col} className="text-center px-4 py-2.5 text-xs font-semibold text-gray-700">{col}</th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {mockRoles.map((role, i) => {
                                              const selectedCol = roleSelectedPermForEntity(role, selectedEntity.id, cols)
                                              return (
                                                <tr key={role.id} className={i !== mockRoles.length - 1 ? 'border-b border-gray-200' : ''}>
                                                  <td className="px-4 py-3 text-sm text-gray-900">{role.name}</td>
                                                  {cols.map(col => (
                                                    <td key={col} className="px-4 py-3 text-center">
                                                      {selectedCol === col ? (
                                                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                      ) : (
                                                        <span className="text-gray-300 text-sm">—</span>
                                                      )}
                                                    </td>
                                                  ))}
                                                </tr>
                                              )
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )
                                  })()
                                )}
                              </div>
                            )
                          })()
                        ) : (
                          /* Show section content when no entity is selected */
                          <>
                            {selectedBlueprintSection === 'roles' && (
                              <div>
                                <h2 className="text-base font-semibold text-gray-900 mb-4">App Roles</h2>
                                <div className="space-y-6">
                                  {/* Employee Role */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Users className="h-4 w-4 text-gray-600" />
                                      <h3 className="text-sm font-semibold text-gray-900">Employee</h3>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can submit leave requests for vacation, sick leave, and other time-off types.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can view their current leave balance and accrual history across all leave types.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can track the approval status of submitted requests and receive notifications.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Manager Role */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Users className="h-4 w-4 text-gray-600" />
                                      <h3 className="text-sm font-semibold text-gray-900">Manager</h3>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can approve or reject leave requests from direct reports with optional comments.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can view team calendar to check availability and plan coverage during leave periods.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can generate team leave reports and analyze leave patterns for better resource planning.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* HR Admin Role */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Users className="h-4 w-4 text-gray-600" />
                                      <h3 className="text-sm font-semibold text-gray-900">HR Admin</h3>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can configure company-wide leave policies (types, accrual rates, blackout periods).
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can manually adjust user leave balances and manage carryover rules.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can generate audit logs of all leave-related actions so that I can ensure compliance and trace any discrepancies.
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-[13px] text-gray-600 leading-relaxed">
                                          Can assign and revoke user roles and permissions so that only authorised people can approve, submit, or view leave data.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedBlueprintSection === 'data-entities' && (
                              <div className="text-gray-500 text-sm">Select a data entity from the left navigation to view its details.</div>
                            )}

                            {selectedBlueprintSection === 'workflows' && (
                              selectedWorkflow ? (
                                // Show specific workflow details
                                (() => {
                                  const workflow = mockWorkflows.find(w => w.id === selectedWorkflow)
                                  if (!workflow) return null
                                  const { icon: Icon, color, bgColor } = getEntityTypeIcon(workflow.entityType)

                                  return (
                                    <div>
                                      {/* Header */}
                                      <div className="mb-6 flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <div className={`${bgColor} rounded p-1.5`}>
                                            <Icon className={`h-4 w-4 ${color}`} />
                                          </div>
                                          <h3 className="text-sm font-semibold text-gray-900">{workflow.entityName}</h3>
                                        </div>
                                      </div>

                                      {/* Workflow Canvas (card stack) */}
                                      <div className="relative rounded-lg p-8">
                                        <div className="flex flex-col items-center gap-0">
                                          {workflow.steps.map((step, index) => (
                                            <div key={step.id} className="flex flex-col items-center w-full">
                                              {/* Card */}
                                              <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="text-sm font-semibold text-gray-900">{step.name}</h4>
                                                  {step.isStart && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
                                                      <Play className="h-3 w-3" />
                                                      Start
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                  {step.assignee.kind === 'user' ? (
                                                    <>
                                                      <div className={`h-7 w-7 rounded-full ${step.assignee.bgColor} flex items-center justify-center text-white text-xs font-medium`}>
                                                        {step.assignee.initials}
                                                      </div>
                                                      <span className="text-sm text-gray-700">{step.assignee.name}</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <ClipboardList className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                      <span className="text-sm text-gray-600 italic">{step.assignee.label}</span>
                                                    </>
                                                  )}
                                                </div>
                                                <div className="mt-3 border-t border-gray-100" />
                                                <div className="mt-2 flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5">
                                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                                    <span className="text-xs text-gray-500">{step.trigger}</span>
                                                  </div>
                                                  <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                                                </div>
                                              </div>
                                              {/* Connector */}
                                              {index < workflow.steps.length - 1 && (
                                                <div className="w-px h-5 bg-gray-300" />
                                              )}
                                            </div>
                                          ))}
                                          {/* Terminal connector + Completed pill */}
                                          <div className="w-px h-5 bg-gray-300" />
                                          <span className="inline-flex items-center px-3 py-1 rounded-full border border-green-500 text-green-700 text-xs font-medium bg-white">
                                            Completed
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()
                              ) : (
                                // Show overview when no workflow selected
                                <div>
                                  <h2 className="text-base font-semibold text-gray-900 mb-2">Workflows</h2>
                                  <p className="text-[13px] text-gray-600 mb-4">
                                    Select a workflow from the left navigation to view its steps and details.
                                  </p>
                                  <div className="space-y-4">
                                    {mockWorkflows.map((workflow) => {
                                      const { icon: Icon, color, bgColor } = getEntityTypeIcon(workflow.entityType)
                                      return (
                                        <button
                                          key={workflow.id}
                                          onClick={() => setSelectedWorkflow(workflow.id)}
                                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={`${bgColor} rounded p-1.5`}>
                                              <Icon className={`h-4 w-4 ${color}`} />
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-900">{workflow.entityName}</h4>
                                              <span className="text-xs text-gray-500">{workflow.steps.length} steps</span>
                                            </div>
                                          </div>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            )}

                            {selectedBlueprintSection === 'permissions' && (
                              selectedRole ? (
                                // Show specific role's permissions
                                (() => {
                                  const role = mockRoles.find(r => r.id === selectedRole)
                                  if (!role) return null

                                  return (
                                    <div>
                                      {/* Role Header */}
                                      <div className={`${role.color} px-4 py-3 rounded-lg mb-6`}>
                                        <div className="flex items-center gap-2">
                                          <Users className={`h-4 w-4 ${role.textColor}`} />
                                          <h3 className={`text-sm font-semibold ${role.textColor}`}>{role.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                                      </div>

                                      {/* Permissions Table */}
                                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Data Entity</th>
                                              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-700">View</th>
                                              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-700">Create</th>
                                              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-700">Edit</th>
                                              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-700">Delete</th>
                                              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-700">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {role.permissions.map((perm, index) => (
                                              <tr key={perm.entityId} className={index !== role.permissions.length - 1 ? 'border-b border-gray-200' : ''}>
                                                <td className="px-4 py-2.5 text-sm text-gray-900">{perm.entityName}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canView ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canCreate ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canEdit === 'all' ? (
                                                    <span className="text-xs font-medium text-green-600">All</span>
                                                  ) : perm.canEdit === 'own' ? (
                                                    <span className="text-xs font-medium text-yellow-600">Own</span>
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  {perm.canDelete ? (
                                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                                  ) : (
                                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                                  )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                  {perm.actionPermissions.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {perm.actionPermissions.filter(a => a.allowed).map((action) => (
                                                        <span key={action.action} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">
                                                          {action.action}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )
                                })()
                              ) : (
                                // Show overview when no role selected
                                <div>
                                  <h2 className="text-base font-semibold text-gray-900 mb-2">Permissions</h2>
                                  <p className="text-[13px] text-gray-600 mb-4">
                                    Select a role from the left navigation to view its permissions.
                                  </p>
                                  <div className="space-y-3">
                                    {mockRoles.map((role) => (
                                      <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`${role.color} rounded p-1.5`}>
                                            <Users className={`h-4 w-4 ${role.textColor}`} />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
                                            <span className="text-xs text-gray-500">{role.permissions.length} entities</span>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}

                            {selectedBlueprintSection === 'views' && (
                              <ViewsSection
                                entities={mockDataEntities}
                                views={mockViews}
                                focusedView={selectedViewInSpecY}
                              />
                            )}

                            {selectedBlueprintSection === 'reports' && (
                              <ReportsSection
                                entities={mockDataEntities}
                                reports={mockReports}
                                focusedReport={selectedReportInSpecY}
                              />
                            )}

                            {selectedBlueprintSection === 'interface' && (
                              <NavigationsSection
                                navigations={mockNavigations}
                                focusedNavigation={selectedNavigationInSpecY}
                              />
                            )}

                            {selectedBlueprintSection === 'integrations' && (
                              <div className="text-gray-500 text-sm">Integrations content coming soon...</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Build Mode Layout
          <>
        {/* Sidebar */}
        <div>
        <BuilderSidebar
          onItemClick={onSidebarItemClick}
          onCreateItem={handleCreateItem}
          appId={appId}
          onDataFormClick={(dataForm) => {
            // Create new tab for the data form if not already open
            const existingTab = tabs.find((tab) => tab.entityId === dataForm.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `dataform-${dataForm.id}`,
                label: dataForm.name,
                icon: ClipboardList,
                closable: true,
                type: 'dataform',
                entityId: dataForm.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onBoardClick={(board) => {
            // Create new tab for the board if not already open
            const existingTab = tabs.find((tab) => tab.entityId === board.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `board-${board.id}`,
                label: board.name,
                icon: LayoutGrid,
                closable: true,
                type: 'board',
                entityId: board.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onProcessClick={(process) => {
            // Create new tab for the process if not already open
            const existingTab = tabs.find((tab) => tab.entityId === process.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `process-${process.id}`,
                label: process.name,
                icon: Workflow,
                closable: true,
                type: 'process',
                entityId: process.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onListClick={(list) => {
            // Create new tab for the list if not already open
            const existingTab = tabs.find((tab) => tab.entityId === list.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `list-${list.id}`,
                label: list.name,
                icon: List,
                closable: true,
                type: 'list',
                entityId: list.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onNavigationClick={(navigation) => {
            // Create new tab for the navigation if not already open
            const existingTab = tabs.find((tab) => tab.entityId === navigation.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `navigation-${navigation.id}`,
                label: navigation.name,
                icon: Navigation,
                closable: true,
                type: 'navigation',
                entityId: navigation.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onPageClick={(page) => {
            // Create new tab for the page if not already open
            const existingTab = tabs.find((tab) => tab.entityId === page.id)
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: `page-${page.id}`,
                label: page.name,
                icon: FileText,
                closable: true,
                type: 'page',
                entityId: page.id,
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onVariablesClick={() => {
            // Create new tab for variables if not already open
            const existingTab = tabs.find((tab) => tab.type === 'variables')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'variables',
                label: 'Variables',
                icon: Variable,
                closable: true,
                type: 'variables',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onResourcesClick={() => {
            // Create new tab for resources if not already open
            const existingTab = tabs.find((tab) => tab.type === 'resources')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'resources',
                label: 'Resources',
                icon: FolderOpen,
                closable: true,
                type: 'resources',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onComponentsClick={() => {
            // Create new tab for components if not already open
            const existingTab = tabs.find((tab) => tab.type === 'components')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'components',
                label: 'Components',
                icon: Component,
                closable: true,
                type: 'components',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onConnectionsClick={() => {
            // Create new tab for connections if not already open
            const existingTab = tabs.find((tab) => tab.type === 'connections')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'connections',
                label: 'Connections',
                icon: Cable,
                closable: true,
                type: 'connections',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
          onPermissionsClick={() => {
            // Create new tab for permissions if not already open
            const existingTab = tabs.find((tab) => tab.type === 'permissions')
            if (existingTab) {
              setActiveTabId(existingTab.id)
            } else {
              const newTab: Tab = {
                id: 'permissions',
                label: 'Roles',
                icon: UserKey,
                closable: true,
                type: 'permissions',
              }
              setTabs((prevTabs) => [...prevTabs, newTab])
              setActiveTabId(newTab.id)
            }
          }}
        />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Rounded content wrapper */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-tl-lg bg-white">
            {/* Tab Bar */}
            <BuilderTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
            />

            {/* Utility Bar */}
            <BuilderUtilityBar
              title={activeTab?.label || ''}
              tabType={activeTab?.type}
              activeView={activeView}
              onViewChange={handleViewChange}
              onViewsClick={handleViewsClick}
              onReportsClick={handleReportsClick}
              onShareClick={() => setActiveView('share')}
              onSettingsClick={() => setActiveView('settings')}
              onBreadcrumbBack={handleBreadcrumbBack}
              onBreadcrumbMiddleClick={handleBreadcrumbMiddleClick}
              breadcrumb={getBreadcrumb()}
              onRenameClick={handleRenameClick}
              onDuplicateClick={handleDuplicateClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {renderContent()}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Data Form Create Dialog */}
      {createType === 'dataform' && (
        <DataFormCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleDataFormCreate}
          isLoading={isCreating}
        />
      )}

      {/* Board Create Dialog */}
      {createType === 'board' && (
        <BoardCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleBoardCreate}
          isLoading={isCreating}
        />
      )}

      {/* Process Create Dialog */}
      {createType === 'process' && (
        <ProcessCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleProcessCreate}
          isLoading={isCreating}
        />
      )}

      {/* Navigation Create Dialog */}
      {createType === 'navigation' && (
        <NavigationCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleNavigationCreate}
          isLoading={isCreating}
        />
      )}

      {/* Page Create Dialog */}
      {createType === 'page' && (
        <PageCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handlePageCreate}
          isLoading={isCreating}
        />
      )}

      {/* List Create Dialog */}
      {createType === 'list' && (
        <ListCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleListCreate}
          isLoading={isCreating}
        />
      )}

      {/* View Create Dialog */}
      <ViewCreateDialog
        open={viewCreateDialogOpen}
        onOpenChange={setViewCreateDialogOpen}
        onSubmit={handleViewCreate}
        isLoading={isCreatingView}
      />

      {/* Report Create Dialog */}
      <ReportCreateDialog
        open={reportCreateDialogOpen}
        onOpenChange={setReportCreateDialogOpen}
        onSubmit={handleReportCreate}
        isLoading={isCreatingReport}
      />

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open)
          if (!open) setEntityDetails(null)
        }}
        onSubmit={handleRename}
        isLoading={isRenaming}
        isFetchingDetails={isFetchingDetails}
        moduleName={getModuleName(activeTab?.type)}
        currentName={entityDetails?.name || activeTab?.label || ''}
        currentDescription={entityDetails?.description || ''}
      />

      {/* Duplicate Dialog */}
      <DuplicateDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        onSubmit={handleDuplicate}
        isLoading={isDuplicating}
        moduleName={getModuleName(activeTab?.type)}
        currentName={activeTab?.label || ''}
      />
    </BuilderThemeRoot>
  )
}
