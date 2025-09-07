'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import PrismCard from '@/components/PrismCard'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import SearchableSelect from '@/components/SearchableSelect'
import PhotoGallery from '@/components/media/PhotoGallery'
import ScreenshotCapture from '@/components/media/ScreenshotCapture'
import PDFViewer from '@/components/media/PDFViewer'
import { ChevronDown, ChevronUp, Copy, Check, Search, ChevronLeft, ChevronRight, Image as ImageIcon, Camera, FileText } from 'lucide-react'
import { apiClient, getApiUrl } from '@/lib/api-client'
import { toast } from 'sonner'

// Language options for code snippets
const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'scala', label: 'Scala' },
  { value: 'r', label: 'R' },
  { value: 'dart', label: 'Dart' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS/Sass' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'lua', label: 'Lua' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'perl', label: 'Perl' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'apache', label: 'Apache' },
  { value: 'makefile', label: 'Makefile' },
  { value: 'cmake', label: 'CMake' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'plaintext', label: 'Plain Text' }
].sort((a, b) => a.label.localeCompare(b.label))

const fetcher = (url: string) => {
  // Extract endpoint from URL (remove /api prefix since apiClient handles it)
  const endpoint = url.replace('/api', '')
  return apiClient.get(endpoint)
}

type TabType = 'tasks' | 'references' | 'photos' | 'screenshots' | 'pdfs'
type TaskStatus = 'active' | 'completed' | 'deleted'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [taskTab, setTaskTab] = useState<TaskStatus>('active')
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewReference, setShowNewReference] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskContent, setNewTaskContent] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskTags, setNewTaskTags] = useState('')
  
  const [newRefTitle, setNewRefTitle] = useState('')
  const [newRefContent, setNewRefContent] = useState('')
  const [newRefCategory, setNewRefCategory] = useState('snippet')
  const [newRefPriority, setNewRefPriority] = useState('MEDIUM')
  const [newRefTags, setNewRefTags] = useState('')
  const [newRefLanguage, setNewRefLanguage] = useState('javascript')
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(11)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: project, error: projectError } = useSWR(
    projectId ? `/api/projects/${projectId}` : null,
    fetcher
  )
  
  const { data: tasks, error: tasksError } = useSWR(
    projectId && activeTab === 'tasks' ? `/api/tasks?projectId=${projectId}` : null,
    fetcher
  )
  
  const { data: references, error: refsError } = useSWR(
    projectId && activeTab === 'references' ? `/api/references?projectId=${projectId}` : null,
    fetcher
  )
  
  const { data: mediaData } = useSWR(
    projectId && (activeTab === 'photos' || activeTab === 'screenshots' || activeTab === 'pdfs') 
      ? `/api/media?projectId=${projectId}` : null,
    fetcher
  )
  
  const photos = mediaData?.filter((m: any) => m.type === 'photo') || []
  const screenshots = mediaData?.filter((m: any) => m.type === 'screenshot') || []
  const pdfs = mediaData?.filter((m: any) => m.type === 'pdf') || []
  
  // Debug logging
  if (activeTab === 'screenshots' && mediaData) {
    console.log('Media data:', mediaData)
    console.log('Filtered screenshots:', screenshots)
  }

  useEffect(() => {
    if (expandedRefs.size > 0 && typeof window !== 'undefined') {
      // Dynamically import Prism only on client side
      import('prismjs').then((Prism) => {
        setTimeout(() => {
          Prism.highlightAll()
        }, 100)
      })
    }
  }, [expandedRefs])

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    
    try {
      await apiClient.post('/tasks', {
        projectId,
        title: newTaskTitle,
        contentHtml: newTaskContent ? `<p>${newTaskContent.replace(/\n/g, '<br>')}</p>` : '',
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        tags: newTaskTags.split(',').map(tag => tag.trim()).filter(Boolean),
      })
      
        await mutate(`/api/tasks?projectId=${projectId}`)
        setNewTaskTitle('')
        setNewTaskContent('')
        setNewTaskPriority('MEDIUM')
        setNewTaskDueDate('')
        setNewTaskTags('')
        setShowNewTask(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCreateReference = async () => {
    if (!newRefTitle.trim() || !newRefContent.trim()) return
    
    // Wrap code snippets in markdown code blocks with language specifier
    let formattedContent = newRefContent
    if (newRefCategory === 'snippet') {
      // Check if content is already wrapped in code blocks
      if (!newRefContent.startsWith('```')) {
        formattedContent = `\`\`\`${newRefLanguage}\n${newRefContent}\n\`\`\``
      }
    }
    
    try {
      await apiClient.post('/references', {
        projectId,
        title: newRefTitle,
        content: formattedContent,
        category: newRefCategory,
        priority: newRefPriority,
        tags: newRefTags.split(',').map(tag => tag.trim()).filter(Boolean),
        metadata: newRefCategory === 'snippet' ? { language: newRefLanguage } : {},
      })
      
      await mutate(`/api/references?projectId=${projectId}`)
      setNewRefTitle('')
      setNewRefContent('')
      setNewRefCategory('snippet')
      setNewRefPriority('MEDIUM')
      setNewRefTags('')
      setNewRefLanguage('javascript')
      setShowNewReference(false)
    } catch (error) {
      console.error('Error creating reference:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      if (status === 'COMPLETED') {
        await apiClient.post(`/tasks/${taskId}/complete`, {})
      } else if (status === 'DELETED') {
        await apiClient.delete(`/tasks/${taskId}/delete`)
      } else if (status === 'ACTIVE') {
        await apiClient.post(`/tasks/${taskId}/restore`, {})
      }
      await mutate(`/api/tasks?projectId=${projectId}`)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteReference = async (refId: string) => {
    try {
      await apiClient.delete(`/references/${refId}`)
      await mutate(`/api/references?projectId=${projectId}`)
    } catch (error) {
      console.error('Error deleting reference:', error)
    }
  }
  
  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('type', 'photo')
    
    try {
      const response = await fetch(getApiUrl('/media/upload'), {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || 'Upload failed')
      }
      
      await mutate(`/api/media?projectId=${projectId}`)
      toast.success('Photo uploaded successfully')
    } catch (error) {
      console.error('Photo upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo')
    }
  }
  
  const handleScreenshotPaste = async (imageData: string, name: string) => {
    try {
      await apiClient.post('/media/screenshot', {
        projectId,
        imageData,
        name
      })
      await mutate(`/api/media?projectId=${projectId}`)
      toast.success('Screenshot saved successfully')
    } catch (error) {
      toast.error('Failed to save screenshot')
    }
  }
  
  const handlePDFUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('type', 'pdf')
    
    try {
      const response = await fetch(getApiUrl('/media/upload'), {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || 'Upload failed')
      }
      
      await mutate(`/api/media?projectId=${projectId}`)
      toast.success('PDF uploaded successfully')
    } catch (error) {
      console.error('PDF upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload PDF')
    }
  }
  
  const handleMediaDelete = async (id: string) => {
    try {
      await apiClient.delete(`/media/${id}`)
      await mutate(`/api/media?projectId=${projectId}`)
      toast.success('Media deleted successfully')
    } catch (error) {
      toast.error('Failed to delete media')
    }
  }
  
  const handleMediaRename = async (id: string, name: string) => {
    try {
      await apiClient.put(`/media/${id}`, { name })
      await mutate(`/api/media?projectId=${projectId}`)
      toast.success('Media renamed successfully')
    } catch (error) {
      toast.error('Failed to rename media')
    }
  }

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const toggleRefExpanded = (refId: string) => {
    setExpandedRefs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(refId)) {
        newSet.delete(refId)
      } else {
        newSet.add(refId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const filteredTasks = tasks?.filter((task: any) => {
    const matchesStatus = 
      (taskTab === 'active' && task.status === 'ACTIVE') ||
      (taskTab === 'completed' && task.status === 'COMPLETED') ||
      (taskTab === 'deleted' && task.status === 'DELETED')
    
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.contentHtml && task.contentHtml.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesStatus && matchesSearch
  }) || []

  const filteredReferences = references?.filter((ref: any) => {
    return !searchQuery || 
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  }) || []

  // Pagination
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  const paginatedReferences = filteredReferences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(
    (activeTab === 'tasks' ? filteredTasks.length : filteredReferences.length) / itemsPerPage
  )

  const cosmicPriorities = {
    HIGH: { name: 'Supernova', emoji: '💥' },
    MEDIUM: { name: 'Stellar', emoji: '⭐' },
    LOW: { name: 'Nebula', emoji: '🌌' }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'prompt': return 'bg-purple-500/20 text-purple-300'
      case 'snippet': return 'bg-blue-500/20 text-blue-300'
      case 'documentation': return 'bg-green-500/20 text-green-300'
      case 'link': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const detectLanguage = (content: string, category: string) => {
    if (category === 'prompt') return 'markdown'
    if (content.includes('import React') || content.includes('export default')) return 'javascript'
    if (content.includes('interface') || content.includes('type ')) return 'typescript'
    if (content.includes('def ') || content.includes('import ')) return 'python'
    if (content.includes('SELECT') || content.includes('FROM')) return 'sql'
    if (content.includes('#!/bin/bash') || content.includes('echo')) return 'bash'
    return 'javascript'
  }

  if (!project) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <PrismCard className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-2 mb-4 relative"
          >
            <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">←</span>
            <span className="relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent font-medium">
                Back to Projects
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 group-hover:w-full transition-all duration-300" />
            </span>
          </button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-400 mt-2">{project.description}</p>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks and references..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Main Tabs Container */}
        <div className="relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-yellow-500/30 rounded-xl blur-sm" />
          <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-xl p-1">
            <div className="grid grid-cols-5 gap-1">
              <button
                onClick={() => {
                  setActiveTab('tasks')
                  setCurrentPage(1)
                }}
                className={`relative py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'tasks' 
                    ? 'text-white bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="hidden sm:inline">📌 Radar</span>
                <span className="sm:hidden">📌</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('references')
                  setCurrentPage(1)
                }}
                className={`relative py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'references' 
                    ? 'text-white bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="hidden sm:inline">🧠 Neural Notes</span>
                <span className="sm:hidden">🧠</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('photos')
                  setCurrentPage(1)
                }}
                className={`relative py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'photos' 
                    ? 'text-white bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="hidden sm:inline">📸 Moments</span>
                <span className="sm:hidden">📸</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('screenshots')
                  setCurrentPage(1)
                }}
                className={`relative py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'screenshots' 
                    ? 'text-white bg-gradient-to-r from-green-500/30 via-blue-500/30 to-green-500/30 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="hidden sm:inline">📎 Snaps</span>
                <span className="sm:hidden">📎</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('pdfs')
                  setCurrentPage(1)
                }}
                className={`relative py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'pdfs' 
                    ? 'text-white bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-500/30 shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="hidden sm:inline">📄 Scrolls</span>
                <span className="sm:hidden">📄</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div>
            {/* Tab Description */}
            <div className="mb-6 text-white/60 text-sm italic border-l-2 border-purple-500/50 pl-4">
              Your to-dos, plans, or trip checklists — basically everything you need to stay on track and not lose your mind 💯
            </div>
            
            {/* Task Status Tabs Container */}
            <div className="relative mb-6">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-xl blur-sm" />
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
                <div className="grid grid-cols-3 gap-1">
                  {(['active', 'completed', 'deleted'] as TaskStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setTaskTab(status)
                        setCurrentPage(1)
                      }}
                      className={`relative py-2 rounded-lg transition-all capitalize ${
                        taskTab === status 
                          ? status === 'active' ? 'text-purple-300 bg-gradient-to-r from-purple-500/30 to-purple-600/30 shadow-md' :
                            status === 'completed' ? 'text-green-300 bg-gradient-to-r from-green-500/30 to-green-600/30 shadow-md' :
                            'text-red-300 bg-gradient-to-r from-red-500/30 to-red-600/30 shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Task Button */}
            {taskTab === 'active' && (
              <button
                onClick={() => setShowNewTask(true)}
                className="group relative mb-6 px-6 py-3"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="relative px-6 py-3 bg-black rounded-lg text-white font-semibold">
                  + Add New Task
                </div>
              </button>
            )}

            {/* New Task Form */}
            {showNewTask && (
              <PrismCard className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Create New Task</h3>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
                />
                <textarea
                  placeholder="Task description..."
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 h-32 resize-none"
                />
                <div className="flex gap-4 mb-4">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="LOW">🌌 Nebula (Low)</option>
                    <option value="MEDIUM">⭐ Stellar (Medium)</option>
                    <option value="HIGH">💥 Supernova (High)</option>
                  </select>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tags (comma separated, e.g., #urgent, #backend, #api)"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                  >
                    Create Task
                  </button>
                  <button
                    onClick={() => setShowNewTask(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </PrismCard>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {paginatedTasks.map((task: any) => (
                <PrismCard key={task._id} className="overflow-hidden">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleTaskExpanded(task._id)}>
                    <div className="flex items-center gap-3 flex-1">
                      {expandedTasks.has(task._id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                        {cosmicPriorities[task.priority].emoji} {cosmicPriorities[task.priority].name}
                      </span>
                      {task.dueDate && (
                        <span className="text-sm text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="px-2 py-1 text-gray-400 text-xs">+{task.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(task.title + '\n' + (task.contentHtml || ''), task._id)
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copiedId === task._id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {taskTab === 'active' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateTaskStatus(task._id, 'COMPLETED')
                            }}
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 text-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateTaskStatus(task._id, 'DELETED')
                            }}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {(taskTab === 'completed' || taskTab === 'deleted') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTaskStatus(task._id, 'ACTIVE')
                          }}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 text-sm"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedTasks.has(task._id) && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      {task.contentHtml && (
                        <div 
                          className="text-gray-300 prose prose-invert max-w-none mb-3"
                          dangerouslySetInnerHTML={{ __html: task.contentHtml }}
                        />
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {task.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </PrismCard>
              ))}
            </div>
          </div>
        )}

        {/* References Tab Content */}
        {activeTab === 'references' && (
          <div>
            {/* Tab Description */}
            <div className="mb-6 text-white/60 text-sm italic border-l-2 border-purple-500/50 pl-4">
              Prompts, code snippets, links, ideas — your digital brain dump for everything creative and chaotic 🤯
            </div>
            {/* Add Reference Button */}
            <button
              onClick={() => setShowNewReference(true)}
              className="group relative mb-6 px-6 py-3"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative px-6 py-3 bg-black rounded-lg text-white font-semibold">
                + Add New Reference
              </div>
            </button>

            {/* New Reference Form */}
            {showNewReference && (
              <PrismCard className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Create New Reference</h3>
                <input
                  type="text"
                  placeholder="Reference Title"
                  value={newRefTitle}
                  onChange={(e) => setNewRefTitle(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
                />
                <div className="flex gap-4 mb-4">
                  <select
                    value={newRefCategory}
                    onChange={(e) => setNewRefCategory(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="prompt">Prompt</option>
                    <option value="snippet">Code Snippet</option>
                    <option value="documentation">Documentation</option>
                    <option value="link">Link</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={newRefPriority}
                    onChange={(e) => setNewRefPriority(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="LOW">🌌 Nebula (Low)</option>
                    <option value="MEDIUM">⭐ Stellar (Medium)</option>
                    <option value="HIGH">💥 Supernova (High)</option>
                  </select>
                  {newRefCategory === 'snippet' && (
                    <SearchableSelect
                      options={languageOptions}
                      value={newRefLanguage}
                      onChange={setNewRefLanguage}
                      placeholder="Select language"
                      className="min-w-[200px]"
                    />
                  )}
                </div>
                <textarea
                  placeholder="Content (prompts, code snippets, documentation...)"
                  value={newRefContent}
                  onChange={(e) => setNewRefContent(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 h-48 font-mono"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newRefTags}
                  onChange={(e) => setNewRefTags(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateReference}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                  >
                    Create Reference
                  </button>
                  <button
                    onClick={() => setShowNewReference(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </PrismCard>
            )}

            {/* References List */}
            <div className="space-y-2">
              {paginatedReferences.map((ref: any) => (
                <PrismCard key={ref._id} className="overflow-hidden">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleRefExpanded(ref._id)}>
                    <div className="flex items-center gap-3 flex-1">
                      {expandedRefs.has(ref._id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">{ref.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(ref.category)}`}>
                        {ref.category}
                      </span>
                      <span className={`text-sm ${getPriorityColor(ref.priority || 'MEDIUM')}`}>
                        {cosmicPriorities[ref.priority || 'MEDIUM'].emoji} {cosmicPriorities[ref.priority || 'MEDIUM'].name}
                      </span>
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="flex gap-1">
                          {ref.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {ref.tags.length > 3 && (
                            <span className="px-2 py-1 text-gray-400 text-xs">+{ref.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(ref.content, ref._id)
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copiedId === ref._id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteReference(ref._id)
                        }}
                        className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {expandedRefs.has(ref._id) && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <MarkdownRenderer content={ref.content} />
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-4">
                          {ref.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </PrismCard>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {(activeTab === 'tasks' ? filteredTasks.length : filteredReferences.length) > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value={11}>11</option>
                <option value={22}>22</option>
                <option value={33}>33</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-gray-400 px-4">
                Page {currentPage} of {totalPages || 1}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages || totalPages === 0
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-gray-400 text-sm">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, activeTab === 'tasks' ? filteredTasks.length : filteredReferences.length)} - {Math.min(currentPage * itemsPerPage, activeTab === 'tasks' ? filteredTasks.length : filteredReferences.length)} of {activeTab === 'tasks' ? filteredTasks.length : filteredReferences.length}
            </div>
          </div>
        )}

        {/* Photos Tab Content */}
        {activeTab === 'photos' && (
          <>
            {/* Tab Description */}
            <div className="mb-6 text-white/60 text-sm italic border-l-2 border-blue-500/50 pl-4">
              Visual memories and inspo pics — the photos that tell your story and make the vibes immaculate ✨
            </div>
            <PhotoGallery
              photos={photos}
              projectId={projectId}
              onUpload={handlePhotoUpload}
              onDelete={handleMediaDelete}
              onRename={handleMediaRename}
            />
          </>
        )}
        
        {/* Screenshots Tab Content */}
        {activeTab === 'screenshots' && (
          <>
            {/* Tab Description */}
            <div className="mb-6 text-white/60 text-sm italic border-l-2 border-green-500/50 pl-4">
              Quick snaps and receipts — proof that it happened, no cap 📸 Keep those screenshots coming!
            </div>
            <ScreenshotCapture
              screenshots={screenshots}
              projectId={projectId}
              onPaste={handleScreenshotPaste}
              onDelete={handleMediaDelete}
              onRename={handleMediaRename}
            />
          </>
        )}
        
        {/* PDFs Tab Content */}
        {activeTab === 'pdfs' && (
          <>
            {/* Tab Description */}
            <div className="mb-6 text-white/60 text-sm italic border-l-2 border-red-500/50 pl-4">
              Important docs and files — the official stuff you actually need to keep (boring but necessary) 📜
            </div>
            <PDFViewer
              pdfs={pdfs}
              projectId={projectId}
              onUpload={handlePDFUpload}
              onDelete={handleMediaDelete}
              onRename={handleMediaRename}
            />
          </>
        )}

        {/* Empty state */}
        {((activeTab === 'tasks' && filteredTasks.length === 0) || 
          (activeTab === 'references' && filteredReferences.length === 0)) && (
          <div className="text-center py-12 text-gray-400">
            {searchQuery ? (
              <p>No {activeTab} found matching "{searchQuery}"</p>
            ) : (
              <p>No {taskTab} {activeTab} found</p>
            )}
          </div>
        )}
      </PrismCard>
    </div>
  )
}