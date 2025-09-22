'use client'

import { apiClient } from '@/lib/api-client'

export interface ThemeColors {
  parentBackground: {
    from: string
    via: string
    to: string
  }
  prismCard: {
    background: {
      from: string
      via: string
      to: string
    }
    glowGradient: {
      from: string
      via: string
      to: string
    }
    borderColor: string
  }
  text: {
    primary: string
    secondary: string
    accent: string
    muted: string
  }
  buttons: {
    primary: {
      background: string
      hover: string
      text: string
    }
    secondary: {
      background: string
      hover: string
      text: string
    }
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}

export interface ThemeTemplate {
  id: string
  name: string
  displayName: string
  description?: string
  isDefault: boolean
  colors: ThemeColors
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface UserTheme {
  id?: string
  themeId: string
  name: string
  displayName: string
  colors: ThemeColors
  isCustomized: boolean
}

export interface UserThemeCustomization {
  id: string
  themeId: string
  themeName: string
  themeDisplayName: string
  customColors: Partial<ThemeColors>
  isActive: boolean
  updatedAt: string
}

// Get all available theme templates
export async function getThemeTemplates(): Promise<ThemeTemplate[]> {
  const data = await apiClient.get('/themes/templates')
  return data.data
}

// Get a specific theme template
export async function getThemeTemplate(id: string): Promise<ThemeTemplate> {
  const data = await apiClient.get(`/themes/templates/${id}`)
  return data.data
}

// Get user's active theme
export async function getUserActiveTheme(): Promise<UserTheme> {
  const data = await apiClient.get('/themes/user/active')
  return data.data
}

// Get all user's theme customizations
export async function getUserThemeCustomizations(): Promise<UserThemeCustomization[]> {
  const data = await apiClient.get('/themes/user/customizations')
  return data.data
}

// Create or update user theme customization
export async function saveThemeCustomization(themeId: string, customColors: ThemeColors): Promise<any> {
  const data = await apiClient.post('/themes/user/customize', {
    themeId,
    customColors,
  })
  return data.data
}

// Set active theme without customization
export async function setActiveTheme(themeId: string, isGlobal: boolean = true, deviceType?: 'mobile' | 'tablet' | 'desktop'): Promise<any> {
  const data = await apiClient.post('/themes/user/set-active', {
    themeId,
    isGlobal,
    deviceType: isGlobal ? undefined : (deviceType || 'desktop')
  })
  return data.data
}

// Delete user theme customization
export async function deleteThemeCustomization(id: string): Promise<void> {
  await apiClient.delete(`/themes/user/customizations/${id}`)
}