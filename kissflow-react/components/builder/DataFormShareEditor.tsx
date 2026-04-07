'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Info } from 'lucide-react'

type AccessLevel = 'read-only' | 'edit' | 'manage'

interface RoleAccess {
  id: string
  roleName: string
  accessLevel: AccessLevel
}

interface DataFormShareEditorProps {
  dataFormName: string
}

export function DataFormShareEditor({ dataFormName }: DataFormShareEditorProps) {
  const [roles, setRoles] = useState<RoleAccess[]>([
    { id: '1', roleName: 'Admin', accessLevel: 'read-only' },
    { id: '2', roleName: 'Users', accessLevel: 'read-only' },
  ])

  const handleAccessChange = (roleId: string, accessLevel: AccessLevel) => {
    setRoles(prev =>
      prev.map(role =>
        role.id === roleId ? { ...role, accessLevel } : role
      )
    )
  }

  const handleDeleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId))
  }

  return (
    <div className="h-full w-full bg-white p-6 flex flex-col items-center">
      <div className="w-[880px] flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-900">
            Share this dataform with different roles in your application and assign them unique access permission
          </p>
          <Button
            size="sm"
            className="h-7 text-xs px-2.5 bg-gray-900 hover:bg-gray-800 cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Assign roles
          </Button>
        </div>

        {/* Permissions Table */}
        <div className="border border-gray-300 rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100">
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-700 px-4 py-3 w-[200px]">
                    Role name
                  </th>
                  <th className="text-center text-xs font-medium text-gray-700 px-2 py-3 w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      Read-only
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="text-center text-xs font-medium text-gray-700 px-2 py-3 w-[56px]">
                    <div className="flex items-center justify-center gap-1">
                      Edit
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="text-center text-xs font-medium text-gray-700 px-2 py-3 w-[72px]">
                    <div className="flex items-center justify-center gap-1">
                      Manage
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="w-[48px]"></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{role.roleName}</span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="radio"
                        name={`access-${role.id}`}
                        checked={role.accessLevel === 'read-only'}
                        onChange={() => handleAccessChange(role.id, 'read-only')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="radio"
                        name={`access-${role.id}`}
                        checked={role.accessLevel === 'edit'}
                        onChange={() => handleAccessChange(role.id, 'edit')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="radio"
                        name={`access-${role.id}`}
                        checked={role.accessLevel === 'manage'}
                        onChange={() => handleAccessChange(role.id, 'manage')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
