import { useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { filterEmployees, paginateEmployees, getTotalPages } from '@/lib/data-utils'

/**
 * Custom hook to get filtered and paginated employee data
 */
export function useEmployeeData() {
  const { state } = useAppContext()
  const { employees, searchQuery, quickFilter, currentPage, itemsPerPage } = state

  // Filter employees based on search and quick filter
  const filteredEmployees = useMemo(() => {
    return filterEmployees(employees, searchQuery, quickFilter)
  }, [employees, searchQuery, quickFilter])

  // Paginate the filtered results
  const paginatedEmployees = useMemo(() => {
    return paginateEmployees(filteredEmployees, currentPage, itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = useMemo(() => {
    return getTotalPages(filteredEmployees.length, itemsPerPage)
  }, [filteredEmployees.length, itemsPerPage])

  return {
    allEmployees: employees,
    filteredEmployees,
    paginatedEmployees,
    totalEmployees: employees.length,
    filteredCount: filteredEmployees.length,
    currentPage,
    itemsPerPage,
    totalPages,
  }
}
