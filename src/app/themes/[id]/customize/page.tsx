'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, RotateCcw, Palette, Type, Square, AlertCircle } from 'lucide-react'
import PrismCard from '@/components/PrismCard'
import {
  getThemeTemplate,
  getUserThemeCustomizations,
  getUserActiveTheme,
  saveThemeCustomization,
  deleteThemeCustomization,
  setActiveTheme,
  type ThemeTemplate,
  type ThemeColors,
  type UserThemeCustomization,
  type UserTheme
} from '@/lib/api/themes'
import { useAuth } from '@/contexts/AuthContext'

export default function ThemeCustomizePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const themeId = params.id as string

  const [template, setTemplate] = useState<ThemeTemplate | null>(null)
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null)
  const [existingCustomization, setExistingCustomization] = useState<UserThemeCustomization | null>(null)
  const [activeTheme, setActiveThemeState] = useState<UserTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('background')
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [showDeviceDialog, setShowDeviceDialog] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    loadThemeTemplate()
  }, [themeId, user])

  const loadThemeTemplate = async () => {
    try {
      setLoading(true)

      // Load the base template
      const templateData = await getThemeTemplate(themeId)
      setTemplate(templateData)

      // Check for existing user customizations and active theme
      try {
        const [customizations, activeThemeData] = await Promise.all([
          getUserThemeCustomizations(),
          getUserActiveTheme()
        ])

        setActiveThemeState(activeThemeData)
        const existingCustom = customizations.find(c => c.themeId === themeId)

        if (existingCustom && existingCustom.customColors) {
          setExistingCustomization(existingCustom)
          // Merge template colors with custom colors
          const mergedColors = {
            ...templateData.colors,
            ...existingCustom.customColors
          } as ThemeColors
          setCustomColors(JSON.parse(JSON.stringify(mergedColors)))
        } else {
          // No customization exists, use template colors
          setCustomColors(JSON.parse(JSON.stringify(templateData.colors)))
        }
      } catch (error) {
        console.log('No existing customizations, using template defaults')
        setCustomColors(JSON.parse(JSON.stringify(templateData.colors)))
      }
    } catch (error) {
      console.error('Error loading theme template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (path: string, value: string) => {
    if (!customColors) return

    const newColors = { ...customColors }
    const keys = path.split('.')
    let current: any = newColors

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    setCustomColors(newColors)
  }

  const handleSave = async (andApply: boolean = false) => {
    if (!customColors) return

    try {
      setSaving(true)
      const result = await saveThemeCustomization(themeId, customColors)
      console.log('Theme customization saved:', result)

      // Update the existing customization reference
      if (result && result.id) {
        setExistingCustomization(result)
      }

      if (andApply) {
        setShowDeviceDialog(true)
      } else {
        // Navigate back to themes gallery
        router.push('/themes')
      }
    } catch (error) {
      console.error('Error saving theme customization:', error)
      alert('Failed to save theme customization. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const applyThemeWithScope = async (isGlobal: boolean) => {
    try {
      setShowDeviceDialog(false)
      await setActiveTheme(themeId, isGlobal, 'desktop')
      // Navigate back to themes gallery or reload
      router.push('/themes')
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  }

  const handleReset = async () => {
    if (template) {
      try {
        setResetting(true)

        // Reset to original template colors
        setCustomColors(JSON.parse(JSON.stringify(template.colors)))

        // If there's an existing customization, delete it from database
        if (existingCustomization) {
          await deleteThemeCustomization(existingCustomization.id)
          setExistingCustomization(null)
          setIsReset(true)  // Disable Save button after successful reset
          console.log('Theme customization deleted, reset to defaults')

          // Navigate back to themes gallery after successful reset
          setTimeout(() => {
            router.push('/themes')
          }, 500)
        } else {
          // If no existing customization, mark as reset and navigate back
          setIsReset(true)
          router.push('/themes')
        }
      } catch (error) {
        console.error('Error resetting theme:', error)
        // Silently handle error, just log it
      } finally {
        setResetting(false)
      }
    }
  }

  if (loading || !template || !customColors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading theme editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/themes')}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Customize {template.displayName} Theme
              </h1>
              <p className="text-gray-400 mt-1">
                Adjust colors to create your perfect theme
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {resetting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleSave(activeTheme?.themeId === themeId)}
              disabled={saving || isReset}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{activeTheme?.themeId === themeId ? 'Save and Apply' : 'Save Theme'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveSection('background')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'background'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4" />
                Background
              </button>
              <button
                onClick={() => setActiveSection('card')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'card'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Square className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setActiveSection('text')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'text'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                Text
              </button>
              <button
                onClick={() => setActiveSection('buttons')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'buttons'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Square className="w-4 h-4" />
                Buttons
              </button>
              <button
                onClick={() => setActiveSection('status')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === 'status'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Status
              </button>
            </div>

            {/* Color Controls */}
            <PrismCard>
              <div className="p-6 space-y-4">
                {activeSection === 'background' && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Parent Background Gradient</h3>
                    <ColorInput
                      label="From"
                      value={customColors.parentBackground.from}
                      onChange={(value) => handleColorChange('parentBackground.from', value)}
                    />
                    <ColorInput
                      label="Via"
                      value={customColors.parentBackground.via}
                      onChange={(value) => handleColorChange('parentBackground.via', value)}
                    />
                    <ColorInput
                      label="To"
                      value={customColors.parentBackground.to}
                      onChange={(value) => handleColorChange('parentBackground.to', value)}
                    />
                  </>
                )}

                {activeSection === 'card' && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Card Appearance</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Background Gradient</h4>
                        <ColorInput
                          label="From"
                          value={customColors.prismCard.background.from}
                          onChange={(value) => handleColorChange('prismCard.background.from', value)}
                        />
                        <ColorInput
                          label="Via"
                          value={customColors.prismCard.background.via}
                          onChange={(value) => handleColorChange('prismCard.background.via', value)}
                        />
                        <ColorInput
                          label="To"
                          value={customColors.prismCard.background.to}
                          onChange={(value) => handleColorChange('prismCard.background.to', value)}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Glow Effect</h4>
                        <ColorInput
                          label="From"
                          value={customColors.prismCard.glowGradient.from}
                          onChange={(value) => handleColorChange('prismCard.glowGradient.from', value)}
                        />
                        <ColorInput
                          label="Via"
                          value={customColors.prismCard.glowGradient.via}
                          onChange={(value) => handleColorChange('prismCard.glowGradient.via', value)}
                        />
                        <ColorInput
                          label="To"
                          value={customColors.prismCard.glowGradient.to}
                          onChange={(value) => handleColorChange('prismCard.glowGradient.to', value)}
                        />
                      </div>
                      <ColorInput
                        label="Border Color"
                        value={customColors.prismCard.borderColor}
                        onChange={(value) => handleColorChange('prismCard.borderColor', value)}
                      />
                    </div>
                  </>
                )}

                {activeSection === 'text' && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Text Colors</h3>
                    <ColorInput
                      label="Primary"
                      value={customColors.text.primary}
                      onChange={(value) => handleColorChange('text.primary', value)}
                    />
                    <ColorInput
                      label="Secondary"
                      value={customColors.text.secondary}
                      onChange={(value) => handleColorChange('text.secondary', value)}
                    />
                    <ColorInput
                      label="Accent"
                      value={customColors.text.accent}
                      onChange={(value) => handleColorChange('text.accent', value)}
                    />
                    <ColorInput
                      label="Muted"
                      value={customColors.text.muted}
                      onChange={(value) => handleColorChange('text.muted', value)}
                    />
                  </>
                )}

                {activeSection === 'buttons' && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Button Colors</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Primary Button</h4>
                        <ColorInput
                          label="Background"
                          value={customColors.buttons.primary.background}
                          onChange={(value) => handleColorChange('buttons.primary.background', value)}
                        />
                        <ColorInput
                          label="Hover"
                          value={customColors.buttons.primary.hover}
                          onChange={(value) => handleColorChange('buttons.primary.hover', value)}
                        />
                        <ColorInput
                          label="Text"
                          value={customColors.buttons.primary.text}
                          onChange={(value) => handleColorChange('buttons.primary.text', value)}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Secondary Button</h4>
                        <ColorInput
                          label="Background"
                          value={customColors.buttons.secondary.background}
                          onChange={(value) => handleColorChange('buttons.secondary.background', value)}
                        />
                        <ColorInput
                          label="Hover"
                          value={customColors.buttons.secondary.hover}
                          onChange={(value) => handleColorChange('buttons.secondary.hover', value)}
                        />
                        <ColorInput
                          label="Text"
                          value={customColors.buttons.secondary.text}
                          onChange={(value) => handleColorChange('buttons.secondary.text', value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'status' && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Status Colors</h3>
                    <ColorInput
                      label="Success"
                      value={customColors.status.success}
                      onChange={(value) => handleColorChange('status.success', value)}
                    />
                    <ColorInput
                      label="Warning"
                      value={customColors.status.warning}
                      onChange={(value) => handleColorChange('status.warning', value)}
                    />
                    <ColorInput
                      label="Error"
                      value={customColors.status.error}
                      onChange={(value) => handleColorChange('status.error', value)}
                    />
                    <ColorInput
                      label="Info"
                      value={customColors.status.info}
                      onChange={(value) => handleColorChange('status.info', value)}
                    />
                  </>
                )}
              </div>
            </PrismCard>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
            <div
              className="rounded-xl p-8 min-h-[600px]"
              style={{
                background: `linear-gradient(135deg, ${customColors.parentBackground.from}, ${customColors.parentBackground.via}, ${customColors.parentBackground.to})`
              }}
            >
              {/* Preview Card */}
              <div
                className="rounded-lg border backdrop-blur-sm p-6 space-y-4"
                style={{
                  background: `linear-gradient(135deg, ${customColors.prismCard.background.from}, ${customColors.prismCard.background.via}, ${customColors.prismCard.background.to})`,
                  borderColor: customColors.prismCard.borderColor,
                  boxShadow: `0 0 50px ${customColors.prismCard.glowGradient.from}40`
                }}
              >
                <h2 style={{ color: customColors.text.primary }} className="text-2xl font-bold">
                  Preview Card
                </h2>
                <p style={{ color: customColors.text.secondary }}>
                  This is how your theme will look with the current color settings.
                </p>
                <p style={{ color: customColors.text.accent }} className="font-medium">
                  Accent text appears like this
                </p>
                <p style={{ color: customColors.text.muted }} className="text-sm">
                  Muted text for less important content
                </p>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    style={{
                      backgroundColor: customColors.buttons.primary.background,
                      color: customColors.buttons.primary.text
                    }}
                    className="px-4 py-2 rounded-lg font-medium"
                  >
                    Primary Button
                  </button>
                  <button
                    style={{
                      backgroundColor: customColors.buttons.secondary.background,
                      color: customColors.buttons.secondary.text
                    }}
                    className="px-4 py-2 rounded-lg font-medium"
                  >
                    Secondary Button
                  </button>
                </div>

                {/* Status badges */}
                <div className="flex gap-2 pt-4">
                  <span
                    style={{ backgroundColor: `${customColors.status.success}20`, color: customColors.status.success }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    Success
                  </span>
                  <span
                    style={{ backgroundColor: `${customColors.status.warning}20`, color: customColors.status.warning }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    Warning
                  </span>
                  <span
                    style={{ backgroundColor: `${customColors.status.error}20`, color: customColors.status.error }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    Error
                  </span>
                  <span
                    style={{ backgroundColor: `${customColors.status.info}20`, color: customColors.status.info }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    Info
                  </span>
                </div>
              </div>

              {/* Second preview card */}
              <div
                className="rounded-lg border backdrop-blur-sm p-6 mt-4"
                style={{
                  background: `linear-gradient(135deg, ${customColors.prismCard.background.from}, ${customColors.prismCard.background.via}, ${customColors.prismCard.background.to})`,
                  borderColor: customColors.prismCard.borderColor
                }}
              >
                <h3 style={{ color: customColors.text.primary }} className="text-lg font-bold mb-2">
                  Another Card
                </h3>
                <p style={{ color: customColors.text.secondary }} className="text-sm">
                  Multiple cards show how your theme scales across the interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Selection Dialog */}
      {showDeviceDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PrismCard className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Apply Theme</h3>
              <p className="text-gray-300 mb-6">
                Where would you like to apply this customized theme?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => applyThemeWithScope(false)}
                  className="w-full px-4 py-3 rounded-lg font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                  This device only
                </button>

                <button
                  onClick={() => applyThemeWithScope(true)}
                  className="w-full px-4 py-3 rounded-lg font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                >
                  All devices
                </button>

                <button
                  onClick={() => setShowDeviceDialog(false)}
                  className="w-full px-4 py-3 rounded-lg font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </PrismCard>
        </div>
      )}
    </div>
  )
}

// Color Input Component
function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  // Convert rgba to hex for color picker
  const rgbaToHex = (rgba: string): string => {
    if (rgba.startsWith('#')) {
      return rgba
    }

    // Parse rgba string
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);

      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    return '#000000';
  }

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha === 1) {
      return `rgba(${r}, ${g}, ${b}, 1)`;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle color picker change
  const handleColorChange = (hexColor: string) => {
    // If original value was rgba, convert back to rgba
    if (value.startsWith('rgba')) {
      // Extract alpha value from original
      const alphaMatch = value.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
      const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
      onChange(hexToRgba(hexColor, alpha));
    } else {
      onChange(hexColor);
    }
  }

  const hexValue = rgbaToHex(value);

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-300">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm font-mono w-40"
          placeholder="#000000 or rgba()"
        />
      </div>
    </div>
  )
}