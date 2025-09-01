'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import dynamic from 'next/dynamic'
import PrismCard from '@/components/PrismCard'
import { ChevronDown, ChevronUp, Copy, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-markdown'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type TabType = 'tasks' | 'references'
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
  
  const [newRefTitle, setNewRefTitle] = useState('')
  const [newRefContent, setNewRefContent] = useState('')
  const [newRefCategory, setNewRefCategory] = useState('snippet')
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

  useEffect(() => {
    if (expandedRefs.size > 0) {
      setTimeout(() => {
        Prism.highlightAll()
      }, 100)
    }
  }, [expandedRefs])

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: newTaskTitle,
          contentHtml: newTaskContent,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      })
      
      if (response.ok) {
        await mutate(`/api/tasks?projectId=${projectId}`)
        setNewTaskTitle('')
        setNewTaskContent('')
        setNewTaskPriority('MEDIUM')
        setNewTaskDueDate('')
        setShowNewTask(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCreateReference = async () => {
    if (!newRefTitle.trim() || !newRefContent.trim()) return
    
    try {
      const response = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: newRefTitle,
          content: newRefContent,
          category: newRefCategory,
          tags: newRefTags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      })
      
      if (response.ok) {
        await mutate(`/api/references?projectId=${projectId}`)
        setNewRefTitle('')
        setNewRefContent('')
        setNewRefCategory('snippet')
        setNewRefTags('')
        setNewRefLanguage('javascript')
        setShowNewReference(false)
      }
    } catch (error) {
      console.error('Error creating reference:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        await mutate(`/api/tasks?projectId=${projectId}`)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteReference = async (refId: string) => {
    try {
      const response = await fetch(`/api/references/${refId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await mutate(`/api/references?projectId=${projectId}`)
      }
    } catch (error) {
      console.error('Error deleting reference:', error)
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
      (task.contentHtml && task.contentHtml.toLowerCase().includes(searchQuery.toLowerCase()))
    
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
            className="group relative inline-flex items-center gap-2 px-4 py-2 mb-4"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 blur-sm" />
            <div className="relative flex items-center gap-2 px-4 py-2 bg-black rounded-lg">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-300 group-hover:text-white transition-colors">Back to Projects</span>
            </div>
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

        {/* Main Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('tasks')
              setCurrentPage(1)
            }}
            className={`group relative px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'tasks' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-lg transition-opacity duration-500 ${
              activeTab === 'tasks' ? 'opacity-75' : 'opacity-0 group-hover:opacity-50'
            } blur-sm`} />
            <div className={`relative px-8 py-3 rounded-lg ${
              activeTab === 'tasks' ? 'bg-black' : 'bg-gray-800/50'
            }`}>
              Tasks
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('references')
              setCurrentPage(1)
            }}
            className={`group relative px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'references' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-lg transition-opacity duration-500 ${
              activeTab === 'references' ? 'opacity-75' : 'opacity-0 group-hover:opacity-50'
            } blur-sm`} />
            <div className={`relative px-8 py-3 rounded-lg ${
              activeTab === 'references' ? 'bg-black' : 'bg-gray-800/50'
            }`}>
              References
            </div>
          </button>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div>
            {/* Task Status Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {(['active', 'completed', 'deleted'] as TaskStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setTaskTab(status)
                    setCurrentPage(1)
                  }}
                  className={`group relative px-6 py-2 rounded-lg transition-all capitalize ${
                    taskTab === status ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                    status === 'active' ? 'from-purple-500 to-pink-500' :
                    status === 'completed' ? 'from-green-500 to-emerald-500' :
                    'from-red-500 to-rose-500'
                  } rounded-lg transition-opacity duration-500 ${
                    taskTab === status ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'
                  } blur-sm`} />
                  <div className={`relative px-6 py-2 rounded-lg ${
                    taskTab === status ? 'bg-gray-900' : 'bg-gray-800/30'
                  }`}>
                    {status}
                  </div>
                </button>
              ))}
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
                <div className="mb-4">
                  <ReactQuill
                    theme="snow"
                    value={newTaskContent}
                    onChange={setNewTaskContent}
                    className="bg-gray-800 text-white rounded-lg"
                    placeholder="Task description..."
                  />
                </div>
                <div className="flex gap-4 mb-4">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
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
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-sm text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
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
                  {expandedTasks.has(task._id) && task.contentHtml && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div 
                        className="text-gray-300 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: task.contentHtml }}
                      />
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
                  {newRefCategory === 'snippet' && (
                    <select
                      value={newRefLanguage}
                      onChange={(e) => setNewRefLanguage(e.target.value)}
                      className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="bash">Bash</option>
                      <option value="sql">SQL</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
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
                      {ref.category === 'snippet' ? (
                        <pre className="overflow-x-auto">
                          <code className={`language-${detectLanguage(ref.content, ref.category)}`}>
                            {ref.content}
                          </code>
                        </pre>
                      ) : (
                        <pre className="bg-gray-800/50 p-4 rounded-lg text-gray-300 overflow-x-auto whitespace-pre-wrap">
                          {ref.content}
                        </pre>
                      )}
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