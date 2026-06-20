/**
 * Mock data for the Platform Home page. All values are static fixtures —
 * replace with real API responses when the backend exists.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ClipboardList,
  Star,
  Tag,
  LayoutGrid,
  Sparkles,
  RefreshCcw,
  User,
  FileText,
  GraduationCap,
  Receipt,
  Building2,
  TrendingUp,
  CalendarDays,
  Briefcase,
} from 'lucide-react'

// ─── Items in queue ────────────────────────────────────────────────────────
// Work items assigned to the user, aggregated across all process / board apps
// the user has access to. Currently mocked.

export type QueueStatus =
  | 'New'
  | 'In progress'
  | 'Research'
  | 'Backlog'
  | 'Design'

export interface QueueItem {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  flowApp: string
  from: { initials: string; color: string }
  status: QueueStatus
  dueBy: string | null // ISO date or null for "—"
}

export const queueItems: QueueItem[] = [
  {
    id: 'q1',
    title: 'Analytics — Reports',
    icon: BarChart3,
    iconColor: 'text-purple-500',
    flowApp: 'KF App UI Bugs',
    from: { initials: 'AR', color: 'bg-amber-500' },
    status: 'New',
    dueBy: null,
  },
  {
    id: 'q2',
    title: 'Analytics — dateve…',
    icon: BarChart3,
    iconColor: 'text-purple-500',
    flowApp: 'KF App UI Bugs',
    from: { initials: 'AR', color: 'bg-amber-500' },
    status: 'New',
    dueBy: null,
  },
  {
    id: 'q3',
    title: 'Builder Toolbar & le…',
    icon: ClipboardList,
    iconColor: 'text-purple-500',
    flowApp: 'KF App UI Bugs',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'New',
    dueBy: null,
  },
  {
    id: 'q4',
    title: 'Rating Widget',
    icon: Star,
    iconColor: 'text-purple-500',
    flowApp: 'Design team tasks',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'In progress',
    dueBy: null,
  },
  {
    id: 'q5',
    title: 'Tag Widget',
    icon: Tag,
    iconColor: 'text-purple-500',
    flowApp: 'Design team tasks',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'Research',
    dueBy: null,
  },
  {
    id: 'q6',
    title: 'App Widget — Defa…',
    icon: LayoutGrid,
    iconColor: 'text-purple-500',
    flowApp: 'Design team tasks',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'Research',
    dueBy: null,
  },
  {
    id: 'q7',
    title: '[ New Feature ][ A…',
    icon: ClipboardList,
    iconColor: 'text-purple-500',
    flowApp: 'Kissflow Product Fe…',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'Backlog',
    dueBy: null,
  },
  {
    id: 'q8',
    title: '[ UX improvements…',
    icon: ClipboardList,
    iconColor: 'text-purple-500',
    flowApp: 'Kissflow Product Fe…',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'Backlog',
    dueBy: null,
  },
  {
    id: 'q9',
    title: 'Avatar Widget',
    icon: User,
    iconColor: 'text-purple-500',
    flowApp: 'Design team tasks',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'Design',
    dueBy: null,
  },
  {
    id: 'q10',
    title: 'Avatar Widget',
    icon: User,
    iconColor: 'text-purple-500',
    flowApp: 'Design team tasks',
    from: { initials: 'SS', color: 'bg-blue-500' },
    status: 'In progress',
    dueBy: null,
  },
]

export const queueTotalCount = 99 // intentionally higher than the array length to show the "(99)" badge

// ─── My to-do ──────────────────────────────────────────────────────────────
// Personal todos. For now: empty, to demonstrate the empty state.

export interface TodoItem {
  id: string
  title: string
  done: boolean
}

export const todoItems: TodoItem[] = []
export const todoTotalCount = 0

// ─── Items created by me ───────────────────────────────────────────────────

export type CreatedItemStatus =
  | 'In progress'
  | 'Research'
  | 'Default State'
  | 'Delivered Handoff'

export interface CreatedItem {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  status: CreatedItemStatus
  createdBy: string
}

export const createdItems: CreatedItem[] = [
  {
    id: 'c1',
    title: 'Rating Widget',
    icon: Star,
    iconColor: 'text-purple-500',
    status: 'In progress',
    createdBy: 'Saravanan Sankaralingam',
  },
  {
    id: 'c2',
    title: 'Tag Widget',
    icon: Tag,
    iconColor: 'text-purple-500',
    status: 'Research',
    createdBy: 'Saravanan Sankaralingam',
  },
  {
    id: 'c3',
    title: 'App Widget — Default State',
    icon: LayoutGrid,
    iconColor: 'text-purple-500',
    status: 'In progress',
    createdBy: 'Saravanan Sankaralingam',
  },
  {
    id: 'c4',
    title: 'Avatar Widget',
    icon: User,
    iconColor: 'text-purple-500',
    status: 'In progress',
    createdBy: 'Saravanan Sankaralingam',
  },
  {
    id: 'c5',
    title: 'AI-Powered — Custom Component',
    icon: Sparkles,
    iconColor: 'text-purple-500',
    status: 'Delivered Handoff',
    createdBy: 'Saravanan Sankaralingam',
  },
  {
    id: 'c6',
    title: 'App Builder UI Refresh',
    icon: RefreshCcw,
    iconColor: 'text-purple-500',
    status: 'In progress',
    createdBy: 'Saravanan Sankaralingam',
  },
]

export const createdTotalCount = 21

// ─── Tagged comments ───────────────────────────────────────────────────────

export interface TaggedComment {
  id: string
  author: { name: string; initials: string; color: string }
  timestamp: string // human-readable
  message: string
  linkedItem: { code: string; label: string }
}

export const taggedComments: TaggedComment[] = [
  {
    id: 't1',
    author: { name: 'Moshal Fathima', initials: 'MF', color: 'bg-pink-500' },
    timestamp: '14/05/2024, 05:50',
    message:
      '@Saravanan Sankaralingam May I know if the fix is moved as it’s already in overdue',
    linkedItem: { code: 'KFA-12081', label: '4.0 Product Issues' },
  },
  {
    id: 't2',
    author: { name: 'Karthik B.', initials: 'KB', color: 'bg-amber-500' },
    timestamp: '16/05/2024, 11:30',
    message:
      '@Mohal Fathima Fix moved to PROD, kindly check. CC @Abdul Reginraan H @Saravanan Sankaralingam',
    linkedItem: { code: 'KFA-12081', label: '4.0 Product Issues' },
  },
  {
    id: 't3',
    author: { name: 'Selvam Sankaran', initials: 'SS', color: 'bg-blue-500' },
    timestamp: '06/01/2023, 13:30',
    message:
      'Based on our discussion @Saravanan Sankaralingam @WiseRax, @Abdul Reginraan H it was decided to delete…',
    linkedItem: { code: 'APPT-0028', label: 'App Board' },
  },
  {
    id: 't4',
    author: {
      name: 'Abdul Reghmaan K',
      initials: 'AR',
      color: 'bg-emerald-500',
    },
    timestamp: '03/07/2024, 13:48',
    message:
      'Update: Advanced columns design heart modified and given for design approval. cc: @Saravanan…',
    linkedItem: { code: '', label: '' },
  },
]

// ─── Recently accessed apps ────────────────────────────────────────────────

export interface RecentApp {
  id: string
  name: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  meta?: string
}

export const recentApps: RecentApp[] = [
  {
    id: 'r1',
    name: '4.0 Product Issues',
    icon: ClipboardList,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    meta: '2 weeks ago',
  },
  {
    id: 'r2',
    name: 'Form & App — Task Workflo…',
    icon: FileText,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    meta: '2 weeks ago',
  },
  {
    id: 'r3',
    name: 'Quarterly Feedback',
    icon: TrendingUp,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    meta: '2 weeks ago',
  },
  {
    id: 'r4',
    name: 'Leave Management',
    icon: CalendarDays,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    meta: '2 weeks ago',
  },
  {
    id: 'r5',
    name: 'Performance Management S…',
    icon: BarChart3,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    meta: '2 weeks ago',
  },
  {
    id: 'r6',
    name: 'Design team tasks',
    icon: Briefcase,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    meta: '3 weeks ago',
  },
  {
    id: 'r7',
    name: 'Test Management',
    icon: GraduationCap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    meta: '3 weeks ago',
  },
  {
    id: 'r8',
    name: 'ExpenseDate Nexus (E2N)',
    icon: Receipt,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    meta: '3 weeks ago',
  },
  {
    id: 'r9',
    name: 'App Board',
    icon: LayoutGrid,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    meta: '3 weeks ago',
  },
  {
    id: 'r10',
    name: 'KF Product UI Issues/Bug',
    icon: Building2,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    meta: '3 weeks ago',
  },
]
