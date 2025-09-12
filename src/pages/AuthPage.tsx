import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, verifyMagicLink, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if there's a token in the URL
    const token = searchParams.get('token');
    if (token) {
      handleVerifyToken(token);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !verifying) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, verifying]);

  const handleVerifyToken = async (token: string) => {
    setVerifying(true);
    setMessage(null);
    
    const result = await verifyMagicLink(token);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Successfully signed in! Redirecting...' });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message || 'Invalid or expired link' });
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = isSignup ? await signup(email) : await login(email);
    
    if (result.success) {
      setEmailSent(true);
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <h2 className="text-2xl font-bold text-white">Verifying your magic link...</h2>
            <p className="text-white/70 text-center">Please wait while we sign you in</p>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent && !message?.type) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Check your email!</h2>
            <p className="text-white/70 text-center">
              We've sent a magic link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-white/70 text-center text-sm">
              Click the link in the email to sign in. The link expires in 15 minutes.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="text-purple-300 hover:text-white transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-purple-300" />
              <div className="absolute inset-0 animate-pulse">
                <Sparkles className="h-16 w-16 text-purple-400 opacity-50" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CosmicSpace</h1>
          <p className="text-white/70">
            {isSignup ? 'Create your account with just your email' : 'Sign in to your cosmic workspace'}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
              : 'bg-red-500/20 text-red-200 border border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Sending magic link...
              </span>
            ) : (
              <span>{isSignup ? 'Create Account' : 'Send Magic Link'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage(null);
            }}
            className="text-purple-300 hover:text-white transition-colors text-sm"
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/50 text-xs text-center">
            No password needed! We'll send you a secure magic link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;