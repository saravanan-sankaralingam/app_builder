'use client'

import { useEffect, useState, useRef } from 'react'
import { Database, FileText, LayoutGrid, BarChart3, Box, Menu, ChevronRight, ChevronDown, UserKey, GitBranch, Table } from 'lucide-react'
import type { Artifact, ArtifactCategory } from './artifactTypes'
import { ARTIFACT_CATEGORIES } from './artifactTypes'

interface SlashCommandMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onSelect: (artifact: Artifact) => void
  onClose: () => void
  currentQuery: string
  artifacts: Artifact[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  FileText,
  LayoutGrid,
  BarChart3,
  Box,
  Menu,
  UserKey,
  GitBranch,
  Table
}

export function SlashCommandMenu({
  isOpen,
  position,
  onSelect,
  onClose,
  currentQuery,
  artifacts
}: SlashCommandMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ArtifactCategory>>(new Set())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Calculate filtered counts for categories when user is typing
  const getCategoryCount = (categoryId: string) => {
    if (!currentQuery) {
      return artifacts.filter(a => a.category === categoryId).length
    }
    return artifacts.filter(a =>
      a.category === categoryId &&
      a.name.toLowerCase().includes(currentQuery.toLowerCase())
    ).length
  }

  // Group artifacts by parent entity (for hierarchical categories like views/reports)
  const groupArtifactsByParent = (artifacts: Artifact[]) => {
    return artifacts.reduce((acc, artifact) => {
      if (artifact.parentId) {
        if (!acc[artifact.parentId]) {
          acc[artifact.parentId] = {
            parentId: artifact.parentId,
            parentName: artifact.parentName!,
            parentType: artifact.parentType!,
            items: []
          }
        }
        acc[artifact.parentId].items.push(artifact)
      } else {
        // Non-hierarchical artifacts (shouldn't happen for views/reports, but handle gracefully)
        if (!acc['__root__']) {
          acc['__root__'] = { items: [] }
        }
        acc['__root__'].items.push(artifact)
      }
      return acc
    }, {} as Record<string, { parentId?: string; parentName?: string; parentType?: 'dataform' | 'board' | 'process'; items: Artifact[] }>)
  }

  // Get parent groups for a specific category
  const getParentGroupsForCategory = (categoryId: string) => {
    const categoryArtifacts = artifacts.filter(a => a.category === categoryId)
    return groupArtifactsByParent(categoryArtifacts)
  }

  // Get total matching artifacts across all categories
  const getTotalMatchingArtifacts = () => {
    if (!currentQuery) return 0

    return artifacts.filter(a =>
      a.name.toLowerCase().includes(currentQuery.toLowerCase())
    ).length
  }

  // Get artifacts for a category (with search filter)
  const getArtifactsForCategory = (categoryId: string) => {
    return artifacts.filter(a => {
      if (a.category !== categoryId) return false
      if (!currentQuery) return true
      return a.name.toLowerCase().includes(currentQuery.toLowerCase())
    })
  }

  // Toggle category expansion (only one category can be expanded at a time)
  const toggleCategory = (categoryId: ArtifactCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        // Collapse if already expanded
        newSet.delete(categoryId)
      } else {
        // Clear all other categories and expand this one
        newSet.clear()
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Auto-expand categories based on total matching artifacts
  useEffect(() => {
    if (currentQuery) {
      const totalMatches = getTotalMatchingArtifacts()

      if (totalMatches <= 10 && totalMatches > 0) {
        // Auto-expand ALL categories with matches
        const categoriesToExpand = new Set<ArtifactCategory>()

        ARTIFACT_CATEGORIES.forEach(cat => {
          const categoryArtifacts = getArtifactsForCategory(cat.id)
          if (categoryArtifacts.length > 0) {
            categoriesToExpand.add(cat.id)
          }
        })

        setExpandedCategories(categoriesToExpand)
      } else {
        // Keep all collapsed (user clicks to expand)
        setExpandedCategories(new Set())
      }
    } else {
      setExpandedCategories(new Set())
    }

    setSelectedIndex(0)
  }, [currentQuery])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (expandedCategories.size > 0) {
          setExpandedCategories(new Set())
        } else {
          onClose()
        }
      }
      // Note: Arrow key navigation can be added later if needed
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, expandedCategories, onSelect, onClose])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
      style={{
        bottom: `calc(100vh - ${position.y}px + 8px)`,
        left: position.x
      }}
    >
      {/* Accordion Categories */}
      <div>
        <div className="px-3 py-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wide">
          Categories
        </div>
        {ARTIFACT_CATEGORIES.map((category) => {
          const CategoryIcon = ICON_MAP[category.icon]
          const artifactCount = getCategoryCount(category.id)
          const isExpanded = expandedCategories.has(category.id)
          const categoryArtifacts = getArtifactsForCategory(category.id)

          // Get color for category icon based on category type
          const getCategoryIconColor = (categoryId: string) => {
            const colorMap: Record<string, string> = {
              'role': 'text-purple-600',
              'dataform': 'text-green-600',
              'board': 'text-orange-600',
              'process': 'text-blue-600',
              'view': 'text-teal-600',
              'report': 'text-pink-600',
              'page': 'text-sky-600',
              'navigation': 'text-indigo-600'
            }
            return colorMap[categoryId] || 'text-gray-600'
          }

          // Hide category if no artifacts match the filter
          if (currentQuery && artifactCount === 0) {
            return null
          }

          return (
            <div key={category.id}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-[11px] text-gray-500">({artifactCount})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Expanded Artifacts */}
              {isExpanded && (
                <div className="bg-gray-50/50">
                  {categoryArtifacts.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-gray-500">
                      No artifacts found
                    </div>
                  ) : (
                    // Hierarchical categories (view, report) - show 3 levels
                    category.id === 'view' || category.id === 'report' ? (
                      (() => {
                        const parentGroups = groupArtifactsByParent(categoryArtifacts)

                        // Sort parent groups by type: dataform, board, process
                        const sortedParentEntries = Object.entries(parentGroups).sort(([, groupA], [, groupB]) => {
                          const typeOrder = { 'dataform': 1, 'board': 2, 'process': 3 }
                          const orderA = groupA.parentType ? typeOrder[groupA.parentType] : 999
                          const orderB = groupB.parentType ? typeOrder[groupB.parentType] : 999
                          return orderA - orderB
                        })

                        return (
                          <div className="max-h-72 overflow-y-auto">
                            {sortedParentEntries.map(([parentId, group]) => {
                              // Skip __root__ group (shouldn't happen for views/reports)
                              if (parentId === '__root__') return null

                              // Get icon for parent entity type
                              const getParentEntityIcon = (parentType: 'dataform' | 'board' | 'process') => {
                                const iconMap = {
                                  'dataform': 'Database',
                                  'board': 'LayoutGrid',
                                  'process': 'GitBranch'
                                }
                                return ICON_MAP[iconMap[parentType]]
                              }

                              const ParentEntityIcon = group.parentType ? getParentEntityIcon(group.parentType) : null

                              return (
                                <div key={parentId}>
                                  {/* Level 2: Parent Entity Header (always visible, not clickable) */}
                                  <div className="w-full flex items-center px-3 py-2 pl-4 text-xs text-gray-700">
                                    <div className="flex items-center gap-1.5">
                                      {/* Parent entity type icon in gray */}
                                      {ParentEntityIcon && (
                                        <ParentEntityIcon className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                      )}
                                      <span className="font-normal">{group.parentName}</span>
                                      <span className="text-[11px] text-gray-500">({group.items.length})</span>
                                    </div>
                                  </div>

                                  {/* Level 3: Actual Items (always shown) */}
                                  <div>
                                    {group.items.map((artifact) => (
                                      <button
                                        key={artifact.id}
                                        onClick={() => onSelect(artifact)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 pl-8 text-xs transition-colors text-gray-700 hover:bg-purple-50"
                                      >
                                        {/* Category icon with color */}
                                        {CategoryIcon && (
                                          <CategoryIcon className={`w-3 h-3 flex-shrink-0 ${getCategoryIconColor(category.id)}`} />
                                        )}
                                        <div className="flex-1 text-left">
                                          <span>{artifact.name}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()
                    ) : (
                      // Non-hierarchical categories - show 2 levels (existing logic)
                      <div className="max-h-56 overflow-y-auto">
                        {categoryArtifacts.map((artifact) => (
                          <button
                            key={artifact.id}
                            onClick={() => onSelect(artifact)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 pl-6 text-xs transition-colors text-gray-700 hover:bg-purple-50"
                          >
                            {/* Category icon with color */}
                            {CategoryIcon && (
                              <CategoryIcon className={`w-3 h-3 flex-shrink-0 ${getCategoryIconColor(category.id)}`} />
                            )}
                            <div className="flex-1 text-left">
                              <span>{artifact.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
