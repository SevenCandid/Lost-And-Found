import { useState, useEffect } from 'react'
import { Users, PackageSearch, CheckCircle, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { startOfDay, format, subDays } from 'date-fns'

export function OverviewTab() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeItems: 0,
    resolvedItems: 0,
    pendingApprovals: 0,
  })
  const [timelineData, setTimelineData] = useState<{ date: string; lost: number; found: number }[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9']

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

      // Fetch items for charts (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
      const { data: recentItems } = await supabase
        .from('items')
        .select('created_at, type, category')
        .gte('created_at', thirtyDaysAgo)

      if (recentItems) {
        // Process Timeline Data (Last 7 days for better visibility)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = subDays(new Date(), 6 - i)
          return {
            date: format(d, 'MMM dd'),
            fullDate: format(d, 'yyyy-MM-dd'),
            lost: 0,
            found: 0
          }
        })

        recentItems.forEach(item => {
          const itemDate = format(new Date(item.created_at), 'yyyy-MM-dd')
          const dayData = last7Days.find(d => d.fullDate === itemDate)
          if (dayData) {
            if (item.type === 'lost') dayData.lost++
            if (item.type === 'found') dayData.found++
          }
        })
        setTimelineData(last7Days)

        // Process Category Data
        const catMap = new Map<string, number>()
        recentItems.forEach(item => {
          catMap.set(item.category, (catMap.get(item.category) || 0) + 1)
        })
        const catArray = Array.from(catMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5) // Top 5 categories
        
        setCategoryData(catArray)
      }

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
    <div className="flex flex-col gap-6">
      {/* Charts Section (Moved to top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 transition-colors">Reports Over Last 7 Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="lost" name="Lost Items" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="found" name="Found Items" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 transition-colors">Top Categories</h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards (Compact, bottom) */}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {/* Pending Approvals Metric */}
        <div className="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-colors">
            <ShieldAlert size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white transition-colors">{stats.pendingApprovals}</h3>
          <p className="text-[9px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 md:mt-1 transition-colors">Pending</p>
        </div>

        {/* Users Metric */}
        <div className="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-colors">
            <Users size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white transition-colors">{stats.totalUsers}</h3>
          <p className="text-[9px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 md:mt-1 transition-colors">Users</p>
        </div>

        {/* Active Items Metric */}
        <div className="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-sky-50 dark:bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-colors">
            <PackageSearch size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white transition-colors">{stats.activeItems}</h3>
          <p className="text-[9px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 md:mt-1 transition-colors">Active</p>
        </div>

        {/* Resolved Items Metric */}
        <div className="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 transition-colors">
            <CheckCircle size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white transition-colors">{stats.resolvedItems}</h3>
          <p className="text-[9px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5 md:mt-1 transition-colors">Resolved</p>
        </div>
      </div>

    </div>
  )
}
