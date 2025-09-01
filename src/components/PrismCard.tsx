'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PrismCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
}

export default function PrismCard({ children, className, glow = true, onClick }: PrismCardProps) {
  return (
    <div className={cn("relative group", className)} onClick={onClick}>
      {glow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur" />
      )}
      <div className={cn(
        "relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-2xl backdrop-blur-sm",
        onClick && "cursor-pointer hover:scale-[1.01] transition-transform duration-300"
      )}>
        {children}
      </div>
    </div>
  )
}