import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Search, MessageCircle, User, Settings, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function DesktopSidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('type', 'new_message')
      
      setUnreadMessages(count || 0)
    }

    fetchUnread()

    const channelName = `desktop_unread_${user.id}_${Math.random().toString(36).substring(7)}`
    const channel = supabase.channel(channelName)

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const requireAuth = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      navigate('/login')
    }
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/report', icon: PlusCircle, label: 'Report' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile', auth: true },
    { to: '/settings', icon: Settings, label: 'Settings', auth: true },
  ]

  return (
    <div className="w-full h-full flex flex-col pt-8 pb-6 px-4">
      {/* Logo */}
      <div className="px-4 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Search size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Lost & Found
        </h1>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={item.auth ? requireAuth : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group',
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(isActive && "drop-shadow-sm transition-transform duration-200 group-hover:scale-110", !isActive && "transition-transform duration-200 group-hover:scale-110")}
                  />
                  {item.label === 'Messages' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                <span className="text-base">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      {user ? (
        <button 
          onClick={() => signOut()} 
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors font-medium mt-auto w-full text-left"
        >
          <LogOut size={24} />
          <span>Log out</span>
        </button>
      ) : (
        <button 
          onClick={() => navigate('/login')} 
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-primary-500/20 transition-colors mt-auto"
        >
          Sign In
        </button>
      )}
    </div>
  )
}
