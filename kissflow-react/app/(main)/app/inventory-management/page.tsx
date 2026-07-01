'use client'

import { Settings, MoreVertical, Pin, UserPlus, TrendingUp, TrendingDown, Boxes, DollarSign, AlertTriangle, ClipboardList, ArrowUpRight, ArrowDownRight, ChevronRight, Search, Filter, Plus, ChevronDown, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ManageView } from '@/components/app-view/ManageView'

type ViewType = 'dashboard' | 'inventory' | 'master'
type MasterTab = 'items' | 'warehouses' | 'suppliers' | 'categories' | 'uom'

export default function InventoryManagementPage() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isManaging, setIsManaging] = useState(false)
  const [masterTab, setMasterTab] = useState<MasterTab>('items')

  const stockByCategory = [
    { name: 'Electronics', value: 32, color: '#0565FF' },
    { name: 'Apparel', value: 24, color: '#6D2BF0' },
    { name: 'Grocery', value: 18, color: '#009E4F' },
    { name: 'Home & Living', value: 14, color: '#F0B100' },
    { name: 'Others', value: 12, color: '#B5BAC9' },
  ]

  const movementTrend = [
    { month: 'Jan', inbound: 1200, outbound: 980 },
    { month: 'Feb', inbound: 1450, outbound: 1320 },
    { month: 'Mar', inbound: 1380, outbound: 1410 },
    { month: 'Apr', inbound: 1600, outbound: 1500 },
    { month: 'May', inbound: 1720, outbound: 1680 },
    { month: 'Jun', inbound: 1880, outbound: 1740 },
  ]

  const warehouseOccupancy = [
    { name: 'Mumbai DC', used: 82 },
    { name: 'Bangalore DC', used: 67 },
    { name: 'Delhi DC', used: 91 },
    { name: 'Pune DC', used: 54 },
    { name: 'Chennai DC', used: 73 },
  ]

  const topMovers = [
    { sku: 'SKU-10421', name: 'Wireless Mouse', moved: 1840, trend: 'up' },
    { sku: 'SKU-20188', name: 'Cotton T-Shirt (M)', moved: 1620, trend: 'up' },
    { sku: 'SKU-30945', name: 'Olive Oil 1L', moved: 1390, trend: 'down' },
    { sku: 'SKU-40233', name: 'LED Bulb 9W', moved: 1240, trend: 'up' },
    { sku: 'SKU-50117', name: 'Notebook A5', moved: 1110, trend: 'down' },
  ]

  const inventoryRows = [
    { sku: 'SKU-10421', name: 'Wireless Mouse', category: 'Electronics', warehouse: 'Mumbai DC', current: 1240, reserved: 80, available: 1160, reorder: 200, unitPrice: 18.5, status: 'In Stock' },
    { sku: 'SKU-20188', name: 'Cotton T-Shirt (M)', category: 'Apparel', warehouse: 'Bangalore DC', current: 860, reserved: 120, available: 740, reorder: 150, unitPrice: 9.2, status: 'In Stock' },
    { sku: 'SKU-30945', name: 'Olive Oil 1L', category: 'Grocery', warehouse: 'Delhi DC', current: 420, reserved: 30, available: 390, reorder: 200, unitPrice: 11.0, status: 'In Stock' },
    { sku: 'SKU-77231', name: 'Bluetooth Headphones', category: 'Electronics', warehouse: 'Mumbai DC', current: 12, reserved: 0, available: 12, reorder: 50, unitPrice: 42.0, status: 'Low Stock' },
    { sku: 'SKU-66109', name: 'Steel Water Bottle', category: 'Home & Living', warehouse: 'Delhi DC', current: 28, reserved: 4, available: 24, reorder: 80, unitPrice: 7.5, status: 'Low Stock' },
    { sku: 'SKU-40233', name: 'LED Bulb 9W', category: 'Home & Living', warehouse: 'Pune DC', current: 1860, reserved: 200, available: 1660, reorder: 300, unitPrice: 2.4, status: 'In Stock' },
    { sku: 'SKU-50117', name: 'Notebook A5', category: 'Others', warehouse: 'Chennai DC', current: 0, reserved: 0, available: 0, reorder: 100, unitPrice: 3.1, status: 'Out of Stock' },
    { sku: 'SKU-55044', name: 'Cotton Bedsheet (Q)', category: 'Home & Living', warehouse: 'Bangalore DC', current: 9, reserved: 0, available: 9, reorder: 40, unitPrice: 22.0, status: 'Low Stock' },
    { sku: 'SKU-44002', name: 'Organic Honey 500g', category: 'Grocery', warehouse: 'Chennai DC', current: 340, reserved: 60, available: 280, reorder: 75, unitPrice: 8.6, status: 'In Stock' },
    { sku: 'SKU-33890', name: 'USB-C Cable 1m', category: 'Electronics', warehouse: 'Pune DC', current: 0, reserved: 0, available: 0, reorder: 60, unitPrice: 4.2, status: 'Out of Stock' },
    { sku: 'SKU-22456', name: 'Denim Jeans (32)', category: 'Apparel', warehouse: 'Mumbai DC', current: 520, reserved: 80, available: 440, reorder: 100, unitPrice: 28.0, status: 'In Stock' },
    { sku: 'SKU-11003', name: 'Ceramic Mug', category: 'Home & Living', warehouse: 'Delhi DC', current: 215, reserved: 35, available: 180, reorder: 60, unitPrice: 4.8, status: 'In Stock' },
  ]

  const masterTabs: { key: MasterTab; label: string; count: number }[] = [
    { key: 'items', label: 'Items', count: 12847 },
    { key: 'warehouses', label: 'Warehouses', count: 5 },
    { key: 'suppliers', label: 'Suppliers', count: 87 },
    { key: 'categories', label: 'Categories', count: 24 },
    { key: 'uom', label: 'Units of Measure', count: 12 },
  ]

  const itemsMaster = [
    { sku: 'SKU-10421', name: 'Wireless Mouse', category: 'Electronics', uom: 'Each', unitPrice: 18.5, active: true },
    { sku: 'SKU-20188', name: 'Cotton T-Shirt (M)', category: 'Apparel', uom: 'Each', unitPrice: 9.2, active: true },
    { sku: 'SKU-30945', name: 'Olive Oil 1L', category: 'Grocery', uom: 'Bottle', unitPrice: 11.0, active: true },
    { sku: 'SKU-40233', name: 'LED Bulb 9W', category: 'Home & Living', uom: 'Each', unitPrice: 2.4, active: true },
    { sku: 'SKU-50117', name: 'Notebook A5', category: 'Others', uom: 'Each', unitPrice: 3.1, active: false },
    { sku: 'SKU-55044', name: 'Cotton Bedsheet (Q)', category: 'Home & Living', uom: 'Set', unitPrice: 22.0, active: true },
    { sku: 'SKU-66109', name: 'Steel Water Bottle', category: 'Home & Living', uom: 'Each', unitPrice: 7.5, active: true },
    { sku: 'SKU-77231', name: 'Bluetooth Headphones', category: 'Electronics', uom: 'Each', unitPrice: 42.0, active: true },
  ]

  const warehousesMaster = [
    { code: 'WH-MUM', name: 'Mumbai DC', location: 'Mumbai, MH', capacity: '120,000 cuft', manager: 'Rohan Sharma', active: true },
    { code: 'WH-BLR', name: 'Bangalore DC', location: 'Bangalore, KA', capacity: '95,000 cuft', manager: 'Priya Iyer', active: true },
    { code: 'WH-DEL', name: 'Delhi DC', location: 'New Delhi, DL', capacity: '140,000 cuft', manager: 'Arjun Mehta', active: true },
    { code: 'WH-PUN', name: 'Pune DC', location: 'Pune, MH', capacity: '60,000 cuft', manager: 'Sneha Joshi', active: true },
    { code: 'WH-CHN', name: 'Chennai DC', location: 'Chennai, TN', capacity: '85,000 cuft', manager: 'Karthik Rao', active: true },
  ]

  const suppliersMaster = [
    { code: 'SUP-001', name: 'Acme Electronics Pvt Ltd', contact: 'Vikram Singh', email: 'vikram@acme-elec.in', phone: '+91 98765 12340', leadTime: '7 days', terms: 'Net 30' },
    { code: 'SUP-002', name: 'TextileWorks Co.', contact: 'Anita Desai', email: 'anita@textileworks.com', phone: '+91 97654 88110', leadTime: '14 days', terms: 'Net 45' },
    { code: 'SUP-003', name: 'GreenHarvest Foods', contact: 'Manish Patel', email: 'manish@greenharvest.in', phone: '+91 99887 66554', leadTime: '5 days', terms: 'Net 15' },
    { code: 'SUP-004', name: 'BrightHome Living', contact: 'Sunita Krishnan', email: 'sunita@brighthome.in', phone: '+91 96543 22118', leadTime: '10 days', terms: 'Net 30' },
    { code: 'SUP-005', name: 'PaperPlus Stationery', contact: 'Rahul Banerjee', email: 'rahul@paperplus.in', phone: '+91 95431 99002', leadTime: '4 days', terms: 'Cash on Delivery' },
    { code: 'SUP-006', name: 'AudioSonic India', contact: 'Deepa Reddy', email: 'deepa@audiosonic.in', phone: '+91 94321 77003', leadTime: '12 days', terms: 'Net 30' },
  ]

  const categoriesMaster = [
    { code: 'CAT-001', name: 'Electronics', parent: '—', items: 3245, active: true },
    { code: 'CAT-001-A', name: 'Audio', parent: 'Electronics', items: 412, active: true },
    { code: 'CAT-001-B', name: 'Peripherals', parent: 'Electronics', items: 980, active: true },
    { code: 'CAT-002', name: 'Apparel', parent: '—', items: 2876, active: true },
    { code: 'CAT-003', name: 'Grocery', parent: '—', items: 1892, active: true },
    { code: 'CAT-004', name: 'Home & Living', parent: '—', items: 2341, active: true },
    { code: 'CAT-005', name: 'Others', parent: '—', items: 1493, active: false },
  ]

  const uomMaster = [
    { code: 'EA', name: 'Each', baseUnit: 'Each', factor: 1 },
    { code: 'PK', name: 'Pack', baseUnit: 'Each', factor: 6 },
    { code: 'CS', name: 'Case', baseUnit: 'Each', factor: 24 },
    { code: 'KG', name: 'Kilogram', baseUnit: 'Gram', factor: 1000 },
    { code: 'G', name: 'Gram', baseUnit: 'Gram', factor: 1 },
    { code: 'L', name: 'Litre', baseUnit: 'Millilitre', factor: 1000 },
    { code: 'ML', name: 'Millilitre', baseUnit: 'Millilitre', factor: 1 },
    { code: 'BOX', name: 'Box', baseUnit: 'Each', factor: 12 },
    { code: 'SET', name: 'Set', baseUnit: 'Each', factor: 1 },
    { code: 'BTL', name: 'Bottle', baseUnit: 'Each', factor: 1 },
  ]

  const lowStock = [
    { sku: 'SKU-77231', name: 'Bluetooth Headphones', warehouse: 'Mumbai DC', current: 12, reorder: 50, status: 'Critical' },
    { sku: 'SKU-66109', name: 'Steel Water Bottle', warehouse: 'Delhi DC', current: 28, reorder: 80, status: 'Low' },
    { sku: 'SKU-55044', name: 'Cotton Bedsheet (Q)', warehouse: 'Bangalore DC', current: 9, reorder: 40, status: 'Critical' },
    { sku: 'SKU-44002', name: 'Organic Honey 500g', warehouse: 'Chennai DC', current: 34, reorder: 75, status: 'Low' },
    { sku: 'SKU-33890', name: 'USB-C Cable 1m', warehouse: 'Pune DC', current: 7, reorder: 60, status: 'Critical' },
  ]

  return (
    <div className="min-h-[calc(100vh-50px)] bg-gray-100">
      {/* App Header — identical structure to Retail One */}
      <div className="sticky top-0 z-10 bg-gray-100 px-5 py-3">
        <div className="bg-white rounded-lg h-[86px] px-5 py-3 flex flex-col justify-between">
          {/* Top Row: App Info + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5 text-orange-500" strokeWidth={1.25} />
              <h1 className="text-lg font-semibold text-gray-900">Inventory Management</h1>

              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <Pin className="h-4 w-4 text-gray-500" />
              </Button>

              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium ring-2 ring-white">
                  SS
                </div>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-medium ring-2 ring-white">
                  JD
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium ring-2 ring-white">
                  AK
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <UserPlus className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 h-8 text-[13px]"
                onClick={() => setIsManaging(true)}
              >
                <Settings className="h-3 w-3" />
                Manage
              </Button>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Second row — breadcrumb when managing, tabs otherwise */}
          {isManaging ? (
            <nav className="flex items-center gap-1.5 text-sm pl-8 mb-2">
              <button
                type="button"
                onClick={() => setIsManaging(false)}
                className="text-blue-600 font-medium hover:underline leading-none"
              >
                Inventory Management
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-700 font-medium leading-none">Manage</span>
            </nav>
          ) : (
          <div className="flex gap-3 -mb-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'dashboard'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('inventory')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'inventory'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Inventory
            </button>
            <button
              onClick={() => setCurrentView('master')}
              className={cn(
                "relative px-1 pt-1 pb-3 text-sm transition-colors",
                currentView === 'master'
                  ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                  : "text-gray-600 font-normal hover:text-gray-900"
              )}
            >
              Master
            </button>
          </div>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="p-6">
        {isManaging ? (
          <ManageView
            onEditApp={() =>
              window.open('/builder/inventory-management', '_blank', 'noopener,noreferrer')
            }
          />
        ) : (
        <>
        {currentView === 'dashboard' && (
          <div className="space-y-4">
            {/* Row 1 — KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Boxes className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>4.2%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">12,847</div>
                <div className="text-xs text-gray-500 mt-1">Total SKUs</div>
              </div>

              <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>8.6%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">$24.3M</div>
                <div className="text-xs text-gray-500 mt-1">Total Stock Value</div>
              </div>

              <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>11.4%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">142</div>
                <div className="text-xs text-gray-500 mt-1">Low Stock Alerts</div>
              </div>

              <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>2.1%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">38</div>
                <div className="text-xs text-gray-500 mt-1">Pending Replenishments</div>
              </div>
            </div>

            {/* Row 2 — Stock by Category + Movement Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Stock by Category</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={stockByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {stockByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {stockByCategory.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-700 flex-1">{item.name}</span>
                        <span className="text-xs font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-lg p-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Stock Movement Trend</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                      <span className="text-gray-600">Inbound</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                      <span className="text-gray-600">Outbound</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={movementTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7ED" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#B5BAC9" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#B5BAC9" />
                    <Tooltip />
                    <Line type="monotone" dataKey="inbound" stroke="#0565FF" strokeWidth={2} dot={{ fill: '#0565FF', r: 4 }} />
                    <Line type="monotone" dataKey="outbound" stroke="#009E4F" strokeWidth={2} dot={{ fill: '#009E4F', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3 — Warehouse Occupancy + Top Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Warehouse Occupancy</h3>
                <div className="space-y-4">
                  {warehouseOccupancy.map((w, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700">{w.name}</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          w.used >= 90 ? "text-red-600" : w.used >= 75 ? "text-yellow-600" : "text-green-600"
                        )}>{w.used}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            w.used >= 90 ? "bg-red-500" : w.used >= 75 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${w.used}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Top Moving SKUs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-gray-500 uppercase">
                        <th className="py-2 font-medium">SKU</th>
                        <th className="py-2 font-medium">Item</th>
                        <th className="py-2 font-medium text-right">Units Moved</th>
                        <th className="py-2 font-medium text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMovers.map((m, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2.5 text-gray-700 font-mono text-xs">{m.sku}</td>
                          <td className="py-2.5 text-gray-900">{m.name}</td>
                          <td className="py-2.5 text-right font-medium text-gray-900">{m.moved.toLocaleString()}</td>
                          <td className="py-2.5 text-right">
                            {m.trend === 'up' ? (
                              <TrendingUp className="inline h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="inline h-4 w-4 text-red-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Row 4 — Low Stock Alerts */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200 mb-4">Low Stock Alerts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                      <th className="py-2 font-medium">SKU</th>
                      <th className="py-2 font-medium">Item</th>
                      <th className="py-2 font-medium">Warehouse</th>
                      <th className="py-2 font-medium text-right">Current</th>
                      <th className="py-2 font-medium text-right">Reorder Level</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 text-gray-700 font-mono text-xs">{row.sku}</td>
                        <td className="py-2.5 text-gray-900">{row.name}</td>
                        <td className="py-2.5 text-gray-700">{row.warehouse}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900">{row.current}</td>
                        <td className="py-2.5 text-right text-gray-700">{row.reorder}</td>
                        <td className="py-2.5">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            row.status === 'Critical'
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'inventory' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search SKU, item, or category…"
                  className="w-full h-9 pl-9 pr-3 text-sm bg-gray-100 border border-gray-300 rounded-md placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-[13px]">
                <Filter className="h-3.5 w-3.5" />
                Category
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </Button>
              <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-[13px]">
                <Filter className="h-3.5 w-3.5" />
                Warehouse
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </Button>
              <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-[13px]">
                <Filter className="h-3.5 w-3.5" />
                Status
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </Button>
              <div className="h-6 w-px bg-gray-300 mx-1" />
              <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-[13px]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
              <Button size="sm" className="gap-1.5 h-9 text-[13px] bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">SKU</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Item</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Warehouse</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">On-hand</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Reserved</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Available</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Reorder Lvl</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Unit Price</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Total Value</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRows.map((r, i) => {
                      const totalValue = r.current * r.unitPrice
                      return (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.sku}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.category}</td>
                          <td className="py-3 px-4 text-gray-700">{r.warehouse}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">{r.current.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{r.reserved.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">{r.available.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{r.reorder.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-700">${r.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              r.status === 'In Stock' && "bg-green-100 text-green-700",
                              r.status === 'Low Stock' && "bg-yellow-100 text-yellow-700",
                              r.status === 'Out of Stock' && "bg-red-100 text-red-700",
                            )}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-700">
                <span>Showing 1–{inventoryRows.length} of 12,847 SKUs</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">Previous</Button>
                  <span className="px-2">Page 1 of 1,071</span>
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">Next</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'master' && (
          <div className="space-y-4">
            {/* Master tab strip */}
            <div className="bg-white rounded-lg px-5 pt-3">
              <div className="flex gap-4 border-b border-gray-200">
                {masterTabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setMasterTab(t.key)}
                    className={cn(
                      "relative pt-1 pb-3 text-sm transition-colors flex items-center gap-2",
                      masterTab === t.key
                        ? "text-gray-900 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gray-900"
                        : "text-gray-700 font-normal hover:text-gray-900"
                    )}
                  >
                    {t.label}
                    <span className={cn(
                      "inline-flex items-center justify-center px-1.5 h-5 min-w-[20px] rounded-full text-[11px] font-medium",
                      masterTab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                    )}>
                      {t.count.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={`Search ${masterTabs.find((t) => t.key === masterTab)?.label.toLowerCase()}…`}
                  className="w-full h-9 pl-9 pr-3 text-sm bg-gray-100 border border-gray-300 rounded-md placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-[13px]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
              <Button size="sm" className="gap-1.5 h-9 text-[13px] bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-3.5 w-3.5" />
                Add {masterTabs.find((t) => t.key === masterTab)?.label.replace(/s$/, '')}
              </Button>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {masterTab === 'items' && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">SKU</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">UoM</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Unit Price</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsMaster.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.sku}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.category}</td>
                          <td className="py-3 px-4 text-gray-700">{r.uom}</td>
                          <td className="py-3 px-4 text-right text-gray-700">${r.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              r.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                            )}>
                              {r.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {masterTab === 'warehouses' && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Location</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Capacity</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Manager</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehousesMaster.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.code}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.location}</td>
                          <td className="py-3 px-4 text-gray-700">{r.capacity}</td>
                          <td className="py-3 px-4 text-gray-700">{r.manager}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              r.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                            )}>
                              {r.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {masterTab === 'suppliers' && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Contact</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Phone</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Lead Time</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Payment Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliersMaster.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.code}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.contact}</td>
                          <td className="py-3 px-4 text-blue-600">{r.email}</td>
                          <td className="py-3 px-4 text-gray-700">{r.phone}</td>
                          <td className="py-3 px-4 text-gray-700">{r.leadTime}</td>
                          <td className="py-3 px-4 text-gray-700">{r.terms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {masterTab === 'categories' && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Parent</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Items</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesMaster.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.code}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.parent}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">{r.items.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              r.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                            )}>
                              {r.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {masterTab === 'uom' && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Code</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Base Unit</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-700 uppercase tracking-wide">Conversion Factor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uomMaster.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">{r.code}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-3 px-4 text-gray-700">{r.baseUnit}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-medium">{r.factor.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
