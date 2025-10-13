'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Users, Lock, ChevronDown } from 'lucide-react'

export type VisibilityOption = 'PUBLIC' | 'CONTACTS' | 'PRIVATE'

interface VisibilityDropdownProps {
  value: VisibilityOption
  onChange: (value: VisibilityOption) => Promise<void> | void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const visibilityConfig = {
  PRIVATE: {
    label: 'Private',
    icon: Lock,
    emoji: '🔒',
    description: 'Only you',
    color: 'text-gray-400',
    hoverColor: 'hover:text-gray-300',
    bgColor: 'bg-gray-700/30',
    hoverBgColor: 'hover:bg-gray-700/50'
  },
  CONTACTS: {
    label: 'Contacts',
    icon: Users,
    emoji: '👥',
    description: 'Your contacts',
    color: 'text-blue-400',
    hoverColor: 'hover:text-blue-300',
    bgColor: 'bg-blue-500/20',
    hoverBgColor: 'hover:bg-blue-500/30'
  },
  PUBLIC: {
    label: 'Public',
    icon: Globe,
    emoji: '🌍',
    description: 'Everyone',
    color: 'text-purple-400',
    hoverColor: 'hover:text-purple-300',
    bgColor: 'bg-purple-500/20',
    hoverBgColor: 'hover:bg-purple-500/30'
  }
}

export default function VisibilityDropdown({
  value,
  onChange,
  disabled = false,
  size = 'md',
  showLabel = true
}: VisibilityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentConfig = visibilityConfig[value]
  const Icon = currentConfig.icon

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleChange = async (newValue: VisibilityOption) => {
    if (newValue === value || disabled || isUpdating) return

    setIsUpdating(true)
    try {
      await onChange(newValue)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to update visibility:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
      emoji: 'text-sm',
      dropdown: 'min-w-[160px]'
    },
    md: {
      button: 'px-3 py-2 text-sm gap-2',
      icon: 'w-4 h-4',
      emoji: 'text-base',
      dropdown: 'min-w-[180px]'
    },
    lg: {
      button: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
      emoji: 'text-lg',
      dropdown: 'min-w-[200px]'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`
          flex items-center rounded-lg border border-gray-700
          ${currentConfig.bgColor} ${currentConfig.color}
          ${!disabled && !isUpdating ? `${currentConfig.hoverBgColor} ${currentConfig.hoverColor} cursor-pointer` : 'opacity-50 cursor-not-allowed'}
          transition-all duration-200
          ${sizeClasses[size].button}
        `}
        title={`Visibility: ${currentConfig.label} - ${currentConfig.description}`}
      >
        <span className={sizeClasses[size].emoji}>{currentConfig.emoji}</span>
        {showLabel && (
          <>
            <span className="font-medium">{currentConfig.label}</span>
            <ChevronDown className={`${sizeClasses[size].icon} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && !disabled && (
        <div className={`
          absolute left-0 top-full mt-2
          bg-gray-800 border border-gray-700 rounded-lg shadow-xl
          overflow-hidden z-50
          ${sizeClasses[size].dropdown}
        `}>
          {(['PRIVATE', 'CONTACTS', 'PUBLIC'] as VisibilityOption[]).map((option) => {
            const config = visibilityConfig[option]
            const OptionIcon = config.icon
            const isSelected = option === value

            return (
              <button
                key={option}
                onClick={() => handleChange(option)}
                disabled={isUpdating || isSelected}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5
                  transition-colors text-left
                  ${isSelected
                    ? `${config.bgColor} ${config.color} cursor-default`
                    : `text-gray-300 hover:bg-gray-700/50 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
                  }
                `}
              >
                <span className="text-lg">{config.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{config.label}</div>
                  <div className="text-xs opacity-70">{config.description}</div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                )}
              </button>
            )
          })}

          <div className="px-3 py-2 border-t border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-500 italic">
              💡 Groups coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
