'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PrismCard from './PrismCard'
import { formatDate, isOverdue } from '@/lib/utils'
import { CheckCircle, Clock, Calendar } from 'lucide-react'

interface Task {
  _id: string
  title: string
  contentHtml?: string
  dueDate?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  projectId: {
    _id: string
    name: string
  }
}

export default function CurrentPriority() {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentPriority = async () => {
    try {
      const res = await fetch('/api/current-priority')
      const data = await res.json()
      setTask(data)
    } catch (error) {
      console.error('Failed to fetch current priority:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentPriority()
  }, [])

  const handleComplete = async () => {
    if (!task) return
    
    try {
      await fetch(`/api/tasks/${task._id}/complete`, { method: 'POST' })
      fetchCurrentPriority()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleSnooze = async () => {
    if (!task) return
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    try {
      await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: tomorrow })
      })
      fetchCurrentPriority()
    } catch (error) {
      console.error('Failed to snooze task:', error)
    }
  }

  if (loading) {
    return (
      <PrismCard className="mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        </div>
      </PrismCard>
    )
  }

  if (!task) {
    return (
      <PrismCard className="mb-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-2">All Clear! 🎉</h2>
          <p className="text-gray-400">No active tasks. Time to create something new!</p>
        </div>
      </PrismCard>
    )
  }

  const priorityColors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50'
  }

  const cosmicPriorityNames = {
    HIGH: 'Supernova',
    MEDIUM: 'Stellar',
    LOW: 'Nebula'
  }

  return (
    <PrismCard className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-purple-400 mb-2">🎯 Current Priority</h2>
          <button
            onClick={() => router.push(`/projects/${task.projectId._id}`)}
            className="inline-flex items-center bg-blue-500/20 text-blue-400 text-sm px-3 py-1 rounded-full hover:bg-blue-500/30 transition-colors"
          >
            {task.projectId.name}
          </button>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority]}`}>
          {cosmicPriorityNames[task.priority]}
        </span>
      </div>
      
      <h3 
        className="text-2xl font-bold text-white mb-4 cursor-pointer hover:text-purple-300 transition-colors"
        onClick={() => router.push(`/projects/${task.projectId._id}`)}
      >
        {task.title}
      </h3>
      
      {task.contentHtml && (
        <div 
          className="text-gray-300 mb-4 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: task.contentHtml }}
        />
      )}
      
      {task.dueDate && (
        <div className={`flex items-center gap-2 mb-6 ${isOverdue(task.dueDate) ? 'text-red-400' : 'text-gray-400'}`}>
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Due {formatDate(task.dueDate)}</span>
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Mark Complete
        </button>
        <button
          onClick={handleSnooze}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          <Clock className="w-4 h-4" />
          Snooze 1d
        </button>
      </div>
    </PrismCard>
  )
}