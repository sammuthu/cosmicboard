// API client for frontend to communicate with backend
import { getApiEndpoint } from '@/config/environment'
import { getCachedDeviceInfo } from '@/lib/device-info'

// Legacy support - will be deprecated
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7778'
const USE_EXTERNAL_BACKEND = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true'

// Get the appropriate API URL (using new environment config)
export const getApiUrl = (endpoint: string) => {
  return getApiEndpoint(endpoint)
}

// Helper function to get auth headers and device info
const getHeaders = (includeContentType: boolean = false) => {
  const headers: Record<string, string> = {}

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_tokens')
    if (stored) {
      const tokens = JSON.parse(stored)
      if (tokens.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`
      }
    }

    // Add device info headers (only in browser)
    try {
      const deviceInfo = getCachedDeviceInfo()
      headers['X-Device-Type'] = deviceInfo.deviceType
      headers['X-Device-OS'] = deviceInfo.deviceOS
      headers['X-Device-Identifier'] = deviceInfo.deviceIdentifier
      headers['X-Device-Name'] = deviceInfo.deviceName
    } catch (error) {
      // Use defaults if device info fails
      headers['X-Device-Type'] = 'desktop'
      headers['X-Device-OS'] = 'browser'
      headers['X-Device-Identifier'] = 'unknown-device'
      headers['X-Device-Name'] = 'Unknown Device'
    }
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

// Helper function for API calls with better error handling
export const apiClient = {
  get: async (endpoint: string, options?: { params?: Record<string, any> }) => {
    try {
      let url = getApiUrl(endpoint)
      if (options?.params) {
        const queryParams = new URLSearchParams(options.params).toString()
        url += `?${queryParams}`
      }

      const response = await fetch(url, {
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage = `API call failed: ${response.statusText}`
        
        try {
          const jsonError = JSON.parse(errorData)
          errorMessage = jsonError.error || jsonError.message || errorMessage
        } catch {
          // If not JSON, use the text
          if (errorData) errorMessage = errorData
        }
        
        throw new Error(errorMessage)
      }
      
      return response.json()
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error)
      throw error
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      console.log(`API POST ${endpoint} with data:`, data)

      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API POST ${endpoint} failed with status ${response.status}:`, errorText)
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { error: errorText || response.statusText }
        }
        throw new Error(error.error || error.message || 'API call failed')
      }

      return response.json()
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error)
      throw error
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || 'API call failed')
      }
      
      return response.json()
    } catch (error) {
      console.error(`API PUT ${endpoint} failed:`, error)
      throw error
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || 'API call failed')
      }
      
      return response.json()
    } catch (error) {
      console.error(`API DELETE ${endpoint} failed:`, error)
      throw error
    }
  },

  // Upload method for multipart/form-data
  upload: async (endpoint: string, formData: FormData) => {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || error.message || 'Upload failed')
      }
      
      return response.json()
    } catch (error) {
      console.error(`API UPLOAD ${endpoint} failed:`, error)
      throw error
    }
  }
}