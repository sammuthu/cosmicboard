"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Send, Users, Mail, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import PrismCard from '@/components/PrismCard';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface Connection {
  id: string;
  userId: string;
  connectionId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  connection?: {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}

export default function NetworkPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'invite'>('connections');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConnections();
    }
  }, [isAuthenticated]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const [connectionsRes, pendingRes] = await Promise.all([
        apiClient.get('/connections'),
        apiClient.get('/connections/pending')
      ]);
      
      setConnections(connectionsRes.filter((c: Connection) => c.status === 'accepted'));
      setPendingRequests(pendingRes);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingInvite(true);
    try {
      await apiClient.post('/connections/invite', { email: inviteEmail });
      toast.success(`Connection request sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchConnections();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send connection request');
    } finally {
      setSendingInvite(false);
    }
  };

  const acceptRequest = async (connectionId: string) => {
    try {
      await apiClient.post(`/connections/${connectionId}/accept`, {});
      toast.success('Connection request accepted');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const rejectRequest = async (connectionId: string) => {
    try {
      await apiClient.post(`/connections/${connectionId}/reject`, {});
      toast.success('Connection request rejected');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to reject connection');
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      await apiClient.delete(`/connections/${connectionId}`);
      toast.success('Connection removed');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to remove connection');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-400 mx-auto" />
          <p className="text-gray-400 mt-4">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Network
              </h1>
              <p className="text-gray-400 text-sm mt-1">Connect and collaborate with others</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'connections'
                ? 'bg-purple-500/30 text-purple-300'
                : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === 'pending'
                ? 'bg-purple-500/30 text-purple-300'
                : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Pending ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'invite'
                ? 'bg-purple-500/30 text-purple-300'
                : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Invite
          </button>
        </div>

        {/* Content */}
        {activeTab === 'connections' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.length === 0 ? (
              <PrismCard className="col-span-full">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No connections yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start by inviting people to connect</p>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              </PrismCard>
            ) : (
              connections.map((connection) => {
                const otherUser = connection.user?.id === user?.id ? connection.connection : connection.user;
                return (
                  <PrismCard key={connection.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {otherUser?.name?.[0] || otherUser?.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {otherUser?.name || otherUser?.email?.split('@')[0]}
                          </p>
                          <p className="text-gray-400 text-sm">{otherUser?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeConnection(connection.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove connection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </PrismCard>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="grid gap-4">
            {pendingRequests.length === 0 ? (
              <PrismCard>
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No pending requests</p>
                </div>
              </PrismCard>
            ) : (
              pendingRequests.map((request) => {
                const isIncoming = request.connectionId === user?.id;
                const otherUser = isIncoming ? request.user : request.connection;
                
                return (
                  <PrismCard key={request.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {otherUser?.name?.[0] || otherUser?.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {otherUser?.name || otherUser?.email?.split('@')[0]}
                          </p>
                          <p className="text-gray-400 text-sm">{otherUser?.email}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {isIncoming ? 'Wants to connect' : 'Request sent'}
                          </p>
                        </div>
                      </div>
                      {isIncoming ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(request.id)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-yellow-400 text-sm">Pending</span>
                      )}
                    </div>
                  </PrismCard>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <PrismCard>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Send Connection Request
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                      disabled={sendingInvite}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sendingInvite ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  They'll receive an email invitation to connect with you
                </p>
              </div>
            </form>
          </PrismCard>
        )}
      </div>
    </div>
  );
}