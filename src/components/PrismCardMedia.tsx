'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PrismCardMediaProps {
  children: ReactNode
  className?: string
  variant?: 'media' | 'document' | 'gallery'
  onClick?: () => void
  aspectRatio?: 'square' | 'video' | 'auto'
}

export default function PrismCardMedia({ 
  children, 
  className, 
  variant = 'media',
  onClick,
  aspectRatio = 'square'
}: PrismCardMediaProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }

  const variantClasses = {
    media: 'p-0 overflow-hidden',
    document: 'p-3 flex items-center gap-3',
    gallery: 'p-4 min-h-[400px]'
  }

  return (
    <div className={cn("relative group", className)} onClick={onClick}>
      {/* Subtle glow effect for media cards */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 blur-md" />
      
      <div className={cn(
        "relative bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-xl shadow-xl backdrop-blur-md border border-white/5",
        variantClasses[variant],
        aspectRatioClasses[aspectRatio],
        onClick && "cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl"
      )}>
        {children}
      </div>
    </div>
  )
}