'use client'

import { useState, useCallback } from 'react'
import { FileText, Upload, Download, Trash2, Edit2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import PrismCardMedia from '@/components/PrismCardMedia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface PDFFile {
  id: string
  name: string
  url: string
  size: number
  metadata?: {
    pages?: number
  }
  createdAt: string
}

interface PDFViewerProps {
  pdfs: PDFFile[]
  projectId: string
  onUpload: (file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
}

export default function PDFViewer({
  pdfs,
  projectId,
  onUpload,
  onDelete,
  onRename
}: PDFViewerProps) {
  const [selectedPDF, setSelectedPDF] = useState<PDFFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') return

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

  const openViewer = (pdf: PDFFile) => {
    setSelectedPDF(pdf)
    setCurrentPage(1)
    setZoom(100)
    document.body.style.overflow = 'hidden'
  }

  const closeViewer = () => {
    setSelectedPDF(null)
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

  return (
    <>
      {/* PDF List */}
      <PrismCardMedia variant="gallery" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white/90">PDF Documents</h3>
          <label className={cn(
            "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2",
            isUploading && "opacity-50 cursor-not-allowed"
          )}>
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload PDF'}
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {pdfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/50">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg">No PDF documents yet</p>
            <p className="text-sm mt-2">Upload your first PDF to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <PrismCardMedia
                key={pdf.id}
                variant="document"
                onClick={() => openViewer(pdf)}
                className="group"
              >
                <FileText className="w-10 h-10 text-red-400 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {editingId === pdf.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRename(pdf.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(pdf.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full px-2 py-1 text-sm bg-white/10 backdrop-blur text-white rounded"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <p className="text-white font-medium truncate">{pdf.name}</p>
                      <p className="text-sm text-white/60">
                        {pdf.metadata?.pages && `${pdf.metadata.pages} pages • `}
                        {formatFileSize(pdf.size)} • {format(new Date(pdf.createdAt), 'MMM d, yyyy')}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(pdf.id)
                      setEditName(pdf.name)
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <a
                    href={pdf.url}
                    download={pdf.name}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(pdf.id)
                    }}
                    className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </PrismCardMedia>
            ))}
          </div>
        )}
      </PrismCardMedia>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
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
                  <h3 className="font-semibold">{selectedPDF.name}</h3>
                  <p className="text-sm text-white/60">
                    {selectedPDF.metadata?.pages && `${currentPage} / ${selectedPDF.metadata.pages} pages`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
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

                {/* Page navigation */}
                {selectedPDF.metadata?.pages && selectedPDF.metadata.pages > 1 && (
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
                        if (page >= 1 && page <= (selectedPDF.metadata?.pages || 1)) {
                          setCurrentPage(page)
                        }
                      }}
                      className="w-12 px-2 py-1 text-sm bg-transparent text-white text-center focus:outline-none"
                      min={1}
                      max={selectedPDF.metadata?.pages || 1}
                    />
                    <button
                      onClick={() => setCurrentPage(Math.min(selectedPDF.metadata?.pages || 1, currentPage + 1))}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      disabled={currentPage >= (selectedPDF.metadata?.pages || 1)}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                <a
                  href={selectedPDF.url}
                  download={selectedPDF.name}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-6xl mx-auto">
              {/* Using iframe for PDF display as a simple solution */}
              <iframe
                src={`${selectedPDF.url}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full min-h-[800px] rounded-lg bg-white"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}