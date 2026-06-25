import { ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

export const APP_GROUP_TYPES = ['Application', 'Process', 'Board', 'Dataset', 'List'] as const
export type AppGroupType = (typeof APP_GROUP_TYPES)[number]

export interface AppData {
  id: string
  name: string
  description: string
  icon: ComponentType<LucideProps>
  iconBg: string
  createdBy: string
  type?: AppGroupType
  tabs?: string[]
}

export type ViewType = 'table' | 'sheet' | 'gallery' | 'kanban' | 'timeline' | 'calendar'
