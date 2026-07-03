import { useState, useEffect } from 'react'
import { User, Search, ShieldOff, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Database } from '../../lib/database.types'
import { EmptyState } from '../ui/EmptyState'

type Profile = Database['public']['Tables']['users']['Row']

export function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'superadmin') // Don't allow messing with superadmins
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVerification = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified'
    
    if (newStatus === 'pending') {
      const confirm = window.confirm('Are you sure you want to revoke verification for this user? They will not be able to report or claim items until verified again.')
      if (!confirm) return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ verification_status: newStatus })
        .eq('id', userId)

      if (error) throw error

      toast.success(`User verification ${newStatus === 'verified' ? 'approved' : 'revoked'}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verification_status: newStatus } : u))
    } catch (err: any) {
      toast.error('Failed to update user status')
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.index_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or index number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{user.full_name}</h3>
                <p className="text-xs text-slate-500 truncate">{user.index_number} • {user.department}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    user.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                    user.verification_status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {user.verification_status}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-50 text-purple-600">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => toggleVerification(user.id, user.verification_status)}
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
                user.verification_status === 'verified' 
                  ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500' 
                  : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
              }`}
              title={user.verification_status === 'verified' ? "Revoke Verification" : "Verify User"}
            >
              {user.verification_status === 'verified' ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
            </button>
          </div>
        ))
      )}
    </div>
  )
}
