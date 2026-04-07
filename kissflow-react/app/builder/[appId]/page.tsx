'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BuilderLayout } from '@/components/builder/BuilderLayout'
import { getApp, updateApp, checkAppName } from '@/lib/api/apps'
import type { App } from '@/lib/api/apps'

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const appId = params.appId as string

  useEffect(() => {
    async function fetchApp() {
      try {
        const fetchedApp = await getApp(appId)
        setApp(fetchedApp)
      } catch (err) {
        setError('App not found')
      } finally {
        setLoading(false)
      }
    }

    if (appId) {
      fetchApp()
    }
  }, [appId])

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">{error || 'App not found'}</div>
        <Button variant="outline" onClick={() => router.push('/explorer')}>
          Back to Explorer
        </Button>
      </div>
    )
  }

  const handleNameChange = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if name is available (exclude current app from check)
      const isAvailable = await checkAppName(newName, appId)
      if (!isAvailable) {
        return { success: false, error: 'This name is already taken' }
      }

      // Update the app name
      const updatedApp = await updateApp(appId, { name: newName })

      // Update local state
      setApp(updatedApp)

      return { success: true }
    } catch (err) {
      console.error('Failed to update app name:', err)
      return { success: false, error: 'Failed to save name' }
    }
  }

  return (
    <BuilderLayout
      appId={appId}
      appName={app.name}
      appDescription={app.description || undefined}
      appIcon={app.icon}
      appIconBg={app.iconBg}
      onNameChange={handleNameChange}
    >
      {/* Empty content area */}
    </BuilderLayout>
  )
}
