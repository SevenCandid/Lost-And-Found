import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PackageSearch, LogIn, User as UserIcon, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function TopHeader() {
  const navigate = useNavigate()
  const { profile, isLoading: loading } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    
    async function fetchUnreadCount() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile!.id)
        .eq('is_read', false)
      
      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    const subscription = supabase
      .channel(`public:notifications:topheader_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`
      }, () => {
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile])

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 h-14 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform">
          <PackageSearch size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-white transition-colors">
          Lost & Found
        </span>
      </Link>

      {!loading && (
        profile ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all"
            >
              {profile.id_photo_url ? (
                <img src={profile.id_photo_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} className="text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors"
          >
            <LogIn size={14} />
            Log in
          </Link>
        )
      )}
    </header>
  )
}
