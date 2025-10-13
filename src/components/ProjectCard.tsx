'use client'

import PrismCard from './PrismCard'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'
import VisibilityDropdown, { VisibilityOption } from './VisibilityDropdown'

type Priority = 'SUPERNOVA' | 'STELLAR' | 'NEBULA'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    priority?: Priority
    visibility?: VisibilityOption
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
  const [currentVisibility, setCurrentVisibility] = useState<VisibilityOption>(project.visibility || 'PRIVATE')

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

  const handleVisibilityChange = async (newVisibility: VisibilityOption) => {
    const oldVisibility = currentVisibility

    // Immediately update the UI (optimistic update)
    setCurrentVisibility(newVisibility)

    try {
      await apiClient.put(`/projects/${project._id}`, { visibility: newVisibility })
      toast.success(`Visibility updated to ${newVisibility.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast.error('Failed to update visibility')
      // Rollback on error
      setCurrentVisibility(oldVisibility)
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
      className="relative cursor-pointer transition-all duration-300 ease-in-out group hover:scale-105 hover:z-20"
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

      {/* Title - always one line with ellipsis, expands on hover */}
      <h3 className="text-xl font-bold text-white mb-2 pr-12 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
        {project.name}
      </h3>

      {/* Visibility Dropdown */}
      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
        <VisibilityDropdown
          value={currentVisibility}
          onChange={handleVisibilityChange}
          size="sm"
          showLabel={true}
        />
      </div>

      {/* Description - always reserves space, one line by default, expands on hover */}
      <div className="min-h-[20px] mb-3">
        <p className="text-gray-400 text-sm line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
          {project.description || '\u00A0'}
        </p>
      </div>

      {/* Compact asset counts in one row */}
      <div className="flex items-center gap-2 flex-wrap mt-4">
        {/* Radar (Tasks) - Total count */}
        <button
          onClick={(e) => handleAssetClick(e, 'radar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 transition-all"
          title="📌 Radar - Tasks and action items"
        >
          <span className="text-base">📌</span>
          <span className="text-sm font-semibold text-blue-400">{radar.created + radar.inProgress + radar.completed}</span>
        </button>

        {/* Neural Notes */}
        <button
          onClick={(e) => handleAssetClick(e, 'neural-notes')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-purple-500/50 transition-all"
          title="🧠 Neural Notes - Code snippets, docs, links, and notes"
        >
          <span className="text-base">🧠</span>
          <span className="text-sm font-semibold text-purple-400">{neuralNotes}</span>
        </button>

        {/* Moments */}
        <button
          onClick={(e) => handleAssetClick(e, 'moments')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-pink-500/50 transition-all"
          title="📸 Moments - Photos and images"
        >
          <span className="text-base">📸</span>
          <span className="text-sm font-semibold text-pink-400">{moments}</span>
        </button>

        {/* Snaps */}
        <button
          onClick={(e) => handleAssetClick(e, 'snaps')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/50 transition-all"
          title="📎 Snaps - Screenshots and captures"
        >
          <span className="text-base">📎</span>
          <span className="text-sm font-semibold text-cyan-400">{snaps}</span>
        </button>

        {/* Scrolls */}
        <button
          onClick={(e) => handleAssetClick(e, 'scrolls')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-amber-500/50 transition-all"
          title="📄 Scrolls - PDFs and documents"
        >
          <span className="text-base">📄</span>
          <span className="text-sm font-semibold text-amber-400">{scrolls}</span>
        </button>
      </div>
    </PrismCard>
  )
}
