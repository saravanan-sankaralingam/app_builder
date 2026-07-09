'use client'

import { Receipt, Settings, MoreVertical, Pin, UserPlus, ChevronRight, Download, Filter, Plus, MoreHorizontal, PieChart as PieChartIcon, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ManageView } from '@/components/app-view/ManageView'
import { useAppPreview } from '@/components/app-view/AppPreviewContext'
import { AppNavRoleSwitcher } from '@/components/app-view/AppNavRoleSwitcher'

type ViewType = 'dashboard' | 'expenses' | 'approvals' | 'reports' | 'settings'

const expenseData = [
  { id: 'EXP-001', description: 'Client dinner - Acme Corp', category: 'Meals & Entertainment', amount: 245.50, date: '2026-06-25', status: 'Approved', submittedBy: 'John Smith' },
  { id: 'EXP-002', description: 'Flight to NYC - Sales Conference', category: 'Travel', amount: 589.00, date: '2026-06-24', status: 'Pending', submittedBy: 'Sarah Johnson' },
  { id: 'EXP-003', description: 'Office supplies - Q2', category: 'Office Supplies', amount: 127.85, date: '2026-06-23', status: 'Approved', submittedBy: 'Michael Brown' },
  { id: 'EXP-004', description: 'Uber rides - Client visits', category: 'Transportation', amount: 78.40, date: '2026-06-22', status: 'Reimbursed', submittedBy: 'Emily Davis' },
  { id: 'EXP-005', description: 'Software subscription - Figma', category: 'Software', amount: 144.00, date: '2026-06-21', status: 'Pending', submittedBy: 'Robert Wilson' },
  { id: 'EXP-006', description: 'Team lunch - Project kickoff', category: 'Meals & Entertainment', amount: 312.75, date: '2026-06-20', status: 'Rejected', submittedBy: 'Lisa Anderson' },
  { id: 'EXP-007', description: 'Hotel - Chicago trip', category: 'Travel', amount: 456.00, date: '2026-06-19', status: 'Approved', submittedBy: 'David Martinez' },
  { id: 'EXP-008', description: 'Parking - Downtown office', category: 'Transportation', amount: 45.00, date: '2026-06-18', status: 'Reimbursed', submittedBy: 'Jennifer Taylor' },
]

const categoryStyles: Record<string, { bg: string; text: string }> = {
  'Meals & Entertainment': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Travel': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Office Supplies': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Transportation': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Software': { bg: 'bg-skyblue-100', text: 'text-skyblue-700' },
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  'Approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'Reimbursed': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Draft': { bg: 'bg-gray-100', text: 'text-gray-700' },
}

export default function ExpenseManagementPage() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isManaging, setIsManaging] = useState(false)
  const { inBuilderPlay } = useAppPreview()

  const tabs: { key: ViewType; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'expenses', label: 'My Expenses' },
    { key: 'approvals', label: 'Pending Approvals' },
    { key: 'reports', label: 'Reports' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-[calc(100vh-50px)] bg-gray-100">
      {/* App Header — sticky */}
      <div className="sticky top-0 z-10 bg-gray-100 px-5 py-3">
        <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
          {/* Top Row: App Info + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-purple-500" strokeWidth={1.25} />
              <h1 className="text-lg font-semibold text-gray-900">Expense Management</h1>

              {!inBuilderPlay && (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                    <Pin className="h-4 w-4 text-gray-500" />
                  </Button>

                  <div className="flex items-center -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium ring-2 ring-white">
                      SS
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-medium ring-2 ring-white">
                      JD
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium ring-2 ring-white">
                      AK
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                    <UserPlus className="h-4 w-4 text-gray-500" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                Expense Management
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-700 font-medium leading-none">Manage</span>
            </nav>
          ) : (
            <div className="flex gap-3 -mb-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setCurrentView(t.key)}
                  className={cn(
                    "relative px-1 pt-1 pb-3 text-sm transition-colors",
                    currentView === t.key
                      ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                      : "text-gray-600 font-normal hover:text-gray-900"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {isManaging ? (
          <ManageView
            onEditApp={() =>
              window.open('/builder/expense-management', '_blank', 'noopener,noreferrer')
            }
          />
        ) : (
        <>
        {currentView === 'dashboard' && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Dashboard</h2>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3">
                <Download className="h-3.5 w-3.5" />
                Export Report
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-blue-700">$12,458.50</p>
                <p className="text-[10px] text-blue-600 mt-1">+12% from last month</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-200">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pending Approval</p>
                <p className="text-xl font-bold text-yellow-700">$2,145.00</p>
                <p className="text-[10px] text-yellow-600 mt-1">5 requests pending</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1">Approved</p>
                <p className="text-xl font-bold text-green-700">$8,890.25</p>
                <p className="text-[10px] text-green-600 mt-1">18 expenses approved</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium mb-1">Reimbursed</p>
                <p className="text-xl font-bold text-purple-700">$6,234.00</p>
                <p className="text-[10px] text-purple-600 mt-1">12 payments completed</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {expenseData.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-medium">
                        {expense.submittedBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{expense.description}</p>
                        <p className="text-[11px] text-gray-500">{expense.submittedBy} • {expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium', statusStyles[expense.status]?.bg, statusStyles[expense.status]?.text)}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'expenses' && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">My Expenses</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs px-3 bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="h-3.5 w-3.5" />
                  New Expense
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-gray-700 uppercase tracking-wider">Expense ID</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-medium text-gray-700 uppercase tracking-wider">Actions</th>
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
                              <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
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
                <Button variant="outline" size="sm" className="h-7 text-xs px-3" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3" disabled>Next</Button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'approvals' && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Pending Approvals</h2>
                <p className="text-xs text-gray-500 mt-0.5">Review and approve expense requests from your team</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {expenseData.filter(e => e.status === 'Pending').map((expense) => (
                  <div key={expense.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-sm font-medium">
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
                          <Button variant="outline" size="sm" className="h-8 text-xs px-3 text-red-600 border-red-200 hover:bg-red-100">
                            Reject
                          </Button>
                          <Button size="sm" className="h-8 text-xs px-3 bg-green-500 hover:bg-green-600 text-white">
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

        {currentView === 'reports' && (
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Reports</h2>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3">
                <Plus className="h-3.5 w-3.5" />
                Create Report
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Expense by Category</h3>
                <p className="text-xs text-gray-500 mt-1">Breakdown of expenses across different categories</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Monthly Trends</h3>
                <p className="text-xs text-gray-500 mt-1">Track expense trends over time</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Team Expenses</h3>
                <p className="text-xs text-gray-500 mt-1">View expenses by team members</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Quarterly Summary</h3>
                <p className="text-xs text-gray-500 mt-1">Quarterly expense summary report</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Policy Violations</h3>
                <p className="text-xs text-gray-500 mt-1">Expenses flagged for policy review</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-cyan-300 hover:shadow-sm cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg bg-cyan-100 flex items-center justify-center mb-3">
                  <Receipt className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">Reimbursement Status</h3>
                <p className="text-xs text-gray-500 mt-1">Track reimbursement processing</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Settings</h2>
              <p className="text-xs text-gray-500">Manage your expense preferences and configurations</p>
            </div>

            <div className="bg-white rounded-lg p-6">
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

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Approval Workflow</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Auto-approve expenses under</p>
                    <p className="text-[11px] text-gray-500">Expenses below this amount will be auto-approved</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">$50.00</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Require receipts for expenses over</p>
                    <p className="text-[11px] text-gray-500">Receipts mandatory above this amount</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">$25.00</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Manager approval required</p>
                    <p className="text-[11px] text-gray-500">All expenses require manager sign-off</p>
                  </div>
                  <div className="h-5 w-9 bg-blue-500 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <p className="text-xs text-gray-700">Email notifications for approvals</p>
                  <div className="h-5 w-9 bg-blue-500 rounded-full relative">
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
        )}
        </>
        )}
      </div>
    </div>
  )
}
