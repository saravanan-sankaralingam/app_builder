'use client'

import { useState } from 'react'
import { Search, ArrowUpDown, FolderPlus, Upload, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ResourcesEditor() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header with search, sort, folder, and upload buttons */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-white border-gray-400 placeholder:text-gray-500 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Folder
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5 bg-gray-900 hover:bg-gray-800"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col min-h-0">
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-0">
          {/* Empty state - centered */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Inbox className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No resources yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload files or create folders to manage your resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
