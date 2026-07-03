import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronLeft, Check, PackageSearch, MessageCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Database } from '../lib/database.types'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'

type Notification = Database['public']['Tables']['notifications']['Row']

export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel(`public:notifications_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNotifications(data || [])
    } catch (err: any) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string, link: string | null) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      
      if (link) {
        navigate(link)
      }
    } catch (err) {
      // Silently fail read status update if network error
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch (err) {
      toast.error('Failed to update notifications')
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'match_found': return <PackageSearch className="text-primary-500" size={20} />
      case 'new_message': return <MessageCircle className="text-sky-500" size={20} />
      default: return <AlertCircle className="text-slate-500" size={20} />
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full" title="Go back">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="p-2 text-primary-600 hover:bg-primary-50 rounded-full" title="Mark all as read">
            <Check size={20} />
          </button>
        )}
      </header>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up! We'll alert you when there's an update." />
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                onClick={() => markAsRead(notification.id, notification.link)}
                className={`p-4 rounded-3xl border flex gap-4 cursor-pointer transition-all active:scale-[0.98] ${
                  notification.is_read 
                    ? 'bg-white border-slate-100 opacity-70' 
                    : 'bg-primary-50/30 border-primary-100 shadow-sm'
                }`}
              >
                <div className="mt-1 shrink-0">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`text-sm font-bold truncate ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(notification.created_at))}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
