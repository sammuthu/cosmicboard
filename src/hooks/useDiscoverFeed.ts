import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api-client'

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

interface DiscoverFeedItem {
  id: string
  contentType: 'PROJECT' | 'TASK' | 'NOTE' | 'EVENT' | 'PHOTO' | 'SCREENSHOT' | 'PDF'
  contentId: string
  visibility: string
  createdAt: string
  updatedAt: string
  owner: ContentOwner
  content: any
  engagement: ContentEngagement
}

interface UseDiscoverFeedOptions {
  limit?: number
  type?: string
}

export function useDiscoverFeed(options: UseDiscoverFeedOptions = {}) {
  const { limit = 20, type } = options

  const [items, setItems] = useState<DiscoverFeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Track if initial load has happened
  const initialLoadDone = useRef(false)

  // Fetch initial feed
  const fetchInitial = useCallback(async () => {
    if (initialLoadDone.current) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(type && { type })
      })

      const response = await apiClient.get(`/discover/feed?${params.toString()}`)

      setItems(response.items || [])
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore || false)
      initialLoadDone.current = true
    } catch (err: any) {
      console.error('Failed to fetch discover feed:', err)
      setError(err.message || 'Failed to load discover feed')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [limit, type])

  // Fetch more items (infinite scroll)
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        cursor: nextCursor,
        ...(type && { type })
      })

      const response = await apiClient.get(`/discover/feed?${params.toString()}`)

      setItems(prev => [...prev, ...(response.items || [])])
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore || false)
    } catch (err: any) {
      console.error('Failed to fetch more items:', err)
      setError(err.message || 'Failed to load more items')
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, nextCursor, limit, type])

  // Refresh feed from scratch
  const refresh = useCallback(async () => {
    initialLoadDone.current = false
    setItems([])
    setNextCursor(null)
    setHasMore(true)
    await fetchInitial()
  }, [fetchInitial])

  // Auto-fetch on mount
  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  return {
    items,
    loading,
    hasMore,
    error,
    fetchMore,
    refresh
  }
}
