'use client'

import { ShoppingBag, Settings, MoreVertical, Pin, UserPlus, TrendingUp, TrendingDown, Store, DollarSign, Users, Package, ArrowUpRight, ArrowDownRight, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Activity, Zap, Target, Bell, Star, ChevronDown, Phone, Mail, FileText, List, MinusCircle, Clipboard, Wallet, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ViewType = 'home' | 'home-n' | 'home-p' | 'site-evaluation' | 'site-evaluation-n' | 'store-acquisition' | 'store-acquisition-n' | 'projects' | 'project-status' | 'rules-engine'

export default function RetailOnePage() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [storeAcquisitionTab, setStoreAcquisitionTab] = useState<'my-items' | 'my-tasks'>('my-tasks')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectDetailTab, setProjectDetailTab] = useState<'summary' | 'budget' | 'tasks' | 'layout' | 'procurement' | 'inventory' | 'team'>('summary')

  // Chart data - Updated color scheme (Blue/Teal/Purple)
  const onboardingData = [
    { name: 'High priority', value: 35, color: '#8B5CF6' },
    { name: 'Overdue', value: 12, color: '#EC4899' },
    { name: 'On-hold', value: 1, color: '#FBBF24' },
    { name: 'Completed', value: 13, color: '#10B981' },
  ]

  const budgetData = [
    { month: '01 (Jan)', amount: 5000 },
    { month: '02 (Feb)', amount: 15000 },
    { month: '03 (Mar)', amount: 30000 },
  ]

  const expensesData = [
    { name: 'Travel', value: 50, color: '#3B82F6' },
    { name: 'Food', value: 45, color: '#06B6D4' },
    { name: 'Training', value: 5, color: '#A5B4FC' },
  ]

  const siteAcquisitionData = [
    { stage: 'Discovery', count: 4 },
    { stage: 'Due Diligence', count: 2 },
    { stage: 'Evaluation', count: 5 },
    { stage: 'Negotiation', count: 4 },
    { stage: 'Site Planning', count: 10 },
    { stage: 'Other', count: 16 },
  ]

  const siteEvaluationData = [
    { name: 'Competition Analysis', value: 25, color: '#8B5CF6' },
    { name: 'Demographics & GIS', value: 20, color: '#A78BFA' },
    { name: 'Evaluation Review & Approval', value: 30, color: '#C4B5FD' },
    { name: '1st', value: 25, color: '#DDD6FE' },
  ]

  return (
    <div className="min-h-[calc(100vh-50px)] bg-gray-100">
      {/* App Header */}
      <div className="px-5 py-3">
        <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
          {/* Top Row: App Info + Actions */}
          <div className="flex items-center justify-between">
            {/* Left: App Icon + Title + Pin + Avatars + Add User */}
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Retail One</h1>

              {/* Pin Icon */}
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <Pin className="h-4 w-4 text-gray-500" />
              </Button>

              {/* Avatar Group */}
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

              {/* Add User Icon */}
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <UserPlus className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            {/* Right: Manage + More */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="gap-2 h-8 text-[13px]">
                <Settings className="h-3 w-3" />
                Manage
              </Button>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs - Line Variant */}
          <div className="flex gap-3 -mb-3">
            <button
              onClick={() => setCurrentView('home')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'home'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('home-n')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'home-n'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Home-N
            </button>
            <button
              onClick={() => setCurrentView('home-p')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'home-p'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Home-P
            </button>
            <button
              onClick={() => setCurrentView('site-evaluation')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'site-evaluation'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Site Evaluation
            </button>
            <button
              onClick={() => setCurrentView('site-evaluation-n')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'site-evaluation-n'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Site Evaluation - N
            </button>
            <button
              onClick={() => setCurrentView('store-acquisition')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'store-acquisition'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Store Acquisition
            </button>
            <button
              onClick={() => setCurrentView('store-acquisition-n')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'store-acquisition-n'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Store Acquisition - N
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'projects'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentView('project-status')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'project-status'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Project Status
            </button>
            <button
              onClick={() => setCurrentView('rules-engine')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'rules-engine'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Rules Engine
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {currentView === 'home' && (
          <div className="space-y-4">
            {/* Row 1 - 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Stores Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Stores</h3>
                <div className="h-64 bg-gradient-to-br from-blue-200 to-cyan-300 rounded relative overflow-hidden">
                  {/* Map placeholder with store markers */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="flex gap-2 justify-center">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        Store Locations
                      </div>
                      <div className="text-xs text-gray-600">
                        North Sydney, Balmain, Rozelle, Glebe, etc.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Project Status Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Onboarding Project Status</h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={onboardingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {onboardingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-3xl font-bold text-purple-500">35</div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-xs text-gray-600">High priority</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-3xl font-bold text-pink-500">12</div>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-xs text-gray-600">Overdue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500">01</div>
                      <div className="text-xs text-gray-600">On-hold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">13</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Budget Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Total Budget</h3>
                <div className="mb-4">
                  <div className="text-xs text-gray-600">Total</div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-blue-600">$8.5M</div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">12%</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 2 - 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Expenses by Category Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Expenses by Category</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={expensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {expensesData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium">{item.value}%</span>
                        <span className="text-sm text-gray-600">- {item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Site Acquisition Status Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Site Acquisition Status</h3>
                <div className="mb-2 text-xs text-gray-600 flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500"></div>
                  <span>Company Name (count)</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={siteAcquisitionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-600">Current step</div>
                  <div className="w-full h-2 bg-blue-500 rounded-full mt-1"></div>
                </div>
              </div>

              {/* New Site Evaluation Card */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">New Site Evaluation</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={siteEvaluationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {siteEvaluationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {siteEvaluationData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 - Full Width Card */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Pending Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">ID</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Job Name</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Start Date</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Duration</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700" colSpan={6}>
                        <div className="flex gap-8 text-xs">
                          <span>Apr 29, 2024</span>
                          <span>May 05, 2024</span>
                          <span>May 12, 2024</span>
                          <span>May 19, 2024</span>
                          <span>May 26, 2024</span>
                          <span>Jun 02, 2024</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <span key={i}>{day}</span>
                          ))}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0014</td>
                      <td className="py-2 px-2">Mumbai</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0013</td>
                      <td className="py-2 px-2">Bangalore</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0012</td>
                      <td className="py-2 px-2">Bangalore</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0011</td>
                      <td className="py-2 px-2">Warehouse - Pune</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">32.83 d</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 right-0 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0010</td>
                      <td className="py-2 px-2 flex items-center gap-1">
                        <span>▼</span> Warehouse - Mumbai
                      </td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-300 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ-0010-01</td>
                      <td className="py-2 px-2">Govt Permissions</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ-0010-02</td>
                      <td className="py-2 px-2">Electricity Approvals</td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">1 day</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 w-8 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">NJ0009</td>
                      <td className="py-2 px-2 flex items-center gap-1">
                        <span>▼</span> Warehouse - Mumbai
                      </td>
                      <td className="py-2 px-2">4/29/2024</td>
                      <td className="py-2 px-2">32.83 d</td>
                      <td className="py-2 px-4" colSpan={6}>
                        <div className="h-6 relative">
                          <div className="absolute left-0 right-0 h-4 bg-teal-500 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'home-n' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Stores KPI */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>12%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">127</div>
                <div className="text-sm text-blue-100">Total Stores</div>
              </div>

              {/* Revenue KPI */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>8.3%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">$12.4M</div>
                <div className="text-sm text-emerald-100">Monthly Revenue</div>
              </div>

              {/* Active Projects KPI */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>3.2%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">48</div>
                <div className="text-sm text-purple-100">Active Projects</div>
              </div>

              {/* Team Members KPI */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>5.1%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">234</div>
                <div className="text-sm text-amber-100">Team Members</div>
              </div>
            </div>

            {/* Middle Section - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Store Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Store Performance</h3>
                    <p className="text-sm text-gray-500 mt-1">Revenue trends over the last 6 months</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Last 6 months</option>
                    <option>Last 3 months</option>
                    <option>Last year</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', revenue: 2400, target: 2200 },
                    { month: 'Feb', revenue: 2800, target: 2400 },
                    { month: 'Mar', revenue: 2600, target: 2600 },
                    { month: 'Apr', revenue: 3200, target: 2800 },
                    { month: 'May', revenue: 3800, target: 3000 },
                    { month: 'Jun', revenue: 4200, target: 3200 },
                  ]}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} name="Revenue" />
                    <Line type="monotone" dataKey="target" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#D1D5DB', r: 4 }} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Project Status Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Completed</div>
                        <div className="text-sm text-gray-500">On schedule</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">24</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">In Progress</div>
                        <div className="text-sm text-gray-500">Active work</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">18</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <div className="font-semibold text-gray-900">At Risk</div>
                        <div className="text-sm text-gray-500">Needs attention</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">4</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Blocked</div>
                        <div className="text-sm text-gray-500">Action required</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">2</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Activity & Regional Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Feed */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Mumbai Store Launch Completed</p>
                      <p className="text-sm text-gray-500 mt-1">All pre-launch tasks finished successfully</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Site Evaluation Scheduled</p>
                      <p className="text-sm text-gray-500 mt-1">Bangalore location - June 15, 2024</p>
                      <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Budget Approval Pending</p>
                      <p className="text-sm text-gray-500 mt-1">Pune warehouse expansion - $2.3M</p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">New Team Members Onboarded</p>
                      <p className="text-sm text-gray-500 mt-1">12 store managers joined this week</p>
                      <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Performance */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Performance</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { region: 'North', stores: 45, revenue: 4.2 },
                    { region: 'South', stores: 38, revenue: 3.8 },
                    { region: 'East', stores: 22, revenue: 2.1 },
                    { region: 'West', stores: 22, revenue: 2.3 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="region" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stores" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Stores" />
                    <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} name="Revenue ($M)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {currentView === 'home-p' && (
          <div className="space-y-6">
            {/* Dashboard Header with Quick Stats */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Dashboard</h2>
                  <p className="text-indigo-100">Real-time overview of all retail operations</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-sm font-medium">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>

              {/* Inline Stats using Onboarding Data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                  <div className="text-3xl font-bold">{onboardingData[0].value}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                  <div className="text-3xl font-bold">{onboardingData[1].value}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">On-hold</span>
                  </div>
                  <div className="text-3xl font-bold">{onboardingData[2].value}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <div className="text-3xl font-bold">{onboardingData[3].value}</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Budget & Expenses */}
              <div className="space-y-6">
                {/* Budget Card with Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Total Budget</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="text-3xl font-bold text-blue-600">$8.5M</div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">12%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={budgetData}>
                        <defs>
                          <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                          fill="url(#budgetGradient)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Expenses Breakdown</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie
                            data={expensesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                            {expensesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {expensesData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: item.color }}
                            >
                              {item.value}%
                            </div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <div className="text-sm text-gray-500">${(item.value * 85).toFixed(1)}K</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Site Status */}
              <div className="space-y-6">
                {/* Site Acquisition Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Site Acquisition Pipeline</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full">
                      <Activity className="h-4 w-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-600">
                        {siteAcquisitionData.reduce((sum, item) => sum + item.count, 0)} Total
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={siteAcquisitionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#14B8A6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Site Evaluation Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Site Evaluation Status</h3>
                  <div className="space-y-3">
                    {siteEvaluationData.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Completion Rate</div>
                          <div className="text-xs text-gray-500">Based on evaluation progress</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(siteEvaluationData.reduce((sum, item) => sum + item.value, 0) / siteEvaluationData.length)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom - Store Locations Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">Store Locations</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      North Sydney
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Balmain
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Rozelle
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      View All
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200 relative">
                {/* Map visualization with store pins */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Store markers at different positions */}
                    <div className="absolute top-1/4 left-1/3 flex flex-col items-center group cursor-pointer">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg" />
                      <div className="mt-2 px-2 py-1 bg-white rounded shadow-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        North Sydney
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 flex flex-col items-center group cursor-pointer">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }} />
                      <div className="mt-2 px-2 py-1 bg-white rounded shadow-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Balmain
                      </div>
                    </div>
                    <div className="absolute top-2/3 left-2/3 flex flex-col items-center group cursor-pointer">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }} />
                      <div className="mt-2 px-2 py-1 bg-white rounded shadow-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Rozelle
                      </div>
                    </div>
                    <div className="absolute top-1/3 right-1/4 flex flex-col items-center group cursor-pointer">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }} />
                      <div className="mt-2 px-2 py-1 bg-white rounded shadow-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Glebe
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Store Status</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-gray-700">High Traffic</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-gray-700">Optimal</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className="text-gray-700">New Location</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'site-evaluation' && (
          <div className="space-y-6">
            {/* KPI Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Best Evaluation Throughput - Card Style 1 */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">70%</div>
                <div className="text-xs text-pink-100 mb-2">Best Evaluation Throughput</div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              {/* SLA per Location - Card Style 2 */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-2xl font-bold">48</div>
                  <div className="text-sm text-blue-100">Hours</div>
                </div>
                <div className="text-xs text-blue-100 mb-2">SLA per Location</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-blue-100">
                    <span>Target:</span>
                    <span className="font-medium">72h</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="font-medium bg-white/20 px-2 py-0.5 rounded-full">33% faster</span>
                </div>
              </div>

              {/* Success Rate - Card Style 3 */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium backdrop-blur-sm">
                    Excellent
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">75%</div>
                <div className="text-xs text-emerald-100 mb-3">Success Rate</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-emerald-200">Passed</div>
                    <div className="font-semibold">48</div>
                  </div>
                  <div>
                    <div className="text-emerald-200">Failed</div>
                    <div className="font-semibold">16</div>
                  </div>
                </div>
              </div>

              {/* Avg Rating Per Site - Card Style 4 */}
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Star className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-2xl font-bold">4.0</div>
                  <div className="text-sm text-amber-100">/5</div>
                </div>
                <div className="text-xs text-amber-100 mb-3">Avg. Rating Per Site</div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-white text-white" />
                  ))}
                  <Star className="h-3 w-3 text-white/40" />
                </div>
              </div>

              {/* Notifications - Card Style 5 */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                  <div className="text-2xl font-bold mb-1">20</div>
                  <div className="text-xs text-amber-100 mb-2">New Notifications</div>
                  <div className="flex items-center gap-2 text-xs text-amber-100">
                    <span>12 urgent</span>
                    <div className="w-1 h-1 rounded-full bg-amber-200" />
                    <span>8 normal</span>
                  </div>
                </div>
              </div>

              {/* Territory Productivity Score - Card Style 6 */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <ArrowUpRight className="h-3 w-3" />
                    +5
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-2xl font-bold">80</div>
                  <div className="text-sm text-purple-100">/100</div>
                </div>
                <div className="text-xs text-purple-100 mb-2">Territory Productivity</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '80%' }} />
                  </div>
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">Good</span>
                </div>
              </div>
            </div>

            {/* Site Evaluation Milestones Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Site Evaluation Milestones</h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <span>Search</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  New Site
                </button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Column Headers */}
              <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 bg-gray-50">
                <div className="p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Column</span>
                    <span className="text-sm text-gray-500">Status</span>
                  </div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-rose-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Lead</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1 item</div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Demographics & GIS</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1 item</div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Competition Analysis</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">3 items</div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-green-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Summary</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2 items</div>
                </div>
                <div className="p-4 bg-rose-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Evaluation Review & App...</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2 items</div>
                </div>
              </div>

              {/* Critical Priority Row */}
              <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200">
                {/* Priority Label */}
                <div className="p-4 bg-red-50 border-r border-gray-200 flex items-start">
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <ChevronDown className="h-4 w-4" />
                    <span>Critical</span>
                  </button>
                </div>

                {/* Lead Column - CT-0011 */}
                <div className="p-4 border-r border-gray-200 bg-rose-50/30">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">CT-0011</span>
                      <button className="text-red-500 hover:text-red-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">D</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 font-medium">30 Jan 24</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-gray-500">Name</div>
                        <div className="font-medium text-gray-900">Krishna</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Contact</div>
                        <div className="font-medium text-gray-900">9876877989</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Email ID</div>
                        <div className="font-medium text-gray-900">krishna@gmail.com</div>
                      </div>
                    </div>
                    <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                      Show more
                    </button>
                  </div>
                </div>

                {/* Demographics & GIS Column - CT-0009 */}
                <div className="p-4 border-r border-gray-200 bg-orange-50/30">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">CT-0009</span>
                      <button className="text-red-500 hover:text-red-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">D</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 font-medium">01 Jan → 31 Jan</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-gray-500">Name</div>
                        <div className="font-medium text-gray-900">HSR Layout</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Contact</div>
                        <div className="font-medium text-gray-900">9876877989</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Email ID</div>
                        <div className="font-medium text-gray-900">dp@gmail.com</div>
                      </div>
                    </div>
                    <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                      Show more
                    </button>
                  </div>
                </div>

                {/* Competition Analysis Column - 3 Cards */}
                <div className="p-4 border-r border-gray-200 bg-orange-50/30">
                  <div className="space-y-3">
                    {/* CT-0010 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0010</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">W</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600 font-medium">16 May 24</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Krishna</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">9876877989</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">krishna@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>

                    {/* CT-0012 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0012</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-green-600">DK</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600 font-medium">01 Apr 25 → 25 Apr 25</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Narayan</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">9876877989</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">krishna@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>

                    {/* CT-0023 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0023</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">W</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600 font-medium">13 Dec 24</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">SS</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">9999999999</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">S@email.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Column - 2 Cards */}
                <div className="p-4 border-r border-gray-200 bg-green-50/30">
                  <div className="space-y-3">
                    {/* CT-0028 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0028</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">W</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-600 font-medium">13 Dec 24</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Sudha</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">8888888888</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">sudhagandrapan15@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>

                    {/* CT-0028 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0028</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">W</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-600 font-medium">31 Jan 25</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Amit Bagadia</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">7718003586</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">amitbagadia@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evaluation Review Column - 2 Cards */}
                <div className="p-4 bg-rose-50/30">
                  <div className="space-y-3">
                    {/* CT-0013 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0013</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-green-600">DK</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-600 font-medium">14 May 24 → 23 May 24</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Narayan</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">9876877989</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">krishna@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>

                    {/* CT-0008 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">CT-0008</span>
                        <button className="text-red-500 hover:text-red-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">W</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-600 font-medium">29 Jan 24</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">Narayan</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Contact</div>
                          <div className="font-medium text-gray-900">9876877989</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email ID</div>
                          <div className="font-medium text-gray-900">krishna@gmail.com</div>
                        </div>
                      </div>
                      <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                        Show more
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* High Priority Row */}
              <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr_1fr]">
                {/* Priority Label */}
                <div className="p-4 bg-orange-50 border-r border-gray-200 flex items-start">
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <ChevronDown className="h-4 w-4" />
                    <span>High</span>
                  </button>
                </div>

                {/* Empty columns placeholder */}
                <div className="p-4 border-r border-gray-200 bg-rose-50/20">
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
                    No items
                  </div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-orange-50/20">
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
                    No items
                  </div>
                </div>
                <div className="p-4 border-r border-gray-200 bg-orange-50/20"></div>
                <div className="p-4 border-r border-gray-200 bg-green-50/20">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">CT-0098</span>
                      <button className="text-red-500 hover:text-red-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-red-600">W</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-600 font-medium">30 Jan 24</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-gray-500">Name</div>
                        <div className="font-medium text-gray-900">Krishna</div>
                      </div>
                    </div>
                    <button className="mt-3 text-xs text-red-600 font-medium hover:text-red-700">
                      Show more
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-rose-50/20"></div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'site-evaluation-n' && (
          <div className="space-y-6">
            {/* Compact Stats Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {/* Compact Card 1 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">70%</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Throughput</div>
                  </div>
                </div>

                {/* Compact Card 2 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">48h</div>
                    <div className="text-[10px] text-gray-600 leading-tight">SLA Time</div>
                  </div>
                </div>

                {/* Compact Card 3 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">75%</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Success Rate</div>
                  </div>
                </div>

                {/* Compact Card 4 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">4.0</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Avg Rating</div>
                  </div>
                </div>

                {/* Compact Card 5 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <div className="p-2 bg-orange-500 rounded-lg relative">
                    <Bell className="h-4 w-4 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">20</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Alerts</div>
                  </div>
                </div>

                {/* Compact Card 6 */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">80</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - List View Alternative */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Site Evaluation Progress</h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <span>Filters</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  New Evaluation
                </button>
              </div>
            </div>

            {/* Timeline View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="space-y-6">
                {/* Stage 1 - Lead */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Lead Generation</h3>
                      <p className="text-sm text-gray-500">Initial contact and site identification</p>
                    </div>
                    <div className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium">
                      1 Active
                    </div>
                  </div>
                  <div className="ml-14 grid grid-cols-1 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-rose-300 hover:bg-rose-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0011</span>
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          30 Jan 24
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Krishna - Mumbai Location</div>
                      <div className="text-xs text-gray-500">krishna@gmail.com • 9876877989</div>
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 w-px h-8 bg-gradient-to-b from-rose-300 to-orange-300"></div>

                {/* Stage 2 - Demographics */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Demographics & GIS</h3>
                      <p className="text-sm text-gray-500">Population and geographic analysis</p>
                    </div>
                    <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                      1 Active
                    </div>
                  </div>
                  <div className="ml-14 grid grid-cols-1 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0009</span>
                        <span className="text-xs text-gray-600">01 Jan → 31 Jan</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">HSR Layout - Analysis Phase</div>
                      <div className="text-xs text-gray-500">dp@gmail.com • 9876877989</div>
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 w-px h-8 bg-gradient-to-b from-orange-300 to-teal-300"></div>

                {/* Stage 3 - Competition Analysis */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Competition Analysis</h3>
                      <p className="text-sm text-gray-500">Market research and competitor mapping</p>
                    </div>
                    <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                      3 Active
                    </div>
                  </div>
                  <div className="ml-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0010</span>
                        <span className="text-xs text-red-600">16 May 24</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Krishna</div>
                      <div className="text-xs text-gray-500">krishna@gmail.com</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0012</span>
                        <span className="text-xs text-gray-600">01 Apr → 25 Apr</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Narayan</div>
                      <div className="text-xs text-gray-500">krishna@gmail.com</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0023</span>
                        <span className="text-xs text-red-600">13 Dec 24</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">SS</div>
                      <div className="text-xs text-gray-500">S@email.com</div>
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="ml-5 w-px h-8 bg-gradient-to-b from-teal-300 to-green-300"></div>

                {/* Stage 4 - Summary */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Summary & Review</h3>
                      <p className="text-sm text-gray-500">Final consolidation and recommendations</p>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      2 Active
                    </div>
                  </div>
                  <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-green-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0028</span>
                        <span className="text-xs text-gray-600">13 Dec 24</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Sudha</div>
                      <div className="text-xs text-gray-500">sudhagandrapan15@gmail.com</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-green-50/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">CT-0028</span>
                        <span className="text-xs text-gray-600">31 Jan 25</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Amit Bagadia</div>
                      <div className="text-xs text-gray-500">amitbagadia@gmail.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'store-acquisition' && (
          <div className="space-y-8">
            {/* Hero Section with Stats */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Site Acquisition Pipeline</h2>
                    <p className="text-indigo-100">Track and manage your store acquisition process</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform">
                    + New Site
                  </button>
                </div>

                {/* Modern KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Lease Review Card - Split Design */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold mb-1">20</div>
                        <div className="text-sm text-indigo-100">Under Lease Review</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-indigo-100">This week</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <TrendingUp className="h-4 w-4" />
                          <span>+3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HR Approval Card - Circular Progress */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold mb-1">10</div>
                        <div className="text-sm text-indigo-100">HR Approval Pending</div>
                      </div>
                      <div className="relative w-16 h-16">
                        {/* Circular progress */}
                        <svg className="w-16 h-16 -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/20" />
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-white" strokeDasharray="175.93" strokeDashoffset="52.78" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="text-indigo-100">Avg. 2.5 days</span>
                      </div>
                    </div>
                  </div>

                  {/* Dropout Rate Card - Alert Style */}
                  <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 border border-amber-400/30 hover:bg-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-amber-400/30 rounded-lg">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div className="px-3 py-1 bg-amber-400/20 rounded-full text-xs font-semibold">
                        Low
                      </div>
                    </div>
                    <div className="text-4xl font-bold mb-1">5%</div>
                    <div className="text-sm text-amber-100 mb-3">Dropout Rate</div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-300 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-amber-100">
                      3 of 60 sites this quarter
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Tab Design */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStoreAcquisitionTab('my-items')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                    storeAcquisitionTab === 'my-items'
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  My Items
                </button>
                <button
                  onClick={() => setStoreAcquisitionTab('my-tasks')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-semibold transition-all relative",
                    storeAcquisitionTab === 'my-tasks'
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  My Tasks
                  {storeAcquisitionTab === 'my-tasks' && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                      0
                    </span>
                  )}
                </button>
              </div>

              {/* Creative Empty State */}
              <div className="py-20">
                <div className="max-w-md mx-auto text-center">
                  {/* Animated Illustration */}
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      {/* Main circle with gradient */}
                      <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center relative">
                        {/* Floating checklist */}
                        <div className="w-24 h-28 bg-white rounded-lg shadow-xl absolute z-10 border-2 border-gray-100">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-indigo-500 rounded-t"></div>
                          <div className="p-3 pt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded border-2 border-gray-300"></div>
                              <div className="h-1 w-12 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded border-2 border-gray-300"></div>
                              <div className="h-1 w-10 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded border-2 border-gray-300"></div>
                              <div className="h-1 w-11 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                        {/* Success badge */}
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20">
                          <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.5} />
                        </div>
                        {/* Decorative dots */}
                        <div className="absolute top-4 -left-4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 -right-6 w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">All Caught Up!</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    You have no pending tasks at the moment. <br />
                    Take a break or start a new acquisition process.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3">
                    <button className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                      View All Items
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm shadow-lg shadow-indigo-200">
                      Create New Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'store-acquisition-n' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Acquisition Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Monitor and manage your site acquisition pipeline</p>
              </div>
              <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                + Add New Site
              </button>
            </div>

            {/* Light Mode KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sites Under Lease Review */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs font-semibold text-blue-700">
                    <TrendingUp className="h-3 w-3" />
                    +3 this week
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">20</div>
                <div className="text-sm text-gray-600 mb-4">Sites Under Lease Review</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Avg. review time: 5 days</span>
                </div>
                <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* Sites Under HR Approval */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700">
                    In Progress
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">10</div>
                <div className="text-sm text-gray-600 mb-4">Sites Under HR Approval</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Next review: Tomorrow</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg text-center">
                    <div className="font-semibold text-gray-900">8</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-center">
                    <div className="font-semibold text-gray-900">2</div>
                    <div className="text-gray-500">Under Review</div>
                  </div>
                </div>
              </div>

              {/* Dropout Rate */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 rounded-full text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Low Risk
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">5%</div>
                <div className="text-sm text-gray-600 mb-4">Dropout Rate</div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>3 of 60 sites dropped</span>
                  <span className="font-semibold text-emerald-600">95% success</span>
                </div>
                <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* Additional Metrics Row */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Acquisition Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3">
                    <Store className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">127</div>
                  <div className="text-xs text-gray-600">Total Sites</div>
                </div>

                {/* Metric 2 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">57</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>

                {/* Metric 3 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl mb-3">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">18</div>
                  <div className="text-xs text-gray-600">Days Avg.</div>
                </div>

                {/* Metric 4 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl mb-3">
                    <DollarSign className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">$2.4M</div>
                  <div className="text-xs text-gray-600">Invested</div>
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Acquisition Pipeline</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    All Stages
                  </button>
                  <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Active Only
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Stage 1 */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <span className="text-lg font-bold text-blue-900">8</span>
                    </div>
                    <div className="text-xs font-semibold text-blue-900 mb-1">Discovery</div>
                    <div className="text-[10px] text-blue-700">Initial prospecting</div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <span className="text-lg font-bold text-purple-900">12</span>
                    </div>
                    <div className="text-xs font-semibold text-purple-900 mb-1">Evaluation</div>
                    <div className="text-[10px] text-purple-700">Site assessment</div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <span className="text-lg font-bold text-amber-900">20</span>
                    </div>
                    <div className="text-xs font-semibold text-amber-900 mb-1">Negotiation</div>
                    <div className="text-[10px] text-amber-700">Terms discussion</div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">4</span>
                      </div>
                      <span className="text-lg font-bold text-orange-900">10</span>
                    </div>
                    <div className="text-xs font-semibold text-orange-900 mb-1">Approval</div>
                    <div className="text-[10px] text-orange-700">Final review</div>
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="text-white h-4 w-4" />
                      </div>
                      <span className="text-lg font-bold text-green-900">57</span>
                    </div>
                    <div className="text-xs font-semibold text-green-900 mb-1">Completed</div>
                    <div className="text-[10px] text-green-700">Acquisitions done</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">New site added to lease review</p>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Mumbai Central - Downtown location assessment started</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">HR approval completed</p>
                      <span className="text-xs text-gray-500">5h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Bangalore HSR Layout received final HR clearance</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">Team assigned to new evaluation</p>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Delhi NCR site evaluation team deployed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'projects' && (
          <div className="space-y-6">
            {/* Page Title */}
            <h2 className="text-xl font-semibold text-gray-900">Project Status</h2>

            {/* Stats Cards Row */}
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Total Projects */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clipboard className="h-5 w-5 text-orange-600" />
                    <div className="text-3xl font-bold text-orange-600">12</div>
                  </div>
                  <div className="text-sm text-gray-600">Total projects</div>
                </div>

                {/* Deadline Breached */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">5</div>
                  <div className="text-sm text-gray-600">Deadline Breached</div>
                </div>

                {/* Completed Work */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">60%</div>
                  <div className="text-sm text-gray-600">Completed work</div>
                </div>

                {/* Projects Under Risk */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">4</div>
                  <div className="text-sm text-gray-600">Projects under risk</div>
                </div>

                {/* Budget Remaining */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">2.3 Mn</div>
                  <div className="text-sm text-gray-600">Budget Remaining</div>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-end gap-3">
              <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                Search
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto">
              <div className="inline-flex gap-4 pb-4">
                {/* Column 1: Permit Clearance */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Permit Clearance</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">3</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Card 1 */}
                      <div
                        onClick={() => setSelectedProject('NJ-0014')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0014</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">Mumbai</div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-700">DN</span>
                          </div>
                          <button className="p-1 border border-gray-200 rounded hover:bg-gray-50">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div
                        onClick={() => setSelectedProject('NJ-0019')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0019</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">Bangalore</div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-700">V</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>29 Apr 24 → 29 Apr 24</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div
                        onClick={() => setSelectedProject('NJ-0004')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0004</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">HSR Store</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-green-700">DK</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>29 Apr 24 → 12 Jun 24</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">0/2 ›</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Construction & Renovation */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Construction & Renovation</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">1</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedProject('NJ-0009')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0009</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">Warehouse - Mumbai</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-700">A</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>29 Apr 24 → 18 Jun 24</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">0/2 ›</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Merchandise Planning */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Merchandise Planning</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">1</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedProject('NJ-0011')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0011</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">Warehouse - Pune</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-green-700">DK</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>29 Apr 24 → 12 Jun 24</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">0/2 ›</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 4: Signage & Storefront */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Signage & Storefront</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">1</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedProject('NJ-0010')}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">NJ-0010</span>
                          <button className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">Warehouse - Mambai</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-green-700">D</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>29 Apr 24 → 21 Aug 24</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">0/2 ›</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 5: Safety Inspection */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Safety Inspection</h3>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-center py-8 text-sm text-gray-400">
                      No items
                    </div>
                  </div>
                </div>

                {/* Column 6: Inventory Planning */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h3 className="font-semibold text-gray-900 text-sm">Inventory Planning</h3>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-center py-8 text-sm text-gray-400">
                      No items
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto" onClick={() => setSelectedProject(null)}>
                <div className="min-h-screen p-6 flex items-start justify-center">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl my-8" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="border-b border-gray-200 p-8 bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-6">
                          {/* Project Icon */}
                          <div className="w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center border-2 border-orange-500">
                            <Store className="h-12 w-12 text-orange-600" />
                          </div>

                          {/* Project Info */}
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mumbai Store</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Project ID</div>
                                <div className="text-sm font-semibold text-orange-600">NJ-0014</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Start Date</div>
                                <div className="text-sm font-semibold text-gray-900">29-Apr-2024</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">End Date</div>
                                <div className="text-sm font-semibold text-gray-900">29-Apr-2024</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Project Manager</div>
                                <div className="text-sm font-semibold text-gray-900">Dhanasekkhar</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Status</div>
                                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold inline-block">
                                  Permit Clearance
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Close Button */}
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <XCircle className="h-6 w-6 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-8">
                      <div className="flex gap-1">
                        {[
                          { id: 'summary', label: 'Summary' },
                          { id: 'budget', label: 'Budget & Progress' },
                          { id: 'tasks', label: 'Pending Tasks' },
                          { id: 'layout', label: 'Layout & Designs' },
                          { id: 'procurement', label: 'Procurement Status' },
                          { id: 'inventory', label: 'Inventory Status' },
                          { id: 'team', label: 'Core Team' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setProjectDetailTab(tab.id as any)}
                            className={cn(
                              "px-4 py-3 text-sm font-medium transition-colors relative",
                              projectDetailTab === tab.id
                                ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-600"
                                : "text-gray-600 hover:text-gray-900"
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      {projectDetailTab === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Left Column - Main Content */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* Project Card */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                                  {selectedProject}
                                </span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Permit Clearance
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">Mumbai</h3>
                            </div>

                            {/* Add Details Form */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                              <div className="flex items-center gap-2 mb-6">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <h4 className="font-semibold text-gray-900">Add details</h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue="Mumbai"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Acquisition ID
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>
                              </div>

                              {/* File Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Final Lease Deed
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                                  <div className="flex flex-col items-center">
                                    <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm font-medium text-orange-600 mb-1">Upload files</p>
                                    <p className="text-xs text-gray-500">Drag and drop or paste</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                  <div className="p-2 bg-red-100 rounded">
                                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">Sample_image.jpg</div>
                                    <div className="text-xs text-gray-500">579 KB</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Map Section */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                              <div className="p-4 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-900">Final Location</h4>
                              </div>
                              <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                                      <div className="w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                                      <p className="text-sm font-medium text-gray-900 mb-1">Mumbai Location</p>
                                      <p className="text-xs text-gray-500">XJ64+X68, Richmond Town, Bengaluru</p>
                                      <p className="text-xs text-gray-400 mt-2">12.98241519124012, 77.60597849068302</p>
                                      <button className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium">
                                        Open in Google Maps
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Documents Section */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">Documents & files</h4>
                                <div className="flex gap-2">
                                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  </button>
                                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                  </button>
                                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="text-center py-8 text-gray-400">
                                <FileText className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">No documents uploaded yet</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Details Panel */}
                          <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <div className="flex gap-2 mb-4">
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </button>
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                </button>
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </button>
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                </button>
                                <button className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <svg className="h-5 w-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </button>
                              </div>
                              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                Details
                              </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>Permit Clearance</option>
                                <option>Construction</option>
                                <option>Merchandise Planning</option>
                              </select>
                            </div>

                            {/* Assignee */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">D</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Dhanasekkhar</span>
                              </div>
                            </div>

                            {/* Priority */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority <span className="text-red-500">*</span>
                              </label>
                              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-red-600 font-semibold">
                                <option className="text-red-600">Critical</option>
                                <option className="text-amber-600">High</option>
                                <option className="text-blue-600">Medium</option>
                                <option className="text-gray-600">Low</option>
                              </select>
                            </div>

                            {/* Due Date */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Due date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>

                            {/* Requester */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Requester</label>
                              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">V</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Varun</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'budget' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Budget Overview Cards */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-blue-700">Total Budget</h3>
                                <DollarSign className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-3xl font-bold text-blue-900">$500K</div>
                              <div className="text-xs text-blue-600 mt-2">Allocated for this project</div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-orange-700">Spent</h3>
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="text-3xl font-bold text-orange-900">$325K</div>
                              <div className="text-xs text-orange-600 mt-2">65% of total budget</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-green-700">Remaining</h3>
                                <Wallet className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="text-3xl font-bold text-green-900">$175K</div>
                              <div className="text-xs text-green-600 mt-2">35% remaining</div>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                                  <span className="text-sm font-bold text-blue-600">65%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: '65%' }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                                  <span className="text-sm font-bold text-orange-600">65%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600" style={{ width: '65%' }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Timeline Progress</span>
                                  <span className="text-sm font-bold text-purple-600">58%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: '58%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Budget Breakdown */}
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
                            <div className="space-y-3">
                              {[
                                { name: 'Construction & Renovation', allocated: '$200K', spent: '$140K', percentage: 70 },
                                { name: 'Permits & Legal', allocated: '$50K', spent: '$45K', percentage: 90 },
                                { name: 'Equipment & Fixtures', allocated: '$120K', spent: '$70K', percentage: 58 },
                                { name: 'Marketing & Signage', allocated: '$80K', spent: '$50K', percentage: 62 },
                                { name: 'Contingency', allocated: '$50K', spent: '$20K', percentage: 40 },
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {item.spent} of {item.allocated} spent
                                    </div>
                                  </div>
                                  <div className="text-sm font-bold text-gray-900">{item.percentage}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'tasks' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                              + Add Task
                            </button>
                          </div>

                          <div className="space-y-4">
                            {[
                              { title: 'Finalize construction permits', priority: 'Critical', dueDate: '2024-05-15', assignee: 'DN', status: 'In Progress', color: 'red' },
                              { title: 'Review architectural plans', priority: 'High', dueDate: '2024-05-18', assignee: 'V', status: 'Pending', color: 'amber' },
                              { title: 'Order electrical fixtures', priority: 'High', dueDate: '2024-05-20', assignee: 'DK', status: 'Pending', color: 'amber' },
                              { title: 'Schedule safety inspection', priority: 'Medium', dueDate: '2024-05-25', assignee: 'A', status: 'Pending', color: 'blue' },
                              { title: 'Finalize interior design mockups', priority: 'Medium', dueDate: '2024-05-28', assignee: 'DN', status: 'Pending', color: 'blue' },
                              { title: 'Setup utility connections', priority: 'High', dueDate: '2024-06-01', assignee: 'V', status: 'Not Started', color: 'amber' },
                            ].map((task, index) => (
                              <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                                      <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-6 h-6 rounded-full bg-${task.assignee === 'DN' ? 'green' : task.assignee === 'V' ? 'pink' : task.assignee === 'DK' ? 'green' : 'purple'}-100 flex items-center justify-center`}>
                                            <span className={`text-xs font-medium text-${task.assignee === 'DN' ? 'green' : task.assignee === 'V' ? 'pink' : task.assignee === 'DK' ? 'green' : 'purple'}-700`}>
                                              {task.assignee}
                                            </span>
                                          </div>
                                          <span className="text-gray-600">{task.assignee === 'DN' ? 'Dhanasekkhar' : task.assignee === 'V' ? 'Varun' : task.assignee === 'DK' ? 'Dinesh Kumar' : 'Ananya'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                          <Calendar className="h-3 w-3" />
                                          <span>{task.dueDate}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      task.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                                      task.status === 'Pending' ? 'bg-gray-100 text-gray-700' :
                                      'bg-gray-100 text-gray-500'
                                    }`}>
                                      {task.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'layout' && (
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Layout Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-400 transition-colors">
                                <Image className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-600 mb-1">Floor Plan</p>
                                <p className="text-xs text-gray-400">Upload architectural drawings</p>
                              </div>
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-400 transition-colors">
                                <Image className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-600 mb-1">3D Renderings</p>
                                <p className="text-xs text-gray-400">Upload design mockups</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Documents</h3>
                            <div className="space-y-3">
                              {[
                                { name: 'Floor_Plan_Draft_v2.pdf', size: '2.4 MB', date: '2024-04-12', type: 'pdf' },
                                { name: 'Interior_Design_Concept.pdf', size: '3.1 MB', date: '2024-04-18', type: 'pdf' },
                                { name: 'Electrical_Layout.dwg', size: '1.8 MB', date: '2024-04-22', type: 'dwg' },
                                { name: 'Plumbing_Diagram.pdf', size: '1.2 MB', date: '2024-04-25', type: 'pdf' },
                              ].map((doc, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <FileText className="h-6 w-6 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {doc.size} • {doc.date}
                                    </div>
                                  </div>
                                  <button className="p-2 hover:bg-gray-200 rounded-lg">
                                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'procurement' && (
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Procurement Status</h3>
                            <div className="space-y-4">
                              {[
                                { item: 'Display Shelving Units', vendor: 'ABC Fixtures Co.', status: 'Ordered', quantity: '50 units', amount: '$25,000', eta: '2024-05-20' },
                                { item: 'LED Lighting System', vendor: 'Bright Solutions', status: 'In Transit', quantity: '200 pieces', amount: '$15,000', eta: '2024-05-15' },
                                { item: 'Point of Sale Systems', vendor: 'Tech Retail Inc.', status: 'Delivered', quantity: '5 units', amount: '$10,000', eta: '2024-05-01' },
                                { item: 'Security Cameras', vendor: 'SafeView Systems', status: 'Ordered', quantity: '12 units', amount: '$8,000', eta: '2024-05-25' },
                                { item: 'Shopping Carts', vendor: 'Cart Solutions Ltd.', status: 'Quote Requested', quantity: '30 units', amount: '$6,000', eta: 'TBD' },
                              ].map((item, index) => (
                                <div key={index} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-1">{item.item}</h4>
                                      <p className="text-sm text-gray-600">Vendor: {item.vendor}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                      item.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                      item.status === 'Ordered' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Quantity:</span>
                                      <span className="ml-2 font-medium text-gray-900">{item.quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Amount:</span>
                                      <span className="ml-2 font-medium text-gray-900">{item.amount}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">ETA:</span>
                                      <span className="ml-2 font-medium text-gray-900">{item.eta}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'inventory' && (
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Planning</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="text-sm text-purple-700 mb-1">Total SKUs</div>
                                <div className="text-2xl font-bold text-purple-900">450</div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="text-sm text-blue-700 mb-1">Inventory Value</div>
                                <div className="text-2xl font-bold text-blue-900">$250K</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="text-sm text-green-700 mb-1">Stock Ready</div>
                                <div className="text-2xl font-bold text-green-900">75%</div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {[
                                { category: 'Electronics', skus: 120, value: '$80K', status: 'Ready', progress: 90 },
                                { category: 'Apparel', skus: 150, value: '$60K', status: 'In Progress', progress: 70 },
                                { category: 'Home & Living', skus: 100, value: '$50K', status: 'In Progress', progress: 65 },
                                { category: 'Sports & Outdoors', skus: 80, value: '$40K', status: 'Pending', progress: 40 },
                              ].map((cat, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{cat.category}</h4>
                                      <p className="text-sm text-gray-600">{cat.skus} SKUs • {cat.value}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      cat.status === 'Ready' ? 'bg-green-100 text-green-700' :
                                      cat.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {cat.status}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: `${cat.progress}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {projectDetailTab === 'team' && (
                        <div className="space-y-6">
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-semibold text-gray-900">Core Team Members</h3>
                              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                                + Add Member
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { name: 'Dhanasekkhar', role: 'Project Manager', email: 'dhanasekkhar@company.com', avatar: 'DN', color: 'green', phone: '+91 98765 43210' },
                                { name: 'Varun', role: 'Site Supervisor', email: 'varun@company.com', avatar: 'V', color: 'pink', phone: '+91 98765 43211' },
                                { name: 'Dinesh Kumar', role: 'Procurement Lead', email: 'dinesh@company.com', avatar: 'DK', color: 'green', phone: '+91 98765 43212' },
                                { name: 'Ananya', role: 'Design Coordinator', email: 'ananya@company.com', avatar: 'A', color: 'purple', phone: '+91 98765 43213' },
                                { name: 'Raj Patel', role: 'Construction Manager', email: 'raj@company.com', avatar: 'RP', color: 'blue', phone: '+91 98765 43214' },
                                { name: 'Priya Sharma', role: 'Quality Assurance', email: 'priya@company.com', avatar: 'PS', color: 'amber', phone: '+91 98765 43215' },
                              ].map((member, index) => (
                                <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                  <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 bg-${member.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                                      <span className={`text-lg font-bold text-${member.color}-700`}>{member.avatar}</span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                                      <p className="text-sm text-gray-600 mb-3">{member.role}</p>
                                      <div className="space-y-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3 w-3" />
                                          <span>{member.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3 w-3" />
                                          <span>{member.phone}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                                      <MoreVertical className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'project-status' && (
          <div className="space-y-8">
            {/* Hero Header with Gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>

              <div className="relative">
                <h2 className="text-3xl font-bold mb-2">Project Overview</h2>
                <p className="text-purple-100 mb-8">Real-time insights into your project portfolio</p>

                {/* Inline KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold">12</div>
                    </div>
                    <div className="text-sm text-purple-100">Total Projects</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold">5</div>
                    </div>
                    <div className="text-sm text-purple-100">Deadline Breached</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold">60%</div>
                    </div>
                    <div className="text-sm text-purple-100">Completed Work</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold">4</div>
                    </div>
                    <div className="text-sm text-purple-100">Under Risk</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-bold">2.3M</div>
                    </div>
                    <div className="text-sm text-purple-100">Budget Left</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Permit Clearance */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                      <Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Permit Clearance</h3>
                      <p className="text-xs text-gray-500">3 active projects</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0014</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">Mumbai</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">DN</span>
                      </div>
                      <div className="text-xs text-gray-600">Assigned</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0019</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Overdue</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">Bangalore</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">V</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <Clock className="h-3 w-3" />
                        <span>29 Apr → 29 Apr</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0004</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">In Progress</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">HSR Store</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">DK</span>
                        </div>
                        <div className="text-xs text-gray-600">29 Apr → 12 Jun</div>
                      </div>
                      <div className="text-xs text-gray-500">0/2 tasks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction & Renovation */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Construction</h3>
                      <p className="text-xs text-gray-500">1 active project</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0009</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Critical</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">Warehouse - Mumbai</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">A</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>29 Apr → 18 Jun</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">0/2 tasks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchandise Planning */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Merchandise</h3>
                      <p className="text-xs text-gray-500">1 active project</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0011</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Overdue</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">Warehouse - Pune</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">DK</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>29 Apr → 12 Jun</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">0/2 tasks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signage & Storefront */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Signage</h3>
                      <p className="text-xs text-gray-500">1 active project</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">NJ-0010</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Overdue</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">Warehouse - Mambai</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">D</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>29 Apr → 21 Aug</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">0/2 tasks</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Inspection - Empty */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Safety</h3>
                      <p className="text-xs text-gray-500">0 active projects</p>
                    </div>
                  </div>
                </div>

                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No active inspections</p>
                </div>
              </div>

              {/* Inventory Planning - Empty */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Inventory</h3>
                      <p className="text-xs text-gray-500">0 active projects</p>
                    </div>
                  </div>
                </div>

                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No planning required</p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-fuchsia-500"></div>

                {/* Timeline items */}
                <div className="space-y-6">
                  <div className="relative flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Permit Clearance</h4>
                        <span className="text-xs text-gray-500">25% complete</span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">Mumbai, Bangalore, HSR Store</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Construction & Renovation</h4>
                        <span className="text-xs text-gray-500">40% complete</span>
                      </div>
                      <div className="h-2 bg-purple-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">Warehouse - Mumbai</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Merchandise Planning</h4>
                        <span className="text-xs text-gray-500">60% complete</span>
                      </div>
                      <div className="h-2 bg-emerald-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">Warehouse - Pune</p>
                    </div>
                  </div>

                  <div className="relative flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Signage & Storefront</h4>
                        <span className="text-xs text-gray-500">80% complete</span>
                      </div>
                      <div className="h-2 bg-amber-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">Warehouse - Mambai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'rules-engine' && (
          <div className="text-center text-gray-500 py-12">
            Rules Engine content coming soon...
          </div>
        )}
      </div>
    </div>
  )
}
