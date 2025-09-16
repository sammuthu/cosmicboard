'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PrismCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
  [key: string]: any  // Allow additional props
}

export default function PrismCard({ children, className, glow = true, onClick, ...props }: PrismCardProps) {
  return (
    <div className={cn("relative group", className)} onClick={onClick} {...props}>
      {glow && (
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"
          style={{
            background: `linear-gradient(to right, var(--theme-card-glow-from), var(--theme-card-glow-via), var(--theme-card-glow-to))`
          }}
        />
      )}
      <div className={cn(
        "relative rounded-2xl p-6 shadow-2xl backdrop-blur-sm",
        onClick && "cursor-pointer hover:scale-[1.01] transition-transform duration-300"
      )}
      style={{
        background: `linear-gradient(135deg, var(--theme-card-bg-from), var(--theme-card-bg-via), var(--theme-card-bg-to))`,
        borderColor: 'var(--theme-card-border)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}>
        {children}
      </div>
    </div>
  )
}