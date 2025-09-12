'use client'

import { useState, useEffect } from 'react'
import { X, Users, MessageSquare, Share2, Bell, TrendingUp, Clock, Heart, MessageCircle, Send, MoreHorizontal, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import PrismCard from './PrismCard'

interface NetworkItem {
  id: string
  type: 'share' | 'comment' | 'like' | 'mention'
  user: {
    name: string
    email: string
    avatar?: string
  }
  content: string
  projectName?: string
  timestamp: Date
  itemCount?: number
  reactions?: number
  comments?: Comment[]
}

interface Comment {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  content: string
  timestamp: Date
}

interface NetworkSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NetworkSidebar({ isOpen, onClose }: NetworkSidebarProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'shared' | 'activity'>('feed')
  const [networkItems, setNetworkItems] = useState<NetworkItem[]>([])
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Fetch network feed
    if (isOpen) {
      fetchNetworkFeed()
    }
  }, [isOpen])

  const fetchNetworkFeed = async () => {
    try {
      // Mock data for now - will be replaced with API call
      const mockData: NetworkItem[] = [
        {
          id: '1',
          type: 'share',
          user: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          content: 'shared 3 documents with you',
          projectName: 'Q4 Marketing Plan',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          itemCount: 3,
          reactions: 2,
          comments: [
            {
              id: 'c1',
              user: { name: 'Sarah Smith', email: 'sarah@example.com' },
              content: 'Thanks for sharing! These look great.',
              timestamp: new Date(Date.now() - 60 * 60 * 1000)
            }
          ]
        },
        {
          id: '2',
          type: 'comment',
          user: {
            name: 'Sarah Smith',
            email: 'sarah@example.com'
          },
          content: 'commented on your task',
          projectName: 'Website Redesign',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          reactions: 1,
          comments: []
        },
        {
          id: '3',
          type: 'like',
          user: {
            name: 'Mike Johnson',
            email: 'mike@example.com'
          },
          content: 'liked your screenshot',
          projectName: 'Mobile App UI',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          reactions: 0,
          comments: []
        }
      ]
      setNetworkItems(mockData)
    } catch (error) {
      console.error('Failed to fetch network feed:', error)
    }
  }

  const handleAddComment = async (itemId: string) => {
    const comment = newComment[itemId]
    if (!comment?.trim()) return

    // Add comment logic here
    console.log('Adding comment to item:', itemId, comment)
    
    // Clear comment input
    setNewComment(prev => ({ ...prev, [itemId]: '' }))
  }

  const getActivityIcon = (type: NetworkItem['type']) => {
    switch (type) {
      case 'share': return <Share2 className="w-4 h-4 text-blue-400" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-green-400" />
      case 'like': return <Heart className="w-4 h-4 text-red-400" />
      case 'mention': return <Bell className="w-4 h-4 text-yellow-400" />
      default: return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  const getUserInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-md border-l border-purple-500/20 z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Network</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'feed' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Feed
              </div>
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'shared' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Shared
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'activity' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Activity
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'feed' && (
            <>
              {networkItems.map(item => (
                <PrismCard key={item.id} variant="glass" className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      {item.user.avatar ? (
                        <img src={item.user.avatar} alt={item.user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getUserInitials(item.user.name, item.user.email)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.user.name}</span>
                        {getActivityIcon(item.type)}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {item.content}
                        {item.projectName && (
                          <span className="text-purple-400"> in {item.projectName}</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Item count badge */}
                  {item.itemCount && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      <Eye className="w-3 h-3" />
                      {item.itemCount} items
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{item.reactions || 0}</span>
                    </button>
                    <button 
                      onClick={() => setShowComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{item.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[item.id] && (
                    <div className="mt-4 space-y-3">
                      {/* Existing comments */}
                      {item.comments?.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                            {getUserInitials(comment.user.name, comment.user.email)}
                          </div>
                          <div className="flex-1 bg-white/5 rounded-lg p-2">
                            <p className="text-white text-sm font-medium">{comment.user.name}</p>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add comment */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[item.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          onClick={() => handleAddComment(item.id)}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </PrismCard>
              ))}

              {networkItems.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No network activity yet</p>
                  <p className="text-gray-500 text-sm mt-1">Share projects to see activity here</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'shared' && (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Shared items will appear here</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Your activity history</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}