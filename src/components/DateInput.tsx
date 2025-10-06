'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultToCurrentYear?: boolean
}

export default function DateInput({
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
  className = '',
  defaultToCurrentYear = true
}: DateInputProps) {
  const [monthInput, setMonthInput] = useState('')
  const [dayInput, setDayInput] = useState('')
  const [yearInput, setYearInput] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth())
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear())
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  // Parse value prop into inputs
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setMonthInput(String(date.getMonth() + 1).padStart(2, '0'))
        setDayInput(String(date.getDate()).padStart(2, '0'))
        setYearInput(String(date.getFullYear()))
        setPickerMonth(date.getMonth())
        setPickerYear(date.getFullYear())
      }
    } else {
      setMonthInput('')
      setDayInput('')
      setYearInput('')
      if (defaultToCurrentYear) {
        const now = new Date()
        setPickerMonth(now.getMonth())
        setPickerYear(now.getFullYear())
      }
    }
  }, [value, defaultToCurrentYear])

  // Update picker when inputs change
  useEffect(() => {
    const month = parseInt(monthInput, 10)
    const year = parseInt(yearInput, 10)

    if (month >= 1 && month <= 12) {
      setPickerMonth(month - 1)
    }

    if (year >= 1900 && year <= 2100) {
      setPickerYear(year)
    }
  }, [monthInput, yearInput])

  const validateAndEmit = (month: string, day: string, year: string) => {
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    const y = parseInt(year, 10)

    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      const date = new Date(y, m - 1, d)
      if (date.getMonth() === m - 1 && date.getDate() === d) {
        const isoDate = date.toISOString().split('T')[0]
        console.log('DateInput emitting value:', isoDate)
        onChange(isoDate)
        return true
      }
    } else if (!month && !day && !year) {
      // All empty, clear the date
      onChange('')
      return true
    }
    return false
  }

  const handleMonthChange = (val: string) => {
    // Only allow 1-2 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 2)
    setMonthInput(cleaned)

    if (cleaned.length === 2) {
      dayRef.current?.focus()
    }

    validateAndEmit(cleaned, dayInput, yearInput)
  }

  const handleDayChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 2)
    setDayInput(cleaned)

    if (cleaned.length === 2) {
      yearRef.current?.focus()
    }

    validateAndEmit(monthInput, cleaned, yearInput)
  }

  const handleYearChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4)
    setYearInput(cleaned)
    validateAndEmit(monthInput, dayInput, cleaned)
  }

  const handleInputFocus = () => {
    setShowPicker(true)
  }

  const handleDateClick = (day: number) => {
    const month = String(pickerMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const year = String(pickerYear)

    setMonthInput(month)
    setDayInput(dayStr)
    setYearInput(year)
    validateAndEmit(month, dayStr, year)
  }

  const previousMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11)
      setPickerYear(pickerYear - 1)
    } else {
      setPickerMonth(pickerMonth - 1)
    }
  }

  const nextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0)
      setPickerYear(pickerYear + 1)
    } else {
      setPickerMonth(pickerMonth + 1)
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isSelectedDate = (day: number) => {
    if (!monthInput || !dayInput || !yearInput) return false
    return (
      parseInt(monthInput, 10) === pickerMonth + 1 &&
      parseInt(dayInput, 10) === day &&
      parseInt(yearInput, 10) === pickerYear
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === pickerMonth &&
      today.getFullYear() === pickerYear
    )
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(pickerMonth, pickerYear)
    const firstDay = getFirstDayOfMonth(pickerMonth, pickerYear)
    const days = []

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelectedDate(day)
      const today = isToday(day)
      const hovered = hoveredDate === day

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => setHoveredDate(day)}
          onMouseLeave={() => setHoveredDate(null)}
          className={`
            p-2 text-sm rounded-lg transition-all
            ${selected
              ? 'bg-purple-500 text-white font-bold ring-2 ring-purple-400'
              : today
              ? 'bg-blue-500/20 text-blue-300 font-semibold'
              : 'text-gray-300 hover:bg-gray-700'
            }
            ${hovered && !selected ? 'ring-1 ring-gray-600' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  // Click outside to close picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const clearDate = () => {
    setMonthInput('')
    setDayInput('')
    setYearInput('')
    onChange('')
    const now = new Date()
    setPickerMonth(now.getMonth())
    setPickerYear(now.getFullYear())
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Date Input Fields */}
        <div className="flex-1 flex items-center gap-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus-within:border-purple-500 transition-colors">
          <input
            ref={monthRef}
            type="text"
            value={monthInput}
            onChange={(e) => handleMonthChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="MM"
            className="w-8 bg-transparent text-white text-center focus:outline-none"
            maxLength={2}
          />
          <span className="text-gray-500">/</span>
          <input
            ref={dayRef}
            type="text"
            value={dayInput}
            onChange={(e) => handleDayChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="DD"
            className="w-8 bg-transparent text-white text-center focus:outline-none"
            maxLength={2}
          />
          <span className="text-gray-500">/</span>
          <input
            ref={yearRef}
            type="text"
            value={yearInput}
            onChange={(e) => handleYearChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="YYYY"
            className="w-12 bg-transparent text-white text-center focus:outline-none"
            maxLength={4}
          />

          {(monthInput || dayInput || yearInput) && (
            <button
              type="button"
              onClick={clearDate}
              className="ml-auto text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Picker */}
      {showPicker && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={pickerMonth}
                onChange={(e) => setPickerMonth(parseInt(e.target.value, 10))}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>

              <input
                type="number"
                value={pickerYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value, 10)
                  if (year >= 1900 && year <= 2100) {
                    setPickerYear(year)
                  }
                }}
                min={1900}
                max={2100}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg w-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                const month = String(today.getMonth() + 1).padStart(2, '0')
                const day = String(today.getDate()).padStart(2, '0')
                const year = String(today.getFullYear())

                setMonthInput(month)
                setDayInput(day)
                setYearInput(year)
                setPickerMonth(today.getMonth())
                setPickerYear(today.getFullYear())
                validateAndEmit(month, day, year)
              }}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Today
            </button>
            <button
              type="button"
              onClick={clearDate}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
