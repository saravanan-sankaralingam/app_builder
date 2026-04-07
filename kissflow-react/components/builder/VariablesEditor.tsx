'use client'

import { useState } from 'react'
import { Search, Trash2, Pencil, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Variable {
  id: string
  name: string
  description: string
  dataType: 'text' | 'number' | 'boolean' | 'date' | 'object' | 'array'
  defaultValue: string
}

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
]

const ITEMS_PER_PAGE = 10

export function VariablesEditor() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: '',
    description: '',
    dataType: 'text',
    defaultValue: '',
  })

  const filteredVariables = variables.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredVariables.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedVariables = filteredVariables.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleAddVariable = () => {
    if (!newVariable.name?.trim()) return

    const variable: Variable = {
      id: `var-${Date.now()}`,
      name: newVariable.name.trim(),
      description: newVariable.description?.trim() || '',
      dataType: newVariable.dataType || 'text',
      defaultValue: newVariable.defaultValue?.trim() || '',
    }

    setVariables([...variables, variable])
    setNewVariable({
      name: '',
      description: '',
      dataType: 'text',
      defaultValue: '',
    })
    setIsAddingNew(false)
    // Go to last page to see the new item
    const newTotalPages = Math.ceil((filteredVariables.length + 1) / ITEMS_PER_PAGE)
    setCurrentPage(newTotalPages)
  }

  const handleDeleteVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id))
    // Adjust page if needed
    const newFiltered = variables.filter((v) => v.id !== id).filter(
      (v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const newTotalPages = Math.ceil(newFiltered.length / ITEMS_PER_PAGE)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }
  }

  const handleEditVariable = (variable: Variable) => {
    setEditingId(variable.id)
    setNewVariable({
      name: variable.name,
      description: variable.description,
      dataType: variable.dataType,
      defaultValue: variable.defaultValue,
    })
  }

  const handleSaveEdit = () => {
    if (!editingId || !newVariable.name?.trim()) return

    setVariables(
      variables.map((v) =>
        v.id === editingId
          ? {
              ...v,
              name: newVariable.name!.trim(),
              description: newVariable.description?.trim() || '',
              dataType: newVariable.dataType || 'text',
              defaultValue: newVariable.defaultValue?.trim() || '',
            }
          : v
      )
    )
    setEditingId(null)
    setNewVariable({
      name: '',
      description: '',
      dataType: 'text',
      defaultValue: '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setNewVariable({
      name: '',
      description: '',
      dataType: 'text',
      defaultValue: '',
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (editingId) {
        handleSaveEdit()
      } else if (isAddingNew) {
        handleAddVariable()
      }
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header with search and add button */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm bg-white border-gray-400 placeholder:text-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
          />
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
          size="sm"
          className="h-7 text-xs px-2.5 bg-gray-900 hover:bg-gray-800"
        >
          + Variable
        </Button>
      </div>

      {/* Table Container with padding */}
      <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col min-h-0">
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-0">
            {/* Fixed Header */}
            <div className="bg-gray-50 flex-shrink-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-200">
                      Variable Name
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-200">
                      Description
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-200 w-28">
                      Data Type
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 border-b border-gray-200 w-40">
                      Default Value
                    </th>
                    <th className="w-20 px-4 py-3 border-b border-gray-200" />
                  </tr>
                </thead>
              </table>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-auto min-h-0 flex flex-col">
              <table className="w-full border-collapse">
                <tbody>
                {/* Add new row */}
                {isAddingNew && (
                  <tr className="bg-blue-50/50">
                    <td className="px-4 py-2.5 border-b border-gray-200">
                      <Input
                        type="text"
                        placeholder="Variable name"
                        value={newVariable.name || ''}
                        onChange={(e) =>
                          setNewVariable({ ...newVariable, name: e.target.value })
                        }
                        onKeyDown={handleKeyDown}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-200">
                      <Input
                        type="text"
                        placeholder="Description"
                        value={newVariable.description || ''}
                        onChange={(e) =>
                          setNewVariable({ ...newVariable, description: e.target.value })
                        }
                        onKeyDown={handleKeyDown}
                        className="h-7 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-200">
                      <select
                        value={newVariable.dataType || 'text'}
                        onChange={(e) =>
                          setNewVariable({
                            ...newVariable,
                            dataType: e.target.value as Variable['dataType'],
                          })
                        }
                        className="h-7 w-full text-sm border border-gray-200 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      >
                        {DATA_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-200">
                      <Input
                        type="text"
                        placeholder="Default value"
                        value={newVariable.defaultValue || ''}
                        onChange={(e) =>
                          setNewVariable({ ...newVariable, defaultValue: e.target.value })
                        }
                        onKeyDown={handleKeyDown}
                        className="h-7 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={handleAddVariable}
                          className="h-6 text-xs px-2"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-6 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Existing variables */}
                {paginatedVariables.map((variable) => (
                  <tr
                    key={variable.id}
                    className={cn(
                      'group hover:bg-gray-50 transition-colors',
                      editingId === variable.id && 'bg-blue-50/50'
                    )}
                  >
                    {editingId === variable.id ? (
                      <>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <Input
                            type="text"
                            value={newVariable.name || ''}
                            onChange={(e) =>
                              setNewVariable({ ...newVariable, name: e.target.value })
                            }
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm"
                            autoFocus
                          />
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <Input
                            type="text"
                            value={newVariable.description || ''}
                            onChange={(e) =>
                              setNewVariable({ ...newVariable, description: e.target.value })
                            }
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <select
                            value={newVariable.dataType || 'text'}
                            onChange={(e) =>
                              setNewVariable({
                                ...newVariable,
                                dataType: e.target.value as Variable['dataType'],
                              })
                            }
                            className="h-7 w-full text-sm border border-gray-200 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
                          >
                            {DATA_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <Input
                            type="text"
                            value={newVariable.defaultValue || ''}
                            onChange={(e) =>
                              setNewVariable({ ...newVariable, defaultValue: e.target.value })
                            }
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-6 text-xs px-2"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-6 text-xs px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-900">
                            {variable.name}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <span className="text-sm text-gray-600">
                            {variable.description || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {DATA_TYPES.find((t) => t.value === variable.dataType)?.label ||
                              variable.dataType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <span className="text-sm text-gray-600 font-mono">
                            {variable.defaultValue || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 border-b border-gray-200">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditVariable(variable)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariable(variable.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

              </tbody>
              </table>
              {/* Empty state - centered */}
              {!isAddingNew && paginatedVariables.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                  {searchQuery ? (
                    <p className="text-sm text-gray-500">No variables match your search.</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">No variables yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click &quot;Add Variable&quot; to create your first variable.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredVariables.length)} of {filteredVariables.length} variables
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
