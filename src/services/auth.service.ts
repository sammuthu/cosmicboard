import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7779';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // Load tokens from localStorage on init (only in browser)
    if (typeof window !== 'undefined') {
      this.loadTokens();
      // DISABLED: Auto-login (to allow testing with multiple accounts)
      // In development, ensure tokens are always available
      // if (process.env.NODE_ENV === 'development' && !this.accessToken) {
      //   this.setupDevelopmentAuthSync();
      // }
    }
  }

  private setupDevelopmentAuthSync() {
    // Use the same seeded token as mobile (this token is seeded in the database)
    const devToken = 'acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d';
    this.accessToken = devToken;
    this.refreshToken = devToken;
    this.tokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Save to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiry: this.tokenExpiry.toISOString()
      }));

      // Set user if not exists
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        const mockUser = {
          id: 'dev-user-nmuthu',
          email: 'nmuthu@gmail.com',
          name: 'Development User',
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    }

    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
  }

  private loadTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
      // DISABLED: Auto-login in development (to allow testing with multiple accounts)
      // if (process.env.NODE_ENV === 'development') {
      //   const devToken = 'acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d';
      //   this.accessToken = devToken;
      //   this.refreshToken = devToken;
      //   this.tokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

      //   // Save tokens to localStorage for persistence
      //   localStorage.setItem('auth_tokens', JSON.stringify({
      //     accessToken: this.accessToken,
      //     refreshToken: this.refreshToken,
      //     expiry: this.tokenExpiry.toISOString()
      //   }));

      //   // Store mock user if not exists
      //   const storedUser = localStorage.getItem('user');
      //   if (!storedUser) {
      //     const mockUser = {
      //       id: 'dev-user-nmuthu',
      //       email: 'nmuthu@gmail.com',
      //       name: 'Development User',
      //     };
      //     localStorage.setItem('user', JSON.stringify(mockUser));
      //   }

      //   // Set axios default header
      //   axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      //   return;
      // }

      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiry = new Date(tokens.expiry);

        // Set axios default header
        if (this.accessToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        }
      }
    }
  }

  private saveTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);
    
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiry: this.tokenExpiry.toISOString()
      }));
    }
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('user');
    }
    delete axios.defaults.headers.common['Authorization'];
  }

  async sendMagicLink(email: string, isSignup: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/magic-link`, {
        email,
        isSignup
      });
      return {
        success: true,
        message: response.data.message || 'Magic link sent to your email'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to send magic link'
      };
    }
  }

  async verifyMagicLink(token: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-link`, { token });
      
      if (response.data.tokens) {
        this.saveTokens(response.data.tokens);
      }
      
      if (response.data.user && typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        user: response.data.user
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Invalid or expired magic link'
      };
    }
  }

  async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: this.refreshToken
      });
      
      if (response.data.tokens) {
        this.saveTokens(response.data.tokens);
        return true;
      }
      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // Check if token needs refresh
    if (this.tokenExpiry && this.tokenExpiry < new Date()) {
      const refreshed = await this.refreshTokens();
      if (!refreshed) return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      // Try to refresh token once
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('user', JSON.stringify(response.data));
          }
          return response.data;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async updateProfile(data: { name?: string; username?: string; bio?: string; avatar?: string }): Promise<User | null> {
    try {
      const response = await axios.patch(`${API_URL}/api/auth/me`, data);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch {
      // Ignore errors, we'll clear tokens anyway
    }
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.tokenExpiry && this.tokenExpiry > new Date();
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  async setupDevelopmentAuth(email: string = 'nmuthu@gmail.com'): Promise<{ success: boolean; user?: User; message?: string }> {
    // In development, use the seeded token from database (matching mobile approach)
    console.log('🔧 Setting up development auth for nmuthu@gmail.com...');

    // Use the same token that's seeded in the database
    const devToken = 'acf42bf1db704dd18e3c64e20f1e73da2f19f8c23cf3bdb7e23c9c2a3c5f1e2d';

    this.accessToken = devToken;
    this.refreshToken = devToken;
    this.tokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Save tokens to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiry: this.tokenExpiry.toISOString()
      }));
    }

    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

    // Fetch actual user data from API (includes avatar and other fields)
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        console.log('✅ Development auth configured successfully');
        console.log('👤 User:', currentUser.email, currentUser.avatar ? '(with avatar)' : '(no avatar)');

        return {
          success: true,
          user: currentUser,
        };
      }
    } catch (error) {
      console.error('Failed to fetch user from API, using mock data:', error);
    }

    // Fallback to mock user if API fails
    const devUser = {
      id: 'dev-user-nmuthu',
      email: 'nmuthu@gmail.com',
      name: 'Development User',
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('user', JSON.stringify(devUser));
    }

    return {
      success: true,
      user: devUser,
    };
  }
}

export default new AuthService();