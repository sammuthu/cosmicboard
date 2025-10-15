"use client";

import { useState, useEffect } from 'react';
import { Users, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import PrismCard from './PrismCard';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DevAccount {
  email: string;
  name: string;
  username?: string;
}

/**
 * DevAccountSwitcher - Development-only component for quick account switching
 *
 * Features:
 * - Lists all available dev accounts
 * - One-click switching between accounts
 * - Shows current logged-in account
 * - Auto-refreshes auth context after switch
 * - Only visible in development mode
 *
 * Usage: Add to app layout or create a keyboard shortcut to toggle
 */
export function DevAccountSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<DevAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const { user, checkAuth } = useAuth();

  // Only show in development
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (isDev && isOpen) {
      loadAccounts();
    }
  }, [isDev, isOpen]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/dev-accounts');
      setAccounts(response.accounts);
    } catch (error) {
      console.error('Failed to load dev accounts:', error);
      toast.error('Failed to load dev accounts');
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = async (email: string) => {
    try {
      setSwitching(email);

      // Call dev-login endpoint
      const response = await apiClient.post('/auth/dev-login', { email });

      // Store tokens in localStorage
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiry: new Date(Date.now() + response.tokens.expiresIn * 1000).toISOString(),
      }));

      // Store user
      localStorage.setItem('user', JSON.stringify(response.user));

      // Refresh auth context
      await checkAuth();

      toast.success(`Switched to ${response.user.name}`, {
        description: email,
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to switch account:', error);
      toast.error('Failed to switch account', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSwitching(null);
    }
  };

  // Don't render in production
  if (!isDev) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Switch Dev Account (Cmd+Shift+A)"
      >
        <Users className="w-6 h-6" />
      </button>

      {/* Account switcher modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <PrismCard className="w-full max-w-md space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Dev Account Switcher</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Switch between test accounts instantly
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Current account */}
            {user && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Current:</span>
                  <span className="text-white">{user.name}</span>
                  <span className="text-gray-400">({user.email})</span>
                </div>
              </div>
            )}

            {/* Account list */}
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : (
                accounts.map((account) => {
                  const isCurrent = user?.email === account.email;
                  const isSwitching = switching === account.email;

                  return (
                    <button
                      key={account.email}
                      onClick={() => !isCurrent && switchAccount(account.email)}
                      disabled={isCurrent || isSwitching}
                      className={`
                        w-full p-4 rounded-lg text-left transition-all duration-200
                        ${isCurrent
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 cursor-default'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                        }
                        ${isSwitching ? 'opacity-50 cursor-wait' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {account.name}
                            </span>
                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            )}
                            {isSwitching && (
                              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {account.email}
                          </div>
                          {account.username && (
                            <div className="text-xs text-gray-500 mt-1">
                              @{account.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Info footer */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">
                💡 <strong>Dev Mode Only:</strong> This component automatically
                uses pre-configured tokens. No emails sent!
              </p>
            </div>
          </PrismCard>
        </div>
      )}
    </>
  );
}

// Keyboard shortcut hook (optional - add to main layout)
export function useDevAccountSwitcherShortcut(
  callback: () => void
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+A or Ctrl+Shift+A
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
