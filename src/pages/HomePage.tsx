import { useEffect, useState } from 'react'
import { CATEGORY_GROUPS } from '../lib/categories'
import { PoweredBy } from '../components/ui/PoweredBy'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { PillFilter } from '../components/ui/Badge'
import { ItemCard } from '../components/ItemCard'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import { useAuth } from '../contexts/AuthContext'

type Item = Database['public']['Tables']['items']['Row']

export function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true)
      let query = supabase
        .from('items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      if (categoryFilter !== 'All') {
        const specificCategories = CATEGORY_GROUPS[categoryFilter as keyof typeof CATEGORY_GROUPS]
        if (specificCategories && specificCategories.length > 0) {
          query = query.in('category', specificCategories)
        }
      }

      const { data, error } = await query
      if (!error && data) {
        setItems(data)
      }
      setIsLoading(false)
    }

    fetchItems()
  }, [filter, categoryFilter])

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
      .channel(`public:notifications:homepage_${Math.random().toString(36).substring(7)}`)
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

  const firstName = profile?.full_name?.split(' ')[0] || 'Guest'

  return (
    <div className="flex flex-col min-h-screen bg-surface relative pb-20">
      {/* Greeting */}
      <header className="bg-white dark:bg-slate-900 px-5 pt-4 pb-3 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back,</p>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {firstName} <span className="text-xl">👋</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full active:scale-95 transition-transform"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white"></span>
            )}
          </button>
      </header>

      {/* Filter Bar: type pills + category dropdown on one line */}
      <div className="px-4 py-3 flex items-center gap-1.5 w-full">
        <div className="flex gap-1.5 flex-1 min-w-0">
          <PillFilter active={filter === 'all'} onClick={() => setFilter('all')}>All</PillFilter>
          <PillFilter active={filter === 'lost'} onClick={() => setFilter('lost')}>Lost</PillFilter>
          <PillFilter active={filter === 'found'} onClick={() => setFilter('found')}>Found</PillFilter>
        </div>

        <div className="relative shrink-0">
          <select
            title="Filter by category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`appearance-none w-[85px] pl-2.5 pr-6 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer focus:outline-none truncate ${
              categoryFilter !== 'All'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <option value="All">Category</option>
            {Object.keys(CATEGORY_GROUPS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className={`pointer-events-none absolute inset-y-0 right-2 flex items-center ${
            categoryFilter !== 'All' ? 'text-white' : 'text-slate-400'
          }`}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 pt-2 pb-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-3 px-1">
          {categoryFilter === 'All' ? 'Latest Items' : categoryFilter}
          {!isLoading && items.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-400">{items.length} results</span>
          )}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-100 dark:bg-slate-700" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full w-1/2" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/item/${item.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-4xl">
              🔍
            </div>
            <p className="font-semibold text-slate-700">No items found</p>
            <p className="text-sm mt-1 text-slate-400">Be the first to report something!</p>
          </div>
        )}
      </div>

      <PoweredBy />
    </div>
  )
}
