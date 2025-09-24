'use client'

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet'
  deviceOS: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'browser'
  deviceIdentifier: string
  deviceName: string
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined' || !window.navigator) return 'desktop'

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile = /iphone|ipod|android|blackberry|windows phone/.test(userAgent)
  const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/.test(userAgent)

  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'
  return 'desktop'
}

function getDeviceOS(): 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'browser' {
  if (typeof window === 'undefined' || !window.navigator) return 'browser'

  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform?.toLowerCase() || ''

  // Check for mobile OS first
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'

  // Check desktop OS
  if (platform.startsWith('win')) return 'windows'
  if (platform.startsWith('mac')) return 'macos'
  if (platform.includes('linux')) return 'linux'

  // Default to browser if we can't determine
  return 'browser'
}

function getDeviceIdentifier(): string {
  if (typeof window === 'undefined' || !window.navigator || !window.screen) return 'default-browser'

  try {
    // Create a unique identifier based on user agent and screen properties
    const userAgent = window.navigator.userAgent
    const screenResolution = `${window.screen.width}x${window.screen.height}`
    const colorDepth = window.screen.colorDepth
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Simple hash function for consistency
    const hashString = `${userAgent}-${screenResolution}-${colorDepth}-${timezone}`
    let hash = 0
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return `device-${Math.abs(hash).toString(36)}`
  } catch (error) {
    return 'default-browser'
  }
}

function getDeviceName(): string {
  const deviceType = getDeviceType()
  const deviceOS = getDeviceOS()

  // Create a friendly name based on device type and OS
  const osNames: Record<string, string> = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    ios: 'iOS',
    android: 'Android',
    browser: 'Web'
  }

  const typeNames: Record<string, string> = {
    desktop: 'Desktop',
    mobile: 'Device',
    tablet: 'Tablet'
  }

  return `${osNames[deviceOS] || 'Unknown'} ${typeNames[deviceType] || 'Device'}`
}

export function getDeviceInfo(): DeviceInfo {
  return {
    deviceType: getDeviceType(),
    deviceOS: getDeviceOS(),
    deviceIdentifier: getDeviceIdentifier(),
    deviceName: getDeviceName()
  }
}

// Cache device info for consistency during a session
let cachedDeviceInfo: DeviceInfo | null = null

export function getCachedDeviceInfo(): DeviceInfo {
  if (!cachedDeviceInfo) {
    cachedDeviceInfo = getDeviceInfo()
  }
  return cachedDeviceInfo
}