'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Check, Edit2, ArrowLeft } from 'lucide-react'
import PrismCard from '@/components/PrismCard'
import { getThemeTemplates, getUserActiveTheme, getUserThemeCustomizations, setActiveTheme, deleteThemeCustomization, type ThemeTemplate, type UserTheme, type UserThemeCustomization } from '@/lib/api/themes'
import { useAuth } from '@/contexts/AuthContext'

export default function ThemesGalleryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [themes, setThemes] = useState<ThemeTemplate[]>([])
  const [userCustomizations, setUserCustomizations] = useState<UserThemeCustomization[]>([])
  const [activeTheme, setActiveThemeState] = useState<UserTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)

  useEffect(() => {
    loadThemes()
  }, [user])

  const loadThemes = async () => {
    try {
      setLoading(true)

      // Always load theme templates (they're public)
      const templatesData = await getThemeTemplates()
      setThemes(templatesData)

      // Only load user's themes if authenticated
      if (user) {
        try {
          const [activeData, customizationsData] = await Promise.all([
            getUserActiveTheme(),
            getUserThemeCustomizations()
          ])
          setActiveThemeState(activeData)
          setUserCustomizations(customizationsData || [])
        } catch (error) {
          console.error('Error loading user themes:', error)
          setActiveThemeState(null)
          setUserCustomizations([])
        }
      } else {
        setActiveThemeState(null)
        setUserCustomizations([])
      }
    } catch (error) {
      console.error('Error loading themes:', error)
      // Still try to show something even if there's an error
      setThemes([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTheme = async (themeId: string) => {
    if (!user) {
      router.push('/auth')
      return
    }

    try {
      setApplying(themeId)
      await setActiveTheme(themeId)
      await loadThemes()
      // Apply theme to current page
      window.location.reload()
    } catch (error) {
      console.error('Error applying theme:', error)
    } finally {
      setApplying(null)
    }
  }

  const handleCustomizeTheme = (themeId: string) => {
    if (!user) {
      router.push('/auth')
      return
    }
    router.push(`/themes/${themeId}/customize`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading themes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="container mx-auto max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
              Back to Home
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Theme Gallery
          </h1>
          <p className="text-gray-300 text-lg">
            Choose from our collection of cosmic themes or customize your own
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {themes.map((theme) => {
            // Check if user has customization for this theme
            const userCustomization = userCustomizations.find(c => c.themeId === theme.id)
            const isActive = activeTheme?.themeId === theme.id
            const hasCustomization = !!userCustomization

            // Deep merge function for nested color objects
            const deepMerge = (target: any, source: any): any => {
              const output = { ...target }
              for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                  if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                    output[key] = deepMerge(target[key], source[key])
                  } else {
                    output[key] = source[key]
                  }
                } else {
                  output[key] = source[key]
                }
              }
              return output
            }

            // Merge theme colors with user customization if it exists
            const colors = hasCustomization && userCustomization.customColors
              ? deepMerge(theme.colors, userCustomization.customColors)
              : theme.colors

            return (
              <PrismCard key={theme.id} className="relative group" data-testid="theme-card">
                {/* Badges */}
                <div className="absolute -top-2 -right-2 z-10 flex gap-2">
                  {isActive && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}
                  {hasCustomization && !isActive && (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Customized
                    </div>
                  )}
                </div>

                {/* Theme Preview */}
                <div
                  className="h-40 rounded-t-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${colors.parentBackground.from}, ${colors.parentBackground.via}, ${colors.parentBackground.to})`
                  }}
                >
                  {/* Mini card preview */}
                  <div
                    className="absolute inset-4 rounded-lg border backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${colors.prismCard.background.from}, ${colors.prismCard.background.via}, ${colors.prismCard.background.to})`,
                      borderColor: colors.prismCard.borderColor
                    }}
                  >
                    <div className="p-3">
                      <div className="h-2 w-20 rounded-full mb-2" style={{ backgroundColor: colors.text.primary }}></div>
                      <div className="h-2 w-16 rounded-full mb-2" style={{ backgroundColor: colors.text.secondary }}></div>
                      <div className="flex gap-2 mt-4">
                        <div
                          className="h-6 w-12 rounded"
                          style={{ backgroundColor: colors.buttons.primary.background }}
                        ></div>
                        <div
                          className="h-6 w-12 rounded"
                          style={{ backgroundColor: colors.buttons.secondary.background }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at center, ${colors.prismCard.glowGradient.from}, ${colors.prismCard.glowGradient.via}, transparent)`
                    }}
                  ></div>
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {theme.displayName}
                    {hasCustomization && (
                      <span className="text-xs text-blue-400 font-normal ml-2">(Customized)</span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {theme.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex gap-1 mb-4">
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: colors.text.primary }}
                      title="Primary Text"
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: colors.text.accent }}
                      title="Accent"
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: colors.buttons.primary.background }}
                      title="Primary Button"
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: colors.status.success }}
                      title="Success"
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ backgroundColor: colors.status.error }}
                      title="Error"
                    ></div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplyTheme(theme.id)}
                      disabled={isActive || applying === theme.id}
                      className={`
                        flex-1 px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                        ${isActive
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        }
                      `}
                    >
                      {applying === theme.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Applying...</span>
                        </>
                      ) : isActive ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4" />
                          <span>Apply</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCustomizeTheme(theme.id)}
                      className="px-3 py-2 rounded-lg font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2"
                      title="Customize this theme"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Customize</span>
                    </button>
                  </div>
                </div>
              </PrismCard>
            )
          })}
        </div>

        {/* Show customizations summary if user has any */}
        {user && userCustomizations.length > 0 && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              You have {userCustomizations.length} customized theme{userCustomizations.length > 1 ? 's' : ''}.
              Customized themes are marked with a blue badge.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}