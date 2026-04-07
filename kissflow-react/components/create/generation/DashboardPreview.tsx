'use client'

import { Clock, CheckCircle, XCircle, Calendar, Users, TrendingUp } from 'lucide-react'

interface DashboardPreviewProps {
  appName: string
}

// Mock data for the dashboard
const MOCK_STATS = [
  { label: 'Pending', value: 12, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50' },
  { label: 'Approved', value: 45, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  { label: 'Rejected', value: 3, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
]

const MOCK_RECENT_REQUESTS = [
  { id: 1, name: 'John Doe', type: 'Vacation', dates: 'Apr 15 - Apr 20', status: 'pending' },
  { id: 2, name: 'Jane Smith', type: 'Sick Leave', dates: 'Mar 22', status: 'approved' },
  { id: 3, name: 'Mike Johnson', type: 'Personal', dates: 'Apr 5', status: 'approved' },
  { id: 4, name: 'Sarah Wilson', type: 'Vacation', dates: 'May 1 - May 5', status: 'pending' },
  { id: 5, name: 'David Brown', type: 'Sick Leave', dates: 'Mar 28', status: 'rejected' },
]

const MOCK_TEAM_STATS = [
  { label: 'Total Employees', value: 48, icon: Users },
  { label: 'Leaves This Month', value: 15, icon: Calendar },
  { label: 'Approval Rate', value: '94%', icon: TrendingUp },
]

export function DashboardPreview({ appName }: DashboardPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{appName}</h1>
        <p className="text-sm text-gray-500">Dashboard Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-4 border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Team Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Team Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {MOCK_TEAM_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Requests</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {MOCK_RECENT_REQUESTS.map((request) => (
            <div key={request.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {request.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.type} - {request.dates}</p>
                </div>
              </div>
              <span
                className={`
                  text-xs font-medium px-2 py-1 rounded-full
                  ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                  ${request.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                  ${request.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                `}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
