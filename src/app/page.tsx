'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Archive, Search, Command, Download, Upload } from 'lucide-react'
import CurrentPriority from '@/components/CurrentPriority'
import ProjectCard from '@/components/ProjectCard'
import PrismCard from '@/components/PrismCard'
import SearchModal from '@/components/SearchModal'
import { Toaster, toast } from 'sonner'

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>('sun')
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  
  const themes = useMemo(() => [
    { id: 'moon', icon: '🌙', name: 'Moon', bgClass: 'from-slate-900 via-blue-900 to-indigo-950' },
    { id: 'sun', icon: '☀️', name: 'Sun', bgClass: 'from-orange-900 via-amber-900 to-yellow-900' },
    { id: 'comet', icon: '☄️', name: 'Comet', bgClass: 'from-purple-900 via-violet-900 to-indigo-900' },
    { id: 'earth', icon: '🌍', name: 'Earth', bgClass: 'from-blue-900 via-teal-900 to-green-900' },
    { id: 'rocket', icon: '🚀', name: 'Rocket', bgClass: 'from-gray-900 via-slate-800 to-zinc-900' },
    { id: 'saturn', icon: '🪐', name: 'Saturn', bgClass: 'from-purple-900 via-fuchsia-900 to-pink-900' },
    { id: 'sparkle', icon: '✨', name: 'Sparkle', bgClass: 'from-pink-900 via-rose-900 to-purple-900' }
  ], [])

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cosmicboard-theme')
    const hasSeenAnimation = localStorage.getItem('cosmicboard-animation-seen')
    
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setSelectedTheme(savedTheme)
      setIsAutoPlaying(false)
    } else if (!hasSeenAnimation) {
      // First time visitor - show animation
      setIsAutoPlaying(true)
      localStorage.setItem('cosmicboard-animation-seen', 'true')
    }
  }, [themes])

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
    localStorage.setItem('cosmicboard-theme', themeId)
  }

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[1]

  const fetchProjects = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-client')
      const res = await fetch(getApiUrl('/projects'))
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
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

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleExport = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-client')
      const response = await fetch(getApiUrl('/export'))
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cosmicboard-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const { getApiUrl } = await import('@/lib/api-client')
      const response = await fetch(getApiUrl('/import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success(`Import successful! Projects: ${result.imported.projects}, Tasks: ${result.imported.tasks}, References: ${result.imported.references}`)
        fetchProjects()
      } else {
        toast.error(result.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import data - invalid file format')
    }
    
    // Reset file input
    event.target.value = ''
  }

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
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgClass} transition-all duration-1000`}>
      <Toaster position="top-right" theme="dark" />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
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

      {/* Cosmic Space Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Cosmic Space
            </h1>
            <p className="text-gray-400 text-sm mt-1">Align your actions with the cosmos</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors group"
            >
              <Search className="w-4 h-4" />
              Search
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 rounded text-xs">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
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
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              title="Export all data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
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