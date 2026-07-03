import { useState, useEffect } from 'react'
import { Users, PackageSearch, CheckCircle, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function OverviewTab() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeItems: 0,
    resolvedItems: 0,
    pendingApprovals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch user counts
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: pendingApprovals } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending')
      
      // Fetch item counts
      const { count: activeItems } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { count: resolvedItems } = await supabase.from('items').select('*', { count: 'exact', head: true }).in('status', ['claimed', 'resolved'])

      setStats({
        totalUsers: totalUsers || 0,
        activeItems: activeItems || 0,
        resolvedItems: resolvedItems || 0,
        pendingApprovals: pendingApprovals || 0,
      })
    } catch (err) {
      toast.error('Failed to load overview statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500">Loading overview...</div>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Pending Approvals Metric */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center col-span-2">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-3xl font-bold text-slate-800">{stats.pendingApprovals}</h3>
        <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
      </div>

      {/* Users Metric */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3">
          <Users size={24} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3>
        <p className="text-xs font-medium text-slate-500">Total Users</p>
      </div>

      {/* Active Items Metric */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-3">
          <PackageSearch size={24} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">{stats.activeItems}</h3>
        <p className="text-xs font-medium text-slate-500">Active Reports</p>
      </div>

      {/* Resolved Items Metric */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center col-span-2">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
          <CheckCircle size={24} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">{stats.resolvedItems}</h3>
        <p className="text-xs font-medium text-slate-500">Resolved & Claimed Items</p>
      </div>
    </div>
  )
}
