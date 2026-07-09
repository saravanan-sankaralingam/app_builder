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

// Special assignee value for steps whose owning role is decided at runtime by
// a condition (e.g. "compliance check by any senior manager based on region").
// Rendered in its own "Undefined" swimlane row at the bottom.
export const UNDEFINED_ASSIGNEE = 'Undefined'

export interface WorkflowStep {
  id: string
  name: string
  /** Role name (must match a `RoleSpec.name`) or `UNDEFINED_ASSIGNEE`. */
  assignee: string
  /** 1-based column position in the swimlane. Multiple steps may share a column (parallel branches). */
  column: number
  /** IDs of the next step(s). Multiple values = parallel/conditional branch. Empty = terminal step. */
  next: string[]
  /**
   * Optional condition text — shown as a caption on the step chip. Presence
   * indicates the step runs only when the condition is true (a conditional
   * branch or skip point).
   */
  condition?: string
  /** If true, the step is drawn with a dashed border to signal "may be skipped". */
  optional?: boolean
}

export interface WorkflowSpec {
  name: string
  description: string
  entity?: string    // optional: which entity this workflow governs
  steps: WorkflowStep[]
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
  workflows: WorkflowSpec[]
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
  workflows: [
    {
      name: 'Store Rollout',
      description:
        'Sourcing a candidate site, evaluating it, negotiating a lease, and opening a store — with sign-off from Regional Manager at the commit points.',
      entity: 'Rollout Project',
      steps: [
        { id: 'srw-1', name: 'Source site', assignee: 'Real Estate Analyst', column: 1, next: ['srw-2'] },
        { id: 'srw-2', name: 'Score evaluation', assignee: 'Real Estate Analyst', column: 2, next: ['srw-3'] },
        { id: 'srw-3', name: 'Approve for lease', assignee: 'Regional Manager', column: 3, next: ['srw-4'] },
        { id: 'srw-4', name: 'Kick off rollout', assignee: 'Rollout Coordinator', column: 4, next: ['srw-5'] },
        { id: 'srw-5', name: 'Fit-out complete', assignee: 'Rollout Coordinator', column: 5, next: ['srw-6'] },
        { id: 'srw-6', name: 'Open store', assignee: 'Store Manager', column: 6, next: [] },
      ],
    },
    {
      name: 'Lease Renewal',
      description:
        'Renewal path for expiring leases. High-value leases route through an additional legal review by a senior counsel — assignee is decided by the counsel routing table at runtime, so it lands in the Undefined swimlane.',
      entity: 'Store Lease',
      steps: [
        { id: 'lrw-1', name: 'Flag expiring lease', assignee: 'Real Estate Analyst', column: 1, next: ['lrw-2'] },
        { id: 'lrw-2', name: 'Draft renewal terms', assignee: 'Real Estate Analyst', column: 2, next: ['lrw-3', 'lrw-4'] },
        // Branch targets share the diamond's column. lrw-3 below the diamond,
        // lrw-4 above (Regional Manager comes before Real Estate Analyst in the
        // role order → its row is higher in the grid).
        { id: 'lrw-3', name: 'Senior legal review', assignee: UNDEFINED_ASSIGNEE, column: 2, next: ['lrw-4'], condition: 'if annual rent > $5M', optional: true },
        { id: 'lrw-4', name: 'Approve terms', assignee: 'Regional Manager', column: 2, next: ['lrw-5'] },
        { id: 'lrw-5', name: 'Acknowledge new lease', assignee: 'Store Manager', column: 3, next: [] },
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
  workflows: [
    {
      name: 'Purchase Order Approval',
      description:
        'From PO draft through category and Finance approvals, receipt at the warehouse, up to invoice reconciliation. Finance approval only kicks in for high-value POs.',
      entity: 'Purchase Order',
      steps: [
        { id: 'poa-1', name: 'Draft PO', assignee: 'Category Buyer', column: 1, next: ['poa-2'] },
        { id: 'poa-2', name: 'Category review', assignee: 'Category Buyer', column: 2, next: ['poa-3', 'poa-4'] },
        // poa-3 (Finance Admin, below the diamond) sits at the diamond's column;
        // poa-4 keeps the same assignee as the diamond and therefore goes one
        // column to the right (per the "same-row branch exits from the right"
        // rule).
        { id: 'poa-3', name: 'Finance approval', assignee: 'Finance Admin', column: 2, next: ['poa-4'], condition: 'if total > $10,000' },
        { id: 'poa-4', name: 'Send to supplier', assignee: 'Category Buyer', column: 3, next: ['poa-5'] },
        { id: 'poa-5', name: 'Receive goods', assignee: 'Warehouse Manager', column: 4, next: ['poa-6'] },
        { id: 'poa-6', name: 'Reconcile invoice', assignee: 'Finance Admin', column: 5, next: [] },
      ],
    },
    {
      name: 'Stock Adjustment',
      description:
        'When an analyst flags a discrepancy, the warehouse investigates and proposes an adjustment. High-value adjustments trigger an optional compliance review, then Finance signs off before posting.',
      entity: 'Stock Balance',
      steps: [
        { id: 'sa-1', name: 'Flag discrepancy', assignee: 'Inventory Analyst', column: 1, next: ['sa-2'] },
        { id: 'sa-2', name: 'Investigate', assignee: 'Warehouse Manager', column: 2, next: ['sa-3'] },
        // Single conditional branch: no diamond, sa-4 keeps its dashed border to
        // signal "may be skipped if the condition doesn't fire".
        { id: 'sa-3', name: 'Propose adjustment', assignee: 'Warehouse Manager', column: 3, next: ['sa-4'] },
        { id: 'sa-4', name: 'Compliance review', assignee: UNDEFINED_ASSIGNEE, column: 4, next: ['sa-5'], condition: 'if adjustment > $50k', optional: true },
        { id: 'sa-5', name: 'Approve write-off', assignee: 'Finance Admin', column: 5, next: ['sa-6'] },
        { id: 'sa-6', name: 'Post adjustment', assignee: 'Finance Admin', column: 6, next: [] },
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
  workflows: [
    {
      name: 'Expense Claim Approval',
      description:
        'End-to-end claim flow. High-value claims route through an additional Finance review, and international-travel claims trigger a compliance check — the compliance approver is decided at runtime by the region routing table (Undefined swimlane). All paths converge back to Approve → Reimburse.',
      entity: 'Expense Claim',
      steps: [
        { id: 'eca-1', name: 'Submit claim', assignee: 'Employee', column: 1, next: ['eca-2'] },
        { id: 'eca-2', name: 'Manager review', assignee: 'Direct Manager', column: 2, next: ['eca-3', 'eca-4'] },
        // Two conditional branches, both share the diamond's column and both
        // sit below (Finance Admin then Undefined). Approve is not a direct
        // branch of the diamond — it is the convergence point one column right.
        { id: 'eca-3', name: 'Finance review', assignee: 'Finance Admin', column: 2, next: ['eca-5'], condition: 'if amount > $1,000' },
        { id: 'eca-4', name: 'Compliance check', assignee: UNDEFINED_ASSIGNEE, column: 2, next: ['eca-5'], condition: 'if international travel', optional: true },
        { id: 'eca-5', name: 'Approve', assignee: 'Finance Admin', column: 3, next: ['eca-6'] },
        { id: 'eca-6', name: 'Reimburse', assignee: 'Finance Admin', column: 4, next: [] },
      ],
    },
    {
      name: 'Cost Centre Reforecast',
      description:
        'Quarterly reforecast — the cost-centre owner drafts the number, their manager reviews, and Finance signs off before it is applied.',
      entity: 'Cost Centre',
      steps: [
        { id: 'ccr-1', name: 'Draft reforecast', assignee: 'Cost Centre Owner', column: 1, next: ['ccr-2'] },
        { id: 'ccr-2', name: 'Manager review', assignee: 'Direct Manager', column: 2, next: ['ccr-3'] },
        { id: 'ccr-3', name: 'Finance approval', assignee: 'Finance Admin', column: 3, next: ['ccr-4'] },
        { id: 'ccr-4', name: 'Apply to budget', assignee: 'Finance Admin', column: 4, next: [] },
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

// ─── Vendor Onboarding and Management ───────────────────────────────────────
const VENDOR_ONBOARDING_SPEC: AppSpec = {
  roles: [
    {
      name: 'Vendor Manager',
      description:
        'Owns the vendor lifecycle — reviews onboarding requests, approves new vendors, manages the directory, and drives contract renewals.',
    },
    {
      name: 'Requester',
      description:
        'Raises new vendor onboarding requests with a business justification and estimated spend, then tracks each request through approval.',
    },
    {
      name: 'Finance Approver',
      description:
        'Signs off on the financial commitment for high-value onboarding requests and contract renewals, and monitors spend across vendors.',
    },
    {
      name: 'Administrator',
      description:
        'Configures the app — roles and access, categories, and integrations — and oversees vendor governance and data quality.',
    },
  ],
  entities: [
    {
      name: 'Vendor',
      description:
        'A supplier record created once onboarding is approved. Carries identity, category, tier, ownership, SLA score, and total active contract value.',
      fields: [
        { id: 'V001', name: 'Vendor Code', type: 'Text', required: true },
        { id: 'V002', name: 'Name', type: 'Text', required: true },
        { id: 'V003', name: 'Category', type: 'Dropdown', required: true },
        { id: 'V004', name: 'Status', type: 'Status', required: true },
        { id: 'V005', name: 'Tier', type: 'Dropdown', required: true },
        { id: 'V006', name: 'Owner', type: 'User', required: true },
        { id: 'V007', name: 'Onboarded On', type: 'Date', required: false },
        { id: 'V008', name: 'SLA Score', type: 'Number', required: false },
        { id: 'V009', name: 'Contract Value', type: 'Currency', required: false },
        { id: 'V010', name: 'Contact Email', type: 'Text', required: true },
      ],
      permissions: [
        { role: 'Vendor Manager', level: 'manage' },
        { role: 'Administrator', level: 'manage' },
        { role: 'Finance Approver', level: 'read' },
        { role: 'Requester', level: 'read' },
      ],
    },
    {
      name: 'Onboarding Request',
      description:
        'The intake record raised when a team wants to bring on a new vendor. Captures the ask, justification, and estimated spend, then moves through the Vendor Onboarding Approval workflow before a Vendor record is created.',
      fields: [
        { id: 'OR001', name: 'Request ID', type: 'Text', required: true },
        { id: 'OR002', name: 'Requested Vendor Name', type: 'Text', required: true },
        { id: 'OR003', name: 'Requester', type: 'User', required: true },
        { id: 'OR004', name: 'Category', type: 'Dropdown', required: true },
        { id: 'OR005', name: 'Estimated Annual Spend', type: 'Currency', required: true },
        { id: 'OR006', name: 'Business Justification', type: 'Text', required: true },
        { id: 'OR007', name: 'Status', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Requester', level: 'edit' },
        { role: 'Vendor Manager', level: 'manage' },
        { role: 'Finance Approver', level: 'edit' },
        { role: 'Administrator', level: 'read' },
      ],
    },
    {
      name: 'Contract',
      description:
        'A signed agreement tied to a vendor. Tracks the term, value, and status, and drives renewal reminders as the end date approaches.',
      fields: [
        { id: 'C001', name: 'Contract ID', type: 'Text', required: true },
        { id: 'C002', name: 'Vendor', type: 'Reference', required: true },
        { id: 'C003', name: 'Start Date', type: 'Date', required: true },
        { id: 'C004', name: 'End Date', type: 'Date', required: true },
        { id: 'C005', name: 'Value', type: 'Currency', required: true },
        { id: 'C006', name: 'Status', type: 'Status', required: true },
      ],
      permissions: [
        { role: 'Vendor Manager', level: 'manage' },
        { role: 'Finance Approver', level: 'edit' },
        { role: 'Administrator', level: 'read' },
      ],
    },
    {
      name: 'Performance Review',
      description:
        'A periodic scorecard for an active vendor — SLA adherence, quality, and responsiveness — used to inform renewals and tiering.',
      fields: [
        { id: 'PR001', name: 'Review ID', type: 'Text', required: true },
        { id: 'PR002', name: 'Vendor', type: 'Reference', required: true },
        { id: 'PR003', name: 'Period', type: 'Text', required: true },
        { id: 'PR004', name: 'SLA Score', type: 'Number', required: true },
        { id: 'PR005', name: 'Quality Score', type: 'Number', required: true },
        { id: 'PR006', name: 'Reviewer', type: 'User', required: true },
      ],
      permissions: [
        { role: 'Vendor Manager', level: 'manage' },
        { role: 'Finance Approver', level: 'read' },
        { role: 'Administrator', level: 'read' },
      ],
    },
  ],
  workflows: [
    {
      name: 'Vendor Onboarding Approval',
      description:
        'From request to active vendor. The Vendor Manager reviews the request; high-value asks route through a Finance approval, and regulated-category asks trigger a legal review whose approver is decided at runtime (Undefined swimlane). Both paths converge back to Approve → Create vendor record.',
      entity: 'Onboarding Request',
      steps: [
        { id: 'von-1', name: 'Submit request', assignee: 'Requester', column: 1, next: ['von-2'] },
        { id: 'von-2', name: 'Manager review', assignee: 'Vendor Manager', column: 2, next: ['von-3', 'von-4'] },
        { id: 'von-3', name: 'Finance approval', assignee: 'Finance Approver', column: 2, next: ['von-5'], condition: 'if est. spend > $50k' },
        { id: 'von-4', name: 'Legal review', assignee: UNDEFINED_ASSIGNEE, column: 2, next: ['von-5'], condition: 'if regulated category', optional: true },
        { id: 'von-5', name: 'Approve onboarding', assignee: 'Vendor Manager', column: 3, next: ['von-6'] },
        { id: 'von-6', name: 'Create vendor record', assignee: 'Vendor Manager', column: 4, next: [] },
      ],
    },
    {
      name: 'Contract Renewal',
      description:
        'Renewal path for contracts nearing their end date. The Vendor Manager reviews the terms, Finance approves the renewed commitment, and the contract is renewed.',
      entity: 'Contract',
      steps: [
        { id: 'vcr-1', name: 'Flag expiring contract', assignee: 'Vendor Manager', column: 1, next: ['vcr-2'] },
        { id: 'vcr-2', name: 'Review terms', assignee: 'Vendor Manager', column: 2, next: ['vcr-3'] },
        { id: 'vcr-3', name: 'Finance approval', assignee: 'Finance Approver', column: 3, next: ['vcr-4'] },
        { id: 'vcr-4', name: 'Renew contract', assignee: 'Vendor Manager', column: 4, next: [] },
      ],
    },
  ],
  pages: [
    {
      name: 'Dashboard',
      description:
        'Operational overview for the Vendor Manager — active vendors, upcoming renewals, pending approvals, and average SLA, with category and contract-value charts.',
    },
    {
      name: 'My Requests',
      description:
        "The Requester's home — a Raise onboarding request action and a list of their own submissions with live status pills.",
    },
    {
      name: 'Spend Overview',
      description:
        'Finance-facing dashboard — total annual spend, high-value vendors, a spend-by-category chart, and a financial approvals queue flagging spend that needs sign-off.',
    },
    {
      name: 'Governance',
      description:
        'Administrator view — vendor counts by status, roles and access, and owner workload across the directory.',
    },
    {
      name: 'Vendor Directory',
      description:
        'Searchable, filterable list of all vendors by category, status, and tier, with drill-down into a vendor profile.',
    },
    {
      name: 'Vendor Profile',
      description:
        "A single vendor's detail — contacts, contracts, documents, onboarding timeline, and performance reviews.",
    },
    {
      name: 'Performance Reviews',
      description:
        'Scorecards across active vendors — SLA and quality trends used to inform renewals and tiering.',
    },
  ],
  navigations: [
    {
      title: 'Vendor Manager Nav',
      sharedWith: ['Vendor Manager'],
      menu: [
        { label: 'Home', page: 'Dashboard' },
        { label: 'Vendor Directory', page: 'Vendor Directory' },
        { label: 'Performance Reviews', page: 'Performance Reviews' },
      ],
    },
    {
      title: 'Requester Nav',
      sharedWith: ['Requester'],
      menu: [
        { label: 'My Requests', page: 'My Requests' },
        { label: 'Browse Vendors', page: 'Vendor Directory' },
      ],
    },
    {
      title: 'Finance Nav',
      sharedWith: ['Finance Approver'],
      menu: [
        { label: 'Spend Overview', page: 'Spend Overview' },
        { label: 'Vendor Directory', page: 'Vendor Directory' },
        { label: 'Performance Reviews', page: 'Performance Reviews' },
      ],
    },
    {
      title: 'Administrator Nav',
      sharedWith: ['Administrator'],
      menu: [
        { label: 'Governance', page: 'Governance' },
        { label: 'Vendor Directory', page: 'Vendor Directory' },
        { label: 'Performance Reviews', page: 'Performance Reviews' },
      ],
    },
  ],
}

// ─── Registry ───────────────────────────────────────────────────────────────
export const APP_SPECS: Record<string, AppSpec> = {
  'retail-one': RETAIL_ONE_SPEC,
  'inventory-management': INVENTORY_MANAGEMENT_SPEC,
  'expense-management': EXPENSE_MANAGEMENT_SPEC,
  'vendor-onboarding-and-management': VENDOR_ONBOARDING_SPEC,
}

export function getAppSpec(id: string): AppSpec | null {
  return APP_SPECS[id] ?? null
}
