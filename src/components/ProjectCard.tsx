'use client'

import PrismCard from './PrismCard'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
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
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  
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

  return (
    <PrismCard 
      className="h-full"
      onClick={() => router.push(`/projects/${project._id}`)}
    >
      <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
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