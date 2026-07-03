import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Search, MessageCircle, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function BottomNavigation() {
  const { user } = useAuth()
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

    // Subscribe to new notifications
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchUnread()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleProfileTap = (e: React.MouseEvent) => {
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
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe">
      <div className="flex items-center justify-around px-4 h-16 max-w-md mx-auto relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={item.label === 'Profile' ? handleProfileTap : undefined}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-200',
                isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(isActive && "drop-shadow-sm")}
                  />
                  {item.label === 'Messages' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "opacity-100" : "opacity-80"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
