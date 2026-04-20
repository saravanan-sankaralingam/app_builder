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
  const [expandedCategory, setExpandedCategory] = useState<ArtifactCategory | null>(null)
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

  // Get artifacts for a category (with search filter)
  const getArtifactsForCategory = (categoryId: string) => {
    return artifacts.filter(a => {
      if (a.category !== categoryId) return false
      if (!currentQuery) return true
      return a.name.toLowerCase().includes(currentQuery.toLowerCase())
    })
  }

  // Toggle category expansion (accordion behavior)
  const toggleCategory = (categoryId: ArtifactCategory) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
    }
  }

  // Auto-expand categories that have matching artifacts when user types
  useEffect(() => {
    if (currentQuery) {
      // Find first category with matching artifacts
      const categoryWithMatches = ARTIFACT_CATEGORIES.find(cat => getCategoryCount(cat.id) > 0)
      if (categoryWithMatches) {
        setExpandedCategory(categoryWithMatches.id)
      } else {
        setExpandedCategory(null)
      }
    } else {
      setExpandedCategory(null)
    }
    setSelectedIndex(0)
  }, [currentQuery])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (expandedCategory) {
          setExpandedCategory(null)
        } else {
          onClose()
        }
      }
      // Note: Arrow key navigation can be added later if needed
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, expandedCategory, onSelect, onClose])

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
          const isExpanded = expandedCategory === category.id
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
                <div className="bg-gray-50/50 max-h-56 overflow-y-auto">
                  {categoryArtifacts.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-gray-500">
                      No artifacts found
                    </div>
                  ) : (
                    categoryArtifacts.map((artifact) => (
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
                    ))
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
