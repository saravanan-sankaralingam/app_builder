export interface Employee {
  id: number
  name: string
  email: string
  department: 'Engineering' | 'Marketing' | 'Sales' | 'HR' | 'Finance' | 'Operations'
  role: string
  phone: string
  location: string
  joinDate: string // ISO date
  status: 'Active' | 'On Leave' | 'Remote'
}

export type EmployeeFilter = 'all' | 'active' | 'remote' | 'leave'
