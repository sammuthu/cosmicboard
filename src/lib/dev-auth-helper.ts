/**
 * Development Authentication Helper
 * This helps set up authentication tokens for development mode
 */

export const setupDevAuthTokens = async () => {
  if (typeof window === 'undefined') return;

  console.log('🔧 Setting up development authentication for nmuthu@gmail.com...');

  // Use the same token that's seeded in the database (matching mobile approach)
  const devToken = 'acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d';
  const devUser = {
    id: 'dev-user-nmuthu',
    email: 'nmuthu@gmail.com',
    name: 'Development User',
  };

  const authTokens = {
    accessToken: devToken,
    refreshToken: devToken,
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  };

  localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
  localStorage.setItem('user', JSON.stringify(devUser));

  console.log('✅ Development auth configured successfully');
  console.log('👤 User:', devUser.email);

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