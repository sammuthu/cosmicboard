'use client'

import { useState } from 'react'
import { ChevronDown, Zap, Star, Cloud, Filter } from 'lucide-react'

export type PriorityLevel = 'all' | 'SUPERNOVA' | 'STELLAR' | 'NEBULA'
export type SortOrder = 'priority-high' | 'priority-low' | 'date-new' | 'date-old'

interface PriorityFilterProps {
  onPriorityChange?: (priority: PriorityLevel) => void
  onSortChange?: (sort: SortOrder) => void
  currentPriority?: PriorityLevel
  currentSort?: SortOrder
}

const priorityOptions = [
  { value: 'all' as PriorityLevel, label: 'All Priorities', icon: Filter, color: 'text-gray-400' },
  { value: 'SUPERNOVA' as PriorityLevel, label: 'Supernova', icon: Zap, color: 'text-red-400' },
  { value: 'STELLAR' as PriorityLevel, label: 'Stellar', icon: Star, color: 'text-yellow-400' },
  { value: 'NEBULA' as PriorityLevel, label: 'Nebula', icon: Cloud, color: 'text-green-400' }
]

const sortOptions = [
  { value: 'priority-high' as SortOrder, label: 'Highest Priority First' },
  { value: 'priority-low' as SortOrder, label: 'Lowest Priority First' },
  { value: 'date-new' as SortOrder, label: 'Newest First' },
  { value: 'date-old' as SortOrder, label: 'Oldest First' }
]

export default function PriorityFilter({
  onPriorityChange,
  onSortChange,
  currentPriority = 'all',
  currentSort = 'priority-high'
}: PriorityFilterProps) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const selectedPriority = priorityOptions.find(p => p.value === currentPriority) || priorityOptions[0]
  const selectedSort = sortOptions.find(s => s.value === currentSort) || sortOptions[0]

  return (
    <div className="flex gap-3 mb-6">
      {/* Priority Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowPriorityMenu(!showPriorityMenu)
            setShowSortMenu(false)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-white transition-colors border border-gray-700"
        >
          <selectedPriority.icon className={`w-4 h-4 ${selectedPriority.color}`} />
          <span>{selectedPriority.label}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showPriorityMenu && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20">
            {priorityOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onPriorityChange?.(option.value)
                    setShowPriorityMenu(false)
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-800 transition-colors ${
                    currentPriority === option.value ? 'bg-gray-800' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-white">{option.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Sort Order */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSortMenu(!showSortMenu)
            setShowPriorityMenu(false)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-white transition-colors border border-gray-700"
        >
          <span>{selectedSort.label}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showSortMenu && (
          <div className="absolute top-full mt-2 left-0 w-56 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange?.(option.value)
                  setShowSortMenu(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                  currentSort === option.value ? 'bg-gray-800 text-white' : 'text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}