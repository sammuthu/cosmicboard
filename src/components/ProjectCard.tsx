'use client'

import PrismCard from './PrismCard'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: {
    _id: string
    name: string
    description?: string
    counts: {
      active: number
      completed: number
      deleted: number
    }
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const total = project.counts.active + project.counts.completed
  const progress = total > 0 ? (project.counts.completed / total) * 100 : 0

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
        
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{project.counts.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{project.counts.completed}</div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{project.counts.deleted}</div>
            <div className="text-xs text-gray-500">Deleted</div>
          </div>
        </div>
      </div>
    </PrismCard>
  )
}