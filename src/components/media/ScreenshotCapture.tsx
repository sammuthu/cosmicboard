'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Clipboard, Image as ImageIcon, Save, X, Edit2, Trash2 } from 'lucide-react'
import PrismCardMedia from '@/components/PrismCardMedia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Screenshot {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  createdAt: string
}

interface ScreenshotCaptureProps {
  screenshots: Screenshot[]
  projectId: string
  onPaste: (imageData: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
}

export default function ScreenshotCapture({
  screenshots,
  projectId,
  onPaste,
  onDelete,
  onRename
}: ScreenshotCaptureProps) {
  const [pastedImage, setPastedImage] = useState<string | null>(null)
  const [screenshotName, setScreenshotName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null)

  // Generate default name with timestamp
  const generateDefaultName = () => {
    return `Screenshot ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`
  }

  // Handle paste event
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (!blob) continue

          const reader = new FileReader()
          reader.onload = (event) => {
            const imageData = event.target?.result as string
            setPastedImage(imageData)
            setScreenshotName(generateDefaultName())
          }
          reader.readAsDataURL(blob)
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleSave = async () => {
    if (!pastedImage) return

    setIsSaving(true)
    try {
      await onPaste(pastedImage, screenshotName || generateDefaultName())
      setPastedImage(null)
      setScreenshotName('')
    } catch (error) {
      console.error('Failed to save screenshot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setPastedImage(null)
    setScreenshotName('')
  }

  const handleRename = async (id: string) => {
    if (!editName.trim()) return
    await onRename(id, editName)
    setEditingId(null)
    setEditName('')
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Group screenshots by date
  const groupScreenshotsByDate = (screenshots: Screenshot[]) => {
    const groups: Record<string, Screenshot[]> = {}
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

    screenshots.forEach(screenshot => {
      const date = format(new Date(screenshot.createdAt), 'yyyy-MM-dd')
      let label = date
      
      if (date === today) label = 'Today'
      else if (date === yesterday) label = 'Yesterday'
      else label = format(new Date(screenshot.createdAt), 'MMMM d, yyyy')

      if (!groups[label]) groups[label] = []
      groups[label].push(screenshot)
    })

    return groups
  }

  const groupedScreenshots = groupScreenshotsByDate(screenshots)
  
  // Debug logging
  console.log('Screenshots prop:', screenshots)
  console.log('Grouped screenshots:', groupedScreenshots)

  return (
    <>
      {/* Paste Capture Area */}
      <PrismCardMedia variant="gallery" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white/90">Screenshots</h3>
          <div className="text-sm text-white/60">
            Press Cmd/Ctrl+V to paste
          </div>
        </div>

        {!pastedImage ? (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/30 transition-colors">
            <Clipboard className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/70 mb-2">Paste screenshot from clipboard</p>
            <p className="text-sm text-white/50">Copy any image and paste it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={pastedImage}
                alt="Pasted screenshot"
                width={800}
                height={450}
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={screenshotName}
                onChange={(e) => setScreenshotName(e.target.value)}
                placeholder="Screenshot name"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2",
                  isSaving && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </PrismCardMedia>

      {/* Screenshots Timeline */}
      {screenshots.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedScreenshots).map(([date, dateScreenshots]) => (
            <div key={date}>
              <h4 className="text-sm font-semibold text-white/60 mb-3">{date}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {dateScreenshots.map((screenshot) => (
                  <PrismCardMedia
                    key={screenshot.id}
                    variant="media"
                    aspectRatio="video"
                    onClick={() => setSelectedScreenshot(screenshot)}
                    className="group relative"
                  >
                    <Image
                      src={screenshot.thumbnailUrl || screenshot.url}
                      alt={screenshot.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        {editingId === screenshot.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRename(screenshot.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(screenshot.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="w-full px-2 py-1 text-xs bg-black/50 backdrop-blur text-white rounded"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div>
                            <p className="text-white text-xs truncate">{screenshot.name}</p>
                            <p className="text-white/60 text-[10px]">
                              {format(new Date(screenshot.createdAt), 'HH:mm')} • {formatFileSize(screenshot.size)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingId(screenshot.id)
                            setEditName(screenshot.name)
                          }}
                          className="p-1 bg-black/50 backdrop-blur rounded hover:bg-black/70 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(screenshot.id)
                          }}
                          className="p-1 bg-red-500/50 backdrop-blur rounded hover:bg-red-500/70 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  </PrismCardMedia>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot viewer modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            onClick={() => setSelectedScreenshot(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div 
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedScreenshot.url}
              alt={selectedScreenshot.name}
              width={1920}
              height={1080}
              className="max-w-full max-h-[85vh] object-contain"
              priority
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="font-semibold text-white">{selectedScreenshot.name}</h3>
              <p className="text-sm text-white/70">
                {format(new Date(selectedScreenshot.createdAt), 'PPp')} • {formatFileSize(selectedScreenshot.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}