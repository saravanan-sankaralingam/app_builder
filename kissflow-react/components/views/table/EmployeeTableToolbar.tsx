'use client'

import { Search, Upload, Download, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmployeeFilter } from '@/types/employee'
import { cn } from '@/lib/utils'

interface EmployeeTableToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  quickFilter: EmployeeFilter
  onQuickFilterChange: (filter: EmployeeFilter) => void
  totalCount: number
  filteredCount: number
}

export function EmployeeTableToolbar({
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  totalCount,
  filteredCount,
}: EmployeeTableToolbarProps) {
  const filterOptions: { value: EmployeeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'remote', label: 'Remote' },
    { value: 'leave', label: 'On Leave' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Employee Directory
          </h2>
          <span className="text-sm text-gray-500">
            {filteredCount} {filteredCount === 1 ? 'employee' : 'employees'}
            {filteredCount !== totalCount && ` (filtered from ${totalCount})`}
          </span>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={quickFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQuickFilterChange(option.value)}
              className={cn(
                'rounded-full',
                quickFilter === option.value
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search employees by name, email, department..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-400 placeholder:text-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="default" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="default" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="default" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>
    </div>
  )
}
