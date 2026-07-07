import { useState, useEffect } from 'react'
import { Check, X, User, ShieldAlert, ShieldCheck } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Input } from '../ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Database } from '../../lib/database.types'

type Profile = Database['public']['Tables']['users']['Row']
type Institution = Database['public']['Tables']['institutions']['Row'] & {
  require_admin_approval: boolean
}

type ConfirmState = 
  | { type: 'toggle', newValue: boolean }
  | { type: 'approve', userId: string }
  | { type: 'reject', userId: string }
  | null

export function ApprovalsTab() {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true })
      
      if (usersError) throw usersError
      setPendingUsers(usersData || [])

      const { data: instData, error: instError } = await supabase
        .from('institutions')
        .select('*')
        .limit(1)
        .single()
      
      if (instError) throw instError
      setInstitution(instData as Institution)
    } catch (err: any) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleClick = () => {
    if (!institution) return
    setConfirmState({ type: 'toggle', newValue: !institution.require_admin_approval })
  }

  const handleActionClick = (userId: string, action: 'verified' | 'rejected') => {
    setConfirmState({ type: action === 'verified' ? 'approve' : 'reject', userId })
    if (action === 'reject') setRejectReason('')
  }

  const executeToggle = async (newValue: boolean) => {
    setIsProcessing(true)
    try {
      const { error: updateError } = await supabase
        .from('institutions')
        .update({ require_admin_approval: newValue })
        .eq('id', institution!.id)
      
      if (updateError) throw updateError

      setInstitution(prev => prev ? { ...prev, require_admin_approval: newValue } : null)
      
      if (!newValue) {
        if (pendingUsers.length > 0) {
          toast.loading('Verifying pending users...', { id: 'auto-verify' })
          const { error: verifyError } = await supabase
            .from('users')
            .update({ verification_status: 'verified' })
            .eq('verification_status', 'pending')
          
          if (verifyError) throw verifyError
          setPendingUsers([])
          toast.success('Admin approval disabled. Pending users verified.', { id: 'auto-verify' })
        } else {
          toast.success('Admin approval disabled for new users.')
        }
      } else {
        toast.success('Admin approval enabled. New users will require verification.')
      }
    } catch (err: any) {
      toast.error('Failed to update settings')
    } finally {
      setIsProcessing(false)
      setConfirmState(null)
    }
  }

  const executeAction = async (userId: string, action: 'verified' | 'rejected', reason?: string | null) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          verification_status: action,
          rejection_reason: reason || null
        })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User ${action === 'verified' ? 'approved' : 'rejected'}`)
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err: any) {
      toast.error(`Failed to ${action} user`)
    } finally {
      setIsProcessing(false)
      setConfirmState(null)
      setRejectReason('')
    }
  }

  const handleConfirm = () => {
    if (!confirmState) return
    if (confirmState.type === 'toggle') {
      executeToggle(confirmState.newValue)
    } else if (confirmState.type === 'approve') {
      executeAction(confirmState.userId, 'verified')
    } else if (confirmState.type === 'reject') {
      executeAction(confirmState.userId, 'rejected', rejectReason)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Settings Toggle */}
      {institution && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${institution.require_admin_approval ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400'}`}>
              {institution.require_admin_approval ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Require Admin Approval</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                {institution.require_admin_approval 
                  ? 'New users must be manually verified by an admin.' 
                  : 'New users are automatically verified and can use the app immediately.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleClick}
            disabled={isProcessing}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
              institution.require_admin_approval ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                institution.require_admin_approval ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Pending Users List */}
      {pendingUsers.length === 0 ? (
        <EmptyState title="No pending approvals" description="All user accounts have been reviewed." />
      ) : (
        <div className="space-y-4">
      {pendingUsers.map(user => (
        <div key={user.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center shrink-0 transition-colors">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white transition-colors">{user.full_name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{user.index_number}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                title="Reject" 
                onClick={() => handleActionClick(user.id, 'rejected')}
                className="w-10 h-10 rounded-full bg-danger-50 dark:bg-danger-500/10 text-danger-500 dark:text-danger-400 flex items-center justify-center hover:bg-danger-100 dark:hover:bg-danger-500/20 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
              <button 
                title="Approve" 
                onClick={() => handleActionClick(user.id, 'verified')}
                className="w-10 h-10 rounded-full bg-success-50 dark:bg-success-500/10 text-success-500 dark:text-success-400 flex items-center justify-center hover:bg-success-100 dark:hover:bg-success-500/20 active:scale-95 transition-all"
              >
                <Check size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl transition-colors">
              <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Department</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors">{user.department}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl transition-colors">
              <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Level</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors">{user.level}</span>
            </div>
          </div>

          {user.id_photo_url && (
            <div className="mt-2">
              <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">ID Card Photo</span>
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden relative group transition-colors">
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
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState !== null}
        onClose={() => {
          setConfirmState(null)
          setRejectReason('')
        }}
        onConfirm={handleConfirm}
        isLoading={isProcessing}
        title={
          confirmState?.type === 'toggle' 
            ? confirmState.newValue ? 'Enable Admin Approval?' : 'Disable Admin Approval?' 
            : confirmState?.type === 'approve' 
            ? 'Approve Student?' 
            : 'Reject Student?'
        }
        description={
          confirmState?.type === 'toggle' 
            ? confirmState.newValue 
              ? 'Future users will need to be manually approved by an admin before they can report or claim items.' 
              : 'All pending users will be automatically approved immediately, and future users will no longer require manual approval.'
            : confirmState?.type === 'approve'
            ? 'Are you sure you want to approve this student? They will be able to report and claim items on the platform.'
            : 'Are you sure you want to reject this student? They will be notified and asked to submit better details.'
        }
        confirmText={
          confirmState?.type === 'toggle' 
            ? confirmState.newValue ? 'Enable Approval' : 'Disable & Auto-Approve All'
            : confirmState?.type === 'approve' 
            ? 'Approve' 
            : 'Reject Student'
        }
        isDestructive={confirmState?.type === 'reject'}
      >
        {confirmState?.type === 'reject' && (
          <div className="mt-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Reason for Rejection (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. ID photo is blurry"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
