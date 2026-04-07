import {
  User,
  ShoppingCart,
  Truck,
  Building2,
  Package,
  Users,
  MessageSquare,
  Puzzle,
  FileText,
  ClipboardList,
  Calendar,
  Database,
  BarChart3,
  Settings
} from 'lucide-react'
import { AppData } from '@/types/app'

// Tailwind 500 colors for icon backgrounds (icons will be white)
const colors = {
  blue: '#3b82f6',      // blue-500
  green: '#22c55e',     // green-500
  amber: '#f59e0b',     // amber-500
  red: '#ef4444',       // red-500
  purple: '#a855f7',    // purple-500
  pink: '#ec4899',      // pink-500
  cyan: '#06b6d4',      // cyan-500
  orange: '#f97316',    // orange-500
}

export const appsData: AppData[] = [
  {
    id: 'ap-ar-management',
    name: 'AP & AR Management',
    description: 'No description added',
    icon: User,
    iconBg: colors.amber,
    createdBy: 'Saravanan',
  },
  {
    id: 'supplier-portal',
    name: 'Supplier Portal',
    description: 'No description added',
    icon: Building2,
    iconBg: colors.blue,
    createdBy: 'Saravanan',
  },
  {
    id: 'procurement-app',
    name: 'Procurement app',
    description: 'No description added',
    icon: ShoppingCart,
    iconBg: colors.pink,
    createdBy: 'Saravanan',
    tabs: ['Home', 'Purchase Requests', 'Purchase Orders', 'Purchase order - archive']
  },
  {
    id: 'warehouse-management',
    name: 'Warehouse Management',
    description: 'No description added',
    icon: Truck,
    iconBg: colors.amber,
    createdBy: 'Saravanan',
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'No description added',
    icon: Package,
    iconBg: colors.green,
    createdBy: 'Saravanan',
  },
  {
    id: 'org-department',
    name: 'Org Department',
    description: 'No description added',
    icon: Building2,
    iconBg: colors.cyan,
    createdBy: 'Saravanan S',
  },
  {
    id: 'feedback-app',
    name: 'Feedback App',
    description: 'No description added',
    icon: MessageSquare,
    iconBg: colors.purple,
    createdBy: 'Saravanan',
  },
  {
    id: 'test-app',
    name: 'Test App',
    description: 'No description added',
    icon: Puzzle,
    iconBg: colors.orange,
    createdBy: 'Tharik',
  },
  {
    id: 'leave-app',
    name: 'Leave App',
    description: 'No description added',
    icon: Calendar,
    iconBg: colors.orange,
    createdBy: 'Saravanan',
  },
  {
    id: 'example',
    name: 'Example',
    description: 'No description added',
    icon: FileText,
    iconBg: colors.red,
    createdBy: 'Saravanan',
  },
  {
    id: 'employee-database',
    name: 'Employee Database',
    description: 'No description added',
    icon: Database,
    iconBg: colors.red,
    createdBy: 'Saravanan',
  },
  {
    id: 'my-test',
    name: 'My test',
    description: 'No description added',
    icon: FileText,
    iconBg: colors.purple,
    createdBy: 'Saravanan',
  },
  {
    id: 'employee-data',
    name: 'Employee Data',
    description: 'No description added',
    icon: Users,
    iconBg: colors.blue,
    createdBy: 'Saravanan',
  },
  {
    id: 'sample-process',
    name: 'Sample Process',
    description: 'No description added',
    icon: ClipboardList,
    iconBg: colors.orange,
    createdBy: 'Saravanan',
  },
  {
    id: 'supplier-management',
    name: 'Supplier Management',
    description: 'No description added',
    icon: Building2,
    iconBg: colors.red,
    createdBy: 'Saravanan',
  },
]

// Special app for employee directory with all views
export const employeeDirectoryApp: AppData = {
  id: 'employee-directory',
  name: 'Employee Directory',
  description: 'Manage and view employee information',
  icon: Users,
  iconBg: colors.blue,
  createdBy: 'Saravanan',
  tabs: ['Table', 'Sheet', 'Gallery', 'Kanban', 'Timeline', 'Calendar']
}
