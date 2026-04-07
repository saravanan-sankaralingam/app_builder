'use client'

import { useState } from 'react'
import { Search, Inbox, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ComponentCreateDialog } from './ComponentCreateDialog'
import { ComponentCard, ComponentData } from './ComponentCard'
import { createComponent } from '@/lib/api/components'

type ComponentFilter = 'all' | 'page' | 'form'

const filterLabels: Record<ComponentFilter, string> = {
  all: 'All',
  page: 'Page',
  form: 'Form',
}

interface ComponentsEditorProps {
  appId: string
  components: ComponentData[]
  isLoading?: boolean
  onComponentClick?: (component: ComponentData, isNewlyCreated?: boolean) => void
  onAddComponent?: (component: ComponentData) => void
  onDuplicateComponent?: (component: ComponentData) => void
}

export function ComponentsEditor({
  appId,
  components,
  isLoading = false,
  onComponentClick,
  onAddComponent,
  onDuplicateComponent,
}: ComponentsEditorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<ComponentFilter>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreateComponent = async (data: {
    name: string
    description?: string
    prompt?: string
    method: 'ai' | 'scratch'
    componentType?: 'page' | 'form'
  }) => {
    setIsCreating(true)
    setCreateError(null)

    try {
      // Create component in the backend
      const savedComponent = await createComponent(appId, {
        name: data.name,
        description: data.description,
        type: data.componentType || 'page',
        method: data.method,
        prompt: data.prompt,
      })

      // Convert to ComponentData format
      const newComponent: ComponentData = {
        id: savedComponent.id,
        name: savedComponent.name,
        description: savedComponent.description || undefined,
        type: savedComponent.type,
        method: savedComponent.method,
        prompt: savedComponent.prompt || undefined,
        status: 'draft',
        createdAt: new Date(savedComponent.createdAt),
      }

      // Add to parent state
      onAddComponent?.(newComponent)
      setCreateDialogOpen(false)

      // Navigate to the component editor with isNewlyCreated=true for AI components
      onComponentClick?.(newComponent, newComponent.method === 'ai')
    } catch (error) {
      console.error('Failed to create component:', error)
      setCreateError('Failed to create component. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Filter components based on search and filter
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (component.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesFilter = filter === 'all' || component.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header Row - Title on left, Controls on right */}
      <div className="flex items-start justify-between px-6 pt-4 pb-2">
        {/* Left - Title */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Manage Components</h1>
          <p className="text-xs text-gray-700 mt-0.5">
            To learn more about custom components,{' '}
            <a
              href="https://kissflow.com/docs/components"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              click here
            </a>
          </p>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5 border-gray-200"
              >
                {filterLabels[filter]}
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-28">
              <DropdownMenuItem
                onClick={() => setFilter('all')}
                className="text-xs cursor-pointer"
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('page')}
                className="text-xs cursor-pointer"
              >
                Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('form')}
                className="text-xs cursor-pointer"
              >
                Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-white border-gray-400 placeholder:text-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          {/* New Component Button */}
          <Button
            size="sm"
            className="h-7 text-xs px-2.5 bg-gray-900 hover:bg-gray-800"
            onClick={() => setCreateDialogOpen(true)}
          >
            + New component
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {isLoading ? (
          /* Loading state */
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Loading components...</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          /* Empty state - centered */
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No components yet</h3>
            <p className="text-sm text-gray-500">
              Your components will appear here
            </p>
          </div>
        ) : (
          /* Component grid */
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {filteredComponents.map(component => (
              <ComponentCard
                key={component.id}
                component={component}
                onClick={onComponentClick}
                onDuplicate={onDuplicateComponent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Component Dialog */}
      <ComponentCreateDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) setCreateError(null)
        }}
        onSubmit={handleCreateComponent}
        isLoading={isCreating}
        externalError={createError}
      />
    </div>
  )
}
