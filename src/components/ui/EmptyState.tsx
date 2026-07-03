import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center min-h-[300px]', className)}>
      {icon && (
        <div className="mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mb-6 text-sm text-slate-500 max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
