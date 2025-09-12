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
    }
  }

  private loadTokens() {
    if (typeof window !== 'undefined' && window.localStorage) {
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
}

export default new AuthService();