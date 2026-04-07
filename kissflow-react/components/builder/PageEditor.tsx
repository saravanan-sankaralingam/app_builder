'use client'

import { useState } from 'react'
import {
  LayoutGrid,
  BookOpen,
  Layers,
  Square,
  Type,
  RectangleHorizontal,
  Star,
  Minus,
  ChevronRight,
  CreditCard,
  Activity,
  Image,
  Link,
  Frame,
  FileText,
  PanelTop,
  LayoutList,
  Repeat,
  Maximize2,
  Puzzle,
  ClipboardList,
  Table,
  Sheet,
  Columns,
  Grid3x3,
  List,
  Clock,
  BarChart3,
  Table2,
  Gauge,
  LucideIcon,
  Settings,
  Eye,
  Palette,
  Zap,
  Plus,
  Inbox,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  StretchVertical,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalSpaceBetween,
  AlignVerticalSpaceAround,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PropertyPanelHeader } from './PropertyPanelHeader'
import { PropertySectionTitle } from './PropertySectionTitle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'

// Widget types
interface Widget {
  id: string
  name: string
  icon: LucideIcon
}

interface WidgetCategory {
  id: string
  name: string
  widgets: Widget[]
  iconBg: string
  iconColor: string
}

// Widget categories data
const widgetCategories: WidgetCategory[] = [
  {
    id: 'general',
    name: 'General',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    widgets: [
      { id: 'container', name: 'Container', icon: Square },
      { id: 'label', name: 'Label', icon: Type },
      { id: 'button', name: 'Button', icon: RectangleHorizontal },
      { id: 'icon', name: 'Icon', icon: Star },
      { id: 'divider', name: 'Divider', icon: Minus },
      { id: 'breadcrumb', name: 'Breadcrumb', icon: ChevronRight },
      { id: 'card', name: 'Card', icon: CreditCard },
      { id: 'progress-bar', name: 'Progress bar', icon: Activity },
      { id: 'image', name: 'Image', icon: Image },
      { id: 'hyperlink', name: 'Hyperlink', icon: Link },
      { id: 'iframe', name: 'Iframe', icon: Frame },
      { id: 'richtext', name: 'Richtext', icon: FileText },
      { id: 'tab', name: 'Tab', icon: PanelTop },
      { id: 'master-details', name: 'Master details', icon: LayoutList },
      { id: 'repeater', name: 'Repeater', icon: Repeat },
      { id: 'popup', name: 'Popup', icon: Maximize2 },
      { id: 'custom-component', name: 'Custom component', icon: Puzzle },
    ],
  },
  {
    id: 'views',
    name: 'Views',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    widgets: [
      { id: 'form', name: 'Form', icon: ClipboardList },
      { id: 'table', name: 'Table', icon: Table },
      { id: 'gallery', name: 'Gallery', icon: LayoutGrid },
      { id: 'sheet', name: 'Sheet', icon: Sheet },
      { id: 'kanban', name: 'Kanban', icon: Columns },
      { id: 'matrix', name: 'Matrix', icon: Grid3x3 },
      { id: 'list', name: 'List', icon: List },
      { id: 'timeline', name: 'Timeline', icon: Clock },
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    widgets: [
      { id: 'report-table', name: 'Table', icon: Table },
      { id: 'chart', name: 'Chart', icon: BarChart3 },
      { id: 'report-card', name: 'Card', icon: CreditCard },
      { id: 'pivot', name: 'Pivot', icon: Table2 },
      { id: 'metrics', name: 'Metrics', icon: Gauge },
    ],
  },
]

interface PageEditorProps {
  pageId: string
  pageName: string
}

type WidgetTab = 'components' | 'library' | 'structure'
type PropertyTab = 'settings' | 'visibility' | 'style' | 'events'

const propertyTabs: { id: PropertyTab; label: string; icon: LucideIcon }[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'visibility', label: 'Visibility', icon: Eye },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'events', label: 'Events', icon: Zap },
]

type LayoutStyle = 'flex' | 'grid'
type BackgroundType = 'color' | 'image'
type Direction = 'horizontal' | 'vertical'
type AlignOption = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type JustifyOption = 'start' | 'center' | 'end' | 'space-between' | 'space-around'
type WrapOption = 'nowrap' | 'wrap'
type WrapAlignOption = 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around'
type OverflowOption = 'auto' | 'hidden' | 'visible'
type PaddingMode = 'all' | 'individual'
type MarginMode = 'all' | 'individual'
type BorderMode = 'all' | 'individual'
type BorderStyle = 'solid' | 'dotted' | 'dashed' | 'double' | 'none'
type BorderRadiusMode = 'all' | 'individual'

export function PageEditor({ pageId, pageName }: PageEditorProps) {
  const [activeWidgetTab, setActiveWidgetTab] = useState<WidgetTab>('components')
  const [activePropertyTab, setActivePropertyTab] = useState<PropertyTab>('settings')

  // Style tab state
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('flex')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('color')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [backgroundColorName, setBackgroundColorName] = useState('White')
  const [direction, setDirection] = useState<Direction>('horizontal')
  const [directionReverse, setDirectionReverse] = useState(false)
  const [align, setAlign] = useState<AlignOption>('start')
  const [justify, setJustify] = useState<JustifyOption>('start')
  const [rowGap, setRowGap] = useState(0)
  const [columnGap, setColumnGap] = useState(0)
  const [childWrap, setChildWrap] = useState<WrapOption>('nowrap')
  const [wrapReverse, setWrapReverse] = useState(false)
  const [wrapAlign, setWrapAlign] = useState<WrapAlignOption>('start')

  // Sizing state
  const [width, setWidth] = useState<number | string>(100)
  const [height, setHeight] = useState<number | string>(100)
  const [minWidth, setMinWidth] = useState<number>(0)
  const [minHeight, setMinHeight] = useState<number>(0)
  const [maxWidth, setMaxWidth] = useState<number>(0)
  const [maxHeight, setMaxHeight] = useState<number>(0)
  const [overflow, setOverflow] = useState<OverflowOption>('auto')

  // Padding state
  const [paddingMode, setPaddingMode] = useState<PaddingMode>('all')
  const [paddingAll, setPaddingAll] = useState<number>(10)
  const [paddingTop, setPaddingTop] = useState<number>(10)
  const [paddingRight, setPaddingRight] = useState<number>(10)
  const [paddingBottom, setPaddingBottom] = useState<number>(10)
  const [paddingLeft, setPaddingLeft] = useState<number>(10)

  // Margin state
  const [marginMode, setMarginMode] = useState<MarginMode>('all')
  const [marginAll, setMarginAll] = useState<number>(0)
  const [marginTop, setMarginTop] = useState<number>(0)
  const [marginRight, setMarginRight] = useState<number>(0)
  const [marginBottom, setMarginBottom] = useState<number>(0)
  const [marginLeft, setMarginLeft] = useState<number>(0)

  // Border state
  const [borderMode, setBorderMode] = useState<BorderMode>('all')
  const [borderAll, setBorderAll] = useState<number>(0)
  const [borderTop, setBorderTop] = useState<number>(0)
  const [borderRight, setBorderRight] = useState<number>(0)
  const [borderBottom, setBorderBottom] = useState<number>(0)
  const [borderLeft, setBorderLeft] = useState<number>(0)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('solid')
  const [borderColor, setBorderColor] = useState('#000000')
  const [borderColorName, setBorderColorName] = useState('Black')

  // Border Radius state
  const [borderRadiusMode, setBorderRadiusMode] = useState<BorderRadiusMode>('all')
  const [borderRadiusAll, setBorderRadiusAll] = useState<number>(0)
  const [borderRadiusTopLeft, setBorderRadiusTopLeft] = useState<number>(0)
  const [borderRadiusTopRight, setBorderRadiusTopRight] = useState<number>(0)
  const [borderRadiusBottomRight, setBorderRadiusBottomRight] = useState<number>(0)
  const [borderRadiusBottomLeft, setBorderRadiusBottomLeft] = useState<number>(0)

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Left - Widget Panel */}
      <div className="w-[240px] border-r border-gray-200 bg-white flex flex-col overflow-hidden">
        {/* Panel Header with Tab Bar */}
        <div className="px-2 py-2 border-b border-gray-200">
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveWidgetTab('components')}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeWidgetTab === 'components'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Widgets
            </button>
            <button
              onClick={() => setActiveWidgetTab('library')}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeWidgetTab === 'library'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <BookOpen className="h-4 w-4" />
              Library
            </button>
            <button
              onClick={() => setActiveWidgetTab('structure')}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeWidgetTab === 'structure'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Layers className="h-4 w-4" />
              Structure
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-3">
          {activeWidgetTab === 'components' && (
            <div className="space-y-4">
              {widgetCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {category.widgets.map((widget) => {
                      const Icon = widget.icon
                      return (
                        <button
                          key={widget.id}
                          className="flex flex-col items-center justify-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
                            category.iconBg
                          )}>
                            <Icon className={cn('h-5 w-5', category.iconColor)} />
                          </div>
                          <span className="text-[11px] text-gray-600 text-center leading-tight line-clamp-2">
                            {widget.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeWidgetTab === 'library' && (
            <p className="text-xs text-gray-400">Library items coming soon...</p>
          )}
          {activeWidgetTab === 'structure' && (
            <p className="text-xs text-gray-400">Page structure coming soon...</p>
          )}
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 p-2">
        <div className="h-full bg-white rounded shadow-sm relative border border-sky-400">
          {/* Selection label badge - inside for Body */}
          <div className="absolute top-0.5 left-0.5 px-2 py-0.5 bg-sky-400 rounded text-[10px] font-medium text-white">
            Body
          </div>
          {/* Canvas content */}
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">Drop widgets here</p>
          </div>
        </div>
      </div>

      {/* Right - Properties Panel */}
      <div className="w-[260px] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <PropertyPanelHeader icon={Square} title="Body" />

        {/* Tab bar */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
            {propertyTabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activePropertyTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePropertyTab(tab.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-md transition-all',
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="text-[11px] font-medium whitespace-nowrap leading-tight">
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {activePropertyTab === 'settings' && (
            <div>
              {/* Page Parameters Section */}
              <div className="flex items-center justify-between px-3 py-2">
                <PropertySectionTitle>Page Parameters</PropertySectionTitle>
                <button className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="pl-3 pr-2 py-4">
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Inbox className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Page parameters will appear here</p>
                </div>
              </div>

              {/* Separator - full width */}
              <div className="border-b border-gray-200" />

              {/* Local Variables Section */}
              <div className="flex items-center justify-between px-3 py-2">
                <PropertySectionTitle>Local Variables</PropertySectionTitle>
                <button className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="pl-3 pr-2 py-4">
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Inbox className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Local variables will appear here</p>
                </div>
              </div>
            </div>
          )}
          {activePropertyTab === 'visibility' && (
            <div className="p-4 space-y-3">
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
              <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Visibility
              </button>
            </div>
          )}
          {activePropertyTab === 'style' && (
            <div>
              {/* Layout Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Layout</PropertySectionTitle>
              </div>
              <div className="pl-3 pr-2 pb-3 space-y-3">
                {/* Layout Style */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-500">Layout style</label>
                  <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setLayoutStyle('flex')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        layoutStyle === 'flex'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Flex
                    </button>
                    <button
                      onClick={() => setLayoutStyle('grid')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        layoutStyle === 'grid'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Grid
                    </button>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Background Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Background</PropertySectionTitle>
              </div>
              <div className="pl-3 pr-2 pb-3 space-y-3">
                {/* Background Type */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-500">Background type</label>
                  <Select value={backgroundType} onValueChange={(value) => setBackgroundType(value as BackgroundType)}>
                    <SelectTrigger size="sm" className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Color/Image */}
                {backgroundType === 'color' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-gray-500">Background</label>
                    <ColorPicker
                      value={backgroundColor}
                      colorName={backgroundColorName}
                      onChange={(value, name) => {
                        setBackgroundColor(value)
                        setBackgroundColorName(name)
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-gray-500">Select image</label>
                    <button className="w-full h-8 px-3 text-xs font-medium text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Select image
                    </button>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Alignment Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Alignment</PropertySectionTitle>
              </div>
              <div className="pl-3 pr-2 pb-3 space-y-3">
                {/* Direction */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-500">Direction</label>
                  <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setDirection('horizontal')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        direction === 'horizontal'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Horizontal
                    </button>
                    <button
                      onClick={() => setDirection('vertical')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        direction === 'vertical'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Vertical
                    </button>
                  </div>
                </div>

                {/* Direction Reverse */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Direction reverse</label>
                  <Switch
                    checked={directionReverse}
                    onCheckedChange={setDirectionReverse}
                  />
                </div>

                {/* Align */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Align</label>
                  <div className="inline-flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    {[
                      { value: 'start', icon: AlignStartVertical, label: 'Start' },
                      { value: 'center', icon: AlignCenterVertical, label: 'Center' },
                      { value: 'end', icon: AlignEndVertical, label: 'End' },
                      { value: 'stretch', icon: StretchVertical, label: 'Stretch' },
                      { value: 'baseline', icon: Type, label: 'Baseline' },
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => setAlign(option.value as AlignOption)}
                          title={option.label}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            align === option.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Justify */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Justify</label>
                  <div className="inline-flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    {[
                      { value: 'start', icon: AlignVerticalJustifyStart, label: 'Start' },
                      { value: 'center', icon: AlignVerticalJustifyCenter, label: 'Center' },
                      { value: 'end', icon: AlignVerticalJustifyEnd, label: 'End' },
                      { value: 'space-between', icon: AlignVerticalSpaceBetween, label: 'Space between' },
                      { value: 'space-around', icon: AlignVerticalSpaceAround, label: 'Space around' },
                    ].map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => setJustify(option.value as JustifyOption)}
                          title={option.label}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            justify === option.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Row Gap */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Row gap</label>
                  <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                    <Input
                      type="number"
                      value={rowGap}
                      onChange={(e) => setRowGap(Number(e.target.value))}
                      min={0}
                      className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                  </div>
                </div>

                {/* Column Gap */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Column gap</label>
                  <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                    <Input
                      type="number"
                      value={columnGap}
                      onChange={(e) => setColumnGap(Number(e.target.value))}
                      min={0}
                      className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                  </div>
                </div>

                {/* Separator within Alignment section */}
                <div className="border-b border-gray-200" />

                {/* Child */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-500">Child</label>
                  <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setChildWrap('nowrap')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        childWrap === 'nowrap'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      No wrap
                    </button>
                    <button
                      onClick={() => setChildWrap('wrap')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        childWrap === 'wrap'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Wrap
                    </button>
                  </div>
                </div>

                {/* Show Wrap options only when Wrap is selected */}
                {childWrap === 'wrap' && (
                  <>
                    {/* Wrap Reverse */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-gray-500">Wrap reverse</label>
                      <Switch
                        checked={wrapReverse}
                        onCheckedChange={setWrapReverse}
                      />
                    </div>

                    {/* Wrap Align */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-gray-500">Align</label>
                      <div className="inline-flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                        {[
                          { value: 'start', icon: AlignStartVertical, label: 'Start' },
                          { value: 'center', icon: AlignCenterVertical, label: 'Center' },
                          { value: 'end', icon: AlignEndVertical, label: 'End' },
                          { value: 'stretch', icon: StretchVertical, label: 'Stretch' },
                          { value: 'space-between', icon: AlignVerticalSpaceBetween, label: 'Space between' },
                          { value: 'space-around', icon: AlignVerticalSpaceAround, label: 'Space around' },
                        ].map((option) => {
                          const Icon = option.icon
                          return (
                            <button
                              key={option.value}
                              onClick={() => setWrapAlign(option.value as WrapAlignOption)}
                              title={option.label}
                              className={cn(
                                'p-1.5 rounded transition-colors',
                                wrapAlign === option.value
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Sizing Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Sizing</PropertySectionTitle>
              </div>
              <div className="px-3 pb-3 space-y-3">
                {/* Width & Height Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Width */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Width</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof width === 'number' ? width : ''}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Height</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof height === 'number' ? height : ''}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Min Width & Min Height Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Min Width */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Min width</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof minWidth === 'number' ? minWidth : ''}
                        onChange={(e) => setMinWidth(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>

                  {/* Min Height */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Min height</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof minHeight === 'number' ? minHeight : ''}
                        onChange={(e) => setMinHeight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Max Width & Max Height Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Max Width */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Max width</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof maxWidth === 'number' ? maxWidth : ''}
                        onChange={(e) => setMaxWidth(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>

                  {/* Max Height */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500">Max height</label>
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={typeof maxHeight === 'number' ? maxHeight : ''}
                        onChange={(e) => setMaxHeight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Overflow */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-500">Overflow</label>
                  <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setOverflow('auto')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        overflow === 'auto'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setOverflow('hidden')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        overflow === 'hidden'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Hidden
                    </button>
                    <button
                      onClick={() => setOverflow('visible')}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
                        overflow === 'visible'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      Visible
                    </button>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Padding Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Padding</PropertySectionTitle>
              </div>
              <div className="px-3 pb-3 space-y-3">
                {/* Padding Control */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Padding</label>
                  <div className="flex items-center gap-2">
                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setPaddingMode('all')}
                        title="All sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          paddingMode === 'all'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="4" y="4" width="6" height="6" rx="0.5" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPaddingMode('individual')}
                        title="Individual sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          paddingMode === 'individual'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </button>
                    </div>

                    {/* Value Input */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={paddingAll}
                        onChange={(e) => setPaddingAll(Number(e.target.value))}
                        min={0}
                        className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Individual Padding Controls */}
                {paddingMode === 'individual' && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={paddingTop}
                        onChange={(e) => setPaddingTop(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Right */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="13" y1="3" x2="13" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={paddingRight}
                        onChange={(e) => setPaddingRight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={paddingBottom}
                        onChange={(e) => setPaddingBottom(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Left */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="1" y1="3" x2="1" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={paddingLeft}
                        onChange={(e) => setPaddingLeft(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Margin Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Margin</PropertySectionTitle>
              </div>
              <div className="px-3 pb-3 space-y-3">
                {/* Margin Control */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Margin</label>
                  <div className="flex items-center gap-2">
                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setMarginMode('all')}
                        title="All sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          marginMode === 'all'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="4" y="4" width="6" height="6" rx="0.5" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setMarginMode('individual')}
                        title="Individual sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          marginMode === 'individual'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </button>
                    </div>

                    {/* Value Input */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={marginAll}
                        onChange={(e) => setMarginAll(Number(e.target.value))}
                        min={0}
                        className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Individual Margin Controls */}
                {marginMode === 'individual' && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={marginTop}
                        onChange={(e) => setMarginTop(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Right */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="13" y1="3" x2="13" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={marginRight}
                        onChange={(e) => setMarginRight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={marginBottom}
                        onChange={(e) => setMarginBottom(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Left */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="1" y1="3" x2="1" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={marginLeft}
                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Border Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Border</PropertySectionTitle>
              </div>
              <div className="px-3 pb-3 space-y-3">
                {/* Border Control */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Border</label>
                  <div className="flex items-center gap-2">
                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setBorderMode('all')}
                        title="All sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          borderMode === 'all'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="4" y="4" width="6" height="6" rx="0.5" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setBorderMode('individual')}
                        title="Individual sides"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          borderMode === 'individual'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </button>
                    </div>

                    {/* Value Input */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={borderAll}
                        onChange={(e) => setBorderAll(Number(e.target.value))}
                        min={0}
                        className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Individual Border Controls */}
                {borderMode === 'individual' && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="1" x2="11" y2="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderTop}
                        onChange={(e) => setBorderTop(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Right */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="13" y1="3" x2="13" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderRight}
                        onChange={(e) => setBorderRight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="3" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderBottom}
                        onChange={(e) => setBorderBottom(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Left */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <line x1="1" y1="3" x2="1" y2="11" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderLeft}
                        onChange={(e) => setBorderLeft(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                )}

                {/* Border Style */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500">Border style</label>
                  <Select value={borderStyle} onValueChange={(value) => setBorderStyle(value as BorderStyle)}>
                    <SelectTrigger size="sm" className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500">Border color</label>
                  <ColorPicker
                    value={borderColor}
                    colorName={borderColorName}
                    onChange={(value, name) => {
                      setBorderColor(value)
                      setBorderColorName(name)
                    }}
                  />
                </div>
              </div>

              {/* Separator */}
              <div className="border-b border-gray-200" />

              {/* Border Radius Section */}
              <div className="flex items-center px-3 py-2">
                <PropertySectionTitle>Border Radius</PropertySectionTitle>
              </div>
              <div className="px-3 pb-3 space-y-3">
                {/* Border Radius Control */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-500">Radius</label>
                  <div className="flex items-center gap-2">
                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setBorderRadiusMode('all')}
                        title="All corners"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          borderRadiusMode === 'all'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setBorderRadiusMode('individual')}
                        title="Individual corners"
                        className={cn(
                          'p-1 rounded border transition-colors',
                          borderRadiusMode === 'individual'
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
                          <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </button>
                    </div>

                    {/* Value Input */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <Input
                        type="number"
                        value={borderRadiusAll}
                        onChange={(e) => setBorderRadiusAll(Number(e.target.value))}
                        min={0}
                        className="w-16 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                </div>

                {/* Individual Border Radius Controls */}
                {borderRadiusMode === 'individual' && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Top Left */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <path d="M1 13V4C1 2.34315 2.34315 1 4 1H13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          <path d="M1 8C1 4.13401 4.13401 1 8 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderRadiusTopLeft}
                        onChange={(e) => setBorderRadiusTopLeft(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Top Right */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <path d="M13 13V4C13 2.34315 11.6569 1 10 1H1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          <path d="M13 8C13 4.13401 9.86599 1 6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderRadiusTopRight}
                        onChange={(e) => setBorderRadiusTopRight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Bottom Left */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <path d="M1 1V10C1 11.6569 2.34315 13 4 13H13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          <path d="M1 6C1 9.86599 4.13401 13 8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderRadiusBottomLeft}
                        onChange={(e) => setBorderRadiusBottomLeft(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>

                    {/* Bottom Right */}
                    <div className="flex items-center h-8 border border-gray-200 rounded-md overflow-hidden">
                      <span className="px-2 h-full flex items-center border-r border-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
                          <path d="M13 1V10C13 11.6569 11.6569 13 10 13H1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          <path d="M13 6C13 9.86599 9.86599 13 6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                      <Input
                        type="number"
                        value={borderRadiusBottomRight}
                        onChange={(e) => setBorderRadiusBottomRight(Number(e.target.value))}
                        min={0}
                        className="flex-1 h-full text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 h-full flex items-center border-l border-gray-200">px</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activePropertyTab === 'events' && (
            <p className="text-xs text-gray-400">Events coming soon...</p>
          )}
        </div>
      </div>
    </div>
  )
}
