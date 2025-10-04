'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Archive, Search, Command, Download, Upload, RotateCcw, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PriorityFilter, { PriorityLevel, SortOrder } from '@/components/PriorityFilter'
import ProjectCard from '@/components/ProjectCard'
import PrismCard from '@/components/PrismCard'
import SearchModal from '@/components/SearchModal'
import { Toaster, toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import UserAvatar from '@/components/UserAvatar'
import NetworkSidebar from '@/components/NetworkSidebar'
import { setActiveTheme, getThemeTemplates } from '@/lib/api/themes'

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>('sun')
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNetworkSidebar, setShowNetworkSidebar] = useState(false)
  const [applyingTheme, setApplyingTheme] = useState(false)
  const [backendThemes, setBackendThemes] = useState<any[]>([])
  const [themesLoading, setThemesLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedProjects, setDeletedProjects] = useState([])
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('priority-high')

  const router = useRouter()
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth()
  const { activeTheme, refreshTheme } = useTheme()
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])
  
  const themes = useMemo(() => {
    // Map backend themes to display themes with icons
    const themeIcons: Record<string, string> = {
      'moon': '🌙',
      'sun': '☀️',
      'daylight': '🌞',
      'comet': '☄️',
      'earth': '🌍',
      'rocket': '🚀',
      'saturn': '🪐',
      'sparkle': '✨'
    }

    const themeBgClasses: Record<string, string> = {
      'moon': 'from-slate-900 via-blue-900 to-indigo-950',
      'sun': 'from-orange-900 via-amber-900 to-yellow-900',
      'daylight': 'from-amber-50 via-orange-50 to-yellow-50',
      'comet': 'from-purple-900 via-violet-900 to-indigo-900',
      'earth': 'from-blue-900 via-teal-900 to-green-900',
      'rocket': 'from-gray-900 via-slate-800 to-zinc-900',
      'saturn': 'from-purple-900 via-fuchsia-900 to-pink-900',
      'sparkle': 'from-pink-900 via-rose-900 to-purple-900'
    }

    // Map backend themes to the format we need for display
    return backendThemes.map(theme => ({
      id: theme.id,
      icon: themeIcons[theme.name.toLowerCase()] || '🎨',
      name: theme.displayName || theme.name,
      bgClass: themeBgClasses[theme.name.toLowerCase()] || 'from-gray-900 via-gray-800 to-gray-700'
    }))
  }, [backendThemes])

  // Load themes from backend on mount
  useEffect(() => {
    const loadThemes = async () => {
      setThemesLoading(true)
      try {
        const templates = await getThemeTemplates()
        setBackendThemes(templates)
      } catch (error) {
        console.error('Failed to load themes:', error)
        // Use fallback themes if backend fails
        setBackendThemes([
          { id: 'moon', name: 'Moon', displayName: 'Moon' },
          { id: 'sun', name: 'Sun', displayName: 'Sun' },
          { id: 'daylight', name: 'Daylight', displayName: 'Daylight' },
          { id: 'comet', name: 'Comet', displayName: 'Comet' },
          { id: 'earth', name: 'Earth', displayName: 'Earth' },
          { id: 'rocket', name: 'Rocket', displayName: 'Rocket' },
          { id: 'saturn', name: 'Saturn', displayName: 'Saturn' },
          { id: 'sparkle', name: 'Sparkle', displayName: 'Sparkle' }
        ])
      } finally {
        setThemesLoading(false)
      }
    }

    loadThemes()
  }, [])

  // Load active theme from backend on mount
  useEffect(() => {
    if (activeTheme?.themeId) {
      setSelectedTheme(activeTheme.themeId)
      setIsAutoPlaying(false)
    } else if (backendThemes.length > 0) {
      // Set default theme if no active theme
      const defaultTheme = backendThemes.find(t => t.name.toLowerCase() === 'sun') || backendThemes[0]
      if (defaultTheme) {
        setSelectedTheme(defaultTheme.id)
      }

      const hasSeenAnimation = localStorage.getItem('cosmicboard-animation-seen')
      if (!hasSeenAnimation) {
        // First time visitor - show animation
        setIsAutoPlaying(true)
        localStorage.setItem('cosmicboard-animation-seen', 'true')
      }
    }
  }, [activeTheme, backendThemes])

  // Auto-play themes on mount
  useEffect(() => {
    if (!isAutoPlaying || themes.length === 0) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < themes.length) {
        setSelectedTheme(themes[currentIndex].id)
        currentIndex++
      } else {
        // Set to sun theme or first available theme
        const defaultTheme = themes.find(t => t.name.toLowerCase() === 'sun') || themes[0]
        if (defaultTheme) {
          setSelectedTheme(defaultTheme.id)
        }
        setIsAutoPlaying(false)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, themes])

  const handleThemeSelect = async (themeId: string) => {
    if (!user) {
      // For non-authenticated users, just update local state
      setIsAutoPlaying(false)
      setSelectedTheme(themeId)
      localStorage.setItem('cosmicboard-theme', themeId)
      return
    }

    try {
      setIsAutoPlaying(false)
      setApplyingTheme(true)
      setSelectedTheme(themeId)

      // Apply theme through backend (always global from home page)
      await setActiveTheme(themeId, true, 'desktop')

      // Refresh theme context to apply the new theme
      await refreshTheme()

      // Save to localStorage as fallback
      localStorage.setItem('cosmicboard-theme', themeId)
    } catch (error) {
      console.error('Failed to apply theme:', error)
      toast.error('Failed to apply theme')
    } finally {
      setApplyingTheme(false)
    }
  }

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[1]

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    console.log('🔍 Filtering projects - Priority:', priorityFilter, 'Sort:', sortOrder)
    console.log('📊 Total projects:', projects.length)

    let filtered = [...projects]

    // Apply priority filter if not showing all
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((project: any) => {
        const projectPriority = project.priority || 'NEBULA'
        const matches = projectPriority === priorityFilter
        console.log(`  Project "${project.name}": priority=${projectPriority}, matches=${matches}`)
        return matches
      })
    }

    console.log('📊 Filtered count:', filtered.length)

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      switch (sortOrder) {
        case 'priority-high':
          // Sort by highest priority first (SUPERNOVA > STELLAR > NEBULA)
          const priorityOrder = { SUPERNOVA: 3, STELLAR: 2, NEBULA: 1 }
          const aPriority = a.priority || 'NEBULA'
          const bPriority = b.priority || 'NEBULA'
          return priorityOrder[bPriority] - priorityOrder[aPriority]
        case 'priority-low':
          // Sort by lowest priority first (NEBULA > STELLAR > SUPERNOVA)
          const priorityOrderLow = { SUPERNOVA: 3, STELLAR: 2, NEBULA: 1 }
          const aPriorityLow = a.priority || 'NEBULA'
          const bPriorityLow = b.priority || 'NEBULA'
          return priorityOrderLow[aPriorityLow] - priorityOrderLow[bPriorityLow]
        case 'date-new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-old':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })

    console.log('✅ Final filtered & sorted projects:', filtered.map((p: any) => ({ name: p.name, priority: p.priority })))
    return filtered
  }, [projects, priorityFilter, sortOrder])

  const fetchProjects = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      // Fetch active projects
      const activeData = await apiClient.get('/projects')
      setProjects(activeData)

      // Fetch deleted projects
      const deletedData = await apiClient.get('/projects?deleted=true')
      setDeletedProjects(deletedData)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = (projectId: string, newPriority: string) => {
    console.log('🔄 Home page: Priority changed', projectId, newPriority)
    // Update projects state to keep filtering in sync
    setProjects((prevProjects: any[]) =>
      prevProjects.map((project: any) =>
        project._id === projectId || project.id === projectId
          ? { ...project, priority: newPriority }
          : project
      )
    )
  }

  const handleRestoreProject = async (projectId: string) => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.post(`/projects/${projectId}/restore`)
      toast.success('Project restored successfully')
      fetchProjects()
    } catch (error) {
      console.error('Failed to restore project:', error)
      toast.error('Failed to restore project')
    }
  }

  const handlePermanentDelete = async (projectId: string) => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.delete(`/projects/${projectId}?permanent=true`)
      toast.success('Project permanently deleted')
      fetchProjects()
    } catch (error) {
      console.error('Failed to permanently delete project:', error)
      toast.error('Failed to permanently delete project')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

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
      const { apiClient } = await import('@/lib/api-client')
      const result = await apiClient.post('/projects', {
        name: newProjectName,
        description: newProjectDescription
      })

      toast.success('Project created successfully!')
      setNewProjectName('')
      setNewProjectDescription('')
      setShowNewProject(false)
      fetchProjects()
    } catch (error: any) {
      console.error('Failed to create project:', error)
      toast.error(error.message || 'Failed to create project')
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-1000">
      <Toaster position="top-right" theme="dark" />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      {/* User Avatar - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <UserAvatar onOpenSidebar={() => setShowNetworkSidebar(true)} />
      </div>

      {/* Theme Selector */}
      <div className="pt-8 pb-4 px-4 relative z-40">
        <div className="flex justify-center">
          <div className="relative group inline-block">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
            <div className="relative rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-sm" style={{
              background: `linear-gradient(135deg, var(--theme-card-bg-from), var(--theme-card-bg-via), var(--theme-card-bg-to))`,
              borderColor: 'var(--theme-card-border)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}>
              {/* Theme Icons */}
              <div className="flex items-center gap-4 lg:gap-6">
                {themesLoading ? (
                  <div className="text-white/60">Loading themes...</div>
                ) : themes.length === 0 ? (
                  <div className="text-white/60">No themes available</div>
                ) : (
                  themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    disabled={applyingTheme}
                    className={`relative group transition-all duration-300 ${
                      selectedTheme === theme.id ? 'scale-125' : 'scale-100 hover:scale-110'
                    } ${applyingTheme ? 'opacity-50' : ''}`}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <span className={`text-4xl block transition-all duration-300 ${
                      selectedTheme === theme.id ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''
                    } ${applyingTheme && selectedTheme === theme.id ? 'animate-pulse' : ''}`}>
                      {theme.icon}
                    </span>
                    {selectedTheme === theme.id && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    )}
                  </button>
                ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center py-6 relative z-10">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-subtle">
          Cosmic Space
        </h1>
        <p className="text-xl mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
          Align your actions with the cosmos
        </p>
      </div>

      {/* Feature Buttons Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 relative z-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
          <div className="relative rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden" style={{
            background: `linear-gradient(135deg, var(--theme-card-bg-from), var(--theme-card-bg-via), var(--theme-card-bg-to))`,
            borderColor: 'var(--theme-card-border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}>
            <div className="grid grid-cols-3">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="relative flex flex-col items-center justify-center gap-2 p-6 text-blue-400 hover:bg-blue-500/10 transition-all duration-300 border-r border-white/10 group/item"
              >
                <Search className="w-6 h-6 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm font-medium">Search</span>
                <kbd className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-500/20 rounded text-xs opacity-60">
                  ⌘K
                </kbd>
              </button>

              {/* New Project */}
              <button
                onClick={() => setShowNewProject(true)}
                className="relative flex flex-col items-center justify-center gap-2 p-6 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 border-r border-white/10 group/item"
              >
                <Plus className="w-6 h-6 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm font-medium">New Project</span>
              </button>

              {/* Recycle Bin */}
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className="relative flex flex-col items-center justify-center gap-2 p-6 text-red-400 hover:bg-red-500/10 transition-all duration-300 group/item"
              >
                <Trash2 className="w-6 h-6 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm font-medium">
                  Recycle Bin {deletedProjects.length > 0 && `(${deletedProjects.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Sidebar */}
      <NetworkSidebar isOpen={showNetworkSidebar} onClose={() => setShowNetworkSidebar(false)} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative z-10">
        {/* Priority Filter */}
        <PriorityFilter
          currentPriority={priorityFilter}
          currentSort={sortOrder}
          onPriorityChange={setPriorityFilter}
          onSortChange={setSortOrder}
        />

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {showDeleted ? 'Deleted Projects' : 'Your Projects'}
            </h2>
          </div>
          
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
          ) : showDeleted ? (
            // Deleted Projects View
            deletedProjects.length === 0 ? (
              <PrismCard>
                <div className="text-center py-12">
                  <Trash2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No deleted projects</h3>
                  <p className="text-gray-500">Deleted projects will appear here</p>
                </div>
              </PrismCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deletedProjects.map((project: any) => (
                  <PrismCard key={project.id || project._id}>
                    <div className="opacity-75">
                      <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestoreProject(project.id || project._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) {
                              handlePermanentDelete(project.id || project._id)
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </PrismCard>
                ))}
              </div>
            )
          ) : (
            // Active Projects View
            projects.length === 0 ? (
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
                {filteredAndSortedProjects.map((project: any) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onPriorityChange={handlePriorityChange}
                  />
                ))}
              </div>
            )
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