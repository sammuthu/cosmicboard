// API client for frontend to communicate with backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const USE_EXTERNAL_BACKEND = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';

// Get the appropriate API URL
export const getApiUrl = (endpoint: string) => {
  if (USE_EXTERNAL_BACKEND) {
    return `${BACKEND_URL}/api${endpoint}`;
  }
  return `/api${endpoint}`;
};

// Helper function for API calls
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(getApiUrl(endpoint));
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'API call failed');
    }
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  },
};