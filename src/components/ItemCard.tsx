import { MapPin, Clock } from 'lucide-react'
import { cn } from '../lib/utils'
import { Database } from '../types/supabase'

type Item = Database['public']['Tables']['items']['Row']

interface ItemCardProps {
  item: Item
  className?: string
  onClick?: () => void
}

// Category emoji map for visual flair
const CATEGORY_ICONS: Record<string, string> = {
  'Phones': '📱', 'Laptops': '💻', 'Tablets': '📟', 'Chargers': '🔌',
  'Power Banks': '🔋', 'Earbuds': '🎧', 'Headphones': '🎧', 'USB Drives': '💾',
  'Hard Drives': '💽', 'Scientific Calculators': '🖩', 'Graphing Calculators': '🖩',
  'Books': '📚', 'Lecture Notes': '📝', 'Assignments': '📄', 'Project Reports': '📋',
  'Lab Manuals': '🔬', 'Drawing Boards': '📐', 'Student IDs': '🪪',
  'National IDs': '🪪', 'Driver Licenses': '🪪', 'ATM Cards': '💳',
  'Wallets': '👛', 'Bags': '🎒', 'Backpacks': '🎒', 'Clothing': '👕',
  'Shoes': '👟', 'Glasses': '👓', 'Sunglasses': '🕶️', 'Jewelry': '💍',
  'Watches': '⌚', 'Keys': '🔑', 'Umbrellas': '☂️', 'Water Bottles': '🫙',
  'Default': '📦'
}

export function ItemCard({ item, className, onClick }: ItemCardProps) {
  const isLost = item.type === 'lost'
  const icon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS['Default']

  // Relative time (e.g. "2h ago", "3d ago")
  const now = Date.now()
  const created = new Date(item.created_at).getTime()
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)
  const timeAgo = diffDays > 0 ? `${diffDays}d ago` : diffHrs > 0 ? `${diffHrs}h ago` : `${diffMins}m ago`

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100',
        'active:scale-[0.97] cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-100',
        className
      )}
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-4xl mb-1">{icon}</span>
            <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
          </div>
        )}

        {/* Lost / Found badge - top left */}
        <span className={cn(
          "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow",
          isLost ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        )}>
          {isLost ? 'Lost' : 'Found'}
        </span>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="font-semibold text-slate-800 text-sm leading-tight truncate mb-1">
          {item.title}
        </p>

        <div className="flex items-center gap-1 text-slate-400 mb-1.5">
          <MapPin size={10} className="shrink-0" />
          <span className="text-[10px] truncate">{item.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-1.5 py-0.5 rounded-full truncate max-w-[70%]">
            {item.category}
          </span>
          <div className="flex items-center gap-0.5 text-slate-400">
            <Clock size={9} />
            <span className="text-[9px]">{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
