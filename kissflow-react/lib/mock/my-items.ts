/**
 * Mock data for the My Items page. Visual-only placeholders — replace with
 * real API responses when the backend exists.
 */

import type { LucideIcon } from 'lucide-react'
import {
  MessageSquare,
  ShoppingCart,
  Warehouse,
  Handshake,
  Factory,
  ClipboardList,
  Columns3,
} from 'lucide-react'

// ─── App filters (left sidebar) ────────────────────────────────────────────

export interface AppFilter {
  id: string
  name: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  /** Items in this app currently assigned to the user. */
  assignedCount: number
  /** Items in this app currently created by the user. */
  createdCount: number
}

export const apps: AppFilter[] = [
  {
    id: 'feedback-app',
    name: 'Feedback App',
    icon: MessageSquare,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    assignedCount: 1,
    createdCount: 12,
  },
  {
    id: 'procurement-app',
    name: 'Procurement app',
    icon: ShoppingCart,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    assignedCount: 41,
    createdCount: 95,
  },
  {
    id: 'warehouse-management',
    name: 'Warehouse Management',
    icon: Warehouse,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    assignedCount: 7,
    createdCount: 7,
  },
  {
    id: 'supplier-portal',
    name: 'Supplier Portal',
    icon: Handshake,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    assignedCount: 11,
    createdCount: 11,
  },
  {
    id: 'operation-process',
    name: 'Operation Process',
    icon: Factory,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    assignedCount: 1,
    createdCount: 1,
  },
  {
    id: 'design-task',
    name: 'Design Task',
    icon: ClipboardList,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    assignedCount: 1,
    createdCount: 2,
  },
  {
    id: 'test-board',
    name: 'Test Board',
    icon: Columns3,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    assignedCount: 0,
    createdCount: 2,
  },
]

// ─── Assigned to me ────────────────────────────────────────────────────────

export interface AssignedItem {
  id: string
  title: string
  appId: string
  step: string
  initiatedBy: { name: string; initials: string; color: string }
  dueDate: string | null
}

export const assignedItems: AssignedItem[] = [
  {
    id: 'a1',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Lead',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a2',
    title: 'Purchase order — archive from Saravanan',
    appId: 'procurement-app',
    step: 'Review Order Details',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a3',
    title: 'Purchase Request from Saravanan',
    appId: 'procurement-app',
    step: 'PO In-progress',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a4',
    title: 'Purchase Request from Saravanan',
    appId: 'procurement-app',
    step: 'PO In-progress',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a5',
    title: 'Inventory Transactions from Saravanan',
    appId: 'warehouse-management',
    step: 'Execution',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a6',
    title: 'Vendor Onboarding from Saravanan',
    appId: 'supplier-portal',
    step: 'Compliance Review',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
  {
    id: 'a7',
    title: 'Procurement Audit from Saravanan',
    appId: 'procurement-app',
    step: 'Approval',
    initiatedBy: { name: 'Saravanan', initials: 'S', color: 'bg-amber-500' },
    dueDate: null,
  },
]

// ─── Created by me ─────────────────────────────────────────────────────────

export interface CreatedItem {
  id: string
  title: string
  appId: string
  step: string
  currentlyAssignedTo: { name: string; initials: string; color: string }
  dueDate: string | null
  /** 0-100, drives the progress bar in the row. */
  progress: number
}

export const createdItems: CreatedItem[] = [
  {
    id: 'c1',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Lead',
    currentlyAssignedTo: { name: 'Lead', initials: 'L', color: 'bg-pink-500' },
    dueDate: null,
    progress: 8,
  },
  {
    id: 'c2',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Manager',
    currentlyAssignedTo: { name: 'Manager', initials: 'M', color: 'bg-purple-500' },
    dueDate: null,
    progress: 60,
  },
  {
    id: 'c3',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Manager',
    currentlyAssignedTo: { name: 'Manager', initials: 'M', color: 'bg-purple-500' },
    dueDate: null,
    progress: 60,
  },
  {
    id: 'c4',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Manager',
    currentlyAssignedTo: { name: 'Manager', initials: 'M', color: 'bg-purple-500' },
    dueDate: null,
    progress: 60,
  },
  {
    id: 'c5',
    title: 'Employee Feedback from Saravanan',
    appId: 'feedback-app',
    step: 'Manager',
    currentlyAssignedTo: { name: 'Manager', initials: 'M', color: 'bg-purple-500' },
    dueDate: null,
    progress: 60,
  },
  {
    id: 'c6',
    title: 'Purchase Request from Saravanan',
    appId: 'procurement-app',
    step: 'PO In-progress',
    currentlyAssignedTo: { name: 'PO Team', initials: 'P', color: 'bg-orange-500' },
    dueDate: null,
    progress: 45,
  },
  {
    id: 'c7',
    title: 'Inventory Transactions',
    appId: 'warehouse-management',
    step: 'Execution',
    currentlyAssignedTo: { name: 'Ops', initials: 'O', color: 'bg-amber-500' },
    dueDate: null,
    progress: 30,
  },
]

// ─── Counts (badges shown in tabs + sidebar) ───────────────────────────────
// Hand-tuned so the visible badges read like the screenshots; do NOT recompute
// from arrays above (the arrays only need enough rows to show the layout).

export const tabCounts = {
  assigned: 62,
  created: 128,
  watchlist: 0,
}
