'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Trash2, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/lib/config'

interface ListItem {
  id: string
  label: string
  value: string
}

interface ListEditorProps {
  entityId: string
  entityName: string
}

// Generate a slug from a label
function generateSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '')
}

// Total rows to display (250 by default)
const TOTAL_ROWS = 250

export function ListEditor({ entityId }: ListEditorProps) {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load list items on mount
  useEffect(() => {
    const fetchListItems = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/data-layers/${entityId}`)
        if (response.ok) {
          const result = await response.json()
          const listItems = result.data?.config?.items || []
          setItems(listItems)
        }
      } catch (error) {
        console.error('Failed to fetch list items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListItems()
  }, [entityId])

  // Focus edit input when editing
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingIndex])

  // Save items to the data layer config
  const saveItems = async (newItems: ListItem[]) => {
    setIsSaving(true)
    try {
      await fetch(`${API_BASE_URL}/api/data-layers/${entityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: { items: newItems },
        }),
      })
    } catch (error) {
      console.error('Failed to save list items:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    saveItems(newItems)
  }

  const handleStartEdit = (index: number) => {
    const item = items[index]
    setEditingIndex(index)
    setEditValue(item?.label || '')
  }

  const handleSaveEdit = () => {
    if (editingIndex === null) return

    const trimmedValue = editValue.trim()

    // If empty and it's an existing item, just cancel edit
    if (!trimmedValue) {
      setEditingIndex(null)
      setEditValue('')
      return
    }

    // Check if this is a new item (index >= items.length) or existing
    if (editingIndex >= items.length) {
      // Adding new item
      const newItem: ListItem = {
        id: `item-${Date.now()}`,
        label: trimmedValue,
        value: generateSlug(trimmedValue),
      }
      const newItems = [...items, newItem]
      setItems(newItems)
      saveItems(newItems)
    } else {
      // Editing existing item
      const newItems = items.map((item, i) =>
        i === editingIndex
          ? { ...item, label: trimmedValue, value: generateSlug(trimmedValue) }
          : item
      )
      setItems(newItems)
      saveItems(newItems)
    }

    setEditingIndex(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditValue('')
    }
  }

  const handleSort = () => {
    if (items.length === 0) return

    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)

    const sortedItems = [...items].sort((a, b) => {
      if (newOrder === 'asc') {
        return a.label.localeCompare(b.label)
      } else {
        return b.label.localeCompare(a.label)
      }
    })

    setItems(sortedItems)
    saveItems(sortedItems)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // Generate array of row indices (0 to TOTAL_ROWS - 1)
  const rows = Array.from({ length: TOTAL_ROWS }, (_, i) => i)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
      {/* Datasheet with padding around */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full flex flex-col border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Fixed Header */}
          <div className="flex-shrink-0 border-b border-gray-300">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="w-12 bg-gray-100 border-r border-gray-200 px-3 py-2 text-left">
                    <span className="text-xs font-medium text-gray-500">#</span>
                  </th>
                  <th className="w-[480px] bg-gray-100 border-r border-gray-300 px-3 py-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">List of Items</span>
                      <button
                        onClick={handleSort}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
                      >
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>
                  </th>
                  <th className="bg-gray-100" />
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse table-fixed">
              <tbody>
                {rows.map((rowIndex) => {
                  const item = items[rowIndex]
                  const isEditing = editingIndex === rowIndex
                  const hasItem = !!item

                  return (
                    <tr
                      key={rowIndex}
                      className={cn(
                        'group transition-colors',
                        isEditing && 'bg-blue-50/50',
                        hasItem && !isEditing && 'hover:bg-blue-50/30'
                      )}
                    >
                      <td className="w-12 bg-gray-50 border-b border-r border-gray-200 px-3 py-1.5">
                        <span className="text-xs text-gray-400 font-mono">{rowIndex + 1}</span>
                      </td>
                      <td className="w-[480px] border-b border-r border-gray-300 px-3 py-1.5 bg-white">
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none focus:ring-0 p-0"
                          />
                        ) : hasItem ? (
                          <div className="flex items-center justify-between">
                            <span
                              className="flex-1 text-sm text-gray-700 cursor-text"
                              onClick={() => handleStartEdit(rowIndex)}
                            >
                              {item.label}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(rowIndex)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                              title="Delete item"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="block w-full text-sm text-gray-300 cursor-text"
                            onClick={() => handleStartEdit(rowIndex)}
                          >
                            &nbsp;
                          </span>
                        )}
                      </td>
                      <td className="bg-gray-50" />
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer with row count */}
          <div className="flex-shrink-0 border-t border-gray-300 bg-gray-50 px-4 py-2">
            <span className="text-xs text-gray-500">
              {items.length} of {TOTAL_ROWS} rows filled
            </span>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="absolute bottom-8 right-8 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-sm text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
