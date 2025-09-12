/**
 * Development Authentication Helper
 * This helps set up authentication tokens for development mode
 */

export const setupDevAuthTokens = () => {
  if (typeof window === 'undefined') return;
  
  // Valid refresh token from the database
  const devToken = 'acf42bf1db7047b8f6fced9eb611ea285faeef09e98efe1818f51edb687d2005';
  
  // Store the token in localStorage in the format the frontend expects
  const authTokens = {
    accessToken: devToken,
    refreshToken: devToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
  };
  
  localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
  console.log('🔑 Development auth tokens set up');
  
  return authTokens;
};

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_tokens');
  console.log('🧹 Auth tokens cleared');
};

export const checkAuthTokens = () => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('auth_tokens');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
      return null;
    }
  }
  return null;
};