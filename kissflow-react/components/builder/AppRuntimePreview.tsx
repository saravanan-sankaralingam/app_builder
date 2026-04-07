'use client'

import { useState } from 'react'
import { MoreHorizontal, Plus, Filter, Download, ChevronDown } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AppRuntimePreviewProps {
  appName: string
  appIcon: string
  appIconBg: string
}

type UserRole = 'employee' | 'manager' | 'finance' | 'admin'

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance Admin',
  admin: 'Admin',
}

function AppIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) {
    return <LucideIcons.Folder className={className} />
  }
  return <IconComponent className={className} />
}

interface NavItem {
  id: string
  label: string
  hasDropdown?: boolean
}

// Mock expense data
const expenseData = [
  { id: 'EXP-001', description: 'Client dinner - Acme Corp', category: 'Meals & Entertainment', amount: 245.50, date: '2024-03-15', status: 'Approved', submittedBy: 'John Smith' },
  { id: 'EXP-002', description: 'Flight to NYC - Sales Conference', category: 'Travel', amount: 589.00, date: '2024-03-14', status: 'Pending', submittedBy: 'Sarah Johnson' },
  { id: 'EXP-003', description: 'Office supplies - Q1', category: 'Office Supplies', amount: 127.85, date: '2024-03-13', status: 'Approved', submittedBy: 'Michael Brown' },
  { id: 'EXP-004', description: 'Uber rides - Client visits', category: 'Transportation', amount: 78.40, date: '2024-03-12', status: 'Reimbursed', submittedBy: 'Emily Davis' },
  { id: 'EXP-005', description: 'Software subscription - Figma', category: 'Software', amount: 144.00, date: '2024-03-11', status: 'Pending', submittedBy: 'Robert Wilson' },
  { id: 'EXP-006', description: 'Team lunch - Project kickoff', category: 'Meals & Entertainment', amount: 312.75, date: '2024-03-10', status: 'Rejected', submittedBy: 'Lisa Anderson' },
  { id: 'EXP-007', description: 'Hotel - Chicago trip', category: 'Travel', amount: 456.00, date: '2024-03-09', status: 'Approved', submittedBy: 'David Martinez' },
  { id: 'EXP-008', description: 'Parking - Downtown office', category: 'Transportation', amount: 45.00, date: '2024-03-08', status: 'Reimbursed', submittedBy: 'Jennifer Taylor' },
]

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'expenses', label: 'My Expenses' },
  { id: 'approvals', label: 'Pending Approvals' },
  { id: 'reports', label: 'Reports', hasDropdown: true },
  { id: 'settings', label: 'Settings' },
]

// Category icons and colors
const categoryStyles: Record<string, { bg: string; text: string }> = {
  'Meals & Entertainment': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Travel': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Office Supplies': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Transportation': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Software': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  'Approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'Reimbursed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Draft': { bg: 'bg-gray-100', text: 'text-gray-700' },
}

export function AppRuntimePreview({ appName, appIcon, appIconBg }: AppRuntimePreviewProps) {
  const [activeNav, setActiveNav] = useState('expenses')
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee')

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header Section */}
      <header className="flex-shrink-0 bg-white">
        <div className="flex items-stretch justify-between px-4">
          {/* Left side: App identity (top) + Navigation (bottom) stacked vertically */}
          <div className="flex flex-col justify-center py-4">
            {/* App Icon and Name */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: appIconBg }}
              >
                <AppIcon name={appIcon} className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[16px] font-medium text-gray-900">{appName}</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-3">
              {navItems.map((item) => {
                const isActive = activeNav === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      'flex items-center gap-1 text-[13px] transition-colors',
                      isActive
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right side: Viewing as dropdown */}
          <div className="flex items-center">
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger className="w-[200px] !h-8 !min-h-0 text-xs border-gray-300 bg-white px-2 gap-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-500 flex-shrink-0">Viewing as</span>
                  <span className="font-medium text-gray-900 truncate">{ROLE_LABELS[selectedRole]}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                <SelectItem value="manager" className="text-xs">Manager</SelectItem>
                <SelectItem value="finance" className="text-xs">Finance Admin</SelectItem>
                <SelectItem value="admin" className="text-xs">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtle Gray Separator Line */}
        <div className="h-px bg-gray-200" />
      </header>

      {/* Content Section */}
      <main className="flex-1 overflow-hidden bg-white">
        {/* Dashboard Page */}
        {activeNav === 'dashboard' && (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs px-3">
                <Download className="h-3 w-3" />
                Export Report
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-blue-700">$12,458.50</p>
                <p className="text-[10px] text-blue-500 mt-1">+12% from last month</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pending Approval</p>
                <p className="text-xl font-bold text-yellow-700">$2,145.00</p>
                <p className="text-[10px] text-yellow-500 mt-1">5 requests pending</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1">Approved</p>
                <p className="text-xl font-bold text-green-700">$8,890.25</p>
                <p className="text-[10px] text-green-500 mt-1">18 expenses approved</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1">Reimbursed</p>
                <p className="text-xl font-bold text-purple-700">$6,234.00</p>
                <p className="text-[10px] text-purple-500 mt-1">12 payments completed</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {expenseData.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {expense.submittedBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{expense.description}</p>
                        <p className="text-[10px] text-gray-500">{expense.submittedBy} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium', statusStyles[expense.status]?.bg, statusStyles[expense.status]?.text)}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Expenses Page */}
        {activeNav === 'expenses' && (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold text-gray-900">My Expenses</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs px-3">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs px-3">
                  <Download className="h-3 w-3" />
                  Export
                </Button>
                <Button size="sm" className="h-7 gap-1.5 text-xs px-3 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-3 w-3" />
                  New Expense
                </Button>
              </div>
            </div>

            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenseData.map((expense) => {
                      const catStyle = categoryStyles[expense.category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                      const statStyle = statusStyles[expense.status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs font-medium text-blue-600">{expense.id}</span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-xs text-gray-900">{expense.description}</span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium', catStyle.bg, catStyle.text)}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap text-right">
                            <span className="text-xs font-medium text-gray-900">${expense.amount.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">{expense.date}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', statStyle.bg, statStyle.text)}>
                              {expense.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3 text-gray-500" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Showing 1-{expenseData.length} of {expenseData.length} expenses</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-6 text-xs px-2" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-6 text-xs px-2" disabled>Next</Button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Page */}
        {activeNav === 'approvals' && (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-base font-semibold text-gray-900">Pending Approvals</h1>
                <p className="text-xs text-gray-500 mt-0.5">Review and approve expense requests from your team</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs px-3">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {expenseData.filter(e => e.status === 'Pending').map((expense) => (
                  <div key={expense.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {expense.submittedBy.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{expense.submittedBy} • Submitted on {expense.date}</p>
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-2', categoryStyles[expense.category]?.bg, categoryStyles[expense.category]?.text)}>
                            {expense.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" className="h-7 text-xs px-3 text-red-600 border-red-200 hover:bg-red-50">
                            Reject
                          </Button>
                          <Button size="sm" className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {expenseData.filter(e => e.status === 'Pending').length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">No pending approvals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Page */}
        {activeNav === 'reports' && (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold text-gray-900">Reports</h1>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs px-3">
                <Plus className="h-3 w-3" />
                Create Report
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <LucideIcons.PieChart className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Expense by Category</h3>
                <p className="text-xs text-gray-500 mt-1">Breakdown of expenses across different categories</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                  <LucideIcons.TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Monthly Trends</h3>
                <p className="text-xs text-gray-500 mt-1">Track expense trends over time</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                  <LucideIcons.Users className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Team Expenses</h3>
                <p className="text-xs text-gray-500 mt-1">View expenses by team members</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <LucideIcons.Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Quarterly Summary</h3>
                <p className="text-xs text-gray-500 mt-1">Quarterly expense summary report</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mb-3">
                  <LucideIcons.AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Policy Violations</h3>
                <p className="text-xs text-gray-500 mt-1">Expenses flagged for policy review</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center mb-3">
                  <LucideIcons.Receipt className="h-4 w-4 text-teal-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Reimbursement Status</h3>
                <p className="text-xs text-gray-500 mt-1">Track reimbursement processing</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Page */}
        {activeNav === 'settings' && (
          <div className="h-full flex flex-col p-4">
            <div className="mb-4">
              <h1 className="text-base font-semibold text-gray-900">Settings</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage your expense preferences and configurations</p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Expense Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(categoryStyles).map((cat) => (
                    <span key={cat} className={cn('inline-flex items-center px-2.5 py-1 rounded text-xs font-medium', categoryStyles[cat].bg, categoryStyles[cat].text)}>
                      {cat}
                    </span>
                  ))}
                  <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-gray-400">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Category
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Approval Workflow</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-900">Auto-approve expenses under</p>
                      <p className="text-[10px] text-gray-500">Expenses below this amount will be auto-approved</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$50.00</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-900">Require receipts for expenses over</p>
                      <p className="text-[10px] text-gray-500">Receipts mandatory above this amount</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$25.00</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-medium text-gray-900">Manager approval required</p>
                      <p className="text-[10px] text-gray-500">All expenses require manager sign-off</p>
                    </div>
                    <div className="h-5 w-9 bg-blue-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-xs text-gray-700">Email notifications for approvals</p>
                    <div className="h-5 w-9 bg-blue-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-xs text-gray-700">Weekly expense summary</p>
                    <div className="h-5 w-9 bg-gray-200 rounded-full relative">
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
