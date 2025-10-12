import React from 'react'
import { Calendar, Clock, CheckCircle, Star, FileText, Image, FileIcon, Sparkles } from 'lucide-react'
import PrismCard from '@/components/PrismCard'

interface ContentOwner {
  id: string
  name: string | null
  email: string
  avatar: string | null
  username: string
  bio: string | null
}

interface ContentEngagement {
  likes: number
  comments: number
  bookmarks: number
  views: number
}

interface DiscoverContentCardProps {
  contentType: 'PROJECT' | 'TASK' | 'NOTE' | 'EVENT' | 'PHOTO' | 'SCREENSHOT' | 'PDF'
  owner: ContentOwner
  content: any
  engagement: ContentEngagement
  createdAt: string
}

const DiscoverContentCard: React.FC<DiscoverContentCardProps> = ({
  contentType,
  owner,
  content,
  engagement,
  createdAt
}) => {
  if (!content) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'SUPERNOVA':
        return 'text-red-400'
      case 'STELLAR':
        return 'text-yellow-400'
      case 'NEBULA':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400'
      case 'ACTIVE':
        return 'text-cyan-400'
      default:
        return 'text-gray-400'
    }
  }

  const renderContentTypeIcon = () => {
    switch (contentType) {
      case 'PROJECT':
        return <Sparkles className="w-5 h-5 text-purple-400" />
      case 'TASK':
        return <CheckCircle className="w-5 h-5 text-cyan-400" />
      case 'NOTE':
        return <FileText className="w-5 h-5 text-yellow-400" />
      case 'EVENT':
        return <Calendar className="w-5 h-5 text-pink-400" />
      case 'PHOTO':
      case 'SCREENSHOT':
        return <Image className="w-5 h-5 text-green-400" />
      case 'PDF':
        return <FileIcon className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (contentType) {
      case 'PROJECT':
        return (
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-white flex-1">{content.name}</h3>
              {content.priority && (
                <Star className={`w-5 h-5 ml-2 ${getPriorityColor(content.priority)}`} />
              )}
            </div>
            {content.description && (
              <p className="text-gray-300 mb-4 line-clamp-3">{content.description}</p>
            )}
            {content._count && (
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{content._count.tasks || 0} tasks</span>
                <span>{content._count.references || 0} notes</span>
                <span>{content._count.media || 0} files</span>
                <span>{content._count.events || 0} events</span>
              </div>
            )}
          </div>
        )

      case 'TASK':
        return (
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white flex-1">{content.title}</h3>
              <div className="flex items-center gap-2 ml-2">
                {content.priority && (
                  <Star className={`w-4 h-4 ${getPriorityColor(content.priority)}`} />
                )}
                {content.status && (
                  <span className={`text-xs font-medium ${getStatusColor(content.status)}`}>
                    {content.status}
                  </span>
                )}
              </div>
            </div>
            {content.content && (
              <p className="text-gray-300 mb-3 line-clamp-2">{content.content}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {content.tags?.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            {(content.project || content.dueDate) && (
              <div className="flex gap-3 text-sm text-gray-400">
                {content.project && <span>📁 {content.project.name}</span>}
                {content.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(content.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )

      case 'NOTE':
        return (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{content.title}</h3>
            {content.content && (
              <p className="text-gray-300 mb-3 line-clamp-3">{content.content}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {content.category && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                  {content.category}
                </span>
              )}
              {content.tags?.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            {content.project && (
              <div className="text-sm text-gray-400">📁 {content.project.name}</div>
            )}
          </div>
        )

      case 'EVENT':
        return (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{content.name}</h3>
            {content.description && (
              <p className="text-gray-300 mb-3 line-clamp-2">{content.description}</p>
            )}
            <div className="space-y-1 text-sm text-gray-400 mb-3">
              {content.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(content.startDate).toLocaleDateString()}
                    {content.endDate && ` - ${new Date(content.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              {content.location && (
                <div className="flex items-center gap-2">
                  <span>📍 {content.location}</span>
                </div>
              )}
            </div>
            {(content.project || content._count) && (
              <div className="flex gap-3 text-sm text-gray-400">
                {content.project && <span>📁 {content.project.name}</span>}
                {content._count?.tasks > 0 && <span>{content._count.tasks} tasks</span>}
              </div>
            )}
          </div>
        )

      case 'PHOTO':
      case 'SCREENSHOT':
      case 'PDF':
        return (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{content.name}</h3>
            {(contentType === 'PHOTO' || contentType === 'SCREENSHOT') && content.thumbnailUrl && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={content.thumbnailUrl}
                  alt={content.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="flex gap-3 text-sm text-gray-400 mb-2">
              <span>{content.type}</span>
              {content.size && <span>{Math.round(content.size / 1024)} KB</span>}
            </div>
            {content.project && (
              <div className="text-sm text-gray-400">📁 {content.project.name}</div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <PrismCard className="hover:scale-[1.02] transition-transform duration-200">
      {/* Owner Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
          {owner.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.name || owner.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            owner.name?.charAt(0) || owner.username.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">
            {owner.name || owner.username}
          </div>
          <div className="text-xs text-gray-400">@{owner.username}</div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {renderContentTypeIcon()}
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Engagement Footer */}
      <div className="flex gap-6 mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
        <span className="hover:text-pink-400 cursor-pointer transition-colors">
          ❤️ {engagement.likes}
        </span>
        <span className="hover:text-blue-400 cursor-pointer transition-colors">
          💬 {engagement.comments}
        </span>
        <span className="hover:text-yellow-400 cursor-pointer transition-colors">
          🔖 {engagement.bookmarks}
        </span>
        <span className="ml-auto">👁️ {engagement.views}</span>
      </div>
    </PrismCard>
  )
}

export default DiscoverContentCard
