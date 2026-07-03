import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

type Match = Database['public']['Tables']['matches']['Row'] & {
  matched_item: Database['public']['Tables']['items']['Row']
}

interface Props {
  itemId: string
  itemType: 'lost' | 'found'
}

export function MatchSuggestions({ itemId, itemType }: Props) {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [itemId])

  const fetchMatches = async () => {
    try {
      // Find matches where our item is either the lost_item_id or found_item_id
      const matchCol = itemType === 'lost' ? 'lost_item_id' : 'found_item_id'
      const joinCol = itemType === 'lost' ? 'found_item_id' : 'lost_item_id'
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          matched_item:items!${joinCol}(*)
        `)
        .eq(matchCol, itemId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setMatches(data as unknown as Match[] || [])
    } catch (err) {
      console.error('Failed to fetch matches', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || matches.length === 0) return null

  return (
    <div className="bg-primary-50 rounded-3xl p-5 border border-primary-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary-600" size={20} />
        <h3 className="font-bold text-primary-900 text-lg">Potential Matches</h3>
        <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
          {matches.length} FOUND
        </span>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 no-scrollbar snap-x">
        {matches.map((match) => (
          <Link 
            key={match.id} 
            to={`/item/${match.matched_item.id}`}
            className="flex-shrink-0 w-64 bg-white p-3 rounded-2xl border border-primary-100 shadow-sm snap-start group hover:border-primary-300 transition-colors block"
          >
            <div className="flex gap-3 mb-2">
              {match.matched_item.image_url ? (
                <img 
                  src={match.matched_item.image_url} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={20} className="text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 text-sm truncate">{match.matched_item.title}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{match.matched_item.location}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <span className="text-[10px] font-medium text-slate-400">
                {formatDistanceToNow(new Date(match.matched_item.created_at))} ago
              </span>
              <span className="text-primary-600 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
