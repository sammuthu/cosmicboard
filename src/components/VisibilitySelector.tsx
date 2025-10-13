'use client'

import { Globe, Users, Lock, UserPlus } from 'lucide-react'

export type VisibilityOption = 'PUBLIC' | 'CONTACTS' | 'PRIVATE'

interface VisibilitySelectorProps {
  value: VisibilityOption
  onChange: (value: VisibilityOption) => void
  disabled?: boolean
  className?: string
}

export default function VisibilitySelector({ value, onChange, disabled = false, className = '' }: VisibilitySelectorProps) {
  const options: Array<{
    value: VisibilityOption
    label: string
    icon: React.ComponentType<any>
    description: string
    color: string
    bgColor: string
  }> = [
    {
      value: 'PRIVATE',
      label: 'Private',
      icon: Lock,
      description: 'Only you can see this',
      color: 'text-gray-300',
      bgColor: 'bg-gray-700/30'
    },
    {
      value: 'CONTACTS',
      label: 'Contacts',
      icon: Users,
      description: 'Share with your contacts',
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/20'
    },
    {
      value: 'PUBLIC',
      label: 'Public',
      icon: Globe,
      description: 'Everyone can see this',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/20'
    }
  ]

  return (
    <div className={className}>
      <label className="block text-gray-400 text-sm mb-2">Visibility</label>
      <div className="grid grid-cols-3 gap-3">
        {options.map(option => {
          const Icon = option.icon
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? `${option.bgColor} border-${option.color.replace('text-', '')} ${option.color}`
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? option.color : 'text-gray-500'}`} />
                <span className="text-sm font-medium">{option.label}</span>
                <span className={`text-xs ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                  {option.description}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Note about groups */}
      <p className="mt-3 text-xs text-gray-500 italic">
        Note: Group sharing coming soon
      </p>
    </div>
  )
}
