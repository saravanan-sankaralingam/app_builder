'use client'

import { useState } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  navigateTo: string | null
  roles: string[]
  children: MenuItem[]
  parentId: string | null
}

interface NavigationEditorProps {
  navigationId?: string
  navigationName?: string
}

// Helper to find a menu item by id (recursive)
function findMenuItem(menus: MenuItem[], id: string): MenuItem | null {
  for (const menu of menus) {
    if (menu.id === id) return menu
    const found = findMenuItem(menu.children, id)
    if (found) return found
  }
  return null
}

// Helper to check if item is a sub-menu (has parent)
function isSubMenu(menus: MenuItem[], id: string): boolean {
  const item = findMenuItem(menus, id)
  return item?.parentId !== null
}

// Helper to update a menu item by id (recursive)
function updateMenuItem(menus: MenuItem[], id: string, updates: Partial<MenuItem>): MenuItem[] {
  return menus.map((menu) => {
    if (menu.id === id) {
      return { ...menu, ...updates }
    }
    return {
      ...menu,
      children: updateMenuItem(menu.children, id, updates),
    }
  })
}

// Helper to add a child to a menu item
function addChildToMenu(menus: MenuItem[], parentId: string, newChild: MenuItem): MenuItem[] {
  return menus.map((menu) => {
    if (menu.id === parentId) {
      return { ...menu, children: [...menu.children, newChild] }
    }
    return {
      ...menu,
      children: addChildToMenu(menu.children, parentId, newChild),
    }
  })
}

export function NavigationEditor({ navigationId, navigationName }: NavigationEditorProps) {
  const [menus, setMenus] = useState<MenuItem[]>([
    {
      id: 'menu-1',
      name: 'Untitled menu',
      navigateTo: null,
      roles: [],
      children: [],
      parentId: null,
    },
  ])
  const [selectedId, setSelectedId] = useState<string>('menu-1')

  const selectedItem = findMenuItem(menus, selectedId)
  const isSelectedSubMenu = isSubMenu(menus, selectedId)

  // Add new root menu
  const handleAddMenu = () => {
    const newMenu: MenuItem = {
      id: `menu-${Date.now()}`,
      name: 'Untitled menu',
      navigateTo: null,
      roles: [],
      children: [],
      parentId: null,
    }
    setMenus([...menus, newMenu])
    setSelectedId(newMenu.id)
  }

  // Add sub-menu to a specific menu
  const handleAddSubMenu = (parentId: string) => {
    const newSubMenu: MenuItem = {
      id: `submenu-${Date.now()}`,
      name: 'Untitled sub-menu',
      navigateTo: null,
      roles: [],
      children: [],
      parentId: parentId,
    }
    setMenus(addChildToMenu(menus, parentId, newSubMenu))
    setSelectedId(newSubMenu.id)
  }

  // Update selected item's name
  const handleNameChange = (name: string) => {
    setMenus(updateMenuItem(menus, selectedId, { name }))
  }

  // Update selected item's navigateTo
  const handleNavigateToChange = (value: string) => {
    setMenus(updateMenuItem(menus, selectedId, { navigateTo: value === 'none' ? null : value }))
  }

  // Menu Card Component
  const MenuCard = ({ menu, isChild = false }: { menu: MenuItem; isChild?: boolean }) => {
    const isSelected = menu.id === selectedId

    // Different styles for root menu vs sub-menu
    if (isChild) {
      // Sub-menu card: smaller, purple theme
      return (
        <button
          onClick={() => setSelectedId(menu.id)}
          className={cn(
            'flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs transition-all w-[150px] text-left',
            'border-purple-300 bg-purple-100',
            isSelected && 'ring-2 ring-purple-400 ring-offset-1'
          )}
        >
          <GripVertical className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          <span className="truncate font-normal text-gray-700">
            {menu.name}
          </span>
        </button>
      )
    }

    // Root menu card: larger, pink theme
    return (
      <button
        onClick={() => setSelectedId(menu.id)}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all w-[180px] text-left',
          'border-pink-300 bg-pink-100',
          isSelected && 'ring-2 ring-pink-400 ring-offset-1'
        )}
      >
        <GripVertical className="h-4 w-4 text-pink-400 flex-shrink-0" />
        <span className="truncate font-medium text-gray-700">
          {menu.name}
        </span>
      </button>
    )
  }

  // Root Menu Column Component (includes menu + its sub-menus below)
  const MenuColumn = ({ menu }: { menu: MenuItem }) => {
    const hasChildren = menu.children.length > 0

    return (
      <div className="relative flex flex-col items-start">
        {/* Root menu card */}
        <MenuCard menu={menu} />

        {/* Circle below the drag handle of parent menu - only show when has children */}
        {hasChildren && (
          <div
            className="absolute rounded-full border border-gray-400 bg-white"
            style={{
              width: '7px',
              height: '7px',
              left: '16px',
              top: '46px',
            }}
          />
        )}

        {/* Sub-menus section - aligned so connectors reach the circle */}
        <div className="relative mt-6" style={{ marginLeft: '40px' }}>
          {hasChildren && (
            <div className="flex flex-col gap-6">
              {menu.children.map((child, index) => (
                <div key={child.id} className="flex items-center relative">
                  {/* Vertical line from circle down to this item */}
                  <div
                    className="absolute bg-gray-400"
                    style={{
                      left: '-21px',
                      width: '1px',
                      top: index === 0 ? '-13px' : 'calc(-50% - 32px)',
                      height: index === 0 ? 'calc(50% + 5px)' : 'calc(100% + 24px)',
                    }}
                  />
                  {/* Curved horizontal connector to sub-menu */}
                  <div
                    className="absolute border-l border-b border-gray-400 rounded-bl-lg"
                    style={{
                      left: '-21px',
                      width: '20px',
                      height: '18px',
                      top: 'calc(50% - 18px)',
                    }}
                  />
                  {/* Circle at the junction - near sub-menu's left border */}
                  <div
                    className="absolute rounded-full border border-gray-400 bg-white"
                    style={{
                      width: '7px',
                      height: '7px',
                      left: '-3px',
                      top: 'calc(50% - 3.5px)',
                    }}
                  />
                  <div style={{ marginLeft: '8px' }}>
                    <MenuCard menu={child} isChild />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add sub-menu button */}
          <button
            onClick={() => handleAddSubMenu(menu.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-dashed transition-colors",
              "text-gray-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300",
              hasChildren ? "mt-6" : "mt-2"
            )}
            style={{ marginLeft: '8px' }}
          >
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
              <Plus className="h-2.5 w-2.5 text-white" />
            </div>
            Sub-menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-gray-50">
      {/* Tree Canvas */}
      <div className="flex-1 overflow-auto" style={{ padding: '80px' }}>
        <div className="flex items-start gap-16">
          {/* Root menus arranged horizontally */}
          {menus.map((menu) => (
            <MenuColumn key={menu.id} menu={menu} />
          ))}

          {/* Add new root menu button */}
          <button
            onClick={handleAddMenu}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-dashed transition-colors text-gray-600 border-pink-200 hover:bg-pink-50 hover:border-pink-300 flex-shrink-0 mt-1.5"
          >
            <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
              <Plus className="h-2.5 w-2.5 text-white" />
            </div>
            Menu
          </button>
        </div>
      </div>

      {/* Property Panel */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            {isSelectedSubMenu ? 'Sub-menu Properties' : 'Menu Properties'}
          </h2>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-4">
          {selectedItem && (
            <div className="space-y-6">
              {/* General Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  General
                </h3>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="menu-name" className="text-sm text-gray-600">
                    Name
                  </Label>
                  <Input
                    id="menu-name"
                    value={selectedItem.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Navigate to */}
                <div className="space-y-1.5">
                  <Label htmlFor="navigate-to" className="text-sm text-gray-600">
                    Navigate to
                  </Label>
                  <Select
                    value={selectedItem.navigateTo || 'none'}
                    onValueChange={handleNavigateToChange}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="page-1">Home Page</SelectItem>
                      <SelectItem value="page-2">Dashboard</SelectItem>
                      <SelectItem value="page-3">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visibility Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Visibility
                </h3>

                {/* Select roles */}
                <div className="space-y-1.5">
                  <Label htmlFor="menu-roles" className="text-sm text-gray-600">
                    Select roles to display menu
                  </Label>
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
