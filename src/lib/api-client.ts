// API client for frontend to communicate with backend
import { getApiEndpoint } from '@/config/environment'

// Legacy support - will be deprecated
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7778'
const USE_EXTERNAL_BACKEND = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true'

// Get the appropriate API URL (using new environment config)
export const getApiUrl = (endpoint: string) => {
  return getApiEndpoint(endpoint)
}

// Helper function for API calls with better error handling
export const apiClient = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(getApiUrl(endpoint))
      
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
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
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
        headers: { 'Content-Type': 'application/json' },
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