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
  const response = await apiClient('/themes/templates')
  if (!response.ok) {
    throw new Error('Failed to fetch theme templates')
  }
  const data = await response.json()
  return data.data
}

// Get a specific theme template
export async function getThemeTemplate(id: string): Promise<ThemeTemplate> {
  const response = await apiClient(`/themes/templates/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch theme template')
  }
  const data = await response.json()
  return data.data
}

// Get user's active theme
export async function getUserActiveTheme(): Promise<UserTheme> {
  const response = await apiClient('/themes/user/active')
  if (!response.ok) {
    throw new Error('Failed to fetch user theme')
  }
  const data = await response.json()
  return data.data
}

// Get all user's theme customizations
export async function getUserThemeCustomizations(): Promise<UserThemeCustomization[]> {
  const response = await apiClient('/themes/user/customizations')
  if (!response.ok) {
    throw new Error('Failed to fetch user customizations')
  }
  const data = await response.json()
  return data.data
}

// Create or update user theme customization
export async function saveThemeCustomization(themeId: string, customColors: ThemeColors): Promise<any> {
  const response = await apiClient('/themes/user/customize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      themeId,
      customColors,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to save theme customization')
  }
  const data = await response.json()
  return data.data
}

// Set active theme without customization
export async function setActiveTheme(themeId: string): Promise<any> {
  const response = await apiClient('/themes/user/set-active', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ themeId }),
  })
  if (!response.ok) {
    throw new Error('Failed to set active theme')
  }
  const data = await response.json()
  return data.data
}

// Delete user theme customization
export async function deleteThemeCustomization(id: string): Promise<void> {
  const response = await apiClient(`/themes/user/customizations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete customization')
  }
}