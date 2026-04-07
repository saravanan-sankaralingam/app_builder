import { Employee } from '@/types/employee'

const firstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa',
  'James', 'Jennifer', 'William', 'Mary', 'Richard', 'Patricia', 'Thomas', 'Linda',
  'Charles', 'Barbara', 'Daniel', 'Elizabeth', 'Matthew', 'Susan', 'Anthony', 'Jessica',
  'Mark', 'Karen', 'Donald', 'Nancy', 'Steven', 'Betty', 'Paul', 'Helen',
  'Andrew', 'Sandra', 'Joshua', 'Donna', 'Kenneth', 'Carol', 'Kevin', 'Ruth',
  'Brian', 'Sharon', 'George', 'Michelle', 'Timothy', 'Laura', 'Ronald', 'Sarah'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
  'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
  'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson',
  'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Phillips'
]

const departments: Employee['department'][] = [
  'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'
]

const roles = [
  'Manager', 'Senior Manager', 'Lead', 'Senior Lead', 'Specialist',
  'Senior Specialist', 'Coordinator', 'Senior Coordinator', 'Analyst',
  'Senior Analyst', 'Developer', 'Senior Developer', 'Designer', 'Senior Designer'
]

const locations = [
  'New York', 'San Francisco', 'London', 'Singapore', 'Toronto',
  'Mumbai', 'Berlin', 'Sydney', 'Tokyo', 'Paris'
]

const statuses: Employee['status'][] = ['Active', 'On Leave', 'Remote']

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100
  const prefix = Math.floor(Math.random() * 900) + 100
  const lineNumber = Math.floor(Math.random() * 9000) + 1000
  return `+1 (${areaCode}) ${prefix}-${lineNumber}`
}

export function generateMockEmployees(count: number = 45): Employee[] {
  const employees: Employee[] = []
  const usedEmails = new Set<string>()

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const name = `${firstName} ${lastName}`

    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`
    let counter = 1
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@company.com`
      counter++
    }
    usedEmails.add(email)

    const department = getRandomElement(departments)
    const role = getRandomElement(roles)
    const phone = generatePhoneNumber()
    const location = getRandomElement(locations)
    const joinDate = generateRandomDate(2018, 2024)
    const status = getRandomElement(statuses)

    employees.push({
      id: i + 1,
      name,
      email,
      department,
      role,
      phone,
      location,
      joinDate,
      status
    })
  }

  return employees
}

// Export a default set of employees
export const mockEmployees = generateMockEmployees(45)
