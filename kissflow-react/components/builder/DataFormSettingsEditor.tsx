'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { X, ExternalLink, Globe, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'general' | 'public-form'
type PostSubmissionOption = 'close' | 'show-message' | 'redirect'

interface Tag {
  id: string
  label: string
}

interface DataFormSettingsEditorProps {
  dataFormName: string
}

export function DataFormSettingsEditor({ dataFormName }: DataFormSettingsEditorProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  // General settings state
  const [formTitleTags, setFormTitleTags] = useState<Tag[]>([
    { id: '1', label: 'Flow name' },
    { id: '2', label: 'from Created by' },
  ])

  // Public form settings state
  const [publicFormEnabled, setPublicFormEnabled] = useState(false)
  const [postSubmissionOption, setPostSubmissionOption] = useState<PostSubmissionOption>('close')
  const [inaccessibleMessage, setInaccessibleMessage] = useState('')

  const handleRemoveTag = (tagId: string) => {
    setFormTitleTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const sidebarItems = [
    { id: 'general' as SettingsTab, label: 'General settings', icon: Globe },
    { id: 'public-form' as SettingsTab, label: 'Public form settings', icon: FileText },
  ]

  return (
    <div className="h-full w-full bg-white flex">
      {/* Left Sidebar */}
      <div className="w-[280px] border-r border-gray-200 p-4 flex-shrink-0">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full text-left px-3 py-3 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2',
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-500 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4',
                  activeTab === item.id ? 'text-blue-500' : 'text-gray-500'
                )} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-[600px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Page Title */}
              <h2 className="text-base font-semibold text-gray-900">General settings</h2>

              {/* Configure form title */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Configure form title</h3>
                <p className="text-xs text-gray-600 mb-3">Configure how you want the title to appear on each form</p>
                <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-md min-h-[44px]">
                  {formTitleTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm text-gray-700 rounded"
                    >
                      {tag.label}
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs bg-gray-900 hover:bg-gray-800 cursor-pointer"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'public-form' && (
            <div className="space-y-6">
              {/* Page Title */}
              <h2 className="text-base font-semibold text-gray-900">Public form settings</h2>

              {/* Public form URL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Public form URL</h3>
                  <Switch
                    checked={publicFormEnabled}
                    onCheckedChange={setPublicFormEnabled}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enable this to allow anyone with the link to submit responses
                </p>
              </div>

              {/* Form customization */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Form customization</h3>
                <button className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                  <span>Customize</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* What happens post submission */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">What happens post submission?</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="post-submission"
                      checked={postSubmissionOption === 'close'}
                      onChange={() => setPostSubmissionOption('close')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Close the form</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="post-submission"
                      checked={postSubmissionOption === 'show-message'}
                      onChange={() => setPostSubmissionOption('show-message')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show a message</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="post-submission"
                      checked={postSubmissionOption === 'redirect'}
                      onChange={() => setPostSubmissionOption('redirect')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Redirect to a URL</span>
                  </label>
                </div>
              </div>

              {/* Form inaccessible message */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Form inaccessible message</h3>
                <p className="text-xs text-gray-500">
                  This message will be shown when the form is disabled or unavailable
                </p>
                <Input
                  value={inaccessibleMessage}
                  onChange={(e) => setInaccessibleMessage(e.target.value)}
                  placeholder="Enter a message..."
                  className="h-9"
                />
              </div>

              {/* Save Button */}
              <div>
                <Button
                  size="sm"
                  className="h-8 px-4 text-sm bg-gray-900 hover:bg-gray-800 cursor-pointer"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
