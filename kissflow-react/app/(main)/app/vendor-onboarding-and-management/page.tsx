'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  Settings,
  MoreVertical,
  Pin,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Search,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  DollarSign,
  Users,
  Layers,
  XCircle,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ManageView } from '@/components/app-view/ManageView'
import { useAppPreview } from '@/components/app-view/AppPreviewContext'
import { AppNavRoleSwitcher } from '@/components/app-view/AppNavRoleSwitcher'

// Vendor Manager role slice of the "Vendor Onboarding and Management" app.
// Built as a standalone hardcoded page (mirrors app/(main)/app/retail-one/page.tsx)
// rather than the shared runtime engine — consistent with the other three
// sibling apps. Spec reference: components/new-app/AppCreatingView.tsx
// (MOCK_ROLES / MOCK_ENTITIES / MOCK_WORKFLOWS / MOCK_PAGES / MOCK_NAV).
//
// Nav note: the spec groups "Vendors → {All Vendors, Vendor Detail}" as a
// submenu. We render the top tabs flat (Home · Vendor Directory · Performance
// Reviews) and treat Vendor Profile ("Vendor Detail") as a drill-down from a
// Directory row, which matches how a per-vendor page is actually reached.
type ViewType = 'dashboard' | 'directory' | 'profile' | 'performance'

type VendorStatus = 'Active' | 'Onboarding' | 'Under Review' | 'Suspended'
type VendorTier = 'Strategic' | 'Preferred' | 'Standard'

interface Vendor {
  id: string
  name: string // Vendor Name (F001)
  code: string // Vendor Code (F002)
  category: string // Category (F003)
  status: VendorStatus // Status (F004)
  onboardedOn: string // Onboarded On (F005)
  tier: VendorTier
  owner: string
  slaScore: number
  activeContracts: number
  contractValue: number // total active contract value (USD)
  renewalDate: string
  contactName: string
  email: string
  phone: string
}

const vendors: Vendor[] = [
  { id: 'v1', name: 'Northwind Logistics', code: 'VND-1042', category: 'Logistics', status: 'Active', onboardedOn: '2024-03-12', tier: 'Strategic', owner: 'Priya Nair', slaScore: 96, activeContracts: 3, contractValue: 420000, renewalDate: '2026-09-30', contactName: 'Dana Fields', email: 'dana@northwind.com', phone: '+1 415 555 0142' },
  { id: 'v2', name: 'Apex IT Services', code: 'VND-1088', category: 'IT Services', status: 'Active', onboardedOn: '2023-11-02', tier: 'Strategic', owner: 'Marcus Reed', slaScore: 92, activeContracts: 2, contractValue: 610000, renewalDate: '2026-08-15', contactName: 'Sam Okoye', email: 'sam@apexit.com', phone: '+1 212 555 0199' },
  { id: 'v3', name: 'BrightSpark Marketing', code: 'VND-1150', category: 'Marketing', status: 'Under Review', onboardedOn: '2025-01-20', tier: 'Preferred', owner: 'Priya Nair', slaScore: 84, activeContracts: 1, contractValue: 130000, renewalDate: '2026-07-28', contactName: 'Lena Cho', email: 'lena@brightspark.io', phone: '+1 305 555 0121' },
  { id: 'v4', name: 'Ironclad Facilities', code: 'VND-1201', category: 'Facilities', status: 'Active', onboardedOn: '2022-08-09', tier: 'Preferred', owner: 'Aaron Blake', slaScore: 88, activeContracts: 2, contractValue: 240000, renewalDate: '2026-11-05', contactName: 'Rita Voss', email: 'rita@ironclad.com', phone: '+1 617 555 0187' },
  { id: 'v5', name: 'Cedar Manufacturing', code: 'VND-1240', category: 'Manufacturing', status: 'Active', onboardedOn: '2023-05-17', tier: 'Standard', owner: 'Marcus Reed', slaScore: 79, activeContracts: 1, contractValue: 305000, renewalDate: '2026-07-19', contactName: 'Nate Kim', email: 'nate@cedarmfg.com', phone: '+1 503 555 0164' },
  { id: 'v6', name: 'Quantum Advisory', code: 'VND-1299', category: 'Professional Services', status: 'Onboarding', onboardedOn: '2026-06-24', tier: 'Standard', owner: 'Aaron Blake', slaScore: 0, activeContracts: 0, contractValue: 0, renewalDate: '—', contactName: 'Iris Wu', email: 'iris@quantumadv.com', phone: '+1 646 555 0133' },
  { id: 'v7', name: 'Summit Cloud', code: 'VND-1310', category: 'IT Services', status: 'Active', onboardedOn: '2024-09-01', tier: 'Preferred', owner: 'Priya Nair', slaScore: 91, activeContracts: 2, contractValue: 190000, renewalDate: '2026-12-01', contactName: 'Omar Diaz', email: 'omar@summitcloud.com', phone: '+1 408 555 0175' },
  { id: 'v8', name: 'Harbor Freight Co.', code: 'VND-1355', category: 'Logistics', status: 'Suspended', onboardedOn: '2022-02-14', tier: 'Standard', owner: 'Aaron Blake', slaScore: 61, activeContracts: 1, contractValue: 88000, renewalDate: '2026-07-10', contactName: 'Gwen Park', email: 'gwen@harborfreight.com', phone: '+1 702 555 0158' },
]

interface Contract {
  id: string
  vendorId: string
  contractId: string // Contract ID (F201)
  startDate: string // Start Date (F203)
  endDate: string // End Date (F204)
  value: number // Value (F205)
  status: 'Signed' | 'In Review' | 'Draft'
}

const contracts: Contract[] = [
  { id: 'c1', vendorId: 'v1', contractId: 'CTR-2041', startDate: '2024-03-15', endDate: '2026-09-30', value: 220000, status: 'Signed' },
  { id: 'c2', vendorId: 'v1', contractId: 'CTR-2088', startDate: '2025-01-01', endDate: '2027-01-01', value: 120000, status: 'Signed' },
  { id: 'c3', vendorId: 'v1', contractId: 'CTR-2140', startDate: '2025-06-01', endDate: '2026-12-31', value: 80000, status: 'In Review' },
  { id: 'c4', vendorId: 'v2', contractId: 'CTR-1990', startDate: '2023-11-10', endDate: '2026-08-15', value: 410000, status: 'Signed' },
  { id: 'c5', vendorId: 'v2', contractId: 'CTR-2205', startDate: '2025-03-01', endDate: '2027-03-01', value: 200000, status: 'Signed' },
  { id: 'c6', vendorId: 'v3', contractId: 'CTR-2260', startDate: '2025-02-01', endDate: '2026-07-28', value: 130000, status: 'In Review' },
  { id: 'c7', vendorId: 'v4', contractId: 'CTR-1820', startDate: '2022-09-01', endDate: '2026-11-05', value: 160000, status: 'Signed' },
  { id: 'c8', vendorId: 'v5', contractId: 'CTR-2010', startDate: '2023-06-01', endDate: '2026-07-19', value: 305000, status: 'Signed' },
]

interface Renewal {
  vendorId: string
  renewalId: string // Renewal ID (F301)
  renewalDate: string // Renewal Date (F303)
  value: number // Renewal Value (F305)
}

// Upcoming renewals within ~90 days, soonest first.
const upcomingRenewals: Renewal[] = [
  { vendorId: 'v8', renewalId: 'RNW-3012', renewalDate: '2026-07-10', value: 88000 },
  { vendorId: 'v5', renewalId: 'RNW-3018', renewalDate: '2026-07-19', value: 305000 },
  { vendorId: 'v3', renewalId: 'RNW-3021', renewalDate: '2026-07-28', value: 130000 },
  { vendorId: 'v2', renewalId: 'RNW-3025', renewalDate: '2026-08-15', value: 610000 },
  { vendorId: 'v1', renewalId: 'RNW-3030', renewalDate: '2026-09-30', value: 420000 },
]

interface PendingApproval {
  id: string
  requestedVendorName: string // Requested Vendor Name (F101)
  requester: string // Requester (F102)
  category: string // Category (F103)
  estSpend: number // Estimated Annual Spend (F105)
  step: string // current workflow step (Vendor Onboarding Approval)
}

// Onboarding Requests currently sitting in "Manager Review".
const pendingApprovals: PendingApproval[] = [
  { id: 'a1', requestedVendorName: 'Vertex Analytics', requester: 'D. Osei', category: 'Professional Services', estSpend: 145000, step: 'Manager Review' },
  { id: 'a2', requestedVendorName: 'Pinepoint Freight', requester: 'M. Alvarez', category: 'Logistics', estSpend: 92000, step: 'Manager Review' },
  { id: 'a3', requestedVendorName: 'Lumen Design Studio', requester: 'K. Shah', category: 'Marketing', estSpend: 48000, step: 'Manager Review' },
]

interface Document {
  vendorId: string
  name: string // Document Name (F501)
  type: string // Type (F502)
  uploadedBy: string // Uploaded By (F503)
  uploadedOn: string // Uploaded On (F504)
}

const documents: Document[] = [
  { vendorId: 'v1', name: 'Master Services Agreement.pdf', type: 'Contract', uploadedBy: 'Priya Nair', uploadedOn: '2024-03-15' },
  { vendorId: 'v1', name: 'Certificate of Insurance.pdf', type: 'Insurance', uploadedBy: 'Compliance Bot', uploadedOn: '2025-04-02' },
  { vendorId: 'v1', name: 'W-9 Tax Form.pdf', type: 'Tax', uploadedBy: 'Dana Fields', uploadedOn: '2024-03-12' },
  { vendorId: 'v2', name: 'SaaS Agreement.pdf', type: 'Contract', uploadedBy: 'Marcus Reed', uploadedOn: '2023-11-10' },
  { vendorId: 'v2', name: 'SOC 2 Report.pdf', type: 'Compliance', uploadedBy: 'Compliance Bot', uploadedOn: '2025-02-18' },
]

interface TimelineEvent {
  vendorId: string
  date: string
  label: string
}

const timeline: TimelineEvent[] = [
  { vendorId: 'v1', date: '2026-06-20', label: 'Q2 performance review completed — SLA 96%' },
  { vendorId: 'v1', date: '2026-04-02', label: 'Certificate of Insurance renewed' },
  { vendorId: 'v1', date: '2025-06-01', label: 'Contract CTR-2140 entered review' },
  { vendorId: 'v1', date: '2024-03-15', label: 'Master Services Agreement signed' },
  { vendorId: 'v1', date: '2024-03-12', label: 'Vendor onboarded' },
  { vendorId: 'v2', date: '2026-05-11', label: 'Q2 performance review completed — SLA 92%' },
  { vendorId: 'v2', date: '2025-03-01', label: 'Contract CTR-2205 signed' },
  { vendorId: 'v2', date: '2023-11-02', label: 'Vendor onboarded' },
]

interface PerformanceReview {
  vendorId: string
  quarter: string
  slaAdherence: number
  deliveryQuality: number
  relationshipHealth: number
  trend: 'up' | 'down' | 'flat'
}

const performanceReviews: PerformanceReview[] = [
  { vendorId: 'v1', quarter: 'Q2 2026', slaAdherence: 96, deliveryQuality: 94, relationshipHealth: 92, trend: 'up' },
  { vendorId: 'v2', quarter: 'Q2 2026', slaAdherence: 92, deliveryQuality: 90, relationshipHealth: 88, trend: 'flat' },
  { vendorId: 'v7', quarter: 'Q2 2026', slaAdherence: 91, deliveryQuality: 89, relationshipHealth: 90, trend: 'up' },
  { vendorId: 'v4', quarter: 'Q2 2026', slaAdherence: 88, deliveryQuality: 85, relationshipHealth: 86, trend: 'up' },
  { vendorId: 'v3', quarter: 'Q2 2026', slaAdherence: 84, deliveryQuality: 82, relationshipHealth: 80, trend: 'down' },
  { vendorId: 'v5', quarter: 'Q2 2026', slaAdherence: 79, deliveryQuality: 77, relationshipHealth: 81, trend: 'flat' },
  { vendorId: 'v8', quarter: 'Q2 2026', slaAdherence: 61, deliveryQuality: 58, relationshipHealth: 55, trend: 'down' },
]

const CATEGORY_COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#A78BFA', '#EC4899', '#10B981']

const STATUS_STYLES: Record<VendorStatus, string> = {
  Active: 'bg-green-100 text-green-700',
  Onboarding: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  Suspended: 'bg-red-100 text-red-700',
}

const TIER_STYLES: Record<VendorTier, string> = {
  Strategic: 'bg-purple-100 text-purple-700',
  Preferred: 'bg-indigo-100 text-indigo-700',
  Standard: 'bg-gray-100 text-gray-600',
}

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${n}`

function StatusBadge({ status }: { status: VendorStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[status])}>
      {status}
    </span>
  )
}

function TierBadge({ tier }: { tier: VendorTier }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TIER_STYLES[tier])}>
      {tier}
    </span>
  )
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 75) return 'text-amber-600'
  return 'text-red-600'
}

// Nav tabs differ per role: each role gets its own labels and set of sections.
// The `key` still maps to the shared views (dashboard renders the role-specific
// dashboard). Vendor Manager — and the end-user route, where no role is
// selected — gets the full set.
function tabsForRole(role?: string): { key: ViewType; label: string }[] {
  switch (role) {
    case 'Requester':
      return [
        { key: 'dashboard', label: 'My Requests' },
        { key: 'directory', label: 'Browse Vendors' },
      ]
    case 'Finance Approver':
      return [
        { key: 'dashboard', label: 'Spend Overview' },
        { key: 'directory', label: 'Vendor Directory' },
        { key: 'performance', label: 'Performance Reviews' },
      ]
    case 'Administrator':
      return [
        { key: 'dashboard', label: 'Governance' },
        { key: 'directory', label: 'Vendor Directory' },
        { key: 'performance', label: 'Performance Reviews' },
      ]
    default:
      return [
        { key: 'dashboard', label: 'Home' },
        { key: 'directory', label: 'Vendor Directory' },
        { key: 'performance', label: 'Performance Reviews' },
      ]
  }
}

export default function VendorOnboardingPage() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isManaging, setIsManaging] = useState(false)
  const { inBuilderPlay, selectedRole } = useAppPreview()
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)

  // Tabs are role-specific. If the current view isn't in the active role's tab
  // set (e.g. you switched to Requester while on Performance Reviews), fall back
  // to the dashboard so the content and highlighted tab stay in sync.
  const tabs = tabsForRole(selectedRole)
  const allowedKeys = new Set(tabs.map((t) => t.key))
  const effectiveView: ViewType =
    currentView === 'profile'
      ? allowedKeys.has('directory')
        ? 'profile'
        : 'dashboard'
      : allowedKeys.has(currentView)
        ? currentView
        : 'dashboard'

  // Directory filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [tierFilter, setTierFilter] = useState('All')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(vendors.map((v) => v.category)))],
    []
  )

  const openProfile = (id: string) => {
    setSelectedVendorId(id)
    setCurrentView('profile')
  }

  const selectTab = (key: ViewType) => {
    setSelectedVendorId(null)
    setCurrentView(key)
  }

  return (
    <div className="min-h-[calc(100vh-50px)] bg-gray-100">
      {/* App Header */}
      <div className="sticky top-0 z-10 bg-gray-100 px-5 py-3">
        <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
          {/* Top Row: App Info + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Building2 className="h-5 w-5 text-purple-600 shrink-0" />
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                Vendor Onboarding and Management
              </h1>

              {!inBuilderPlay && (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0">
                    <Pin className="h-4 w-4 text-gray-500" />
                  </Button>

                  <div className="flex items-center -space-x-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium ring-2 ring-white">PN</div>
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium ring-2 ring-white">MR</div>
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-medium ring-2 ring-white">AB</div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0">
                    <UserPlus className="h-4 w-4 text-gray-500" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {inBuilderPlay ? (
                <AppNavRoleSwitcher />
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 h-8 text-[13px]"
                    onClick={() => setIsManaging(true)}
                  >
                    <Settings className="h-3 w-3" />
                    Manage
                  </Button>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Second row — breadcrumb when managing, tabs otherwise */}
          {isManaging ? (
            <nav className="flex items-center gap-1.5 text-sm pl-8 mb-2">
              <button
                type="button"
                onClick={() => setIsManaging(false)}
                className="text-blue-600 font-medium hover:underline leading-none"
              >
                Vendor Onboarding and Management
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-700 font-medium leading-none">Manage</span>
            </nav>
          ) : (
            <div className="flex gap-3 -mb-3">
              {tabs.map((tab) => {
                // Profile is a drill-down under "Vendor Directory" — keep that
                // tab highlighted while viewing a single vendor's profile.
                const active =
                  effectiveView === tab.key ||
                  (tab.key === 'directory' && effectiveView === 'profile')
                return (
                  <button
                    key={tab.key}
                    onClick={() => selectTab(tab.key)}
                    className={cn(
                      'relative px-1 pt-1 pb-3 text-sm transition-colors',
                      active
                        ? 'text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900'
                        : 'text-gray-600 font-normal hover:text-gray-900'
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {isManaging ? (
          <ManageView
            onEditApp={() =>
              window.open('/builder/vendor-onboarding-and-management', '_blank', 'noopener,noreferrer')
            }
          />
        ) : (
          <>
            {effectiveView === 'dashboard' && <DashboardView onOpenVendor={openProfile} />}
            {effectiveView === 'directory' && (
              <DirectoryView
                search={search}
                setSearch={setSearch}
                categories={categories}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                tierFilter={tierFilter}
                setTierFilter={setTierFilter}
                onOpenVendor={openProfile}
              />
            )}
            {effectiveView === 'profile' && (
              <ProfileView
                vendorId={selectedVendorId}
                onBack={() => selectTab('directory')}
              />
            )}
            {effectiveView === 'performance' && <PerformanceView onOpenVendor={openProfile} />}
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Dashboard ------------------------------- */

function KpiCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconClass,
}: {
  icon: React.ElementType
  label: string
  value: string
  sublabel: string
  iconClass: string
}) {
  return (
    <div className="bg-white rounded-lg p-5 flex items-start gap-4">
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', iconClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-gray-900 leading-tight">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  )
}

// Each role sees a distinct dashboard. Vendor Manager — and the end-user route,
// where no role is selected — gets the full operations view; the other roles get
// the role-tailored dashboards defined below.
function DashboardView({ onOpenVendor }: { onOpenVendor: (id: string) => void }) {
  const { selectedRole } = useAppPreview()
  if (selectedRole === 'Requester') return <RequesterDashboard />
  if (selectedRole === 'Finance Approver') return <FinanceDashboard onOpenVendor={onOpenVendor} />
  if (selectedRole === 'Administrator') return <AdminDashboard />
  return <OperationsDashboard onOpenVendor={onOpenVendor} />
}

// Vendor Manager / default — operational overview.
function OperationsDashboard({ onOpenVendor }: { onOpenVendor: (id: string) => void }) {
  const activeCount = vendors.filter((v) => v.status === 'Active').length
  const avgSla = Math.round(
    vendors.filter((v) => v.slaScore > 0).reduce((s, v) => s + v.slaScore, 0) /
      vendors.filter((v) => v.slaScore > 0).length
  )

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>()
    vendors.forEach((v) => counts.set(v.category, (counts.get(v.category) ?? 0) + 1))
    return Array.from(counts.entries()).map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  }, [])

  const valueByCategory = useMemo(() => {
    const sums = new Map<string, number>()
    vendors.forEach((v) => sums.set(v.category, (sums.get(v.category) ?? 0) + v.contractValue))
    return Array.from(sums.entries()).map(([name, value]) => ({
      name: name.length > 10 ? name.slice(0, 9) + '…' : name,
      value: Math.round(value / 1000),
    }))
  }, [])

  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? '—'

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Building2} label="Active Vendors" value={String(activeCount)} sublabel={`of ${vendors.length} total`} iconClass="bg-purple-100 text-purple-600" />
        <KpiCard icon={RefreshCw} label="Renewals ≤ 90 days" value={String(upcomingRenewals.length)} sublabel="need attention" iconClass="bg-blue-100 text-blue-600" />
        <KpiCard icon={FileCheck2} label="Pending Approvals" value={String(pendingApprovals.length)} sublabel="in Manager Review" iconClass="bg-amber-100 text-amber-600" />
        <KpiCard icon={ShieldCheck} label="Avg SLA Score" value={`${avgSla}%`} sublabel="across active vendors" iconClass="bg-green-100 text-green-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">
            Vendors by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">
            Active Contract Value by Category ($k)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByCategory} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(value) => [`$${value}k`, 'Value']} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending approvals */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">
            Pending Approvals
          </h3>
          <ul className="divide-y divide-gray-100">
            {pendingApprovals.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.requestedVendorName}</p>
                  <p className="text-xs text-gray-500">{a.category} · Requested by {a.requester}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-gray-700">{money(a.estSpend)}/yr</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
                    <Clock className="h-3 w-3" /> {a.step}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming renewals */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">
            Upcoming Renewals
          </h3>
          <ul className="divide-y divide-gray-100">
            {upcomingRenewals.map((r) => (
              <li key={r.renewalId} className="flex items-center justify-between py-3">
                <button
                  type="button"
                  onClick={() => onOpenVendor(r.vendorId)}
                  className="min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-gray-900 hover:text-purple-600 truncate">{vendorName(r.vendorId)}</p>
                  <p className="text-xs text-gray-500">{r.renewalId} · Renews {r.renewalDate}</p>
                </button>
                <span className="text-sm font-medium text-gray-700 shrink-0">{money(r.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Role: Requester ----------------------------- */

// A requester's own submissions (mock). Statuses drive the pill colors below.
const MY_REQUESTS = [
  { name: 'Vertex Analytics', category: 'Professional Services', status: 'Manager Review', when: '2 days ago' },
  { name: 'Pinepoint Freight', category: 'Logistics', status: 'Manager Review', when: '4 days ago' },
  { name: 'Cobalt Security', category: 'IT Services', status: 'Draft', when: 'Just now' },
  { name: 'Lumen Design Studio', category: 'Marketing', status: 'Approved', when: '1 week ago' },
  { name: 'Meadow Catering', category: 'Facilities', status: 'Rejected', when: '2 weeks ago' },
]

const REQUEST_STATUS_STYLES: Record<string, string> = {
  'Manager Review': 'bg-amber-100 text-amber-700',
  Draft: 'bg-gray-100 text-gray-600',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

function RequesterDashboard() {
  const open = MY_REQUESTS.filter((r) => r.status === 'Manager Review').length
  const approved = MY_REQUESTS.filter((r) => r.status === 'Approved').length
  const rejected = MY_REQUESTS.filter((r) => r.status === 'Rejected').length

  return (
    <div className="space-y-4">
      {/* Hero CTA — the requester's primary action */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Need a new vendor?</h3>
          <p className="text-sm text-purple-100 mt-0.5">Raise an onboarding request and track it through approval.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-purple-700 text-sm font-semibold px-4 py-2.5 hover:bg-purple-50 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Raise onboarding request
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Clock} label="Open Requests" value={String(open)} sublabel="awaiting approval" iconClass="bg-amber-100 text-amber-600" />
        <KpiCard icon={CheckCircle2} label="Approved" value={String(approved)} sublabel="last 30 days" iconClass="bg-green-100 text-green-600" />
        <KpiCard icon={XCircle} label="Rejected" value={String(rejected)} sublabel="last 30 days" iconClass="bg-red-100 text-red-600" />
        <KpiCard icon={FileCheck2} label="Avg Approval Time" value="2.4d" sublabel="submit to decision" iconClass="bg-blue-100 text-blue-600" />
      </div>

      {/* My requests */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">My Recent Requests</h3>
        <ul className="divide-y divide-gray-100">
          {MY_REQUESTS.map((r) => (
            <li key={r.name} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                <p className="text-xs text-gray-500">{r.category} · {r.when}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                  REQUEST_STATUS_STYLES[r.status]
                )}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ----------------------- Role: Finance Approver -------------------------- */

function FinanceDashboard({ onOpenVendor }: { onOpenVendor: (id: string) => void }) {
  const withValue = vendors.filter((v) => v.contractValue > 0)
  const totalSpend = withValue.reduce((s, v) => s + v.contractValue, 0)
  const avgContract = Math.round(totalSpend / withValue.length)
  const highValue = vendors.filter((v) => v.contractValue > 300000).length
  const financeQueue = [...pendingApprovals].sort((a, b) => b.estSpend - a.estSpend)
  const financePending = financeQueue.filter((a) => a.estSpend > 50000).length

  const spendSums = new Map<string, number>()
  vendors.forEach((v) => spendSums.set(v.category, (spendSums.get(v.category) ?? 0) + v.contractValue))
  const spendByCategory = Array.from(spendSums.entries())
    .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 9) + '…' : name, value: Math.round(value / 1000) }))
    .sort((a, b) => b.value - a.value)

  const topVendors = [...vendors].sort((a, b) => b.contractValue - a.contractValue).slice(0, 5)

  return (
    <div className="space-y-4">
      {/* KPI row — money-first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FileCheck2} label="Pending Financial Approvals" value={String(financePending)} sublabel="spend > $50k" iconClass="bg-amber-100 text-amber-600" />
        <KpiCard icon={DollarSign} label="Total Annual Spend" value={money(totalSpend)} sublabel="active contracts" iconClass="bg-green-100 text-green-600" />
        <KpiCard icon={TrendingUp} label="High-Value Vendors" value={String(highValue)} sublabel="> $300k contract" iconClass="bg-purple-100 text-purple-600" />
        <KpiCard icon={Layers} label="Avg Contract Value" value={money(avgContract)} sublabel="per active vendor" iconClass="bg-blue-100 text-blue-600" />
      </div>

      {/* Spend chart */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Spend by Category ($k)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByCategory} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip formatter={(value) => [`$${value}k`, 'Spend']} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Financial approvals — emphasise $ and sign-off threshold */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Financial Approvals</h3>
          <ul className="divide-y divide-gray-100">
            {financeQueue.map((a) => {
              const needsFinance = a.estSpend > 50000
              return (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.requestedVendorName}</p>
                    <p className="text-xs text-gray-500">{a.category} · Requested by {a.requester}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{money(a.estSpend)}/yr</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        needsFinance ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {needsFinance ? 'Finance sign-off' : 'Auto-approve'}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Top vendors by value */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Top Vendors by Contract Value</h3>
          <ul className="divide-y divide-gray-100">
            {topVendors.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3">
                <button type="button" onClick={() => onOpenVendor(v.id)} className="min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 hover:text-purple-600 truncate">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.category} · {v.tier}</p>
                </button>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{money(v.contractValue)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- Role: Administrator --------------------------- */

const ROLE_ACCESS = [
  { role: 'Vendor Manager', note: 'Manage vendors, approve onboarding' },
  { role: 'Requester', note: 'Raise requests; view own submissions' },
  { role: 'Finance Approver', note: 'Approve spend; financial reports' },
  { role: 'Administrator', note: 'Configure app, roles, integrations' },
]

const STATUS_ORDER: VendorStatus[] = ['Active', 'Onboarding', 'Under Review', 'Suspended']
const STATUS_BAR_COLOR: Record<string, string> = {
  Active: 'bg-green-500',
  Onboarding: 'bg-blue-500',
  'Under Review': 'bg-amber-500',
  Suspended: 'bg-red-500',
}

function AdminDashboard() {
  const statusCounts = STATUS_ORDER.map((s) => ({ status: s, count: vendors.filter((v) => v.status === s).length }))
  const owners = Array.from(new Set(vendors.map((v) => v.owner)))
  const needsAttention = vendors.filter((v) => v.status === 'Under Review' || v.status === 'Suspended').length
  const ownerWorkload = owners
    .map((o) => ({ owner: o, count: vendors.filter((v) => v.owner === o).length }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-4">
      {/* KPI row — governance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Building2} label="Total Vendors" value={String(vendors.length)} sublabel="across all statuses" iconClass="bg-purple-100 text-purple-600" />
        <KpiCard icon={ShieldCheck} label="Roles Configured" value={String(ROLE_ACCESS.length)} sublabel="in-app roles" iconClass="bg-blue-100 text-blue-600" />
        <KpiCard icon={Users} label="Vendor Owners" value={String(owners.length)} sublabel="active assignees" iconClass="bg-green-100 text-green-600" />
        <KpiCard icon={AlertTriangle} label="Needs Attention" value={String(needsAttention)} sublabel="review / suspended" iconClass="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vendors by status distribution */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Vendors by Status</h3>
          <div className="space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.status}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', STATUS_BAR_COLOR[s.status])}
                    style={{ width: `${(s.count / vendors.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles & access */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Roles &amp; Access</h3>
          <ul className="divide-y divide-gray-100">
            {ROLE_ACCESS.map((r) => (
              <li key={r.role} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{r.role}</p>
                  <p className="text-xs text-gray-500 truncate">{r.note}</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Owner workload */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Owner Workload</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ownerWorkload.map((o) => (
            <div key={o.owner} className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-900 truncate">{o.owner}</p>
              <p className="text-xs text-gray-500">{o.count} vendor{o.count === 1 ? '' : 's'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Directory ------------------------------- */

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function DirectoryView({
  search,
  setSearch,
  categories,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  tierFilter,
  setTierFilter,
  onOpenVendor,
}: {
  search: string
  setSearch: (v: string) => void
  categories: string[]
  categoryFilter: string
  setCategoryFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  tierFilter: string
  setTierFilter: (v: string) => void
  onOpenVendor: (id: string) => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.code.toLowerCase().includes(q)) return false
      if (categoryFilter !== 'All' && v.category !== categoryFilter) return false
      if (statusFilter !== 'All' && v.status !== statusFilter) return false
      if (tierFilter !== 'All' && v.tier !== tierFilter) return false
      return true
    })
  }, [search, categoryFilter, statusFilter, tierFilter])

  return (
    <div className="bg-white rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or code…"
            className="w-full h-9 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={['All', 'Active', 'Onboarding', 'Under Review', 'Suspended']} />
        <FilterSelect value={tierFilter} onChange={setTierFilter} options={['All', 'Strategic', 'Preferred', 'Standard']} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium text-right">Contract Value</th>
              <th className="px-4 py-3 font-medium text-right">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((v) => (
              <tr
                key={v.id}
                onClick={() => onOpenVendor(v.id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                <td className="px-4 py-3 text-gray-500">{v.code}</td>
                <td className="px-4 py-3 text-gray-700">{v.category}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3"><TierBadge tier={v.tier} /></td>
                <td className="px-4 py-3 text-gray-700">{v.owner}</td>
                <td className="px-4 py-3 text-right text-gray-900">{v.contractValue ? money(v.contractValue) : '—'}</td>
                <td className={cn('px-4 py-3 text-right font-medium', v.slaScore ? scoreColor(v.slaScore) : 'text-gray-400')}>
                  {v.slaScore ? `${v.slaScore}%` : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  No vendors match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
        Showing {filtered.length} of {vendors.length} vendors
      </div>
    </div>
  )
}

/* -------------------------------- Profile -------------------------------- */

function ProfileView({ vendorId, onBack }: { vendorId: string | null; onBack: () => void }) {
  const vendor = vendors.find((v) => v.id === vendorId)

  if (!vendor) {
    return (
      <div className="bg-white rounded-lg p-10 text-center text-sm text-gray-400">
        Vendor not found.{' '}
        <button onClick={onBack} className="text-purple-600 hover:underline">
          Back to directory
        </button>
      </div>
    )
  }

  const vendorContracts = contracts.filter((c) => c.vendorId === vendor.id)
  const vendorDocs = documents.filter((d) => d.vendorId === vendor.id)
  const vendorEvents = timeline.filter((t) => t.vendorId === vendor.id)
  const review = performanceReviews.find((p) => p.vendorId === vendor.id)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Vendor Directory
      </button>

      {/* Header block */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-semibold">
              {vendor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{vendor.name}</h2>
              <p className="text-sm text-gray-500">{vendor.code} · {vendor.category}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={vendor.status} />
                <TierBadge tier={vendor.tier} />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {vendor.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {vendor.phone}</p>
            <p className="text-gray-400 text-xs">Owner: {vendor.owner} · Onboarded {vendor.onboardedOn}</p>
          </div>
        </div>

        {/* metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Active Contracts</p>
            <p className="text-lg font-semibold text-gray-900">{vendor.activeContracts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="text-lg font-semibold text-gray-900">{vendor.contractValue ? money(vendor.contractValue) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">SLA Score</p>
            <p className={cn('text-lg font-semibold', vendor.slaScore ? scoreColor(vendor.slaScore) : 'text-gray-400')}>
              {vendor.slaScore ? `${vendor.slaScore}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Next Renewal</p>
            <p className="text-lg font-semibold text-gray-900">{vendor.renewalDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contracts */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Contracts</h3>
          {vendorContracts.length ? (
            <ul className="divide-y divide-gray-100">
              {vendorContracts.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.contractId}</p>
                    <p className="text-xs text-gray-500">{c.startDate} → {c.endDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{money(c.value)}</p>
                    <p className={cn('text-xs', c.status === 'Signed' ? 'text-green-600' : c.status === 'In Review' ? 'text-amber-600' : 'text-gray-500')}>{c.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 py-4">No contracts yet.</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Documents</h3>
          {vendorDocs.length ? (
            <ul className="divide-y divide-gray-100">
              {vendorDocs.map((d) => (
                <li key={d.name} className="flex items-center gap-3 py-3">
                  <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.type} · {d.uploadedBy} · {d.uploadedOn}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 py-4">No documents yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance metrics */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Performance Metrics</h3>
          {review ? (
            <div className="space-y-4">
              {[
                { label: 'SLA Adherence', value: review.slaAdherence },
                { label: 'Delivery Quality', value: review.deliveryQuality },
                { label: 'Relationship Health', value: review.relationshipHealth },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{m.label}</span>
                    <span className={cn('font-medium', scoreColor(m.value))}>{m.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', m.value >= 90 ? 'bg-green-500' : m.value >= 75 ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400">Latest review: {review.quarter}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4">No performance data yet.</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-3">Interaction Timeline</h3>
          {vendorEvents.length ? (
            <ol className="relative border-l border-gray-200 ml-1.5 space-y-4">
              {vendorEvents.map((e, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <p className="text-sm text-gray-900">{e.label}</p>
                  <p className="text-xs text-gray-400">{e.date}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400 py-4">No recorded activity.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- Performance Reviews ---------------------------- */

function TrendIcon({ trend }: { trend: PerformanceReview['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
  return <Minus className="h-4 w-4 text-gray-400" />
}

function PerformanceView({ onOpenVendor }: { onOpenVendor: (id: string) => void }) {
  const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? '—'
  const flagged = performanceReviews.filter((p) => p.slaAdherence < 75).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={ShieldCheck} label="Reviews This Quarter" value={String(performanceReviews.length)} sublabel="Q2 2026" iconClass="bg-purple-100 text-purple-600" />
        <KpiCard icon={CheckCircle2} label="Meeting SLA (≥90%)" value={String(performanceReviews.filter((p) => p.slaAdherence >= 90).length)} sublabel="on target" iconClass="bg-green-100 text-green-600" />
        <KpiCard icon={AlertTriangle} label="Below Threshold" value={String(flagged)} sublabel="need remediation" iconClass="bg-red-100 text-red-600" />
      </div>

      <div className="bg-white rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Quarterly Scorecards</h3>
          <p className="text-xs text-gray-500 mt-0.5">SLA adherence, delivery quality, and relationship health per vendor.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Quarter</th>
                <th className="px-6 py-3 font-medium text-right">SLA Adherence</th>
                <th className="px-6 py-3 font-medium text-right">Delivery Quality</th>
                <th className="px-6 py-3 font-medium text-right">Relationship Health</th>
                <th className="px-6 py-3 font-medium text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {performanceReviews.map((p) => (
                <tr
                  key={p.vendorId}
                  onClick={() => onOpenVendor(p.vendorId)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">{vendorName(p.vendorId)}</td>
                  <td className="px-6 py-3 text-gray-500">{p.quarter}</td>
                  <td className={cn('px-6 py-3 text-right font-medium', scoreColor(p.slaAdherence))}>{p.slaAdherence}%</td>
                  <td className={cn('px-6 py-3 text-right font-medium', scoreColor(p.deliveryQuality))}>{p.deliveryQuality}%</td>
                  <td className={cn('px-6 py-3 text-right font-medium', scoreColor(p.relationshipHealth))}>{p.relationshipHealth}%</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center"><TrendIcon trend={p.trend} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
