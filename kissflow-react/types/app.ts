import { ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

export interface AppData {
  id: string
  name: string
  description: string
  icon: ComponentType<LucideProps>
  iconBg: string
  createdBy: string
  tabs?: string[]
}

export type ViewType = 'table' | 'sheet' | 'gallery' | 'kanban' | 'timeline' | 'calendar'
