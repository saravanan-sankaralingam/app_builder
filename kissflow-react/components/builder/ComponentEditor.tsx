'use client'

import { useState, useEffect } from 'react'
import { SquarePlus, Inbox, X, Loader2, Pencil, Paperclip, Info, Code, Monitor, Smartphone, User, Mail, Phone, MapPin, Sparkles, Send } from 'lucide-react'
import { ComponentData } from './ComponentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getComponentById,
  addParameter as addParameterApi,
  updateComponent,
  Parameter,
} from '@/lib/api/components'
import { getBundleFileInfo, deleteBundleFile, UploadedFile } from '@/lib/api/upload'
import { UploadDialog } from './UploadDialog'

// AI Chat Message interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ComponentEditorProps {
  component: ComponentData
  appId: string
  isNewlyCreated?: boolean // True only when component was just created
}

export function ComponentEditor({ component, appId, isNewlyCreated = false }: ComponentEditorProps) {
  // Parameters state
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for parameter (used for both add and edit)
  const [paramName, setParamName] = useState('')
  const [paramId, setParamId] = useState('')
  const [paramType, setParamType] = useState<'string' | 'number' | 'static_dropdown'>('string')
  const [defaultValue, setDefaultValue] = useState('')

  // Uploaded file state
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFile | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'pwa'>('desktop')
  const [previewType, setPreviewType] = useState<'form' | 'editable-table' | 'readonly-table' | 'card'>('form')

  // Check if component type is form (show form preview instead of user card)
  const isFormComponent = component.type === 'form'

  // Check if component was created via AI
  const isAIComponent = component.method === 'ai'

  // AI generation state - only show animation for newly created AI components
  const [isGenerating, setIsGenerating] = useState(isAIComponent && isNewlyCreated)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    // Initialize with the original prompt if available
    if (component.prompt) {
      return [{
        id: 'initial-prompt',
        role: 'user',
        content: component.prompt,
        timestamp: new Date(),
      }]
    }
    return []
  })
  const [chatInput, setChatInput] = useState('')

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setPendingFile(file)
    setShowUploadDialog(true)
  }

  const handleUploadComplete = (fileInfo: UploadedFile) => {
    setUploadedFileInfo(fileInfo)
    setPendingFile(null)
    setShowUploadDialog(false)
  }

  const handleUploadDialogClose = () => {
    setShowUploadDialog(false)
    setPendingFile(null)
  }

  const handleRemoveFile = async () => {
    try {
      await deleteBundleFile(appId, component.id)
      setUploadedFileInfo(null)
    } catch (err) {
      console.error('Failed to delete file:', err)
    }
  }

  // Fetch component data with parameters and bundle file info on mount
  useEffect(() => {
    async function fetchComponent() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getComponentById(appId, component.id)
        setParameters(data.parameters || [])

        // Fetch existing bundle file info
        const bundleInfo = await getBundleFileInfo(appId, component.id)
        if (bundleInfo) {
          setUploadedFileInfo(bundleInfo)
        }
      } catch (err) {
        console.error('Failed to fetch component:', err)
        setError('Failed to load parameters')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponent()
  }, [appId, component.id])

  // Simulate AI generation progress for AI components
  useEffect(() => {
    if (isAIComponent && isGenerating) {
      const duration = 5000 // 5 seconds for generation
      const interval = 50
      const increment = 100 / (duration / interval)

      let progress = 0
      const timer = setInterval(() => {
        progress += increment
        if (progress >= 100) {
          progress = 100
          clearInterval(timer)
          setGenerationProgress(100)

          // Complete generation after a small delay
          setTimeout(() => {
            setIsGenerating(false)
            // Add AI response message
            setChatMessages(prev => [...prev, {
              id: `ai-response-${Date.now()}`,
              role: 'assistant',
              content: 'I\'ve generated your component based on your description. You can preview it in the center panel and make adjustments using the chat.',
              timestamp: new Date(),
            }])
          }, 500)
        } else {
          setGenerationProgress(Math.round(progress))
        }
      }, interval)

      return () => clearInterval(timer)
    }
  }, [isAIComponent, isGenerating])

  // Handle sending chat messages
  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    }

    setChatMessages(prev => [...prev, newMessage])
    setChatInput('')

    // Simulate AI response after a delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'I\'ll help you with that. Let me update the component...',
        timestamp: new Date(),
      }])
    }, 1500)
  }

  const handleAddParameter = async () => {
    if (!paramName.trim() || !paramId.trim()) return

    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      name: paramName.trim(),
      paramId: paramId.trim(),
      type: paramType,
      defaultValue: defaultValue.trim() || undefined,
    }

    try {
      setIsSaving(true)
      setError(null)
      const updatedComponent = await addParameterApi(appId, component.id, newParam)
      setParameters(updatedComponent.parameters || [])
      resetForm()
      setShowAddModal(false)
    } catch (err) {
      console.error('Failed to add parameter:', err)
      setError('Failed to add parameter')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setParamName('')
    setParamId('')
    setParamType('string')
    setDefaultValue('')
  }

  const openAddModal = () => {
    resetForm()
    setError(null)
    setShowAddModal(true)
  }

  const openEditModal = (param: Parameter) => {
    setEditingParameter(param)
    setParamName(param.name)
    setParamId(param.paramId)
    setParamType(param.type)
    setDefaultValue(param.defaultValue || '')
    setError(null)
    setShowEditModal(true)
  }

  const handleEditParameter = async () => {
    if (!paramName.trim() || !paramId.trim() || !editingParameter) return

    const updatedParam: Parameter = {
      id: editingParameter.id,
      name: paramName.trim(),
      paramId: paramId.trim(),
      type: paramType,
      defaultValue: defaultValue.trim() || undefined,
    }

    // Update the parameters array with the edited parameter
    const updatedParameters = parameters.map(p =>
      p.id === editingParameter.id ? updatedParam : p
    )

    try {
      setIsSaving(true)
      setError(null)
      const updatedComponent = await updateComponent(appId, component.id, {
        parameters: updatedParameters,
      })
      setParameters(updatedComponent.parameters || [])
      resetForm()
      setEditingParameter(null)
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update parameter:', err)
      setError('Failed to update parameter')
    } finally {
      setIsSaving(false)
    }
  }

  // AI Component Layout - 3 panel layout
  if (isAIComponent) {
    return (
      <div className="h-full w-full flex">
        {/* Left Panel - AI Conversation */}
        <div className="w-[320px] border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">Generating...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI to make changes..."
                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isGenerating}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isGenerating}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Panel - Preview */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {isGenerating ? (
            /* AI Generation Animation */
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Animated circles */}
              <div className="relative w-32 h-32 mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-200" />
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-purple-500"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - generationProgress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
                  />
                </svg>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-purple-500 animate-pulse" />
                </div>
              </div>

              {/* Progress text */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generating your component
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                AI is creating your {component.type} component...
              </p>
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-100"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{generationProgress}%</span>
              </div>
            </div>
          ) : (
            /* Component Preview */
            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-lg flex flex-col shadow-sm">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Component preview</h3>
                  {/* Desktop/PWA Toggle */}
                  <div className="flex items-center bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'desktop'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('pwa')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        previewMode === 'pwa'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                  {isFormComponent ? (
                    /* Form Preview */
                    <div className="w-full max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Enter name..."
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="Enter email..."
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          placeholder="Enter message..."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm resize-none"
                        />
                      </div>
                      <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Submit
                      </button>
                    </div>
                  ) : (
                    /* Page Preview - User Card */
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-sm">
                      {/* Gradient Header */}
                      <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 relative">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                            <User className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="pt-14 pb-6 px-6">
                        <h4 className="text-lg font-bold text-gray-900 text-center mb-0.5">John Doe</h4>
                        <p className="text-sm text-purple-500 font-medium text-center mb-4">Software Engineer</p>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm bg-blue-50 rounded-lg px-3 py-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-700">john.doe@example.com</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm bg-green-50 rounded-lg px-3 py-2">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">+1 (555) 123-4567</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Input Parameters (same as scratch) */}
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Input parameters</h3>
            <button
              onClick={openAddModal}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              title="Add parameter"
            >
              <SquarePlus className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">Loading parameters...</p>
            </div>
          ) : parameters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center px-4 text-center pt-[40%]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-700 mb-4 max-w-[180px] leading-relaxed">
                Your input parameters will appear here
              </p>
              <Button
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={openAddModal}
              >
                + Parameter
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {parameters.map(param => (
                <div
                  key={param.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative"
                >
                  <button
                    className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                    title="Edit parameter"
                    onClick={() => openEditModal(param)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <Label className="text-xs font-medium text-gray-700 mb-1.5 block pr-6">
                    {param.name}
                  </Label>
                  {param.type === 'string' && (
                    <Input
                      type="text"
                      placeholder={param.defaultValue || `Enter ${param.name.toLowerCase()}`}
                      defaultValue={param.defaultValue}
                      className="h-8 text-xs bg-white"
                    />
                  )}
                  {param.type === 'number' && (
                    <Input
                      type="number"
                      placeholder={param.defaultValue || '0'}
                      defaultValue={param.defaultValue}
                      className="h-8 text-xs bg-white"
                    />
                  )}
                  {param.type === 'static_dropdown' && (
                    <Select defaultValue={param.defaultValue}>
                      <SelectTrigger className="h-8 w-full text-xs bg-white">
                        <SelectValue placeholder={`Select ${param.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Parameter Modal */}
          {showAddModal && (
            <>
              <div
                className="absolute inset-0 bg-black/50 z-10"
                onClick={() => setShowAddModal(false)}
              />
              <div className="absolute top-0 left-0 right-0 bg-white z-20 shadow-lg border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Add parameter</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      Parameter name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter parameter name"
                      value={paramName}
                      onChange={(e) => setParamName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter parameter ID"
                      value={paramId}
                      onChange={(e) => setParamId(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      Parameter type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={paramType} onValueChange={(val) => setParamType(val as typeof paramType)}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="static_dropdown">Static dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">Default value</Label>
                    <Input
                      placeholder="Enter default value"
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setShowAddModal(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-blue-600 hover:bg-blue-700"
                      onClick={handleAddParameter}
                      disabled={!paramName.trim() || !paramId.trim() || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Adding...
                        </>
                      ) : (
                        'Add'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Edit Parameter Modal */}
          {showEditModal && (
            <>
              <div
                className="absolute inset-0 bg-black/50 z-10"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingParameter(null)
                  resetForm()
                }}
              />
              <div className="absolute top-0 left-0 right-0 bg-white z-20 shadow-lg border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Edit parameter</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingParameter(null)
                      resetForm()
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      Parameter name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter parameter name"
                      value={paramName}
                      onChange={(e) => setParamName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter parameter ID"
                      value={paramId}
                      onChange={(e) => setParamId(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">
                      Parameter type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={paramType} onValueChange={(val) => setParamType(val as typeof paramType)}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="static_dropdown">Static dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">Default value</Label>
                    <Input
                      placeholder="Enter default value"
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingParameter(null)
                        resetForm()
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-blue-600 hover:bg-blue-700"
                      onClick={handleEditParameter}
                      disabled={!paramName.trim() || !paramId.trim() || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Scratch Component Layout (original)
  return (
    <div className="h-full w-full flex">
      {/* Left Panel - Component Details (shown when file is uploaded) */}
      {uploadedFileInfo && (
        <div className="w-[320px] border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Component details</h3>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-4">
            {/* Section Title */}
            <p className="text-xs font-medium text-gray-700 mb-2">Source code / Bundle file</p>

            {/* File Card */}
            <div className="group border border-gray-300 rounded-lg flex items-center gap-3 relative hover:bg-gray-200 hover:border-gray-400 transition-colors">
              {/* Remove Button - visible on hover */}
              <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                title="Remove file"
              >
                <X className="h-3 w-3 text-white" />
              </button>
              {/* Icon Container */}
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {/* ZIP Icon - Document style with folded corner */}
                <div className="relative w-5 h-6">
                  {/* Main document body */}
                  <div className="absolute inset-0 bg-orange-500 rounded-[2px]" style={{ clipPath: 'polygon(0 0, 70% 0, 100% 25%, 100% 100%, 0 100%)' }}>
                    {/* ZIP text */}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[6px] font-bold">ZIP</span>
                  </div>
                  {/* Folded corner */}
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-300" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
                </div>
              </div>
              {/* File Name */}
              <span className="text-xs text-gray-900 font-medium truncate flex-1">
                {uploadedFileInfo.originalName}
              </span>
            </div>

            {/* Replace File Button */}
            <label className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file)
                  }
                }}
              />
              Replace file
            </label>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content */}
        {!uploadedFileInfo ? (
          /* Upload View - shown when no file is uploaded */
          <div className="flex-1 flex flex-col items-center justify-start px-6 pt-[15%]">
            {/* Import Section */}
            <div className="w-[480px]">
              {/* Title - Outside the box */}
              <h1 className="text-base font-semibold text-gray-900 mb-3">Import component</h1>

              {/* Import Card */}
              <div className="bg-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-2">Upload bundle file</h2>

                {/* Upload Area */}
                <label className="border border-dashed border-gray-500 rounded-xl py-5 px-8 text-center bg-white hover:border-blue-500 hover:bg-blue-100 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileSelect(file)
                      }
                    }}
                  />
                  <div className="flex items-center justify-center gap-1 text-blue-500 font-semibold mb-2 text-[13px]">
                    <Paperclip className="h-3 w-3" />
                    <span>Upload files</span>
                  </div>
                  <p className="text-[10px] text-gray-700">
                    Drag and drop files or paste from clipboard
                  </p>
                  <p className="text-[10px] text-gray-700 mt-1">
                    (Max 1 file, 1 MB per file, File format: ZIP)
                  </p>
                </label>
              </div>

              {/* Preview Link */}
              <div className="flex items-center gap-2 mt-4 text-xs">
                <Info className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 font-medium">Preview your component as you build</span>
                <button className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
                  <Code className="h-4 w-4" />
                  <span>click here</span>
                </button>
              </div>
            </div>
          </div>
        ) : isFormComponent ? (
          /* Form Component Preview */
          <div className="flex-1 p-4 bg-gray-200">
            <div className="h-full bg-white rounded-lg flex flex-col shadow-sm">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Component preview</h3>
                {/* Desktop/PWA Toggle */}
                <div className="flex items-center bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewMode === 'desktop'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('pwa')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewMode === 'pwa'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Preview Type Tabs and State Dropdown */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'form', label: 'Form' },
                    { id: 'editable-table', label: 'Editable table' },
                    { id: 'readonly-table', label: 'Read-only table' },
                    { id: 'card', label: 'Card' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewType(tab.id as typeof previewType)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        previewType === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* State Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">State</span>
                  <select
                    defaultValue="editable"
                    className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="editable">Editable</option>
                    <option value="readonly">Read-only</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Preview Content - Single Input */}
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Area - shown when file is uploaded */
          <div className="flex-1 p-4 bg-gray-200">
            <div className="h-full bg-white rounded-lg flex flex-col shadow-sm">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Component preview</h3>
                {/* Desktop/PWA Toggle */}
                <div className="flex items-center bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewMode === 'desktop'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('pwa')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      previewMode === 'pwa'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 flex items-center justify-center p-4">
                {/* User Details Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-sm">
                  {/* Gradient Header */}
                  <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 relative">
                    {/* Avatar - positioned to overlap */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                        <User className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-14 pb-6 px-6">
                    {/* Name */}
                    <h4 className="text-lg font-bold text-gray-900 text-center mb-0.5">John Doe</h4>
                    <p className="text-sm text-purple-500 font-medium text-center mb-4">Software Engineer</p>

                    {/* Stats */}
                    <div className="flex justify-center gap-6 mb-5">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">128</p>
                        <p className="text-xs text-gray-500">Projects</p>
                      </div>
                      <div className="text-center border-x border-gray-200 px-6">
                        <p className="text-lg font-bold text-gray-900">4.9</p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">5yr</p>
                        <p className="text-xs text-gray-500">Exp</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-sm bg-blue-50 rounded-lg px-3 py-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-700">john.doe@example.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-green-50 rounded-lg px-3 py-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-orange-50 rounded-lg px-3 py-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-700">San Francisco, CA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Input Parameters */}
      <div className="w-72 border-l border-gray-200 bg-white flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Input parameters</h3>
          <button
            onClick={openAddModal}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            title="Add parameter"
          >
            <SquarePlus className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Loading parameters...</p>
          </div>
        ) : parameters.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center px-4 text-center pt-[40%]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-700 mb-4 max-w-[180px] leading-relaxed">
              Your input parameters will appear here
            </p>
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={openAddModal}
            >
              + Parameter
            </Button>
          </div>
        ) : (
          /* Parameters List */
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {parameters.map(param => (
              <div
                key={param.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative"
              >
                {/* Edit Icon - Top Right Corner */}
                <button
                  className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                  title="Edit parameter"
                  onClick={() => openEditModal(param)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                {/* Parameter Label */}
                <Label className="text-xs font-medium text-gray-700 mb-1.5 block pr-6">
                  {param.name}
                </Label>

                {/* Input Field based on type */}
                {param.type === 'string' && (
                  <Input
                    type="text"
                    placeholder={param.defaultValue || `Enter ${param.name.toLowerCase()}`}
                    defaultValue={param.defaultValue}
                    className="h-8 text-xs bg-white"
                  />
                )}

                {param.type === 'number' && (
                  <Input
                    type="number"
                    placeholder={param.defaultValue || '0'}
                    defaultValue={param.defaultValue}
                    className="h-8 text-xs bg-white"
                  />
                )}

                {param.type === 'static_dropdown' && (
                  <Select defaultValue={param.defaultValue}>
                    <SelectTrigger className="h-8 w-full text-xs bg-white">
                      <SelectValue placeholder={`Select ${param.name.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Parameter Modal Overlay */}
        {showAddModal && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 z-10"
              onClick={() => setShowAddModal(false)}
            />

            {/* Modal */}
            <div className="absolute top-0 left-0 right-0 bg-white z-20 shadow-lg border-b border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Add parameter</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* Parameter Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Parameter name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter parameter name"
                    value={paramName}
                    onChange={(e) => setParamName(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* ID */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter parameter ID"
                    value={paramId}
                    onChange={(e) => setParamId(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Parameter Type */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Parameter type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={paramType} onValueChange={(val) => setParamType(val as typeof paramType)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="static_dropdown">Static dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Value */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">Default value</Label>
                  <Input
                    placeholder="Enter default value"
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setShowAddModal(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddParameter}
                    disabled={!paramName.trim() || !paramId.trim() || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Parameter Modal Overlay */}
        {showEditModal && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 z-10"
              onClick={() => {
                setShowEditModal(false)
                setEditingParameter(null)
                resetForm()
              }}
            />

            {/* Modal */}
            <div className="absolute top-0 left-0 right-0 bg-white z-20 shadow-lg border-b border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Edit parameter</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingParameter(null)
                    resetForm()
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* Parameter Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Parameter name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter parameter name"
                    value={paramName}
                    onChange={(e) => setParamName(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* ID */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter parameter ID"
                    value={paramId}
                    onChange={(e) => setParamId(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Parameter Type */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Parameter type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={paramType} onValueChange={(val) => setParamType(val as typeof paramType)}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="static_dropdown">Static dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Value */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">Default value</Label>
                  <Input
                    placeholder="Enter default value"
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingParameter(null)
                      resetForm()
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                    onClick={handleEditParameter}
                    disabled={!paramName.trim() || !paramId.trim() || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={handleUploadDialogClose}
        file={pendingFile}
        appId={appId}
        componentId={component.id}
        onComplete={handleUploadComplete}
      />
    </div>
  )
}
