import { useState, useEffect } from 'react'
import { FileText, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Database } from '../../lib/database.types'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { formatDistanceToNow } from 'date-fns'

type Claim = Database['public']['Tables']['claims']['Row'] & {
  item: Database['public']['Tables']['items']['Row']
  claimer: Database['public']['Tables']['users']['Row']
}

export function ClaimsTab() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmState, setConfirmState] = useState<{ action: 'approved' | 'rejected', claimId: string, itemId: string } | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          item:items(*),
          claimer:users!claims_claimer_id_fkey(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setClaims(data as unknown as Claim[] || [])
    } catch (err: any) {
      toast.error('Failed to load claims')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = (claimId: string, itemId: string, action: 'approved' | 'rejected') => {
    setConfirmState({ claimId, itemId, action })
  }

  const executeClaimAction = async () => {
    if (!confirmState) return
    const { action, claimId, itemId } = confirmState
    
    setIsProcessing(true)
    try {
      // Update claim status
      const { error: claimError } = await supabase
        .from('claims')
        .update({ status: action })
        .eq('id', claimId)

      if (claimError) throw claimError

      if (action === 'approved') {
        // Mark item as claimed
        const { error: itemError } = await supabase
          .from('items')
          .update({ status: 'claimed' })
          .eq('id', itemId)
        
        if (itemError) throw itemError

        // Also reject any other pending claims for this item
        await supabase
          .from('claims')
          .update({ status: 'rejected' })
          .eq('item_id', itemId)
          .eq('status', 'pending')
          .neq('id', claimId)
      }

      toast.success(`Claim ${action}`)
      setClaims(prev => prev.filter(c => c.id !== claimId))
    } catch (err: any) {
      toast.error(`Failed to ${action} claim`)
    } finally {
      setIsProcessing(false)
      setConfirmState(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">Loading claims...</div>
  }

  if (claims.length === 0) {
    return <EmptyState title="No pending claims" description="All claims have been resolved." />
  }

  return (
    <div className="space-y-4">
      {claims.map(claim => (
        <div key={claim.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center shrink-0 transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 transition-colors">{claim.item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Claimed by {claim.claimer.full_name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">{formatDistanceToNow(new Date(claim.created_at))} ago</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleActionClick(claim.id, claim.item_id, 'rejected')}
                className="w-10 h-10 rounded-full bg-danger-50 dark:bg-danger-500/10 text-danger-500 dark:text-danger-400 flex items-center justify-center hover:bg-danger-100 dark:hover:bg-danger-500/20 active:scale-95 transition-all"
                title="Reject Claim"
              >
                <XCircle size={20} />
              </button>
              <button 
                onClick={() => handleActionClick(claim.id, claim.item_id, 'approved')}
                className="w-10 h-10 rounded-full bg-success-50 dark:bg-success-500/10 text-success-500 dark:text-success-400 flex items-center justify-center hover:bg-success-100 dark:hover:bg-success-500/20 active:scale-95 transition-all"
                title="Approve Claim"
              >
                <CheckCircle size={20} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl transition-colors">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">Proof of Ownership</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap transition-colors">{claim.proof_description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
             <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl transition-colors">
               <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Claimer Index</span>
               <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors">{claim.claimer.index_number}</span>
             </div>
             <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl transition-colors">
               <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Claimer Email</span>
               <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block transition-colors">{claim.claimer.email}</span>
             </div>
          </div>
        </div>
      ))}
      
      <ConfirmDialog
        isOpen={confirmState !== null}
        onClose={() => setConfirmState(null)}
        onConfirm={executeClaimAction}
        isLoading={isProcessing}
        title={confirmState?.action === 'approved' ? 'Approve Claim?' : 'Reject Claim?'}
        description={
          confirmState?.action === 'approved'
            ? 'Are you sure you want to approve this claim? The item will be marked as claimed and all other claims for this item will be rejected.'
            : 'Are you sure you want to reject this claim? The user will not be able to claim this item.'
        }
        confirmText={confirmState?.action === 'approved' ? 'Approve Claim' : 'Reject Claim'}
        isDestructive={confirmState?.action === 'rejected'}
      />
    </div>
  )
}
