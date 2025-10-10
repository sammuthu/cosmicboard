'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Archive, Filter } from 'lucide-react'
import CurrentPriority from '@/components/CurrentPriority'
import ProjectCard from '@/components/ProjectCard'
import PrismCard from '@/components/PrismCard'
import { Toaster, toast } from 'sonner'

type Priority = 'SUPERNOVA' | 'STELLAR' | 'NEBULA' | 'ALL'

export default function CosmicBoard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority>('ALL')
  const [sortOrder, setSortOrder] = useState<'date-new' | 'date-old'>('date-new')

  const fetchProjects = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      const data = await apiClient.get('/projects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = (projectId: string, newPriority: string) => {
    console.log('🔄 handlePriorityChange called:', { projectId, newPriority })

    // Update parent state to keep filtering/sorting in sync
    setProjects((prevProjects: any[]) => {
      console.log('📦 Previous projects state:', prevProjects.map((p: any) => ({ id: p._id, name: p.name, priority: p.priority })))

      const updatedProjects = prevProjects.map((project: any) => {
        if (project._id === projectId || project.id === projectId) {
          console.log(`✅ Updating project ${project.name} from ${project.priority} to ${newPriority}`)
          return { ...project, priority: newPriority }
        }
        return project
      })

      console.log('📦 Updated projects state:', updatedProjects.map((p: any) => ({ id: p._id, name: p.name, priority: p.priority })))
      return [...updatedProjects] // Return new array to force re-render
    })
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Memoize filtered and sorted projects for better performance
  const filteredAndSortedProjects = useMemo(() => {
    console.log('=== Filtering Projects ===')
    console.log('Total projects:', projects.length)
    console.log('Priority filter:', priorityFilter)
    console.log('Sort order:', sortOrder)
    console.log('Projects data:', projects.map((p: any) => ({ id: p._id, name: p.name, priority: p.priority })))

    const filtered = projects.filter((project: any) => {
      const projectPriority = project.priority || 'NEBULA'
      const matches = priorityFilter === 'ALL' ? true : projectPriority === priorityFilter
      console.log(`Project ${project.name}: priority=${projectPriority}, filter=${priorityFilter}, matches=${matches}`)
      return matches
    })

    console.log('Filtered count:', filtered.length)

    const sorted = [...filtered].sort((a: any, b: any) => {
      const aDate = new Date(a.createdAt || a.updatedAt).getTime()
      const bDate = new Date(b.createdAt || b.updatedAt).getTime()
      return sortOrder === 'date-new' ? bDate - aDate : aDate - bDate
    })

    console.log('Final sorted projects:', sorted.map((p: any) => ({ name: p.name, priority: p.priority, date: p.createdAt })))
    return sorted
  }, [projects, priorityFilter, sortOrder])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { getApiUrl } = await import('@/lib/api-client')
      const res = await fetch(getApiUrl('/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription
        })
      })
      
      if (res.ok) {
        toast.success('Project created successfully!')
        setNewProjectName('')
        setNewProjectDescription('')
        setShowNewProject(false)
        fetchProjects()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CosmicBoard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Align your actions with the cosmos</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <a
                href="/completed"
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Completed
              </a>
              <a
                href="/recycle-bin"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Recycle Bin
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Priority */}
        <CurrentPriority />

        {/* Projects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <PrismCard key={i}>
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </PrismCard>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <PrismCard>
              <div className="text-center py-12">
                <h3 className="text-xl font-bold text-gray-400 mb-4">No projects yet</h3>
                <p className="text-gray-500 mb-6">Create your first project to start organizing your tasks</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create First Project
                </button>
              </div>
            </PrismCard>
          ) : (
            <>
              {/* Priority Filters */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    console.log('🔘 Clicked ALL filter')
                    setPriorityFilter('ALL')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    priorityFilter === 'ALL'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  All Priorities
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Clicked SUPERNOVA filter')
                    setPriorityFilter('SUPERNOVA')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    priorityFilter === 'SUPERNOVA'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  🌟 SuperNova
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Clicked STELLAR filter')
                    setPriorityFilter('STELLAR')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    priorityFilter === 'STELLAR'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  ⭐ Stellar
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Clicked NEBULA filter')
                    setPriorityFilter('NEBULA')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    priorityFilter === 'NEBULA'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  ☁️ Nebula
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Sort by newest first')
                    setSortOrder('date-new')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortOrder === 'date-new'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Sort by oldest first')
                    setSortOrder('date-old')
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortOrder === 'date-old'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Oldest First
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map((project: any) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onPriorityChange={handlePriorityChange}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <PrismCard className="w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Work Tasks"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                  placeholder="Brief description of the project"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </PrismCard>
        </div>
      )}
    </div>
  )
}