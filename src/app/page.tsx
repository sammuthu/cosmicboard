'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Archive } from 'lucide-react'
import CurrentPriority from '@/components/CurrentPriority'
import ProjectCard from '@/components/ProjectCard'
import PrismCard from '@/components/PrismCard'
import { Toaster, toast } from 'sonner'

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>('sun')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  
  const themes = useMemo(() => [
    { id: 'moon', icon: '🌙', name: 'Moon', bgClass: 'from-slate-900 via-blue-900 to-indigo-950' },
    { id: 'sun', icon: '☀️', name: 'Sun', bgClass: 'from-orange-900 via-amber-900 to-yellow-900' },
    { id: 'comet', icon: '☄️', name: 'Comet', bgClass: 'from-purple-900 via-violet-900 to-indigo-900' },
    { id: 'earth', icon: '🌍', name: 'Earth', bgClass: 'from-blue-900 via-teal-900 to-green-900' },
    { id: 'rocket', icon: '🚀', name: 'Rocket', bgClass: 'from-gray-900 via-slate-800 to-zinc-900' },
    { id: 'saturn', icon: '🪐', name: 'Saturn', bgClass: 'from-purple-900 via-fuchsia-900 to-pink-900' },
    { id: 'sparkle', icon: '✨', name: 'Sparkle', bgClass: 'from-pink-900 via-rose-900 to-purple-900' }
  ], [])

  // Auto-play themes on mount
  useEffect(() => {
    if (!isAutoPlaying) return
    
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < themes.length) {
        setSelectedTheme(themes[currentIndex].id)
        currentIndex++
      } else {
        setSelectedTheme('sun')
        setIsAutoPlaying(false)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, themes])

  const handleThemeSelect = (themeId: string) => {
    setIsAutoPlaying(false)
    setSelectedTheme(themeId)
  }

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[1]

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/projects', {
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
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgClass} transition-all duration-1000`}>
      <Toaster position="top-right" theme="dark" />
      
      {/* Theme Selector */}
      <div className="pt-8 pb-2 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex justify-center items-center gap-6">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`relative group transition-all duration-300 ${
                      selectedTheme === theme.id ? 'scale-125' : 'scale-100 hover:scale-110'
                    }`}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <span className={`text-4xl block transition-all duration-300 ${
                      selectedTheme === theme.id ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''
                    }`}>
                      {theme.icon}
                    </span>
                    {selectedTheme === theme.id && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CosmicBoard Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
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