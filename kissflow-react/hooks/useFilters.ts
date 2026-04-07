import { useCallback } from 'react'
import { useAppContext } from '@/context/AppContext'
import { EmployeeFilter } from '@/types/employee'

/**
 * Custom hook to manage employee filters
 */
export function useFilters() {
  const { state, dispatch } = useAppContext()
  const { searchQuery, quickFilter, currentPage } = state

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }, [dispatch])

  const setQuickFilter = useCallback((filter: EmployeeFilter) => {
    dispatch({ type: 'SET_QUICK_FILTER', payload: filter })
  }, [dispatch])

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }, [dispatch])

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' })
  }, [dispatch])

  const nextPage = useCallback(() => {
    dispatch({ type: 'SET_PAGE', payload: currentPage + 1 })
  }, [dispatch, currentPage])

  const previousPage = useCallback(() => {
    dispatch({ type: 'SET_PAGE', payload: Math.max(1, currentPage - 1) })
  }, [dispatch, currentPage])

  return {
    searchQuery,
    quickFilter,
    currentPage,
    setSearchQuery,
    setQuickFilter,
    setPage,
    resetFilters,
    nextPage,
    previousPage,
  }
}
