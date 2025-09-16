'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles, Palette } from 'lucide-react'
import PrismCard from '@/components/PrismCard'
import { saveThemeCustomization, getThemeTemplates, type ThemeColors, type ThemeTemplate } from '@/lib/api/themes'
import { useAuth } from '@/contexts/AuthContext'

export default function NewThemePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [selectedBaseTheme, setSelectedBaseTheme] = useState<string>('')
  const [themes, setThemes] = useState<ThemeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [customName, setCustomName] = useState('')

  // Load themes on mount
  useState(() => {
    const loadThemes = async () => {
      try {
        const data = await getThemeTemplates()
        setThemes(data)
        if (data.length > 0) {
          setSelectedBaseTheme(data[0].id)
        }
      } catch (error) {
        console.error('Error loading themes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadThemes()
  })

  const handleCreate = () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (selectedBaseTheme) {
      // Navigate to the customization page for the selected base theme
      router.push(`/themes/${selectedBaseTheme}/customize`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/themes')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Create Custom Theme
            </h1>
            <p className="text-gray-400 mt-1">
              Start with a base theme and customize it to your liking
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Step 1: Choose Base Theme */}
          <PrismCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Step 1: Choose a Base Theme
              </h2>
              <p className="text-gray-400 mb-6">
                Select a theme to use as your starting point. You can customize all colors after selection.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const colors = theme.colors
                  const isSelected = selectedBaseTheme === theme.id

                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedBaseTheme(theme.id)}
                      className={`
                        relative rounded-lg overflow-hidden border-2 transition-all
                        ${isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Theme Preview */}
                      <div
                        className="h-24 relative"
                        style={{
                          background: `linear-gradient(135deg, ${colors.parentBackground.from}, ${colors.parentBackground.via}, ${colors.parentBackground.to})`
                        }}
                      >
                        <div
                          className="absolute inset-2 rounded border backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.prismCard.background.from}, ${colors.prismCard.background.via}, ${colors.prismCard.background.to})`,
                            borderColor: colors.prismCard.borderColor
                          }}
                        >
                          <div className="p-2">
                            <div className="h-1 w-10 rounded-full mb-1" style={{ backgroundColor: colors.text.primary }}></div>
                            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: colors.text.secondary }}></div>
                            <div className="flex gap-1 mt-2">
                              <div
                                className="h-3 w-6 rounded"
                                style={{ backgroundColor: colors.buttons.primary.background }}
                              ></div>
                              <div
                                className="h-3 w-6 rounded"
                                style={{ backgroundColor: colors.buttons.secondary.background }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Theme Name */}
                      <div className="p-2 bg-gray-900/50">
                        <p className="text-white text-sm font-medium">
                          {theme.displayName}
                        </p>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </PrismCard>

          {/* Step 2: Name Your Theme */}
          <PrismCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Step 2: Name Your Custom Theme (Optional)
              </h2>
              <p className="text-gray-400 mb-4">
                Give your custom theme a unique name to identify it later.
              </p>

              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Custom ${themes.find(t => t.id === selectedBaseTheme)?.displayName || 'Theme'}`}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </PrismCard>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push('/themes')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedBaseTheme}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              Start Customizing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}