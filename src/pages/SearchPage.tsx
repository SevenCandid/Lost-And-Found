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
  const [dateFilter, setDateFilter] = useState<'any' | 'today' | 'week' | 'month'>('any')
  
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Use top-level groups for quick category filters
  const categories = ['All', ...Object.keys(CATEGORY_GROUPS)]

  useEffect(() => {
    async function performSearch() {
      // Don't search if everything is empty/default
      if (!debouncedQuery && selectedCategory === 'All' && dateFilter === 'any') {
        setResults([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      let dbQuery = supabase
        .from('items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (debouncedQuery) {
        // Full-text search across title, description, and location
        dbQuery = dbQuery.textSearch('fts', debouncedQuery.split(' ').join(' & '), {
          type: 'websearch',
          config: 'english'
        })
      }

      // If a group is selected, we need to match any specific category within that group
      if (selectedCategory !== 'All') {
        const specificCategories = CATEGORY_GROUPS[selectedCategory as keyof typeof CATEGORY_GROUPS]
        if (specificCategories) {
          dbQuery = dbQuery.in('category', specificCategories)
        }
      }

      // Date Filtering
      if (dateFilter !== 'any') {
        const now = new Date()
        let cutoff = new Date()
        
        if (dateFilter === 'today') {
          cutoff.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'week') {
          cutoff.setDate(now.getDate() - 7)
        } else if (dateFilter === 'month') {
          cutoff.setMonth(now.getMonth() - 1)
        }
        
        dbQuery = dbQuery.gte('date_occurred', cutoff.toISOString())
      }

      const { data, error } = await dbQuery.limit(20)

      if (!error && data) {
        setResults(data)
      } else {
        // Fallback to empty if error
        setResults([])
      }
      setIsLoading(false)
    }

    performSearch()
  }, [debouncedQuery, selectedCategory, dateFilter])

  return (
    <div className="flex flex-col min-h-screen bg-surface pt-safe pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-4 pt-4 pb-2 border-b border-slate-100">
        <SearchBar 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items, locations..."
          autoFocus
        />
        
        {/* Active Filters Summary */}
        {(selectedCategory !== 'All' || dateFilter !== 'any') && (
          <div className="flex items-center gap-2 mt-3 pb-1 overflow-x-auto no-scrollbar">
            {selectedCategory !== 'All' && (
              <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="p-0.5 hover:bg-primary-100 rounded-full">
                  <X size={12} />
                </button>
              </div>
            )}
            {dateFilter !== 'any' && (
              <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Past Week' : 'Past Month'}
                <button onClick={() => setDateFilter('any')} className="p-0.5 hover:bg-primary-100 rounded-full">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pt-4">
        {/* Pre-search states (Filters & Suggestions) */}
        {!hasSearched && !isLoading && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={16} /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <PillFilter 
                    key={cat} 
                    active={selectedCategory === cat} 
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </PillFilter>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                When
              </h3>
              <div className="flex flex-wrap gap-2">
                <PillFilter active={dateFilter === 'any'} onClick={() => setDateFilter('any')}>Any Date</PillFilter>
                <PillFilter active={dateFilter === 'today'} onClick={() => setDateFilter('today')}>Today</PillFilter>
                <PillFilter active={dateFilter === 'week'} onClick={() => setDateFilter('week')}>Past Week</PillFilter>
                <PillFilter active={dateFilter === 'month'} onClick={() => setDateFilter('month')}>Past Month</PillFilter>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!isLoading && hasSearched && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500 mb-2">Found {results.length} results</p>
            {results.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onClick={() => navigate(`/item/${item.id}`)} 
              />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <EmptyState 
            icon={<Search size={24} />}
            title="No results found"
            description="Try using different keywords or adjusting your filters."
          />
        )}
      </div>
      <PoweredBy />
    </div>
  )
}
