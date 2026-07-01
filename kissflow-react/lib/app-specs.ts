/**
 * Per-app spec content consumed by the Builder's Spec mode.
 *
 * The shapes mirror what the `/new/app` AI-driven creation flow builds
 * (see `components/new-app/AppCreatingView.tsx`). Each app registered in
 * `lib/static-apps.ts` should have a matching entry here so the Spec view
 * has real, domain-accurate content.
 */

export type PermissionLevel = 'read' | 'edit' | 'manage'

export interface RoleSpec {
  name: string
  description: string
}

export interface EntityField {
  id: string
  name: string
  type: string
  required: boolean
}

export interface EntityPermission {
  role: string
  level: PermissionLevel
}

export interface EntitySpec {
  name: string
  description: string
  fields: EntityField[]
  permissions: EntityPermission[]
}

export interface PageSpec {
  name: string
  description: string
}

export interface NavMenuItem {
  label: string
  page?: string
  children?: NavMenuItem[]
}

export interface NavigationSpec {
  title: string
  sharedWith: string[]
  menu: NavMenuItem[]
}

export interface AppSpec {
  roles: RoleSpec[]
  entities: EntitySpec[]
  pages: PageSpec[]
  navigations: NavigationSpec[]
}

// ─── Retail One ─────────────────────────────────────────────────────────────
const RETAIL_ONE_SPEC: AppSpec = {
  roles: [
    {
      name: 'Regional Manager',
      description:
        'Owns cluster performance for a region — approves site evaluations, signs off on lease commitments, and unblocks rollout milestones.',
    },
    {
      name: 'Real Estate Analyst',
      description:
        'Sources and scores new store locations, runs demographic and competitor analysis, and coordinates lease negotiations with landlords.',
    },
    {
      name: 'Rollout Coordinator',
      description:
        'Owns end-to-end store rollout plans — timelines, budgets, vendor coordination, and launch-readiness reporting.',
    },
    {
      name: 'Store Manager',
      description:
        'Runs day-to-day operations for a single store and reports revenue, staffing, and incidents to the Regional Manager.',
    },
  ],
  entities: [
    {
      name: 'Store',
      description:
        'A single retail location. Holds identity, address, format, opening state, and the ongoing operational status of the store.',
      fields: [
        { id: 'S001', name: 'Store Code', type: 'Text', required: true },
        { id: 'S002', name: 'Store Name', type: 'Text', required: true },
        { id: 'S003', name: 'City', type: 'Text', required: true },
        { id: 'S004', name: 'Region', type: 'Dropdown', required: true },
        { id: 'S005', name: 'Format', type: 'Dropdown', required: true },
        { id: 'S006', name: 'Area (sq ft)', type: 'Number', required: true },
        { id: 'S007', name: 'Opened On', type: 'Date', required: false },
        { id: 'S008', name: 'Status', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Regional Manager', level: 'manage' },
        { role: 'Real Estate Analyst', level: 'edit' },
        { role: 'Store Manager', level: 'read' },
      ],
    },
    {
      name: 'Store Lease',
      description:
        'The rental agreement for each store. Tracks landlord, monthly rent, escalation schedule, and lease dates.',
      fields: [
        { id: 'L001', name: 'Lease ID', type: 'Text', required: true },
        { id: 'L002', name: 'Store', type: 'Reference', required: true },
        { id: 'L003', name: 'Landlord', type: 'Text', required: true },
        { id: 'L004', name: 'Start Date', type: 'Date', required: true },
        { id: 'L005', name: 'End Date', type: 'Date', required: true },
        { id: 'L006', name: 'Monthly Rent', type: 'Currency', required: true },
        { id: 'L007', name: 'Status', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Regional Manager', level: 'manage' },
        { role: 'Real Estate Analyst', level: 'edit' },
        { role: 'Rollout Coordinator', level: 'read' },
      ],
    },
    {
      name: 'Site Evaluation',
      description:
        'A scored evaluation of a candidate location. Captures footfall estimates, competitor density, and the analyst\'s go/no-go verdict.',
      fields: [
        { id: 'E001', name: 'Evaluation ID', type: 'Text', required: true },
        { id: 'E002', name: 'City', type: 'Text', required: true },
        { id: 'E003', name: 'Site Address', type: 'Text', required: true },
        { id: 'E004', name: 'Footfall Estimate', type: 'Number', required: true },
        { id: 'E005', name: 'Competitor Count', type: 'Number', required: false },
        { id: 'E006', name: 'Score', type: 'Number', required: true },
        { id: 'E007', name: 'Verdict', type: 'Dropdown', required: true },
      ],
      permissions: [
        { role: 'Real Estate Analyst', level: 'manage' },
        { role: 'Regional Manager', level: 'edit' },
        { role: 'Rollout Coordinator', level: 'read' },
      ],
    },
    {
      name: 'Rollout Project',
      description:
        'A project record for opening a batch of stores. Tracks the target date, budget, phase, and current owner of each rollout.',
      fields: [
        { id: 'P001', name: 'Project Code', type: 'Text', required: true },
        { id: 'P002', name: 'Project Name', type: 'Text', required: true },
        { id: 'P003', name: 'Cities', type: 'Text', required: true },
        { id: 'P004', name: 'Target Open Date', type: 'Date', required: true },
        { id: 'P005', name: 'Budget', type: 'Currency', required: true },
        { id: 'P006', name: 'Phase', type: 'Status', required: true },
        { id: 'P007', name: 'Owner', type: 'User', required: true },
      ],
      permissions: [
        { role: 'Rollout Coordinator', level: 'manage' },
        { role: 'Regional Manager', level: 'edit' },
        { role: 'Real Estate Analyst', level: 'read' },
      ],
    },
  ],
  pages: [
    {
      name: 'Home Dashboard',
      description:
        'Regional overview showing store map, onboarding project status, revenue vs. target, and pending high-priority items across every phase of the pipeline.',
    },
    {
      name: 'Site Evaluation',
      description:
        'Evaluation throughput KPIs, evaluation-status funnel, and the queue of sites awaiting a scoring decision from Real Estate Analysts.',
    },
    {
      name: 'Store Acquisition',
      description:
        'Two-tab view showing My Items (leases the user owns) and My Tasks (approvals and signature requests) for stores in the acquisition pipeline.',
    },
    {
      name: 'Projects Timeline',
      description:
        'Gantt-style timeline of every active rollout project with phase progression, budget burn, and drill-in per-project detail.',
    },
    {
      name: 'Rules Engine',
      description:
        'Configurable rules for auto-approving evaluations under a score threshold and routing lease approvals to the right region.',
    },
  ],
  navigations: [
    {
      title: 'Executive Nav',
      sharedWith: ['Regional Manager', 'Store Manager'],
      menu: [
        { label: 'Home', page: 'Home Dashboard' },
        {
          label: 'Stores',
          children: [
            { label: 'All Stores', page: 'Home Dashboard' },
            { label: 'Store Detail', page: 'Home Dashboard' },
          ],
        },
        { label: 'Projects', page: 'Projects Timeline' },
      ],
    },
    {
      title: 'Rollout Nav',
      sharedWith: ['Real Estate Analyst', 'Rollout Coordinator'],
      menu: [
        { label: 'Home', page: 'Home Dashboard' },
        {
          label: 'Pipeline',
          children: [
            { label: 'Site Evaluation', page: 'Site Evaluation' },
            { label: 'Store Acquisition', page: 'Store Acquisition' },
          ],
        },
        { label: 'Projects', page: 'Projects Timeline' },
        { label: 'Rules Engine', page: 'Rules Engine' },
      ],
    },
  ],
}

// ─── Inventory Management ───────────────────────────────────────────────────
const INVENTORY_MANAGEMENT_SPEC: AppSpec = {
  roles: [
    {
      name: 'Warehouse Manager',
      description:
        'Owns operations for one or more distribution centres — approves stock transfers, investigates discrepancies, and manages shift coverage.',
    },
    {
      name: 'Category Buyer',
      description:
        'Places purchase orders, sets SKU reorder levels, and negotiates commercial terms and lead times with suppliers for a product category.',
    },
    {
      name: 'Inventory Analyst',
      description:
        'Reports on stock health, ageing, and slow movers, and flags low-stock and stockout risks across warehouses.',
    },
    {
      name: 'Finance Admin',
      description:
        'Owns GL codes and stock valuation, reviews write-offs, and reconciles supplier invoices at month-end.',
    },
  ],
  entities: [
    {
      name: 'SKU',
      description:
        'The product master record. One row per stock-keeping unit; describes what an item is independent of where it sits or how much is on hand.',
      fields: [
        { id: 'K001', name: 'SKU Code', type: 'Text', required: true },
        { id: 'K002', name: 'Name', type: 'Text', required: true },
        { id: 'K003', name: 'Category', type: 'Dropdown', required: true },
        { id: 'K004', name: 'Unit of Measure', type: 'Dropdown', required: true },
        { id: 'K005', name: 'Unit Price', type: 'Currency', required: true },
        { id: 'K006', name: 'Reorder Level', type: 'Number', required: true },
        { id: 'K007', name: 'Active', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Category Buyer', level: 'manage' },
        { role: 'Warehouse Manager', level: 'read' },
        { role: 'Inventory Analyst', level: 'read' },
        { role: 'Finance Admin', level: 'edit' },
      ],
    },
    {
      name: 'Warehouse',
      description:
        'A physical or virtual location where stock lives. Holds location, capacity, and the responsible manager.',
      fields: [
        { id: 'W001', name: 'Code', type: 'Text', required: true },
        { id: 'W002', name: 'Name', type: 'Text', required: true },
        { id: 'W003', name: 'Location', type: 'Text', required: true },
        { id: 'W004', name: 'Capacity', type: 'Text', required: true },
        { id: 'W005', name: 'Manager', type: 'User', required: true },
        { id: 'W006', name: 'Active', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Warehouse Manager', level: 'manage' },
        { role: 'Category Buyer', level: 'read' },
        { role: 'Inventory Analyst', level: 'read' },
      ],
    },
    {
      name: 'Stock Balance',
      description:
        'The live snapshot of how many units of a given SKU are sitting in a specific warehouse right now. Broken down into on-hand, reserved, and available.',
      fields: [
        { id: 'B001', name: 'SKU', type: 'Reference', required: true },
        { id: 'B002', name: 'Warehouse', type: 'Reference', required: true },
        { id: 'B003', name: 'On Hand', type: 'Number', required: true },
        { id: 'B004', name: 'Reserved', type: 'Number', required: true },
        { id: 'B005', name: 'Available', type: 'Number', required: true },
        { id: 'B006', name: 'Last Updated', type: 'Date', required: true },
      ],
      permissions: [
        { role: 'Warehouse Manager', level: 'edit' },
        { role: 'Category Buyer', level: 'read' },
        { role: 'Inventory Analyst', level: 'read' },
      ],
    },
    {
      name: 'Purchase Order',
      description:
        'A commitment to buy specified quantities of specified SKUs from a supplier by a specified date. Governs when stock is expected to arrive at which warehouse.',
      fields: [
        { id: 'O001', name: 'PO Number', type: 'Text', required: true },
        { id: 'O002', name: 'Supplier', type: 'Reference', required: true },
        { id: 'O003', name: 'Warehouse', type: 'Reference', required: true },
        { id: 'O004', name: 'Total Value', type: 'Currency', required: true },
        { id: 'O005', name: 'Status', type: 'Status', required: true },
        { id: 'O006', name: 'Expected Date', type: 'Date', required: true },
      ],
      permissions: [
        { role: 'Category Buyer', level: 'manage' },
        { role: 'Warehouse Manager', level: 'edit' },
        { role: 'Finance Admin', level: 'edit' },
      ],
    },
  ],
  pages: [
    {
      name: 'Dashboard',
      description:
        'Warehouse-manager view of total SKUs, total stock value, low-stock alerts, and pending replenishments, plus category mix and stock movement trend.',
    },
    {
      name: 'Inventory',
      description:
        'Full SKU-level inventory table with search, filters for category / warehouse / status, and inline actions to trigger replenishment.',
    },
    {
      name: 'Master',
      description:
        'Master-data management with sub-tabs for Items, Warehouses, Suppliers, Categories, and Units of Measure.',
    },
    {
      name: 'Purchase Order Detail',
      description:
        'Full detail view of a single PO including line items, expected receipt, current status, and approvals timeline.',
    },
  ],
  navigations: [
    {
      title: 'Warehouse Ops Nav',
      sharedWith: ['Warehouse Manager'],
      menu: [
        { label: 'Home', page: 'Dashboard' },
        {
          label: 'Inventory',
          children: [
            { label: 'Stock Levels', page: 'Inventory' },
            { label: 'Movements', page: 'Inventory' },
          ],
        },
        { label: 'Master Data', page: 'Master' },
      ],
    },
    {
      title: 'Category Ops Nav',
      sharedWith: ['Category Buyer', 'Inventory Analyst'],
      menu: [
        { label: 'Home', page: 'Dashboard' },
        { label: 'Purchase Orders', page: 'Purchase Order Detail' },
        {
          label: 'Master Data',
          children: [
            { label: 'Items', page: 'Master' },
            { label: 'Suppliers', page: 'Master' },
          ],
        },
      ],
    },
  ],
}

// ─── Expense Management ─────────────────────────────────────────────────────
const EXPENSE_MANAGEMENT_SPEC: AppSpec = {
  roles: [
    {
      name: 'Employee',
      description:
        'Submits reimbursement claims with receipts, attaches supporting documents, and tracks each claim through approval.',
    },
    {
      name: 'Direct Manager',
      description:
        'Approves or rejects claims from direct reports, reviews caps and policies, and escalates unusual claims to Finance.',
    },
    {
      name: 'Finance Admin',
      description:
        'Owns approval workflows, categories, and payment methods — reconciles approved claims and processes reimbursements.',
    },
    {
      name: 'Cost Centre Owner',
      description:
        'Reviews spend against their cost centre\'s annual budget, approves policy exceptions, and signs off on quarterly reforecasts.',
    },
  ],
  entities: [
    {
      name: 'Expense Claim',
      description:
        'A single request for reimbursement or corporate payment. Tracks the submitter, category, amount, supporting receipts, and the approval trail.',
      fields: [
        { id: 'C001', name: 'Claim ID', type: 'Text', required: true },
        { id: 'C002', name: 'Submitter', type: 'User', required: true },
        { id: 'C003', name: 'Cost Centre', type: 'Reference', required: true },
        { id: 'C004', name: 'Category', type: 'Reference', required: true },
        { id: 'C005', name: 'Amount', type: 'Currency', required: true },
        { id: 'C006', name: 'Submitted On', type: 'Date', required: true },
        { id: 'C007', name: 'Status', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Employee', level: 'edit' },
        { role: 'Direct Manager', level: 'manage' },
        { role: 'Finance Admin', level: 'manage' },
        { role: 'Cost Centre Owner', level: 'read' },
      ],
    },
    {
      name: 'Cost Centre',
      description:
        'A budgetary unit — usually a team or function — that expenses roll up into. Carries the annual budget, YTD spend, and the owner accountable for the number.',
      fields: [
        { id: 'CC001', name: 'Code', type: 'Text', required: true },
        { id: 'CC002', name: 'Name', type: 'Text', required: true },
        { id: 'CC003', name: 'Owner', type: 'User', required: true },
        { id: 'CC004', name: 'Annual Budget', type: 'Currency', required: true },
        { id: 'CC005', name: 'YTD Spent', type: 'Currency', required: true },
      ],
      permissions: [
        { role: 'Finance Admin', level: 'manage' },
        { role: 'Cost Centre Owner', level: 'edit' },
        { role: 'Direct Manager', level: 'read' },
      ],
    },
    {
      name: 'Expense Category',
      description:
        'A classification for claim types — travel, meals, software, and so on. Sets the per-claim cap, default approver, and GL posting code.',
      fields: [
        { id: 'CT001', name: 'Category Code', type: 'Text', required: true },
        { id: 'CT002', name: 'Name', type: 'Text', required: true },
        { id: 'CT003', name: 'GL Code', type: 'Text', required: true },
        { id: 'CT004', name: 'Cap', type: 'Currency', required: false },
        { id: 'CT005', name: 'Default Approver', type: 'Dropdown', required: true },
      ],
      permissions: [
        { role: 'Finance Admin', level: 'manage' },
        { role: 'Direct Manager', level: 'read' },
      ],
    },
    {
      name: 'Approval Policy',
      description:
        'A rule that decides who has to approve a given claim. Applies to a role or category and describes the ordered approval chain.',
      fields: [
        { id: 'PO001', name: 'Policy Code', type: 'Text', required: true },
        { id: 'PO002', name: 'Name', type: 'Text', required: true },
        { id: 'PO003', name: 'Applies To', type: 'Text', required: true },
        { id: 'PO004', name: 'Approval Chain', type: 'Text', required: true },
        { id: 'PO005', name: 'Effective', type: 'Date', required: true },
      ],
      permissions: [
        { role: 'Finance Admin', level: 'manage' },
        { role: 'Cost Centre Owner', level: 'read' },
        { role: 'Direct Manager', level: 'read' },
      ],
    },
  ],
  pages: [
    {
      name: 'Dashboard',
      description:
        'KPI cards for total spend, pending approvals, and reimbursement time, plus expenses-by-category and submission-trend charts.',
    },
    {
      name: 'My Expenses',
      description:
        'The employee\'s own claim list with category and status pills, quick filters, and a New Claim entry point.',
    },
    {
      name: 'Pending Approvals',
      description:
        'Manager review queue with a per-claim card containing category, receipt attachment, and one-click Approve / Reject buttons.',
    },
    {
      name: 'Reports',
      description:
        'Report gallery covering spend by category, monthly trends, team spend, quarterly summary, policy violations, and reimbursement status.',
    },
    {
      name: 'Settings',
      description:
        'Finance-owned configuration: expense categories, approval workflow rules, and notification preferences.',
    },
  ],
  navigations: [
    {
      title: 'Employee Nav',
      sharedWith: ['Employee'],
      menu: [
        { label: 'Home', page: 'Dashboard' },
        { label: 'My Expenses', page: 'My Expenses' },
        { label: 'Reports', page: 'Reports' },
      ],
    },
    {
      title: 'Finance Nav',
      sharedWith: ['Finance Admin', 'Cost Centre Owner'],
      menu: [
        { label: 'Home', page: 'Dashboard' },
        {
          label: 'Approvals',
          children: [
            { label: 'Pending', page: 'Pending Approvals' },
            { label: 'History', page: 'Pending Approvals' },
          ],
        },
        { label: 'Reports', page: 'Reports' },
        { label: 'Settings', page: 'Settings' },
      ],
    },
  ],
}

// ─── Registry ───────────────────────────────────────────────────────────────
export const APP_SPECS: Record<string, AppSpec> = {
  'retail-one': RETAIL_ONE_SPEC,
  'inventory-management': INVENTORY_MANAGEMENT_SPEC,
  'expense-management': EXPENSE_MANAGEMENT_SPEC,
}

export function getAppSpec(id: string): AppSpec | null {
  return APP_SPECS[id] ?? null
}
