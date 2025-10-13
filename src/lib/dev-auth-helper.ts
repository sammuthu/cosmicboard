/**
 * Development Authentication Helper
 * This helps set up authentication tokens for development mode
 *
 * Multiple accounts are configured for testing shared projects:
 * - nmuthu@gmail.com (default)
 * - sammuthu@me.com (for testing discover feed)
 */

// Development tokens (generated via backend /setup-dev-auth endpoint)
// Last refreshed: 2025-10-13 (90-day expiry)
const DEV_TOKENS = {
  'nmuthu@gmail.com': {
    token: '03c053eada3696970cb3c7df426b27a7081c11bc8ba721e5902b74b19e66b0b7',
    user: {
      id: '6b0a6f4f-002f-40cb-babe-95908a565f45',
      email: 'nmuthu@gmail.com',
      name: 'Nmuthu',
    }
  },
  'sammuthu@me.com': {
    token: 'ec0beada0489d36dc5d87f018fb2513c9a29fb418e3c7ee4894845a00ab6f220',
    user: {
      id: 'c7e7967b-a27d-4932-82af-71dd4cadcb80',
      email: 'sammuthu@me.com',
      name: 'Sam Muthu',
    }
  }
};

export const setupDevAuthTokens = async (email: string = 'nmuthu@gmail.com') => {
  if (typeof window === 'undefined') return;

  const config = DEV_TOKENS[email as keyof typeof DEV_TOKENS];
  if (!config) {
    console.error('❌ Unknown dev user:', email);
    console.log('Available users:', Object.keys(DEV_TOKENS));
    return;
  }

  console.log(`🔧 Setting up development authentication for ${email}...`);

  const authTokens = {
    accessToken: config.token,
    refreshToken: config.token,
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  };

  localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
  localStorage.setItem('user', JSON.stringify(config.user));

  console.log('✅ Development auth configured successfully');
  console.log('👤 User:', config.user.name, `(${config.user.email})`);
  console.log('🔄 Refresh the page to apply changes');

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

export const switchToUser = (email: string) => {
  return setupDevAuthTokens(email);
};

export const listAvailableUsers = () => {
  console.log('📋 Available dev users:');
  Object.keys(DEV_TOKENS).forEach(email => {
    const config = DEV_TOKENS[email as keyof typeof DEV_TOKENS];
    console.log(`  • ${config.user.name} (${email})`);
  });
  console.log('\n💡 Usage: switchToUser("email")');
};

// Expose helper functions on window for Safari console access
if (typeof window !== 'undefined') {
  (window as any).devAuth = {
    setupDevAuthTokens,
    switchToUser,
    listAvailableUsers,
    clearAuthTokens,
    checkAuthTokens,
  };

  // Log available commands
  console.log('🔧 Dev Auth Helper loaded!');
  console.log('Available commands:');
  console.log('  devAuth.listAvailableUsers()    - List available dev accounts');
  console.log('  devAuth.switchToUser("email")   - Switch to a different account');
  console.log('  devAuth.checkAuthTokens()       - Check current tokens');
  console.log('  devAuth.clearAuthTokens()       - Clear all tokens');
}