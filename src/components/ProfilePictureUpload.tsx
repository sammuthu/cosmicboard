'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Upload, X, Check, RotateCw, ZoomIn, ZoomOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface ProfilePictureUploadProps {
  currentAvatar?: string | null
  onUploadComplete: (avatarUrl: string) => void
  onCancel: () => void
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface AvatarHistory {
  id: string
  url: string
  isActive: boolean
  uploadedAt: string
  metadata?: {
    originalFormat?: string
    size?: number
    fileName?: string
  }
}

export default function ProfilePictureUpload({
  currentAvatar,
  onUploadComplete,
  onCancel
}: ProfilePictureUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarHistory, setAvatarHistory] = useState<AvatarHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch avatar history on mount
  useEffect(() => {
    fetchAvatarHistory()
  }, [])

  const fetchAvatarHistory = async () => {
    try {
      setLoadingHistory(true)
      const history = await apiClient.get('/auth/avatar-history')
      setAvatarHistory(history)
    } catch (error) {
      console.error('Failed to fetch avatar history:', error)
      toast.error('Failed to load avatar history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDeleteAvatar = async (avatarId: string) => {
    try {
      await apiClient.delete(`/auth/avatar/${avatarId}`)
      toast.success('Avatar deleted')
      // Update local state
      setAvatarHistory(prev => prev.filter(a => a.id !== avatarId))
    } catch (error: any) {
      console.error('Failed to delete avatar:', error)
      toast.error(error.message || 'Failed to delete avatar')
    }
  }

  const handleSetActiveAvatar = async (avatarId: string, avatarUrl: string) => {
    try {
      await apiClient.patch(`/auth/avatar/${avatarId}/activate`, {})
      toast.success('Avatar updated')
      // Update local state
      setAvatarHistory(prev =>
        prev.map(a => ({ ...a, isActive: a.id === avatarId }))
      )
      // Notify parent component
      onUploadComplete(avatarUrl)
    } catch (error: any) {
      console.error('Failed to set active avatar:', error)
      toast.error(error.message || 'Failed to update avatar')
    }
  }

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image (including HEIC)
    const isImage = file.type.startsWith('image/') ||
                    file.name.toLowerCase().endsWith('.heic') ||
                    file.name.toLowerCase().endsWith('.heif')

    if (!isImage) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    // Check if it's HEIC and convert to JPEG for browser compatibility
    let fileToRead = file
    const isHEIC = file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' ||
                   file.type === 'image/heif'

    if (isHEIC) {
      try {
        const loadingToast = toast.loading('Converting HEIC image...')
        const heic2any = (await import('heic2any')).default
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        })

        // heic2any can return Blob or Blob[], handle both cases
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        fileToRead = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg'
        })
        toast.dismiss(loadingToast)
      } catch (error) {
        console.error('Error converting HEIC:', error)
        toast.error('Failed to convert HEIC image. Please try a different file.')
        return
      }
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(fileToRead)
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = 512
    canvas.width = maxSize
    canvas.height = maxSize

    ctx.translate(maxSize / 2, maxSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-maxSize / 2, -maxSize / 2)

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      maxSize,
      maxSize
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.9)
    })
  }

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('Please select an image first')
      return
    }

    setUploading(true)
    try {
      // Get cropped image
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

      // Upload to server
      const formData = new FormData()
      formData.append('file', croppedImage, 'profile.jpg')

      const response = await apiClient.upload('/auth/profile-picture', formData)

      toast.success('Profile picture updated!')
      // Refresh avatar history
      await fetchAvatarHistory()
      onUploadComplete(response.avatar)
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Upload Profile Picture</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!imageSrc ? (
            <div>
              {/* Avatar Gallery */}
              {avatarHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Your Profile Pictures</h3>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {avatarHistory.map((avatar) => (
                      <div
                        key={avatar.id}
                        className="relative group"
                      >
                        <div
                          className={`relative w-full aspect-square rounded-lg overflow-hidden bg-gray-800 cursor-pointer transition-all ${
                            avatar.isActive
                              ? 'ring-2 ring-purple-500'
                              : 'hover:ring-2 hover:ring-gray-500'
                          }`}
                          onClick={() => !avatar.isActive && handleSetActiveAvatar(avatar.id, avatar.url)}
                        >
                          <img
                            src={avatar.url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                          {avatar.isActive && (
                            <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-md">
                              Active
                            </div>
                          )}
                        </div>
                        {!avatar.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAvatar(avatar.id)
                            }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete avatar"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Click on any avatar to set it as active. Delete inactive avatars with the × button.
                  </p>
                </div>
              )}

              {/* Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Upload New Picture</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2">Click to upload image</p>
                  <p className="text-gray-500 text-sm">
                    Supports: JPG, PNG, GIF, HEIC • Max size: 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Image cropping
            <div>
              <div className="relative h-96 bg-gray-950 rounded-xl overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Controls */}
              <div className="mt-6 space-y-4">
                {/* Zoom */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setZoom(Math.max(1, zoom - 0.1))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={zoom <= 1}
                  >
                    <ZoomOut className="w-5 h-5 text-gray-400" />
                  </button>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setZoom(Math.min(3, zoom + 0.1))
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Rotation */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setRotation((rotation - 15 + 360) % 360)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <RotateCw className="w-5 h-5 text-gray-400 transform scale-x-[-1]" />
                  </button>
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setRotation((rotation + 15) % 360)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <RotateCw className="w-5 h-5 text-gray-400" />
                  </button>
                  <span className="text-gray-400 text-sm w-12">{rotation}°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={() => {
              setImageSrc(null)
              setZoom(1)
              setRotation(0)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={!imageSrc || uploading}
          >
            Reset
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!imageSrc || uploading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
