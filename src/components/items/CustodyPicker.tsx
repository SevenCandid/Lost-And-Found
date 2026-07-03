import { cn } from '../../lib/utils'
import { HIGH_VALUE_CATEGORIES, HOLDER_OPTIONS } from '../../lib/categories'
import type { HolderType } from '../../types/supabase'
import { AlertTriangle, MapPin } from 'lucide-react'

interface CustodyData {
  holderType: HolderType | null
  holderLocation: string
  holderNotes: string
  trustAgreement: boolean
}

interface CustodyPickerProps {
  value: CustodyData
  category: string
  onChange: (data: CustodyData) => void
}

const colorMap: Record<string, { card: string; icon: string }> = {
  blue:   { card: 'border-blue-200 bg-blue-50',   icon: 'bg-blue-100 text-blue-600' },
  amber:  { card: 'border-amber-200 bg-amber-50',  icon: 'bg-amber-100 text-amber-600' },
  purple: { card: 'border-purple-200 bg-purple-50', icon: 'bg-purple-100 text-purple-600' },
  slate:  { card: 'border-slate-200 bg-slate-50',  icon: 'bg-slate-100 text-slate-500' },
}

export function CustodyPicker({ value, category, onChange }: CustodyPickerProps) {
  const isHighValue = HIGH_VALUE_CATEGORIES.has(category as any)

  const set = (patch: Partial<CustodyData>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-0.5">Where is the item now?</h2>
        <p className="text-xs text-slate-500">
          Transparency helps the owner know where to collect their item.
        </p>
      </div>

      {/* High-value warning */}
      {isHighValue && value.holderType === 'finder' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            This appears to be a high-value item. We recommend handing it to the{' '}
            <strong>UENR Security Office</strong> for safekeeping. This is only a recommendation.
          </p>
        </div>
      )}

      {/* Option cards */}
      <div className="grid grid-cols-1 gap-3">
        {HOLDER_OPTIONS.map(opt => {
          const isSelected = value.holderType === opt.value
          const colors = colorMap[opt.color]
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ holderType: opt.value, trustAgreement: false })}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]',
                isSelected
                  ? colors.card + ' border-2'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0',
                isSelected ? colors.icon : 'bg-slate-100'
              )}>
                {opt.icon}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'font-bold text-sm',
                  isSelected ? 'text-slate-900' : 'text-slate-700'
                )}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  {opt.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* "Other" extra fields */}
      {value.holderType === 'other' && (
        <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              <MapPin size={12} className="inline mr-1" />
              Location Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dean's Office, Main Gate"
              value={value.holderLocation}
              onChange={e => set({ holderLocation: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Additional Notes <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Contact person or instructions"
              value={value.holderNotes}
              onChange={e => set({ holderNotes: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Code of Trust */}
      {value.holderType === 'finder' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
          <p className="text-xs leading-relaxed text-blue-800">
            <strong>Code of Trust:</strong> As the finder of this item, I agree to keep it safe,
            not use it, and return it only to its rightful owner or an authorized university office
            after ownership has been verified.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value.trustAgreement}
              onChange={e => set({ trustAgreement: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
            />
            <span className="text-xs font-semibold text-blue-900">
              I agree to the Code of Trust
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
