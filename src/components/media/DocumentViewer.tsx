'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { 
  FileText, Upload, Download, Trash2, Edit2, X, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Maximize2, File, FileArchive, FileCode, FileSpreadsheet,
  FileImage, FileVideo, FileAudio, Eye, EyeOff
} from 'lucide-react'
import PrismCardMedia from '@/components/PrismCardMedia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'

// Dynamically import FileViewer to avoid SSR issues with PDF viewer
const FileViewer = dynamic(() => import('./FileViewer'), { ssr: false })

interface DocumentFile {
  id: string
  name: string
  originalName: string
  url: string
  size: number
  mimeType: string
  metadata?: {
    pages?: number
    extension?: string
    isViewable?: boolean
    type?: string
  }
  createdAt: string
}

interface DocumentViewerProps {
  documents: DocumentFile[]
  projectId: string
  onUpload: (file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
}

// Map file extensions to icons
const getFileIcon = (file: DocumentFile) => {
  const extension = file.metadata?.extension?.toLowerCase() || ''
  const mimeType = file.mimeType?.toLowerCase() || ''
  
  // Images
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return <FileImage className="w-10 h-10 text-green-400 flex-shrink-0" />
  }
  
  // PDFs
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return <FileText className="w-10 h-10 text-red-400 flex-shrink-0" />
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv'].includes(extension) || mimeType.includes('spreadsheet')) {
    return <FileSpreadsheet className="w-10 h-10 text-emerald-400 flex-shrink-0" />
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'yml', 'yaml'].includes(extension)) {
    return <FileCode className="w-10 h-10 text-blue-400 flex-shrink-0" />
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return <FileArchive className="w-10 h-10 text-purple-400 flex-shrink-0" />
  }
  
  // Video
  if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) {
    return <FileVideo className="w-10 h-10 text-pink-400 flex-shrink-0" />
  }
  
  // Audio
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension)) {
    return <FileAudio className="w-10 h-10 text-yellow-400 flex-shrink-0" />
  }
  
  // Default file icon
  return <File className="w-10 h-10 text-gray-400 flex-shrink-0" />
}

// Format file type/kind
const getFileKind = (file: DocumentFile) => {
  const extension = file.metadata?.extension?.toUpperCase() || ''
  const mimeType = file.mimeType?.toLowerCase() || ''
  
  if (mimeType.startsWith('image/')) return `${extension} Image`
  if (mimeType === 'application/pdf') return 'PDF Document'
  if (mimeType.includes('spreadsheet') || ['XLS', 'XLSX', 'CSV'].includes(extension)) return 'Spreadsheet'
  if (mimeType.includes('word') || ['DOC', 'DOCX'].includes(extension)) return 'Word Document'
  if (mimeType.includes('powerpoint') || ['PPT', 'PPTX'].includes(extension)) return 'Presentation'
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(extension)) return 'Archive'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (['JS', 'TS', 'JSX', 'TSX', 'PY', 'JAVA', 'C', 'CPP', 'CS', 'PHP', 'RB', 'GO', 'RS'].includes(extension)) return 'Source Code'
  if (extension) return `${extension} File`
  return 'Document'
}

export default function DocumentViewer({
  documents,
  projectId,
  onUpload,
  onDelete,
  onRename
}: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [sortBy, setSortBy] = useState<'name' | 'kind' | 'size' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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

  const openViewer = (doc: DocumentFile) => {
    setSelectedDoc(doc)
    setCurrentPage(1)
    setZoom(100)
    document.body.style.overflow = 'hidden'
  }

  const closeViewer = () => {
    setSelectedDoc(null)
    document.body.style.overflow = 'auto'
  }

  const handleZoom = (direction: 'in' | 'out' | 'fit') => {
    if (direction === 'in') {
      setZoom(Math.min(zoom + 25, 200))
    } else if (direction === 'out') {
      setZoom(Math.max(zoom - 25, 50))
    } else {
      setZoom(100)
    }
  }

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    let compareValue = 0
    
    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'kind':
        compareValue = getFileKind(a).localeCompare(getFileKind(b))
        break
      case 'size':
        compareValue = a.size - b.size
        break
      case 'date':
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue
  })

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Check if file is viewable
  const isFileViewable = (doc: DocumentFile): boolean => {
    // Get extension from metadata or extract from filename
    let extension = doc.metadata?.extension?.toLowerCase() || ''
    if (!extension && doc.name) {
      const lastDot = doc.name.lastIndexOf('.')
      if (lastDot > -1) {
        extension = doc.name.slice(lastDot + 1).toLowerCase()
      }
    }
    const mimeType = doc.mimeType?.toLowerCase() || ''
    
    // List of viewable extensions
    const viewableExtensions = [
      // Documents
      'pdf', 'txt', 'md', 'markdown',
      // Code
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 
      'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'bash', 'json', 'xml', 'html',
      'css', 'scss', 'sass', 'less', 'yml', 'yaml', 'toml', 'ini', 'conf',
      // Data
      'csv',
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
      // Video
      'mp4', 'webm', 'ogg', 'mov',
      // Audio  
      'mp3', 'wav', 'ogg', 'flac', 'aac',
      // Office (with external viewer)
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
    ]
    
    return viewableExtensions.includes(extension) ||
           mimeType.startsWith('image/') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/') ||
           mimeType.startsWith('text/')
  }

  return (
    <>
      {/* Document List */}
      <PrismCardMedia variant="gallery" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white/90">Documents & Files</h3>
          <label className={cn(
            "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2",
            isUploading && "opacity-50 cursor-not-allowed"
          )}>
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/50">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg">No documents yet</p>
            <p className="text-sm mt-2">Upload any file to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">
                    <button
                      onClick={() => handleSort('name')}
                      className="hover:text-white transition-colors"
                    >
                      Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">
                    <button
                      onClick={() => handleSort('kind')}
                      className="hover:text-white transition-colors"
                    >
                      Kind {sortBy === 'kind' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">
                    <button
                      onClick={() => handleSort('size')}
                      className="hover:text-white transition-colors"
                    >
                      Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">
                    <button
                      onClick={() => handleSort('date')}
                      className="hover:text-white transition-colors"
                    >
                      Date Created {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-white/70 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc)}
                        {editingId === doc.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRename(doc.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(doc.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="flex-1 px-2 py-1 text-sm bg-white/10 backdrop-blur text-white rounded"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <button
                            onClick={() => isFileViewable(doc) && openViewer(doc)}
                            className={cn(
                              "text-white font-medium truncate text-left",
                              isFileViewable(doc) ? "hover:text-blue-400 cursor-pointer" : "cursor-default opacity-70"
                            )}
                            disabled={!isFileViewable(doc)}
                          >
                            {doc.name}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {getFileKind(doc)}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isFileViewable(doc) ? (
                          <button
                            onClick={() => openViewer(doc)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                        ) : (
                          <button
                            className="p-1.5 bg-white/5 rounded cursor-not-allowed opacity-40"
                            disabled
                            title="Preview not available"
                          >
                            <EyeOff className="w-4 h-4 text-white" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(doc.id)
                            setEditName(doc.name)
                          }}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                        <a
                          href={doc.url}
                          download={doc.originalName || doc.name}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors inline-block"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </a>
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 bg-red-500/50 hover:bg-red-500/70 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PrismCardMedia>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">
          {/* Toolbar */}
          <div className="bg-gray-900/90 border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeViewer}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="text-white">
                  <h3 className="font-semibold">{selectedDoc.name}</h3>
                  <p className="text-sm text-white/60">
                    {getFileKind(selectedDoc)} • {formatFileSize(selectedDoc.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls for PDFs and images */}
                {(selectedDoc.mimeType === 'application/pdf' || selectedDoc.mimeType.startsWith('image/')) && (
                  <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      disabled={zoom <= 50}
                    >
                      <ZoomOut className="w-4 h-4 text-white" />
                    </button>
                    <span className="px-2 text-sm text-white min-w-[50px] text-center">
                      {zoom}%
                    </span>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleZoom('fit')}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                {/* Page navigation for PDFs */}
                {selectedDoc.metadata?.pages && selectedDoc.metadata.pages > 1 && (
                  <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value)
                        if (page >= 1 && page <= (selectedDoc.metadata?.pages || 1)) {
                          setCurrentPage(page)
                        }
                      }}
                      className="w-12 px-2 py-1 text-sm bg-transparent text-white text-center focus:outline-none"
                      min={1}
                      max={selectedDoc.metadata?.pages || 1}
                    />
                    <button
                      onClick={() => setCurrentPage(Math.min(selectedDoc.metadata?.pages || 1, currentPage + 1))}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      disabled={currentPage >= (selectedDoc.metadata?.pages || 1)}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                <a
                  href={selectedDoc.url}
                  download={selectedDoc.originalName || selectedDoc.name}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-6xl mx-auto">
              <FileViewer
                url={selectedDoc.url}
                fileName={selectedDoc.name}
                mimeType={selectedDoc.mimeType}
                extension={selectedDoc.metadata?.extension}
                mediaId={selectedDoc.id}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}