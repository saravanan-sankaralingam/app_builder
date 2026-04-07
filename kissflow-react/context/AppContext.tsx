'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Employee, EmployeeFilter } from '@/types/employee'
import { ViewType } from '@/types/app'
import { mockEmployees } from '@/data/employees'

interface AppState {
  employees: Employee[]
  currentView: ViewType
  searchQuery: string
  quickFilter: EmployeeFilter
  currentPage: number
  itemsPerPage: number
}

type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_QUICK_FILTER'; payload: EmployeeFilter }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ITEMS_PER_PAGE'; payload: number }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: number }
  | { type: 'RESET_FILTERS' }

const initialState: AppState = {
  employees: mockEmployees,
  currentView: 'table',
  searchQuery: '',
  quickFilter: 'all',
  currentPage: 1,
  itemsPerPage: 10,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 }

    case 'SET_QUICK_FILTER':
      return { ...state, quickFilter: action.payload, currentPage: 1 }

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }

    case 'SET_ITEMS_PER_PAGE':
      return { ...state, itemsPerPage: action.payload, currentPage: 1 }

    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload],
      }

    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
      }

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
      }

    case 'RESET_FILTERS':
      return {
        ...state,
        searchQuery: '',
        quickFilter: 'all',
        currentPage: 1,
      }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
