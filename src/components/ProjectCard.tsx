'use client'

import PrismCard from './PrismCard'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

type Priority = 'SUPERNOVA' | 'STELLAR' | 'NEBULA'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    priority?: Priority
    counts: {
      radar?: {
        created: number
        inProgress: number
        completed: number
      }
      neuralNotes?: number
      moments?: number
      snaps?: number
      scrolls?: number
      // Legacy support
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

  // Support both new and old data structures
  const radar = project.counts.radar || {
    created: project.counts.tasks?.active || 0,
    inProgress: 0,
    completed: project.counts.tasks?.completed || 0
  }

  const neuralNotes = project.counts.neuralNotes ?? 0
  const moments = project.counts.moments ?? 0
  const snaps = project.counts.snaps ?? 0
  const scrolls = project.counts.scrolls ?? 0

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

  const handleCardClick = () => {
    router.push(`/projects/${project._id}`)
  }

  const handleAssetClick = (e: React.MouseEvent, tab: string) => {
    e.stopPropagation()
    router.push(`/projects/${project._id}?tab=${tab}`)
  }

  return (
    <PrismCard
      className="h-full relative cursor-pointer"
      onClick={handleCardClick}
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
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="space-y-4 mt-4">
        {/* Radar (Tasks) - Special row with 3 states */}
        <div
          onClick={(e) => handleAssetClick(e, 'radar')}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <span className="text-sm font-semibold text-gray-300">Radar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Created</span>
              <span className="text-lg font-bold text-blue-400">{radar.created}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-lg font-bold text-yellow-400">{radar.inProgress}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Done</span>
              <span className="text-lg font-bold text-green-400">{radar.completed}</span>
            </div>
          </div>
        </div>

        {/* Neural Notes */}
        <div
          onClick={(e) => handleAssetClick(e, 'neural-notes')}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="text-sm font-semibold text-gray-300">Neural Notes</span>
          </div>
          <span className="text-lg font-bold text-purple-400">{neuralNotes}</span>
        </div>

        {/* Moments */}
        <div
          onClick={(e) => handleAssetClick(e, 'moments')}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <span className="text-sm font-semibold text-gray-300">Moments</span>
          </div>
          <span className="text-lg font-bold text-pink-400">{moments}</span>
        </div>

        {/* Snaps */}
        <div
          onClick={(e) => handleAssetClick(e, 'snaps')}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📎</span>
            <span className="text-sm font-semibold text-gray-300">Snaps</span>
          </div>
          <span className="text-lg font-bold text-cyan-400">{snaps}</span>
        </div>

        {/* Scrolls */}
        <div
          onClick={(e) => handleAssetClick(e, 'scrolls')}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <span className="text-sm font-semibold text-gray-300">Scrolls</span>
          </div>
          <span className="text-lg font-bold text-amber-400">{scrolls}</span>
        </div>
      </div>
    </PrismCard>
  )
}
