import { useState, useEffect } from 'react'
import { Check, X, User } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Database } from '../../lib/database.types'

type Profile = Database['public']['Tables']['users']['Row']

export function ApprovalsTab() {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setPendingUsers(data || [])
    } catch (err: any) {
      toast.error('Failed to load pending users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (userId: string, action: 'verified' | 'rejected') => {
    try {
      let rejection_reason = null
      if (action === 'rejected') {
        const reason = window.prompt('Reason for rejection (optional):')
        if (reason === null) return // Cancelled
        rejection_reason = reason
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          verification_status: action,
          rejection_reason
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User ${action === 'verified' ? 'approved' : 'rejected'}`)
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err: any) {
      toast.error(`Failed to ${action} user`)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500">Loading...</div>
  }

  if (pendingUsers.length === 0) {
    return <EmptyState title="No pending approvals" description="All user accounts have been reviewed." />
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map(user => (
        <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{user.full_name}</h3>
                <p className="text-sm text-slate-500">{user.index_number}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                title="Reject" 
                onClick={() => handleAction(user.id, 'rejected')}
                className="w-10 h-10 rounded-full bg-danger-50 text-danger-500 flex items-center justify-center hover:bg-danger-100 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
              <button 
                title="Approve" 
                onClick={() => handleAction(user.id, 'verified')}
                className="w-10 h-10 rounded-full bg-success-50 text-success-500 flex items-center justify-center hover:bg-success-100 active:scale-95 transition-all"
              >
                <Check size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 p-3 rounded-2xl">
              <span className="block text-xs text-slate-400 font-medium mb-0.5">Department</span>
              <span className="font-semibold text-slate-700">{user.department}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl">
              <span className="block text-xs text-slate-400 font-medium mb-0.5">Level</span>
              <span className="font-semibold text-slate-700">{user.level}</span>
            </div>
          </div>

          {user.id_photo_url && (
            <div className="mt-2">
              <span className="block text-xs text-slate-400 font-medium mb-2">ID Card Photo</span>
              <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden relative group">
                <img 
                  src={user.id_photo_url} 
                  alt="Student ID" 
                  className="w-full h-full object-cover"
                />
                <a 
                  href={user.id_photo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View Full Image
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
