import { useState, useEffect } from 'react'
import { Search, Trash2, CheckCircle, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Database } from '../../lib/database.types'
import { EmptyState } from '../ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'

type Item = Database['public']['Tables']['items']['Row']

export function ItemsTab() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      toast.error('Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      toast.success('Item deleted successfully')
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch (err: any) {
      toast.error('Failed to delete item')
    }
  }

  const handleResolve = async (itemId: string) => {
    const confirm = window.confirm('Manually mark this item as resolved? It will be hidden from the active feed.')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'resolved' })
        .eq('id', itemId)

      if (error) throw error

      toast.success('Item marked as resolved')
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'resolved' } : i))
    } catch (err: any) {
      toast.error('Failed to resolve item')
    }
  }

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || i.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('lost')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'lost' ? 'bg-danger-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'}`}
          >
            Lost
          </button>
          <button 
            onClick={() => setFilter('found')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'found' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-100'}`}
          >
            Found
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Loading items...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState title="No items found" description="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={20} className="text-slate-400" />
                  </div>
                )}
                
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.location} • {formatDistanceToNow(new Date(item.created_at))} ago</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.type === 'lost' ? 'bg-danger-50 text-danger-600' : 'bg-primary-50 text-primary-600'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.status === 'active' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                {item.status === 'active' && (
                  <button 
                    onClick={() => handleResolve(item.id)}
                    className="w-8 h-8 rounded-full bg-slate-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-50 transition-all"
                    title="Mark as Resolved"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-full bg-slate-50 text-danger-500 flex items-center justify-center hover:bg-danger-50 transition-all"
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
