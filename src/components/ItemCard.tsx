import { MapPin, Calendar, Tag } from 'lucide-react'
import { cn } from '../lib/utils'
import { Database } from '../types/supabase'

type Item = Database['public']['Tables']['items']['Row']

interface ItemCardProps {
  item: Item
  className?: string
  onClick?: () => void
}

export function ItemCard({ item, className, onClick }: ItemCardProps) {
  const isLost = item.type === 'lost'
  
  // Format date nicely (e.g. "Oct 12")
  const dateObj = new Date(item.date_occurred)
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div 
      onClick={onClick}
      className={cn(
        'group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/50',
        'active:scale-[0.98] cursor-pointer',
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md",
            isLost 
              ? "bg-danger-500/90 text-white" 
              : "bg-success-500/90 text-white"
          )}>
            {isLost ? 'Lost' : 'Found'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-slate-800 text-lg mb-1 truncate">
          {item.title}
        </h3>
        
        <div className="flex flex-col gap-2 mt-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary-400" />
            <span className="truncate">{item.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary-400" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full text-xs font-medium text-slate-600">
              <Tag size={12} />
              {item.category}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
