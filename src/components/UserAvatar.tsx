'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, Settings, Bell, Users, MessageSquare, Share2, UserPlus, Palette, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProfilePictureUpload from './ProfilePictureUpload'

interface UserAvatarProps {
  onOpenSidebar?: () => void
}

export default function UserAvatar({ onOpenSidebar }: UserAvatarProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfilePictureUpload, setShowProfilePictureUpload] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout, refreshUser } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials from email or name
  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Generate color from email for consistent avatar color
  const getAvatarColor = () => {
    if (!user?.email) return 'from-purple-500 to-pink-500'
    const hash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500'
    ]
    return colors[hash % colors.length]
  }

  return (
    <div className="relative z-[200]" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative group"
        data-testid="profile-dropdown"
      >
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10"></div>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-sm">{getInitials()}</span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden z-[9999] animate-fadeIn">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white font-semibold overflow-hidden`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{getInitials()}</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProfilePictureUpload(true)
                    setShowDropdown(false)
                  }}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                  title="Change profile picture"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{user?.name || user?.email?.split('@')[0]}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                onOpenSidebar?.()
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors group"
            >
              <div className="relative">
                <Users className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <span className="flex-1 text-left">Network Feed</span>
              <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">3 new</span>
            </button>

            <button
              onClick={() => {
                router.push('/messages')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="flex-1 text-left">Messages</span>
              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">5</span>
            </button>

            <button
              onClick={() => {
                router.push('/invites')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="flex-1 text-left">Invite Collaborators</span>
            </button>

            <button
              onClick={() => {
                router.push('/shared')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="flex-1 text-left">Shared with Me</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-purple-500/20"></div>

          {/* Settings & Logout */}
          <div className="p-2">
            <button
              onClick={() => {
                router.push('/notifications')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="flex-1 text-left">Notifications</span>
            </button>

            <button
              onClick={() => {
                router.push('/themes')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
              <Palette className="w-5 h-5" />
              <span className="flex-1 text-left">Customize Themes</span>
            </button>

            <button
              onClick={() => {
                router.push('/settings')
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="flex-1 text-left">Settings</span>
            </button>

            <button
              onClick={async () => {
                await logout()
                router.push('/auth')
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureUpload && (
        <ProfilePictureUpload
          currentAvatar={user?.avatar}
          onUploadComplete={(avatarUrl) => {
            setShowProfilePictureUpload(false)
            refreshUser()
          }}
          onCancel={() => setShowProfilePictureUpload(false)}
        />
      )}
    </div>
  )
}