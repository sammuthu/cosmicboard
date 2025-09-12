'use client'

import { useState } from 'react'
import { ArrowLeft, UserPlus, Send, Users, Mail, Check, X, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PrismCard from '@/components/PrismCard'
import { toast } from 'sonner'

interface Invitation {
  id: string
  email: string
  status: 'pending' | 'sent' | 'accepted' | 'rejected'
  sentAt: Date
  projectName?: string
}

export default function InvitesPage() {
  const router = useRouter()
  const [emails, setEmails] = useState('')
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [shareLink, setShareLink] = useState('')

  const generateShareLink = () => {
    const link = `${window.location.origin}/join?token=${Math.random().toString(36).substring(7)}`
    setShareLink(link)
    navigator.clipboard.writeText(link)
    toast.success('Share link copied to clipboard!')
  }

  const sendInvitations = async () => {
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e)
    
    if (emailList.length === 0) {
      toast.error('Please enter at least one email address')
      return
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailList.filter(email => !emailRegex.test(email))
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`)
      return
    }

    setSending(true)
    
    try {
      // Send invitations via backend
      const { apiClient } = await import('@/lib/api-client')
      
      const response = await apiClient.post('/invitations/send', {
        emails: emailList,
        projectId: projectId || undefined,
        message: message || undefined
      })

      // Add to local state
      const newInvitations: Invitation[] = emailList.map(email => ({
        id: Math.random().toString(36).substring(7),
        email,
        status: 'sent',
        sentAt: new Date(),
        projectName: projectId ? `Project ${projectId}` : undefined
      }))

      setInvitations(prev => [...newInvitations, ...prev])
      
      toast.success(`${emailList.length} invitation(s) sent successfully!`)
      
      // Clear form
      setEmails('')
      setMessage('')
      
    } catch (error: any) {
      console.error('Failed to send invitations:', error)
      toast.error(error.message || 'Failed to send invitations. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const resendInvitation = async (invitation: Invitation) => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.post(`/invitations/${invitation.id}/resend`)
      
      toast.success(`Invitation resent to ${invitation.email}`)
      
      // Update status
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitation.id 
            ? { ...inv, status: 'sent', sentAt: new Date() }
            : inv
        )
      )
    } catch (error) {
      toast.error('Failed to resend invitation')
    }
  }

  const cancelInvitation = async (invitation: Invitation) => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      await apiClient.delete(`/invitations/${invitation.id}`)
      
      toast.success('Invitation cancelled')
      
      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  const getStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 'sent': return 'text-blue-400'
      case 'pending': return 'text-yellow-400'
      case 'accepted': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: Invitation['status']) => {
    switch (status) {
      case 'sent': return <Send className="w-4 h-4" />
      case 'pending': return <Mail className="w-4 h-4" />
      case 'accepted': return <Check className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Invite Collaborators</h1>
            <p className="text-gray-400 mt-1">Send invitations to collaborate on your projects</p>
          </div>
        </div>

        {/* Send Invitations Form */}
        <PrismCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Send New Invitations</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Addresses (comma-separated)
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="sammuthu@me.com, pubhttp@gmail.com, john@example.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Projects</option>
                <option value="1">Q4 Marketing Plan</option>
                <option value="2">Website Redesign</option>
                <option value="3">Mobile App Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'd like to invite you to collaborate on this project..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendInvitations}
                disabled={sending || !emails.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Invitations'}
              </button>
              
              <button
                onClick={generateShareLink}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {shareLink && (
              <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-sm text-blue-400 mb-1">Share Link Generated:</p>
                <code className="text-xs text-white break-all">{shareLink}</code>
              </div>
            )}
          </div>
        </PrismCard>

        {/* Sent Invitations */}
        <PrismCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Sent Invitations</h2>
            </div>
            <span className="text-sm text-gray-400">{invitations.length} total</span>
          </div>

          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No invitations sent yet</p>
              <p className="text-gray-500 text-sm mt-1">Send invitations above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map(invitation => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white/10 rounded-lg ${getStatusColor(invitation.status)}`}>
                      {getStatusIcon(invitation.status)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className={getStatusColor(invitation.status)}>
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                        {invitation.projectName && (
                          <>
                            <span>•</span>
                            <span>{invitation.projectName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(invitation.sentAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {invitation.status === 'sent' && (
                      <button
                        onClick={() => resendInvitation(invitation)}
                        className="px-3 py-1 text-sm text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      >
                        Resend
                      </button>
                    )}
                    {(invitation.status === 'sent' || invitation.status === 'pending') && (
                      <button
                        onClick={() => cancelInvitation(invitation)}
                        className="px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PrismCard>
      </div>
    </div>
  )
}