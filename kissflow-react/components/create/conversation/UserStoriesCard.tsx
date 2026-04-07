'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Edit2, RefreshCw, X } from 'lucide-react'
import { UserStoriesData, UserStory } from './types'

interface UserStoriesCardProps {
  data: UserStoriesData[]
  onApprove?: (roleId: string) => void
  onEdit?: (storyId: string, newText: string) => void
}

export function UserStoriesCard({ data, onApprove, onEdit }: UserStoriesCardProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(data.map(d => d.roleId)))
  const [editingStory, setEditingStory] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [approvedRoles, setApprovedRoles] = useState<Set<string>>(new Set())

  const toggleRole = (roleId: string) => {
    setExpandedRoles(prev => {
      const next = new Set(prev)
      if (next.has(roleId)) {
        next.delete(roleId)
      } else {
        next.add(roleId)
      }
      return next
    })
  }

  const startEditing = (story: UserStory) => {
    setEditingStory(story.id)
    setEditText(story.story)
  }

  const cancelEditing = () => {
    setEditingStory(null)
    setEditText('')
  }

  const saveEdit = (storyId: string) => {
    if (editText.trim()) {
      onEdit?.(storyId, editText.trim())
    }
    cancelEditing()
  }

  const handleApprove = (roleId: string) => {
    setApprovedRoles(prev => new Set(prev).add(roleId))
    onApprove?.(roleId)
  }

  return (
    <div className="mt-3 space-y-3 max-w-lg">
      {data.map(roleData => {
        const isExpanded = expandedRoles.has(roleData.roleId)
        const isApproved = approvedRoles.has(roleData.roleId)

        return (
          <div
            key={roleData.roleId}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Role Header */}
            <button
              onClick={() => toggleRole(roleData.roleId)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{roleData.roleName} Stories</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                  {roleData.stories.length}
                </span>
                {isApproved && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                    <Check className="h-3 w-3" />
                    Approved
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {/* Stories List */}
            {isExpanded && (
              <div className="p-3 space-y-2">
                {roleData.stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    {editingStory === story.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(story.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-purple-500 mt-0.5">
                          {index + 1}.
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{story.story}</p>
                        {!isApproved && (
                          <button
                            onClick={() => startEditing(story)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                            title="Edit story"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Actions */}
                {!isApproved && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-3">
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleApprove(roleData.roleId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve Stories
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
