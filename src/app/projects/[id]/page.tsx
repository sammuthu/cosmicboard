'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import dynamic from 'next/dynamic'
import PrismCard from '@/components/PrismCard'

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
  const [newRefCategory, setNewRefCategory] = useState('other')
  const [newRefTags, setNewRefTags] = useState('')

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
        setNewRefCategory('other')
        setNewRefTags('')
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

  const filteredTasks = tasks?.filter((task: any) => {
    if (taskTab === 'active') return task.status === 'ACTIVE'
    if (taskTab === 'completed') return task.status === 'COMPLETED'
    if (taskTab === 'deleted') return task.status === 'DELETED'
    return false
  }) || []

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

  if (!project) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Back to Projects
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-400 mt-2">{project.description}</p>
          )}
        </div>

        {/* Main Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'references'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            References
          </button>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div>
            {/* Task Status Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTaskTab('active')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  taskTab === 'active'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setTaskTab('completed')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  taskTab === 'completed'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setTaskTab('deleted')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  taskTab === 'deleted'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                Deleted
              </button>
            </div>

            {/* Add Task Button */}
            {taskTab === 'active' && (
              <button
                onClick={() => setShowNewTask(true)}
                className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                + Add New Task
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
            <div className="grid gap-4">
              {filteredTasks.map((task: any) => (
                <PrismCard key={task._id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
                      {task.contentHtml && (
                        <div 
                          className="text-gray-300 mb-3 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: task.contentHtml }}
                        />
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority} Priority
                        </span>
                        {task.dueDate && (
                          <span className="text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {taskTab === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTaskStatus(task._id, 'COMPLETED')}
                          className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task._id, 'DELETED')}
                          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {taskTab === 'completed' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'ACTIVE')}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
                      >
                        Reactivate
                      </button>
                    )}
                    {taskTab === 'deleted' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'ACTIVE')}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </PrismCard>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No {taskTab} tasks found
                </div>
              )}
            </div>
          </div>
        )}

        {/* References Tab Content */}
        {activeTab === 'references' && (
          <div>
            {/* Add Reference Button */}
            <button
              onClick={() => setShowNewReference(true)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              + Add New Reference
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
                <textarea
                  placeholder="Content (prompts, code snippets, documentation...)"
                  value={newRefContent}
                  onChange={(e) => setNewRefContent(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 h-32 font-mono"
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
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newRefTags}
                    onChange={(e) => setNewRefTags(e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
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
            <div className="grid gap-4">
              {references?.map((ref: any) => (
                <PrismCard key={ref._id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-white">{ref.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(ref.category)}`}>
                          {ref.category}
                        </span>
                      </div>
                      <pre className="bg-gray-800/50 p-4 rounded-lg text-gray-300 mb-3 overflow-x-auto">
                        <code>{ref.content}</code>
                      </pre>
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {ref.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteReference(ref._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </PrismCard>
              ))}
              {(!references || references.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                  No references found. Add your first reference!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}