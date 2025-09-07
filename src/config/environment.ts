/**
 * Environment Configuration
 * Centralized configuration for different deployment environments
 */

export type Environment = 'development' | 'staging' | 'production'

interface EnvironmentConfig {
  name: Environment
  apiUrl: string
  corsOrigins: string[]
  features: {
    useExternalBackend: boolean
    mediaStorage: 'local' | 's3' | 'cloudinary'
    authentication: boolean
  }
}

// Get current environment from multiple sources
const getEnvironment = (): Environment => {
  if (typeof window !== 'undefined') {
    // Client-side
    return (process.env.NEXT_PUBLIC_APP_ENV as Environment) || 'development'
  }
  // Server-side
  return (process.env.APP_ENV as Environment) || 'development'
}

// Environment configurations
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    apiUrl: 'http://localhost:7779',
    corsOrigins: [
      'http://localhost:7777',
      'http://localhost:3000',
      'https://cosmic.board',
      'http://cosmic.board',
      'https://cosmicspace.app',
      'https://www.cosmicspace.app',
      'http://cosmicspace.app',
      'http://www.cosmicspace.app',
      'http://localhost:7779'
    ],
    features: {
      useExternalBackend: true,  // Always use external backend
      mediaStorage: 'local',
      authentication: false
    }
  },
  
  staging: {
    name: 'staging',
    apiUrl: 'https://api-staging.cosmicboard.com',
    corsOrigins: [
      'https://staging.cosmicboard.com',
      'https://staging.cosmicboard.vercel.app'
    ],
    features: {
      useExternalBackend: true,
      mediaStorage: 's3',
      authentication: true
    }
  },
  
  production: {
    name: 'production',
    apiUrl: 'https://api.cosmicboard.com',
    corsOrigins: [
      'https://cosmicboard.com',
      'https://www.cosmicboard.com',
      'https://cosmicboard.vercel.app',
      'capacitor://localhost', // iOS
      'http://localhost' // Android
    ],
    features: {
      useExternalBackend: true,
      mediaStorage: 's3',
      authentication: true
    }
  }
}

// Get current configuration
export const getConfig = (): EnvironmentConfig => {
  const env = getEnvironment()
  return configs[env]
}

// Helper to get API URL for a given endpoint
export const getApiEndpoint = (endpoint: string): string => {
  const config = getConfig()
  const env = getEnvironment()
  
  // In development, handle different access patterns
  if (env === 'development') {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      const protocol = window.location.protocol
      
      // If accessing through HTTPS domains (cosmic.board, cosmicspace.app)
      // Use relative paths so nginx can proxy the requests
      if (protocol === 'https:' || host === 'cosmic.board' || host === 'cosmicspace.app' || host === 'www.cosmicspace.app') {
        return `/api${endpoint}`
      }
      
      // For localhost access, use the backend directly
      return `${config.apiUrl}/api${endpoint}`
    }
  }
  
  // For staging and production, always use the configured API URL
  return `${config.apiUrl}/api${endpoint}`
}

// CORS configuration helper for backend
export const getCorsConfig = () => {
  const config = getConfig()
  return {
    origin: (origin: string | undefined, callback: Function) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) {
        return callback(null, true)
      }
      
      // Check if origin is allowed
      if (config.corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // In development, be more permissive
        if (getEnvironment() === 'development') {
          callback(null, true)
        } else {
          callback(new Error(`CORS: Origin ${origin} not allowed`))
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  }
}

// Export current environment
export const currentEnv = getEnvironment()
export const isDevelopment = currentEnv === 'development'
export const isStaging = currentEnv === 'staging'
export const isProduction = currentEnv === 'production'

// Feature flags
export const features = getConfig().features

// Log configuration on load (only in development)
if (isDevelopment && typeof window !== 'undefined') {
  console.log('🔧 Environment:', currentEnv)
  console.log('🔧 API URL:', getConfig().apiUrl)
  console.log('🔧 Features:', features)
}