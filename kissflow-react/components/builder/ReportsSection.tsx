'use client'

import {
  ClipboardList,
  LayoutGrid,
  Workflow,
  Table as TableIcon,
  BarChart3,
  Sigma,
  CreditCard,
} from 'lucide-react'

type EntityType = 'Data Form' | 'Board' | 'Process'
export type ReportType = 'Table' | 'Chart' | 'Pivot' | 'Card'
export type ChartSubtype =
  | 'Area'
  | 'Stacked Area'
  | 'Horizontal Bar'
  | 'Vertical Bar'
  | 'Stacked Horizontal Bar'
  | 'Stacked Vertical Bar'
  | '100% Stacked Vertical Bar'
  | '100% Stacked Horizontal Bar'
  | 'Line'
  | 'Combo'
  | 'Scatter'
  | 'Pie'
  | 'Doughnut'

interface Entity {
  id: string
  name: string
  type: EntityType
}

export interface Report {
  entityId: string
  name: string
  type: ReportType
  chartSubtype?: ChartSubtype
  description?: string
}

function getEntityTypeIcon(type: EntityType) {
  switch (type) {
    case 'Data Form':
      return { icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'Board':
      return { icon: LayoutGrid, color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'Process':
      return { icon: Workflow, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  }
}

export function getReportTypeIcon(type: ReportType) {
  switch (type) {
    case 'Table': return { icon: TableIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'Chart': return { icon: BarChart3, color: 'text-indigo-600', bgColor: 'bg-indigo-50' }
    case 'Pivot': return { icon: Sigma, color: 'text-amber-600', bgColor: 'bg-amber-50' }
    case 'Card': return { icon: CreditCard, color: 'text-pink-600', bgColor: 'bg-pink-50' }
  }
}

interface ReportsSectionProps {
  entities: Entity[]
  reports: Report[]
  focusedReport?: { entityId: string; reportName: string } | null
  hideHeader?: boolean
}

export function ReportsSection({ entities, reports, focusedReport, hideHeader }: ReportsSectionProps) {
  if (focusedReport) {
    const entity = entities.find((e) => e.id === focusedReport.entityId)
    const report = reports.find(
      (r) => r.entityId === focusedReport.entityId && r.name === focusedReport.reportName,
    )
    if (!entity || !report) {
      return <p className="text-[13px] text-gray-500">Report not found.</p>
    }
    return <FocusedReportDetail entity={entity} report={report} />
  }

  return (
    <div>
      {!hideHeader && (
        <>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-[13px] text-gray-600 mb-4">
            Reports defined for each data entity. Each report falls into one of four categories: Table, Chart, Pivot, or Card.
          </p>
        </>
      )}
      <div className="space-y-6">
        {entities.map((entity) => {
          const entityReports = reports.filter((r) => r.entityId === entity.id)
          if (entityReports.length === 0) return null
          return <EntityReportsGroup key={entity.id} entity={entity} reports={entityReports} />
        })}
      </div>
    </div>
  )
}

function FocusedReportDetail({ entity, report }: { entity: Entity; report: Report }) {
  const entityMeta = getEntityTypeIcon(entity.type)
  const EntityIcon = entityMeta.icon
  const { icon: ReportIcon, color: reportColor, bgColor: reportBg } = getReportTypeIcon(report.type)
  return (
    <div>
      {/* Entity context */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`${entityMeta.bgColor} rounded p-1`}>
          <EntityIcon className={`h-3.5 w-3.5 ${entityMeta.color}`} />
        </div>
        <span className="text-[12px] text-gray-600">{entity.name}</span>
        <span className="text-[11px] text-gray-400">·</span>
        <span className="text-[11px] text-gray-500">{entity.type}</span>
      </div>

      {/* Report card */}
      <div className="border border-gray-200 rounded-lg px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className={`${reportBg} rounded p-1`}>
            <ReportIcon className={`h-3.5 w-3.5 ${reportColor}`} />
          </div>
          <h4 className="text-[13px] font-semibold text-gray-900">{report.name}</h4>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded">
            {report.type}
          </span>
          {report.chartSubtype && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 rounded">
              {report.chartSubtype}
            </span>
          )}
        </div>

        {report.description && (
          <p className="text-[12.5px] text-gray-700 leading-relaxed mb-3 mt-2">
            {report.description}
          </p>
        )}

        <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-[12px] mt-3">
          <dt className="text-gray-500 font-medium">Source entity</dt>
          <dd className="text-gray-800">{entity.name} ({entity.type})</dd>

          <dt className="text-gray-500 font-medium">Category</dt>
          <dd className="text-gray-800">{report.type}</dd>

          {report.chartSubtype && (
            <>
              <dt className="text-gray-500 font-medium">Chart sub-type</dt>
              <dd className="text-gray-800">{report.chartSubtype}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}

function EntityReportsGroup({ entity, reports }: { entity: Entity; reports: Report[] }) {
  const { icon: EntityIcon, color, bgColor } = getEntityTypeIcon(entity.type)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${bgColor} rounded p-1`}>
            <EntityIcon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{entity.name}</h3>
          <span className="text-[11px] text-gray-500">{entity.type}</span>
        </div>
        <span className="text-[11px] text-gray-500">{reports.length} reports</span>
      </div>
      <div className="divide-y divide-gray-100">
        {reports.map((report) => (
          <ReportSimpleRow key={`${report.entityId}-${report.name}`} report={report} />
        ))}
      </div>
    </div>
  )
}

function ReportSimpleRow({ report }: { report: Report }) {
  const { icon: ReportIcon, color, bgColor } = getReportTypeIcon(report.type)
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className={`${bgColor} rounded p-1`}>
          <ReportIcon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <span className="text-[13px] text-gray-900">{report.name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {report.chartSubtype && (
          <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
            {report.chartSubtype}
          </span>
        )}
        <span className="text-[11px] font-medium text-gray-500">{report.type}</span>
      </div>
    </div>
  )
}
