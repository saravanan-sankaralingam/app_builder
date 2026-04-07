'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Employee } from '@/types/employee'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

const departmentColors: Record<Employee['department'], string> = {
  Engineering: 'bg-blue-100 text-blue-700 border-blue-200',
  Marketing: 'bg-purple-100 text-purple-700 border-purple-200',
  Sales: 'bg-green-100 text-green-700 border-green-200',
  HR: 'bg-pink-100 text-pink-700 border-pink-200',
  Finance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Operations: 'bg-orange-100 text-orange-700 border-orange-200',
}

const statusColors: Record<Employee['status'], string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Remote: 'bg-blue-100 text-blue-700 border-blue-200',
  'On Leave': 'bg-gray-100 text-gray-700 border-gray-200',
}

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('name')}</div>
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue('email')}</div>
    },
  },
  {
    accessorKey: 'department',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const department = row.getValue('department') as Employee['department']
      return (
        <Badge
          variant="outline"
          className={`${departmentColors[department]} font-medium`}
        >
          {department}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue('phone')}</div>
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'joinDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Join Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue('joinDate'))}</div>
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = new Date(rowA.getValue(columnId) as string).getTime()
      const dateB = new Date(rowB.getValue(columnId) as string).getTime()
      return dateA - dateB
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as Employee['status']
      return (
        <Badge
          variant="outline"
          className={`${statusColors[status]} font-medium`}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const employee = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:text-blue-600"
            title="View employee"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:text-yellow-600"
            title="Edit employee"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-600 hover:text-red-600"
            title="Delete employee"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
