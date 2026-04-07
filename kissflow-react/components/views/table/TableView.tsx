'use client'

import { useState, useMemo } from 'react'
import { EmployeeTable } from './EmployeeTable'
import { EmployeeTableToolbar } from './EmployeeTableToolbar'
import { employeeColumns } from './EmployeeTableColumns'
import { useEmployeeData } from '@/hooks/useEmployeeData'
import { useFilters } from '@/hooks/useFilters'
import { filterEmployees } from '@/lib/data-utils'

export function TableView() {
  const { allEmployees } = useEmployeeData()
  const { searchQuery, setSearchQuery, quickFilter, setQuickFilter } = useFilters()

  // Filter employees based on search and quick filter
  const filteredData = useMemo(() => {
    return filterEmployees(allEmployees, searchQuery, quickFilter)
  }, [allEmployees, searchQuery, quickFilter])

  return (
    <div className="p-6 space-y-6">
      <EmployeeTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        totalCount={allEmployees.length}
        filteredCount={filteredData.length}
      />
      <EmployeeTable
        columns={employeeColumns}
        data={filteredData}
        globalFilter={searchQuery}
        onGlobalFilterChange={setSearchQuery}
      />
    </div>
  )
}
