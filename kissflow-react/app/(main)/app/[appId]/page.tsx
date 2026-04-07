'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { employeeDirectoryApp } from '@/data/apps'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, MoreVertical, Pencil } from 'lucide-react'
import { TableView } from '@/components/views/table/TableView'
import { ViewType } from '@/types/app'
import { useState } from 'react'

interface AppPageProps {
  params: Promise<{
    appId: string
  }>
}

export default function AppPage({ params }: AppPageProps) {
  const resolvedParams = use(params)
  const [currentView, setCurrentView] = useState<ViewType>('table')

  // For now, only handle employee-directory
  if (resolvedParams.appId !== 'employee-directory') {
    notFound()
  }

  const app = employeeDirectoryApp
  const Icon = app.icon

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* App Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          {/* App Title Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: app.iconBg }}
              >
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {app.name}
                  </h1>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    🎨
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold">
                    A
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold">
                    S
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                    M
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <Settings className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{app.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Manage
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start">
              {app.tabs?.map((tab) => (
                <TabsTrigger
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* View Content */}
      <div className="bg-gray-50">
        <Tabs value={currentView} className="w-full">
          <TabsContent value="table" className="mt-0">
            <TableView />
          </TabsContent>
          <TabsContent value="sheet" className="mt-0">
            <div className="p-6">
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500">Sheet view coming soon...</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="gallery" className="mt-0">
            <div className="p-6">
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500">Gallery view coming soon...</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            <div className="p-6">
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500">Kanban view coming soon...</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="mt-0">
            <div className="p-6">
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500">Timeline view coming soon...</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
            <div className="p-6">
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500">Calendar view coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
