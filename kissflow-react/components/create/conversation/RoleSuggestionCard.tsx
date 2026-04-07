'use client'

import { useState } from 'react'
import { Check, Plus, X, Sparkles } from 'lucide-react'
import { RoleSuggestionData, Role } from './types'

interface RoleSuggestionCardProps {
  data: RoleSuggestionData
  onConfirm?: (roles: Role[]) => void
}

export function RoleSuggestionCard({ data, onConfirm }: RoleSuggestionCardProps) {
  const [roles, setRoles] = useState<Role[]>(data.roles)
  const [isAddingRole, setIsAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const toggleRole = (roleId: string) => {
    if (isConfirmed) return
    setRoles(prev =>
      prev.map(role =>
        role.id === roleId ? { ...role, isSelected: !role.isSelected } : role
      )
    )
  }

  const addRole = () => {
    if (!newRoleName.trim()) return

    const newRole: Role = {
      id: `custom-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || 'Custom role',
      isUserDefined: true,
      isSelected: true,
    }

    setRoles(prev => [...prev, newRole])
    setNewRoleName('')
    setNewRoleDescription('')
    setIsAddingRole(false)
  }

  const removeRole = (roleId: string) => {
    if (isConfirmed) return
    setRoles(prev => prev.filter(role => role.id !== roleId))
  }

  const handleConfirm = () => {
    const selectedRoles = roles.filter(role => role.isSelected)
    if (selectedRoles.length === 0) return
    setIsConfirmed(true)
    onConfirm?.(selectedRoles)
  }

  const selectedCount = roles.filter(role => role.isSelected).length

  return (
    <div className="mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
      {/* App Name & Description Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-semibold text-gray-900">{data.appName}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-medium">
            <Sparkles className="h-2.5 w-2.5" />
            Suggested
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{data.appDescription}</p>
      </div>

      {/* Roles Section Header */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Roles</h3>
      </div>

      {/* Roles List */}
      <div className="p-2">
        {roles.map(role => (
          <div
            key={role.id}
            onClick={() => toggleRole(role.id)}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150
              ${isConfirmed ? 'cursor-default' : 'hover:bg-gray-50'}
              ${role.isSelected ? 'bg-purple-50/50' : ''}
            `}
          >
            {/* Checkbox */}
            <div
              className={`
                w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                ${role.isSelected
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'border-2 border-gray-300'
                }
              `}
            >
              {role.isSelected && <Check className="h-3 w-3 text-white" />}
            </div>

            {/* Role Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                {!role.isUserDefined && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-medium">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI Suggested
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
            </div>

            {/* Remove Button (only for custom roles) */}
            {role.isUserDefined && !isConfirmed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeRole(role.id)
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        ))}

        {/* Add Role Form */}
        {isAddingRole && !isConfirmed ? (
          <div className="p-3 border border-dashed border-gray-300 rounded-lg mt-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role name"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2"
              autoFocus
            />
            <input
              type="text"
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Role description (optional)"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={addRole}
                disabled={!newRoleName.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingRole(false)
                  setNewRoleName('')
                  setNewRoleDescription('')
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : !isConfirmed ? (
          <button
            onClick={() => setIsAddingRole(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mt-1"
          >
            <Plus className="h-4 w-4" />
            Add Custom Role
          </button>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        {isConfirmed ? (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            {selectedCount} roles confirmed
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="w-full py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: selectedCount > 0
                ? 'linear-gradient(135deg, #EC4899, #A855F7)'
                : '#E5E7EB',
            }}
          >
            Confirm {selectedCount} Role{selectedCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  )
}
