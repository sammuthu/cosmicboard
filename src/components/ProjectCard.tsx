'use client'

import PrismCard from './PrismCard'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

type Priority = 'SUPERNOVA' | 'STELLAR' | 'NEBULA'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    priority?: Priority
    counts: {
      tasks?: {
        active: number
        completed: number
        deleted: number
      }
      references?: {
        total: number
        snippets: number
        documentation: number
      }
      // Legacy support for old structure
      active?: number
      completed?: number
      deleted?: number
    }
  }
  onPriorityChange?: (projectId: string, newPriority: Priority) => void
}

const PRIORITY_EMOJIS: Record<Priority, string> = {
  SUPERNOVA: '🌟',
  STELLAR: '⭐',
  NEBULA: '☁️'
}

const PRIORITY_LABELS: Record<Priority, string> = {
  SUPERNOVA: 'SuperNova',
  STELLAR: 'Stellar',
  NEBULA: 'Nebula'
}

export default function ProjectCard({ project, onPriorityChange }: ProjectCardProps) {
  const router = useRouter()
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Local state for immediate UI update
  const [currentPriority, setCurrentPriority] = useState<Priority>(project.priority || 'NEBULA')

  // Support both old and new data structures
  const taskCounts = project.counts.tasks || {
    active: project.counts.active || 0,
    completed: project.counts.completed || 0,
    deleted: project.counts.deleted || 0
  }

  const referenceCounts = project.counts.references || {
    total: 0,
    snippets: 0,
    documentation: 0
  }

  const total = taskCounts.active + taskCounts.completed
  const progress = total > 0 ? (taskCounts.completed / total) * 100 : 0

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false)
      }
    }

    if (showPriorityMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPriorityMenu])

  const handlePriorityChange = async (newPriority: Priority, e: React.MouseEvent) => {
    e.stopPropagation()

    // Store old priority for rollback on error
    const oldPriority = currentPriority

    // Immediately update the UI (optimistic update)
    setCurrentPriority(newPriority)
    setShowPriorityMenu(false)
    setIsUpdating(true)

    try {
      // Update backend in background
      await apiClient.patch(`/projects/${project._id}/priority`, { priority: newPriority })
      toast.success(`Priority updated to ${PRIORITY_LABELS[newPriority]}`)

      // Optionally notify parent (if they want to update their state too)
      onPriorityChange?.(project._id, newPriority)
    } catch (error) {
      console.error('Error updating priority:', error)
      toast.error('Failed to update priority')
      // Rollback on error
      setCurrentPriority(oldPriority)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <PrismCard
      className="h-full relative"
      onClick={() => router.push(`/projects/${project._id}`)}
    >
      {/* Priority indicator and menu */}
      <div className="absolute top-4 right-4 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowPriorityMenu(!showPriorityMenu)
          }}
          className="text-2xl hover:scale-110 transition-transform"
          title={`Priority: ${PRIORITY_LABELS[currentPriority]}`}
        >
          {PRIORITY_EMOJIS[currentPriority]}
        </button>

        {showPriorityMenu && (
          <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 min-w-[150px]">
            {(['SUPERNOVA', 'STELLAR', 'NEBULA'] as Priority[]).map((priority) => (
              <button
                key={priority}
                onClick={(e) => handlePriorityChange(priority, e)}
                disabled={isUpdating || priority === currentPriority}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left ${
                  priority === currentPriority ? 'bg-gray-700 text-purple-400' : 'text-white'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-xl">{PRIORITY_EMOJIS[priority]}</span>
                <span className="text-sm">{PRIORITY_LABELS[priority]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2 pr-12">{project.name}</h3>
      {project.description && (
        <p className="text-gray-400 text-sm mb-4">{project.description}</p>
      )}
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-purple-400">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-3">
          {/* Tasks Column */}
          <div className="border-r border-gray-700 pr-4">
            <div className="text-sm font-semibold text-gray-400 mb-2">TASKS</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active</span>
                <span className="text-lg font-bold text-blue-400">{taskCounts.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Done</span>
                <span className="text-lg font-bold text-green-400">{taskCounts.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Deleted</span>
                <span className="text-lg font-bold text-red-400">{taskCounts.deleted}</span>
              </div>
            </div>
          </div>
          
          {/* References Column */}
          <div className="pl-4">
            <div className="text-sm font-semibold text-gray-400 mb-2">REFERENCES</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-lg font-bold text-purple-400">{referenceCounts.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Snippets</span>
                <span className="text-lg font-bold text-cyan-400">{referenceCounts.snippets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Docs</span>
                <span className="text-lg font-bold text-amber-400">{referenceCounts.documentation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrismCard>
  )
}