// API configuration for CosmicBoard frontend
// This determines whether to use local Next.js API routes or external backend

const USE_EXTERNAL_BACKEND = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const API_BASE_URL = USE_EXTERNAL_BACKEND ? `${BACKEND_URL}/api` : '/api';

// Helper function to make API calls
export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = USE_EXTERNAL_BACKEND 
    ? `${BACKEND_URL}/api${endpoint}` 
    : `/api${endpoint}`;
    
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}