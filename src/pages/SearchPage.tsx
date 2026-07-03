import { useState, useEffect } from 'react'
import { PoweredBy } from '../components/ui/PoweredBy'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/ui/Input'
import { PillFilter } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import { ItemCard } from '../components/ItemCard'
import { CATEGORY_GROUPS } from '../lib/categories'
import { SkeletonCard } from '../components/ui/Skeleton'
import type { Database } from '../types/supabase'

type Item = Database['public']['Tables']['items']['Row']

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [dateFilter, setDateFilter] = useState<'any' | 'today' | 'week' | 'month'>('any')
  const [showFilters, setShowFilters] = useState(false)
  
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Use top-level groups for quick category filters
  const categories = ['All', ...Object.keys(CATEGORY_GROUPS)]

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true)

      let dbQuery = supabase
        .from('items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (debouncedQuery) {
        dbQuery = dbQuery.or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%,location.ilike.%${debouncedQuery}%`)
      }

      if (typeFilter !== 'all') {
        dbQuery = dbQuery.eq('type', typeFilter)
      }

      if (selectedCategory !== 'All') {
        const specificCategories = CATEGORY_GROUPS[selectedCategory as keyof typeof CATEGORY_GROUPS]
        if (specificCategories) {
          dbQuery = dbQuery.in('category', specificCategories)
        }
      }

      if (dateFilter !== 'any') {
        const now = new Date()
        let cutoff = new Date()
        if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0)
        else if (dateFilter === 'week') cutoff.setDate(now.getDate() - 7)
        else if (dateFilter === 'month') cutoff.setMonth(now.getMonth() - 1)
        dbQuery = dbQuery.gte('date_occurred', cutoff.toISOString())
      }

      const { data, error } = await dbQuery.limit(40)
      if (!error && data) setResults(data)
      else setResults([])
      setIsLoading(false)
    }

    performSearch()
  }, [debouncedQuery, selectedCategory, typeFilter, dateFilter])

  return (
    <div className="flex flex-col min-h-screen bg-surface pt-safe pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-slate-100 space-y-3">
        {/* Search input row */}
        <div className="flex items-center gap-2">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, locations..."
            autoFocus
          />
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`shrink-0 p-2.5 rounded-xl border transition-all ${
              showFilters || selectedCategory !== 'All' || dateFilter !== 'any' || typeFilter !== 'all'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Type pills always visible */}
        <div className="flex gap-2">
          {(['all', 'lost', 'found'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                typeFilter === t
                  ? t === 'lost' ? 'bg-red-500 text-white border-red-500'
                    : t === 'found' ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
            </button>
          ))}
        </div>

        {/* Expandable filters panel */}
        {showFilters && (
          <div className="space-y-3 pt-1">
            {/* Categories */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['All', ...Object.keys(CATEGORY_GROUPS)].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date</p>
              <div className="flex gap-2">
                {(['any', 'today', 'week', 'month'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`flex-1 py-1 rounded-full text-xs font-semibold border transition-all ${
                      dateFilter === d
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {d === 'any' ? 'Any' : d === 'today' ? 'Today' : d === 'week' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedCategory !== 'All' || dateFilter !== 'any') && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategory !== 'All' && (
                  <div className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')}><X size={11} /></button>
                  </div>
                )}
                {dateFilter !== 'any' && (
                  <div className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Past Week' : 'Past Month'}
                    <button onClick={() => setDateFilter('any')}><X size={11} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pt-4">
        {/* Result count header */}
        {!isLoading && (
          <p className="text-xs font-medium text-slate-400 mb-3 px-1">
            {results.length > 0
              ? `${results.length} item${results.length !== 1 ? 's' : ''} found`
              : query ? 'No results for "' + query + '"' : 'No items yet'}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/item/${item.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">{query ? '😕' : '🔍'}</div>
            <p className="font-semibold text-slate-700">{query ? 'No results found' : 'Start searching'}</p>
            <p className="text-sm text-slate-400 mt-1">
              {query ? 'Try different keywords or clear filters' : 'Type something or use the filter button'}
            </p>
          </div>
        )}
      </div>

      <PoweredBy />
    </div>
  )
}
