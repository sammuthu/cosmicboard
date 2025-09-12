'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Papa from 'papaparse'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, Download, ExternalLink, Loader2, AlertCircle, Table, Code, FileImage, FileVideo, FileAudio } from 'lucide-react'

// Import specific languages for syntax highlighting
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp'
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp'
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go'
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust'
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php'
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby'
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift'
import kotlin from 'react-syntax-highlighter/dist/esm/languages/hljs/kotlin'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown'
import plaintext from 'react-syntax-highlighter/dist/esm/languages/hljs/plaintext'

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('cpp', cpp)
SyntaxHighlighter.registerLanguage('csharp', csharp)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('rust', rust)
SyntaxHighlighter.registerLanguage('php', php)
SyntaxHighlighter.registerLanguage('ruby', ruby)
SyntaxHighlighter.registerLanguage('swift', swift)
SyntaxHighlighter.registerLanguage('kotlin', kotlin)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('plaintext', plaintext)

interface FileViewerProps {
  url: string
  fileName: string
  mimeType: string
  extension?: string
  mediaId?: string  // Add mediaId for proxy endpoint
}

type ViewerType = 'pdf' | 'image' | 'video' | 'audio' | 'code' | 'csv' | 'markdown' | 'office' | 'text' | 'unsupported'

export default function FileViewer({ url, fileName, mimeType, extension, mediaId }: FileViewerProps) {
  const [content, setContent] = useState<string>('')
  const [csvData, setCsvData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use proxy URL if mediaId is provided and URL points to LocalStack
  const getProxyUrl = () => {
    if (mediaId && url.includes('localhost:4566')) {
      // Get the backend URL from environment or default to localhost
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7779'
      return `${backendUrl}/api/media/${mediaId}/file`
    }
    return url
  }
  
  const fileUrl = getProxyUrl()

  // Initialize PDF viewer plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  // Determine viewer type based on mime type and extension
  const viewerType = useMemo((): ViewerType => {
    // Extract extension from filename if not provided
    let ext = extension?.toLowerCase() || ''
    if (!ext && fileName) {
      const lastDot = fileName.lastIndexOf('.')
      if (lastDot > -1) {
        ext = fileName.slice(lastDot + 1).toLowerCase()
      }
    }
    const mime = mimeType?.toLowerCase() || ''

    // PDF
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'

    // Images
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
      return 'image'
    }

    // Video
    if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
      return 'video'
    }

    // Audio
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
      return 'audio'
    }

    // CSV
    if (mime === 'text/csv' || ext === 'csv') return 'csv'

    // Markdown
    if (['md', 'markdown'].includes(ext)) return 'markdown'

    // Office documents - will use iframe with online viewers
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) || 
        mime.includes('officedocument') || mime.includes('msword') || 
        mime.includes('ms-excel') || mime.includes('ms-powerpoint')) {
      return 'office'
    }

    // Code files
    const codeExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 
      'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'bash', 'json', 'xml', 'html',
      'css', 'scss', 'sass', 'less', 'yml', 'yaml', 'toml', 'ini', 'conf',
      'dockerfile', 'makefile', 'cmake', 'gradle', 'vue', 'svelte'
    ]
    if (codeExtensions.includes(ext) || mime === 'application/json' || mime === 'application/xml') {
      return 'code'
    }

    // Plain text
    if (mime.startsWith('text/') || ['txt', 'log', 'env'].includes(ext)) {
      return 'text'
    }

    return 'unsupported'
  }, [mimeType, extension])

  // Get syntax highlighting language
  const getSyntaxLanguage = (ext: string): string => {
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'cpp',
      'cpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'json': 'json',
      'xml': 'xml',
      'html': 'xml',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'less': 'css',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'markdown': 'markdown'
    }
    return languageMap[ext] || 'plaintext'
  }

  // Load text-based content
  useEffect(() => {
    if (['code', 'text', 'markdown', 'csv'].includes(viewerType)) {
      setLoading(true)
      setError(null)
      
      // Include auth headers when fetching through proxy
      const fetchOptions: RequestInit = {}
      if (fileUrl.includes('/api/media/')) {
        // Try to get token from auth_tokens first, then fallback to token
        const authTokens = localStorage.getItem('auth_tokens')
        let token = null
        if (authTokens) {
          try {
            const parsed = JSON.parse(authTokens)
            token = parsed.accessToken || parsed.refreshToken
          } catch (e) {
            console.error('Error parsing auth tokens:', e)
          }
        }
        if (!token) {
          token = localStorage.getItem('token')
        }
        
        if (token) {
          fetchOptions.headers = {
            'Authorization': `Bearer ${token}`
          }
        }
      }
      
      fetch(fileUrl, fetchOptions)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load file')
          return res.text()
        })
        .then(text => {
          if (viewerType === 'csv') {
            // Parse CSV
            Papa.parse(text, {
              complete: (result) => {
                setCsvData(result.data)
                setLoading(false)
              },
              header: true,
              skipEmptyLines: true
            })
          } else {
            setContent(text)
            setLoading(false)
          }
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [fileUrl, viewerType])

  // Render CSV as table
  const renderCsvTable = () => {
    if (csvData.length === 0) return null

    const headers = Object.keys(csvData[0])
    
    return (
      <div className="overflow-auto max-h-[70vh] bg-gray-900 rounded-lg p-4">
        <table className="w-full text-sm text-white">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left font-semibold border-b border-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/50 transition-colors">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border-b border-gray-700/50">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Office document viewer using Google Docs Viewer or Office Online
  const renderOfficeViewer = () => {
    // Use Google Docs Viewer for public URLs
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    
    return (
      <div className="w-full h-full min-h-[70vh] flex flex-col">
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
          <p className="text-yellow-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            For best viewing experience, you can also open this document externally:
          </p>
          <div className="flex gap-2 mt-2">
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Docs Viewer
            </a>
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
        <iframe
          src={viewerUrl}
          className="w-full flex-1 rounded-lg bg-white"
          title={fileName}
        />
      </div>
    )
  }

  // Main render logic
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg font-semibold">Failed to load file</p>
        <p className="text-sm text-white/60 mt-2">{error}</p>
        <a
          href={url}
          download={fileName}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </a>
      </div>
    )
  }

  switch (viewerType) {
    case 'pdf':
      // For proxy URLs, we need to add authentication
      const pdfUrl = (() => {
        if (fileUrl.includes('/api/media/')) {
          // Try to get token from auth_tokens first, then fallback to token
          const authTokens = localStorage.getItem('auth_tokens')
          let token = null
          if (authTokens) {
            try {
              const parsed = JSON.parse(authTokens)
              token = parsed.accessToken || parsed.refreshToken
            } catch (e) {
              console.error('Error parsing auth tokens:', e)
            }
          }
          if (!token) {
            token = localStorage.getItem('token')
          }
          
          if (token) {
            // PDF.js doesn't support headers, so we'll use a query param for auth
            // The backend accepts token from query param as well
            return `${fileUrl}?token=${encodeURIComponent(token)}`
          }
        }
        return fileUrl
      })()
      
      return (
        <div className="w-full h-[70vh]">
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      )

    case 'image':
      return (
        <div className="flex justify-center items-center p-4">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
          />
        </div>
      )

    case 'video':
      return (
        <div className="flex justify-center items-center p-4">
          <video
            controls
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
            preload="metadata"
          >
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )

    case 'audio':
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <FileAudio className="w-24 h-24 text-purple-400 mb-6" />
          <p className="text-white text-lg mb-4">{fileName}</p>
          <audio controls className="w-full max-w-md">
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )

    case 'code':
      return (
        <div className="overflow-auto max-h-[70vh]">
          <SyntaxHighlighter
            language={getSyntaxLanguage(extension || '')}
            style={atomOneDark}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      )

    case 'markdown':
      return (
        <div className="prose prose-invert max-w-none p-6 bg-gray-900 rounded-lg overflow-auto max-h-[70vh]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )

    case 'csv':
      return renderCsvTable()

    case 'text':
      return (
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[70vh]">
          <pre className="text-white font-mono text-sm whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      )

    case 'office':
      return renderOfficeViewer()

    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-semibold">Preview not available</p>
          <p className="text-sm text-white/60 mt-2">This file type cannot be previewed in the browser</p>
          <a
            href={fileUrl}
            download={fileName}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download File
          </a>
        </div>
      )
  }
}