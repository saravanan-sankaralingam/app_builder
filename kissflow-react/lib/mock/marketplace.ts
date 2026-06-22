/**
 * Mock data for the Platform Marketplace page (`/store`). All values are
 * static fixtures — replace with real API responses when the backend exists.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Users,
  BarChart3,
  Bug,
  FileText,
  Leaf,
  UserCheck,
  Plane,
  Cpu,
  HeartPulse,
  Package,
  CalendarCheck,
  Target,
  Smartphone,
  TrendingUp,
  ShoppingCart,
  Briefcase,
  Store,
  Search,
  Building2,
} from 'lucide-react'

export type Pricing = 'Free' | 'Paid'

/**
 * Pre-baked thumbnail "looks". Each maps to a stylized SVG dashboard
 * mockup in `AppThumbnail.tsx` — gives the grid visual variety without
 * needing real screenshots.
 */
export type ThumbnailKind = 'table' | 'pie-bars' | 'rings' | 'bars-dashboard'

export interface MarketplaceApp {
  id: string
  name: string
  publisher: string
  description: string
  icon: LucideIcon
  iconBg: string // tailwind bg class for the icon tile
  iconColor: string // tailwind text class for the icon glyph
  pricing: Pricing
  thumbnail: ThumbnailKind
  /** Accent color for the thumbnail SVG (tailwind color name, e.g. 'red'). */
  thumbnailAccent:
    | 'red'
    | 'blue'
    | 'purple'
    | 'emerald'
    | 'amber'
    | 'pink'
    | 'orange'
    | 'cyan'
    | 'indigo'
}

export const marketplaceApps: MarketplaceApp[] = [
  {
    id: 'm1',
    name: 'Applicant Tracking System',
    publisher: 'Kissflow',
    description:
      'Streamline candidate applications and hire the right people with this app.',
    icon: Users,
    iconBg: 'bg-red-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'red',
  },
  {
    id: 'm2',
    name: 'Backlog Tracker and ROI Calculator',
    publisher: 'Kissflow',
    description:
      'Effortlessly track IT backlog processes and measure their ROI.',
    icon: BarChart3,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Free',
    thumbnail: 'pie-bars',
    thumbnailAccent: 'blue',
  },
  {
    id: 'm3',
    name: 'Bug Tracking System',
    publisher: 'Kissflow',
    description:
      'Effectively prioritize, manage, and resolve software bugs.',
    icon: Bug,
    iconBg: 'bg-purple-500',
    iconColor: 'text-white',
    pricing: 'Free',
    thumbnail: 'table',
    thumbnailAccent: 'purple',
  },
  {
    id: 'm4',
    name: 'Contract Management',
    publisher: 'Kissflow',
    description:
      'Keep track of all your supplier contracts in one place and manage them.',
    icon: FileText,
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'emerald',
  },
  {
    id: 'm5',
    name: 'ESG Management',
    publisher: 'Kissflow',
    description:
      'Framework to evaluate a company’s sustainability and ethical impact.',
    icon: Leaf,
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'rings',
    thumbnailAccent: 'emerald',
  },
  {
    id: 'm6',
    name: 'Employee Management',
    publisher: 'Kissflow',
    description:
      'Streamline and automate HR operations from employee onboarding to offboarding.',
    icon: UserCheck,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Free',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'amber',
  },
  {
    id: 'm7',
    name: 'Employee Onboarding App',
    publisher: 'Kissflow',
    description:
      'A smooth onboarding experience, not a paperwork bureau.',
    icon: Users,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'orange',
  },
  {
    id: 'm8',
    name: 'Expense and Travel Management',
    publisher: 'Kissflow',
    description:
      'Automate reimbursement claims and manage expenses with this app.',
    icon: Plane,
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'cyan',
  },
  {
    id: 'm9',
    name: 'IT Asset Management System',
    publisher: 'Kissflow',
    description:
      'Monitor IT assets and streamline their management with this app.',
    icon: Cpu,
    iconBg: 'bg-purple-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'indigo',
  },
  {
    id: 'm10',
    name: 'Inpatient Experience Management',
    publisher: 'Kissflow',
    description:
      'Optimize patient care with streamlined onboarding and data management.',
    icon: HeartPulse,
    iconBg: 'bg-indigo-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'indigo',
  },
  {
    id: 'm11',
    name: 'Inventory Management',
    publisher: 'Kissflow',
    description: 'Manage optimal stock levels with ease.',
    icon: Package,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'orange',
  },
  {
    id: 'm12',
    name: 'Leave Management',
    publisher: 'Kissflow',
    description:
      'Apply, track, and manage leave requests aligned with your company’s policy.',
    icon: CalendarCheck,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'orange',
  },
  {
    id: 'm13',
    name: 'OKR',
    publisher: 'Kissflow',
    description:
      'Define, track, and align goals for individuals, teams, and the company.',
    icon: Target,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'blue',
  },
  {
    id: 'm14',
    name: 'Offline Forms',
    publisher: 'Kissflow',
    description:
      'Ensure uninterrupted data flow between remote users and decision makers.',
    icon: Smartphone,
    iconBg: 'bg-slate-700',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'pink',
  },
  {
    id: 'm15',
    name: 'Performance Management System',
    publisher: 'Kissflow',
    description: 'Measure and track employee performance with this app.',
    icon: TrendingUp,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'blue',
  },
  {
    id: 'm16',
    name: 'Procure-to-Pay',
    publisher: 'Kissflow',
    description: 'The only flexible procure-to-pay platform.',
    icon: ShoppingCart,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'cyan',
  },
  {
    id: 'm17',
    name: 'Professional Services Executive Dashboard',
    publisher: 'Kissflow',
    description:
      'Organize and monitor customer enquiries, and keep track of projects and tasks.',
    icon: Briefcase,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Free',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'amber',
  },
  {
    id: 'm18',
    name: 'Retail Store Management',
    publisher: 'Kissflow',
    description:
      'Optimize site selection, budget, and management for retail store operations.',
    icon: Store,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'bars-dashboard',
    thumbnailAccent: 'orange',
  },
  {
    id: 'm19',
    name: 'Sourcing',
    publisher: 'Kissflow',
    description: 'One platform for all your sourcing needs.',
    icon: Search,
    iconBg: 'bg-pink-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'pie-bars',
    thumbnailAccent: 'pink',
  },
  {
    id: 'm20',
    name: 'Supplier Management',
    publisher: 'Kissflow',
    description: 'Enrol, engage, and evaluate suppliers.',
    icon: Building2,
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    pricing: 'Paid',
    thumbnail: 'table',
    thumbnailAccent: 'cyan',
  },
]

/** Cosmetic for the "All apps (N)" header. */
export const totalAppCount = marketplaceApps.length
