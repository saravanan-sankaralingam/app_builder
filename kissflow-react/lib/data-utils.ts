import { Employee, EmployeeFilter } from '@/types/employee'

/**
 * Filter employees based on search query and quick filter
 */
export function filterEmployees(
  employees: Employee[],
  searchQuery: string,
  quickFilter: EmployeeFilter = 'all'
): Employee[] {
  let filtered = [...employees]

  // Apply quick filter
  if (quickFilter !== 'all') {
    const statusMap: Record<Exclude<EmployeeFilter, 'all'>, Employee['status']> = {
      active: 'Active',
      remote: 'Remote',
      leave: 'On Leave',
    }
    filtered = filtered.filter(emp => emp.status === statusMap[quickFilter])
  }

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.location.toLowerCase().includes(query) ||
      emp.phone.includes(query)
    )
  }

  return filtered
}

/**
 * Sort employees by column
 */
export function sortEmployees<K extends keyof Employee>(
  employees: Employee[],
  column: K,
  direction: 'asc' | 'desc' = 'asc'
): Employee[] {
  const sorted = [...employees]

  sorted.sort((a, b) => {
    const aVal = a[column]
    const bVal = b[column]

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal)
      return direction === 'asc' ? comparison : -comparison
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  return sorted
}

/**
 * Paginate employees
 */
export function paginateEmployees(
  employees: Employee[],
  page: number,
  pageSize: number = 10
): Employee[] {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return employees.slice(startIndex, endIndex)
}

/**
 * Get total number of pages
 */
export function getTotalPages(totalItems: number, pageSize: number = 10): number {
  return Math.ceil(totalItems / pageSize)
}

/**
 * Group employees by department
 */
export function groupEmployeesByDepartment(employees: Employee[]): Record<Employee['department'], Employee[]> {
  const departments: Employee['department'][] = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']

  return departments.reduce((acc, dept) => {
    acc[dept] = employees.filter(emp => emp.department === dept)
    return acc
  }, {} as Record<Employee['department'], Employee[]>)
}

/**
 * Sort employees by join date (for timeline view)
 */
export function sortEmployeesByJoinDate(employees: Employee[], direction: 'asc' | 'desc' = 'asc'): Employee[] {
  const sorted = [...employees]

  sorted.sort((a, b) => {
    const dateA = new Date(a.joinDate).getTime()
    const dateB = new Date(b.joinDate).getTime()
    return direction === 'asc' ? dateA - dateB : dateB - dateA
  })

  return sorted
}
