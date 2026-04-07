'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Type,
  AlignLeft,
  Hash,
  Calendar,
  CalendarClock,
  ChevronDown,
  ArrowBigUp,
  ArrowBigDown,
  Copy,
  ToggleLeft,
  ListChecks,
  DollarSign,
  Mail,
  CheckSquare,
  Circle,
  User,
  Search,
  Globe,
  Paperclip,
  Image,
  Files,
  Calculator,
  PenTool,
  ListOrdered,
  MapPin,
  ScanLine,
  MousePointer2,
  Star,
  SlidersHorizontal,
  ListTodo,
  FileText,
  LayoutGrid,
  Form,
  Sparkles,
  Inbox,
  Plus,
  GripVertical,
  Trash2,
  Table,
  Layers,
  Settings,
  ShieldCheck,
  Eye,
  Palette,
  Zap,
  Paintbrush,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PropertyPanelHeader } from './PropertyPanelHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Field category type
type FieldCategory = 'basic' | 'dataLookup' | 'fileMedia' | 'advanced' | 'widget'

// Field type definitions for the widgets panel
interface FieldTypeWidget {
  id: string
  label: string
  icon: React.ElementType
  category: FieldCategory
}

// Theme colors for field appearance
const themeColors = [
  { id: 'default', label: 'Default', value: null, bgClass: 'bg-gray-50', borderClass: 'border-gray-200', textClass: 'text-gray-600', colorClass: 'bg-gray-900' },
  { id: 'blue', label: 'Blue', value: '#3b82f6', bgClass: 'bg-blue-50', borderClass: 'border-blue-300', textClass: 'text-blue-600', colorClass: 'bg-blue-500' },
  { id: 'green', label: 'Green', value: '#22c55e', bgClass: 'bg-green-50', borderClass: 'border-green-300', textClass: 'text-green-600', colorClass: 'bg-green-500' },
  { id: 'amber', label: 'Amber', value: '#f59e0b', bgClass: 'bg-amber-50', borderClass: 'border-amber-300', textClass: 'text-amber-600', colorClass: 'bg-amber-500' },
  { id: 'red', label: 'Red', value: '#ef4444', bgClass: 'bg-red-50', borderClass: 'border-red-300', textClass: 'text-red-600', colorClass: 'bg-red-500' },
  { id: 'purple', label: 'Purple', value: '#a855f7', bgClass: 'bg-purple-50', borderClass: 'border-purple-300', textClass: 'text-purple-600', colorClass: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', value: '#ec4899', bgClass: 'bg-pink-50', borderClass: 'border-pink-300', textClass: 'text-pink-600', colorClass: 'bg-pink-500' },
  { id: 'cyan', label: 'Cyan', value: '#06b6d4', bgClass: 'bg-cyan-50', borderClass: 'border-cyan-300', textClass: 'text-cyan-600', colorClass: 'bg-cyan-500' },
  { id: 'orange', label: 'Orange', value: '#f97316', bgClass: 'bg-orange-50', borderClass: 'border-orange-300', textClass: 'text-orange-600', colorClass: 'bg-orange-500' },
]

// Form canvas types
interface FormField {
  id: string
  type: string
  label: string
  colSpan: 1 | 2 | 3 | 4 | 5 | 6
  row: number  // Row index (0-based)
  required?: boolean  // Mandatory field
  helpText?: string   // Help text for the field
  appearance?: string // Color theme: 'default' | 'blue' | 'purple' | 'green' | 'yellow' | 'red'
  defaultValue?: string // Default value for the field
  isComputed?: boolean  // Whether this is a computed/formula field
}

interface TableColumn {
  id: string
  label: string
  type: string
}

interface FormSection {
  id: string
  title: string
  subtitle: string
  type: 'section' | 'table'
  fields: FormField[]
  columns?: TableColumn[]  // Only for table type
}

// Category configuration
const categories: { id: FieldCategory; label: string }[] = [
  { id: 'basic', label: 'BASIC' },
  { id: 'dataLookup', label: 'DATA LOOKUP' },
  { id: 'fileMedia', label: 'FILE & MEDIA' },
  { id: 'advanced', label: 'ADVANCED' },
  { id: 'widget', label: 'WIDGET' },
]

const fieldTypeWidgets: FieldTypeWidget[] = [
  // BASIC fields
  { id: 'text', label: 'Text', icon: Type, category: 'basic' },
  { id: 'number', label: 'Number', icon: Hash, category: 'basic' },
  { id: 'date', label: 'Date', icon: Calendar, category: 'basic' },
  { id: 'datetime', label: 'Date & Time', icon: CalendarClock, category: 'basic' },
  { id: 'dropdown', label: 'Dropdown', icon: ChevronDown, category: 'basic' },
  { id: 'yesno', label: 'Yes/No', icon: ToggleLeft, category: 'basic' },
  { id: 'textarea', label: 'Text area', icon: AlignLeft, category: 'basic' },
  { id: 'multiselect', label: 'Multi-select dropdown', icon: ListChecks, category: 'basic' },
  { id: 'currency', label: 'Currency', icon: DollarSign, category: 'basic' },
  { id: 'email', label: 'Email', icon: Mail, category: 'basic' },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'basic' },
  { id: 'radio', label: 'Radio button', icon: Circle, category: 'basic' },
  { id: 'user', label: 'User', icon: User, category: 'basic' },

  // DATA LOOKUP fields
  { id: 'lookup', label: 'Lookup', icon: Search, category: 'dataLookup' },
  { id: 'remotelookup', label: 'Remote lookup', icon: Globe, category: 'dataLookup' },

  // FILE & MEDIA fields
  { id: 'attachment', label: 'Attachment', icon: Paperclip, category: 'fileMedia' },
  { id: 'image', label: 'Image', icon: Image, category: 'fileMedia' },
  { id: 'smartattachment', label: 'Smart attachment', icon: Files, category: 'fileMedia' },

  // ADVANCED fields
  { id: 'aggregation', label: 'Aggregation', icon: Calculator, category: 'advanced' },
  { id: 'signature', label: 'Signature', icon: PenTool, category: 'advanced' },
  { id: 'sequence', label: 'Sequence number', icon: ListOrdered, category: 'advanced' },
  { id: 'geolocation', label: 'Geolocation', icon: MapPin, category: 'advanced' },
  { id: 'scanner', label: 'Scanner', icon: ScanLine, category: 'advanced' },

  // WIDGET fields
  { id: 'button', label: 'Button', icon: MousePointer2, category: 'widget' },
  { id: 'rating', label: 'Rating', icon: Star, category: 'widget' },
  { id: 'slider', label: 'Slider', icon: SlidersHorizontal, category: 'widget' },
  { id: 'checklist', label: 'Checklist', icon: ListTodo, category: 'widget' },
  { id: 'richtext', label: 'Rich text', icon: FileText, category: 'widget' },
  { id: 'grid', label: 'Grid', icon: LayoutGrid, category: 'widget' },
]

interface FormBuilderProps {
  entityId: string
  entityName: string
  entityType: 'dataform' | 'board' | 'process'
}

// Property panel tab type
type PropertyTab = 'settings' | 'validation' | 'visibility' | 'style' | 'events'

const propertyTabs: { id: PropertyTab; label: string; icon: React.ElementType }[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'validation', label: 'Validation', icon: ShieldCheck },
  { id: 'visibility', label: 'Visibility', icon: Eye },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'events', label: 'Events', icon: Zap },
]

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Default sections state
const defaultSections: FormSection[] = [
  {
    id: 'section-1',
    title: 'Untitled',
    subtitle: '',
    type: 'section',
    fields: [
      {
        id: 'field-1',
        type: 'text',
        label: 'Untitled field',
        colSpan: 2,
        row: 0,
      },
    ],
  },
]

// Helper to get the next row number for a section
const getNextRow = (fields: FormField[]): number => {
  if (fields.length === 0) return 0
  return Math.max(...fields.map(f => f.row)) + 1
}

// Helper to get the current row (last row with space or new row if full)
const getCurrentRow = (fields: FormField[]): number => {
  if (fields.length === 0) return 0
  const maxRow = Math.max(...fields.map(f => f.row))
  const fieldsInLastRow = fields.filter(f => f.row === maxRow)
  const usedCols = fieldsInLastRow.reduce((sum, f) => sum + f.colSpan, 0)
  // If last row has space for at least a 2-col field, use it; otherwise new row
  return usedCols <= 4 ? maxRow : maxRow + 1
}

export function FormBuilder({ entityId, entityName, entityType }: FormBuilderProps) {
  const [fieldView, setFieldView] = useState<'all' | 'ai'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sections, setSections] = useState<FormSection[]>(defaultSections)
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null)

  // Drag and drop state
  const [draggedField, setDraggedField] = useState<FieldTypeWidget | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)

  // Field selection state - auto-select first field on load
  const [selectedField, setSelectedField] = useState<{
    sectionId: string
    fieldId: string
  } | null>(() => {
    const firstSection = defaultSections[0]
    if (firstSection?.fields.length > 0) {
      return { sectionId: firstSection.id, fieldId: firstSection.fields[0].id }
    }
    return null
  })

  // Property panel tab state
  const [activePropertyTab, setActivePropertyTab] = useState<PropertyTab>('settings')

  // Add Row popover state
  const [addRowPopoverSection, setAddRowPopoverSection] = useState<string | null>(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addRowPopoverSection) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-add-row-popover]')) {
          setAddRowPopoverSection(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addRowPopoverSection])

  // Ensure a field is always selected when sections change
  useEffect(() => {
    // Get all available fields
    const allFields = sections.flatMap(s =>
      s.type === 'section' ? s.fields.map(f => ({ sectionId: s.id, fieldId: f.id })) : []
    )

    // If no field selected, select the first available
    if (!selectedField) {
      if (allFields.length > 0) {
        setSelectedField(allFields[0])
      }
      return
    }

    // Verify current selection still exists
    const section = sections.find(s => s.id === selectedField.sectionId)
    const fieldExists = section?.fields.some(f => f.id === selectedField.fieldId)

    if (!fieldExists) {
      // Select first available field
      setSelectedField(allFields[0] || null)
    }
  }, [sections, selectedField])

  // Add a new section
  const addSection = (afterIndex?: number) => {
    const newSection: FormSection = {
      id: generateId(),
      title: 'Untitled',
      subtitle: '',
      type: 'section',
      fields: [],
    }
    if (afterIndex !== undefined) {
      const newSections = [...sections]
      newSections.splice(afterIndex + 1, 0, newSection)
      setSections(newSections)
    } else {
      setSections([...sections, newSection])
    }
  }

  // Add a new table section
  const addTable = (afterIndex?: number) => {
    const newTable: FormSection = {
      id: generateId(),
      title: 'Untitled',
      subtitle: '',
      type: 'table',
      fields: [],
      columns: [
        {
          id: generateId(),
          label: 'Untitled',
          type: 'text',
        },
      ],
    }
    if (afterIndex !== undefined) {
      const newSections = [...sections]
      newSections.splice(afterIndex + 1, 0, newTable)
      setSections(newSections)
    } else {
      setSections([...sections, newTable])
    }
  }

  // Delete a section
  const deleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(s => s.id !== sectionId)
    setSections(updatedSections)

    // Select next available field
    const allFields = updatedSections.flatMap(s =>
      s.type === 'section' ? s.fields.map(f => ({ sectionId: s.id, fieldId: f.id })) : []
    )
    setSelectedField(allFields[0] || null)
  }

  // Duplicate a section
  const duplicateSection = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) return

    const sectionToDuplicate = sections[sectionIndex]
    const duplicatedSection = {
      ...sectionToDuplicate,
      id: generateId(),
      title: `${sectionToDuplicate.title} (Copy)`,
      fields: sectionToDuplicate.fields.map(f => ({ ...f, id: generateId() }))
    }

    const newSections = [...sections]
    newSections.splice(sectionIndex + 1, 0, duplicatedSection)
    setSections(newSections)
  }

  // Move section up
  const moveSectionUp = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId)
    if (sectionIndex <= 0) return

    const newSections = [...sections]
    const temp = newSections[sectionIndex - 1]
    newSections[sectionIndex - 1] = newSections[sectionIndex]
    newSections[sectionIndex] = temp
    setSections(newSections)
  }

  // Move section down
  const moveSectionDown = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1 || sectionIndex >= sections.length - 1) return

    const newSections = [...sections]
    const temp = newSections[sectionIndex + 1]
    newSections[sectionIndex + 1] = newSections[sectionIndex]
    newSections[sectionIndex] = temp
    setSections(newSections)
  }

  // Delete a field
  const deleteField = (sectionId: string, fieldId: string) => {
    const updatedSections = sections.map(s =>
      s.id === sectionId
        ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
        : s
    )
    setSections(updatedSections)

    // Select next available field
    const allFields = updatedSections.flatMap(s =>
      s.type === 'section' ? s.fields.map(f => ({ sectionId: s.id, fieldId: f.id })) : []
    )
    setSelectedField(allFields[0] || null)
  }

  // Update a field's properties
  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          }
        : s
    ))
  }

  // Get selected field data
  const getSelectedFieldData = () => {
    if (!selectedField) return null
    const section = sections.find(s => s.id === selectedField.sectionId)
    const field = section?.fields.find(f => f.id === selectedField.fieldId)
    if (!field) return null
    const fieldType = fieldTypeWidgets.find(ft => ft.id === field.type)
    return { field, fieldType, section }
  }

  const selectedFieldData = getSelectedFieldData()

  // Update section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, title } : s
    ))
  }

  // Update section subtitle
  const updateSectionSubtitle = (sectionId: string, subtitle: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, subtitle } : s
    ))
  }

  // Filter fields by search query
  const filteredFields = searchQuery.trim()
    ? fieldTypeWidgets.filter((f) =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fieldTypeWidgets

  // Group fields by category
  const getFieldsByCategory = (categoryId: FieldCategory) => {
    return filteredFields.filter((f) => f.category === categoryId)
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Widgets */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFieldView('all')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1',
                fieldView === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Form className={cn("h-3 w-3", fieldView === 'all' && "text-blue-500")} />
              All Fields
            </button>
            <button
              onClick={() => setFieldView('ai')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1',
                fieldView === 'ai'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.19688 22.0707L2.81868 34.5322C2.55321 35.2878 1.72546 35.6851 0.969847 35.4197C0.214238 35.1542 -0.183094 34.3264 0.0823803 33.5708L4.46058 21.1094C5.3631 18.5406 8.98821 18.5188 9.92146 21.0766L14.4742 33.5545C14.7487 34.3068 14.3613 35.1393 13.6089 35.4138C12.8565 35.6883 12.0241 35.3009 11.7496 34.5486L7.19688 22.0707Z" fill="#a855f7"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.98084 30.089C1.98084 29.2881 2.63008 28.6388 3.43097 28.6388H11.1318C11.9327 28.6388 12.582 29.2881 12.582 30.089C12.582 30.8898 11.9327 31.5391 11.1318 31.5391H3.43097C2.63008 31.5391 1.98084 30.8898 1.98084 30.089Z" fill="#a855f7"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.0518 18.2953C19.8527 18.2953 20.5019 18.9445 20.5019 19.7454V34.047C20.5019 34.8479 19.8527 35.4971 19.0518 35.4971C18.2509 35.4971 17.6017 34.8479 17.6017 34.047V19.7454C17.6017 18.9445 18.2509 18.2953 19.0518 18.2953Z" fill="#a855f7"/>
                <path d="M31.8789 10.2327C32.0494 9.44346 33.1753 9.44346 33.3457 10.2327L33.697 11.8591C34.2468 14.4048 36.2517 16.3835 38.8045 16.8998L39.3985 17.02C40.2006 17.1822 40.2006 18.3286 39.3985 18.4908L38.6917 18.6338C36.1966 19.1384 34.2194 21.0421 33.6205 23.5162L33.3416 24.6685C33.1564 25.4336 32.0683 25.4336 31.8831 24.6685L31.6041 23.5163C31.0053 21.0421 29.028 19.1384 26.5329 18.6338L25.8262 18.4908C25.0241 18.3286 25.0241 17.1822 25.8262 17.02L26.4202 16.8998C28.9729 16.3835 30.9778 14.4048 31.5277 11.8591L31.8789 10.2327Z" fill="#22c55e"/>
                <path d="M17.8046 5.03628C17.974 4.31851 18.9956 4.31851 19.1649 5.03628C19.635 7.02823 21.1903 8.58353 23.1822 9.05357C23.9 9.22295 23.9 10.2445 23.1822 10.4139C21.1903 10.8839 19.635 12.4392 19.1649 14.4312C18.9956 15.1489 17.974 15.1489 17.8046 14.4312C17.3346 12.4392 15.7793 10.8839 13.7874 10.4139C13.0696 10.2445 13.0696 9.22295 13.7874 9.05357C15.7793 8.58353 17.3346 7.02823 17.8046 5.03628Z" fill="#ec4899"/>
              </svg>
              Suggested
            </button>
          </div>
        </div>
        {fieldView === 'all' && (
          <div className="px-3 py-2 bg-white relative z-20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-400 rounded-md placeholder:text-gray-500 hover:border-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors cursor-text"
              />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto px-3 pb-3">
          {fieldView === 'all' ? (
            <div className="space-y-7">
              {categories.map((category) => {
                const fields = getFieldsByCategory(category.id)
                if (fields.length === 0) return null
                return (
                  <div key={category.id}>
                    <h3 className="sticky top-0 text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-2 px-1 py-1 bg-white z-10">
                      {category.label}
                    </h3>
                    <div className="space-y-1.5">
                      {fields.map((field) => {
                        const Icon = field.icon
                        return (
                          <button
                            key={field.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggedField(field)
                              e.dataTransfer.effectAllowed = 'copy'
                            }}
                            onDragEnd={() => setDraggedField(null)}
                            className={cn(
                              'group flex items-center gap-2.5 w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-gray-300 hover:shadow-sm transition-all cursor-grab',
                              draggedField?.id === field.id && 'opacity-50'
                            )}
                          >
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
                              <Icon className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                            <span className="text-[13px] font-medium text-gray-700 flex-1 text-left">{field.label}</span>
                            <GripVertical className="h-3.5 w-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {filteredFields.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500">No fields found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-4">
              <p className="text-sm text-gray-500">
                AI suggested fields will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Center Panel - Canvas */}
      <div className="flex-1 bg-gray-100 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
                const isFirstSection = sectionIndex === 0
                const isLastSection = sectionIndex === sections.length - 1
                const isOnlySection = sections.length === 1

                return (
              <React.Fragment key={section.id}>
              <div
                className="bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                {/* Section Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {section.type === 'table' && (
                          <Table className="h-4 w-4 text-gray-400" />
                        )}
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          placeholder="Untitled"
                          className="text-base font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 flex-1"
                        />
                      </div>
                      {section.subtitle || editingSubtitle === section.id ? (
                        <input
                          type="text"
                          value={section.subtitle}
                          onChange={(e) => updateSectionSubtitle(section.id, e.target.value)}
                          onBlur={() => setEditingSubtitle(null)}
                          placeholder="Add a subtitle..."
                          autoFocus={editingSubtitle === section.id}
                          className="text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 w-full mt-1"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSubtitle(section.id)}
                          className="text-xs text-blue-500 hover:text-blue-600 mt-1 cursor-pointer"
                        >
                          + Add subtitle
                        </button>
                      )}
                    </div>
                    {/* Section Action Icons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {/* TODO: Open section settings */}}
                        className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        title="Settings"
                      >
                        <Settings className="h-5 w-5" strokeWidth={1} />
                      </button>
                      <button
                        onClick={() => duplicateSection(section.id)}
                        className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="h-5 w-5" strokeWidth={1} />
                      </button>
                      <button
                        onClick={() => moveSectionUp(section.id)}
                        disabled={isFirstSection || isOnlySection}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isFirstSection || isOnlySection
                            ? "text-gray-200 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
                        )}
                        title="Move up"
                      >
                        <ArrowBigUp className="h-5 w-5" strokeWidth={1} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(section.id)}
                        disabled={isLastSection || isOnlySection}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isLastSection || isOnlySection
                            ? "text-gray-200 cursor-not-allowed"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-200 cursor-pointer"
                        )}
                        title="Move down"
                      >
                        <ArrowBigDown className="h-5 w-5" strokeWidth={1} />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-1.5 text-gray-700 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content area - different for section vs table */}
                <div
                  className={cn(
                    'p-8',
                    section.type === 'section' && draggedField && 'bg-blue-50/50',
                    dragOverSection === section.id && 'ring-2 ring-inset ring-blue-400'
                  )}
                  onDragOver={(e) => {
                    if (section.type === 'section' && draggedField) {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'copy'
                      setDragOverSection(section.id)
                    }
                  }}
                  onDragLeave={() => setDragOverSection(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedField && section.type === 'section') {
                      const newField: FormField = {
                        id: generateId(),
                        type: draggedField.id,
                        label: 'Untitled field',
                        colSpan: 2,
                        row: getCurrentRow(section.fields),
                      }
                      setSections(sections.map(s =>
                        s.id === section.id ? { ...s, fields: [...s.fields, newField] } : s
                      ))
                      setDraggedField(null)
                      setDragOverSection(null)
                      // Select the newly added field
                      setSelectedField({ sectionId: section.id, fieldId: newField.id })
                    }
                  }}
                >
                  {section.type === 'table' ? (
                    // Table view
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {section.columns?.map((column) => (
                              <th
                                key={column.id}
                                className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 border-r border-gray-200 last:border-r-0"
                              >
                                <input
                                  type="text"
                                  value={column.label}
                                  onChange={(e) => {
                                    setSections(sections.map(s =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            columns: s.columns?.map(c =>
                                              c.id === column.id ? { ...c, label: e.target.value } : c
                                            ),
                                          }
                                        : s
                                    ))
                                  }}
                                  placeholder="Untitled"
                                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full font-medium"
                                />
                              </th>
                            ))}
                            <th className="px-2 py-2.5 w-10">
                              <button
                                onClick={() => {
                                  setSections(sections.map(s =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          columns: [
                                            ...(s.columns || []),
                                            { id: generateId(), label: 'Untitled', type: 'text' },
                                          ],
                                        }
                                      : s
                                  ))
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="Add column"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 last:border-b-0">
                            {section.columns?.map((column) => (
                              <td
                                key={column.id}
                                className="px-4 py-3 text-sm text-gray-400 border-r border-gray-100 last:border-r-0"
                              >
                                Enter value...
                              </td>
                            ))}
                            <td className="px-2 py-3 w-10"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // Section view - Fields Grid - 6 columns, grouped by rows
                    <>
                      {section.fields.length > 0 ? (
                        <div className="space-y-5">
                          {/* Group fields by row and render each row */}
                          {(() => {
                            const rows = [...new Set(section.fields.map(f => f.row))].sort((a, b) => a - b)
                            return rows.map((rowIndex) => {
                              const fieldsInRow = section.fields.filter(f => f.row === rowIndex)
                              return (
                                <div key={rowIndex} className="grid grid-cols-6 gap-3">
                                  {fieldsInRow.map((field) => {
                                    const fieldColor = themeColors.find(c => c.id === (field.appearance || 'default'))
                                    return (
                                    <div
                                      key={field.id}
                                      onClick={() => setSelectedField({ sectionId: section.id, fieldId: field.id })}
                                      className={cn(
                                        'p-3 rounded-lg cursor-pointer hover:border-blue-300 transition-colors group border',
                                        fieldColor?.bgClass || 'bg-gray-50',
                                        fieldColor?.borderClass || 'border-gray-200',
                                        field.colSpan === 1 && 'col-span-1',
                                        field.colSpan === 2 && 'col-span-2',
                                        field.colSpan === 3 && 'col-span-3',
                                        field.colSpan === 4 && 'col-span-4',
                                        field.colSpan === 5 && 'col-span-5',
                                        field.colSpan === 6 && 'col-span-6',
                                        selectedField?.fieldId === field.id && 'ring-2 ring-blue-500 border-blue-500'
                                      )}
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <label className={cn(
                                          'text-xs font-medium',
                                          fieldColor?.textClass || 'text-gray-600'
                                        )}>
                                          {field.label}
                                        </label>
                                        <GripVertical className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                                      </div>
                                      {/* Input Preview */}
                                      {field.type === 'text' && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center">
                                          <span className="text-sm text-gray-400">Enter text...</span>
                                        </div>
                                      )}
                                      {field.type === 'number' && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center">
                                          <span className="text-sm text-gray-400">0</span>
                                        </div>
                                      )}
                                      {field.type === 'date' && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                          <span className="text-sm text-gray-400">Select date</span>
                                        </div>
                                      )}
                                      {field.type === 'dropdown' && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-between">
                                          <span className="text-sm text-gray-400">Select...</span>
                                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                        </div>
                                      )}
                                      {field.type === 'textarea' && (
                                        <div className="h-16 bg-white border border-gray-200 rounded px-2 py-1.5">
                                          <span className="text-sm text-gray-400">Enter text...</span>
                                        </div>
                                      )}
                                      {field.type === 'email' && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center gap-2">
                                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                                          <span className="text-sm text-gray-400">email@example.com</span>
                                        </div>
                                      )}
                                      {field.type === 'checkbox' && (
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 border border-gray-300 rounded bg-white" />
                                          <span className="text-sm text-gray-400">Option</span>
                                        </div>
                                      )}
                                      {!['text', 'number', 'date', 'dropdown', 'textarea', 'email', 'checkbox'].includes(field.type) && (
                                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center">
                                          <span className="text-sm text-gray-400">Field preview</span>
                                        </div>
                                      )}
                                    </div>
                                  )})}

                                </div>
                              )
                            })
                          })()}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-sm text-gray-400">
                            Drag and drop fields here
                          </p>
                        </div>
                      )}

                      {/* Add Row CTA */}
                      <div
                        data-add-row-popover
                        className={cn(
                          'mt-5 w-full py-3 border border-dashed border-gray-400 rounded-lg text-sm text-gray-700 hover:border-blue-500 hover:text-gray-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer relative',
                          dragOverSection === `${section.id}-addrow` && 'border-blue-400 bg-blue-50'
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          setAddRowPopoverSection(addRowPopoverSection === section.id ? null : section.id)
                        }}
                        onDragEnter={(e) => {
                          if (draggedField) {
                            e.preventDefault()
                            e.stopPropagation()
                            setDragOverSection(`${section.id}-addrow`)
                          }
                        }}
                        onDragOver={(e) => {
                          if (draggedField) {
                            e.preventDefault()
                            e.stopPropagation()
                            e.dataTransfer.dropEffect = 'copy'
                            setDragOverSection(`${section.id}-addrow`)
                          }
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation()
                          setDragOverSection(null)
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (draggedField) {
                            const newField: FormField = {
                              id: generateId(),
                              type: draggedField.id,
                              label: 'Untitled field',
                              colSpan: 2,
                              row: getNextRow(section.fields),  // Always add to a new row
                            }
                            setSections(sections.map(s =>
                              s.id === section.id ? { ...s, fields: [...s.fields, newField] } : s
                            ))
                            setDraggedField(null)
                            setDragOverSection(null)
                            setSelectedField({ sectionId: section.id, fieldId: newField.id })
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">Drag any field here or click to add a new field</span>

                        {/* Field Type Popover */}
                        {addRowPopoverSection === section.id && (
                          <div
                            className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-64 overflow-auto z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {categories.map((category) => {
                              const fields = fieldTypeWidgets.filter(f => f.category === category.id)
                              return (
                                <div key={category.id} className="mb-3 last:mb-0">
                                  <h4 className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5 px-1">
                                    {category.label}
                                  </h4>
                                  <div className="grid grid-cols-3 gap-1">
                                    {fields.map((fieldType) => {
                                      const FieldIcon = fieldType.icon
                                      return (
                                        <button
                                          key={fieldType.id}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const newField: FormField = {
                                              id: generateId(),
                                              type: fieldType.id,
                                              label: 'Untitled field',
                                              colSpan: 2,
                                              row: getNextRow(section.fields),  // Always add to a new row
                                            }
                                            setSections(sections.map(s =>
                                              s.id === section.id ? { ...s, fields: [...s.fields, newField] } : s
                                            ))
                                            setAddRowPopoverSection(null)
                                            setSelectedField({ sectionId: section.id, fieldId: newField.id })
                                          }}
                                          className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        >
                                          <FieldIcon className="h-3.5 w-3.5 text-gray-500" />
                                          <span className="truncate">{fieldType.label}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Add Section and Add Table CTAs - after each section */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-px bg-gray-300" />
                <button
                  onClick={() => addSection(sectionIndex)}
                  className="px-3 py-2 border border-dashed border-gray-400 rounded-md text-xs text-gray-700 hover:border-blue-500 hover:text-gray-800 hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  Add Section
                </button>
                <button
                  onClick={() => addTable(sectionIndex)}
                  className="px-3 py-2 border border-dashed border-gray-400 rounded-md text-xs text-gray-700 hover:border-green-500 hover:text-gray-800 hover:bg-green-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Table className="h-3.5 w-3.5 text-green-500" />
                  Add Table
                </button>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
            </React.Fragment>
            )})}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-72 bg-white flex flex-col">
        {selectedFieldData ? (
          <>
            {/* Header with field type and delete */}
            <PropertyPanelHeader
              icon={selectedFieldData.fieldType?.icon}
              title={selectedFieldData.fieldType?.label || 'Field'}
              onDelete={() => deleteField(selectedField!.sectionId, selectedField!.fieldId)}
            />

            {/* Tab bar - Adaptive Sliding Window */}
            <div className="p-0.5 border-b border-gray-200">
              <div className="flex bg-gray-200 p-1 gap-0.5 rounded-lg">
                {propertyTabs.map((tab, index) => {
                  const TabIcon = tab.icon
                  const isActive = activePropertyTab === tab.id
                  const selectedIndex = propertyTabs.findIndex(t => t.id === activePropertyTab)

                  // Determine if this tab should be expanded (sliding window of 3)
                  const expandStart = selectedIndex <= 2 ? 0 : selectedIndex === 3 ? 1 : 2
                  const expandEnd = expandStart + 2
                  const isExpanded = index >= expandStart && index <= expandEnd

                  // Short label for collapsed state (2 chars + "..")
                  const shortLabel = tab.label.slice(0, 2) + '..'

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePropertyTab(tab.id)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all',
                        isExpanded ? 'flex-1 basis-0 min-w-[60px] px-2' : 'px-1',
                        isActive
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-700 hover:text-gray-900'
                      )}
                    >
                      <TabIcon className={cn(isExpanded ? 'h-4 w-4' : 'h-3.5 w-3.5', isActive && 'text-blue-500')} />
                      <span className={cn(
                        'font-medium whitespace-nowrap leading-tight',
                        isExpanded ? 'text-[11px]' : 'text-[10px]'
                      )}>
                        {isExpanded ? tab.label : shortLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-4">
              {activePropertyTab === 'settings' ? (
                <div className="space-y-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Name</label>
                    <Input
                      value={selectedFieldData.field.label}
                      onChange={(e) => updateField(
                        selectedField!.sectionId,
                        selectedField!.fieldId,
                        { label: e.target.value }
                      )}
                      placeholder="Enter field name"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Field Type */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Field Type</label>
                    <Select
                      value={selectedFieldData.field.type}
                      onValueChange={(value) => updateField(
                        selectedField!.sectionId,
                        selectedField!.fieldId,
                        { type: value }
                      )}
                    >
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeWidgets.map((ft) => {
                          const FieldIcon = ft.icon
                          return (
                            <SelectItem key={ft.id} value={ft.id}>
                              <div className="flex items-center gap-1">
                                <FieldIcon className="h-3.5 w-3.5" />
                                <span className="text-xs">{ft.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Required */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Required</label>
                    <div>
                      <Switch
                        checked={selectedFieldData.field.required || false}
                        onCheckedChange={(checked) => updateField(
                          selectedField!.sectionId,
                          selectedField!.fieldId,
                          { required: checked }
                        )}
                      />
                    </div>
                  </div>

                  {/* Field ID */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Field ID</label>
                    <Input
                      value={selectedFieldData.field.id}
                      disabled
                      className="h-7 font-mono text-xs bg-gray-100"
                    />
                  </div>

                  {/* Help Text */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Help Text</label>
                    <Input
                      value={selectedFieldData.field.helpText || ''}
                      onChange={(e) => updateField(
                        selectedField!.sectionId,
                        selectedField!.fieldId,
                        { helpText: e.target.value }
                      )}
                      className="h-7"
                    />
                  </div>

                  {/* Default Value */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Default Value</label>
                    <Input
                      value={selectedFieldData.field.defaultValue || ''}
                      onChange={(e) => updateField(
                        selectedField!.sectionId,
                        selectedField!.fieldId,
                        { defaultValue: e.target.value }
                      )}
                      className="h-7"
                    />
                  </div>

                  {/* Is Computed Field */}
                  <div className="space-y-1">
                    <label className="pl-0.5 text-[11px] font-medium text-gray-700">Is this a computed field?</label>
                    <div>
                      <Switch
                        checked={selectedFieldData.field.isComputed || false}
                        onCheckedChange={(checked) => updateField(
                          selectedField!.sectionId,
                          selectedField!.fieldId,
                          { isComputed: checked }
                        )}
                      />
                    </div>
                  </div>
                </div>
              ) : activePropertyTab === 'validation' ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  {/* Illustration */}
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-500 mb-4">
                    No validations added yet
                  </p>

                  {/* Add Validation Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs px-2.5 w-28"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Validation
                  </Button>
                </div>
              ) : activePropertyTab === 'visibility' ? (
                <div className="space-y-3">
                  {/* Default Visibility Card */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Default Visibility</h4>
                    <div className="inline-flex gap-1 bg-gray-200 rounded-md p-0.5">
                      <button
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                          'bg-purple-500 text-white shadow-sm'
                        )}
                      >
                        Visible
                      </button>
                      <button
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                          'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        Hidden
                      </button>
                    </div>
                  </div>

                  {/* Add Visibility CTA */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs px-2.5 w-28"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Visibility
                  </Button>
                </div>
              ) : activePropertyTab === 'style' ? (
                <div className="space-y-3">
                  {/* Default Appearance Card */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-[13px] font-semibold text-gray-700 mb-3">Default Appearance</h4>

                    {/* Field color label */}
                    <label className="text-xs font-medium text-gray-600 block mb-2">Field color</label>

                    {/* Default option - separate row with brush icon */}
                    <div className="mb-2">
                      <button
                        onClick={() => updateField(
                          selectedField!.sectionId,
                          selectedField!.fieldId,
                          { appearance: 'default' }
                        )}
                        className={cn(
                          'w-6 h-6 rounded-full border transition-all bg-gray-900 border-gray-900 flex items-center justify-center',
                          (selectedFieldData.field.appearance || 'default') === 'default' && 'ring-2 ring-offset-1 ring-gray-400'
                        )}
                        title="Default"
                      >
                        <Paintbrush className="h-3 w-3" style={{
                          stroke: 'url(#colorfulGradient)',
                        }} />
                        <svg width="0" height="0">
                          <defs>
                            <linearGradient id="colorfulGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="25%" stopColor="#a855f7" />
                              <stop offset="50%" stopColor="#22c55e" />
                              <stop offset="75%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </button>
                    </div>

                    {/* Color options - single row */}
                    <div className="flex gap-1.5">
                      {themeColors.filter(c => c.id !== 'default').map((color) => {
                        const isSelected = selectedFieldData.field.appearance === color.id
                        return (
                          <button
                            key={color.id}
                            onClick={() => updateField(
                              selectedField!.sectionId,
                              selectedField!.fieldId,
                              { appearance: color.id }
                            )}
                            className={cn(
                              'w-6 h-6 rounded-full border transition-all',
                              isSelected && 'ring-2 ring-offset-1 ring-gray-400'
                            )}
                            style={{
                              backgroundColor: color.value || undefined,
                              borderColor: color.value || undefined
                            }}
                            title={color.label}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Add Style CTA */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs px-2.5 w-28"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Style
                  </Button>
                </div>
              ) : activePropertyTab === 'events' ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  {/* Illustration */}
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-500 mb-4">
                    No events added yet
                  </p>

                  {/* Add Event Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs px-2.5 w-28"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Event
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <PropertyPanelHeader title="Properties" />
            <div className="flex-1 overflow-auto p-4">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500">
                  Select a field to view its properties
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
