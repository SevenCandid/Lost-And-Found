import { cn } from '../../lib/utils'
import { HOLDER_OPTIONS } from '../../lib/categories'
import type { Database } from '../../types/supabase'
import { CheckCircle2, Shield, Building2, MapPin, MapPinned } from 'lucide-react'

type Item = Database['public']['Tables']['items']['Row']

interface CustodyBadgeProps {
  item: Item
}

export function CustodyBadge({ item }: CustodyBadgeProps) {
  if (item.type !== 'found' || !item.holder_type) return null

  const opt = HOLDER_OPTIONS.find(o => o.value === item.holder_type)
  if (!opt) return null

  let Icon = CheckCircle2
  let bgColor = 'bg-slate-50'
  let borderColor = 'border-slate-100'
  let textColor = 'text-slate-800'
  let iconColor = 'text-slate-500'
  
  if (opt.color === 'blue') {
    Icon = CheckCircle2
    bgColor = 'bg-blue-50'
    borderColor = 'border-blue-100'
    textColor = 'text-blue-900'
    iconColor = 'text-blue-500'
  } else if (opt.color === 'amber') {
    Icon = Shield
    bgColor = 'bg-amber-50'
    borderColor = 'border-amber-100'
    textColor = 'text-amber-900'
    iconColor = 'text-amber-500'
  } else if (opt.color === 'purple') {
    Icon = Building2
    bgColor = 'bg-purple-50'
    borderColor = 'border-purple-100'
    textColor = 'text-purple-900'
    iconColor = 'text-purple-500'
  } else {
    Icon = MapPin
    bgColor = 'bg-slate-50'
    borderColor = 'border-slate-100'
    textColor = 'text-slate-800'
    iconColor = 'text-slate-500'
  }

  const isReturned = ['returned', 'closed'].includes(item.status)

  return (
    <div className={cn('w-full rounded-2xl border p-4 shadow-sm mb-6', bgColor, borderColor)}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', iconColor)}>
          {isReturned ? <CheckCircle2 size={24} className="text-success-500" /> : <Icon size={24} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Current Custody
          </h3>
          <p className={cn('font-bold text-base leading-tight', textColor)}>
            {isReturned ? 'Returned to Owner' : opt.label}
          </p>
          
          {item.holder_type === 'other' && item.holder_location && !isReturned && (
            <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPinned size={14} className="shrink-0" />
              {item.holder_location}
            </p>
          )}
          
          {item.holder_notes && !isReturned && (
            <p className="text-xs text-slate-500 mt-2 bg-white/50 p-2 rounded-lg italic">
              "{item.holder_notes}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
