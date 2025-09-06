'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Download, Trash2, Edit2, Upload, ImageIcon } from 'lucide-react'
import PrismCardMedia from '@/components/PrismCardMedia'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  metadata?: {
    width?: number
    height?: number
  }
  createdAt: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  projectId: string
  onUpload: (file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
}

export default function PhotoGallery({
  photos,
  projectId,
  onUpload,
  onDelete,
  onRename
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo)
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
    setSelectedIndex(-1)
    document.body.style.overflow = 'auto'
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedIndex === -1) return
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedIndex - 1)
      : Math.min(photos.length - 1, selectedIndex + 1)
    
    setSelectedIndex(newIndex)
    setSelectedPhoto(photos[newIndex])
  }

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [onUpload])

  const handleRename = async (id: string) => {
    if (!editName.trim()) return
    await onRename(id, editName)
    setEditingId(null)
    setEditName('')
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="space-y-4">
        {/* Upload Area */}
        <PrismCardMedia variant="gallery" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white/90">Photos</h3>
            <label className={cn(
              "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2",
              isUploading && "opacity-50 cursor-not-allowed"
            )}>
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p className="text-lg">No photos yet</p>
              <p className="text-sm mt-2">Upload your first photo to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <PrismCardMedia
                  key={photo.id}
                  variant="media"
                  aspectRatio="square"
                  onClick={() => openLightbox(photo, index)}
                  className="group relative"
                >
                  <Image
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      {editingId === photo.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRename(photo.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(photo.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="w-full px-2 py-1 text-xs bg-black/50 backdrop-blur text-white rounded"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-white text-xs truncate">{photo.name}</p>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(photo.id)
                          setEditName(photo.name)
                        }}
                        className="p-1 bg-black/50 backdrop-blur rounded hover:bg-black/70 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(photo.id)
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
          )}
        </PrismCardMedia>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                navigatePhoto('prev')
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          
          {selectedIndex < photos.length - 1 && (
            <button
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                navigatePhoto('next')
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Photo display */}
          <div 
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              width={selectedPhoto.metadata?.width || 1920}
              height={selectedPhoto.metadata?.height || 1080}
              className="max-w-full max-h-[85vh] object-contain"
              priority
            />
            
            {/* Photo info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">{selectedPhoto.name}</h3>
                  <p className="text-sm text-white/70">
                    {selectedPhoto.metadata?.width} × {selectedPhoto.metadata?.height} • {formatFileSize(selectedPhoto.size)}
                  </p>
                </div>
                <a
                  href={selectedPhoto.url}
                  download={selectedPhoto.name}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}