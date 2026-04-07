'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface BuilderThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

const BuilderThemeContext = createContext<BuilderThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'builder-theme'

export function BuilderThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
    }
    setMounted(true)
  }, [])

  // Persist theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Always provide the context - include mounted state so children can check
  return (
    <BuilderThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </BuilderThemeContext.Provider>
  )
}

export function useBuilderTheme() {
  const context = useContext(BuilderThemeContext)
  if (context === undefined) {
    throw new Error('useBuilderTheme must be used within a BuilderThemeProvider')
  }
  return context
}

// Inner component that applies the dark class - must be used inside BuilderThemeProvider
function ThemeRoot({ children, className }: { children: ReactNode; className?: string }) {
  const { theme, mounted } = useBuilderTheme()
  // Only apply dark class after mounted to prevent hydration mismatch
  const darkClass = mounted && theme === 'dark' ? 'dark' : ''
  return (
    <div id="builder-root" className={`${className || ''} ${darkClass}`.trim()}>
      {children}
    </div>
  )
}

// Combined provider + root wrapper for convenience
export function BuilderThemeRoot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <BuilderThemeProvider>
      <ThemeRoot className={className}>{children}</ThemeRoot>
    </BuilderThemeProvider>
  )
}
