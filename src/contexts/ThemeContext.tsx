'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getUserActiveTheme, type UserTheme, type ThemeColors } from '@/lib/api/themes'
import { useAuth } from './AuthContext'

interface ThemeContextValue {
  activeTheme: UserTheme | null
  colors: ThemeColors | null
  loading: boolean
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: null,
  colors: null,
  loading: true,
  refreshTheme: async () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeTheme, setActiveTheme] = useState<UserTheme | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTheme = async () => {
    try {
      setLoading(true)
      if (user) {
        const theme = await getUserActiveTheme()
        setActiveTheme(theme)
        applyThemeToDOM(theme.colors)
      } else {
        // Load default theme for non-authenticated users
        setActiveTheme(null)
      }
    } catch (error) {
      console.error('Error loading user theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyThemeToDOM = (colors: ThemeColors) => {
    const root = document.documentElement

    // Apply CSS variables for the theme colors
    root.style.setProperty('--theme-bg-from', colors.parentBackground.from)
    root.style.setProperty('--theme-bg-via', colors.parentBackground.via)
    root.style.setProperty('--theme-bg-to', colors.parentBackground.to)

    root.style.setProperty('--theme-card-bg-from', colors.prismCard.background.from)
    root.style.setProperty('--theme-card-bg-via', colors.prismCard.background.via)
    root.style.setProperty('--theme-card-bg-to', colors.prismCard.background.to)

    root.style.setProperty('--theme-card-glow-from', colors.prismCard.glowGradient.from)
    root.style.setProperty('--theme-card-glow-via', colors.prismCard.glowGradient.via)
    root.style.setProperty('--theme-card-glow-to', colors.prismCard.glowGradient.to)
    root.style.setProperty('--theme-card-border', colors.prismCard.borderColor)

    root.style.setProperty('--theme-text-primary', colors.text.primary)
    root.style.setProperty('--theme-text-secondary', colors.text.secondary)
    root.style.setProperty('--theme-text-accent', colors.text.accent)
    root.style.setProperty('--theme-text-muted', colors.text.muted)

    root.style.setProperty('--theme-btn-primary-bg', colors.buttons.primary.background)
    root.style.setProperty('--theme-btn-primary-hover', colors.buttons.primary.hover)
    root.style.setProperty('--theme-btn-primary-text', colors.buttons.primary.text)

    root.style.setProperty('--theme-btn-secondary-bg', colors.buttons.secondary.background)
    root.style.setProperty('--theme-btn-secondary-hover', colors.buttons.secondary.hover)
    root.style.setProperty('--theme-btn-secondary-text', colors.buttons.secondary.text)

    root.style.setProperty('--theme-status-success', colors.status.success)
    root.style.setProperty('--theme-status-warning', colors.status.warning)
    root.style.setProperty('--theme-status-error', colors.status.error)
    root.style.setProperty('--theme-status-info', colors.status.info)

    // Apply parent background gradient to body
    const gradient = `linear-gradient(135deg, ${colors.parentBackground.from}, ${colors.parentBackground.via}, ${colors.parentBackground.to})`
    document.body.style.background = gradient
    document.body.style.minHeight = '100vh'
  }

  useEffect(() => {
    loadTheme()
  }, [user])

  const refreshTheme = async () => {
    await loadTheme()
  }

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        colors: activeTheme?.colors || null,
        loading,
        refreshTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}