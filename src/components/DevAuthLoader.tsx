'use client';

import { useEffect } from 'react';

/**
 * DevAuthLoader - Loads dev auth helper in browser
 * This makes devAuth.* functions available in Safari console
 */
export default function DevAuthLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Import dev auth helper to expose window.devAuth
      import('@/lib/dev-auth-helper');
    }
  }, []);

  return null;
}
