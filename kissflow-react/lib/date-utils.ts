import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string (e.g., "2023-05-15")
 * @param formatStr - Date format string (default: "MMM dd, yyyy")
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return dateString
    }
    return format(date, formatStr)
  } catch (error) {
    return dateString
  }
}

/**
 * Format a date to a relative time (e.g., "2 years ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return dateString
    }
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    return dateString
  }
}

/**
 * Format a date for display in the timeline view
 * @param dateString - ISO date string
 * @returns Timeline formatted date
 */
export function formatTimelineDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return dateString
    }
    const formatted = format(date, 'MMMM yyyy')
    const relative = formatDistanceToNow(date, { addSuffix: true })
    return `${formatted} (${relative})`
  } catch (error) {
    return dateString
  }
}

/**
 * Get the month and year from a date string
 * @param dateString - ISO date string
 * @returns Month and year (e.g., "January 2023")
 */
export function getMonthYear(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return dateString
    }
    return format(date, 'MMMM yyyy')
  } catch (error) {
    return dateString
  }
}

/**
 * Get the year from a date string
 * @param dateString - ISO date string
 * @returns Year (e.g., "2023")
 */
export function getYear(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return dateString
    }
    return format(date, 'yyyy')
  } catch (error) {
    return dateString
  }
}
